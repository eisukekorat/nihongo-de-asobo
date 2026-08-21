# Sonnet実行プロンプト — 全画面タイ語対応

以下の手順で「にほんご あそぼう！」アプリのUI全体にタイ語を併記してください。

## 背景

このアプリのユーザーには**タイ人の妻やタイ人のシッターさん**が含まれます。
現状、UIテキスト（ボタン、メッセージ、ヒント等）の大半が日本語のみで、タイ語話者がアプリを操作できません。
すべてのUIテキストに**タイ語を併記**し、誰が使っても操作できるようにしてください。

## 基本ルール

- **日本語は残す**（消さない）。日本語の下や横にタイ語を追加する
- 表示パターンは場所に応じて使い分ける：
  - ボタン: メインラベル（日本語）+ 小文字タイ語サブラベル
  - メッセージ: `日本語\nタイ語` の2行表示
  - alert: `日本語\nタイ語` を改行で併記
  - 配列: `[{jp:'...', th:'...'}]` 形式に変換
- **既存のデータ構造（data.animals等の単語データ、songs配列のlyrics）は変更不要**（既にjp/thaiペアがある）
- **camera.htmlのメニューボタン（382-405行）は既に良いパターン**になっている。これを参考にすること
- 全テキストはひらがな + タイ文字（漢字禁止）
- 実装後、**必ず全画面を自分でプレビュー確認**してから報告すること

---

## 修正対象の全リスト

### ファイル1: index.html — HTML部分

#### メタ情報（優先度：低）
| 行 | 現状 | 修正内容 |
|---|---|---|
| 5 | `<title>にほんご あそぼう！</title>` | `にほんご あそぼう！ เรียนภาษาญี่ปุ่น` に変更 |
| 9 | `<meta content="にほんご">` | そのまま（短いタイトルなので日本語のみでOK） |

#### カテゴリタブ（555-570行）— 16個

各タブに小さいタイ語サブラベルを追加する。カテゴリタブは横スクロールなのでスペースが限られる。
方式: `<span class="cat-tab-thai">タイ語</span>` を追加し、CSSで小文字表示。

```css
.cat-tab .cat-tab-thai { display:block; font-size:0.5rem; color:inherit; opacity:0.7; font-weight:700; }
```

| data-cat | 現状 | タイ語追加 |
|---|---|---|
| animals | `🐾 どうぶつ` | `สัตว์` |
| food | `🍎 たべもの` | `อาหาร` |
| numbers | `🔢 かず・いろ` | `ตัวเลข・สี` |
| shapes | `🔷 かたち` | `รูปทรง` |
| greetings | `👋 あいさつ` | `ทักทาย` |
| phrases | `💬 かいわ` | `บทสนทนา` |
| body | `👁️ からだ` | `ร่างกาย` |
| feelings | `😊 きもち` | `ความรู้สึก` |
| vehicles | `🚗 のりもの` | `ยานพาหนะ` |
| family | `👨‍👩‍👦 かぞく` | `ครอบครัว` |
| house | `🏠 おうち` | `บ้าน` |
| toys | `🧸 おもちゃ` | `ของเล่น` |
| clothes | `👗 ふく` | `เสื้อผ้า` |
| weather | `🌤️ てんき` | `อากาศ` |
| actions | `🏃 どうさ` | `การกระทำ` |
| hiragana | `あ ひらがな` | `ฮิรางานะ` |

例:
```html
<button class="cat-tab active" data-cat="animals" onclick="setCategory('animals',this)">
  🐾 どうぶつ<span class="cat-tab-thai">สัตว์</span>
</button>
```

#### モードボタン（574-583行）— 10個

各ボタンにタイ語サブラベルを追加。camera.htmlメニューボタンのパターンに近い形で。
方式: `<br><span style="font-size:.55em;opacity:.7">タイ語</span>` を追加。

