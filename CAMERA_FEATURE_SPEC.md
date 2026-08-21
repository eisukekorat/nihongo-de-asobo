# 📷 カメラでことばをおぼえよう — 実装仕様書

## 概要

既存の「にほんご あそぼう！」アプリに、カメラ撮影で日本語・タイ語の単語を学べる機能を追加する。
子供（2〜6歳）が楽しく繰り返し触れることを最優先に設計する。

---

## アーキテクチャ

### ファイル構成（新規作成するもの）

```
nihongo-de-asobo/
├── camera.html            ★ カメラ機能のメインページ（新規）
├── camera-dictionary.js   ★ 辞書データ（新規）
├── index.html             ※ メニューにカメラボタンを追加（最小限の変更）
├── sw.js                  ※ camera.html等をキャッシュ対象に追加
└── vision-proxy/          ★ Vision API用Cloudflare Worker（新規）
    ├── src/index.js
    ├── wrangler.toml
    └── package.json
```

### 既存コードへの変更は最小限にする

`index.html` への変更は **メイン画面にカメラボタン1つを追加するだけ** にとどめる。
カメラ機能の全ロジックは `camera.html` に独立させる。
これにより既存機能を壊すリスクをゼロにする。

---

## 1. camera-dictionary.js — 辞書データ

### 設計方針

- Vision APIのラベル（英語）→ 日本語・タイ語のマッピング
- Translation APIは使わない（コスト削減＋品質保証）
- 既存の `data` オブジェクト（index.html内の16カテゴリ約400語）のjp/thaiを活用

### データ構造

```javascript
const CAMERA_DICTIONARY = {
  // Vision APIが返しうるラベル → 単語情報
  "dog": {
    ja: "いぬ",
    th: "สุนัข",
    thRead: "スナック",
    emoji: "🐶",
    category: "どうぶつ",
    visionAliases: ["dog", "puppy", "canine", "golden retriever", "labrador"],
    funVoice: "ワンワン！"
  },
  "cat": {
    ja: "ねこ",
    th: "แมว",
    thRead: "メーオ",
    emoji: "🐱",
    category: "どうぶつ",
    visionAliases: ["cat", "kitten", "feline", "tabby"],
    funVoice: "ニャーン！"
  },
  // ... 最低100語を収録
};

// visionAliasesからメインキーへの逆引きマップ（自動生成）
const VISION_LABEL_MAP = {};
for (const [key, entry] of Object.entries(CAMERA_DICTIONARY)) {
  for (const alias of entry.visionAliases) {
    VISION_LABEL_MAP[alias.toLowerCase()] = key;
  }
}
```

### カテゴリ一覧（既存カテゴリと対応）

| カテゴリ | 日本語表示 | 対応する既存data |
|---------|-----------|----------------|
| どうぶつ | 🐾 どうぶつ | data.animals |
| たべもの | 🍎 たべもの | data.food |
| のりもの | 🚗 のりもの | data.vehicles |
| おうち   | 🏠 おうち   | data.house |
| からだ   | 🖐️ からだ   | data.body |
| ふく     | 👕 ふく     | data.clothes |
| おもちゃ | 🧸 おもちゃ | data.toys |

### 辞書データの作成手順

1. 既存の `data` オブジェクト（index.html 行701-1162）から jp, thai を抽出
2. 各単語に対応するVision APIラベル（英語）を付与
3. タイ語カタカナ読み（thRead）を追加
4. visionAliases（同義語・類義語）を追加

**重要：既存データに含まれる全単語をカバーする必要はない。**
カメラで撮影可能な「具体的な物体」に限定する（感情、あいさつ等は除外）。

---

## 2. vision-proxy/ — Cloudflare Worker

### 既存の tts-proxy/ と同じパターンで作成

**wrangler.toml:**
```toml
name = "nihongo-vision-proxy"
main = "src/index.js"
compatibility_date = "2024-01-01"

[vars]
ALLOWED_ORIGIN = ""
```

