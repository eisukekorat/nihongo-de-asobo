/**
 * にほんごであそぼ — Google Cloud TTS Proxy (Cloudflare Worker)
 *
 * 環境変数（Cloudflare Dashboard > Workers > Settings > Variables で設定）:
 *   GOOGLE_TTS_API_KEY : Google Cloud TTS の APIキー
 *   ALLOWED_ORIGIN     : 許可するオリジン（例: https://yourdomain.com）
 *                        未設定の場合は * で全許可
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

    // オリジンチェック（ALLOWED_ORIGIN が設定されている場合）
    if (allowedOrigin !== '*' && origin !== allowedOrigin) {
      return new Response('Forbidden', { status: 403 });
    }

    // プリフライトリクエスト
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

    // APIキー確認
    if (!env.GOOGLE_TTS_API_KEY) {
      return new Response('TTS API key not configured', {
        status: 500,
        headers: CORS_HEADERS(allowedOrigin),
      });
    }

    // リクエストボディのパース
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response('Invalid JSON', {
        status: 400,
        headers: CORS_HEADERS(allowedOrigin),
      });
    }

    const { text, speed = 0.85 } = body;

    // バリデーション
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return new Response('Missing text', {
        status: 400,
        headers: CORS_HEADERS(allowedOrigin),
      });
    }
    if (text.length > 300) {
      return new Response('Text too long (max 300 chars)', {
        status: 400,
        headers: CORS_HEADERS(allowedOrigin),
      });
    }

    const speakingRate = Math.max(0.5, Math.min(Number(speed) || 0.85, 1.5));

    // Google Cloud TTS API 呼び出し
    let ttsResponse;
    try {
      ttsResponse = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${env.GOOGLE_TTS_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text: text.trim() },
            voice: {
              languageCode: 'ja-JP',
              // Neural2-B: 女性の自然な声（子供向けに明るくて聞き取りやすい）
              // 代替候補:
              //   'ja-JP-Neural2-C' (男性)
              //   'ja-JP-Wavenet-A' (女性・Wavenet)
              //   'ja-JP-Wavenet-B' (男性・Wavenet)
              name: 'ja-JP-Neural2-B',
            },
            audioConfig: {
              audioEncoding: 'MP3',
              speakingRate,
              pitch: 2.0,       // 少し高め（子供向け）
              volumeGainDb: 1.0, // 少し音量を上げる
              sampleRateHertz: 24000,
            },
          }),
        }
      );
    } catch (err) {
      return new Response('TTS upstream error', {
        status: 502,
        headers: CORS_HEADERS(allowedOrigin),
      });
    }

    if (!ttsResponse.ok) {
      const errText = await ttsResponse.text().catch(() => 'unknown');
      console.error('Google TTS error:', ttsResponse.status, errText);
      return new Response(`TTS API error: ${ttsResponse.status}`, {
        status: 502,
        headers: CORS_HEADERS(allowedOrigin),
      });
    }

    const data = await ttsResponse.json();
    if (!data.audioContent) {
      return new Response('No audio content returned', {
        status: 502,
        headers: CORS_HEADERS(allowedOrigin),
      });
    }

    // Base64 → バイナリ変換
    const audioBytes = Uint8Array.from(atob(data.audioContent), (c) => c.charCodeAt(0));

    return new Response(audioBytes, {
      status: 200,
      headers: {
        ...CORS_HEADERS(allowedOrigin),
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=604800, immutable', // 7日間キャッシュ
      },
    });
  },
};