| ボタン | 現状 | タイ語追加 |
|---|---|---|
| 574 カメラ | `📷<br><span style="font-size:.7em">カメラ</span>` | `กล้อง` を追加 |
| 575 カード | `🃏 カード` | `การ์ด` |
| 576 クイズ | `🎯 クイズ` | `ควิซ` |
| 577 ペア | `🧩 ペア` | `จับคู่` |
| 578 かぞえ | `🔢 かぞえ` | `นับเลข` |
| 579 じどう | `▶️ じどう` | `อัตโนมัติ` |
| 580 2かい | `🔁 2かい` | `2 ครั้ง` |
| 581 あさ | `🌅 あさ` | `เช้า` |
| 582 よる | `🌙 よる` | `กลางคืน` |
| 583 うた | `🎵 うた` | `เพลง` |

例:
```html
<button class="mode-btn active" onclick="setMode('cards',this)">🃏 カード<br><span style="font-size:.55em;opacity:.7">การ์ด</span></button>
```

#### うたオーバーレイ（602-627行）

| 行 | 現状 | 修正 |
|---|---|---|
| 605 | `<span id="songSpeedLabel">ふつう</span>` | `<span id="songSpeedLabel">ふつう<br><span class="thai-sub">ปกติ</span></span>` |
| 615 | `🔁 もういっかい！` | `🔁 もういっかい！<br><span class="thai-sub">อีกครั้ง!</span>` |
| 616 | `タップで もういちど 🔊` | `タップで もういちど 🔊<br><span class="thai-sub">แตะเพื่อฟังอีกครั้ง</span>` |
| 619 | `ろくおんちゅう…` | `ろくおんちゅう…<br><span class="thai-sub">กำลังอัดเสียง...</span>` |
| 622 | `▶️ きいてみる` | `▶️ きいてみる<br><span class="thai-sub">ฟังดู</span>` |
| 623 | `💾 ほぞん` | `💾 ほぞん<br><span class="thai-sub">บันทึก</span>` |
| 624 | `🔄 もういちど` | `🔄 もういちど<br><span class="thai-sub">อีกครั้ง</span>` |
| 625 | `🗑️ けす` | `🗑️ けす<br><span class="thai-sub">ลบ</span>` |

CSSを追加：
```css
.thai-sub { font-size:0.6em; opacity:0.7; font-weight:700; display:block; }
```

#### クイズセクション（629-647行）

| 行 | 現状 | 修正 |
|---|---|---|
| 631 | `2️⃣ 2たく` | `2️⃣ 2たく<span class="thai-sub">2 ตัวเลือก</span>` |
| 632 | `4️⃣ 4たく` | `4️⃣ 4たく<span class="thai-sub">4 ตัวเลือก</span>` |
| 635 | `🎌 えもじ→にほんご` | `🎌 えもじ→にほんご<span class="thai-sub">อิโมจิ→ญี่ปุ่น</span>` |
| 636 | `🇹🇭 タイご→にほんご` | `🇹🇭 タイご→にほんご<span class="thai-sub">ไทย→ญี่ปุ่น</span>` |
| 642 | `どれかな？` | `どれかな？<span class="quiz-prompt-thai-inline">อันไหนนะ?</span>` — ※quizPromptThaiが既にあるので、そちらの初期値をセットする形でもOK |
| 647 | `つぎ ➜` | `つぎ ➜<br><span class="thai-sub">ถัดไป</span>` |

#### ペアゲーム（650-654行）

| 行 | 現状 | 修正 |
|---|---|---|
| 653 | `もういっかい 🔄` | `もういっかい 🔄<br><span class="thai-sub">อีกครั้ง</span>` |

#### かぞえゲーム（656-662行）

| 行 | 現状 | 修正 |
|---|---|---|
| 659 | `タップして かぞえよう！` | JS側で動的に設定されるので、HTMLの初期値にもタイ語を追加: `タップして かぞえよう！<br><span class="thai-sub">แตะแล้วนับกัน!</span>` |

#### 自動再生（664-673行）

