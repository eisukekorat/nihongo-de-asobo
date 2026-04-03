# Google Cloud TTS + Cloudflare Worker デプロイ手順

## 必要なもの
- Google アカウント
- Cloudflare アカウント（無料プランでOK）
- Node.js（https://nodejs.org/ からインストール）

---

## Step 1: Google Cloud TTS API キーを取得

1. https://console.cloud.google.com/ を開く
2. 新しいプロジェクトを作成（例: `nihongo-app`）
3. 左メニュー「APIとサービス」→「ライブラリ」
4. 「Cloud Text-to-Speech API」を検索して「有効にする」
5. 「APIとサービス」→「認証情報」→「認証情報を作成」→「APIキー」
6. 作成されたAPIキーをコピーしておく

> 💡 無料枠: 月100万文字まで無料（このアプリでは余裕で足ります）

---

## Step 2: Cloudflare Worker にデプロイ

### 2-1. このフォルダで依存関係をインストール
```bash
cd tts-proxy
npm install
```

### 2-2. Cloudflare にログイン
```bash
npm run login
# ブラウザが開くのでログイン（アカウントがなければ無料登録）
```

### 2-3. デプロイ
```bash
npm run deploy
```
完了すると `https://nihongo-tts-proxy.あなたの名前.workers.dev` のようなURLが表示される。

### 2-4. APIキーを環境変数として設定
Cloudflare Dashboard を開く:
1. Workers & Pages → nihongo-tts-proxy → Settings → Variables
2. 「Add variable」→
   - Variable name: `GOOGLE_TTS_API_KEY`
   - Value: Step 1 でコピーしたAPIキー
   - 「Encrypt」にチェック（セキュリティのため）
3. 「Save and deploy」

---

## Step 3: index.html に Worker URL を設定

`index.html` を開いて以下の行を探す:
```javascript
const TTS_WORKER_URL = '';
```

Worker の URL に変更:
```javascript
const TTS_WORKER_URL = 'https://nihongo-tts-proxy.あなたの名前.workers.dev';
```

---

## 動作確認

アプリを開いてカードをタップしたとき:
- 最初の再生: Google TTS API が呼ばれてMP3が取得される（少し遅い場合あり）
- 2回目以降: IndexedDB キャッシュから即座に再生される ✨

---

## トラブルシューティング

| 問題 | 対処 |
|------|------|
| 音が出ない | ブラウザのコンソールでエラーを確認。Worker URLが正しいか確認 |
| 「403 Forbidden」エラー | APIキーが正しく設定されているか確認 |
| 「502 TTS API error」 | Google Cloud TTS APIが有効になっているか確認 |
| Worker URLを空にした場合 | 自動的にブラウザのWeb Speech APIにフォールバックします |

---

## セキュリティについて

- APIキーは Cloudflare Worker の環境変数として保存するため、ブラウザに露出しません
- Worker がプロキシとして機能するため、クライアントはAPIキーを知ることができません
