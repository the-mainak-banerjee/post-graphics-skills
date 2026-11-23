# Motion rules

Learned over many rounds of real post GIFs. The person's own requests always win.

## Feel
- Motion serves one goal: pull the eye to the point of the graphic, then let it be read.
- Fewer moves, done well. One focal move, then a calm sequence, then a hold.
- The design never changes. Motion only reveals what is already there. The last frame matches the static graphic exactly.

## Count-ups
- Start from a number with the same number of digits as the end number, never from 0. For example 9,000 starts from 1,000, and 85 starts from 10.
- Fast: about 0.8 to 1.4 seconds.
- Ease-out (fast start, soft landing).
- Fix the number's width before it starts so nothing next to it jumps (motion.js does this).

## Later items
- Items that come later are visible from the start, dimmed (about 25% opacity), and brighten in place when their turn comes.
- Never slide items in, unless the person says "slide in".
- Lines and connectors stay in place, dimmed, like items. Only draw or grow a line if the person asks for it.

## Easing
- Never linear. Pick ease-in, ease-out or ease-in-out to fit the move, and tell the person which one you used:
  - ease-out for things arriving or counting (most moves).
  - ease-in-out for a zoom or a pulse.
  - ease-in only for something leaving.

## Focal moves
- Zoom: sharp and short (0.4 to 0.7 s), from about 1.15× down to 1×. Zoom the focal element, not the whole graphic.
- Pulse: one short nudge (1 → 1.06 → 1) to point at a photo, a button or a number. Not on a loop.
- Small moves inside a card (an icon, a logo, a mic) are fine if they are subtle and asked for.

## Timing
- Total length 4 to 8 seconds, including a hold of 1 to 2 seconds on the final frame before it loops.
- Leave at least 0.2 s between items so each one gets noticed.
- 15 fps by default. 12 fps is fine for slow moves.

## Quality
- One palette for the whole GIF, so colours never shift or flicker between frames (the scripts already do this). If something still speckles while it moves, make the move shorter or keep that colour on screen from the start.
- Photos stay sharp. No blur effects on people.
- Under 5 MB. Shorten the hold, then lower the fps, then lower the scale, in that order.