| 行 | 現状 | 修正 |
|---|---|---|
| 671 | `🔁 もういっかい！` | `🔁 もういっかい！<br><span class="thai-sub">อีกครั้ง!</span>` |

#### セレブレーション（675-679行）

| 行 | 現状 | 修正 |
|---|---|---|
| 678 | `すごい！` | JS側で動的に上書きされるのでHTML変更不要。JS側で対応 |

#### シールちょう（688-693行）

| 行 | 現状 | 修正 |
|---|---|---|
| 690 | `🎖️ シールちょう` | `🎖️ シールちょう<br><span class="thai-sub">สมุดสติ๊กเกอร์</span>` |
| 691 | `0こ あつめたよ！` | JS側で動的更新されるのでJS側で対応 |

#### 録音（695-696行）

| 行 | 現状 | 修正 |
|---|---|---|
| 696 | `🎙️ ろくおん` | `🎙️ ろくおん<span class="thai-sub">อัดเสียง</span>` |

---

### ファイル1: index.html — JavaScript部分

#### マスコットメッセージ（1166行）

現状:
```js
const mascotMsgs=['がんばれ〜！','いいね！','すごいよ！','たのしい？','もういっかい！','やってみよう！','にほんご だいすき！','เก่งมาก！','สู้ๆ นะ！'];
```

修正: ペア形式に変更し、表示時に両方出す
```js
const mascotMsgs=[
  {jp:'がんばれ〜！', th:'สู้ๆ นะ!'},
  {jp:'いいね！', th:'ดีมาก!'},
  {jp:'すごいよ！', th:'เก่งมาก!'},
  {jp:'たのしい？', th:'สนุกไหม?'},
  {jp:'もういっかい！', th:'อีกครั้ง!'},
  {jp:'やってみよう！', th:'ลองดู!'},
  {jp:'にほんご だいすき！', th:'ชอบภาษาญี่ปุ่น!'},
];
```

`mascotTap()`関数も修正:
```js
function mascotTap(){
  const sp=document.getElementById('mascotSpeech');
  const msg=mascotMsgs[Math.floor(Math.random()*mascotMsgs.length)];
  sp.innerHTML=msg.jp+'<br><span style="font-size:0.75em;opacity:0.7">'+msg.th+'</span>';
  speak(msg.jp);
  clearTimeout(mascotTimeout);
  mascotTimeout=setTimeout(()=>sp.classList.remove('show'),2500);
  sp.classList.add('show');
}
```

#### マスコットレベルアップ desc（1181-1185行）

各レベルに`descThai`を追加:
```js
const mascotLevels=[
  {min:0,   display:'🐻',       name:'くまちゃん',     nameThai:'หมีน้อย',    desc:null, descThai:null},
  {min:10,  display:'🎀🐻',     name:'くまちゃん',     nameThai:'หมีน้อย',    desc:'リボンを つけたよ！', descThai:'ติดโบว์แล้ว!'},
  {min:30,  display:'🧢🐻',     name:'くまくん',       nameThai:'หมีจัง',     desc:'ぼうしを かぶったよ！', descThai:'ใส่หมวกแล้ว!'},
  {min:60,  display:'👑🐻',     name:'くまさん',       nameThai:'คุณหมี',     desc:'おうかんを もらったよ！', descThai:'ได้มงกุฎแล้ว!'},
  {min:100, display:'✨👑🐻✨', name:'くまおう',       nameThai:'ราชาหมี',    desc:'くまの おうさまだ！', descThai:'เป็นราชาหมีแล้ว!'},
  {min:200, display:'🌟🧸🌟',  name:'でんせつのくま', nameThai:'หมีตำนาน',  desc:'でんせつの くまに なった！', descThai:'กลายเป็นหมีตำนานแล้ว!'},
];
```

#### マスコットバッジ表示（1209行）

現状: `badgeEl.textContent=level.name;`
修正: `badgeEl.textContent=level.name + ' ' + level.nameThai;`

#### マスコットレベルアップ表示（1222-1223行）

