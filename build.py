"""Builds one zip per skill in dist/, with the skill folder at the root of each zip (what claude.ai expects)."""
import re
import zipfile
from pathlib import Path

ROOT = Path(__file__).parent
SKILLS = ROOT / "skills"
DIST = ROOT / "dist"
DIST.mkdir(exist_ok=True)

for skill in sorted(p for p in SKILLS.iterdir() if p.is_dir()):
    head = (skill / "SKILL.md").read_text(encoding="utf-8")
    name = re.search(r"^name:\s*(\S+)", head, re.M).group(1)
    if name != skill.name:
        raise SystemExit(f"{skill.name}: folder name must match SKILL.md name ({name})")
    out = DIST / f"{name}.zip"
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for f in sorted(skill.rglob("*")):
            if f.is_file() and "__pycache__" not in f.parts:
                z.write(f, f.relative_to(SKILLS).as_posix())
    print(f"{out.relative_to(ROOT)}  {out.stat().st_size / 1024:.0f} KB")
