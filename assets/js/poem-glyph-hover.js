(function () {
  var selectors = [
    // 保留 .poem-line 节点本身，避免丢失 data-line 与点击绑定
    ".snap-section--poem .poem-vertical-script__body .poem-line",
    ".snap-section--poem .poem-vertical-script__author",
    ".snap-section--poem .poem-vertical-script__title",
  ];

  /** 句读：常见顿句标点与换行（诗行分界） */
  var JUDOU_RE = /([，。、；：！？]+|\n+)/g;

  function splitByJudou(text) {
    text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    var parts = text.split(JUDOU_RE);
    var out = [];
    for (var i = 0; i < parts.length; i += 2) {
      var chunk = parts[i] != null ? parts[i] : "";
      var delim = parts[i + 1] != null ? parts[i + 1] : "";
      var piece = chunk + delim;
      if (piece === "") continue;
      out.push(piece);
    }
    return out;
  }

  function wrapJudou(el) {
    if (!el || el.getAttribute("data-poem-judou") === "1") return;
    var text = el.textContent;
    if (!text) return;
    el.setAttribute("data-poem-judou", "1");
    var pieces = splitByJudou(text);
    var frag = document.createDocumentFragment();
    for (var j = 0; j < pieces.length; j++) {
      var piece = pieces[j];
      if (/^\n+$/.test(piece)) {
        frag.appendChild(document.createTextNode(piece));
        continue;
      }
      var span = document.createElement("span");
      span.className = "poem-phrase";
      span.textContent = piece;
      frag.appendChild(span);
    }
    el.textContent = "";
    el.appendChild(frag);
  }

  function boot() {
    selectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(wrapJudou);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
