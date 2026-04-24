(function () {
  function applyUnderImage(section) {
    var depth = section.getAttribute("data-poem-depth");
    var bg = section.querySelector("[data-poem-bg-under]");
    if (!depth || !bg) return;
    bg.style.backgroundImage = 'url("' + encodeURI(depth) + '")';
  }

  function resetSectionOver(section) {
    var over = section.querySelector("[data-poem-bg-over]");
    if (!over) return;
    over.style.opacity = "0";
    over.style.clipPath = "none";
    over.style.backgroundImage = "";
    over.style.background = "";
    over.style.transform = "";
  }

  function boot() {
    var nodes = document.querySelectorAll(".snap-section--poem[data-poem-depth]");
    Array.prototype.forEach.call(nodes, function(sec) {
      applyUnderImage(sec);
      resetSectionOver(sec);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
