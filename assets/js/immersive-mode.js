(function () {
  var STORAGE_KEY = "immersiveModeEnabled";
  var DEFAULT_BG = "assets/img/login-bg.png";
  var SECTION_BG_MAP = {
    jj: "assets/img/将进酒.png",
    dg: "assets/img/登高.png",
    sj: "assets/img/山居秋鸣.png",
    jd: "assets/img/宿建德江.png"
  };

  var modeEnabled = false;
  var latestMouseX = 0;
  var latestMouseY = 0;
  var rafId = 0;

  var layer = document.getElementById("immersiveBgLayer");
  var image = document.getElementById("immersiveBgImage");
  var toggle = document.getElementById("immersiveModeToggle");
  var root = document.querySelector("[data-scroll-snap-root]");

  if (!layer || !image || !toggle || !root) return;

  function getActiveSectionId() {
    var id = document.body && document.body.dataset ? document.body.dataset.activeSection : "";
    if (id) return id;
    var active = document.querySelector(".snap-section.is-scene-active");
    return active && active.id ? active.id : "intro";
  }

  function getBackgroundBySection(sectionId) {
    if (SECTION_BG_MAP[sectionId]) return SECTION_BG_MAP[sectionId];
    return DEFAULT_BG;
  }

  function updateBackground() {
    var sectionId = getActiveSectionId();
    var bgUrl = getBackgroundBySection(sectionId);
    image.style.backgroundImage = 'url("' + encodeURI(bgUrl) + '")';
  }

  function renderParallax() {
    rafId = 0;
    if (!modeEnabled) {
      image.style.transform = "translate3d(0, 0, 0) scale(1.02)";
      return;
    }

    var x = Math.max(-1, Math.min(1, latestMouseX));
    var y = Math.max(-1, Math.min(1, latestMouseY));
    var offsetX = x * 16;
    var offsetY = y * 10;
    image.style.transform = "translate3d(" + offsetX.toFixed(2) + "px, " + offsetY.toFixed(2) + "px, 0) scale(1.05)";
  }

  function requestRender() {
    if (rafId) return;
    rafId = window.requestAnimationFrame(renderParallax);
  }

  function setMode(enabled) {
    modeEnabled = !!enabled;
    layer.classList.toggle("is-active", modeEnabled);
    toggle.checked = modeEnabled;
    try {
      window.localStorage.setItem(STORAGE_KEY, modeEnabled ? "1" : "0");
    } catch (e) {}
    updateBackground();
    requestRender();
  }

  function handlePointerMove(event) {
    latestMouseX = (event.clientX / window.innerWidth) * 2 - 1;
    latestMouseY = (event.clientY / window.innerHeight) * 2 - 1;
    requestRender();
  }

  function initModeFromStorage() {
    var raw = "0";
    try {
      raw = window.localStorage.getItem(STORAGE_KEY) || "0";
    } catch (e) {}
    setMode(raw === "1");
  }

  toggle.addEventListener("change", function () {
    setMode(toggle.checked);
  });

  document.addEventListener("mousemove", handlePointerMove, { passive: true });
  root.addEventListener("scroll", updateBackground, { passive: true });
  window.addEventListener("resize", requestRender, { passive: true });

  initModeFromStorage();
  updateBackground();
  requestRender();
})();
