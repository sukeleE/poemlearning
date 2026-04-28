(function () {
  function byId(id) {
    return document.getElementById(id);
  }

  var modal = byId("authModal");
  var accountBtn = byId("navAccountBtn");
  var accountMenu = byId("navAccountMenu");
  var accountMenuName = byId("navAccountMenuName");
  var accountMenuLogoutBtn = byId("navAccountLogoutBtn");
  var statusEl = byId("authStatus");
  var guestPanel = byId("authGuestPanel");
  var userPanel = byId("authUserPanel");
  var usernameEl = byId("authCurrentUsername");

  function setStatus(text, isError) {
    if (!statusEl) return;
    statusEl.textContent = text || "";
    statusEl.style.color = isError ? "rgba(159,59,47,0.95)" : "rgba(90,66,43,0.9)";
  }

  function getCurrentUser() {
    if (!window.DBService || !window.DBService.getCurrentUser) return { id: "u_guest", username: "游客" };
    return window.DBService.getCurrentUser();
  }

  function refreshAccountUI() {
    var user = getCurrentUser();
    var isGuest = !user || user.id === "u_guest";
    if (accountBtn) accountBtn.textContent = isGuest ? "登录" : user.username;
    if (accountMenuName) accountMenuName.textContent = isGuest ? "游客" : (user.username || "用户");
    if (accountMenu) {
      accountMenu.classList.remove("is-open");
      accountMenu.setAttribute("aria-hidden", "true");
    }
    if (guestPanel) guestPanel.style.display = isGuest ? "block" : "none";
    if (userPanel) userPanel.classList.toggle("is-active", !isGuest);
    if (usernameEl) usernameEl.textContent = isGuest ? "-" : (user.username || "-");
  }

  function openModal() {
    if (!modal) return;
    refreshAccountUI();
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    setStatus("欢迎使用诗境长卷。");
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }

  function toggleAccountMenu(show) {
    if (!accountMenu) return;
    var open = typeof show === "boolean" ? show : !accountMenu.classList.contains("is-open");
    accountMenu.classList.toggle("is-open", open);
    accountMenu.setAttribute("aria-hidden", open ? "false" : "true");
  }

  function switchTab(name) {
    var tabs = modal ? modal.querySelectorAll("[data-auth-tab]") : [];
    var panels = modal ? modal.querySelectorAll("[data-auth-panel]") : [];
    for (var i = 0; i < tabs.length; i++) {
      var active = tabs[i].getAttribute("data-auth-tab") === name;
      tabs[i].classList.toggle("is-active", active);
    }
    for (var j = 0; j < panels.length; j++) {
      var show = panels[j].getAttribute("data-auth-panel") === name;
      panels[j].classList.toggle("is-active", show);
    }
  }

  async function handleLogin() {
    if (!window.DBService || !window.DBService.login) {
      setStatus("数据服务未初始化。", true);
      return;
    }
    var username = (byId("authLoginUsername").value || "").trim();
    var password = (byId("authLoginPassword").value || "").trim();
    if (!username || !password) {
      setStatus("请输入用户名和密码。", true);
      return;
    }
    var result = await window.DBService.login(username, password);
    if (!result.success) {
      setStatus(result.message || "登录失败。", true);
      return;
    }
    refreshAccountUI();
    setStatus("登录成功。");
    closeModal();
  }

  async function handleRegister() {
    if (!window.DBService || !window.DBService.register || !window.DBService.login) {
      setStatus("数据服务未初始化。", true);
      return;
    }
    var username = (byId("authRegisterUsername").value || "").trim();
    var password = (byId("authRegisterPassword").value || "").trim();
    var confirm = (byId("authRegisterPasswordConfirm").value || "").trim();
    if (!username || !password) {
      setStatus("用户名和密码不能为空。", true);
      return;
    }
    if (password.length < 4) {
      setStatus("密码至少 4 位。", true);
      return;
    }
    if (password !== confirm) {
      setStatus("两次输入密码不一致。", true);
      return;
    }
    var reg = await window.DBService.register(username, password);
    if (!reg.success) {
      setStatus(reg.message || "注册失败。", true);
      return;
    }
    await window.DBService.login(username, password);
    refreshAccountUI();
    setStatus("注册并登录成功。");
    closeModal();
  }

  function handleLogout() {
    if (!window.DBService || !window.DBService.logout) return;
    window.DBService.logout();
    refreshAccountUI();
    setStatus("已退出登录。");
    switchTab("login");
    toggleAccountMenu(false);
  }

  function bind() {
    if (!modal || !accountBtn) return;
    refreshAccountUI();
    window.addEventListener("db:user-sync", refreshAccountUI);

    accountBtn.addEventListener("click", function () {
      var user = getCurrentUser();
      var isGuest = !user || user.id === "u_guest";
      if (isGuest) {
        openModal();
      } else {
        toggleAccountMenu();
      }
    });

    var closeEls = modal.querySelectorAll("[data-auth-close]");
    for (var i = 0; i < closeEls.length; i++) {
      closeEls[i].addEventListener("click", closeModal);
    }

    var tabs = modal.querySelectorAll("[data-auth-tab]");
    for (var j = 0; j < tabs.length; j++) {
      tabs[j].addEventListener("click", function (e) {
        switchTab(e.currentTarget.getAttribute("data-auth-tab"));
      });
    }

    var loginBtn = byId("authLoginSubmit");
    if (loginBtn) loginBtn.addEventListener("click", handleLogin);

    var registerBtn = byId("authRegisterSubmit");
    if (registerBtn) registerBtn.addEventListener("click", handleRegister);

    var logoutBtn = byId("authLogoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);
    if (accountMenuLogoutBtn) accountMenuLogoutBtn.addEventListener("click", handleLogout);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
      if (e.key === "Escape") toggleAccountMenu(false);
    });

    document.addEventListener("click", function (e) {
      if (!accountMenu || !accountBtn) return;
      var inBtn = accountBtn.contains(e.target);
      var inMenu = accountMenu.contains(e.target);
      if (!inBtn && !inMenu) toggleAccountMenu(false);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
