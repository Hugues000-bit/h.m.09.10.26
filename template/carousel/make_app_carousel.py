"""App explainer carousel (Instagram 1080x1350 + TikTok photo mode 1080x1920) from a screenshot of howmuch.live.

Usage: python3 -I make_app_carousel.py <app-screenshot-1920x1080.png> <out_dir>
Only crops of the real app are used (no fake UI). TikTok version shows no alcohol categories.
The list panel is not used: it shows red "expensive" dots next to venue names (rule: never name the priciest place).
"""
import sys, pathlib, base64, io
from PIL import Image
from playwright.sync_api import sync_playwright

src = Image.open(sys.argv[1]).convert("RGB")
out = pathlib.Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
root = pathlib.Path(__file__).resolve().parent.parent
FONTS = root / "public/howmuch/fonts"
HEADLESS = sorted(pathlib.Path("/opt/pw-browsers").glob("chromium_headless_shell-*/chrome-linux/headless_shell"))[-1]

def data_uri(im, scale=1.0):
    if scale != 1.0:
        im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, "PNG")
    return "data:image/png;base64," + base64.b64encode(b.getvalue()).decode()

def font_uri(name):
    return "data:font/woff2;base64," + base64.b64encode((FONTS / name).read_bytes()).decode()

CHIPS = {  # x ranges on the 1920x1080 desktop screenshot, y 57-88
    "Coffee": (136, 210), "Schnitzel": (306, 400), "Pizza": (404, 472), "Burger": (476, 551), "Currywurst": (555, 656),
    "Bratwurst": (660, 754), "French fries": (915, 1030), "Sandwich": (1034, 1121), "Croissant": (1125, 1220),
    "Tea": (1342, 1397), "Juice": (1401, 1469), "Pasta": (1473, 1541),
    "Beer": (70, 132), "Spritzer": (214, 302), "Wine": (758, 820), "Cocktail": (824, 911),
}
ALCOHOL = {"Beer", "Spritzer", "Wine", "Cocktail"}
ORDER_IG = ["Beer", "Coffee", "Spritzer", "Schnitzel", "Pizza", "Burger", "Currywurst", "Wine", "Cocktail", "French fries", "Croissant", "Pasta"]
ORDER_TT = ["Coffee", "Schnitzel", "Pizza", "Burger", "Currywurst", "Bratwurst", "French fries", "Sandwich", "Croissant", "Tea", "Juice", "Pasta"]

MAP_WIDE = src.crop((700, 230, 1460, 900))  # cover: inner districts, lots of pins
MAP_ZOOM = src.crop((880, 380, 1300, 760))
LATEST = src.crop((1648, 838, 1906, 988))
ADD_BTN = src.crop((1664, 8, 1800, 46))

CSS = f"""
@font-face {{ font-family: SG; src: url({font_uri('space-grotesk-latin-700-normal.woff2')}); font-weight: 700; }}
@font-face {{ font-family: SG; src: url({font_uri('space-grotesk-latin-500-normal.woff2')}); font-weight: 500; }}
@font-face {{ font-family: JB; src: url({font_uri('jetbrains-mono-latin-700-normal.woff2')}); font-weight: 700; }}
@font-face {{ font-family: JB; src: url({font_uri('jetbrains-mono-latin-500-normal.woff2')}); font-weight: 500; }}
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{ background: #0A0A0A; color: #E6E6E6; font-family: SG; overflow: hidden;
  background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
  background-size: 60px 60px; }}
.page {{ position: relative; width: 1080px; padding: 70px 80px; display: flex; flex-direction: column; }}
.top {{ display: flex; justify-content: space-between; font-family: JB; font-size: 28px; letter-spacing: 2px; }}
.brand {{ color: #00FF80; font-weight: 700; }} .count {{ color: #8C8C8C; }}
.label {{ font-family: JB; font-weight: 700; font-size: 30px; letter-spacing: 5px; color: #00FF80; margin-top: 50px; }}
h1 {{ font-weight: 700; font-size: 92px; line-height: 1.04; letter-spacing: -3px; margin-top: 14px; }}
h1 em {{ font-style: normal; color: #00FF80; text-shadow: 0 0 28px rgba(0,255,128,0.35); }}
.de {{ font-weight: 500; font-size: 38px; color: #8C8C8C; margin-top: 16px; line-height: 1.25; }}
.media {{ margin-top: 44px; border-radius: 28px; overflow: hidden; border: 2px solid #262626; box-shadow: 0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(0,255,128,0.08); background: #fff; }}
.media img {{ display: block; width: 100%; }}
.legend {{ display: flex; gap: 34px; margin-top: 30px; font-family: JB; font-weight: 700; font-size: 30px; }}
.dot {{ display: inline-block; width: 26px; height: 26px; border-radius: 50%; margin-right: 12px; vertical-align: -4px; }}
.chips {{ margin-top: 48px; display: flex; flex-wrap: wrap; gap: 22px; }}
.chips img {{ height: 93px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); }}
.steps {{ margin-top: 44px; display: flex; flex-direction: column; gap: 26px; }}
.step {{ display: flex; align-items: center; gap: 28px; font-weight: 700; font-size: 46px; }}
.num {{ font-family: JB; color: #0A0A0A; background: #00FF80; width: 66px; height: 66px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; flex: none; }}
.step small {{ display: block; font-weight: 500; font-size: 30px; color: #8C8C8C; }}
.stat {{ display: flex; gap: 30px; margin-top: 40px; }}
.stat div {{ flex: 1; border: 2px solid #262626; border-radius: 22px; padding: 26px 28px; background: #121212; }}
.stat b {{ display: block; font-family: JB; font-size: 64px; color: #00FF80; }}
.stat span {{ font-size: 28px; color: #8C8C8C; }}
.cta {{ font-weight: 700; font-size: 110px; color: #00FF80; text-shadow: 0 0 30px rgba(0,255,128,0.45); letter-spacing: -3px; margin-top: 60px; }}
.send {{ font-weight: 700; font-size: 46px; margin-top: 40px; }}
.foot {{ position: absolute; left: 80px; right: 80px; bottom: 60px; display: flex; justify-content: space-between; font-family: JB; font-size: 26px; color: #8C8C8C; }}
.swipe {{ color: #FFD91A; font-weight: 700; }}
"""

