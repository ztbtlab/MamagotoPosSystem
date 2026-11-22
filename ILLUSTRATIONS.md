# イラスト生成プロンプト

今は絵文字で表示しています。イラストを作ったら `images/` フォルダに下のファイル名で置き、
`app.js` の `PRODUCTS` の `img` に `'images/ファイル名'` を書けば差し替わります
（ファイルを置いてもらえれば、こちらで差し替えます）。

## 共通ルール

- 形式: PNG、**背景透過**
- サイズ: **512 × 512 px**（正方形、余白は四方に1割くらい）
- 1枚に1つだけ描く、文字は入れない、影は付けないか ごく薄く

### 共通スタイル（各プロンプトの頭に付けてください）

```
A cute, kawaii-style illustration for a children's pretend-play cake shop app.
Soft pastel colors (pink, cream, mint, light yellow), thick rounded brown outlines,
simple flat shapes with gentle shading, a tiny glossy highlight, friendly and appetizing.
Single object centered, front 3/4 view, transparent background, no text, no shadow,
square 512x512, plenty of padding around the object.
```

## 商品（19枚）

| ファイル名 | 商品 | プロンプト（共通スタイルの後に続ける） |
| --- | --- | --- |
| `shortcake.png` | ショートケーキ | A slice of strawberry shortcake with white whipped cream, sponge layers, and one big red strawberry on top. |
| `birthday.png` | ホールケーキ | A whole round birthday cake with white cream, strawberries around the top, and three colorful candles with little flames. |
| `cupcake.png` | カップケーキ | A cupcake in a pink striped paper cup with swirly pink frosting, rainbow sprinkles, and a cherry on top. |
| `choco.png` | チョコケーキ | A slice of chocolate cake with dark chocolate frosting, chocolate drizzle, and a small chocolate plate decoration. |
| `pudding.png` | プリン | A Japanese custard pudding (purin) on a small white plate, caramel sauce on top, with a dollop of cream and a cherry. |
| `donut.png` | ドーナツ | A ring donut with pink strawberry glaze and colorful sprinkles. |
| `cookie.png` | クッキー | Two round cookies stacked, one chocolate chip and one heart-shaped with pink icing. |
| `pie.png` | アップルパイ | A whole apple pie with a golden lattice crust and a little apple beside it. |
| `strawberry.png` | いちご | Two shiny red strawberries with green leaves. |
| `icecream.png` | ソフトクリーム | A soft-serve vanilla ice cream swirl in a waffle cone. |
| `juice.png` | ジュース | A small juice box with a straw, decorated with an orange and apple pattern. |
| `tea.png` | こうちゃ | A cup of black tea with a saucer, a lemon slice, and gentle steam curls. |
| `banana.png` | ばなな | A small bunch of three ripe yellow bananas with green tips and tiny brown stems. |
| `grape.png` | ぶどう | A bunch of round purple grapes with a green leaf and a curly vine. |
| `babystar.png` | ベビースター | A small snack bag spilling crunchy, golden fried mini noodle snack pieces (no logos, no brand names, plain pastel bag with a star pattern). |
| `monsterck.png` | ラブブクッキー | A cookie shaped like an original mischievous little monster with tall bunny-like ears and a toothy grin, decorated with pastel icing. Original design, not based on any existing character. |
| `chiffon.png` | シフォンケーキ | A fluffy slice of chiffon cake (tall, light golden sponge with an airy texture) with a dollop of whipped cream and a mint leaf. |
| `yakiniku.png` | やきにく | Japanese yakiniku: a few slices of grilled beef with nice grill marks on a small round grill plate, with a little dish of dipping sauce. |
| `muscat.png` | マスカット | A bunch of round, shiny light-green muscat grapes with a green leaf and a curly vine. |

## あると楽しいもの（任意）

| ファイル名 | 用途 | サイズ | プロンプト |
| --- | --- | --- | --- |
| `mascot.png` | はじめの画面のキャラクター | 512×512 透過 | A cheerful little pastry chef character (a round strawberry shortcake with tiny arms, a white chef hat, and a big smile) waving hello. |
| `icon-180.png` | iPad ホーム画面のアイコン | 180×180、**背景あり（透過なし）**、角丸は不要 | A strawberry shortcake slice centered on a solid pastel pink (#FFD6E4) background, app icon style. |
