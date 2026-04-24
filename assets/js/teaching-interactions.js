(function () {
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  qsa('[data-tabset]').forEach(function (set) {
    var buttons = qsa('[data-tab-btn]', set);
    var panels = qsa('[data-tab-panel]', set);
    function activate(name) {
      buttons.forEach(function (b) {
        var on = b.getAttribute('data-tab-btn') === name;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      panels.forEach(function (p) {
        var show = p.getAttribute('data-tab-panel') === name;
        if (show) {
          p.hidden = false;
          requestAnimationFrame(function () {
            p.classList.add('is-active-panel');
          });
          return;
        }
        p.classList.remove('is-active-panel');
        p.hidden = true;
      });
    }
    buttons.forEach(function (b) {
      b.addEventListener('click', function () { activate(b.getAttribute('data-tab-btn')); });
    });
    if (buttons[0]) activate(buttons[0].getAttribute('data-tab-btn'));
  });

  qsa('[data-quiz]').forEach(function (quiz) {
    var submit = quiz.querySelector('[data-quiz-submit]');
    var result = quiz.querySelector('[data-quiz-result]');
    if (!submit || !result) return;
    submit.addEventListener('click', function () {
      var score = 0;
      var total = 0;
      qsa('[data-q]', quiz).forEach(function (q) {
        total += 1;
        var ans = q.getAttribute('data-answer');
        var checked = q.querySelector('input[type="radio"]:checked');
        var ok = checked && checked.value === ans;
        if (ok) score += 1;
        q.classList.toggle('is-correct', !!ok);
        q.classList.toggle('is-wrong', !ok);
      });
      result.textContent = '得分：' + score + ' / ' + total + '。';
      result.hidden = false;
      result.classList.remove('is-pop');
      requestAnimationFrame(function () {
        result.classList.add('is-pop');
      });
    });
  });

  qsa('[data-copy-text]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy-text') || '';
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(text).then(function () {
        var old = btn.textContent;
        btn.textContent = '已复制';
        setTimeout(function () { btn.textContent = old; }, 1000);
      });
    });
  });

  var COMPOSE_HINTS = {
    "wujue-basic": {
      cipai: "五言绝句",
      gelv: "四句，每句五字；常见二、四句押韵，讲究起承转合。",
      pingze: "仄仄平平仄，平平仄仄平。平平平仄仄，仄仄仄平平。"
    },
    "qijue-basic": {
      cipai: "七言绝句",
      gelv: "四句，每句七字；常见二、四句押韵，节奏开阖更明显。",
      pingze: "平平平仄仄平平，仄仄平平仄仄平。仄仄平平平仄仄，平平仄仄仄平平。"
    },
    "wulv-basic": {
      cipai: "五言律诗",
      gelv: "八句，每句五字；中二联常作对仗，偶句押韵。",
      pingze: "仄仄平平仄，平平仄仄平。平平平仄仄，仄仄仄平平。（后四句同律续写）"
    },
    "qilv-basic": {
      cipai: "七言律诗",
      gelv: "八句，每句七字；颔联、颈联宜对仗，偶句押韵。",
      pingze: "仄仄平平平仄仄，平平仄仄仄平平。平平仄仄平平仄，仄仄平平仄仄平。（后四句同律续写）"
    },
    "cipai-huanxisha": {
      cipai: "浣溪沙（词牌）",
      gelv: "双调四十二字，上下片各三句七言。创作区以下划线提供句式长度。",
      pingze: "_______ / _______ / _______（上片）\n_______ / _______ / _______（下片）"
    },
    "cipai-xijiangyue": {
      cipai: "西江月（词牌）",
      gelv: "双调五十字，上下片各四句，常有对仗。创作区以下划线提供句式长度。",
      pingze: "_______ / _______ / _______ / _______（上片）\n_______ / _______ / _______ / _______（下片）"
    },
    "cipai-rumengling": {
      cipai: "如梦令（词牌）",
      gelv: "单调三十三字，常见短句顿挫与叠意。创作区以下划线提供句式长度。",
      pingze: "______ / ______ / ______\n______ / ______ / ______"
    },
    "qijue-ze": {
      cipai: "（诗体）七言绝句",
      gelv: "四句二十八字；偶句押平声韵。此式首句不入韵，则韵脚在二、四两句。",
      pingze: "仄仄平平仄，平平仄仄平。平平平仄仄，仄仄仄平平。"
    },
    "qijue-ping": {
      cipai: "（诗体）七言绝句",
      gelv: "同上。首句平收、不入韵时，韵脚仍在二、四句。",
      pingze: "平平平仄仄，仄仄仄平平。仄仄平平仄，平平仄仄平。"
    },
    "wujue-ze": {
      cipai: "（诗体）五言绝句",
      gelv: "四句二十字；二、四句押韵，气脉紧练，宜见「起承转合」。",
      pingze: "仄仄平平仄，平平仄仄平。平平平仄仄，仄仄仄平平。"
    },
    "wujue-ping": {
      cipai: "（诗体）五言绝句",
      gelv: "同上。首句平起不入韵时，韵脚在二、四句。",
      pingze: "平平平仄仄，仄仄仄平平。仄仄平平仄，平平仄仄平。"
    },
    huanxisha: {
      cipai: "浣溪沙（双调四十二字，上下片各三句七言）",
      gelv: "上下片句式对称，上片三韵、下片通常两韵或三韵，宜即景换意；末句收束全篇。",
      pingze: "上片示例位：仄仄仄平平，仄仄仄平平，仄平平仄平。下片：仄仄仄平平，仄仄仄平平，仄平平仄平。（常见一体，以词谱为准）"
    },
    xijiangyue: {
      cipai: "西江月（双调五十字，上下片各四句）",
      gelv: "上下片首二句多作对仗；平仄韵递转，过片处常换意。宜注意对仗与换韵的顿挫。",
      pingze: "起句多仄仄平平，对句仄仄仄平平；后接仄韵句与平韵句相间，体式多变，习作宜先摹一体定格。"
    },
    rumengling: {
      cipai: "如梦令（单调三十三字，七仄韵叠句）",
      gelv: "短章多写瞬间感受；叠句「如梦，如梦」强化恍惚，末句收醒。",
      pingze: "常见节奏：仄仄仄平平仄，仄仄仄平平仄，平仄仄平平仄。叠句处重复同一短韵，宜控制语气轻重。"
    },
    free: {
      cipai: "随笔（不定词牌与句度）",
      gelv: "可先定立意与意象，再自选句长与韵脚；完稿后若有定格，可回检平仄与对仗是否服务于语势。",
      pingze: "无固定骨架。练习可自写一联七言律句脚：仄仄平平仄，平平仄仄平。"
    }
  };

  qsa("[data-compose-studio]").forEach(function (studio) {
    var sel = studio.querySelector("[data-compose-template]");
    var elCi = studio.querySelector("[data-hint-cipai]");
    var elGe = studio.querySelector("[data-hint-gelv]");
    var elPz = studio.querySelector("[data-hint-pingze]");
    if (!sel || !elCi || !elGe || !elPz) return;

    function apply(id) {
      var pack = COMPOSE_HINTS[id] || COMPOSE_HINTS.free;
      elCi.textContent = pack.cipai;
      elGe.textContent = pack.gelv;
      if (id === "free" || id.indexOf("cipai-") === 0) {
        elPz.textContent = pack.pingze;
      } else {
        elPz.textContent =
          "稿纸内灰字为当句平仄位，键入后覆盖；合谱为墨绿，不合为丹红。字在字库外为墨色。句长与词谱单句字数不符时，该句加丹红下划线；离框时末句未写满亦标出。";
      }
    }

    sel.addEventListener("change", function () {
      apply(sel.value || "free");
    });
    apply(sel.value || "wujue-basic");
  });
})();