現状: `sp.textContent=level.desc;`
修正:
```js
sp.innerHTML=level.desc+'<br><span style="font-size:0.75em;opacity:0.7">'+(level.descThai||'')+'</span>';
```
次の行の `speak(level.desc)` はそのままでOK（日本語音声で読み上げ）。

#### celebrate関数（1584行）

現状:
```js
const msgs=['すごい！','やったね！','えらい！','かんぺき！','さいこう！','ばっちり！','てんさい！'];
```

修正:
```js
const msgs=[
  {jp:'すごい！',th:'เก่งมาก!'},
  {jp:'やったね！',th:'ทำได้แล้ว!'},
  {jp:'えらい！',th:'เก่งจัง!'},
  {jp:'かんぺき！',th:'สมบูรณ์แบบ!'},
  {jp:'さいこう！',th:'ดีที่สุด!'},
  {jp:'ばっちり！',th:'เยี่ยม!'},
  {jp:'てんさい！',th:'อัจฉริยะ!'},
];
```

celebration-textの設定も修正:
```js
const m=msgs[Math.floor(Math.random()*msgs.length)];
cel.querySelector('.celebration-text').innerHTML=m.jp+'<br><span style="font-size:0.5em;opacity:0.7">'+m.th+'</span>';
```
`speak(pv)` の部分（1602行）も修正:
```js
const pv=msgs[Math.floor(Math.random()*msgs.length)];
setTimeout(()=>speak(pv.jp),300);
```

#### うた速度ラベル（2423行）

現状: `document.getElementById('songSpeedLabel').textContent = songSpeedSlow ? 'ゆっくり' : 'ふつう';`
修正: `document.getElementById('songSpeedLabel').innerHTML = songSpeedSlow ? 'ゆっくり<br><span class="thai-sub">ช้าๆ</span>' : 'ふつう<br><span class="thai-sub">ปกติ</span>';`

#### 録音ボタンtitle（2233行）

現状: `title="ろくおん"`
修正: `title="ろくおん / อัดเสียง"`

#### ペアゲーム（2632, 2661, 2665行）

- 2632: `のこり ${3-memMatched} ペア` → `のこり ${3-memMatched} ペア / เหลือ ${3-memMatched} คู่`
- 2661: 同上
- 2665: `🎉 かんせい！` → `🎉 かんせい！ สำเร็จแล้ว!`

#### かぞえゲーム（2704, 2725行）

- 2704: `タップして かぞえよう！` → `タップして かぞえよう！\nแตะแล้วนับกัน!`
- 2725: `ぜんぶで ${countWords[countTotal]}！` → `` `ぜんぶで ${countWords[countTotal]}！` ``（数字の読みなのでタイ語不要。ただし「ぜんぶで」の部分に注釈を入れてもよい）

#### シール関連（2757, 2767行）

- 2757: `` `${stickerData.count}こ あつめたよ！` `` → `` `${stickerData.count}こ あつめたよ！ สะสมได้ ${stickerData.count} อัน!` ``
- 2767: `シール ゲット！` → `シール ゲット！<br><span style="font-size:0.7em;opacity:0.7">ได้สติ๊กเกอร์!</span>`

#### alert（2437, 2903, 2917行）

- 2437: `alert('マイクが使えません。設定を確認してください。\nใช้ไมค์ไม่ได้ กรุณาตรวจสอบการตั้งค่า');`
- 2903: `alert('ろくおんできませんでした\nอัดเสียงไม่ได้');`
- 2917: `alert('マイクが使えません。\nブラウザの設定でマイクを許可してください。\n\nใช้ไมค์ไม่ได้ กรุณาอนุญาตไมค์ในการตั้งค่าเบราว์เซอร์');`

---

### ファイル2: camera.html — HTML部分

#### メタ情報
| 行 | 現状 | 修正 |
|---|---|---|
| 6 | `<title>ことばカメラ</title>` | `<title>ことばカメラ กล้องคำศัพท์</title>` |
| 9 | `<meta content="ことばカメラ">` | そのまま |

