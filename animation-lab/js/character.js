const STATES = new Set(["idle", "fly", "land", "talk", "happy"]);

export function createCharacter(element, { reducedMotion = false, onStateChange = () => {} } = {}) {
  let state = "idle";
  let paused = false;
  let beforePause = "idle";

  function setState(next) {
    if (!STATES.has(next)) throw new TypeError(`Trạng thái bọ không hợp lệ: ${next}`);
    if (paused) {
      beforePause = next;
      return state;
    }
    const safeState = reducedMotion && next === "fly" ? "land" : next;
    state = safeState;
    element.dataset.state = safeState;
    onStateChange(safeState);
    return safeState;
  }

  return {
    setState,
    getState: () => state,
    pause() {
      if (paused) return;
      beforePause = state;
      paused = true;
      element.dataset.state = "paused";
      element.querySelector(".beetle__art")?.getAnimations().forEach((animation) => animation.pause());
    },
    resume() {
      if (!paused) return;
      paused = false;
      element.querySelector(".beetle__art")?.getAnimations().forEach((animation) => animation.play());
      setState(beforePause);
    },
    isPaused: () => paused,
    states: Object.freeze([...STATES]),
  };
}
