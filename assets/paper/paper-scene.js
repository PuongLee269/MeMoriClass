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
      const roomy = global.matchMedia('(hover: hover) and (min-width: 761px)').matches;   // phones: keep GPU memory low
      el.className = 'paper-layer' + (def.shadow && roomy ? ' has-shadow' : '') + (def.sway ? ' is-moving' : '') + (def.className ? ' ' + def.className : '');
      el.src = def.src;
      el.alt = '';
      el.decoding = 'async';
      el.fetchPriority = 'low';
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

    // Ready = every image fully downloaded AND decoded (a half-loaded image must never be shown).
    const waitFor = img => new Promise((resolve, reject) => {
      if (img.complete && img.naturalWidth) resolve();
      else { img.addEventListener('load', resolve, { once: true }); img.addEventListener('error', reject, { once: true }); }
    }).then(() => (img.decode ? img.decode().catch(() => {}) : null));
    const extra = (config.preload || []).map(src => { const img = new Image(); img.decoding = 'async'; img.src = src; return img; });
    const all = [...layers.map(L => L.el), ...extra];
    let loaded = 0;
    stage.style.opacity = '0';
    const ready = Promise.all(all.map(img => waitFor(img).then(() => {
      loaded++;
      if (config.onProgress) config.onProgress(loaded / all.length);
    })));

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
    let raf = 0, last = performance.now(), running = false, stageScale = 1;
    const followers = [];
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
        const tx = parX * d + L.ix, ty = parY * d + L.iy, rot = angle + L.ir;
        // still sheets get no transform at all, so the browser doesn't keep them as separate GPU layers
        const tf = (!L.def.sway && Math.abs(tx) < 0.05 && Math.abs(ty) < 0.05 && Math.abs(rot) < 0.001)
          ? 'none'
          : `translate(${tx.toFixed(2)}px,${ty.toFixed(2)}px) rotate(${rot.toFixed(3)}deg) skewX(${bend.toFixed(3)}deg)`;
        if (tf !== L._tf) { L.el.style.transform = tf; L._tf = tf; }
        if (L.io !== L._io) { L.el.style.opacity = String(L.io); L._io = L.io; }
      }
      // elements outside the stage (e.g. an animated head) that must move with one layer
      for (const f of followers) {
        const L = f.layer, d = L.def.depth || 0;
        f.el.style.transform = `translate(${((parX * d + L.ix) * stageScale).toFixed(2)}px,${((parY * d + L.iy) * stageScale).toFixed(2)}px)`;
        f.el.style.opacity = L.io < 1 ? String(L.io) : '';
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
      reveal(ms = 900) {
        stage.style.transition = `opacity ${ms}ms ease`;
        stage.style.opacity = '1';
        return new Promise(r => setTimeout(r, ms));
      },
      layout(left, top, scale) {
        stageScale = scale;
        stage.style.transform = `translate(${left}px,${top}px) scale(${scale})`;
      },
      follow(el, srcPart) {
        const layer = layers.find(L => L.def.src.includes(srcPart));
        if (layer) followers.push({ el, layer });
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