#### メニュー画面（371-407行）

| 行 | 現状 | 修正 |
|---|---|---|
| 375 | `ことばカメラ` | `ことばカメラ <span style="font-size:0.7em;opacity:0.6">กล้องคำศัพท์</span>` |
| 379 | `ことばを あつめよう！` | JS側で動的更新されるのでJS側で対応 |
| 413 | `📷 パシャ！` | `📷 パシャ！ <span style="font-size:0.65em;opacity:0.6">ถ่ายรูป!</span>` |
| 455 | `👆 タッチ！` | `👆 タッチ！ <span style="font-size:0.65em;opacity:0.6">แตะ!</span>` |
| 467 | `📖 ことばずかん` | `📖 ことばずかん <span style="font-size:0.65em;opacity:0.6">สมุดคำศัพท์</span>` |
| 480 | `🎵 どっち？` | `🎵 どっち？ <span style="font-size:0.65em;opacity:0.6">อันไหน?</span>` |

#### パシャ画面（409-448行）

| 行 | 現状 | 修正 |
|---|---|---|
| 419 | `ここを おして<br>しゃしんを とろう！` | `ここを おして<br>しゃしんを とろう！<br><span class="thai-sub">กดที่นี่ แล้วถ่ายรูป!</span>` |
| 424 | `うーん、なんだろう…` | `うーん、なんだろう…<br><span class="thai-sub">อืม อะไรนะ...</span>` |
| 428 | `alt="とった しゃしん"` | `alt="とった しゃしん / รูปที่ถ่าย"` |
| 433 | `🔊 にほんご` | `🔊 にほんご<br><span style="font-size:0.65em">ญี่ปุ่น</span>` |
| 434 | `🔊 タイご` | `🔊 タイご<br><span style="font-size:0.65em">ไทย</span>` |
| 438 | `📷 もういっかい` | `📷 もういっかい<br><span class="thai-sub">อีกครั้ง</span>` |
| 439 | `📖 ずかん` | `📖 ずかん<br><span class="thai-sub">สมุดคำศัพท์</span>` |
| 445 | `もういちど<br>とってみよう！📷` | `もういちど とってみよう！📷<br><span class="thai-sub">ลองถ่ายอีกครั้ง!</span>` |
| 446 | `もういっかい` | `もういっかい<br><span class="thai-sub">อีกครั้ง</span>` |

#### ずかん画面（463-474行）

| 行 | 現状 | 修正 |
|---|---|---|
| 470 | `🌟 ぜんぶ` | `🌟 ぜんぶ <span style="font-size:0.65em;opacity:0.6">ทั้งหมด</span>` |

#### どっち画面（476-485行）

※HTMLテンプレートはJS側で生成されるので、JS側で対応

#### 詳細モーダル（488-499行）

| 行 | 現状 | 修正 |
|---|---|---|
| 496 | `🔊 にほんご` | `🔊 にほんご<br><span style="font-size:0.65em">ญี่ปุ่น</span>` |
| 497 | `🔊 タイご` | `🔊 タイご<br><span style="font-size:0.65em">ไทย</span>` |

#### CSS追加

camera.htmlの`<style>`内に追加:
```css
.thai-sub { font-size:0.6em; opacity:0.7; font-weight:700; display:block; }
```

---

### ファイル2: camera.html — JavaScript部分

#### メニュー情報（630, 633行）

- 630: `'ことばを あつめよう！'` → `'ことばを あつめよう！ มาสะสมคำศัพท์กัน!'`
- 633: `` `いま ${count} このことば！` `` → `` `いま ${count} このことば！ สะสมได้ ${count} คำ!` ``

#### シールゲット（615行）

- `'シール ゲット！'` → `シール ゲット！<br><span style="font-size:0.7em;opacity:0.7">ได้สติ๊กเกอร์!</span>`（innerHTML使用に変更）

#### パシャ結果メッセージ（722, 725行）

