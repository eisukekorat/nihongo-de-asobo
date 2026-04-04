// camera-dictionary.js — カメラことばがくしゅう じしょデータ
// Vision API ラベル → にほんご・タイご マッピング

const CAMERA_DICTIONARY = {
  // ===== どうぶつ =====
  "dog": {
    ja: "いぬ", th: "สุนัข", thRead: "スナック",
    emoji: "🐶", category: "どうぶつ",
    visionAliases: ["dog", "puppy", "canine", "golden retriever", "labrador", "poodle", "shih tzu", "chihuahua"],
    funVoice: "ワンワン！"
  },
  "cat": {
    ja: "ねこ", th: "แมว", thRead: "メーオ",
    emoji: "🐱", category: "どうぶつ",
    visionAliases: ["cat", "kitten", "feline", "tabby", "persian cat"],
    funVoice: "ニャーン！"
  },
  "elephant": {
    ja: "ぞう", th: "ช้าง", thRead: "チャーン",
    emoji: "🐘", category: "どうぶつ",
    visionAliases: ["elephant", "asian elephant", "african elephant"],
    funVoice: "パオーン！"
  },
  "tiger": {
    ja: "とら", th: "เสือ", thRead: "スア",
    emoji: "🐯", category: "どうぶつ",
    visionAliases: ["tiger", "bengal tiger", "siberian tiger"],
    funVoice: "ガオー！"
  },
  "frog": {
    ja: "かえる", th: "กบ", thRead: "コップ",
    emoji: "🐸", category: "どうぶつ",
    visionAliases: ["frog", "toad", "tree frog"],
    funVoice: "ケロケロ！"
  },
  "fish": {
    ja: "さかな", th: "ปลา", thRead: "プラー",
    emoji: "🐠", category: "どうぶつ",
    visionAliases: ["fish", "goldfish", "tropical fish", "clownfish", "aquarium fish"]
  },
  "monkey": {
    ja: "さる", th: "ลิง", thRead: "リン",
    emoji: "🐒", category: "どうぶつ",
    visionAliases: ["monkey", "primate", "macaque", "chimpanzee"],
    funVoice: "ウキキー！"
  },
  "cow": {
    ja: "うし", th: "วัว", thRead: "ウア",
    emoji: "🐮", category: "どうぶつ",
    visionAliases: ["cow", "cattle", "bull", "dairy cow", "ox"],
    funVoice: "モーモー！"
  },
  "pig": {
    ja: "ぶた", th: "หมู", thRead: "ムー",
    emoji: "🐷", category: "どうぶつ",
    visionAliases: ["pig", "swine", "hog", "piglet"],
    funVoice: "ブーブー！"
  },
  "rabbit": {
    ja: "うさぎ", th: "กระต่าย", thRead: "クラターイ",
    emoji: "🐰", category: "どうぶつ",
    visionAliases: ["rabbit", "bunny", "hare"]
  },
  "lion": {
    ja: "ライオン", th: "สิงโต", thRead: "シントー",
    emoji: "🦁", category: "どうぶつ",
    visionAliases: ["lion", "lioness", "big cat"],
    funVoice: "ガオー！"
  },
  "giraffe": {
    ja: "きりん", th: "ยีราฟ", thRead: "イーラープ",
    emoji: "🦒", category: "どうぶつ",
    visionAliases: ["giraffe"]
  },
  "bear": {
    ja: "くま", th: "หมี", thRead: "ミー",
    emoji: "🐻", category: "どうぶつ",
    visionAliases: ["bear", "teddy bear", "polar bear", "brown bear", "grizzly bear"]
  },
  "bird": {
    ja: "とり", th: "นก", thRead: "ノック",
    emoji: "🐦", category: "どうぶつ",
    visionAliases: ["bird", "sparrow", "pigeon", "parrot", "dove", "swallow"],
    funVoice: "チュンチュン！"
  },
  "turtle": {
    ja: "かめ", th: "เต่า", thRead: "タオ",
    emoji: "🐢", category: "どうぶつ",
    visionAliases: ["turtle", "tortoise", "sea turtle"]
  },
  "horse": {
    ja: "うま", th: "ม้า", thRead: "マー",
    emoji: "🐴", category: "どうぶつ",
    visionAliases: ["horse", "pony", "stallion", "mare"],
    funVoice: "ヒヒーン！"
  },
  "sheep": {
    ja: "ひつじ", th: "แกะ", thRead: "ケー",
    emoji: "🐏", category: "どうぶつ",
    visionAliases: ["sheep", "lamb", "wool"],
    funVoice: "メェー！"
  },
  "chicken": {
    ja: "にわとり", th: "ไก่", thRead: "カイ",
    emoji: "🐔", category: "どうぶつ",
    visionAliases: ["chicken", "rooster", "hen", "chick", "poultry"],
    funVoice: "コケコッコー！"
  },
  "duck": {
    ja: "あひる", th: "เป็ด", thRead: "ペット",
    emoji: "🦆", category: "どうぶつ",
    visionAliases: ["duck", "duckling", "mallard"],
    funVoice: "ガーガー！"
  },
  "butterfly": {
    ja: "ちょうちょ", th: "ผีเสื้อ", thRead: "ピースア",
    emoji: "🦋", category: "どうぶつ",
    visionAliases: ["butterfly", "moth"]
  },
  "ant": {
    ja: "あり", th: "มด", thRead: "モット",
    emoji: "🐜", category: "どうぶつ",
    visionAliases: ["ant", "fire ant"]
  },
  "bee": {
    ja: "はち", th: "ผึ้ง", thRead: "プン",
    emoji: "🐝", category: "どうぶつ",
    visionAliases: ["bee", "honeybee", "bumblebee", "wasp"],
    funVoice: "ブーン！"
  },
  "lizard": {
    ja: "とかげ", th: "จิ้งจก", thRead: "チンチョック",
    emoji: "🦎", category: "どうぶつ",
    visionAliases: ["lizard", "gecko", "iguana", "chameleon"]
  },
  "shark": {
    ja: "サメ", th: "ฉลาม", thRead: "チャラーム",
    emoji: "🦈", category: "どうぶつ",
    visionAliases: ["shark", "great white shark"]
  },
  "dolphin": {
    ja: "イルカ", th: "โลมา", thRead: "ローマー",
    emoji: "🐬", category: "どうぶつ",
    visionAliases: ["dolphin", "porpoise"]
  },
  "whale": {
    ja: "くじら", th: "ปลาวาฬ", thRead: "プラーワーン",
    emoji: "🐳", category: "どうぶつ",
    visionAliases: ["whale", "blue whale", "humpback whale"]
  },

  // ===== たべもの =====
  "apple": {
    ja: "りんご", th: "แอปเปิ้ล", thRead: "アップポン",
    emoji: "🍎", category: "たべもの",
    visionAliases: ["apple", "red apple", "green apple"]
  },
  "banana": {
    ja: "バナナ", th: "กล้วย", thRead: "クルアイ",
    emoji: "🍌", category: "たべもの",
    visionAliases: ["banana", "plantain"]
  },
  "rice": {
    ja: "ごはん", th: "ข้าว", thRead: "カーオ",
    emoji: "🍚", category: "たべもの",
    visionAliases: ["rice", "cooked rice", "white rice", "fried rice", "jasmine rice"]
  },
  "cake": {
    ja: "ケーキ", th: "เค้ก", thRead: "ケーク",
    emoji: "🍰", category: "たべもの",
    visionAliases: ["cake", "birthday cake", "cheesecake", "chocolate cake"]
  },
  "ice cream": {
    ja: "アイスクリーム", th: "ไอศกรีม", thRead: "アイサクリーム",
    emoji: "🍦", category: "たべもの",
    visionAliases: ["ice cream", "gelato", "soft serve ice cream", "ice cream cone"]
  },
  "egg": {
    ja: "たまご", th: "ไข่", thRead: "カイ",
    emoji: "🥚", category: "たべもの",
    visionAliases: ["egg", "fried egg", "boiled egg", "scrambled eggs"]
  },
  "bread": {
    ja: "パン", th: "ขนมปัง", thRead: "カノムパン",
    emoji: "🍞", category: "たべもの",
    visionAliases: ["bread", "toast", "loaf", "baguette", "sandwich bread"]
  },
  "milk": {
    ja: "ぎゅうにゅう", th: "นม", thRead: "ノム",
    emoji: "🥛", category: "たべもの",
    visionAliases: ["milk", "dairy", "glass of milk"]
  },
  "grapes": {
    ja: "ぶどう", th: "องุ่น", thRead: "アグン",
    emoji: "🍇", category: "たべもの",
    visionAliases: ["grapes", "grape", "vineyard fruit"]
  },
  "strawberry": {
    ja: "いちご", th: "สตรอว์เบอร์รี่", thRead: "サトローベリー",
    emoji: "🍓", category: "たべもの",
    visionAliases: ["strawberry", "strawberries"]
  },
  "carrot": {
    ja: "にんじん", th: "แครอท", thRead: "ケアロット",
    emoji: "🥕", category: "たべもの",
    visionAliases: ["carrot", "carrots"]
  },
  "orange": {
    ja: "みかん", th: "ส้ม", thRead: "ソム",
    emoji: "🍊", category: "たべもの",
    visionAliases: ["orange", "mandarin", "tangerine", "clementine", "citrus fruit"]
  },
  "watermelon": {
    ja: "すいか", th: "แตงโม", thRead: "テンモー",
    emoji: "🍉", category: "たべもの",
    visionAliases: ["watermelon"]
  },
  "pizza": {
    ja: "ピザ", th: "พิซซ่า", thRead: "ピッサー",
    emoji: "🍕", category: "たべもの",
    visionAliases: ["pizza", "pizza pie"]
  },
  "corn": {
    ja: "とうもろこし", th: "ข้าวโพด", thRead: "カーオポート",
    emoji: "🌽", category: "たべもの",
    visionAliases: ["corn", "maize", "corn on the cob"]
  },
  "cucumber": {
    ja: "きゅうり", th: "แตงกวา", thRead: "テンクワー",
    emoji: "🥒", category: "たべもの",
    visionAliases: ["cucumber", "gherkin"]
  },
  "cheese": {
    ja: "チーズ", th: "ชีส", thRead: "チーズ",
    emoji: "🧀", category: "たべもの",
    visionAliases: ["cheese", "cheddar", "mozzarella"]
  },
  "hamburger": {
    ja: "ハンバーガー", th: "แฮมเบอร์เกอร์", thRead: "ヘムバーゴー",
    emoji: "🍔", category: "たべもの",
    visionAliases: ["hamburger", "burger", "cheeseburger"]
  },
  "donut": {
    ja: "ドーナツ", th: "โดนัท", thRead: "ドーナット",
    emoji: "🍩", category: "たべもの",
    visionAliases: ["doughnut", "donut"]
  },
  "cookie": {
    ja: "クッキー", th: "คุกกี้", thRead: "クッキー",
    emoji: "🍪", category: "たべもの",
    visionAliases: ["cookie", "cookies", "biscuit"]
  },
  "mango": {
    ja: "マンゴー", th: "มะม่วง", thRead: "マームアン",
    emoji: "🥭", category: "たべもの",
    visionAliases: ["mango", "mangoes"]
  },
  "broccoli": {
    ja: "ブロッコリー", th: "บร็อคโคลี่", thRead: "ブロッコリー",
    emoji: "🥦", category: "たべもの",
    visionAliases: ["broccoli"]
  },
  "peach": {
    ja: "もも", th: "ลูกท้อ", thRead: "ルークトー",
    emoji: "🍑", category: "たべもの",
    visionAliases: ["peach", "nectarine"]
  },

  // ===== のりもの =====
  "car": {
    ja: "くるま", th: "รถยนต์", thRead: "ロットヨン",
    emoji: "🚗", category: "のりもの",
    visionAliases: ["car", "automobile", "vehicle", "sedan", "suv", "taxi cab"],
    funVoice: "ブーン！"
  },
  "bus": {
    ja: "バス", th: "รถบัส", thRead: "ロットバット",
    emoji: "🚌", category: "のりもの",
    visionAliases: ["bus", "school bus", "tour bus", "minibus"]
  },
  "train": {
    ja: "でんしゃ", th: "รถไฟ", thRead: "ロットファイ",
    emoji: "🚂", category: "のりもの",
    visionAliases: ["train", "locomotive", "railway", "railroad", "subway train"],
    funVoice: "ガタンゴトン！"
  },
  "airplane": {
    ja: "ひこうき", th: "เครื่องบิน", thRead: "クルアンビン",
    emoji: "✈️", category: "のりもの",
    visionAliases: ["airplane", "aircraft", "jet", "plane", "airliner"],
    funVoice: "ブーン！"
  },
  "bicycle": {
    ja: "じてんしゃ", th: "จักรยาน", thRead: "チャックラヤーン",
    emoji: "🚲", category: "のりもの",
    visionAliases: ["bicycle", "bike", "cycling", "mountain bike"]
  },
  "fire truck": {
    ja: "しょうぼうしゃ", th: "รถดับเพลิง", thRead: "ロットダッププルン",
    emoji: "🚒", category: "のりもの",
    visionAliases: ["fire truck", "fire engine", "fire vehicle"],
    funVoice: "ウーウー！"
  },
  "ambulance": {
    ja: "きゅうきゅうしゃ", th: "รถพยาบาล", thRead: "ロットパヤーバーン",
    emoji: "🚑", category: "のりもの",
    visionAliases: ["ambulance"],
    funVoice: "ピーポーピーポー！"
  },
  "police car": {
    ja: "パトカー", th: "รถตำรวจ", thRead: "ロットタムルアット",
    emoji: "🚓", category: "のりもの",
    visionAliases: ["police car", "patrol car", "police vehicle"],
    funVoice: "ウーウー！"
  },
  "helicopter": {
    ja: "ヘリコプター", th: "เฮลิคอปเตอร์", thRead: "ヘーリコップター",
    emoji: "🚁", category: "のりもの",
    visionAliases: ["helicopter"],
    funVoice: "バラバラバラ！"
  },
  "boat": {
    ja: "ふね", th: "เรือ", thRead: "ルア",
    emoji: "🚢", category: "のりもの",
    visionAliases: ["boat", "ship", "vessel", "sailboat", "cruise ship", "ferry"],
    funVoice: "ボー！"
  },
  "motorcycle": {
    ja: "バイク", th: "มอเตอร์ไซค์", thRead: "モーターサイ",
    emoji: "🏍️", category: "のりもの",
    visionAliases: ["motorcycle", "motorbike", "scooter", "moped"]
  },
  "truck": {
    ja: "トラック", th: "รถบรรทุก", thRead: "ロットバントゥック",
    emoji: "🚛", category: "のりもの",
    visionAliases: ["truck", "lorry", "semi truck", "pickup truck", "cargo truck"]
  },
  "rocket": {
    ja: "ロケット", th: "จรวด", thRead: "チャルアット",
    emoji: "🚀", category: "のりもの",
    visionAliases: ["rocket", "spacecraft", "space shuttle"],
    funVoice: "ゴゴゴゴー！"
  },
  "tractor": {
    ja: "トラクター", th: "รถแทรกเตอร์", thRead: "ロットテークター",
    emoji: "🚜", category: "のりもの",
    visionAliases: ["tractor", "farm vehicle"]
  },

  // ===== おうち =====
  "door": {
    ja: "ドア", th: "ประตู", thRead: "プラトゥー",
    emoji: "🚪", category: "おうち",
    visionAliases: ["door", "entrance", "doorway", "front door"]
  },
  "window": {
    ja: "まど", th: "หน้าต่าง", thRead: "ナーターン",
    emoji: "🖼️", category: "おうち",
    visionAliases: ["window", "glass window"]
  },
  "chair": {
    ja: "いす", th: "เก้าอี้", thRead: "カーオイー",
    emoji: "🪑", category: "おうち",
    visionAliases: ["chair", "seat", "armchair", "stool"]
  },
  "sofa": {
    ja: "ソファ", th: "โซฟา", thRead: "ソーファー",
    emoji: "🛋️", category: "おうち",
    visionAliases: ["sofa", "couch", "settee", "loveseat"]
  },
  "table": {
    ja: "テーブル", th: "โต๊ะ", thRead: "トッ",
    emoji: "🍽️", category: "おうち",
    visionAliases: ["table", "dining table", "coffee table", "desk"]
  },
  "television": {
    ja: "テレビ", th: "ทีวี", thRead: "ティーウィー",
    emoji: "📺", category: "おうち",
    visionAliases: ["television", "tv", "flat screen", "monitor", "screen"]
  },
  "bed": {
    ja: "ベッド", th: "เตียง", thRead: "ティアン",
    emoji: "🛏️", category: "おうち",
    visionAliases: ["bed", "bedroom", "mattress", "bunk bed"]
  },
  "toilet": {
    ja: "トイレ", th: "ห้องน้ำ", thRead: "ホーンナーム",
    emoji: "🚽", category: "おうち",
    visionAliases: ["toilet", "bathroom", "restroom", "lavatory"]
  },
  "bathtub": {
    ja: "おふろ", th: "อ่างอาบน้ำ", thRead: "アーンアープナーム",
    emoji: "🛁", category: "おうち",
    visionAliases: ["bathtub", "bath", "bathroom sink"]
  },
  "toothbrush": {
    ja: "はぶらし", th: "แปรงสีฟัน", thRead: "プレーンシーファン",
    emoji: "🦷", category: "おうち",
    visionAliases: ["toothbrush"]
  },
  "house": {
    ja: "おうち", th: "บ้าน", thRead: "バーン",
    emoji: "🏠", category: "おうち",
    visionAliases: ["house", "home", "building", "residential building", "cottage"]
  },
  "clock": {
    ja: "とけい", th: "นาฬิกา", thRead: "ナーリカー",
    emoji: "⏰", category: "おうち",
    visionAliases: ["clock", "watch", "alarm clock", "wall clock"]
  },
  "refrigerator": {
    ja: "れいぞうこ", th: "ตู้เย็น", thRead: "トゥーイェン",
    emoji: "🧊", category: "おうち",
    visionAliases: ["refrigerator", "fridge", "freezer"]
  },
  "smartphone": {
    ja: "スマホ", th: "โทรศัพท์", thRead: "トーラサップ",
    emoji: "📱", category: "おうち",
    visionAliases: ["smartphone", "mobile phone", "iphone", "android phone", "cell phone"]
  },
  "laptop": {
    ja: "パソコン", th: "คอมพิวเตอร์", thRead: "コムピウター",
    emoji: "🖥️", category: "おうち",
    visionAliases: ["laptop", "computer", "notebook computer", "macbook"]
  },
  "pan": {
    ja: "フライパン", th: "กระทะ", thRead: "クラタ",
    emoji: "🍳", category: "おうち",
    visionAliases: ["frying pan", "pan", "cookware", "skillet"]
  },
  "spoon": {
    ja: "スプーン", th: "ช้อน", thRead: "チョーン",
    emoji: "🥄", category: "おうち",
    visionAliases: ["spoon", "spoons", "ladle"]
  },
  "fork": {
    ja: "フォーク", th: "ส้อม", thRead: "ソーム",
    emoji: "🍴", category: "おうち",
    visionAliases: ["fork", "cutlery", "silverware"]
  },
  "light bulb": {
    ja: "でんき", th: "ไฟ", thRead: "ファイ",
    emoji: "💡", category: "おうち",
    visionAliases: ["light bulb", "lamp", "light", "ceiling light", "lighting"]
  },

  // ===== からだ =====
  "face": {
    ja: "かお", th: "หน้า", thRead: "ナー",
    emoji: "🙂", category: "からだ",
    visionAliases: ["face", "human face", "facial expression"]
  },
  "eye": {
    ja: "め", th: "ตา", thRead: "ター",
    emoji: "👁️", category: "からだ",
    visionAliases: ["eye", "eyes", "iris", "pupil"]
  },
  "nose": {
    ja: "はな", th: "จมูก", thRead: "チャムーク",
    emoji: "👃", category: "からだ",
    visionAliases: ["nose"]
  },
  "mouth": {
    ja: "くち", th: "ปาก", thRead: "パーク",
    emoji: "👄", category: "からだ",
    visionAliases: ["mouth", "lips", "smile", "teeth"]
  },
  "ear": {
    ja: "みみ", th: "หู", thRead: "フー",
    emoji: "👂", category: "からだ",
    visionAliases: ["ear", "ears"]
  },
  "hand": {
    ja: "て", th: "มือ", thRead: "ムー",
    emoji: "✋", category: "からだ",
    visionAliases: ["hand", "hands", "palm", "finger", "fingers"]
  },
  "foot": {
    ja: "あし", th: "ขา", thRead: "カー",
    emoji: "🦵", category: "からだ",
    visionAliases: ["foot", "feet", "leg", "legs", "ankle"]
  },
  "hair": {
    ja: "かみ", th: "ผม", thRead: "ポム",
    emoji: "💇", category: "からだ",
    visionAliases: ["hair", "hairstyle", "braids", "ponytail"]
  },
  "arm": {
    ja: "うで", th: "แขน", thRead: "ケーン",
    emoji: "💪", category: "からだ",
    visionAliases: ["arm", "elbow", "forearm", "shoulder"]
  },
  "head": {
    ja: "あたま", th: "หัว", thRead: "フア",
    emoji: "🧒", category: "からだ",
    visionAliases: ["head", "skull"]
  },

  // ===== ふく =====
  "t-shirt": {
    ja: "Tシャツ", th: "เสื้อยืด", thRead: "スアユート",
    emoji: "👕", category: "ふく",
    visionAliases: ["t-shirt", "shirt", "top", "tshirt", "polo shirt", "blouse"]
  },
  "pants": {
    ja: "ズボン", th: "กางเกง", thRead: "カーンケン",
    emoji: "👖", category: "ふく",
    visionAliases: ["pants", "trousers", "jeans", "shorts", "slacks"]
  },
  "dress": {
    ja: "ワンピース", th: "เดรส", thRead: "ドレット",
    emoji: "👗", category: "ふく",
    visionAliases: ["dress", "skirt", "gown", "sundress"]
  },
  "socks": {
    ja: "くつした", th: "ถุงเท้า", thRead: "トゥンタオ",
    emoji: "🧦", category: "ふく",
    visionAliases: ["socks", "sock", "stockings"]
  },
  "shoes": {
    ja: "くつ", th: "รองเท้า", thRead: "ローンタオ",
    emoji: "👟", category: "ふく",
    visionAliases: ["shoes", "sneakers", "shoe", "footwear", "boots", "sandals"]
  },
  "hat": {
    ja: "ぼうし", th: "หมวก", thRead: "ムアック",
    emoji: "🧢", category: "ふく",
    visionAliases: ["hat", "cap", "beanie", "helmet", "headwear"]
  },
  "bag": {
    ja: "かばん", th: "กระเป๋า", thRead: "クラパオ",
    emoji: "👜", category: "ふく",
    visionAliases: ["bag", "handbag", "backpack", "purse", "schoolbag"]
  },
  "jacket": {
    ja: "ジャケット", th: "เสื้อแจ็คเก็ต", thRead: "スアジェッケット",
    emoji: "🧥", category: "ふく",
    visionAliases: ["jacket", "coat", "hoodie", "sweater", "sweatshirt"]
  },
  "glasses": {
    ja: "めがね", th: "แว่นตา", thRead: "ウェンター",
    emoji: "👓", category: "ふく",
    visionAliases: ["glasses", "eyeglasses", "spectacles", "sunglasses"]
  },
  "umbrella": {
    ja: "かさ", th: "ร่ม", thRead: "ロム",
    emoji: "☂️", category: "ふく",
    visionAliases: ["umbrella", "parasol"]
  },

  // ===== おもちゃ =====
  "soccer ball": {
    ja: "サッカーボール", th: "ลูกฟุตบอล", thRead: "ルークフットボーン",
    emoji: "⚽", category: "おもちゃ",
    visionAliases: ["soccer ball", "football", "soccer"]
  },
  "basketball": {
    ja: "バスケットボール", th: "ลูกบาสเกตบอล", thRead: "ルークバスケットボーン",
    emoji: "🏀", category: "おもちゃ",
    visionAliases: ["basketball"]
  },
  "stuffed animal": {
    ja: "ぬいぐるみ", th: "ตุ๊กตา", thRead: "トゥックター",
    emoji: "🧸", category: "おもちゃ",
    visionAliases: ["stuffed animal", "plush toy", "teddy bear", "soft toy", "doll"]
  },
  "crayon": {
    ja: "クレヨン", th: "สีเทียน", thRead: "シーティアン",
    emoji: "🖍️", category: "おもちゃ",
    visionAliases: ["crayon", "crayons", "colored pencil"]
  },
  "balloon": {
    ja: "ふうせん", th: "ลูกโป่ง", thRead: "ルークポン",
    emoji: "🎈", category: "おもちゃ",
    visionAliases: ["balloon", "balloons", "air balloon"]
  },
  "puzzle": {
    ja: "パズル", th: "จิ๊กซอว์", thRead: "チックソー",
    emoji: "🧩", category: "おもちゃ",
    visionAliases: ["puzzle", "jigsaw puzzle", "jigsaw"]
  },
  "piano": {
    ja: "ピアノ", th: "เปียโน", thRead: "ピアノ",
    emoji: "🎹", category: "おもちゃ",
    visionAliases: ["piano", "keyboard", "grand piano", "upright piano"]
  },
  "drum": {
    ja: "たいこ", th: "กลอง", thRead: "クローン",
    emoji: "🥁", category: "おもちゃ",
    visionAliases: ["drum", "drums", "drum kit", "percussion"]
  },
  "guitar": {
    ja: "ギター", th: "กีตาร์", thRead: "キーター",
    emoji: "🎸", category: "おもちゃ",
    visionAliases: ["guitar", "acoustic guitar", "electric guitar", "ukulele"]
  },
  "robot": {
    ja: "ロボット", th: "หุ่นยนต์", thRead: "フンヨン",
    emoji: "🤖", category: "おもちゃ",
    visionAliases: ["robot", "toy robot"]
  },
  "block": {
    ja: "つみき", th: "บล็อกตัวต่อ", thRead: "ブロックトゥアトー",
    emoji: "📐", category: "おもちゃ",
    visionAliases: ["block", "building blocks", "toy blocks", "lego", "duplo"]
  },
  "slide": {
    ja: "すべりだい", th: "สไลเดอร์", thRead: "サイドー",
    emoji: "🎢", category: "おもちゃ",
    visionAliases: ["slide", "playground slide", "playground equipment"]
  },
  "swing": {
    ja: "ぶらんこ", th: "ชิงช้า", thRead: "チンチャー",
    emoji: "🎡", category: "おもちゃ",
    visionAliases: ["swing", "playground swing", "swings"]
  },
};

// visionAliases からメインキーへの逆引きマップ（自動生成）
const VISION_LABEL_MAP = {};
for (const [key, entry] of Object.entries(CAMERA_DICTIONARY)) {
  for (const alias of entry.visionAliases) {
    VISION_LABEL_MAP[alias.toLowerCase()] = key;
  }
}

// カテゴリ一覧
const CAMERA_CATEGORIES = [
  { id: "どうぶつ", label: "どうぶつ", labelThai: "สัตว์",      icon: "🐾" },
  { id: "たべもの", label: "たべもの", labelThai: "อาหาร",      icon: "🍎" },
  { id: "のりもの", label: "のりもの", labelThai: "ยานพาหนะ",   icon: "🚗" },
  { id: "おうち",   label: "おうち",   labelThai: "บ้าน",        icon: "🏠" },
  { id: "からだ",   label: "からだ",   labelThai: "ร่างกาย",     icon: "🖐️" },
  { id: "ふく",     label: "ふく",     labelThai: "เสื้อผ้า",    icon: "👕" },
  { id: "おもちゃ", label: "おもちゃ", labelThai: "ของเล่น",     icon: "🧸" },
];
