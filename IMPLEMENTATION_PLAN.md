# にほんごであそぼ v9 実装計画書

> Sonnet向け：この計画書に沿って実装してください。
> 現在のアプリは `index.html` 1ファイル（1674行）のバニラJS SPAです。

---

## 前提：現在のアーキテクチャ

- **1ファイル構成**: `index.html` にHTML/CSS/JSすべて含む
- **音声**: Web Speech Synthesis API（`speechSynthesis`）、rate=0.72, pitch=1.25
- **録音**: MediaRecorder API → IndexedDB (`nihongo-voices`) に保存
- **ステッカー**: localStorage (`nihongo_stickers`)
- **データ**: 16カテゴリ（animals, food, numbers, shapes, greetings, phrases, body, feelings, vehicles, family, house, toys, clothes, weather, actions, hiragana）
- **モード**: カード、クイズ、ペア、かぞえ、じどう再生、2かい再生、あさルーティン、よるルーティン

---

## 機能1: Google Cloud TTS（自然な音声）

### 目的
現在の `speechSynthesis` API は端末依存で機械的。Google Cloud TTS の高品質音声を導入する。

### アーキテクチャ
**Cloudflare Worker をプロキシとして使う構成**にする。

```
[アプリ] → [Cloudflare Worker] → [Google Cloud TTS API]
              ↓
         音声データ(mp3)
              ↓
[アプリ: IndexedDB にキャッシュ]
```

### 実装手順

#### Step 1: Cloudflare Worker を作成
`tts-proxy/` ディレクトリを新規作成し、以下のファイルを作る。

**`tts-proxy/wrangler.toml`**:
```toml
name = "nihongo-tts-proxy"
main = "src/index.js"
compatibility_date = "2024-01-01"

[vars]
ALLOWED_ORIGIN = "https://あなたのドメイン"  # ← あとで設定

# Google API Key は Cloudflare Dashboard > Workers > Settings > Variables で設定
# GOOGLE_TTS_API_KEY = "secret" (環境変数として)
```

**`tts-proxy/src/index.js`**:
```javascript
export default {
  async fetch(request, env) {
    // CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const { text, speed } = await request.json();
    if (!text || text.length > 200) {
      return new Response('Invalid text', { status: 400 });
    }

    // Google Cloud TTS API 呼び出し
    const ttsResponse = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${env.GOOGLE_TTS_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: 'ja-JP',
            name: 'ja-JP-Neural2-B',  // 女性の自然な声（子供向けに明るい）
            // 代替: 'ja-JP-Neural2-C'(男性), 'ja-JP-Wavenet-A'(女性)
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: speed || 0.85,  // デフォルトややゆっくり
            pitch: 2.0,  // 少し高め（子供向け）
          },
        }),
      }
    );

    if (!ttsResponse.ok) {
      return new Response('TTS API error', { status: 502 });
    }

    const data = await ttsResponse.json();
    // audioContent は base64 エンコードされた音声
    const audioBytes = Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0));

    return new Response(audioBytes, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=604800',  // 1週間キャッシュ
      },
    });
  },
};
```

**`tts-proxy/package.json`**:
```json
{
  "name": "nihongo-tts-proxy",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy"
  },
  "devDependencies": {
    "wrangler": "^3.0.0"
  }
}
```

#### Step 2: アプリ側にTTSキャッシュシステムを追加

`index.html` の JavaScript に以下を追加・変更する。

**新しいTTSキャッシュDB** — 既存の `VoiceDB` とは別に、Google TTS キャッシュ用のストアを追加：