- 722: `'★ ことばずかんに ついかしたよ！'` → `'★ ことばずかんに ついかしたよ！ เพิ่มในสมุดคำศัพท์แล้ว!'`
- 725: `'📷 もう いちど とったよ！'` → `'📷 もう いちど とったよ！ ถ่ายอีกครั้ง!'`

#### タッチカードラベル（862行）

現状: `label.textContent = w.entry.emoji + ' ' + w.entry.ja;`
修正: `label.innerHTML = w.entry.emoji + ' ' + w.entry.ja + '<br><span style="font-size:0.6em;opacity:0.5">' + w.entry.th + '</span>';`

#### タッチカードalt（852行）

現状: `img.alt = w.entry.ja;`
修正: `img.alt = w.entry.ja + ' / ' + w.entry.th;`

#### ずかんカードラベル（1023行）

現状: `label.textContent = z ? entry.ja : '';`
修正: ずかんカードは小さい（4列グリッド）のでタイ語追加は省スペースで:
```js
if (z) {
  label.innerHTML = entry.ja + '<br><span style="font-size:0.7em;opacity:0.5">' + entry.th + '</span>';
} else {
  label.textContent = '';
}
```

#### ずかん空メッセージ（986行）

現状: `'このカテゴリは<br>まだありません'`
修正: `'このカテゴリは<br>まだありません<br><span class="thai-sub">ยังไม่มีหมวดหมู่นี้</span>'`

#### さがしにいこうヒント（1009行）

現状: `entry.emoji + ' ' + entry.ja + '\nをさがしにいこう！📷'`
修正: `entry.emoji + ' ' + entry.ja + '\nをさがしにいこう！📷\n' + entry.th + ' ไปหากัน!'`

#### クイズ不足メッセージ（1094-1101行）

現状のHTML生成を修正:
```js
content.innerHTML = `
  <div class="quiz-not-enough">
    <div class="quiz-ne-icon">📷</div>
    <div style="font-size:1rem;font-weight:800;color:#888;margin-top:8px;">
      まず 2つ いじょうの<br>ことばを さつえいしてね！
      <br><span style="font-size:0.8em;opacity:0.7">ถ่ายรูปคำศัพท์อย่างน้อย 2 คำก่อนนะ!</span>
    </div>
    <button class="quiz-ne-goto" onclick="openPasha()">📷 パシャ！へいく<br><span style="font-size:0.7em;opacity:0.7">ไปถ่ายรูป!</span></button>
  </div>`;
```

#### クイズ問題文（1115行）

現状: `` `🔊「${questionText}」は どっち？` ``
修正: `` `🔊「${questionText}」は どっち？<br><span style="font-size:0.7em;opacity:0.6">อันไหนคือ「${questionText}」?</span>` ``

#### クイズ次へボタン（1118行）

現状: `つぎへ →`
修正: `つぎへ →<br><span style="font-size:0.7em;opacity:0.7">ถัดไป</span>`

#### クイズ選択肢ラベル（1136行）

現状: `lbl.textContent = entry.ja;`
修正:
```js
lbl.innerHTML = entry.ja + '<br><span style="font-size:0.65em;opacity:0.5">' + entry.th + '</span>';
```

#### クイズ正解メッセージ（1156行）

現状: `'すごい！ ' + questionEntry.emoji + ' ' + questionEntry.ja + '！'`
修正: `'すごい！ ' + questionEntry.emoji + ' ' + questionEntry.ja + '！ เก่งมาก!'`

#### クイズ不正解メッセージ（1161行）

現状: `'これは ' + entry.ja + ' だよ！' + questionEntry.ja + ' は こっち！'`
修正: `'これは ' + entry.ja + ' だよ！' + questionEntry.ja + ' は こっち！ นี่คือ ' + entry.th + ' คำตอบคือ ' + questionEntry.th + '!'`

---

### ファイル3: camera-dictionary.js

#### CAMERA_CATEGORIES（628-636行）

