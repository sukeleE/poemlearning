(function () {
  var root = document.querySelector("[data-scroll-snap-root]");
  if (!root) return;

  var sections = Array.prototype.slice.call(document.querySelectorAll(".snap-section"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav .nav-links a[href^="#"]'));

  function activate(section) {
    sections.forEach(function (s) {
      s.classList.toggle("is-scene-active", s === section);
    });
    if (!section || !section.id) return;
    document.body.dataset.activeSection = section.id;
    var hash = "#" + section.id;
    navLinks.forEach(function (a) {
      if (a.getAttribute("href") === hash) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        var top = entries
          .filter(function (e) {
            return e.isIntersecting;
          })
          .sort(function (a, b) {
            return b.intersectionRatio - a.intersectionRatio;
          })[0];
        if (top && top.target) activate(top.target);
      },
      {
        root: root,
        threshold: [0.2, 0.35, 0.5, 0.7],
      }
    );
    sections.forEach(function (s) {
      io.observe(s);
    });
  }

  navLinks.forEach(function (a) {
    a.addEventListener("click", function (e) {
      var hash = a.getAttribute("href");
      if (!hash || hash.charAt(0) !== "#") return;
      var target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
})();
