(function () {
  var body = document.body;
  var gate = document.getElementById("coverGate");
  var enterBtn = document.getElementById("coverEnterBtn");
  var scroller = document.querySelector("[data-scroll-snap-root]");
  if (!gate || !body || !scroller) return;

  var unlocked = false;
  var touchStartY = 0;
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function unlockCover() {
    if (unlocked) return;
    unlocked = true;
    body.classList.remove("cover-lock");
    body.classList.add("cover-dismissed");

    if (reduced) {
      gate.remove();
      return;
    }

    window.setTimeout(function () {
      if (gate && gate.parentNode) gate.parentNode.removeChild(gate);
    }, 1450);
  }

  function onWheel(e) {
    if (unlocked) return;
    if (Math.abs(e.deltaY) < 6) return;
    if (e.deltaY > 0) unlockCover();
  }

  function onTouchStart(e) {
    if (!e.touches || !e.touches.length) return;
    touchStartY = e.touches[0].clientY;
  }

  function onTouchMove(e) {
    if (unlocked || !e.touches || !e.touches.length) return;
    var delta = touchStartY - e.touches[0].clientY;
    if (delta > 16) unlockCover();
  }

  gate.addEventListener("wheel", onWheel, { passive: true });
  gate.addEventListener("touchstart", onTouchStart, { passive: true });
  gate.addEventListener("touchmove", onTouchMove, { passive: true });
  gate.addEventListener("click", function () {
    unlockCover();
  });
  if (enterBtn) enterBtn.addEventListener("click", unlockCover);

  document.addEventListener("keydown", function (e) {
    if (unlocked) return;
    if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " " || e.key === "Enter") {
      unlockCover();
    }
  });
})();
