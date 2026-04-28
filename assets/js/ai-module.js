(function () {
  var API_BASE = (window.__POETRY_API_BASE__ || "http://127.0.0.1:3000/api").replace(/\/$/, "");

  function readConfig() {
    return { provider: "deepseek", apiKey: "" };
  }

  async function postChat(payload) {
    var res = await fetch(API_BASE + "/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
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
    var temperature = options && typeof options.temperature === "number" ? options.temperature : 0.7;
    var max_tokens = options && typeof options.max_tokens === "number" ? options.max_tokens : 900;

    var payload = {
      model: "deepseek-v3.2",
      temperature: temperature,
      max_tokens: max_tokens,
      messages: messages
    };

    var wrapped = await postChat(payload);
    var json = wrapped && wrapped.data ? wrapped.data : wrapped;
    return (
      (json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content) ||
      ""
    );
  }

  window.AIModule = {
    getConfig: readConfig,
    setApiKey: function () {
      return { provider: "deepseek", apiKey: "" };
    },
    clearApiKey: function () {
      return;
    },
    chatComplete: chatComplete
  };
})();

