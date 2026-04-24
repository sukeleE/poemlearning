(function () {
  var LINE_PATTERNS = {
    "wujue-basic": ["仄仄平平仄", "平平仄仄平", "平平平仄仄", "仄仄仄平平"],
    "qijue-basic": ["平平平仄仄平平", "仄仄平平仄仄平", "仄仄平平平仄仄", "平平仄仄仄平平"],
    "wulv-basic": ["仄仄平平仄", "平平仄仄平", "平平平仄仄", "仄仄仄平平", "仄仄平平仄", "平平仄仄平", "平平平仄仄", "仄仄仄平平"],
    "qilv-basic": ["仄仄平平平仄仄", "平平仄仄仄平平", "平平仄仄平平仄", "仄仄平平仄仄平", "仄仄平平平仄仄", "平平仄仄仄平平", "平平仄仄平平仄", "仄仄平平仄仄平"],
    "qijue-ze": ["仄仄平平仄", "平平仄仄平", "平平平仄仄", "仄仄仄平平"],
    "qijue-ping": ["平平平仄仄", "仄仄仄平平", "仄仄平平仄", "平平仄仄平"],
    "wujue-ze": ["仄仄平平仄", "平平仄仄平", "平平平仄仄", "仄仄仄平平"],
    "wujue-ping": ["平平平仄仄", "仄仄仄平平", "仄仄平平仄", "平平仄仄平"],
    huanxisha: [
      "仄仄仄平平",
      "仄仄仄平平",
      "仄平平仄平",
      "仄仄仄平平",
      "仄仄仄平平",
      "仄平平仄平"
    ],
    xijiangyue: [
      "仄仄平平仄",
      "仄仄仄平平",
      "仄仄平平仄",
      "仄仄仄平平",
      "仄仄平平仄",
      "仄仄仄平平",
      "仄仄平平仄",
      "仄仄仄平平"
    ],
    rumengling: ["仄仄仄平平仄", "仄仄仄平平仄", "平仄仄平平仄", "仄仄仄平平仄"],
    "cipai-huanxisha": ["_______", "_______", "_______", "_______", "_______", "_______"],
    "cipai-xijiangyue": ["_______", "_______", "_______", "_______", "_______", "_______", "_______", "_______"],
    "cipai-rumengling": ["______", "______", "______", "______", "______", "______"],
    free: null
  };

  var TEMPLATE_PLACEHOLDERS = {
    "cipai-huanxisha": "_______\n_______\n_______\n_______\n_______\n_______",
    "cipai-xijiangyue": "_______\n_______\n_______\n_______\n_______\n_______\n_______\n_______",
    "cipai-rumengling": "______\n______\n______\n______\n______\n______",
    free: "无格式创作：可自由分行。"
  };

  var TONE_MAP = {};

  function addPing(str) {
    for (var i = 0; i < str.length; i++) {
      var c = str.charAt(i);
      if (c) TONE_MAP[c] = "p";
    }
  }

  function addZe(str) {
    for (var j = 0; j < str.length; j++) {
      var d = str.charAt(j);
      if (d && !TONE_MAP[d]) TONE_MAP[d] = "z";
    }
  }

  addPing(
    "安氨鞍谙鹌俺岸按案暗肮凹熬敖嗷廒遨翱聱八巴叭扒吧岜芭疤捌笆粑拔跋茇菝魃把靶坝爸罢钯耙琶柏百摆败拜稗扳班颁斑搬瘢癍板版阪舫办半伴扮绊瓣邦帮梆浜绑膀傍棒蚌磅镑包苞胞褒剥雹保鸨堡葆褓报抱趵豹鲍暴爆杯卑碑悲鹎北贝狈备背钡倍悖被辈惫焙蓓褙鞴奔贲锛本苯畚崩绷甭泵迸蹦逼鼻匕比彼笔俾秕币必毕闭庇诐哔毖陛毙狴铋婢庳敝萆弼愊滗痹蓖裨辟碧蔽壁避嬖篦臂璧边编萹蝙鳊鞭贬扁窆匾碥褊弁变汴苄忭便遍辨辩辫标飑彪膘表婊裱鳔憋鳖瘪别蹩彬斌滨濒宾傧缤槟殡膑鬓冰兵丙邴秉柄饼炳禀并病拨波玻剥钵饽菠播伯驳帛勃钹铂舶脖博鹁渤搏箔膊踣薄馞檗簸补捕哺不布步怖钚部埠簿嚓擦猜才材财裁采彩睬踩菜蔡餐参骖残蚕惭惨灿掺禅缠蝉谗产铲阐冁忏颤昌猖场尝常偿徜厂敞怅畅倡唱抄怊钞超焯巢朝嘲潮炒耖车砗扯彻撤澈抻郴臣尘辰沉忱陈晨谌衬趁撑称瞠成丞呈承枨诚城乘埕铖惩程裎塍酲橙丞逞骋秤吃哧痴媸池弛迟持匙踟墀篪茌池中耻齿侈尺豉赤翅敕炽傺瘛冲充忡茺舂崇宠铳抽瘳仇绸愁稠筹踌畴酬丑瞅臭出初刍除厨锄雏滁橱躇蜍雏础储楚褚处搐触憷黜揣穿川椽传船喘串钏疮窗床幢闯创怆吹炊垂陲捶棰锤春椿纯唇淳鹑醇蠢戳绰辍龊疵词祠瓷辞慈磁雌鹚糍此次刺赐匆苁囱葱从丛淙琮凑辏粗徂殂促猝蔟醋簇窜篡崔催摧榱脆淬萃啐瘁粹村皴存寸忖撮挫错厝锉搭嗒哒褡达沓妲怛笪答靼鞑打大呆歹傣代带殆待怠袋逮玳贷迨埭戴黛丹担单眈耽郸胆掸旦但诞啖弹淡惮氮澹当裆挡党谠凼宕荡档刀叨忉氘导岛倒捣祷蹈到盗悼道稻焘得德的锝灯登蹬等戥邓凳嶝瞪镫堤低滴狄籴迪敌涤荻笛觌嫡诋抵底砥骶地弟帝娣递第谛蒂棣睇缔氍掂滇颠典点碘踮佃甸店垫玷钿淀惦奠殿癜簟刁叼凋貂碉雕鲷吊钓掉爹跌叠谍喋蝶蹀鲽丁仃叮玎盯钉顶鼎锭定订丢东冬咚岽鸫董懂动冻侗垌洞恫胨斗抖陡蚪豆逗痘窦督毒渎犊独读堵赌睹笃妒渡镀蠹端短段断锻煅耑簖堆对队兑敦咄墩礅盹趸囤沌炖盾顿遁掇哆多咄夺踱朵垛躲跺舵堕惰跺讹俄娥峨鹅额讹厄扼遏噩腭鳄恩摁而儿鸸尔耳迩饵洱二贰发珐藩帆番幡翻凡矾钒烦樊蕃燔繁蘩反返犯饭泛范贩畈梵方邡坊芳防妨肪鲂房仿访纺舫放菲啡蜚霏腓斐匪诽悱篚翡吠废沸狒肺费痱分吩纷芬氛酚汾棼焚坟汾粉份奋忿偾粪愤鲼丰风沣枫封砜峰烽葑锋蜂酆冯逢缝讽唪凤奉俸否夫敷肤麸趺跗稃孵夫弗伏凫扶芙孚拂苻服怫氟俘郛莩茯浮砩蚨蜉桴符匐艴涪袱福蜉辐蝠抚甫斧府俯釜辅腑滏腐黼父讣付负妇附咐阜驸赴复副赋傅富腹鲋赙蝮鳆覆伽旮嘎尜钆该陔垓赅改丐钙盖溉概干甘杆肝坩苷矸泔柑竿酐尴杆敢感橄擀澉旰绀淦刚岗纲肛缸钢罡港杠戆皋高羔膏篙睾槔糕搞缟槁镐稿告郜诰锆戈圪纥咯哥胳鸽割歌阁革格鬲葛蛤隔嗝搿膈骼个各铬虼给根跟哏亘艮茛庚耕赓羹埂耿梗鲠更工弓公功攻供肱宫恭蚣躬龚觥广天东春江花人间清白云山川林泉舟轻飞鸟天长青高楼湖台阳阿哀埃挨哎埃隘爱嫒瑷暧僾碍"
  );

  addZe(
    "啊爱隘碍嗳嫒瑷暧僾碍碍安岸按案暗黯袄拗傲奥澳懊鏊八把坝罢爸霸钯耙杷吧疤拔跋茇菝魃百摆败拜稗办半伴扮绊瓣邦帮绑膀傍棒蚌磅镑薄雹保鸨堡葆褓报抱趵豹暴爆卑杯悲碑鹎北贝狈备背钡倍悖被辈惫焙蓓褙鞴奔本笨畚崩绷甭泵迸蹦逼笔比彼秕币必毕闭庇诐哔毖陛毙狴铋婢庳敝萆弼愊滗痹蓖裨辟碧蔽壁避嬖篦臂璧边贬扁窆匾碥褊变遍辨辩辫表婊鳔憋鳖瘪别蹩彬斌鬓冰丙秉柄饼炳禀并病拨波玻剥钵饽菠播伯驳帛勃钹铂舶脖博鹁渤搏箔膊踣薄馞檗簸捕不布步怖钚部埠簿擦才材财裁采彩睬踩菜蔡参餐残蚕惭惨灿掺禅缠蝉谗产铲颤阐冁忏颤昌猖场尝常偿厂敞怅畅倡唱抄超巢朝嘲潮炒车扯彻撤澈郴臣尘辰沉忱陈晨衬趁撑称瞠成丞呈承枨诚城乘铖惩程裎塍酲橙逞骋秤吃哧痴媸池弛迟持匙踟墀篪茌池中耻齿侈尺豉赤翅敕炽傺瘛冲充忡茺舂崇宠铳抽瘳仇绸愁稠筹踌畴酬丑瞅臭出初刍除厨锄雏滁橱躇蜍雏础储楚褚处搐触憷黜揣穿椽传船喘串钏疮窗床闯创怆吹炊垂陲捶棰锤春纯唇淳鹑醇蠢戳绰辍龊疵词祠瓷辞慈磁雌鹚此次刺赐匆苁囱葱从丛淙琮凑辏粗徂殂促猝蔟醋簇窜篡崔催摧榱脆淬萃啐瘁粹村皴存寸忖撮挫错厝锉搭达沓妲怛笪答靼打大呆歹傣代带殆待怠袋逮玳贷迨埭戴黛丹担单眈耽郸胆掸旦但诞啖弹淡惮氮澹当裆挡党谠凼宕荡档刀叨氘导岛倒捣祷蹈到盗悼道稻焘得德的锝灯登蹬等戥邓凳嶝瞪镫堤低滴狄籴迪敌涤荻笛觌嫡诋抵底砥骶地弟帝娣递第谛蒂棣睇缔氍掂滇颠典点碘踮佃甸店垫玷钿淀惦奠殿癜簟刁叼凋貂碉雕鲷吊钓掉爹跌叠谍喋蝶蹀鲽丁仃叮玎盯钉顶鼎锭定订丢东冬咚岽鸫董懂动冻侗垌洞恫胨斗抖陡蚪豆逗痘窦督毒渎犊独读堵赌睹笃妒渡镀蠹端短段断锻煅耑簖堆对队兑敦咄墩礅盹趸囤沌炖盾顿遁掇哆多咄夺踱朵垛躲跺舵堕惰跺讹俄娥峨鹅额讹厄扼遏噩腭鳄恩摁而儿鸸尔耳迩饵洱二贰发珐藩帆番幡翻凡矾钒烦樊蕃燔繁蘩反返犯饭泛范贩畈梵方邡坊芳防妨肪鲂房仿访纺舫放菲啡蜚霏腓斐匪诽悱篚翡吠废沸狒肺费痱分吩纷芬氛酚汾棼焚坟汾粉份奋忿偾粪愤鲼丰风沣枫封砜峰烽葑锋蜂酆冯逢缝讽唪凤奉俸否夫敷肤麸趺跗稃孵夫弗伏凫扶芙孚拂苻服怫氟俘郛莩茯浮砩蚨蜉桴符匐艴涪袱福蜉辐蝠抚甫斧府俯釜辅腑滏腐黼父讣付负妇附咐阜驸赴复副赋傅富腹鲋赙蝮鳆覆伽旮嘎尜钆该陔垓赅改丐钙盖溉概干杆肝坩苷矸泔柑竿酐尴杆敢感橄擀澉旰绀淦刚岗纲肛缸钢罡港杠戆皋高羔膏篙睾槔糕搞缟槁镐稿告郜诰锆戈圪纥咯哥胳鸽割歌阁革格鬲葛蛤隔嗝搿膈骼个各铬虼给根跟哏亘艮茛庚耕赓羹埂耿梗鲠更工弓公功攻供肱宫恭蚣躬龚觥广上望古道边城万里雪夜酒客愁断楼远暗疾百里日暮急地想事去意入墨斗尺百尺万壑疾痛病恨泪血战骨铁石烈渴饮饥餐虏骑胡沙莽莽黄尘黑水怒涛崩岸折戟沉沙折柳灞桥折腰摧眉断肠裂胆裂石裂帛裂土"
  );

  var PUNCT_RE = /[\s\u3000，。、；：！？,.;:!?"'「」『』（）()《》\[\]【】—…·]/;

  function isPunct(ch) {
    return PUNCT_RE.test(ch);
  }

  function toneOf(ch) {
    return TONE_MAP[ch] || null;
  }

  function stripPoemCharCount(line) {
    var n = 0;
    for (var i = 0; i < line.length; i++) {
      if (!isPunct(line.charAt(i))) n++;
    }
    return n;
  }

  function lineLenBad(lineIndex, totalLines, coreLen, patLen) {
    if (patLen <= 0) return false;
    if (coreLen === 0) return false;
    if (coreLen > patLen) return true;
    if (coreLen < patLen && lineIndex < totalLines - 1) return true;
    return false;
  }

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function buildColoredHtml(text, patterns, lastLineClosed) {
    if (!patterns || !patterns.length) return "";
    var lines = text.split(/\n/);
    var html = [];
    for (var li = 0; li < patterns.length; li++) {
      var pat = patterns[li] || "";
      var rawLine = lines[li] != null ? lines[li] : "";
      var patLen = pat.length;
      var coreLen = stripPoemCharCount(rawLine);
      var totalLines = lines.length;
      var badLen = lineLenBad(li, totalLines, coreLen, patLen);
      if (lastLineClosed && li === totalLines - 1 && coreLen > 0 && coreLen < patLen) badLen = true;

      html.push('<div class="compose-line-row' + (badLen ? " is-len-wrong" : "") + '">');

      var pi = 0;
      for (var ri = 0; ri < rawLine.length; ri++) {
        var ch = rawLine.charAt(ri);
        if (isPunct(ch)) {
          html.push('<span class="compose-punct">' + esc(ch) + "</span>");
          continue;
        }
        if (pi >= patLen) {
          html.push(
            '<span class="compose-ch-wrap"><span class="compose-ch-inner is-tone-overflow">' +
              esc(ch) +
              "</span></span>"
          );
          continue;
        }
        var exp = pat.charAt(pi);
        var expTone = exp === "平" ? "p" : exp === "仄" ? "z" : null;
        var got = toneOf(ch);
        var cls = "compose-ch-inner";
        if (expTone && got) cls += got === expTone ? " is-tone-ok" : " is-tone-bad";
        else cls += " is-tone-unknown";
        html.push('<span class="compose-ch-wrap"><span class="' + cls + '">' + esc(ch) + "</span></span>");
        pi++;
      }
      for (; pi < patLen; pi++) {
        html.push(
          '<span class="compose-ch-wrap"><span class="compose-ghost">' + esc(pat.charAt(pi)) + "</span></span>"
        );
      }
      html.push("</div>");
    }
    if (lines.length > patterns.length) {
      for (var ej = patterns.length; ej < lines.length; ej++) {
        var rest = lines[ej];
        if (stripPoemCharCount(rest) > 0) {
          html.push(
            '<div class="compose-line-row is-len-wrong"><span class="compose-ch-inner is-tone-overflow">' +
              esc(rest) +
              "</span></div>"
          );
        }
      }
    }
    return html.join("");
  }

  function buildGhostHtml(patterns) {
    if (!patterns || !patterns.length) return "";
    return patterns
      .map(function (pat) {
        var cells = "";
        for (var i = 0; i < pat.length; i++) {
          cells +=
            '<span class="compose-ch-wrap"><span class="compose-ghost">' +
            esc(pat.charAt(i)) +
            "</span></span>";
        }
        return '<div class="compose-line-row">' + cells + "</div>";
      })
      .join("");
  }

  function bindEditor(wrap, sel) {
    var ta = wrap.querySelector("[data-compose-field]");
    var ghost = wrap.querySelector("[data-compose-ghost]");
    var colored = wrap.querySelector("[data-compose-colored]");
    if (!ta || !ghost || !colored) return;

    function templateId() {
      return (sel && sel.value) || "free";
    }

    function patternsFor(id) {
      return LINE_PATTERNS[id] || null;
    }

    function setFreeMode(on) {
      wrap.classList.toggle("compose-editor-wrap--free", on);
    }

    function syncScroll() {
      var t = ta.scrollTop;
      ghost.scrollTop = t;
      colored.scrollTop = t;
    }

    function render() {
      var id = templateId();
      var pat = patternsFor(id);
      ta.placeholder = TEMPLATE_PLACEHOLDERS[id] || "";
      if (!pat) {
        setFreeMode(true);
        ghost.innerHTML = "";
        colored.innerHTML = "";
        if (!ta.placeholder) {
          ta.placeholder = "无格式创作：请输入诗句，每句一行。";
        }
        return;
      }
      setFreeMode(false);
      ghost.innerHTML = buildGhostHtml(pat);
      colored.innerHTML = buildColoredHtml(ta.value, pat, false);
    }

    function renderBlur() {
      var id = templateId();
      var pat = patternsFor(id);
      if (!pat) return;
      colored.innerHTML = buildColoredHtml(ta.value, pat, true);
    }

    ta.addEventListener("input", function () {
      render();
      syncScroll();
    });
    ta.addEventListener("scroll", syncScroll);
    ta.addEventListener("blur", function () {
      renderBlur();
      syncScroll();
    });
    if (sel) {
      sel.addEventListener("change", function () {
        render();
        syncScroll();
      });
    }
    render();
    syncScroll();
  }

  var roots = document.querySelectorAll("[data-compose-editor]");
  for (var r = 0; r < roots.length; r++) {
    var wrap = roots[r];
    var studio = wrap.closest("[data-compose-studio]");
    var sel = studio ? studio.querySelector("[data-compose-template]") : null;
    bindEditor(wrap, sel);
  }
})();

(function () {
  var stage = document.querySelector("[data-compose-stage]");
  if (!stage) return;
  var openBtn = document.querySelector("[data-compose-open]");
  var closeEls = Array.prototype.slice.call(stage.querySelectorAll("[data-compose-stage-close]"));

  function setOpen(on) {
    stage.classList.toggle("is-open", on);
    stage.setAttribute("aria-hidden", on ? "false" : "true");
    if (openBtn) openBtn.setAttribute("aria-expanded", on ? "true" : "false");
    if (on) {
      window.setTimeout(function () {
        var ta = stage.querySelector("[data-compose-field]");
        if (ta) ta.focus();
      }, 400);
    }
  }

  if (openBtn) {
    openBtn.addEventListener("click", function () {
      setOpen(true);
    });
  }

  closeEls.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setOpen(false);
      if (openBtn) openBtn.focus();
    });
  });

  document.addEventListener("keydown", function (e) {
    if (!stage.classList.contains("is-open")) return;
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      if (openBtn) openBtn.focus();
    }
  });
})();
