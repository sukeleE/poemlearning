(function () {
  var STORAGE_KEY = "poetry.ai.config.v1";

  // DeepSeek OpenAI-compatible
  var DEEPSEEK = {
    endpoint: "https://api.deepseek.com/v1/chat/completions",
    // 用户指定 DeepSeek-V3.2，若服务端不识别将自动回退
    modelPrimary: "deepseek-v3.2",
    modelFallback: "deepseek-chat"
  };

  function readConfig() {
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

  function writeConfig(next) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function ensureApiKey() {
    var cfg = readConfig();
    if (!cfg.apiKey) throw new Error("请先在右下角 AI 设置中填写 API Key（仅保存在本地浏览器）");
    return cfg.apiKey;
  }

  async function postChat(apiKey, payload) {
    var res = await fetch(DEEPSEEK.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      var msg = "AI 请求失败: " + res.status;
      try {
        var errJson = await res.json();
        if (errJson && errJson.error && errJson.error.message) msg += " - " + errJson.error.message;
      } catch (e) {}
      throw new Error(msg);
    }
    return await res.json();
  }

  async function chatComplete(messages, options) {
    var apiKey = ensureApiKey();
    var temperature = options && typeof options.temperature === "number" ? options.temperature : 0.7;
    var max_tokens = options && typeof options.max_tokens === "number" ? options.max_tokens : 900;

    var base = {
      model: DEEPSEEK.modelPrimary,
      temperature: temperature,
      max_tokens: max_tokens,
      messages: messages
    };

    try {
      var json = await postChat(apiKey, base);
      return (
        (json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content) ||
        ""
      );
    } catch (e) {
      // 兜底：部分账号/地区可能不认识 v3.2 模型名
      var retryPayload = Object.assign({}, base, { model: DEEPSEEK.modelFallback });
      var json2 = await postChat(apiKey, retryPayload);
      return (
        (json2.choices && json2.choices[0] && json2.choices[0].message && json2.choices[0].message.content) ||
        ""
      );
    }
  }

  window.AIModule = {
    getConfig: readConfig,
    setApiKey: function (apiKey) {
      var cfg = readConfig();
      writeConfig({ provider: "deepseek", apiKey: (apiKey || "").trim() });
      return cfg;
    },
    clearApiKey: function () {
      writeConfig({ provider: "deepseek", apiKey: "" });
    },
    chatComplete: chatComplete
  };
})();

