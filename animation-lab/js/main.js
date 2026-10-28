import { createCharacter } from "./character.js";
import { createConversation } from "./conversation.js";
import { createEnvironment } from "./environment.js";
import { createSpirits } from "./spirits.js";

const beetleElement = document.querySelector("[data-beetle]");
const reduceMotionQuery = matchMedia("(prefers-reduced-motion: reduce)");
const liveRegion = document.querySelector("[data-live]");
const character = createCharacter(beetleElement, {
  reducedMotion: reduceMotionQuery.matches,
  onStateChange: (state) => { liveRegion.textContent = `Bọ đang ở trạng thái ${state}.`; },
});
const environment = createEnvironment({
  beetle: beetleElement,
  character,
  progress: document.querySelector("[data-progress]"),
  progressLabel: document.querySelector("[data-progress-label]"),
  reducedMotion: reduceMotionQuery.matches,
});
const conversation = createConversation({
  panel: document.querySelector("[data-dialogue]"), character, liveRegion,
});
const spirits = createSpirits(document.querySelector("[data-fairies]"), { reducedMotion: reduceMotionQuery.matches });

beetleElement.addEventListener("click", () => {
  if (!character.isPaused()) conversation.open();
});
beetleElement.addEventListener("pointermove", (event) => {
  const bounds = beetleElement.getBoundingClientRect();
  const x = Math.max(-2, Math.min(2, ((event.clientX - bounds.left) / bounds.width - 0.5) * 4));
  const y = Math.max(-1.5, Math.min(1.5, ((event.clientY - bounds.top) / bounds.height - 0.5) * 3));
  beetleElement.style.setProperty("--look-x", `${x}px`);
  beetleElement.style.setProperty("--look-y", `${y}px`);
});
beetleElement.addEventListener("pointerleave", () => {
  beetleElement.style.setProperty("--look-x", "0px");
  beetleElement.style.setProperty("--look-y", "0px");
});

document.querySelectorAll("[data-action='talk']").forEach((button) => button.addEventListener("click", conversation.open));
document.querySelectorAll("[data-action='branch']").forEach((button) => button.addEventListener("click", () => {
  conversation.close();
  environment.flyTo({ x: 72, y: 29, duration: reduceMotionQuery.matches ? 0 : 1250, rotation: -8 });
}));

const pauseButton = document.querySelector("[data-action='pause']");
pauseButton.addEventListener("click", () => {
  if (character.isPaused()) {
    character.resume();
    environment.resume();
    pauseButton.textContent = "TẠM DỪNG CHUYỂN ĐỘNG";
  } else {
    character.pause();
    environment.pause();
    pauseButton.textContent = "TIẾP TỤC CHUYỂN ĐỘNG";
  }
});

reduceMotionQuery.addEventListener?.("change", (event) => {
  if (event.matches) {
    character.setState("land");
    environment.pause();
    spirits.destroy();
  }
});

if (reduceMotionQuery.matches) {
  character.setState("land");
} else {
  beetleElement.style.transform = "translate3d(14vw, 73vh, 0)";
  setTimeout(() => environment.flyTo({ x: 68, y: 30, duration: 1450, rotation: -10 }), 500);
}

window.MeMoriMotionLab = Object.freeze({
  beetle: character,
  environment,
  conversation,
  destroy() { environment.destroy(); spirits.destroy(); conversation.close(); },
});
