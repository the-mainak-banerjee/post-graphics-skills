/* motion.js: tiny timeline for animated post graphics.
   Paste this whole file into a <script> at the end of graphic-anim.html (or load it with <script src="motion.js">),
   then call Motion.run({...}). It defines window.DURATION and window.setT(t), which animate.mjs / animate.py use.

   setT(t) sets the exact state at time t, so every frame is exact and there are no CSS timers.

   Example:
   Motion.run({
     duration: 5,          // seconds of motion
     hold: 1.5,            // extra seconds holding the final frame before the loop restarts
     steps: [
       { el: '#big-number', type: 'count', from: 1000, to: 9000, start: 0, end: 1.2, ease: 'out' },
       { el: '.point:nth-of-type(1)', type: 'brighten', start: 1.2, end: 1.6 },
       { el: '.point:nth-of-type(2)', type: 'brighten', start: 1.8, end: 2.2 },
       { el: '.photo', type: 'pulse', start: 3, end: 3.8 },
     ],
   });

   Step types
   - count:    number counts from `from` to `to`. Keeps the separators of the final text (9,000 / 9.000 / 9k is not supported: use the plain number).
               Optional `prefix`, `suffix`. The box width is fixed after fonts load, so nothing jumps.
   - brighten: element is visible but dimmed (opacity `dim`, default 0.25) until its turn, then brightens to 1.
   - fade:     opacity 0 -> 1. Use only when the person asks for things to appear.
   - grow:     a line or bar grows from 0 to full width (`axis: 'x'`) or height (`axis: 'y'`). Only when asked.
   - zoom:     scale from `from` (default 1.15) to 1, sharp and quick, for a focal point.
   - pulse:    scale 1 -> `to` (default 1.06) -> 1, a short nudge to pull the eye.
   - slide:    moves in from `dx`/`dy` pixels. Only when the person says "slide in".
   ease: 'in' | 'out' | 'inout' (default 'out'). Never linear.
*/
(function () {
  const ease = {
    in: (x) => x * x * x,
    out: (x) => 1 - Math.pow(1 - x, 3),
    inout: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  };
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const prog = (t, s) => clamp((t - s.start) / Math.max(0.0001, s.end - s.start));

  function fmt(n, template) {
    // Copy the thousands separator used in the final text, if any.
    const sep = /\d([,.\s ])\d{3}/.exec(template);
    const s = String(Math.round(n));
    return sep ? s.replace(/\B(?=(\d{3})+(?!\d))/g, sep[1]) : s;
  }

  function prepare(step) {
    step.nodes = Array.from(document.querySelectorAll(step.el));
    if (!step.nodes.length) console.warn('motion.js: nothing matches', step.el);
    step.f = ease[step.ease || 'out'];
    if (step.type === 'count') {
      step.nodes.forEach((n) => {
        n._final = n.textContent.trim();
        const r = n.getBoundingClientRect();
        n.style.display = 'inline-block';
        n.style.minWidth = r.width + 'px';
        n.style.fontVariantNumeric = 'tabular-nums';
      });
    }
  }

  function apply(step, t) {
    const p = step.f(prog(t, step));
    step.nodes.forEach((n) => {
      switch (step.type) {
        case 'count': {
          const v = step.from + (step.to - step.from) * p;
          n.textContent = p >= 1 ? n._final : (step.prefix || '') + fmt(v, n._final) + (step.suffix || '');
          break;
        }
        case 'brighten': { const d = step.dim ?? 0.25; n.style.opacity = d + (1 - d) * p; break; }
        case 'fade': n.style.opacity = p; break;
        case 'grow': n.style.transformOrigin = step.axis === 'y' ? 'bottom' : 'left';
          n.style.transform = step.axis === 'y' ? `scaleY(${p})` : `scaleX(${p})`; break;
        case 'zoom': { const s0 = step.from ?? 1.15; n.style.transform = `scale(${s0 + (1 - s0) * p})`; break; }
        case 'pulse': { const top = step.to ?? 1.06; const raw = prog(t, step);
          const k = raw < 0.5 ? ease.out(raw * 2) : 1 - ease.inout((raw - 0.5) * 2);
          n.style.transform = `scale(${1 + (top - 1) * k})`; break; }
        case 'slide': n.style.transform = `translate(${(step.dx || 0) * (1 - p)}px, ${(step.dy || 0) * (1 - p)}px)`; break;
      }
    });
  }

  window.Motion = {
    run(cfg) {
      window.DURATION = (cfg.duration || 4) + (cfg.hold || 0);
      const steps = cfg.steps || [];
      let ready = false;
      window.setT = (t) => {
        if (!ready) { steps.forEach(prepare); ready = true; }
        steps.forEach((s) => apply(s, t));
      };
      document.fonts.ready.then(() => window.setT(0));
    },
  };
})();
