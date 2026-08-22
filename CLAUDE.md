# にほんごであそぼう の掟（このリポで作業する Claude へ）

息子 **しんじ（3歳・タイ語優位）** のための日本語学習 PWA。本人と家族しか使わない個人アプリ。
GitHub Pages で公開: https://eisukekorat.github.io/nihongo-de-asobo/

正本メモリ: `~/.claude/projects/-Users-eisukeoseto/memory/project_nihongo_de_asobo_thai.md`（本体アプリの方針も収録）
と `project_nihongo_de_asobo_bunsho.md`。

## このリポに入っている3つのもの（混ぜない）

| | 何 | ゴール |
|---|---|---|
| ルート（`index.html` ほか） | **本体アプリ** | 日本語の単語・ひらがな・うた・クイズ。タイ語併記 |
| `bunsho/index.html` | **Bunsho版フォーク** | 2026年末の日本旅行で、じいじ・ばあば・いとこと**会話できる**こと。語彙より「決め台詞を場面で言える」を優先 |
| `camera.html` + `camera-dictionary.js` | カメラ図鑑 | 写したものの名前を日本語＋タイ語で言う |

**Thai版（タイ語が主役の別コンセプト）は別リポ** `nihongo-de-asobo-thai`。ここには入れない。

## 判断軸

1. **音声が主役。** 3歳・文字が読めない。テキストの装飾より、音声の順序と間の取り方を優先する
2. **「○○ちゃん」は「しんじちゃん」で展開する**（名前差し込みのある画面）
3. 迷ったら「年末の日本旅行で実戦投入されるか」（bunsho）／「息子が自分でタップして遊べるか」（本体）

## commit / push

**確認なしで commit → push してよい**（個人の GitHub Pages プロジェクト）。
push すると数十秒で本番に反映される＝**本番へ直行する**ことは意識する。

## 🔴 壊してはいけないもの — TTS の $0 運用防御

音声は Google Cloud TTS を **Cloudflare Worker 経由**で呼んでいる（`tts-proxy/`、画像認識は `vision-proxy/`）。
無料枠内で**請求ゼロ**を維持するために、3段の防御がかかっている：

1. **Worker の `ALLOWED_ORIGIN`** = `https://eisukekorat.github.io`（Origin 無しは 403）
2. Google Cloud 側の **TTS クォータ**を 1,000/分 → **60/分**に制限
3. **予算アラート ฿20/月**（฿10 / ฿18 / ฿20 で Gmail 通知）

- ⚠️ **ローカル開発（`http://localhost:3456`）では Worker に 403 で弾かれ、ブラウザ内蔵 TTS にフォールバックする。
  これは故障ではなく正常挙動。** 「TTSが壊れた」と誤診しない
- **`ALLOWED_ORIGIN` を `*` に戻さない。** 直すなら別の手を考える
- レスポンスの `Cache-Control: public, max-age=604800`（7日）は**課金を減らすためのもの**。短くしない

## 🔴 API キーはリポに入れない

- Google TTS / Vision の API キーは **Cloudflare Dashboard の Variables** に置く
  （Workers & Pages → `nihongo-tts-proxy` → Settings → Variables）。`wrangler.toml` に書かない
- Cloudflare のアカウントは eisuke.oseto@gmail.com。**wrangler は未ログインのまま**＝設定は Dashboard から
- `.gitignore` は `node_modules/` と `.DS_Store` だけ。**追跡ファイルは24本しかない**ので、
  何か足すときは `git status` を必ず見る

## コードの実態（知らないとハマる）

- **`index.html` は 175KB の単一ファイル**（CSS も JS も内包）。分割していないのは意図。
  編集するときは `/* ====== SECTION ====== */` のコメント区切りを目印にする
- `sw.js` が Service Worker。**表示が古いままなら SW キャッシュを疑う**。
  UI を変えたのに反映されないときは、まず SW のキャッシュ名（バージョン）を上げたか確認
- ローカル確認は `.claude/launch.json` の `nihongo-de-asobo`（port 3456）。
  preview_start で開く。**Bash で `python3 -m http.server` を直接起動しない**
- 実機（iPhone / iPad）で触るのは息子。**変更後は必ず自分でプレビューして動作確認してから**「できました」と言う
