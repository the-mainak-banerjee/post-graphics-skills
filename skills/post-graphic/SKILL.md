---
name: post-graphic
description: Makes a social media post graphic (LinkedIn, X, Instagram) as a PNG from the person's own text, in their brand colours and fonts. Explainers, stories, quotes, numbered tips, before/after, timelines. Use when someone asks for a graphic, image, visual or picture for a post. Reads brand-kit.md if there is one; if not, asks 4 quick questions.
---

# Post graphic

Makes one graphic (or a short set) for a social post: designed in HTML, rendered to PNG, checked, then improved round by round.

Files in this folder:
- `rules.md`: design rules. Read it every time. The brand kit wins where they differ.
- `templates/explainer.html`: headline + numbered points in a framed card + small profile bar.
- `templates/story.html`: big number or date, a short line, an optional photo, a 3-step timeline.
- `templates/quote.html`: one strong line in a big card + large profile bar.
- `scripts/setup.mjs`: one-time setup. See "Setup".
- `scripts/render.mjs` and `scripts/render.py`: HTML to PNG (same options).

The templates are starting points, not fixed layouts. Change the layout freely to fit the content, but keep the base styles (tokens, background, frame, shadows, profile bar).

## Step 1: Get the brand kit

Look in this order and use the first one found:
1. A `brand-kit.md` attached to this chat or in the project's knowledge files.
2. On a computer with a file system (Claude Code): `./brand-kit.md`, then `~/.claude/brand-kit.md`.

**If there is no kit**, do not stop. Ask these 4 questions in one message:
1. Your name and what you do (for the profile bar)? Add a handle if you want it shown.
2. Your brand colours as hex codes (a primary and an accent)? Or describe a mood and I will suggest some.
3. Light or dark style?
4. Heading and body font from Google Fonts? (If you are not sure: Poppins + Inter.)

Use the defaults in `rules.md` for everything else (portrait 1080 × 1350, grid pattern, no photo). Build the CSS tokens the way the post-brand-kit skill describes: a very light tint of the primary for the background, white cards, a contrast check. After the graphic is done, offer once: "Want me to save these answers as your brand kit, so I don't ask next time? The post-brand-kit skill can also do a full setup."

## Step 2: Get the content

- The text comes **only** from the person: their post, draft or notes. Never invent claims, numbers, quotes, names or results. If a number or fact would make it stronger, ask for it.
- Ask, if they did not say:
  - Which format fits? Suggest one: explainer (steps, tips, lists), story (a moment, a number, a before/after) or quote (one strong line).
  - Size: their kit default unless they say otherwise.
  - "Should I use your own photo in this graphic?" If yes, use a photo they share or one named in the kit. If they have screenshots for the post (comments, results, DMs), ask for them and put each in a clean card.
- Never put another person's face, logo or brand on the graphic unless they confirm they have the right to use it (for example a screenshot of a comment on their own post).

## Step 3: Show the plan first

Before building, show a short plan in plain words:
- Format and size.
- The exact text for each part (headline, each point, labels), cut down from their post. Graphics hold fewer words than posts: one idea per block, at most 8 blocks, most graphics need 3 to 5.
- Where the photo or screenshots go, if any.
- The one thing that should catch the eye first.

Wait for their OK. Change the plan if they ask.

## Step 4: Build and render

1. Copy the template into the working folder as `graphic.html`. Name the output folder `<YYYY-MM-DD>-<short-topic>/` if they have no folder of their own.
2. Replace the BRAND TOKENS block with the kit's CSS tokens, and the FONT LINK with the kit's Google Fonts link. Set `data-pattern` from the kit. For square size, add class `square` to `<body>`.
3. Put in the approved text. Copy photos and screenshots next to `graphic.html` and reference them by file name.
4. Render:
   - `node scripts/render.mjs graphic.html <out-dir> 1080 1350` (use 1080 1080 for square), or
   - `python scripts/render.py graphic.html <out-dir> 1080 1350`.
   Use the path to this skill's `scripts/` folder. If neither works, see "If rendering is not possible".

## Step 5: Check it yourself before showing it

Open the PNG and look at it. Fix and re-render until all of these are true:
- No text is cut off, overlapping, or running into the margin.
- Nothing is smaller than 26 px. The headline is at least 80 px (at least 64 px on square if it would not fit).
- Text contrast is readable on every background it sits on.
- Margins are at least 90 px. Nothing feels crowded: if it does, cut words, don't shrink text.
- The background has its pattern, corner shapes and frame. It is not plain.
- Photos are not stretched, blurred or edited (crop, resize and position only).
- It looks like a designed post, not a generic AI image (see the list in `rules.md`).

Then show it with one line on what it is and the file path.

## Step 6: Changes

When they ask for changes, edit `graphic.html` and re-render. Never start over unless they ask. Keep each version (`graphic-v2.png` and so on) only if they want to compare.

If they want it to move, hand off to the **post-animator** skill with this `graphic.html`.

## If rendering is not possible

If neither Node nor Python Playwright can run here, deliver `graphic.html` as an HTML artifact or file and tell them: "Open it in Chrome, press F12, then Ctrl/Cmd+Shift+P and run 'Capture full size screenshot'. Or install the skill in Claude Code to get PNGs automatically." Never say a PNG exists when it does not.

## Setup (you do it, never the person)

The person may not be technical. Never ask them to type commands. Do it yourself, once:
1. Before the first render on this computer, run `node scripts/setup.mjs` (from this skill's folder). It installs everything into `~/.post-graphics`, shared by all three post-graphics skills, and prints `READY`. Later runs take a second and only check.
2. Tell them in one plain line before it starts: "One-time setup: I'm installing the drawing tool. It takes a minute or two. Please click Allow if Claude asks."
3. If it says Node is missing or too old, use the Python scripts instead. Run `pip install playwright pillow` and `python -m playwright install chromium` yourself.
4. If a render script prints `NOT SET UP`, run the setup and try again.
5. Only if both ways fail, explain in plain words what is missing and use "If rendering is not possible".
