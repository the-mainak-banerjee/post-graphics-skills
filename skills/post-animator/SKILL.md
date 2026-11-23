---
name: post-animator
description: Turns a finished post graphic (HTML from the post-graphic skill) into a short looping GIF with clean motion, such as a number counting up, points brightening one by one, a focal zoom or a gentle pulse. Use when someone asks to animate a graphic, make it move, or make a GIF for a post.
---

# Post animator

Adds motion to a finished graphic without changing its design or text, then renders a looping GIF that is small enough to post.

Files in this folder:
- `motion-rules.md`: how motion should feel. Read it every time. The person's own requests win.
- `motion.js`: a tiny timeline helper. It gives the page `window.DURATION` and `window.setT(t)`.
- `scripts/setup.mjs`: one-time setup. See "Setup".
- `scripts/animate.mjs` (Node) and `scripts/animate.py` (Python): render the frames and write the GIF. Same options.

## What you need first

- The approved graphic's HTML, usually `graphic.html` from the post-graphic skill. If they only have a PNG, explain that motion needs the HTML version. Offer to rebuild it with post-graphic first, matching the PNG.
- The brand kit, if there is one (see the post-graphic skill for where to find it). Only to keep colours right, nothing else.

## Steps

1. **Ask what should move and in what order**, if they did not say. Suggest a timeline from the graphic: usually the big number or the focal point first, then each point in reading order, then a short hold. Write it in plain words with timings, for example:
   - 0.0 to 1.2 s: "9,000" counts up from 1,000 (ease-out)
   - 1.2 to 2.8 s: points 01, 02, 03 brighten one by one
   - 3.0 to 3.8 s: the profile photo pulses once
   - Hold the final frame for 1.5 s, then loop.
   Wait for their OK.
2. **Build `graphic-anim.html`.** Copy `graphic.html`. Never change its text or design. Only add ids or classes where needed, then paste `motion.js` into a `<script>` at the end of the body and call `Motion.run({...})` with the approved timeline. Count-ups must end on the exact number already in the graphic.
3. **Render:**
   - `node scripts/animate.mjs graphic-anim.html graphic.gif 15 1`, or
   - `python scripts/animate.py graphic-anim.html graphic.gif 15 1`.
   Use the path to this skill's `scripts/` folder. Arguments: fps (default 15), scale (default 1).
4. **Check it yourself.** Render 3 stills (start, middle, end) by calling `setT` at those times with the post-graphic renderer, or look at frames of the GIF. Check that nothing is cut off or overlapping and that the last frame looks exactly like the original graphic. Check that colours do not flicker or speckle while things move.
5. **Check the size.** Keep it under 5 MB. If it is bigger, try in this order: shorter hold, then 12 fps, then scale 0.8. Tell them the final size, length, fps, and which easing you used for each move.
6. **Changes:** edit the timeline in `graphic-anim.html` and re-render. Never start over unless they ask.

Output is a GIF by default. Make an MP4 only if they ask (for example by rendering frames and using ffmpeg if it is available).

## If rendering is not possible

If neither Node nor Python Playwright can run here, deliver `graphic-anim.html` as an HTML artifact or file. Add a play loop that calls `setT` from `requestAnimationFrame`, so they can watch it in a browser. Tell them a GIF needs Claude Code, or a setup where Playwright can run. Never say a GIF exists when it does not.

## Setup (you do it, never the person)

The person may not be technical. Never ask them to type commands. Do it yourself, once:
1. Before the first render on this computer, run `node scripts/setup.mjs` (from this skill's folder). It installs everything into `~/.post-graphics`, shared by all three post-graphics skills, and prints `READY`. Later runs take a second and only check.
2. Tell them in one plain line before it starts: "One-time setup: I'm installing the drawing tool. It takes a minute or two. Please click Allow if Claude asks."
3. If it says Node is missing or too old, use the Python scripts instead. Run `pip install playwright pillow` and `python -m playwright install chromium` yourself.
4. If a render script prints `NOT SET UP`, run the setup and try again.
5. Only if both ways fail, explain in plain words what is missing and use "If rendering is not possible".