def slides(tt):
    chips = ORDER_TT if tt else ORDER_IG
    chip_html = "".join(f'<img src="{data_uri(src.crop((x0, 57, x1, 88)), 3)}">' for c in chips for (x0, x1) in [CHIPS[c]] if not (tt and c in ALCOHOL))
    what = "Kaffee, Schnitzel, Pizza, Burger …" if tt else "Krügerl, Kaffee, Schnitzel, Spritzer …"
    s = []
    mh = 900 if tt else 600
    s.append(("VIENNA · WIEN", "Vienna's <em>real</em><br>price map.", "Wiens echte Preis-Karte. Von Gästen, nicht von Werbung.",
              f'<div class="media"><img style="height:{mh}px;object-fit:cover" src="{data_uri(MAP_WIDE)}"></div>', True))
    s.append(("THE MAP · DIE KARTE", "Every dot is<br>a <em>real</em> price.", "Jeder Punkt ist ein echter Preis.",
              f'<div class="media"><img style="height:{mh - 70}px;object-fit:cover" src="{data_uri(MAP_ZOOM)}"></div>'
              '<div class="legend"><span><i class="dot" style="background:#12A15A"></i>cheap</span><span><i class="dot" style="background:#DAA60B"></i>mid</span>'
              '<span><i class="dot" style="background:#fff;border:7px solid #E61A80"></i>pricey</span></div>', False))
    s.append(("WHAT · WAS", "Pick what<br>you're <em>after</em>.", f"Wähl aus: {what}", f'<div class="chips">{chip_html}</div>', False))
    s.append(("WHO · WER", "Added by <em>people</em>.<br>Not paid for.", "Von Gästen eingetragen. Keine Werbung, kein gekauftes Ranking.",
              f'<div class="media" style="width:640px"><img src="{data_uri(LATEST, 2.5)}"></div>'
              '<div class="stat"><div><b>1 400+</b><span>prices on the map</span></div><div><b>230+</b><span>places in Vienna</span></div></div>', False))
    s.append(("YOU · DU", "Seen a price?<br><em>Add it.</em>", "Preis gesehen? Trag ihn ein.",
              f'<div style="margin-top:40px"><img src="{data_uri(ADD_BTN, 3)}" style="border-radius:14px;box-shadow:0 10px 30px rgba(230,26,128,0.35)"></div>'
              '<div class="steps"><div class="step"><span class="num">1</span><div>Find the place<small>Lokal suchen</small></div></div>'
              '<div class="step"><span class="num">2</span><div>Type the price, or snap the menu<small>Preis eintippen oder Karte fotografieren</small></div></div>'
              '<div class="step"><span class="num">3</span><div>Done. 20 seconds.<small>Fertig. 20 Sekunden.</small></div></div></div>', False))
    s.append(("YOUR BEZIRK · DEIN BEZIRK", "Is your Bezirk<br><em>on the map</em>?", "Ist dein Bezirk schon drauf?",
              '<div class="cta">howmuch.live</div>'
              f'<div class="de" style="font-family:JB;font-size:30px">{"free · gratis" if tt else "link in bio · Link in Bio · free · gratis"}</div>'
              '<div class="send">📩 Send this to someone<br>who always overpays.</div><div class="de">Schick\'s jemandem, der immer zu viel zahlt.</div>', False))
    return s

def render(tt):
    h = 1920 if tt else 1350
    name = "tt" if tt else "ig"
    ss = slides(tt)
    paths = []
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=str(HEADLESS))
        pg = b.new_page(viewport={"width": 1080, "height": h})
        for i, (label, head, de, media, first) in enumerate(ss, 1):
            pad = "padding-top:150px;" if tt else ""
            html = f"""<html><head><meta charset="utf-8"><style>{CSS}</style></head><body><div class="page" style="height:{h}px;{pad}">
<div class="top"><span class="brand">HOW MUCH?!</span><span class="count">{i}/{len(ss)}</span></div>
<div class="label">{label}</div><h1>{head}</h1><div class="de">{de}</div>{media}
<div class="foot"><span>howmuch.live</span>{'<span class="swipe">swipe →</span>' if i < len(ss) else '<span></span>'}</div></div></body></html>"""
            pg.set_content(html); pg.wait_for_timeout(250)
            f = out / f"app-{name}-{i}.png"; pg.screenshot(path=str(f)); paths.append(f)
        b.close()
    return paths

print([str(x) for x in render(False) + render(True)])
