(function () {
  var root = document.querySelector("[data-scroll-snap-root]");
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !root || !("IntersectionObserver" in window)) return;

  function msPerChar(len) {
    if (len <= 72) return 22;
    if (len <= 180) return 16;
    return 12;
  }

  function prepBlock(el, full) {
    if (!full) return null;
    el.textContent = "";
    var sr = document.createElement("span");
    sr.className = "tw-sr-only";
    sr.textContent = full;
    var vis = document.createElement("span");
    vis.className = "tw-type";
    vis.setAttribute("aria-hidden", "true");
    el.appendChild(sr);
    el.appendChild(vis);
    return { vis: vis, full: full };
  }

  function collectTargets() {
    var out = [];
    Array.prototype.forEach.call(document.querySelectorAll("article.card p"), function (p) {
      if (p.closest(".quiz-q")) return;
      var t = p.textContent;
      if (!t || !/\S/.test(t)) return;
      out.push(p);
    });
    Array.prototype.forEach.call(document.querySelectorAll(".tabpanel"), function (panel) {
      var t = panel.textContent;
      if (!t || !/\S/.test(t)) return;
      out.push(panel);
    });
    return out;
  }

  var targets = collectTargets();
  if (!targets.length) return;

  var prepared = targets
    .map(function (el) {
      var full = el.textContent;
      var pair = prepBlock(el, full);
      if (!pair) return null;
      return { el: el, vis: pair.vis, full: pair.full, done: false, timer: null };
    })
    .filter(Boolean);

  function tick(item) {
    if (!item.vis.isConnected) {
      item.done = true;
      return;
    }
    var i = item.i;
    if (i >= item.full.length) {
      item.vis.classList.add("is-tw-done");
      item.done = true;
      item.timer = null;
      return;
    }
    item.vis.textContent = item.full.slice(0, i + 1);
    item.i = i + 1;
    item.timer = window.setTimeout(function () {
      tick(item);
    }, item.ms);
  }

  function start(item) {
    if (item.done || item.timer !== null) return;
    item.i = 0;
    item.ms = msPerChar(item.full.length);
    tick(item);
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.12) return;
        var el = entry.target;
        prepared.forEach(function (item) {
          if (item.el === el) {
            start(item);
            io.unobserve(el);
          }
        });
      });
    },
    { root: root, threshold: [0, 0.12, 0.2], rootMargin: "0px 0px -6% 0px" }
  );

  prepared.forEach(function (item) {
    io.observe(item.el);
  });
})();
