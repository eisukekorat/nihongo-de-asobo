# Sonnet実行プロンプト — カメラことば機能の実装

以下の手順で「にほんご あそぼう！」アプリにカメラことば学習機能を実装してください。

## 前提

- プロジェクト: `/Users/eisukeoseto/Projects/nihongo-de-asobo/`
- 仕様書: `CAMERA_FEATURE_SPEC.md` を必ず最初に読んでください
- 既存アプリ: `index.html`（約3,000行のバニラJS SPA）を読んで構造を理解してください
- 既存TTS Worker: `tts-proxy/src/index.js` を読んでください

## 実装タスク（この順番で実行）

### タスク1：既存コードの理解

1. `index.html` を読み、以下を把握する：
   - データ構造（行701〜1162付近の `data` オブジェクト）
   - `setMode()` 関数のパターン
   - `earnSticker()` 関数の実装
   - `speak()` / `speakGoogle()` のTTS呼び出しパターン
   - CSS変数とデザイントーン
2. `tts-proxy/src/index.js` を読み、Cloudflare Workerのパターンを把握する
3. `sw.js` を読む

### タスク2：camera-dictionary.js の作成

`index.html` 内の `data` オブジェクトから、カメラで撮影可能な具体的な物体の単語を抽出し、Vision APIラベルとのマッピングを作成する。

**対象カテゴリ:** animals, food, vehicles, house, body, clothes, toys
**除外:** greetings, phrases, feelings, actions, numbers, shapes, weather, hiragana（これらはカメラで撮影できない抽象的な概念）

**各エントリに必要な情報:**
- `ja`: 日本語（既存dataのjpフィールド）
- `th`: タイ語（既存dataのthaiフィールド）
- `thRead`: タイ語のカタカナ読み（推測で付与）
- `emoji`: 絵文字（既存dataのemojiフィールド）
- `category`: カテゴリ名（日本語）
- `visionAliases`: Vision APIが返しうる英語ラベルの配列
- `funVoice`: 鳴き声・擬音（あれば。既存dataのsoundフィールド）

**出力形式:** CAMERA_FEATURE_SPEC.md のセクション1に準拠

### タスク3：vision-proxy/ の作成

`tts-proxy/` と同じパターンでCloudflare Worker を作成する。
- `vision-proxy/src/index.js` — CAMERA_FEATURE_SPEC.md のセクション2に準拠
- `vision-proxy/wrangler.toml`
- `vision-proxy/package.json`

### タスク4：tts-proxy のタイ語対応

`tts-proxy/src/index.js` を修正し、タイ語TTSに対応させる：
- リクエストbodyに `lang` パラメータを追加（デフォルト: 'ja'）
- `lang === 'th'` の場合: `languageCode: 'th-TH'`, `name: 'th-TH-Neural2-C'`
- `lang === 'ja'`（またはlang未指定）の場合: 既存の日本語設定を維持
- **既存の日本語TTS動作を一切壊さないこと**

### タスク5：camera.html の作成

CAMERA_FEATURE_SPEC.md のセクション3に準拠して、1ファイルにHTML+CSS+JSを含むページを作成する。

**実装するビュー（4つ）:**

1. **メニュー画面** — 4つのボタン（パシャ、タッチ、どっち、ずかん）
2. **📷 パシャ！** — カメラ撮影→Vision API→辞書マッチング→結果表示→TTS再生→ずかん保存→シール付与
3. **👆 タッチ！** — 写真カード4枚表示、タップで音声再生、スワイプで次の4枚
4. **📖 ずかん** — カテゴリ別のコレクション表示、撮影済み/未撮影の区別

**必ず守ること：**
- CSS変数は index.html と同じものを使う（--sky, --card-radius, --shadow, --dark, --yellow）
- ボタンは最低 80×80px、間隔16px以上
- 全テキストはひらがな（漢字・カタカナ禁止、thReadは例外）
- タッチ反応は即座（CSSアニメーションで体感速度を確保）
- 音声は結果表示と同時に自動再生
- カメラは `<input type="file" accept="image/*" capture="camera">`
- シールは localStorage キー `'nihongo_stickers'` で index.html と共有
- IndexedDB `'nihongo-camera'` に写真・ずかんデータを保存
- `camera-dictionary.js` を `<script src>` で読み込む
- iOS Safari PWA で動作すること
- `touch-action: manipulation` でタップ遅延除去
- Vision API失敗時は「もういちど とってみよう！」と表示（エラーメッセージは出さない）

**TTS呼び出し:**
```
const TTS_WORKER_URL = 'https://nihongo-tts-proxy.eisukeoseto.workers.dev';
```
日本語: `{ text, speed: 0.85, lang: 'ja' }`
タイ語: `{ text, speed: 0.85, lang: 'th' }`

**Vision API呼び出し:**
```
const VISION_WORKER_URL = 'https://nihongo-vision-proxy.eisukeoseto.workers.dev';
```
リクエスト: `{ image: base64String }` (data:プレフィックス除去済み)
レスポンス: `{ labels: [{description, score}], objects: [{name, score}] }`

### タスク6：index.html への最小限の変更

1. モードボタンの並びの先頭に「📷 カメラ」ボタンを追加
   - `onclick="location.href='camera.html'"`
   - 他のmode-btnと同じスタイル
2. **これ以外の変更はしない**

### タスク7：sw.js の更新

キャッシュ対象に `camera.html` と `camera-dictionary.js` を追加。
キャッシュバージョンを1つ上げる（v10 → v11）。

## 品質チェックリスト

実装完了後、以下を自己確認してください：

- [ ] camera.html が単独で開いて動作するか
- [ ] index.html のカメラボタンから camera.html に遷移できるか
- [ ] camera.html の「もどる」から index.html に戻れるか
- [ ] 既存の index.html の全機能が壊れていないか
- [ ] タッチモードでカードタップ時に音声が再生されるか
- [ ] ずかんにデータが保存・表示されるか
- [ ] シールが index.html と共有されるか
- [ ] 全テキストがひらがなになっているか
- [ ] ボタンサイズが80px以上あるか
- [ ] CSSアニメーションが滑らかか
