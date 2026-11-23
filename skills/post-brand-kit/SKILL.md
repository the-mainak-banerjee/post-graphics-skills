---
name: post-brand-kit
description: Creates, updates or previews a personal brand kit (colours, fonts, style, background pattern, profile bar, do's and don'ts) saved as brand-kit.md, which the post-graphic and post-animator skills read. Use when someone says "set up my brand kit", "change my brand colours/fonts", "update my brand kit", "show my brand kit", or before making their first social media graphic.
---

# Brand kit

One file, `brand-kit.md`, holds everything about how someone's graphics look. The post-graphic and post-animator skills read it. This skill creates it, updates it and shows a preview of it.

Files in this folder:
- `brand-kit-template.md`: the exact format to fill. Never change its section names, because the other skills look for them.
- `preview.html`: a one-page preview of a kit (swatches, fonts, sample card, profile bar, background).
- `scripts/setup.mjs`: one-time setup. See "Setup".
- `scripts/render.mjs` (Node + Playwright) and `scripts/render.py` (Python + Playwright): turn an HTML file into a PNG.

## Pick the mode

- **Create**: no kit exists yet, or they want to start over.
- **Update**: they want to change one part ("make my accent green", "add a dark style", "new photo").
- **Show**: they want to see their kit.

## Find an existing kit

Look in this order and use the first one found:
1. A `brand-kit.md` attached to this chat or in the project's knowledge files.
2. On a computer with a file system (Claude Code): `./brand-kit.md`, then `~/.claude/brand-kit.md`.

If there is none and they asked to update or show, say so and offer to create one.

## Create: the interview

Ask one question at a time. Keep it friendly and short. Offer the suggestion in brackets when they are unsure. Never guess an answer they did not give: use the suggestion only when they say "you pick" or "skip".

1. **Name and what you do.** Shown in the profile bar. Example: "Priya Rao, I help founders write on LinkedIn." Ask for their handle too, if they want it shown.
2. **Brand colours.** One primary and one accent, as hex codes. If they have none, ask for a mood (calm, bold, warm, techy) and suggest 3 palettes of 2 colours each, then let them pick.
3. **Style.** Light, dark, or both. Light is easier to read in a feed. (Suggest light.)
4. **Fonts.** A heading font and a body font from Google Fonts. (Suggest Poppins + Inter.) Sans-serif or serif is their call, but tell them only Google Fonts render reliably.
5. **Default size.** Portrait 1080 × 1350 (takes the most feed space), square 1080 × 1080, or both. (Suggest portrait.)
6. **Profile photo.** Optional. If they share one, it is used only for the profile bar and is never edited: crop, resize and position only.
7. **Background pattern.** Grid, dots, diagonal lines, or soft shapes. The background is never plain. (Suggest grid.)
8. **Do's and don'ts.** Anything they always or never want. Example: "No emojis", "Always show my handle", "Never use red". Also ask if they have up to 3 graphics they like, for style only. Write one line per reference on what they like and dislike about it. Never copy a reference's text, faces or logos.

Then build the colour set from their answers:
- Light style: the background is a very light tint of the primary (about 4% primary on white, for example `#F6F8FC` for a blue). Cards are `#FFFFFF` with a border that is a light tint of the primary. Text is a near-black with a hint of the primary. Muted text is a mid grey-blue or grey-warm that matches.
- Dark style: background near-black (`#0A0A0A` to `#111827`), cards one step lighter, white text, muted text about 65% white.
- Check contrast: text on background and on cards at least 4.5:1, headline accent words at least 3:1. If a brand colour fails on the background, use it for shapes and pills, and use a darker shade for text. Tell them when you do this.
- Pattern line colour: the primary at 8 to 10% opacity. Corner shapes: a light tint of the primary.

Fill `brand-kit-template.md` exactly, including the CSS token block. Show them a short summary, then go to **Show**.

## Update

1. Read the current kit.
2. Change only what they asked for. If a colour changes, recheck contrast and update the CSS token block to match.
3. Add one line to the "Change log" section at the bottom with the date and what changed.
4. Show them the before and after for what changed, then offer a preview.

## Show

1. Copy `preview.html` next to the kit, paste the kit's CSS token block where marked, and fill the name, role and photo.
2. Render it: `node scripts/render.mjs preview.html <out-dir> 1080 1350`, or `python scripts/render.py preview.html <out-dir> 1080 1350` if Node is not available. If neither works, see "If rendering is not possible" below.
3. Look at the PNG yourself. Check that the text is readable and the colours match the kit. Fix it before showing it.

## Save the kit

- **Claude Code or any setup with a file system:** save as `./brand-kit.md` if they are in a project folder, or `~/.claude/brand-kit.md` for all projects. Ask which one the first time.
- **claude.ai or the Claude app:** files do not carry over between chats. Give them `brand-kit.md` as a file to download, and tell them, in one short message:
  "Add this file to a Claude Project's knowledge (best: every chat in that project will have it), or attach it whenever you ask for a graphic."

## If rendering is not possible

If Node and Python Playwright are both missing and cannot be installed, show the preview HTML directly as an HTML artifact or file so they can open it in a browser. Never pretend a PNG was made.

## Setup (you do it, never the person)

The person may not be technical. Never ask them to type commands. Do it yourself, once:
1. Before the first render on this computer, run `node scripts/setup.mjs` (from this skill's folder). It installs everything into `~/.post-graphics`, shared by all three post-graphics skills, and prints `READY`. Later runs take a second and only check.
2. Tell them in one plain line before it starts: "One-time setup: I'm installing the drawing tool. It takes a minute or two. Please click Allow if Claude asks."
3. If it says Node is missing or too old, use the Python scripts instead. Run `pip install playwright pillow` and `python -m playwright install chromium` yourself.
4. If a render script prints `NOT SET UP`, run the setup and try again.
5. Only if both ways fail, explain in plain words what is missing and use "If rendering is not possible".
