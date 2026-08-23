# にほんご あそぼう！

3歳児（タイ語優位）向けの日本語学習 PWA。息子とその家族だけが使う個人アプリです。

公開URL: https://eisukekorat.github.io/nihongo-de-asobo/

## 主な画面

| ファイル | 内容 |
|---|---|
| `index.html` | 本体アプリ。日本語の単語・ひらがな・うた・クイズをタイ語併記で遊ぶ |
| `camera.html`（`camera-dictionary.js`） | カメラ図鑑。写したものの名前を日本語＋タイ語で読み上げる |
| `bunsho/index.html` | Bunsho版フォーク。2026年末の日本旅行でじいじ・ばあば・いとこと会話するための決め台詞集 |

## 技術構成

- 素の HTML / CSS / JavaScript（ビルド不要）。`index.html` はスタイル・スクリプトを内包した単一ファイル
- `sw.js` による Service Worker でオフライン対応（PWA、`manifest.json`）
- 音声合成は Google Cloud TTS を `tts-proxy/`（Cloudflare Worker）経由で呼び出し
- 画像認識は `vision-proxy/`（Cloudflare Worker）経由で Google Cloud Vision を利用
- GitHub Pages でホスティング

## ローカルでの確認

```bash
python3 -m http.server 3456
```

`http://localhost:3456` で確認できます。ローカルでは TTS Worker が Origin チェックで 403 を返し、ブラウザ内蔵の音声合成にフォールバックします（正常な挙動です）。

## デプロイ

`main` ブランチに push すると GitHub Pages に自動反映されます。