```javascript
// =========================================================
//  GOOGLE CLOUD TTS + CACHE
// =========================================================
const TTS_WORKER_URL = '';  // ← Cloudflare Worker デプロイ後に設定
// 例: 'https://nihongo-tts-proxy.your-subdomain.workers.dev'

const TTSCache = {
  db: null,
  open() {
    return new Promise((resolve) => {
      const req = indexedDB.open('nihongo-tts-cache', 1);
      req.onupgradeneeded = (e) => { e.target.result.createObjectStore('audio'); };
      req.onsuccess = (e) => { TTSCache.db = e.target.result; resolve(); };
      req.onerror = () => resolve();
    });
  },
  save(key, blob) {
    return new Promise((resolve) => {
      if (!TTSCache.db) return resolve();
      const tx = TTSCache.db.transaction('audio', 'readwrite');
      tx.objectStore('audio').put(blob, key);
      tx.oncomplete = resolve; tx.onerror = resolve;
    });
  },
  get(key) {
    return new Promise((resolve) => {
      if (!TTSCache.db) return resolve(null);
      const tx = TTSCache.db.transaction('audio', 'readonly');
      const req = tx.objectStore('audio').get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  }
};
```

**`speak()` 関数を改修** — Google TTS → キャッシュ → フォールバック（既存TTS）の3段階：

```javascript
// 新しい speak 関数（Google TTS 対応版）
async function speakGoogle(text, speed = 0.85) {
  const cacheKey = text + '_' + speed;

  // 1. キャッシュを確認
  const cached = await TTSCache.get(cacheKey);
  if (cached) {
    return playAudioBlob(cached);
  }

  // 2. Worker URL が未設定ならフォールバック
  if (!TTS_WORKER_URL) {
    speak(text);  // 既存の speechSynthesis にフォールバック
    return;
  }

  // 3. Google TTS API を呼び出し
  try {
    const res = await fetch(TTS_WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, speed }),
    });
    if (!res.ok) throw new Error('TTS API error');
    const blob = await res.blob();
    // キャッシュに保存
    await TTSCache.save(cacheKey, blob);
    return playAudioBlob(blob);
  } catch (e) {
    // API エラー時は既存TTS にフォールバック
    speak(text);
  }
}

function playAudioBlob(blob) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    const sw = document.getElementById('soundWave');
    sw.classList.add('active');
    audio.onended = () => { sw.classList.remove('active'); URL.revokeObjectURL(url); resolve(); };
    audio.onerror = () => { sw.classList.remove('active'); URL.revokeObjectURL(url); resolve(); };
    audio.play().catch(() => {
      sw.classList.remove('active');
      URL.revokeObjectURL(url);
      speak(blob._text || '');  // フォールバック
      resolve();
    });
  });
}
```

**既存の `speak()` はそのまま残す**（フォールバック用）。名前を `speakLocal()` にリネームして、新しい `speak()` が Google TTS を優先的に使うようにする：

```javascript
// 既存の speak → speakLocal にリネーム
function speakLocal(text, rate = 0.72, pitch = 1.25) {
  synth.cancel();
  setTimeout(() => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP'; u.rate = rate; u.pitch = pitch; u.volume = 1.0;
    if (selectedVoice) u.voice = selectedVoice;
    const sw = document.getElementById('soundWave');
    sw.classList.add('active');
    u.onend = () => sw.classList.remove('active');
    u.onerror = () => sw.classList.remove('active');
    synth.speak(u);
  }, 50);
}

// 新しい speak: Google TTS 対応（Worker URL 設定時のみ）
function speak(text, rate = 0.72, pitch = 1.25) {
  if (TTS_WORKER_URL) {
    // Google TTS の speed は rate を元にマッピング
    const speed = Math.max(0.5, Math.min(rate * 1.2, 1.5));
    speakGoogle(text, speed);
  } else {
    speakLocal(text, rate, pitch);
  }
}
```

**`speakWithCallback` も同様に改修する**。

#### Step 3: 初期化に TTSCache.open() を追加

```javascript
// INIT セクションに追加
TTSCache.open();
```

### 音声の優先順位（最終形）
1. **ユーザー録音**（IndexedDB `nihongo-voices`）があればそれを再生
2. **Google TTS キャッシュ**（IndexedDB `nihongo-tts-cache`）があればそれを再生
3. **Google TTS API**（Cloudflare Worker 経由）で取得 → キャッシュ → 再生
4. **Web Speech Synthesis**（ブラウザ内蔵TTS）にフォールバック

