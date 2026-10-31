/*
 * PaperScene — layered "paper cut" artwork with a living breeze and paper page transitions.
 *
 *   const scene = PaperScene.create(stageElement, {
 *     width: 1672, height: 941,                 // artwork size in px (all coordinates below use it)
 *     layers: [                                 // back to front
 *       { src, x, y, w, h,                      // where the cut-out sits on the artwork
 *         depth: 0..1,                          // 0 = far (moves least), 1 = nearest
 *         ox, oy,                               // pivot (stem / branch) in artwork px
 *         sway: { amp: deg, period: s, bend: 0..1, gust: deg },
 *         shadow: true }                        // paper drop shadow
 *     ],
 *     glows: [[x, y], ...]                      // optional pulsing lights (fireflies, lanterns)
 *   });
 *   scene.layout(left, top, scale);   // place like object-fit: cover (call on resize)
 *   scene.gust(strength = 1);         // a wind gust travelling left → right
 *   scene.enter();                    // paper sheets settle in, back to front   → Promise
 *   scene.exit();                     // sheets lift away, front to back          → Promise
 *   PaperScene.linkTransitions(scene) // play exit() before following same-site links
 */
(function (global) {
  'use strict';
  const TAU = Math.PI * 2;
  const reduceMotion = global.matchMedia('(prefers-reduced-motion: reduce)');
  const easeOutBack = t => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);
  const easeInCubic = t => t * t * t;
  const clamp01 = t => Math.max(0, Math.min(1, t));

  function create(stage, config) {
    stage.classList.add('paper-stage');
    stage.style.width = `${config.width}px`;
    stage.style.height = `${config.height}px`;

    const layers = config.layers.map((def, index) => {
      const el = document.createElement('img');
      el.className = 'paper-layer' + (def.shadow ? ' has-shadow' : '') + (def.className ? ' ' + def.className : '');
      el.src = def.src;
      el.alt = '';
      el.decoding = 'async';
      el.draggable = false;
      el.setAttribute('aria-hidden', 'true');
      Object.assign(el.style, {
        left: `${def.x}px`, top: `${def.y}px`, width: `${def.w}px`, height: `${def.h}px`, zIndex: String(index),
        transformOrigin: `${(def.ox ?? def.x + def.w / 2) - def.x}px ${(def.oy ?? def.y + def.h) - def.y}px`
      });
      el.style.setProperty('--paper-depth', String(0.6 + (def.depth || 0)));
      stage.append(el);
      return { el, def, seed: Math.random() * TAU, pos: 0, vel: 0, gusts: [], ix: 0, iy: 0, ir: 0, io: 1 };
    });

    (config.glows || []).forEach(([x, y], i) => {
      const glow = document.createElement('i');
      glow.className = 'paper-glow';
      glow.style.left = `${x}px`;
      glow.style.top = `${y}px`;
      glow.style.setProperty('--d', `${(3 + (i * 1.37) % 3.5).toFixed(2)}s`);
      glow.style.setProperty('--dl', `${(-i * 0.9).toFixed(2)}s`);
      stage.append(glow);
    });

    const ready = Promise.all(layers.map(({ el }) => (el.decode ? el.decode().catch(() => {}) : Promise.resolve())));

    // ---- pointer parallax (fine pointers only) ----
    let parX = 0, parY = 0, aimX = 0, aimY = 0;
    const finePointer = global.matchMedia('(hover: hover) and (pointer: fine)');
    global.addEventListener('pointermove', event => {
      if (!finePointer.matches || reduceMotion.matches) return;
      aimX = (event.clientX / global.innerWidth - 0.5) * -14;
      aimY = (event.clientY / global.innerHeight - 0.5) * -8;
    }, { passive: true });

    // ---- tweens used by enter/exit ----
    let tween = null;
    function runTween(duration, step) {
      return new Promise(resolve => {
        const start = performance.now();
        tween = now => {
          const t = clamp01((now - start) / duration);
          step(t);
          if (t >= 1) { tween = null; resolve(); }
        };
        if (!running) loop(performance.now());
      });
    }

    // ---- frame loop ----
    let raf = 0, last = performance.now(), running = false;
    const clockStart = performance.now();
    function loop(now) {
      running = true;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const time = (now - clockStart) / 1000;
      if (tween) tween(now);
      const k = Math.min(1, dt * 3);
      parX += (aimX - parX) * k;
      parY += (aimY - parY) * k;
      const still = reduceMotion.matches;
      for (const L of layers) {
        const s = L.def.sway || {};
        const amp = still ? 0 : (s.amp || 0);
        const period = s.period || 6;
        // two waves with unrelated periods: a breeze that never visibly repeats
        const breeze = amp * (0.72 * Math.sin(TAU * time / period + L.seed) + 0.28 * Math.sin(TAU * time / (period * 0.53) + L.seed * 1.7));
        // soft spring pushed by gusts that swell and fade (no sudden kick)
        let force = 0;
        if (L.gusts.length) {
          L.gusts = L.gusts.filter(g => now - g.t0 < g.dur);
          for (const g of L.gusts) { const u = (now - g.t0) / g.dur; if (u > 0) force += g.s * Math.sin(Math.PI * u) ** 2; }
        }
        L.vel += (-6 * L.pos - 2.6 * L.vel + force * 6) * dt;
        L.pos += L.vel * dt;
        const angle = breeze + L.pos * (s.gust ?? amp * 1.3);
        const bend = angle * (s.bend ?? 0.5);
        const d = L.def.depth || 0;
        L.el.style.transform = `translate3d(${(parX * d + L.ix).toFixed(2)}px,${(parY * d + L.iy).toFixed(2)}px,0) rotate(${(angle + L.ir).toFixed(3)}deg) skewX(${bend.toFixed(3)}deg)`;
        if (L.io !== L._io) { L.el.style.opacity = String(L.io); L._io = L.io; }
      }
      // nothing moves under reduced motion: stop after this frame (a tween restarts the loop)
      if (document.hidden || (still && !tween)) { running = false; return; }
      raf = global.requestAnimationFrame(loop);
    }
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && !running && !reduceMotion.matches) { last = performance.now(); raf = global.requestAnimationFrame(loop); }
    });
    raf = global.requestAnimationFrame(loop);

    return {
      ready,
      layers,
      layout(left, top, scale) {
        stage.style.transform = `translate(${left}px,${top}px) scale(${scale})`;
      },
      gust(strength = 1, travelMs = 2600) {
        if (reduceMotion.matches) return;
        for (const L of layers) {
          if (!L.def.sway) continue;
          const centre = (L.def.x + L.def.w / 2) / config.width;
          L.gusts.push({ t0: performance.now() + centre * travelMs, dur: 1600 + Math.random() * 500, s: strength });
        }
      },
      enter({ duration = 1100, stagger = 90 } = {}) {
        if (reduceMotion.matches) return ready;
        layers.forEach((L, i) => {
          const d = L.def.depth || 0;
          L.fromY = 70 + 110 * d; L.fromR = (i % 2 ? 1 : -1) * (1.5 + 2 * d);
          L.iy = L.fromY; L.ir = L.fromR; L.io = 0;
        });
        const total = duration + stagger * layers.length;
        return ready.then(() => runTween(total, t => {
          const ms = t * total;
          layers.forEach((L, i) => {
            const p = clamp01((ms - i * stagger) / duration);
            const e = easeOutBack(p);
            L.iy = L.fromY * (1 - e);
            L.ir = L.fromR * (1 - e);
            L.io = clamp01(p * 2.2);
          });
        }));
      },
      exit({ duration = 520, stagger = 45 } = {}) {
        if (reduceMotion.matches) return Promise.resolve();
        const order = [...layers].reverse();
        const total = duration + stagger * order.length;
        return runTween(total, t => {
          const ms = t * total;
          order.forEach((L, i) => {
            const p = clamp01((ms - i * stagger) / duration);
            const e = easeInCubic(p);
            const d = L.def.depth || 0;
            L.iy = -(60 + 140 * d) * e;
            L.ir = (i % 2 ? 1 : -1) * 3 * e;
            L.io = 1 - clamp01(p * 1.3);
          });
        });
      }
    };
  }

  // Play the exit before leaving for another page of the same site.
  function linkTransitions(scene) {
    document.addEventListener('click', event => {
      const link = event.target.closest && event.target.closest('a[href]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.target && link.target !== '_self') return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
      event.preventDefault();
      scene.exit().then(() => { location.href = url.href; });
    });
    // coming back through the browser cache: show the scene again
    global.addEventListener('pageshow', event => { if (event.persisted) scene.enter({ duration: 700, stagger: 50 }); });
  }

  global.PaperScene = { create, linkTransitions };
})(window);
