const replies = {
  memory: "Một khoảnh khắc nhỏ cũng có thể mở ra cả một câu chuyện.",
  look: "Mình cùng nhìn kỹ hơn nhé. Điều gì khiến bạn dừng lại?",
};

export function createConversation({ panel, character, liveRegion }) {
  const answer = panel.querySelector("[data-answer]");
  let closeTimer = 0;
  let returnFocus = null;

  function open() {
    clearTimeout(closeTimer);
    returnFocus = document.activeElement;
    panel.hidden = false;
    character.setState("talk");
    panel.querySelector("[data-reply]")?.focus({ preventScroll: true });
    liveRegion.textContent = "Bọ cánh cứng muốn trò chuyện với bạn.";
  }

  function close() {
    panel.hidden = true;
    character.setState("idle");
    liveRegion.textContent = "Đã đóng lời thoại.";
    returnFocus?.focus?.({ preventScroll: true });
  }

  panel.querySelector("[data-action='close-dialogue']").addEventListener("click", close);
  panel.querySelectorAll("[data-reply]").forEach((button) => {
    button.addEventListener("click", () => {
      answer.textContent = replies[button.dataset.reply] || "Cảm ơn bạn đã chia sẻ.";
      character.setState("happy");
      liveRegion.textContent = answer.textContent;
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => {
        if (!panel.hidden) character.setState("talk");
      }, 900);
    });
  });
  panel.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { close(); return; }
    if (event.key !== "Tab") return;
    const controls = [...panel.querySelectorAll("button:not([disabled])")];
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  return { open, close };
}
