"""Turns an HTML graphic into PNG files with Playwright (Chromium). Python version of render.mjs.

Usage: python render.py <file.html> <out-dir> [width] [height] [--scale=2]
One PNG per element with class "slide" (slide-1.png, slide-2.png ...).
If there is only one slide, or none, it writes graphic.png.
Needs: pip install playwright && python -m playwright install chromium
"""
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright


def main() -> None:
    args = sys.argv[1:]
    scale = 1.0
    for a in args:
        if a.startswith("--scale="):
            scale = float(a.split("=", 1)[1])
    pos = [a for a in args if not a.startswith("--")]
    if len(pos) < 2 or not Path(pos[0]).exists():
        sys.exit("Usage: python render.py <file.html> <out-dir> [width] [height] [--scale=2]")
    file, out_dir = Path(pos[0]).resolve(), Path(pos[1])
    width = int(pos[2]) if len(pos) > 2 else 1080
    height = int(pos[3]) if len(pos) > 3 else 1350
    out_dir.mkdir(parents=True, exist_ok=True)

    written = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": width, "height": height}, device_scale_factor=scale)
        page.goto(file.as_uri(), wait_until="networkidle")
        page.evaluate("document.fonts.ready")
        slides = page.query_selector_all(".slide")
        if len(slides) <= 1:
            target = out_dir / "graphic.png"
            (slides[0] if slides else page).screenshot(path=str(target))
            written.append(target)
        else:
            for i, s in enumerate(slides, 1):
                target = out_dir / f"slide-{i}.png"
                s.screenshot(path=str(target))
                written.append(target)
        browser.close()
    print("\n".join(str(t) for t in written))


if __name__ == "__main__":
    main()
