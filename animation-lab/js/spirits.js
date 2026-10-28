export function createSpirits(container, { reducedMotion = false } = {}) {
  const count = 12;
  for (let index = 0; index < count; index += 1) {
    const spark = document.createElement("i");
    spark.className = "fairy";
    spark.style.left = `${8 + ((index * 37) % 84)}%`;
    spark.style.top = `${12 + ((index * 53) % 74)}%`;
    spark.style.setProperty("--dx", `${((index * 17) % 48) - 24}px`);
    spark.style.setProperty("--dy", `${-12 - ((index * 11) % 40)}px`);
    spark.style.setProperty("--delay", `${-((index * 7) % 50) / 10}s`);
    spark.style.setProperty("--duration", `${3.2 + ((index * 13) % 30) / 10}s`);
    container.append(spark);
  }

  if (reducedMotion || !("IntersectionObserver" in window)) return { destroy() {} };
  const observer = new IntersectionObserver(([entry]) => {
    container.classList.toggle("fairies--active", entry.isIntersecting);
  }, { threshold: 0.1 });
  observer.observe(container.closest(".chapter"));
  return { destroy: () => observer.disconnect() };
}
