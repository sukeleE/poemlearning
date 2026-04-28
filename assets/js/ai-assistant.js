(function () {
  var STORAGE_KEY = "poetry.ai.config.v1";

  var PROVIDERS = {
    deepseek: {
      endpoint: "https://api.deepseek.com/v1/chat/completions",
      model: "deepseek-chat"
    },
    qwen: {
      endpoint: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
      model: "qwen-plus"
    }
  };

  function qs(id) {
    return document.getElementById(id);
  }

  function getConfig() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { provider: "deepseek", apiKey: "" };
      var parsed = JSON.parse(raw);
      return {
        provider: parsed.provider || "deepseek",
        apiKey: parsed.apiKey || ""
      };
    } catch (e) {
      return { provider: "deepseek", apiKey: "" };
    }
  }

  function saveConfig(provider, apiKey) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        provider: provider,
        apiKey: apiKey
      })
    );
  }

  function setStatus(text, isError) {
    var statusEl = qs("ai-assistant-status");
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.style.color = isError ? "rgba(159,59,47,0.95)" : "rgba(90,66,43,0.9)";
  }

  function setComposeStatus(text, isError) {
    var statusEl = qs("compose-ai-status");
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.style.color = isError ? "rgba(159,59,47,0.95)" : "rgba(90,66,43,0.9)";
  }

  async function callAI(userPrompt, systemPrompt) {
    if (!window.AIModule || !window.AIModule.chatComplete) {
      throw new Error("AI 模块未初始化");
    }
    return window.AIModule.chatComplete(
      [
        {
          role: "system",
          content: systemPrompt || "你是一位古典诗词教学助手，回答要准确、清晰、可直接用于课堂。"
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      { temperature: 0.7, max_tokens: 900 }
    );
  }

  async function runTask(taskType) {
    var articleTitleEl = qs("article-title");
    var articleContentEl = qs("article-content");
    var outputEl = qs("ai-result-output");
    var customPromptEl = qs("ai-custom-prompt");
    if (!articleContentEl || !outputEl) return;

    var title = (articleTitleEl && articleTitleEl.value.trim()) || "无题";
    var content = (articleContentEl.value || "").trim();
    var customPrompt = (customPromptEl && customPromptEl.value.trim()) || "";

    if (!content) {
      setStatus("请先输入文章正文。", true);
      return;
    }

    var prompt = "";
    var systemPrompt = "你是一位古典诗词教学助手，回答要简洁、可直接用于课堂。";
    if (taskType === "polish") {
      prompt = "请润色以下古诗教学文章，使语言更准确、优雅且易懂，保留核心含义。\n标题：" + title + "\n正文：\n" + content;
    } else if (taskType === "continue") {
      prompt = "请延续以下文章风格续写两段，每段 80-120 字，逻辑连贯。\n标题：" + title + "\n正文：\n" + content;
    } else if (taskType === "rewrite") {
      prompt = "请将以下现代叙述改写为偏文言、但易教学理解的表达，保持原意。\n标题：" + title + "\n正文：\n" + content;
    } else if (taskType === "analysis") {
      prompt = "请为以下内容生成课堂赏析稿，包含：主题、结构、艺术手法、教学提示。\n标题：" + title + "\n正文：\n" + content;
    }

    if (customPrompt) {
      prompt += "\n补充要求：" + customPrompt;
    }

    try {
      setStatus("AI 生成中...");
      outputEl.value = "";
      var result = await callAI(prompt, systemPrompt);
      outputEl.value = result;
      setStatus("AI 生成完成。");
    } catch (e) {
      setStatus(e.message || "AI 调用失败", true);
    }
  }

  async function runPoemAnalysisTask() {
    var selectEl = qs("article-select");
    var poemTitleEl = qs("poem-title");
    var poemTextEl = qs("poem-text");
    var baseAnalysisEl = qs("article-analysis");
    var outputEl = qs("ai-poem-analysis-output");
    if (!outputEl) return;

    var selected = (selectEl && selectEl.value) || "";
    var title = (poemTitleEl && poemTitleEl.textContent.trim()) || selected || "诗作";
    var poem = "";
    if (poemTextEl) {
      poem = Array.prototype.map.call(poemTextEl.querySelectorAll("p"), function (p) {
        return p.textContent.trim();
      }).join("\n");
    }
    if (!poem) {
      setStatus("请先在诗词赏析区选择诗作。", true);
      return;
    }

    var baseAnalysis = "";
    if (baseAnalysisEl) {
      baseAnalysis = Array.prototype.map
        .call(baseAnalysisEl.querySelectorAll("p"), function (p) { return (p.textContent || "").trim(); })
        .filter(Boolean)
        .join("\n");
    }

    try {
      setStatus("AI 正在生成深度赏析...");
      outputEl.value = "";
      var result = await callAI(
        "请对下面这首诗生成“课堂可直接使用”的深度赏析讲义，按以下固定结构输出：\n" +
          "【一、30秒速讲】2-3句概括主旨与情绪。\n" +
          "【二、逐句精读】逐句解释（字面义+情感义+修辞/炼字）。\n" +
          "【三、意象与结构】说明核心意象、叙事/抒情推进路径。\n" +
          "【四、高频考点】至少4条（手法、情感、主旨、炼字、语言风格）。\n" +
          "【五、易错点纠偏】至少3条，采用“误区→纠正”。\n" +
          "【六、课堂提问设计】基础题2个、进阶题2个、开放题1个，并给参考答案。\n" +
          "【七、迁移写作】给1个仿写任务（含评价维度）。\n" +
          "【八、板书建议】给可抄写的板书框架（不超过8行）。\n\n" +
          "题目：" + title + "\n原文：\n" + poem +
          (baseAnalysis ? ("\n\n已有人类赏析（可吸收但不要照抄）：\n" + baseAnalysis) : ""),
        "你是一位高中语文古诗词教研员。要求：内容准确、结构化、可直接课堂落地；先结论后展开；避免空泛套话。"
      );
      outputEl.value = result;
      setStatus("深度赏析生成完成。");
    } catch (e) {
      setStatus(e.message || "AI 调用失败", true);
    }
  }

  async function runComposeTask(taskType) {
    var providerSel = qs("compose-ai-provider-select");
    var apiKeyInput = qs("compose-ai-api-key");
    var outputEl = qs("compose-ai-output");
    var customPromptEl = qs("compose-ai-custom-prompt");
    var templateSel = qs("drum-compose-template");
    var composeTextEl = qs("poem-compose-text");
    var hintCi = document.querySelector("#drum-tower-popup [data-hint-cipai]");
    var hintGe = document.querySelector("#drum-tower-popup [data-hint-gelv]");
    var hintPz = document.querySelector("#drum-tower-popup [data-hint-pingze]");
    if (!outputEl || !composeTextEl) return;

    var content = (composeTextEl.value || "").trim();
    var customPrompt = (customPromptEl && customPromptEl.value.trim()) || "";
    if (!content) {
      setComposeStatus("请先在创作区输入诗句。", true);
      return;
    }

    var templateName = (templateSel && templateSel.options[templateSel.selectedIndex] && templateSel.options[templateSel.selectedIndex].text) || "未指定";
    var meterGuide = (hintGe && hintGe.textContent) || "";
    var toneGuide = (hintPz && hintPz.textContent) || "";
    var styleGuide = (hintCi && hintCi.textContent) || "";
    var systemPrompt = "你是一位古典诗词创作教练，输出要专业、简洁、可直接用于教学训练。";
    var prompt = "";

    if (taskType === "imagery") {
      prompt =
        "请基于以下诗稿与体式，给出 8-12 个可选意象，并按“自然/时令/情绪/动作”分组，每个意象附一句使用建议。\n" +
        "体式：" + templateName + "；诗体说明：" + styleGuide + "。\n" +
        "诗稿：\n" + content;
    } else if (taskType === "meter") {
      prompt =
        "请对下列诗稿做逐句格律指导，指出句式与平仄/节奏是否协调，并给出可替换字词建议。\n" +
        "格律提示：" + meterGuide + "\n平仄提示：" + toneGuide + "\n诗稿：\n" + content;
    } else if (taskType === "optimize") {
      prompt =
        "请整体优化下列诗稿，要求：保留原意，提升凝练度与画面感，并给出“优化稿 + 修改说明（逐句）”。\n" +
        "体式：" + templateName + "。\n诗稿：\n" + content;
    } else if (taskType === "analysis") {
      prompt =
        "请对下列诗稿给出课堂可用评析：主题、意象组织、格律节奏、语言优缺点、可提升方向。\n" +
        "体式：" + templateName + "。\n诗稿：\n" + content;
    }

    if (customPrompt) {
      prompt += "\n补充要求：" + customPrompt;
    }

    try {
      setComposeStatus("AI 生成中...");
      outputEl.value = "";
      var text = await window.AIModule.chatComplete(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        { temperature: 0.7, max_tokens: 900 }
      );
      outputEl.value = text;
      setComposeStatus("AI 生成完成。");
    } catch (e) {
      setComposeStatus(e.message || "AI 调用失败", true);
    }
  }

  function bind() {
    var cfg = getConfig();
    var providerSel = qs("ai-provider-select");
    var apiKeyInput = qs("ai-api-key");
    if (providerSel) providerSel.value = cfg.provider;
    if (apiKeyInput) apiKeyInput.value = cfg.apiKey;

    var saveBtn = qs("ai-save-config-btn");
    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        setStatus("当前为后台统一 Key 模式，无需手动配置。");
      });
    }

    var actionMap = [
      { id: "ai-polish-btn", type: "polish" },
      { id: "ai-continue-btn", type: "continue" },
      { id: "ai-rewrite-btn", type: "rewrite" },
      { id: "ai-analysis-btn", type: "analysis" }
    ];
    actionMap.forEach(function (item) {
      var btn = qs(item.id);
      if (!btn) return;
      btn.addEventListener("click", function () {
        runTask(item.type);
      });
    });

    var replaceBtn = qs("ai-apply-replace-btn");
    var appendBtn = qs("ai-apply-append-btn");
    var articleContentEl = qs("article-content");
    var outputEl = qs("ai-result-output");

    if (replaceBtn) {
      replaceBtn.addEventListener("click", function () {
        if (!articleContentEl || !outputEl) return;
        if (!outputEl.value.trim()) {
          setStatus("没有可回填的 AI 结果。", true);
          return;
        }
        articleContentEl.value = outputEl.value;
        setStatus("已替换正文。");
      });
    }

    if (appendBtn) {
      appendBtn.addEventListener("click", function () {
        if (!articleContentEl || !outputEl) return;
        if (!outputEl.value.trim()) {
          setStatus("没有可回填的 AI 结果。", true);
          return;
        }
        articleContentEl.value = (articleContentEl.value || "") + "\n\n" + outputEl.value;
        setStatus("已追加到正文。");
      });
    }

    var poemAnalysisBtn = qs("ai-poem-analysis-btn");
    if (poemAnalysisBtn) {
      poemAnalysisBtn.addEventListener("click", runPoemAnalysisTask);
    }

    var composeProviderSel = qs("compose-ai-provider-select");
    var composeApiKeyInput = qs("compose-ai-api-key");
    if (composeProviderSel) composeProviderSel.value = cfg.provider;
    if (composeApiKeyInput) composeApiKeyInput.value = cfg.apiKey;

    var composeSaveBtn = qs("compose-ai-save-config-btn");
    if (composeSaveBtn) {
      composeSaveBtn.addEventListener("click", function () {
        setComposeStatus("当前为后台统一 Key 模式，无需手动配置。");
      });
    }

    [
      { id: "compose-ai-imagery-btn", type: "imagery" },
      { id: "compose-ai-meter-btn", type: "meter" },
      { id: "compose-ai-optimize-btn", type: "optimize" },
      { id: "compose-ai-analysis-btn", type: "analysis" }
    ].forEach(function (item) {
      var btn = qs(item.id);
      if (!btn) return;
      btn.addEventListener("click", function () {
        runComposeTask(item.type);
      });
    });

    var composeReplaceBtn = qs("compose-ai-apply-replace-btn");
    var composeAppendBtn = qs("compose-ai-apply-append-btn");
    var composeOutputEl = qs("compose-ai-output");
    var composeTextEl = qs("poem-compose-text");

    if (composeReplaceBtn) {
      composeReplaceBtn.addEventListener("click", function () {
        if (!composeOutputEl || !composeTextEl) return;
        if (!composeOutputEl.value.trim()) {
          setComposeStatus("没有可回填的 AI 结果。", true);
          return;
        }
        composeTextEl.value = composeOutputEl.value;
        composeTextEl.dispatchEvent(new Event("input", { bubbles: true }));
        setComposeStatus("已替换创作区。");
      });
    }

    if (composeAppendBtn) {
      composeAppendBtn.addEventListener("click", function () {
        if (!composeOutputEl || !composeTextEl) return;
        if (!composeOutputEl.value.trim()) {
          setComposeStatus("没有可回填的 AI 结果。", true);
          return;
        }
        composeTextEl.value = (composeTextEl.value || "") + "\n\n" + composeOutputEl.value;
        composeTextEl.dispatchEvent(new Event("input", { bubbles: true }));
        setComposeStatus("已追加到创作区。");
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
