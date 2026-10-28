const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (a, b, amount) => a + (b - a) * amount;

const route = [
  [15, 72], [68, 31], [79, 48], [28, 66], [73, 30],
];

export function createEnvironment({ beetle, character, progress, progressLabel, reducedMotion = false }) {
  let animation = null;
  let frame = 0;
  let scrollSettled = 0;
  let destroyed = false;
  let lastX = route[0][0];
  const branch = document.querySelector("[data-branch]")?.closest(".chapter");
  const branchObserver = branch && "IntersectionObserver" in window
    ? new IntersectionObserver(([entry]) => branch.classList.toggle("is-visible", entry.isIntersecting), { threshold: 0.1 })
    : null;
  if (branchObserver) branchObserver.observe(branch);

  function position(x, y, rotation = 0) {
    lastX = x;
    beetle.style.transform = `translate3d(${x}vw, ${y}vh, 0) rotate(${rotation}deg)`;
  }

  function flyTo({ x, y, duration = 1400, rotation = 0 } = {}) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return Promise.reject(new TypeError("flyTo cần tọa độ x, y theo phần trăm màn hình."));
    animation?.cancel();
    const to = `translate3d(${clamp(x, 5, 92)}vw, ${clamp(y, 12, 84)}vh, 0) rotate(${rotation}deg)`;
    if (reducedMotion || typeof beetle.animate !== "function") {
      position(clamp(x, 5, 92), clamp(y, 12, 84), rotation);
      character.setState("land");
      return Promise.resolve();
    }
    const from = getComputedStyle(beetle).transform;
    character.setState("fly");
    const currentAnimation = beetle.animate([{ transform: from }, { transform: to }], {
      duration: Math.max(120, duration), easing: "cubic-bezier(.2,.72,.22,1)", fill: "forwards",
    });
    animation = currentAnimation;
    return currentAnimation.finished.catch(() => {}).then(() => {
      if (destroyed || animation !== currentAnimation) return;
      position(clamp(x, 5, 92), clamp(y, 12, 84), rotation);
      currentAnimation.cancel();
      animation = null;
      character.setState("land");
    });
  }

  function onScroll() {
    if (frame || destroyed || character.isPaused()) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      animation?.cancel();
      animation = null;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const progressValue = clamp(scrollY / maxScroll, 0, 1);
      const scaled = progressValue * (route.length - 1);
      const segment = Math.min(route.length - 2, Math.floor(scaled));
      const amount = scaled - segment;
      const x = lerp(route[segment][0], route[segment + 1][0], amount);
      const y = lerp(route[segment][1], route[segment + 1][1], amount);
      const direction = Math.sign(x - lastX);
      position(x, y, reducedMotion ? 0 : direction * -7);
      progress.style.transform = `scaleX(${progressValue})`;
      progressLabel.textContent = `${Math.round(progressValue * 100)}% HÀNH TRÌNH`;
      if (!reducedMotion) character.setState("fly");
      clearTimeout(scrollSettled);
      scrollSettled = setTimeout(() => character.setState("land"), 230);
    });
  }

  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll, { passive: true });

  return {
    flyTo,
    pause() { animation?.pause(); cancelAnimationFrame(frame); frame = 0; },
    resume() { animation?.play(); onScroll(); },
    destroy() {
      destroyed = true;
      animation?.cancel();
      clearTimeout(scrollSettled);
      cancelAnimationFrame(frame);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      branchObserver?.disconnect();
    },
  };
}
