"""Turns an animated HTML graphic into an endlessly looping GIF. Python version of animate.mjs.

Usage: python animate.py <animated.html> <out.gif> [fps] [scale]
The HTML must define window.DURATION (seconds) and window.setT(t), which sets the exact state at time t.
The size is read from the page body. All frames share one palette, so colours never flicker.
Needs: pip install playwright pillow && python -m playwright install chromium
"""
import io
import sys
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright


def main() -> None:
    args = sys.argv[1:]
    if len(args) < 2 or not Path(args[0]).exists():
        sys.exit("Usage: python animate.py <animated.html> <out.gif> [fps] [scale]")
    file, out = Path(args[0]).resolve(), Path(args[1])
    fps = float(args[2]) if len(args) > 2 else 15.0
    scale = float(args[3]) if len(args) > 3 else 1.0

    shots = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1080, "height": 1350}, device_scale_factor=scale)
        page.goto(file.as_uri(), wait_until="networkidle")
        page.evaluate("document.fonts.ready")
        w, h = page.evaluate("[document.body.offsetWidth, document.body.offsetHeight]")
        page.set_viewport_size({"width": w, "height": h})
        if page.evaluate("typeof window.setT") != "function":
            sys.exit("The page has no window.setT(t). See motion.js in this skill.")
        duration = page.evaluate("window.DURATION")
        frames = round(duration * fps)
        for i in range(frames):
            page.evaluate("(t) => window.setT(t)", i / fps)
            shots.append(Image.open(io.BytesIO(page.screenshot())).convert("RGB"))
        browser.close()

    # One palette for the whole GIF, built from a sample of every frame,
    # so colours that only appear mid-motion get their own entries.
    thumb_w, thumb_h = max(1, shots[0].width // 4), max(1, shots[0].height // 4)
    sheet = Image.new("RGB", (thumb_w, thumb_h * len(shots)))
    for i, s in enumerate(shots):
        sheet.paste(s.resize((thumb_w, thumb_h), Image.NEAREST), (0, i * thumb_h))
    palette = sheet.quantize(colors=256, method=Image.Quantize.MEDIANCUT)
    indexed = [s.quantize(palette=palette, dither=Image.Dither.NONE) for s in shots]

    indexed[0].save(
        out, save_all=True, append_images=indexed[1:], loop=0,
        duration=round(1000 / fps), disposal=1, optimize=False,
    )
    print(f"{len(indexed)} frames, {out.stat().st_size / 1048576:.2f} MB -> {out}")


if __name__ == "__main__":
    main()