`labelThai` フィールドを追加:
```js
const CAMERA_CATEGORIES = [
  { id: "どうぶつ", label: "どうぶつ", labelThai: "สัตว์", icon: "🐾" },
  { id: "たべもの", label: "たべもの", labelThai: "อาหาร", icon: "🍎" },
  { id: "のりもの", label: "のりもの", labelThai: "ยานพาหนะ", icon: "🚗" },
  { id: "おうち",   label: "おうち",   labelThai: "บ้าน", icon: "🏠" },
  { id: "からだ",   label: "からだ",   labelThai: "ร่างกาย", icon: "🖐️" },
  { id: "ふく",     label: "ふく",     labelThai: "เสื้อผ้า", icon: "👕" },
  { id: "おもちゃ", label: "おもちゃ", labelThai: "ของเล่น", icon: "🧸" },
];
```

camera.htmlのずかんカテゴリタブ生成（952行付近）も修正:
```js
btn.innerHTML = c.icon + ' ' + c.label + '<span style="font-size:0.6em;display:block;opacity:0.6">' + (c.labelThai||'') + '</span>';
```
※ `btn.textContent` → `btn.innerHTML` に変更

---

### ファイル4: manifest.json

| 行 | 現状 | 修正 |
|---|---|---|
| 2 | `"name": "にほんご あそぼう！"` | `"name": "にほんご あそぼう！ เรียนภาษาญี่ปุ่น"` |
| 3 | `"short_name": "にほんご"` | そのまま（短いのでOK） |

---

## 品質チェックリスト

実装完了後、**プレビューサーバーで以下を全て確認**してください：

### index.html
- [ ] カテゴリタブ16個全てにタイ語サブラベルが表示されている
- [ ] モードボタン10個全てにタイ語サブラベルが表示されている
- [ ] タブ・ボタンの横スクロールが正常に動作する
- [ ] カードモードのカード表示が崩れていない
- [ ] クイズの2たく/4たく切替・方向切替にタイ語がある
- [ ] クイズのプロンプトにタイ語がある
- [ ] ペアゲームの「のこり N ペア」にタイ語がある
- [ ] かぞえゲームの「タップして かぞえよう」にタイ語がある
- [ ] シールちょうのタイトル・サブタイトルにタイ語がある
- [ ] うたの速度ラベル（ふつう/ゆっくり）にタイ語がある
- [ ] うたのリピートボタン・録音ボタンにタイ語がある
- [ ] マスコットをタップした時の吹き出しにタイ語がある
- [ ] セレブレーション（正解時の画面全体の演出）にタイ語がある
- [ ] 自動再生の「もういっかい」にタイ語がある

### camera.html
- [ ] メニュー画面のタイトル「ことばカメラ」にタイ語がある
- [ ] 各ビューのヘッダーにタイ語がある
- [ ] パシャの撮影ヒントにタイ語がある
- [ ] 認識中メッセージにタイ語がある
- [ ] TTS再生ボタン（にほんご/タイご）にタイ語併記がある
- [ ] 結果画面のアクションボタンにタイ語がある
- [ ] 失敗画面にタイ語がある
- [ ] タッチカードのラベルにタイ語がある
- [ ] ずかんのカテゴリタブにタイ語がある
- [ ] ずかんの「ぜんぶ」タブにタイ語がある
- [ ] ずかんカードのラベルにタイ語がある
- [ ] どっちクイズの不足メッセージにタイ語がある
- [ ] どっちクイズの問題文・正解不正解メッセージにタイ語がある
- [ ] どっちクイズの選択肢にタイ語がある

### 全体
- [ ] レイアウトが崩れていない（タイ語追加でボタンやカードが極端に大きくならない）
- [ ] 既存の機能（TTS再生、カード表示、クイズ、ペア、かぞえ、うた、自動再生）が壊れていない
- [ ] タイ語のフォントサイズが適切（メインラベルより明らかに小さい）
- [ ] タイ語の透明度が適切（邪魔にならないが読める）