### デプロイ手順（ユーザーが手動で行う）
1. Google Cloud Console でプロジェクト作成 → Cloud Text-to-Speech API 有効化 → APIキー取得
2. `cd tts-proxy && npm install`
3. Cloudflare Dashboard でアカウント作成（無料）
4. `npx wrangler login`
5. Cloudflare Dashboard で環境変数 `GOOGLE_TTS_API_KEY` を設定
6. `npm run deploy`
7. デプロイされたURL を `index.html` の `TTS_WORKER_URL` に設定

---

## 機能2: PWA化（Service Worker + manifest）

### 目的
ホーム画面にアプリアイコンを置けるようにし、オフラインでも動作するようにする。

### 実装手順

#### Step 1: `manifest.json` を作成

```json
{
  "name": "にほんご あそぼう！",
  "short_name": "にほんご",
  "description": "日本語をたのしくまなぼう！",
  "start_url": "/index.html",
  "display": "standalone",
  "background_color": "#fff7ed",
  "theme_color": "#ff6b6b",
  "orientation": "portrait",
  "icons": [
    {
      "src": "icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### Step 2: アイコン画像を生成

`icons/` ディレクトリを作成し、以下の2つのPNGを作る。
- **簡易方法**: SVGをHTMLのcanvasで描画してPNGに変換するスクリプトを作成
- アイコンデザイン: 丸い背景（#ff6b6b）に「あ」の白文字、または🐻の絵文字

**`generate-icons.html`**（アイコン生成用の一時ファイル）:
```html
<!-- 開いてダウンロードボタンを押すとアイコンPNGが生成される -->
<canvas id="c192" width="192" height="192"></canvas>
<canvas id="c512" width="512" height="512"></canvas>
<script>
function drawIcon(canvas) {
  const ctx = canvas.getContext('2d');
  const s = canvas.width;
  // 丸い背景
  ctx.fillStyle = '#ff6b6b';
  ctx.beginPath();
  ctx.arc(s/2, s/2, s/2, 0, Math.PI*2);
  ctx.fill();
  // テキスト
  ctx.fillStyle = 'white';
  ctx.font = `bold ${s*0.55}px "M PLUS Rounded 1c", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('あ', s/2, s/2 + s*0.03);
}
drawIcon(document.getElementById('c192'));
drawIcon(document.getElementById('c512'));
// ダウンロード用
document.querySelectorAll('canvas').forEach(c => {
  const a = document.createElement('a');
  a.download = `icon-${c.width}.png`;
  a.href = c.toDataURL('image/png');
  a.textContent = `Download ${c.width}`;
  document.body.appendChild(a);
});
</script>
```

#### Step 3: `sw.js`（Service Worker）を作成

```javascript
const CACHE_NAME = 'nihongo-v9';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@700;800;900&display=swap',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // TTS API 呼び出しはキャッシュしない（アプリ側の IndexedDB で管理）
  if (e.request.url.includes('workers.dev') || e.request.url.includes('texttospeech')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request).then((response) => {
        // Google Fonts などの外部リソースもキャッシュ
        if (response.ok && (e.request.url.startsWith('https://fonts.') || e.request.url.startsWith(self.location.origin))) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return response;
      });
    }).catch(() => caches.match('/index.html'))
  );
});
```

#### Step 4: `index.html` に追加

`<head>` 内に:
```html
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#ff6b6b">
<link rel="apple-touch-icon" href="icons/icon-192.png">
```

`<script>` の最後（INIT セクション）に:
```javascript
// PWA Service Worker 登録
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
```

---

## 機能3: うた・手遊びモード

### 目的
2〜3歳児が歌で日本語のリズムと言葉を自然に覚えられるモードを追加。

### 実装手順

#### Step 1: データ構造

```javascript
const songs = [
  {
    id: 'kirakira',
    title: 'きらきらぼし',
    titleThai: 'ดาวน้อยระยิบ',
    emoji: '⭐',
    // 歌詞を行ごとに分割（ハイライト用）
    lyrics: [
      { jp: 'きらきら ひかる', thai: 'แวววาว ส่องแสง', duration: 3000 },
      { jp: 'おそらの ほしよ', thai: 'ดาวบนท้องฟ้า', duration: 3000 },
      { jp: 'まばたき しては', thai: 'กะพริบ กะพริบ', duration: 3000 },
      { jp: 'みんなを みてる', thai: 'มองดู ทุกคน', duration: 3000 },
      { jp: 'きらきら ひかる', thai: 'แวววาว ส่องแสง', duration: 3000 },
      { jp: 'おそらの ほしよ', thai: 'ดาวบนท้องฟ้า', duration: 3000 },
    ],
  },
  {
    id: 'musunde',
    title: 'むすんで ひらいて',
    titleThai: 'กำ แล้วแบ',
    emoji: '✊',
    lyrics: [
      { jp: 'むすんで ひらいて', thai: 'กำ แล้วแบ', duration: 3000 },
      { jp: 'てを うって むすんで', thai: 'ตบมือ แล้วกำ', duration: 3000 },
      { jp: 'また ひらいて', thai: 'แบ อีกครั้ง', duration: 2500 },
      { jp: 'てを うって', thai: 'ตบมือ', duration: 2000 },
      { jp: 'その てを うえに', thai: 'ยกมือ ขึ้นสูง', duration: 3000 },
    ],
  },
  {
    id: 'atama',
    title: 'あたま かた ひざ ポン',
    titleThai: 'หัว ไหล่ เข่า ป๊อก',
    emoji: '🙆',
    lyrics: [
      { jp: 'あたま かた ひざ ポン', thai: 'หัว ไหล่ เข่า ป๊อก', duration: 3000 },
      { jp: 'ひざ ポン', thai: 'เข่า ป๊อก', duration: 2000 },
      { jp: 'あたま かた ひざ ポン', thai: 'หัว ไหล่ เข่า ป๊อก', duration: 3000 },
      { jp: 'ひざ ポン', thai: 'เข่า ป๊อก', duration: 2000 },
      { jp: 'め、みみ、はな、くち', thai: 'ตา หู จมูก ปาก', duration: 3000 },
      { jp: 'あたま かた ひざ ポン', thai: 'หัว ไหล่ เข่า ป๊อก', duration: 3000 },
      { jp: 'ひざ ポン', thai: 'เข่า ป๊อก', duration: 2000 },
    ],
  },
  {
    id: 'obentoubako',
    title: 'おべんとうばこのうた',
    titleThai: 'เพลงกล่องข้าว',
    emoji: '🍱',
    lyrics: [
      { jp: 'これくらいの おべんとうばこに', thai: 'ในกล่องข้าว ขนาดนี้', duration: 3500 },
      { jp: 'おにぎり おにぎり ちょいと つめて', thai: 'ข้าวปั้น ข้าวปั้น ใส่เข้าไป', duration: 3500 },
      { jp: 'きざみしょうがに ごましおふって', thai: 'ขิงหั่น โรยงาเกลือ', duration: 3500 },
      { jp: 'にんじんさん さくらんぼさん', thai: 'แครอท เชอร์รี่', duration: 3000 },
      { jp: 'しいたけさん ごぼうさん', thai: 'เห็ดชิตาเกะ โกะโบ', duration: 3000 },
      { jp: 'あなのあいた れんこんさん', thai: 'รากบัว ที่มีรู', duration: 3000 },
      { jp: 'すじのとおった ふーき！', thai: 'ฟุกิ ที่เป็นเส้น!', duration: 3000 },
    ],
  },
  {
    id: 'kaeru',
    title: 'かえるのうた',
    titleThai: 'เพลงกบ',
    emoji: '🐸',
    lyrics: [
      { jp: 'かえるの うたが', thai: 'เพลงของ กบ', duration: 2500 },
      { jp: 'きこえて くるよ', thai: 'ได้ยิน มาแล้ว', duration: 2500 },
      { jp: 'ゲロ ゲロ ゲロ ゲロ', thai: 'เกโระ เกโระ เกโระ เกโระ', duration: 3000 },
      { jp: 'ゲロ ゲロ ゲロ', thai: 'เกโระ เกโระ เกโระ', duration: 2500 },
    ],
  },
  {
    id: 'chouchou',
    title: 'ちょうちょう',
    titleThai: 'ผีเสื้อ',
    emoji: '🦋',
    lyrics: [
      { jp: 'ちょうちょう ちょうちょう', thai: 'ผีเสื้อ ผีเสื้อ', duration: 3000 },
      { jp: 'なのはに とまれ', thai: 'เกาะที่ดอก นาโนะฮานะ', duration: 3000 },
      { jp: 'なのはに あいたら', thai: 'ถ้าเจอ ดอกนาโนะฮานะ', duration: 3000 },
      { jp: 'さくらに とまれ', thai: 'เกาะที่ดอก ซากุระ', duration: 3000 },
      { jp: 'さくらの はなの', thai: 'ดอกซากุระ', duration: 2500 },
      { jp: 'はなから はなへ', thai: 'จากดอก สู่ดอก', duration: 2500 },
      { jp: 'とまれよ あそべ', thai: 'เกาะสิ เล่นสิ', duration: 2500 },
      { jp: 'あそべよ とまれ', thai: 'เล่นสิ เกาะสิ', duration: 2500 },
    ],
  },
];
```

#### Step 2: UI

**モードボタンを追加** — `mode-toggle` に新ボタン:
```html
<button class="mode-btn" onclick="setMode('songs',this)">🎵 うた</button>
```

**うたセクション HTML**:
```html
<div class="songs-section" id="songsSection">
  <div class="songs-list" id="songsList"></div>
</div>

<!-- 歌再生オーバーレイ（autoplay-overlay と同じ構造を参考に） -->
<div class="song-overlay" id="songOverlay">
  <button class="song-close" onclick="stopSong()">✕</button>
  <div class="song-emoji" id="songEmoji">⭐</div>
  <div class="song-title" id="songTitle">きらきらぼし</div>
  <div class="song-lyric-jp" id="songLyricJp"></div>
  <div class="song-lyric-thai" id="songLyricThai"></div>
  <div class="song-progress" id="songProgress"></div>
</div>
```

**CSS** — 歌リスト（曲選択画面）:
```css
.songs-section { display:none; padding:0 14px 120px; position:relative; z-index:1; }
.songs-section.active { display:block; }
.songs-list { display:grid; grid-template-columns:repeat(auto-fill, minmax(min(160px, 44vw), 1fr)); gap:14px; max-width:600px; margin:0 auto; }
.song-card { background:white; border-radius:var(--card-radius); box-shadow:var(--shadow); padding:20px 12px; text-align:center; cursor:pointer; border:3.5px solid rgba(255,169,77,0.35); user-select:none; transition:all 0.2s cubic-bezier(0.34,1.56,0.64,1); }
.song-card:active { transform:scale(0.92); }
.song-card .song-card-emoji { font-size:3rem; display:block; margin-bottom:8px; }
.song-card .song-card-title { font-size:1rem; font-weight:900; color:var(--dark); }
.song-card .song-card-thai { font-size:0.6rem; color:#bbb; font-weight:700; margin-top:2px; }
```

**CSS** — 歌再生オーバーレイ:
```css
.song-overlay { position:fixed; top:0; left:0; right:0; bottom:0; background:linear-gradient(135deg, #e3f2fd 0%, #fff7ed 100%); z-index:200; display:none; flex-direction:column; align-items:center; justify-content:center; }
.song-overlay.active { display:flex; }
.song-close { position:absolute; top:20px; right:20px; width:52px; height:52px; border-radius:50%; background:white; border:3px solid #eee; font-size:1.5rem; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 0 rgba(0,0,0,0.08); }
.song-emoji { font-size:clamp(5rem, 22vw, 8rem); animation:float 3s ease-in-out infinite; }
.song-title { font-size:clamp(1.2rem, 4vw, 1.8rem); font-weight:900; color:var(--dark); margin:12px 0 24px; }
.song-lyric-jp { font-size:clamp(1.5rem, 6vw, 2.5rem); font-weight:900; color:var(--c4); text-align:center; min-height:3rem; transition:all 0.3s ease; animation:autoplay-text-in 0.4s ease both; }
.song-lyric-thai { font-size:clamp(0.8rem, 2.5vw, 1rem); color:#bbb; font-weight:700; margin-top:8px; min-height:1.5rem; }
.song-progress { position:absolute; bottom:0; left:0; height:6px; background:var(--c4); border-radius:3px; transition:width 0.3s linear; }
```

#### Step 3: JavaScript

```javascript
// =========================================================
//  SONGS MODE
// =========================================================
let songTimer = null;
let songLineIndex = 0;
let currentSong = null;

function renderSongsList() {
  const list = document.getElementById('songsList');
  list.innerHTML = '';
  songs.forEach(song => {
    const card = document.createElement('div');
    card.className = 'song-card';
    card.innerHTML = `
      <span class="song-card-emoji">${song.emoji}</span>
      <div class="song-card-title">${song.title}</div>
      <div class="song-card-thai">${song.titleThai}</div>
    `;
    card.addEventListener('click', () => playSong(song));
    list.appendChild(card);
  });
}

function playSong(song) {
  currentSong = song;
  songLineIndex = 0;
  document.getElementById('songOverlay').classList.add('active');
  document.getElementById('songEmoji').textContent = song.emoji;
  document.getElementById('songTitle').textContent = song.title;
  showSongLine();
}

function showSongLine() {
  if (songLineIndex >= currentSong.lyrics.length) {
    // 曲終了
    celebrate();
    earnSticker();
    earnSticker();
    setTimeout(() => stopSong(), 1500);
    return;
  }
  const line = currentSong.lyrics[songLineIndex];
  const jpEl = document.getElementById('songLyricJp');
  const thaiEl = document.getElementById('songLyricThai');

  // アニメーションリセット
  jpEl.style.animation = 'none'; void jpEl.offsetWidth;
  jpEl.style.animation = 'autoplay-text-in 0.4s ease both';

  jpEl.textContent = line.jp;
  thaiEl.textContent = line.thai;

  // 歌詞を読み上げ
  speak(line.jp, 0.8, 1.3);

  // プログレスバー
  const total = currentSong.lyrics.reduce((a, l) => a + l.duration, 0);
  const elapsed = currentSong.lyrics.slice(0, songLineIndex).reduce((a, l) => a + l.duration, 0);
  document.getElementById('songProgress').style.width = ((elapsed + line.duration) / total * 100) + '%';

  // 次の行へ
  songTimer = setTimeout(() => {
    songLineIndex++;
    showSongLine();
  }, line.duration);
}

function stopSong() {
  clearTimeout(songTimer);
  document.getElementById('songOverlay').classList.remove('active');
  synth.cancel();
  currentSong = null;
}
```

`setMode()` 関数に `songs` を追加:
```javascript
// setMode() 内に追加
document.getElementById('songsSection').classList.remove('active');
// ... 既存コード ...
} else if (mode === 'songs') {
  document.getElementById('songsSection').classList.add('active');
  renderSongsList();
}
```

---

## 機能4: ごほうびシステム強化（マスコット育成）

### 目的
マスコット🐻がステッカー数に応じて成長し、継続利用のモチベーションを高める。

### 実装手順

#### Step 1: マスコットレベル定義

```javascript
// =========================================================
//  MASCOT EVOLUTION
// =========================================================
const mascotLevels = [
  { min: 0,   emoji: '🐻',  name: 'くまちゃん',     nameThai: 'หมีน้อย',       accessory: '' },
  { min: 10,  emoji: '🐻',  name: 'くまちゃん',     nameThai: 'หมีน้อย',       accessory: '🎀',  desc: 'リボンをつけた！' },
  { min: 30,  emoji: '🐻',  name: 'くまくん',       nameThai: 'หมีจัง',        accessory: '🧢',  desc: 'ぼうしをかぶった！' },
  { min: 60,  emoji: '🐻',  name: 'くまさん',       nameThai: 'คุณหมี',        accessory: '👑',  desc: 'おうかんだ！' },
  { min: 100, emoji: '🐻',  name: 'くまおう',       nameThai: 'ราชาหมี',       accessory: '✨👑✨', desc: 'くまのおうさまだ！' },
  { min: 200, emoji: '🧸',  name: 'でんせつのくま', nameThai: 'หมีตำนาน',     accessory: '🌟👑🌟', desc: 'でんせつの くまだ！' },
];

function getMascotLevel() {
  const count = stickerData.count;
  let level = mascotLevels[0];
  for (const l of mascotLevels) {
    if (count >= l.min) level = l;
  }
  return level;
}

function updateMascot() {
  const level = getMascotLevel();
  const mascotEl = document.getElementById('mascot');
  // アクセサリー付きで表示
  if (level.accessory) {
    mascotEl.textContent = level.accessory + level.emoji;
  } else {
    mascotEl.textContent = level.emoji;
  }
  mascotEl.title = level.name;
}
```

#### Step 2: マスコットのレベルアップ演出

```javascript
function checkMascotLevelUp() {
  const prevCount = stickerData.count - 1;
  const prevLevel = mascotLevels.filter(l => prevCount >= l.min).pop();
  const newLevel = getMascotLevel();
  if (newLevel !== prevLevel && newLevel.desc) {
    // レベルアップ演出
    const sp = document.getElementById('mascotSpeech');
    sp.textContent = newLevel.desc;
    sp.classList.add('show');
    speak(newLevel.desc);
    clearTimeout(mascotTimeout);
    mascotTimeout = setTimeout(() => sp.classList.remove('show'), 3000);
    // 紙吹雪
    celebrate();
  }
  updateMascot();
}
```

#### Step 3: 既存関数を修正

`earnSticker()` の末尾に `checkMascotLevelUp()` を呼び出す:
```javascript
function earnSticker() {
  // ... 既存コード ...
  checkMascotLevelUp();  // ← 追加
}
```

`loadStickers()` の末尾に `updateMascot()` を呼び出す:
```javascript
function loadStickers() {
  // ... 既存コード ...
  updateMascot();  // ← 追加
}
```

#### Step 4: CSS（マスコットのアクセサリー表示用）

マスコットのフォントサイズ調整が必要な場合:
```css
.mascot { /* アクセサリー付きの場合にサイズ調整 */
  font-size: 2.2rem; /* 少し小さくしてアクセサリー分の余白を確保 */
  line-height: 1.2;
  text-align: center;
}
```

---

## 機能5: タイ語→日本語クイズモード

### 目的
タイ語環境の子供が、タイ語を手がかりに日本語を学べるモードを追加。

### 実装手順

#### Step 1: クイズモードにトグルを追加

`quiz-section` 内の `quiz-diff` の横に方向トグルを追加:

```html
<div class="quiz-direction" id="quizDirection">
  <button class="quiz-dir-btn active" id="quizDirJp" onclick="setQuizDirection('jp')">🇯🇵→❓</button>
  <button class="quiz-dir-btn" id="quizDirTh" onclick="setQuizDirection('thai')">🇹🇭→🇯🇵</button>
</div>
```

**CSS**:
```css
.quiz-direction { display:flex; justify-content:center; gap:8px; margin-bottom:10px; }
.quiz-dir-btn { padding:8px 16px; border-radius:50px; border:3px solid #e0e0e0; background:white; font-size:0.85rem; font-weight:800; cursor:pointer; color:#bbb; transition:all 0.2s; box-shadow:0 3px 0 rgba(0,0,0,0.08); }
.quiz-dir-btn.active { background:var(--c5); color:white; border-color:var(--c5); }
.quiz-dir-btn:active { transform:translateY(2px); box-shadow:0 1px 0 rgba(0,0,0,0.08); }
```

#### Step 2: JavaScript

```javascript
let quizDirection = 'jp';  // 'jp' = 通常（絵文字→日本語）, 'thai' = タイ語→日本語

function setQuizDirection(dir) {
  quizDirection = dir;
  document.getElementById('quizDirJp').classList.toggle('active', dir === 'jp');
  document.getElementById('quizDirTh').classList.toggle('active', dir === 'thai');
  startQuiz();
}
```

#### Step 3: `showQuizCard()` を改修

`showQuizCard()` 内のタイ語モードの分岐:

```javascript
function showQuizCard() {
  // ... 既存のcorrect/pool/choices ロジックはそのまま ...

  if (quizDirection === 'thai') {
    // タイ語モード: タイ語テキストを表示して日本語を当てさせる
    document.getElementById('quizEmoji').textContent = '🇹🇭';
    document.getElementById('quizEmoji').style.fontSize = 'clamp(3rem, 12vw, 5rem)';
    const ft = document.getElementById('quizFullText');
    ft.style.display = 'block';
    ft.textContent = correct.thai;  // タイ語を大きく表示
    ft.style.fontSize = 'clamp(1.3rem, 5vw, 2rem)';
    document.getElementById('quizPrompt').textContent = 'にほんごで なんていう？';
    document.getElementById('quizPromptThai').textContent = 'ภาษาญี่ปุ่น คือคำไหน?';
  } else {
    // 通常モード（既存ロジック）
    document.getElementById('quizEmoji').textContent = correct.emoji;
    document.getElementById('quizEmoji').style.fontSize = '';
    // ... 既存コード ...
  }

  // 選択肢の表示（両モード共通だが、タイ語モードでは絵文字+日本語を選択肢にする）
  // 通常モードと同じ選択肢表示でOK（絵文字+日本語テキスト）
}
```

---

## 実装順序（推奨）

Sonnet に以下の順序で実装してもらうのが効率的：

1. **PWA化**（影響範囲が小さく、新ファイル追加のみ）
2. **うたモード**（既存コードへの変更が最小限）
3. **タイ語→日本語クイズ**（既存のクイズ機能を拡張）
4. **マスコット育成**（既存のステッカーシステムを拡張）
5. **Google Cloud TTS**（最も複雑。Cloudflare Worker のセットアップが必要）

---

## 注意事項（Sonnet向け）

- **ファイル構成**: `index.html` は引き続き1ファイル構成でOK。外部ファイルは `sw.js`, `manifest.json`, `icons/`, `tts-proxy/` のみ
- **既存の録音機能は絶対に壊さないこと**: `VoiceDB`, `recordVoice()`, `playVoiceOrTTS()` は優先度1。Google TTSはフォールバック
- **既存の `speak()` は `speakLocal()` にリネームして残すこと**: Web Speech Synthesis は常にフォールバックとして利用可能にする
- **CSSは `<style>` タグ内に追加**: 外部CSSファイルは使わない
- **テスト**: 各機能を追加した後、既存機能（カード、クイズ、メモリー、カウンティング、オートプレイ、ルーティン、ステッカー、録音）が壊れていないか確認すること
- **TTS_WORKER_URL が空文字の場合**: Google TTS は無効になり、既存の speechSynthesis にフォールバックすること（段階的導入が可能）
