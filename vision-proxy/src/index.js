/**
 * にほんごであそぼ — Google Cloud Vision API Proxy (Cloudflare Worker)
 *
 * 環境変数（Cloudflare Dashboard > Workers > Settings > Variables で設定）:
 *   GOOGLE_VISION_API_KEY : Google Cloud Vision API キー
 *   ALLOWED_ORIGIN        : 許可するオリジン（未設定の場合は * で全許可）
 */

const CORS_HEADERS = (origin) => ({
  'Access-Control-Allow-Origin': origin || '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
});

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '*';
    const allowedOrigin = env.ALLOWED_ORIGIN || '*';

    if (allowedOrigin !== '*' && origin !== allowedOrigin) {
      return new Response('Forbidden', { status: 403 });
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS(allowedOrigin),
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: CORS_HEADERS(allowedOrigin),
      });
    }

    if (!env.GOOGLE_VISION_API_KEY) {
      return new Response('Vision API key not configured', {
        status: 500,
        headers: CORS_HEADERS(allowedOrigin),
      });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response('Invalid JSON', {
        status: 400,
        headers: CORS_HEADERS(allowedOrigin),
      });
    }

    const { image } = body;
    if (!image || typeof image !== 'string' || image.trim().length === 0) {
      return new Response('Missing image data', {
        status: 400,
        headers: CORS_HEADERS(allowedOrigin),
      });
    }

    let visionResponse;
    try {
      visionResponse = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${env.GOOGLE_VISION_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: [{
              image: { content: image },
              features: [
                { type: 'LABEL_DETECTION', maxResults: 10 },
                { type: 'OBJECT_LOCALIZATION', maxResults: 5 }
              ]
            }]
          })
        }
      );
    } catch (err) {
      return new Response('Vision upstream error', {
        status: 502,
        headers: CORS_HEADERS(allowedOrigin),
      });
    }

    if (!visionResponse.ok) {
      const errText = await visionResponse.text().catch(() => 'unknown');
      console.error('Google Vision error:', visionResponse.status, errText);
      return new Response(`Vision API error: ${visionResponse.status}`, {
        status: 502,
        headers: CORS_HEADERS(allowedOrigin),
      });
    }

    const result = await visionResponse.json();
    const labels = result.responses[0]?.labelAnnotations?.map(l => ({
      description: l.description.toLowerCase(),
      score: l.score
    })) || [];
    const objects = result.responses[0]?.localizedObjectAnnotations?.map(o => ({
      name: o.name.toLowerCase(),
      score: o.score
    })) || [];

    return new Response(JSON.stringify({ labels, objects }), {
      status: 200,
      headers: {
        ...CORS_HEADERS(allowedOrigin),
        'Content-Type': 'application/json',
      },
    });
  }
};
