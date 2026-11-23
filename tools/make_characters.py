"""絵本の立ち絵（1024x1536 の透明PNG）を、POS 用の軽い WebP にする。

使い方: python3 tools/make_characters.py <characters フォルダ>
- 全員・全表情で共通の切り抜き範囲を使うので、背丈の違いと足もとの位置はそのまま
- 出力: images/customers/<人物ID>/<表情ID>.webp
"""
import json, sys
from pathlib import Path
from PIL import Image

SRC = Path(sys.argv[1])
OUT = Path(__file__).resolve().parent.parent / 'images' / 'customers'
HEIGHT = 600  # 画面では 300px 前後で出すので 2 倍
manifest = json.loads((SRC / 'manifest.json').read_text())

files = [(c['id'], e, SRC / p) for c in manifest['characters'] for e, p in c['files'].items()]
box = None
for _, _, f in files:
    b = Image.open(f).getchannel('A').getbbox()
    box = b if box is None else (min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3]))
pad = 8
box = (max(0, box[0] - pad), max(0, box[1] - pad), min(1024, box[2] + pad), min(1536, box[3] + pad))
w, h = box[2] - box[0], box[3] - box[1]
size = (round(w * HEIGHT / h), HEIGHT)
print('crop', box, '->', size)
for cid, e, f in files:
    im = Image.open(f).convert('RGBA').crop(box).resize(size, Image.LANCZOS)
    o = OUT / cid / f'{e}.webp'
    o.parent.mkdir(parents=True, exist_ok=True)
    im.save(o, 'WEBP', quality=82, method=6)
print('ok', len(files))