**src/index.js の仕様:**

```javascript
// POST / で画像（base64）を受け取り、Vision APIにラベル検出をリクエスト
// レスポンス：ラベル配列を返す

export default {
  async fetch(request, env) {
    // CORSヘッダー（tts-proxyと同じパターン）
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const { image } = await request.json();
      // image: base64エンコードされた画像データ（data:image/jpeg;base64,... のプレフィックスは除去済み）

      const visionResponse = await fetch(
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
```

**環境変数（Cloudflare Dashboardで設定）：**
- `GOOGLE_VISION_API_KEY` — Google Cloud Vision APIキー

---

## 3. camera.html — メインUI

### 全体設計原則

1. **スタンドアロン**：index.htmlに依存しない独立ページ
2. **共有する仕組み**：localStorage（シールデータ）、IndexedDB（TTSキャッシュ）、TTS Worker URLは共通
3. **デザイントーン**：index.htmlと同じCSS変数・カラースキームを使用
4. **モバイルファースト**：100vw × 100vh、スクロール不要

### 画面構成（4つのビュー）

#### ビュー1：メニュー画面

```
┌─────────────────────────────────┐
│  ← もどる        ことばカメラ      │
│                                 │
│    🌳 ことばの木（シンプル表示）     │
│    「○○のことば、いま △△こ！」      │
│                                 │
│  ┌───────────┐  ┌───────────┐   │
│  │  📷       │  │  👆       │   │
│  │ パシャ！   │  │ タッチ！   │   │
│  │           │  │           │   │
│  └───────────┘  └───────────┘   │
│                                 │
│  ┌───────────┐  ┌───────────┐   │
│  │  🎵       │  │  📖       │   │
│  │ どっち？   │  │ ずかん    │   │
│  │           │  │           │   │
│  └───────────┘  └───────────┘   │
│                                 │
│          🐻 くまちゃん             │
└─────────────────────────────────┘
```

- 「← もどる」ボタンで index.html に戻る
- ボタンは最低 80×80px
- ボタン間隔は最低 16px
- 全テキストはひらがな、最低 24px

#### ビュー2：📷 パシャ！（撮影モード）

```
撮影フロー：
1. <input type="file" accept="image/*" capture="camera"> をJSでトリガー
   → OSのカメラが起動
2. 撮影完了 → 画像をCanvas APIで640px以下にリサイズ
3. base64に変換 → Vision Proxy Workerに送信
4. 待機中：キャラクター（🐻）のアニメーション表示
   「うーん、なんだろう…🔍」
   → CSSアニメーションで虫眼鏡を持って覗く動き
5. レスポンス受信 → ラベルをCAMERA_DICTIONARYとマッチング
6. マッチあり → 結果画面へ
7. マッチなし → 「もういちど とってみよう！📷」
   → 否定的な表現は使わない
```

**結果画面：**
```
┌─────────────────────────────────┐
│                                 │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │    [撮影した写真]         │   │
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│      🐶                        │
│                                 │
│    いぬ            ← 大きな文字   │
│    สุนัข（スナック）  ← タイ語＋読み │
│                                 │
│  ┌─────────┐  ┌─────────┐      │
│  │ 🔊にほんご│  │ 🔊タイご │      │
│  └─────────┘  └─────────┘      │
│                                 │
│   ★ ことばずかんに ついかしたよ！   │
│                                 │
│  [📷 もういっかい]  [📖 ずかん]    │
│                                 │
└─────────────────────────────────┘
```

**重要な実装ポイント：**
- 結果表示と同時に日本語音声を自動再生（speak関数でGoogle TTS呼び出し）
- 1.5秒後にタイ語音声を自動再生
- 🔊ボタンは画面の広い範囲をタップ領域にする
- 写真＋単語データをIndexedDBの「ずかん」ストアに保存
- 新しい単語の場合シールを付与（earnSticker相当の処理）

