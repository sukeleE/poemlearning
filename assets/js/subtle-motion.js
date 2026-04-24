(function () {
  var root = document.querySelector("[data-scroll-snap-root]") || null;
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var items = Array.prototype.slice.call(
    document.querySelectorAll(".card, .kv, .tabset, .quizbox, .poem-line, .cz-step-line, .cta-row, .compose-launch")
  );
  if (!items.length) return;

  if (reduced || !("IntersectionObserver" in window)) {
    items.forEach(function (el) {
      el.classList.add("is-revealed");
    });
    return;
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var section = el.closest(".snap-section");
        var siblings = section
          ? Array.prototype.slice.call(section.querySelectorAll(".card, .kv, .tabset, .quizbox, .poem-line, .cz-step-line, .cta-row, .compose-launch"))
          : [el];
        var idx = Math.max(0, siblings.indexOf(el));
        el.style.setProperty("--reveal-delay", idx * 40 + "ms");
        el.classList.add("is-revealed");
        io.unobserve(el);
      });
    },
    { root: root, threshold: 0.24, rootMargin: "0px 0px -8% 0px" }
  );

  items.forEach(function (el) {
    io.observe(el);
  });
})();
