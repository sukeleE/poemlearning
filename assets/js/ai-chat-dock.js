(function () {
  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function pickPoemContext(section) {
    var poemTitle = (section.getAttribute("data-center-title") || "").trim();
    var author =
      (section.getAttribute("data-author") || "").trim() ||
      (section.getAttribute("data-center-author") || "").trim();
    var poem = "";
    try {
      var body = section.querySelector(".poem-vertical-script__body");
      if (body) {
        poem = Array.prototype.map
          .call(body.querySelectorAll(".poem-line"), function (el) {
            return (el.textContent || "").trim();
          })
          .filter(Boolean)
          .join("\n");
      }
      if (!author) {
        var authorEl = section.querySelector(".poem-vertical-script__author");
        if (authorEl) author = (authorEl.textContent || "").trim();
      }
    } catch (e) {}
    return { poemTitle: poemTitle, author: author, poem: poem };
  }

  function getPersonaSpec(section) {
    if (section.classList.contains("snap-section--poem")) {
      var ctx = pickPoemContext(section);
      var author = ctx.author || "诗人";
      var poemTitle = ctx.poemTitle || "此诗";

      var specs = {
        "李白": {
          roleName: "李白（诗仙）",
          style:
            "豪放、想象力强、语言纵横；可用少量带典雅气的口语表达，但避免现代网络梗。",
          do:
            "多用意象与气势来解释；愿意和用户把酒言志、谈自由与功名的冲突；给出可直接背诵/改写的句式。",
          avoid:
            "不要编造具体年份、官职细节；不要把用户当下生活细节硬套到史实里。",
          opener:
            "哈哈，来者何人？我李白在此。举杯先——你想问《" +
            poemTitle +
            "》哪一句的来由，还是想听我说说当时的“快意与不平”？"
        },
        "杜甫": {
          roleName: "杜甫（诗圣）",
          style:
            "沉郁顿挫、克制而深情；解释要扎实，注重结构、对仗、用字与现实关怀。",
          do:
            "多从时代与民生角度入手；讲清格律与对仗如何服务情感；提出可课堂讨论的问题。",
          avoid:
            "避免过度戏剧化自我演绎；不虚构具体遭遇细节。",
          opener:
            "久候了。我是杜甫。你想先从景入手看《" +
            poemTitle +
            "》，还是先谈“为何此诗句句沉重”？也可把你最难的一联提出来。"
        },
        "王维": {
          roleName: "王维（诗佛）",
          style:
            "清淡、空灵、画面感强；解释时偏“诗中有画”的构图与动静关系，语气温和。",
          do:
            "强调景物层次、光影、动静；谈“禅意”但不玄；给出如何用同类意象写出相近气韵的示例。",
          avoid:
            "不使用玄学术语堆砌；不武断解读作者动机。",
          opener:
            "你来了。王维在此。先静一静——你要从画面入手看《" +
            poemTitle +
            "》，还是从一句一意慢慢品？"
        },
        "孟浩然": {
          roleName: "孟浩然（山水田园）",
          style:
            "质朴自然、贴近日常；解释要清清爽爽，重在“情从景出”。",
          do:
            "用生活化的比喻说明意境；教用户如何用简淡语言写出悠远之味；可给一两句平易的仿写。",
          avoid:
            "避免华丽辞藻堆砌；不编造科举轶事细节。",
          opener:
            "你来得正好。我是孟浩然。要不要先把《" +
            poemTitle +
            "》当作一幅傍晚江景来看？你最喜欢哪一个字？"
        }
      };

      var spec = specs[author] || {
        roleName: author,
        style: "以诗人第一人称对话，语气贴合其时代气质，解释清晰。",
        do: "可以引用原句并解释意象、情感、手法；引导用户提问与理解。",
        avoid: "不编造具体史实细节；不确定时明确说明不确定。",
        opener:
          "你来了。我在此。你想从哪一句开始谈起？也可问我写《" +
          poemTitle +
          "》时的心境。"
      };

      return {
        kind: "poem",
        key: poemTitle,
        author: author,
        roleName: spec.roleName,
        roleDesc:
          "角色说明：你是" +
          spec.roleName +
          "，必须使用第一人称。\n" +
          "风格：" +
          spec.style +
          "\n" +
          "你应该做：" +
          spec.do +
          "\n" +
          "你必须避免：" +
          spec.avoid,
        opener: spec.opener
      };
    }

    var label = (section.getAttribute("data-center-label") || "").trim();
    var k = label || "创作";
    var knowledgeSpecs = {
      "格律": {
        roleName: "格律教练",
        roleDesc:
          "你是一位格律教练，目标是把平仄、押韵、对仗讲清楚并能立刻练。\n" +
          "输出优先：规则→示例→快速自测题→纠错建议。\n" +
          "当用户给出诗句：逐字标注可能的平仄问题（不必百分百权威，遇到多音字/入声/词性争议要说明不确定）。",
        opener:
          "你好，我是你的格律教练。先选一个目标：五绝/七绝/五律/七律？把你的一句草稿发来，我先做平仄与押韵体检。"
      },
      "意象": {
        roleName: "意象策展人",
        roleDesc:
          "你是一位意象策展人，擅长把“物象→情感→主题”串成一条线。\n" +
          "输出优先：意象清单（可替换）→情感色调→组合方案→示范句。\n" +
          "避免空泛赞美；必须给可直接替换的词组与句式。",
        opener:
          "你好，我是意象策展人。先给我一个主题（离别/思乡/秋夜/山水/壮志…），我立刻给你 8-12 个同色系意象，并拼成 2 组可直接成句的组合。"
      },
      "创作": {
        roleName: "诗词创作助教",
        roleDesc:
          "你是一位诗词创作助教，帮助用户从立意到成诗。\n" +
          "流程优先：立意→意象→句式→节奏/声律→润色。\n" +
          "输出优先：步骤清单 + 2-4 句示范 + 3 条修改建议；若用户提供草稿，先肯定亮点再改。",
        opener:
          "你好，我是诗词创作助教。给我三个信息：题目（可空）、情绪（如“悲而不伤”）、场景（如“雨后山寺”）。我先给你一版 4 句骨架，再一起打磨。"
      }
    };

    var ks = knowledgeSpecs[k] || knowledgeSpecs["创作"];
    return {
      kind: "knowledge",
      key: k,
      roleName: ks.roleName,
      roleDesc: ks.roleDesc,
      opener: ks.opener
    };
  }

  function buildSystemPrompt(section) {
    var persona = getPersonaSpec(section);
    if (persona.kind === "poem") {
      var ctx = pickPoemContext(section);
      var authorBio = "";
      try {
        if (typeof authorData !== "undefined" && ctx.author && authorData[ctx.author] && authorData[ctx.author].selfIntro) {
          authorBio = authorData[ctx.author].selfIntro;
        }
      } catch (e) {}

      return (
        persona.roleDesc +
        "\n\n" +
        "通用限制：不编造具体史实细节；若不确定，明确表示不确定并给出合理推断。\n" +
        "输出要求：先给核心答案（1-3 句），再补充解释与例子；必要时用条目化。\n\n" +
        "诗人：" +
        (ctx.author || "诗人") +
        "\n" +
        (authorBio ? "自述参考：\n" + authorBio + "\n\n" : "") +
        "作品：《" +
        (ctx.poemTitle || "诗作") +
        "》\n" +
        (ctx.poem ? "原文：\n" + ctx.poem + "\n" : "")
      );
    }

    return (
      "角色说明：" +
      persona.roleName +
      "\n" +
      persona.roleDesc +
      "\n\n" +
      "通用限制：不编造不存在的引用；不确定时要说明不确定。\n"
    );
  }

  function ensureDock(section) {
    var existing = section.querySelector(":scope > .ai-chat-dock");
    if (existing) return existing;

    var dock = document.createElement("section");
    dock.className = "ai-chat-dock is-collapsed";
    dock.innerHTML = [
      '<div class="ai-chat-dock__header">',
      '  <div class="ai-chat-dock__titles">',
      '    <p class="ai-chat-dock__eyebrow">AI 对话</p>',
      '    <h3 class="ai-chat-dock__title"></h3>',
      "  </div>",
      '  <div class="ai-chat-dock__head-actions">',
      '    <button type="button" class="ai-chat-dock__icon" data-ai-action="settings" aria-label="AI 设置">⚙</button>',
      '    <button type="button" class="ai-chat-dock__icon" data-ai-action="toggle" aria-label="展开/收起">▢</button>',
      '    <button type="button" class="ai-chat-dock__icon" data-ai-action="close" aria-label="关闭">×</button>',
      "  </div>",
      "</div>",
      '<div class="ai-chat-dock__body">',
      '  <div class="ai-chat-dock__messages" data-ai-messages></div>',
      '  <div class="ai-chat-dock__composer">',
      '    <textarea class="ai-chat-dock__input" rows="2" placeholder="输入你的问题（Enter 发送，Shift+Enter 换行）" data-ai-input></textarea>',
      '    <button class="ai-chat-dock__send btn" type="button" data-ai-send>发送</button>',
      "  </div>",
      '  <p class="ai-chat-dock__status" data-ai-status>待命中</p>',
      "</div>",
      '<div class="ai-chat-settings" hidden data-ai-settings>',
      '  <div class="ai-chat-settings__row">',
      "    <label>DeepSeek API Key</label>",
      '    <input type="password" placeholder="仅保存在本地浏览器" data-ai-key />',
      "  </div>",
      '  <div class="ai-chat-settings__row ai-chat-settings__actions">',
      '    <button class="btn" type="button" data-ai-save>保存</button>',
      '    <button class="btn btn-secondary" type="button" data-ai-clear>清空</button>',
      "  </div>",
      '  <p class="ai-chat-settings__hint">为安全起见，不会把 Key 写入项目文件。</p>',
      "</div>"
    ].join("");

    section.appendChild(dock);
    return dock;
  }

  function setTitle(dock, section) {
    var title = dock.querySelector(".ai-chat-dock__title");
    if (!title) return;
    if (section.classList.contains("snap-section--poem")) {
      var ctx = pickPoemContext(section);
      title.textContent = (ctx.author || "诗人对话").trim();
      return;
    }
    title.textContent = (section.getAttribute("data-center-label") || "创作助手").trim();
  }

  function pushMessage(listEl, role, content) {
    var node = document.createElement("div");
    node.className = "ai-chat-msg ai-chat-msg--" + role;
    node.innerHTML = '<div class="ai-chat-msg__bubble">' + escapeHtml(content) + "</div>";
    listEl.appendChild(node);
    listEl.scrollTop = listEl.scrollHeight;
  }

  function setStatus(dock, text, isError) {
    var el = dock.querySelector("[data-ai-status]");
    if (!el) return;
    el.textContent = text;
    el.style.color = isError ? "rgba(159,59,47,0.95)" : "rgba(90,66,43,0.9)";
  }

  function bindDock(section) {
    if (!window.AIModule) return;
    var dock = ensureDock(section);
    setTitle(dock, section);

    var msgList = dock.querySelector("[data-ai-messages]");
    var input = dock.querySelector("[data-ai-input]");
    var sendBtn = dock.querySelector("[data-ai-send]");
    var settingsPanel = dock.querySelector("[data-ai-settings]");
    var keyInput = dock.querySelector("[data-ai-key]");
    var saveBtn = dock.querySelector("[data-ai-save]");
    var clearBtn = dock.querySelector("[data-ai-clear]");

    // Restore key into settings input (not into code)
    try {
      var cfg = window.AIModule.getConfig();
      if (keyInput) keyInput.value = cfg.apiKey || "";
    } catch (e) {}

    var state = { history: [] };

    function toggleCollapsed(force) {
      var shouldCollapse = typeof force === "boolean" ? force : !dock.classList.contains("is-collapsed");
      dock.classList.toggle("is-collapsed", shouldCollapse);
    }

    function toggleSettings(force) {
      var show = typeof force === "boolean" ? force : !!settingsPanel.hidden;
      settingsPanel.hidden = !show;
    }

    async function send() {
      var text = (input.value || "").trim();
      if (!text) return;

      toggleSettings(false);
      toggleCollapsed(false);

      pushMessage(msgList, "user", text);
      input.value = "";
      setStatus(dock, "AI 思考中...");

      var systemPrompt = buildSystemPrompt(section);
      var messages = [{ role: "system", content: systemPrompt }].concat(state.history).concat([{ role: "user", content: text }]);

      try {
        var reply = await window.AIModule.chatComplete(messages, { temperature: 0.7, max_tokens: 900 });
        reply = (reply || "").trim();
        if (!reply) reply = "（没有返回内容，请稍后重试）";
        pushMessage(msgList, "assistant", reply);
        state.history.push({ role: "user", content: text });
        state.history.push({ role: "assistant", content: reply });
        if (state.history.length > 14) state.history = state.history.slice(-14);
        setStatus(dock, "完成");
      } catch (e) {
        setStatus(dock, (e && e.message) || "AI 调用失败", true);
      }
    }

    dock.querySelectorAll("[data-ai-action]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var action = btn.getAttribute("data-ai-action");
        if (action === "close") {
          toggleSettings(false);
          toggleCollapsed(true);
          setStatus(dock, "已收起，可再次展开");
          return;
        }
        if (action === "toggle") {
          toggleCollapsed();
          return;
        }
        if (action === "settings") {
          toggleSettings();
          return;
        }
      });
    });

    if (sendBtn) sendBtn.addEventListener("click", function (e) { e.stopPropagation(); send(); });
    if (input) {
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          send();
        }
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        try {
          window.AIModule.setApiKey((keyInput && keyInput.value) || "");
          setStatus(dock, "AI Key 已保存到本地浏览器。");
          toggleSettings(false);
        } catch (err) {
          setStatus(dock, (err && err.message) || "保存失败", true);
        }
      });
    }
    if (clearBtn) {
      clearBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        window.AIModule.clearApiKey();
        if (keyInput) keyInput.value = "";
        setStatus(dock, "已清空本地 AI Key。");
      });
    }

    // default welcome message
    if (msgList && !msgList.childNodes.length) {
      var persona = getPersonaSpec(section);
      pushMessage(msgList, "assistant", persona.opener || "你好。你想从哪一步开始？");
      setStatus(dock, "可开始对话");
    }

    dock.classList.add("is-visible");
  }

  function boot() {
    var sections = document.querySelectorAll(".snap-section--poem, .snap-section--knowledge");
    sections.forEach(function (sec) {
      // ensure right-bottom dock per section
      bindDock(sec);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