#### ビュー3：👆 タッチ！（タッチモード）★2歳児のメイン体験

```
┌─────────────────────────────────┐
│  ← もどる                        │
│                                 │
│  ┌──────────┐  ┌──────────┐    │
│  │[犬の写真] │  │[りんご写真]│    │
│  │          │  │          │    │
│  │  🐶いぬ  │  │ 🍎りんご  │    │
│  └──────────┘  └──────────┘    │
│                                 │
│  ┌──────────┐  ┌──────────┐    │
│  │[車の写真] │  │[花の写真] │    │
│  │          │  │          │    │
│  │ 🚗くるま │  │ 🌸はな   │    │
│  └──────────┘  └──────────┘    │
│                                 │
│      ← スワイプで次の4枚 →       │
└─────────────────────────────────┘
```

**動作：**
- カードをタップ → 日本語音声再生 → 1秒後タイ語再生
- カード全体がタップ領域（小さなボタンは作らない）
- 写真がない場合はemojiを大きく表示（既存データのemoji）
- 上下スワイプは無効化（子供の誤操作防止）
- 左右スワイプで次の4枚
- 5タップごとにシール付与（既存のカード モードと同じ仕様）
- 表示する単語は「ずかんに保存済みの写真」＋「今日のおすすめ（辞書からランダム）」

**2歳児対応の特別仕様：**
- タップ反応は即座（0.1秒以内にアニメーション開始）
- タップ時：カードが少し縮む→跳ね返るアニメーション（card-mega-pop相当）
- 同じカードを連続タップしても毎回反応する

#### ビュー4：📖 ずかん（コレクション）

```
┌─────────────────────────────────┐
│  ← もどる    ○○の ことばずかん    │
│              △△のことば！         │
│                                 │
│  [🐾どうぶつ] [🍎たべもの] [🚗のりもの]│
│  [🏠おうち] [👕ふく] [🧸おもちゃ]   │
│                                 │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐  │
│  │📷🐶│ │📷🐱│ │📷🐟│ │ ?? │  │
│  │いぬ │ │ねこ│ │さかな│ │    │  │
│  └────┘ └────┘ └────┘ └────┘  │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐  │
│  │ ?? │ │ ?? │ │ ?? │ │ ?? │  │
│  │    │ │    │ │    │ │    │  │
│  └────┘ └────┘ └────┘ └────┘  │
│                                 │
└─────────────────────────────────┘
```

**動作：**
- カテゴリタブで絞り込み
- 撮影済み＝写真＋単語表示、未撮影＝「？？」（シルエット）
- カードタップで詳細表示（写真大＋音声再生）
- 「？？」タップで「📷 さがしにいこう！」→ カメラモードへ誘導

#### ビュー5：🎵 どっち？（クイズモード）

```
┌─────────────────────────────────┐
│                                 │
│    🔊「いぬ は どっち？」          │
│                                 │
│  ┌──────────────┐ ┌──────────────┐│
│  │              │ │              ││
│  │  [猫の写真]   │ │  [犬の写真]   ││
│  │   or 🐱      │ │   or 🐶      ││
│  │              │ │              ││
│  └──────────────┘ └──────────────┘│
│                                 │
└─────────────────────────────────┘

正解：キラキラ＋「すごい！สุนัข（スナック）！」（タイ語でも言う）
不正解：「これは ねこ だよ！いぬは こっち！」→正解をハイライト
```

**出題ロジック：**
- ずかんに2語以上あれば開始可能
- 同じカテゴリから2語を出題（難易度低）
- 日本語で聞く回 / タイ語で聞く回をランダムに混ぜる
- 正解でシール付与

---

## 4. IndexedDB — 写真・ずかんデータの保存

### 新しいDB

```javascript
// DB名: nihongo-camera
// バージョン: 1
// ストア:
//   - 'photos': 撮影した写真データ
//   - 'zukan': ことばずかんの収集状態

// photosストアのデータ構造:
{
  id: 'dog_1712345678',         // dictKey + timestamp
  dictKey: 'dog',               // CAMERA_DICTIONARYのキー
  imageBlob: Blob,              // リサイズ済み画像
  timestamp: 1712345678000,     // 撮影日時
}

// zukanストアのデータ構造:
{
  dictKey: 'dog',               // CAMERA_DICTIONARYのキー（主キー）
  firstSeen: 1712345678000,     // 初めて撮影した日時
  count: 3,                     // 撮影回数
  latestPhotoId: 'dog_1712345678'  // 最新の写真ID
}
```

---

## 5. index.html への変更

### 変更箇所1：メニューにカメラボタンを追加

モード切替ボタンの並びに「📷 カメラ」ボタンを追加する。
タップすると `camera.html` に遷移する。

```html
<!-- 既存のモードボタンの並びの先頭に追加 -->
<button class="mode-btn" onclick="location.href='camera.html'"
  style="background: linear-gradient(135deg, #a8e6cf, #88d8b0);">
  📷<br><span style="font-size:.7em">カメラ</span>
</button>
```

### 変更箇所2：sw.js のキャッシュ対象に追加

```javascript
const ASSETS = [
  'index.html',
  'camera.html',          // 追加
  'camera-dictionary.js', // 追加
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png'
];
```

**これ以外の既存ファイルの変更は不要。**

---

## 6. TTS（音声読み上げ）の実装

### 既存のTTS Workerを再利用

camera.html 内で、index.htmlと同じGoogle TTS Worker URLを使う：
```javascript
const TTS_WORKER_URL = 'https://nihongo-tts-proxy.eisukeoseto.workers.dev';
```

### 日本語TTS
既存と同じ仕様（ja-JP-Neural2-B, rate 0.85, pitch 2.0）

### タイ語TTS
**既存のTTS Workerはタイ語に対応していない可能性がある。**
TTS Workerの修正が必要な場合：
- リクエストに `lang` パラメータを追加
- `lang === 'th'` の場合：`languageCode: 'th-TH'`, `name: 'th-TH-Neural2-C'`
- Worker側で言語判定して適切なボイスを選択

```javascript
// camera.html側のTTS呼び出し
async function speakWord(text, lang = 'ja') {
  const speed = 0.85;
  try {
    const res = await fetch(TTS_WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, speed, lang })
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    await audio.play();
    URL.revokeObjectURL(url);
  } catch (e) {
    // フォールバック: Web Speech API
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'th' ? 'th-TH' : 'ja-JP';
    u.rate = 0.8;
    speechSynthesis.speak(u);
  }
}
```

---

## 7. シール機能の共有

### localStorageで共有（既存仕様）

camera.html と index.html で同じ `localStorage` キー `'nihongo_stickers'` を共有する。

```javascript
// camera.html でのシール付与
function earnCameraSticker() {
  let stickerData = JSON.parse(localStorage.getItem('nihongo_stickers') || '{"count":0,"stickers":[]}');
  const stickerPool = ['🌟','⭐','💫','✨','🌸','🌺','🌻','🦋','🌈','🍀','🎀','🎵','💖','🧸','🎠','🍭','🍬','🧁','👑','💎','🦄','🐣','🌞','🪁','🫧','🎨','🎶','💝','🔮','🪄'];
  const s = stickerPool[Math.floor(Math.random() * stickerPool.length)];
  stickerData.stickers.push(s);
  stickerData.count++;
  localStorage.setItem('nihongo_stickers', JSON.stringify(stickerData));

  // 浮かせアニメーション表示
  showFloatingSticker(s);
}
```

---

## 8. CSSデザイン仕様

### 既存index.htmlと統一するCSS変数

```css
:root {
  --sky: #fff7ed;
  --card-radius: 32px;
  --shadow: 0 10px 0px rgba(0,0,0,.04), 0 2px 6px rgba(0,0,0,.06);
  --dark: #2d3436;
  --yellow: #ffd43b;
}
```

### カメラ機能専用の追加色

```css
:root {
  --camera-green: #a8e6cf;
  --camera-blue: #87ceeb;
  --camera-pink: #ffb7b2;
}
```

### アニメーション

```css
/* カードタップ（即座に反応） */
@keyframes card-tap {
  0% { transform: scale(1); }
  50% { transform: scale(0.92); }
  100% { transform: scale(1); }
}

/* 認識中のキャラクター */
@keyframes searching {
  0%, 100% { transform: rotate(-10deg); }
  50% { transform: rotate(10deg); }
}

/* 結果表示のポップイン */
@keyframes result-pop {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

/* シール浮遊 */
@keyframes sticker-float {
  0% { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(-120px) scale(1.5); opacity: 0; }
}
```

---

## 9. プライバシー・安全性

1. **画像はVision APIに送信後、サーバーに保持しない**（Workerはステートレス）
2. **撮影した写真はIndexedDBにローカル保存のみ**
3. **EXIF情報はCanvas APIでリサイズする際に自動的に除去される**
4. **子供向けフィルタリング：辞書に存在する単語のみ表示するため、不適切コンテンツは表示されない**

---

## 10. Vision Proxy Worker のデプロイ手順

1. `cd vision-proxy && npm init -y`
2. `npm install wrangler --save-dev`
3. Cloudflare Dashboard → Workers → 「nihongo-vision-proxy」作成
4. Settings → Variables → `GOOGLE_VISION_API_KEY` を設定
5. `npx wrangler deploy`
6. デプロイURL: `https://nihongo-vision-proxy.eisukeoseto.workers.dev`

---

## 11. 実装の優先順位

### Phase 1（今回実装する）

1. `camera-dictionary.js` — 辞書データ（最低100語、既存dataから変換）
2. `vision-proxy/` — Cloudflare Worker
3. `camera.html` — 4つのビュー全て
   - メニュー画面
   - 📷 パシャ！（撮影モード）
   - 👆 タッチ！（タッチモード）
   - 📖 ずかん
4. TTS Worker のタイ語対応修正（tts-proxy/src/index.js）
5. `index.html` にカメラボタン追加（1箇所のみ）
6. `sw.js` キャッシュ更新

### Phase 2（次回以降）

- 🎵 どっち？（クイズモード）
- ことばの木の成長アニメーション
- 保護者ダッシュボード
- 音声バリエーション
- オフラインキュー（撮影だけしてオンライン復帰時に認識）

---

## 12. 注意事項（Sonnetへの指示）

### コーディング規約
- 既存アプリと同じくバニラJS（フレームワーク不使用）
- camera.html は1ファイルに HTML + CSS + JS を全て含める（既存index.htmlと同じスタイル）
- 外部ライブラリは使用しない
- `camera-dictionary.js` のみ外部ファイルとして `<script src>` で読み込む

### 子供向けUXの鉄則
- **待ち時間ゼロ感**：タップから反応まで0.1秒以内にアニメーション開始
- **画面のどこを触っても何か起こる**：小さなボタンを作らない
- **失敗が存在しない**：認識できなくても楽しい表現にする
- **音が主役**：表示と同時に音声自動再生、文字は補助
- **全テキストはひらがな**：漢字・カタカナは使わない（カタカナ読みのthReadは例外）

### iOS Safari / PWA対応
- カメラは `<input type="file" accept="image/*" capture="camera">` を使用
- getUserMedia は使わない（iOS PWAで不安定）
- `touch-action: manipulation` で300msタップ遅延を除去
- `-webkit-tap-highlight-color: transparent` でタップハイライト除去

### テスト観点
- iOS Safari（PWAモード）でカメラが起動するか
- Vision API失敗時にフォールバックUIが表示されるか
- オフライン時にタッチモード・ずかんが動作するか
- シールがindex.htmlと共有されるか
