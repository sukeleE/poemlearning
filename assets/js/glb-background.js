(function () {
  /**
   * 本项目约定：3D 背景模块只属于 index.html 最后的子页面 `#scene3d`。
   * - 只在 `#scene3d` 内挂载 `.glb-bg-stage`，不再 append 到 body
   * - 只有当 `#scene3d` 在滚动容器中可见时才启动渲染循环与交互更新
   * - 运镜进度只按 `#scene3d` 区域的相对滚动进度计算
   */

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function ensureBackgroundLayer() {
    var stage = document.querySelector(".glb-bg-stage");
    if (!stage) {
      stage = document.createElement("div");
      stage.className = "glb-bg-stage";
    }
    if (stage.parentElement !== document.body) {
      document.body.appendChild(stage);
    }
    return stage;
  }

  function safeFog(scene, THREE) {
    // disabled: user requested removing fog
    scene.fog = null;
  }

  async function init() {
    try {
      if (typeof THREE === "undefined" || !THREE.GLTFLoader) {
        await loadScript("assets/js/vendor/three-gltf-legacy.js");
      }
    } catch (e) {
      console.error("[glb-background] three bundle failed to load", location.href, e);
      return;
    }

    if (typeof THREE === "undefined" || !THREE.GLTFLoader) return;

    var stage = ensureBackgroundLayer();
    if (!stage) return;

    var hostSection = document.querySelector("#scene3d");
    var scroller = document.querySelector("[data-scroll-snap-root]");

    // 清空容器，避免重复初始化时叠加 canvas
    stage.innerHTML = "";
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    // ===== 渲染器参数：按对照项目风格照抄 =====
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    if (THREE.PCFSoftShadowMap) renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if ("outputEncoding" in renderer && THREE.sRGBEncoding) {
      renderer.outputEncoding = THREE.sRGBEncoding;
    } else if ("outputColorSpace" in renderer && THREE.SRGBColorSpace) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    // 更贴近“自然太阳光”的能量模型（兼容旧版 three）
    if ("physicallyCorrectLights" in renderer) renderer.physicallyCorrectLights = true;
    stage.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    // 不启用雾化效果
    scene.fog = null;

    // 相机参数：按对照项目照抄
    var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(2, 11, 25);
    camera.rotation.x = -0.1;
    camera.rotation.y = 0.1;
    camera.rotation.z = 0;
    // 通过镜头横向偏移把“主体”推到画面左侧（不做 CSS 分屏）
    // 说明：filmOffset 的方向与视觉效果相关，这里采用更强的偏移，并在 resize 时自适应
    function setCompositionOffset() {
      // 固定居中构图：取消横向偏移
      camera.filmOffset = 0;
      camera.updateProjectionMatrix();
    }
    setCompositionOffset();
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    var interactiveObjects = {
      pavilion: null,
      "drum-tower": null,
      "bulletin-board": null,
    };
    var currentPanelId = null;
    var switchBound = false;
    var currentActiveObject = null;
    var currentHoverObject = null;
    var isAnimating = false;
    var cameraAnim = null;

    // 自然日光：太阳主光（暖）+ 天空/地面散射（半球）+ 冷色辅光
    scene.add(new THREE.HemisphereLight(0xcfe7ff, 0x2a241e, 0.55));

    var directionalLight = new THREE.DirectionalLight(0xfff1d1, 1.35);
    directionalLight.position.set(18, 26, 14); // 更像“高空斜射”的太阳
    directionalLight.target.position.set(0, 0, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.bias = -0.001;
    // 稳定且柔和的太阳阴影范围
    if (directionalLight.shadow && directionalLight.shadow.camera) {
      directionalLight.shadow.camera.left = -22;
      directionalLight.shadow.camera.right = 22;
      directionalLight.shadow.camera.top = 22;
      directionalLight.shadow.camera.bottom = -22;
    }
    if ("shadow" in directionalLight && directionalLight.shadow) {
      directionalLight.shadow.normalBias = 0.02;
    }
    scene.add(directionalLight);

    // 必须把 target 加入场景，方向光才会正确指向
    scene.add(directionalLight.target);

    var fillLight = new THREE.DirectionalLight(0x4fc3f7, 0.4);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    var root = new THREE.Group();
    scene.add(root);

    function activateScene3dPanel(objectName) {
      var panelId = objectName + "-popup";
      var panel = document.getElementById(panelId);
      if (!panel) return;
      bindRealModules();

      var hint = document.getElementById("scene3dCollapsedHint");
      if (hint) hint.style.display = "none";

      var panels = document.querySelectorAll("#scene3d .scene3d-panel");
      for (var i = 0; i < panels.length; i++) panels[i].classList.remove("is-open");
      panel.classList.add("is-open");
      currentPanelId = panelId;
      currentActiveObject = objectName;
      updateHighlightState();

      var switches = document.querySelectorAll("#scene3d [data-scene3d-switch]");
      for (var j = 0; j < switches.length; j++) {
        switches[j].classList.toggle("is-active", switches[j].getAttribute("data-scene3d-switch") === objectName);
      }

      if (objectName === "pavilion") renderPavilionPoem();
      if (objectName === "drum-tower") loadDraft();
      if (objectName === "bulletin-board") renderBulletinBoard();
    }

    function collapseScene3dPanels() {
      var panels = document.querySelectorAll("#scene3d .scene3d-panel");
      for (var i = 0; i < panels.length; i++) panels[i].classList.remove("is-open");
      currentPanelId = null;
      currentActiveObject = null;

      var hint = document.getElementById("scene3dCollapsedHint");
      if (hint) hint.style.display = "";

      var switches = document.querySelectorAll("#scene3d [data-scene3d-switch]");
      for (var j = 0; j < switches.length; j++) switches[j].classList.remove("is-active");
      updateHighlightState();
    }

    function easeInOut(t) {
      return t * t * (3 - 2 * t);
    }

    function computeRotationForLookAt(pos, target) {
      var tmp = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
      tmp.position.copy(pos);
      tmp.lookAt(target);
      return tmp.rotation.clone();
    }

    function startCameraFlyTo(objectName, object3d) {
      if (!object3d) {
        activateScene3dPanel(objectName);
        return;
      }

      collapseScene3dPanels();

      var box = new THREE.Box3().setFromObject(object3d);
      var center = box.getCenter(new THREE.Vector3());
      // 距离以“整座浮岛/整模型”为准，避免只看到局部
      var sceneSphere = new THREE.Sphere();
      var sceneBox = new THREE.Box3().setFromObject(currentModel || root);
      sceneBox.getBoundingSphere(sceneSphere);

      var fov = (camera.fov * Math.PI) / 180;
      var sceneRadius = Math.max(1, sceneSphere.radius || 6);
      // dist：确保整座浮岛基本可见；再给一点余量
      var dist = (sceneRadius / Math.tan(fov / 2)) * 1.15;

      // 视角方向：从右后方看向目标，略俯视（贴近对照项目的“飞入”气质）
      var dir = new THREE.Vector3(0.35, 0.15, 1).normalize();
      if (objectName === "drum-tower") dir.set(0.45, 0.12, 1).normalize();
      if (objectName === "bulletin-board") dir.set(0.25, 0.1, 1).normalize();

      // 位置：以目标为中心偏移 dist，额外抬高一点
      var toPos = center.clone().add(dir.multiplyScalar(dist));
      toPos.y += Math.min(8, sceneRadius * 0.35);

      // 通过整体 x 偏移把主体更稳定留在左侧（配合 filmOffset）
      toPos.x -= Math.min(8, sceneRadius * 0.32);

      var toRot = computeRotationForLookAt(toPos, center);

      cameraAnim = {
        start: performance.now(),
        duration: 950,
        fromPos: camera.position.clone(),
        toPos: toPos,
        fromRot: camera.rotation.clone(),
        toRot: toRot,
        objectName: objectName,
      };
      isAnimating = true;
    }

    function setupScene3dSwitchButtons() {
      if (switchBound) return;
      switchBound = true;
      var buttons = document.querySelectorAll("#scene3d [data-scene3d-switch]");
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function () {
          var target = this.getAttribute("data-scene3d-switch");
          if (!target) return;
          // 点击按钮同样走“先收回卡片 -> 飞入 -> 打开卡片”
          var obj = interactiveObjects[target] || null;
          startCameraFlyTo(target, obj);
        });
      }
    }

    var STORAGE_KEY = "scene3d_articles_v1";
    var DRAFT_KEY = "scene3d_draft_v1";
    var moduleBound = false;
    var poetryDB = {
      jiangjinjiu: {
        title: "将进酒",
        author: "李白",
        text: [
          "君不见黄河之水天上来，奔流到海不复回。",
          "君不见高堂明镜悲白发，朝如青丝暮成雪。",
          "人生得意须尽欢，莫使金樽空对月。",
          "天生我材必有用，千金散尽还复来。",
        ],
        analysis: "以夸张时空与复沓呼告制造情绪浪潮，核心是对有限人生的强力反抗。",
      },
      denggao: {
        title: "登高",
        author: "杜甫",
        text: [
          "风急天高猿啸哀，渚清沙白鸟飞回。",
          "无边落木萧萧下，不尽长江滚滚来。",
          "万里悲秋常作客，百年多病独登台。",
          "艰难苦恨繁霜鬓，潦倒新停浊酒杯。",
        ],
        analysis: "工稳对仗承载历史感与个体苦难，形成沉郁顿挫的压强结构。",
      },
      shanju: {
        title: "山居秋暝",
        author: "王维",
        text: [
          "空山新雨后，天气晚来秋。",
          "明月松间照，清泉石上流。",
          "竹喧归浣女，莲动下渔舟。",
          "随意春芳歇，王孙自可留。",
        ],
        analysis: "以动衬静、通感互文，构建可居可悟的山居审美秩序。",
      },
      sujiandejiang: {
        title: "宿建德江",
        author: "孟浩然",
        text: ["移舟泊烟渚，日暮客愁新。", "野旷天低树，江清月近人。"],
        analysis: "极简意象完成羁旅情绪投射，“月近人”体现心理距离的慰藉。",
      },
    };

    function readArticles() {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        var list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list : [];
      } catch (e) {
        return [];
      }
    }

    function writeArticles(list) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }

    function renderPavilionPoem() {
      var select = document.getElementById("scene3dPoemSelect");
      var titleEl = document.getElementById("scene3dPoemTitle");
      var authorEl = document.getElementById("scene3dPoemAuthor");
      var textEl = document.getElementById("scene3dPoemText");
      var analysisEl = document.getElementById("scene3dPoemAnalysis");
      if (!select || !titleEl || !authorEl || !textEl || !analysisEl) return;
      var item = poetryDB[select.value] || poetryDB.jiangjinjiu;
      titleEl.textContent = item.title;
      authorEl.textContent = item.author;
      textEl.innerHTML = item.text.map(function (line) { return "<p>" + line + "</p>"; }).join("");
      analysisEl.textContent = item.analysis;
    }

    function loadDraft() {
      var raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      try {
        var d = JSON.parse(raw);
        var t = document.getElementById("scene3dArticleTitle");
        var a = document.getElementById("scene3dArticleAuthor");
        var c = document.getElementById("scene3dArticleContent");
        if (t) t.value = d.title || "";
        if (a) a.value = d.author || "";
        if (c) c.value = d.content || "";
      } catch (e) {}
    }

    function setEditorMsg(msg) {
      var el = document.getElementById("scene3dEditorMsg");
      if (el) el.textContent = msg || "";
    }

    function saveDraft() {
      var t = document.getElementById("scene3dArticleTitle");
      var a = document.getElementById("scene3dArticleAuthor");
      var c = document.getElementById("scene3dArticleContent");
      if (!t || !a || !c) return;
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ title: t.value.trim(), author: a.value.trim(), content: c.value.trim(), updatedAt: Date.now() })
      );
      setEditorMsg("草稿已保存");
    }

    function clearDraft() {
      var t = document.getElementById("scene3dArticleTitle");
      var a = document.getElementById("scene3dArticleAuthor");
      var c = document.getElementById("scene3dArticleContent");
      if (t) t.value = "";
      if (a) a.value = "";
      if (c) c.value = "";
      localStorage.removeItem(DRAFT_KEY);
      setEditorMsg("已清空");
    }

    function publishArticle() {
      var t = document.getElementById("scene3dArticleTitle");
      var a = document.getElementById("scene3dArticleAuthor");
      var c = document.getElementById("scene3dArticleContent");
      if (!t || !c) return;
      var title = (t.value || "").trim();
      var author = ((a && a.value) || "").trim() || "匿名";
      var content = (c.value || "").trim();
      if (!title || !content) {
        setEditorMsg("请填写标题与正文");
        return;
      }
      var list = readArticles();
      list.unshift({
        id: String(Date.now()),
        title: title,
        author: author,
        content: content,
        likes: 0,
        comments: [],
        createdAt: Date.now(),
      });
      writeArticles(list);
      setEditorMsg("发布成功，已同步到布告栏");
      localStorage.removeItem(DRAFT_KEY);
      renderBulletinBoard();
    }

    function renderBulletinBoard() {
      var container = document.getElementById("scene3dBulletinList");
      if (!container) return;
      var list = readArticles();
      if (!list.length) {
        container.innerHTML = "<p class='hero-sub'>暂无发布内容，去鼓楼写下第一篇吧。</p>";
        return;
      }
      container.innerHTML = list
        .map(function (item) {
          var comments = (item.comments || [])
            .map(function (c) {
              return "<p style='margin:4px 0; font-size:0.9rem;'>• " + c + "</p>";
            })
            .join("");
          return (
            "<article class='card' data-article-id='" +
            item.id +
            "' style='margin-bottom:10px;'>" +
            "<h4 style='margin:0 0 4px;'>" +
            item.title +
            "</h4>" +
            "<p class='hero-sub' style='margin:0 0 6px;'>" +
            item.author +
            " · " +
            new Date(item.createdAt).toLocaleString() +
            "</p>" +
            "<p style='margin:0 0 8px; white-space:pre-wrap;'>" +
            item.content +
            "</p>" +
            "<div style='display:flex; gap:8px; margin-bottom:6px;'>" +
            "<button class='mini-btn' data-action='like'>点赞 (" +
            (item.likes || 0) +
            ")</button>" +
            "</div>" +
            "<div style='display:flex; gap:6px; margin-bottom:6px;'>" +
            "<input class='compose-select' data-comment-input placeholder='写评论...' style='flex:1;' />" +
            "<button class='mini-btn' data-action='comment'>发布</button>" +
            "</div>" +
            "<div>" +
            comments +
            "</div>" +
            "</article>"
          );
        })
        .join("");
    }

    function bindRealModules() {
      if (moduleBound) return;
      moduleBound = true;

      var poemSelect = document.getElementById("scene3dPoemSelect");
      if (poemSelect) {
        poemSelect.addEventListener("change", renderPavilionPoem);
      }

      var saveBtn = document.getElementById("scene3dSaveDraftBtn");
      var pubBtn = document.getElementById("scene3dPublishBtn");
      var clearBtn = document.getElementById("scene3dClearDraftBtn");
      if (saveBtn) saveBtn.addEventListener("click", saveDraft);
      if (pubBtn) pubBtn.addEventListener("click", publishArticle);
      if (clearBtn) clearBtn.addEventListener("click", clearDraft);

      var board = document.getElementById("scene3dBulletinList");
      if (board) {
        board.addEventListener("click", function (e) {
          var btn = e.target.closest("button[data-action]");
          if (!btn) return;
          var card = e.target.closest("[data-article-id]");
          if (!card) return;
          var id = card.getAttribute("data-article-id");
          var list = readArticles();
          var idx = list.findIndex(function (a) { return a.id === id; });
          if (idx < 0) return;

          var action = btn.getAttribute("data-action");
          if (action === "like") {
            list[idx].likes = (list[idx].likes || 0) + 1;
          } else if (action === "comment") {
            var input = card.querySelector("[data-comment-input]");
            var text = input && input.value ? input.value.trim() : "";
            if (!text) return;
            list[idx].comments = list[idx].comments || [];
            list[idx].comments.push(text);
          }
          writeArticles(list);
          renderBulletinBoard();
        });
      }

      loadDraft();
      renderPavilionPoem();
      renderBulletinBoard();
    }

    function getMeshNameHierarchy(mesh) {
      var parts = [];
      var o = mesh;
      while (o) {
        if (o.name && String(o.name).trim()) parts.unshift(o.name);
        o = o.parent;
      }
      return parts.join(" / ");
    }

    function collectInteractiveObjectsFromModel(modelObj) {
      interactiveObjects.pavilion = null;
      interactiveObjects["drum-tower"] = null;
      interactiveObjects["bulletin-board"] = null;

      modelObj.traverse(function (child) {
        if (!child || !child.isMesh) return;
        var hRaw = getMeshNameHierarchy(child);
        var h = hRaw.toLowerCase();
        var isPavilion =
          h.includes("亭") || h.includes("pavilion") || h.includes("gazebo") || h.includes("pagoda") || h.includes("guting");
        var isDrum =
          !isPavilion &&
          (h.includes("鼓楼") || h.includes("drum") || h.includes("tower") || h.includes("drumtower") || h.includes("gulou"));
        var isBulletin =
          !isPavilion && (h.includes("布告") || h.includes("bulletin") || h.includes("notice") || h.includes("board"));

        if (isPavilion && !interactiveObjects.pavilion) interactiveObjects.pavilion = child;
        if (isDrum && !interactiveObjects["drum-tower"]) interactiveObjects["drum-tower"] = child;
        if (isBulletin && !interactiveObjects["bulletin-board"]) interactiveObjects["bulletin-board"] = child;
      });
    }

    function findInteractiveRoot(hitObject) {
      var target = hitObject;
      var vals = [interactiveObjects.pavilion, interactiveObjects["drum-tower"], interactiveObjects["bulletin-board"]];
      while (target && vals.indexOf(target) === -1) target = target.parent;
      return target;
    }

    function getInteractiveNameByObject(obj) {
      if (!obj) return null;
      if (interactiveObjects.pavilion === obj) return "pavilion";
      if (interactiveObjects["drum-tower"] === obj) return "drum-tower";
      if (interactiveObjects["bulletin-board"] === obj) return "bulletin-board";
      return null;
    }

    function createHaloSpriteForObject(object) {
      var box = new THREE.Box3().setFromObject(object);
      var center = box.getCenter(new THREE.Vector3());
      var size = box.getSize(new THREE.Vector3());
      var maxDimension = Math.max(size.x, size.y, size.z);

      var canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      var ctx = canvas.getContext("2d");
      var gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
      gradient.addColorStop(0, "rgba(255,255,255,0)");
      gradient.addColorStop(0.8, "rgba(255,255,255,0.2)");
      gradient.addColorStop(0.9, "rgba(255,255,255,0.4)");
      gradient.addColorStop(0.95, "rgba(255,255,255,0.2)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      var texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      var material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      var sprite = new THREE.Sprite(material);
      var spriteSize = maxDimension * 1.5;
      sprite.scale.set(spriteSize, spriteSize, 1);
      sprite.position.copy(center);
      sprite.userData.baseScale = spriteSize;
      return sprite;
    }

    function setObjectHighlight(objectName, on) {
      var object = interactiveObjects[objectName];
      if (!object) return;
      if (object.userData && object.userData.highlightSprite) {
        scene.remove(object.userData.highlightSprite);
        object.userData.highlightSprite.material.dispose();
        object.userData.highlightSprite.material.map.dispose();
        object.userData.highlightSprite = null;
      }
      if (on) {
        object.userData = object.userData || {};
        object.userData.highlightSprite = createHaloSpriteForObject(object);
        scene.add(object.userData.highlightSprite);
      }
    }

    function updateHighlightState() {
      var keys = ["pavilion", "drum-tower", "bulletin-board"];
      for (var i = 0; i < keys.length; i++) {
        var name = keys[i];
        var on = name === currentActiveObject || (currentHoverObject && name === currentHoverObject);
        setObjectHighlight(name, on);
      }
    }

    function updateHighlightAnimations() {
      var keys = ["pavilion", "drum-tower", "bulletin-board"];
      var time = Date.now() * 0.001;
      for (var i = 0; i < keys.length; i++) {
        var object = interactiveObjects[keys[i]];
        if (!object || !object.userData || !object.userData.highlightSprite) continue;
        var sprite = object.userData.highlightSprite;
        var pulseOpacity = 0.5 + Math.sin(time * 1.4) * 0.1;
        var pulseScale = 1 + Math.sin(time * 1.8) * 0.15;
        sprite.material.opacity = pulseOpacity;
        var baseScale = sprite.userData.baseScale || sprite.scale.x;
        sprite.scale.set(baseScale * pulseScale, baseScale * pulseScale, 1);
      }
    }

    // ===== 桃花粒子系统：按对照项目照抄（Plane + 透明贴图 + 下落/漂移/自旋转） =====
    var peachBlossomParticles = [];
    var peachBlossomGeometry = new THREE.PlaneGeometry(1, 1);

    function makePetalTexture() {
      // 对照项目用外部 PNG；本项目生成近似透明纹理以保持相同渲染方式
      var c = document.createElement("canvas");
      c.width = 256;
      c.height = 256;
      var ctx = c.getContext("2d");
      ctx.clearRect(0, 0, c.width, c.height);

      ctx.translate(128, 140);
      ctx.rotate(-0.15);
      ctx.translate(-128, -140);

      ctx.beginPath();
      ctx.moveTo(128, 40);
      ctx.bezierCurveTo(60, 60, 42, 150, 128, 210);
      ctx.bezierCurveTo(214, 150, 196, 60, 128, 40);
      ctx.closePath();

      var g = ctx.createRadialGradient(128, 120, 20, 128, 120, 140);
      g.addColorStop(0, "rgba(255, 210, 226, 0.95)");
      g.addColorStop(0.6, "rgba(255, 190, 214, 0.65)");
      g.addColorStop(1, "rgba(255, 190, 214, 0)");
      ctx.fillStyle = g;
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(118, 110, 26, 40, 0.2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fill();

      var tex = new THREE.CanvasTexture(c);
      if ("colorSpace" in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    }

    var peachBlossomMaterial = new THREE.MeshBasicMaterial({
      map: makePetalTexture(),
      transparent: true,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
    });

    function initPeachBlossomParticles() {
      peachBlossomParticles.forEach(function (p) {
        scene.remove(p.mesh);
      });
      peachBlossomParticles = [];

      for (var i = 0; i < 50; i++) {
        var particle = new THREE.Mesh(peachBlossomGeometry, peachBlossomMaterial);
        particle.position.set((Math.random() - 0.5) * 20, Math.random() * 10 + 15, (Math.random() - 0.5) * 10);
        particle.scale.set(0.3, 0.3, 0.3);
        particle.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
        scene.add(particle);

        peachBlossomParticles.push({
          mesh: particle,
          speed: Math.random() * 0.05 + 0.02,
          driftX: (Math.random() - 0.5) * 0.02,
          driftZ: (Math.random() - 0.5) * 0.005,
          rotationSpeedX: Math.random() * 0.03 + 0.01,
          rotationSpeedY: Math.random() * 0.02 + 0.005,
          rotationSpeedZ: Math.random() * 0.01 + 0.005,
        });
      }
    }

    function updatePeachBlossomParticles() {
      for (var i = 0; i < peachBlossomParticles.length; i++) {
        var p = peachBlossomParticles[i];
        var m = p.mesh;
        m.position.y -= p.speed;
        m.position.x += p.driftX;
        m.position.z += p.driftZ;
        m.rotation.x += p.rotationSpeedX;
        m.rotation.y += p.rotationSpeedY;
        m.rotation.z += p.rotationSpeedZ;
        if (m.position.y < -5) {
          m.position.y = Math.random() * 10 + 15;
          m.position.x = (Math.random() - 0.5) * 20;
          m.position.z = (Math.random() - 0.5) * 10;
          m.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
        }
      }
    }

    initPeachBlossomParticles();

    var loader = new THREE.GLTFLoader();

    var modelReady = false;
    var baseRootPos = new THREE.Vector3(0, 0, 0);
    var currentModel = null;
    var importedKeyframes = [];
    var keyframeTimelineReady = false;

    function lerp(start, end, t) {
      return start + (end - start) * t;
    }

    function easeInQuad(t) {
      return t * t;
    }

    function easeOutQuad(t) {
      return t * (2 - t);
    }

    function easeInOutQuad(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    function easeOutBack(t) {
      var c1 = 1.70158;
      var c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }

    function easeOutElastic(t) {
      var c4 = (2 * Math.PI) / 3;
      return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }

    function easeInOutSine(t) {
      return -(Math.cos(Math.PI * t) - 1) / 2;
    }

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }

    function easeInOutQuint(t) {
      return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
    }

    function applyEasing(t, easeType) {
      switch (easeType) {
        case "easeIn":
        case "easeInQuad":
          return easeInQuad(t);
        case "easeOut":
        case "easeOutQuad":
          return easeOutQuad(t);
        case "easeInOut":
        case "easeInOutQuad":
          return easeInOutQuad(t);
        case "easeOutBack":
          return easeOutBack(t);
        case "easeOutElastic":
          return easeOutElastic(t);
        case "easeInOutSine":
          return easeInOutSine(t);
        case "easeInOutCubic":
          return easeInOutCubic(t);
        case "easeInOutQuint":
          return easeInOutQuint(t);
        default:
          return t;
      }
    }

    function sanitizeKeyframe(raw) {
      if (!raw || typeof raw !== "object") return null;
      return {
        time: Number(raw.time) || 0,
        camX: Number(raw.camX) || 0,
        camY: Number(raw.camY) || 0,
        camZ: Number(raw.camZ) || 0,
        rotX: Number(raw.rotX) || 0,
        rotY: Number(raw.rotY) || 0,
        rotZ: Number(raw.rotZ) || 0,
        modelX: Number(raw.modelX) || 0,
        modelY: Number(raw.modelY) || 0,
        modelZ: Number(raw.modelZ) || 0,
        modelRot: Number(raw.modelRot) || 0,
        scale: raw.scale === undefined ? 1 : Number(raw.scale) || 1,
        ease: raw.ease || "",
      };
    }

    function getDefaultKeyframes() {
      return [
        {
          time: 0,
          camX: 2,
          camY: 11,
          camZ: 25,
          rotX: -0.1,
          rotY: 0.1,
          rotZ: 0,
          modelX: 0,
          modelY: 0,
          modelZ: 0,
          modelRot: 0,
          scale: 1,
          ease: "easeInOut",
        },
        {
          time: 2,
          camX: 0,
          camY: 10,
          camZ: 18,
          rotX: -0.08,
          rotY: 0,
          rotZ: 0,
          modelX: 0,
          modelY: 0,
          modelZ: 0,
          modelRot: Math.PI * 0.3,
          scale: 1,
          ease: "easeInOut",
        },
      ];
    }

    function setTimelineKeyframes(list) {
      if (!Array.isArray(list) || !list.length) return false;
      var normalized = list.map(sanitizeKeyframe).filter(Boolean);
      if (!normalized.length) return false;
      normalized.sort(function (a, b) { return a.time - b.time; });
      importedKeyframes = normalized;
      keyframeTimelineReady = importedKeyframes.length >= 2;
      return keyframeTimelineReady;
    }

    function loadKeyframesFromTextFile() {
      var candidates = ["./keyframes_1917_style_60frames_rotated.txt", "keyframes_1917_style_60frames_rotated.txt"];
      return candidates
        .reduce(function (prev, url) {
          return prev.catch(function () {
            return fetch(url, { cache: "no-store" }).then(function (res) {
              if (!res.ok) throw new Error("HTTP " + res.status + " at " + url);
              return res.text();
            });
          });
        }, Promise.reject(new Error("start")))
        .then(function (text) {
          var parsed = JSON.parse(text);
          if (!setTimelineKeyframes(parsed)) throw new Error("invalid keyframes data");
        })
        .catch(function (err) {
          console.warn("[glb-background] keyframes import failed, fallback to defaults", err);
          setTimelineKeyframes(getDefaultKeyframes());
        });
    }

    loadKeyframesFromTextFile();

    function getPageScrollProgress() {
      if (!scroller) return 0;
      var scrollTop = scroller.scrollTop || 0;
      var scrollRange = Math.max(1, (scroller.scrollHeight || 1) - (scroller.clientHeight || 1));
      var p = scrollTop / scrollRange;
      if (p < 0) return 0;
      if (p > 1) return 1;
      return p;
    }

    function applyTimelineAtTime(timelineTime) {
      if (!modelReady || !keyframeTimelineReady) return;
      var t = Math.max(0, Math.min(2, timelineTime));
      var frames = importedKeyframes;
      var startFrame = null;
      var endFrame = null;
      for (var i = 0; i < frames.length; i++) {
        if (frames[i].time <= t) startFrame = frames[i];
        if (frames[i].time >= t && !endFrame) endFrame = frames[i];
      }
      if (!startFrame) startFrame = frames[0];
      if (!endFrame) endFrame = frames[frames.length - 1];

      var applied;
      if (startFrame === endFrame) {
        applied = startFrame;
      } else {
        var span = Math.max(0.0001, endFrame.time - startFrame.time);
        var rawProgress = Math.max(0, Math.min(1, (t - startFrame.time) / span));
        var eased = applyEasing(rawProgress, endFrame.ease || startFrame.ease);
        applied = {
          camX: lerp(startFrame.camX, endFrame.camX, eased),
          camY: lerp(startFrame.camY, endFrame.camY, eased),
          camZ: lerp(startFrame.camZ, endFrame.camZ, eased),
          rotX: lerp(startFrame.rotX, endFrame.rotX, eased),
          rotY: lerp(startFrame.rotY, endFrame.rotY, eased),
          rotZ: lerp(startFrame.rotZ, endFrame.rotZ, eased),
          modelX: lerp(startFrame.modelX, endFrame.modelX, eased),
          modelY: lerp(startFrame.modelY, endFrame.modelY, eased),
          modelZ: lerp(startFrame.modelZ, endFrame.modelZ, eased),
          modelRot: lerp(startFrame.modelRot, endFrame.modelRot, eased),
          scale: lerp(startFrame.scale, endFrame.scale, eased),
        };
      }

      camera.position.set(applied.camX, applied.camY, applied.camZ);
      camera.rotation.set(applied.rotX, applied.rotY, applied.rotZ);
      if (currentModel) {
        currentModel.position.x = applied.modelX;
        currentModel.position.y = applied.modelY;
        currentModel.position.z = applied.modelZ;
        currentModel.rotation.y = applied.modelRot;

        var baseScale = currentModel.userData && currentModel.userData.baseScale ? currentModel.userData.baseScale : 1;
        var finalScale = (applied.scale === undefined ? 1 : applied.scale) * baseScale;
        currentModel.scale.set(finalScale, finalScale, finalScale);
      }

    }

    function onModelLoaded(gltf) {
      root.add(gltf.scene);
      currentModel = gltf.scene;
      // 对照项目：为视差保存 mesh 原始位置，并启用阴影
      currentModel.traverse(function (child) {
        if (child && child.isMesh) {
          child.userData = child.userData || {};
          child.userData.originalPosition = child.position.clone();
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      var box = new THREE.Box3().setFromObject(root);
      var center = box.getCenter(new THREE.Vector3());
      var size = box.getSize(new THREE.Vector3());
      var maxDim = Math.max(size.x, size.y, size.z) || 1;
      currentModel.userData = currentModel.userData || {};
      currentModel.userData.baseScale = 15 / maxDim;
      currentModel.scale.set(currentModel.userData.baseScale, currentModel.userData.baseScale, currentModel.userData.baseScale);
      // 对照项目：将模型移到场景中心并落地
      root.position.x = -center.x;
      root.position.y = -center.y;
      root.position.z = -center.z;
      baseRootPos.copy(root.position);
      collectInteractiveObjectsFromModel(currentModel);
      updateHighlightState();
      modelReady = true;
    }

    function buildFallbackModel() {
      // 无 GLB 资源时的可视化兜底，确保你能立即看到“改动确实生效”
      var island = new THREE.Group();

      var base = new THREE.Mesh(
        new THREE.CylinderGeometry(5.2, 7.4, 2.8, 10, 1),
        new THREE.MeshStandardMaterial({ color: 0x8b7967, roughness: 0.9, metalness: 0.05 })
      );
      base.position.set(0, 1.2, 0);
      base.castShadow = true;
      base.receiveShadow = true;
      island.add(base);

      var top = new THREE.Mesh(
        new THREE.CylinderGeometry(4.8, 5.1, 1.2, 10, 1),
        new THREE.MeshStandardMaterial({ color: 0x6d8a5b, roughness: 0.85, metalness: 0.02 })
      );
      top.position.set(0, 2.6, 0);
      top.castShadow = true;
      top.receiveShadow = true;
      island.add(top);

      for (var i = 0; i < 3; i++) {
        var tower = new THREE.Mesh(
          new THREE.BoxGeometry(0.7, 2.1 + i * 0.3, 0.7),
          new THREE.MeshStandardMaterial({ color: 0xd9c6a5, roughness: 0.7, metalness: 0.05 })
        );
        tower.name = i === 0 ? "pavilion_fallback" : i === 1 ? "drum_tower_fallback" : "bulletin_board_fallback";
        var angle = (Math.PI * 2 * i) / 3;
        tower.position.set(Math.cos(angle) * 1.8, 3.5 + i * 0.15, Math.sin(angle) * 1.8);
        tower.castShadow = true;
        tower.receiveShadow = true;
        island.add(tower);
      }

      root.add(island);
      currentModel = island;
      currentModel.traverse(function (child) {
        if (child && child.isMesh) {
          child.userData = child.userData || {};
          child.userData.originalPosition = child.position.clone();
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      var box = new THREE.Box3().setFromObject(root);
      var center = box.getCenter(new THREE.Vector3());
      var size = box.getSize(new THREE.Vector3());
      var maxDim = Math.max(size.x, size.y, size.z) || 1;
      currentModel.userData = currentModel.userData || {};
      currentModel.userData.baseScale = 15 / maxDim;
      currentModel.scale.set(currentModel.userData.baseScale, currentModel.userData.baseScale, currentModel.userData.baseScale);
      root.position.x = -center.x;
      root.position.y = -center.y;
      root.position.z = -center.z;
      baseRootPos.copy(root.position);
      collectInteractiveObjectsFromModel(currentModel);
      updateHighlightState();
      modelReady = true;
    }

    var modelCandidates = [
      // 使用指定的模型路径（相对路径经 URL 解析，避免中文路径在部分环境下的编码问题）
      "assets/models/浮岛301.glb"
    ];

    function resolveAssetUrl(relativePath) {
      try {
        return new URL(relativePath, window.location.href).href;
      } catch (e) {
        return relativePath;
      }
    }

    function tryLoadModel(i) {
      if (i >= modelCandidates.length) {
        console.warn("[glb-background] model load failed, tried:", modelCandidates.join(" | "));
        // 不再创建备用模型，只使用指定的模型
        return;
      }
      var url = resolveAssetUrl(modelCandidates[i]);
      loader.load(
        url,
        onModelLoaded,
        undefined,
        function (err) {
          console.warn("[glb-background] load error:", url, err);
          tryLoadModel(i + 1);
        }
      );
    }

    tryLoadModel(0);

    function getViewportSize() {
      // 使用 stage 容器尺寸，让画布严格限定在 3D 子页面区域内
      var rect = stage.getBoundingClientRect();
      var w = Math.max(1, Math.round(rect.width));
      var h = Math.max(1, Math.round(rect.height));
      return { w: w, h: h };
    }

    function resize() {
      var size = getViewportSize();
      var w = size.w;
      var h = size.h;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (typeof setCompositionOffset === "function") setCompositionOffset();
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // --- 视差效果：按对照项目照抄 ---
    var parallaxCfg = {
      cameraMoveFactor: 0.25,
      cameraRotateFactor: 0.12,
      modelMoveFactor: 0.08,
      smoothFactor: 0.1,
      maxCameraOffset: 2.5,
      maxCameraRotation: 0.15,
    };
    var parallax = {
      targetMouseX: 0,
      targetMouseY: 0,
      currentMouseX: 0,
      currentMouseY: 0,
      baseCameraPosition: camera.position.clone(),
      baseCameraRotation: camera.rotation.clone(),
    };
    var isActive = false;
    var rafId = 0;

    function onMouseMove(e) {
      if (!isActive) return;
      var rect = renderer.domElement.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) return;
      var nx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      var ny = -(((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1);
      parallax.targetMouseX = nx;
      parallax.targetMouseY = ny;
      mouse.x = nx;
      mouse.y = ny;
    }
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    function onMouseClick(e) {
      // 检查是否点击了作者信息元素或古诗信息元素
      if (e.target && e.target.closest && (e.target.closest('.author-info') || e.target.closest('.poem-info'))) {
        return;
      }
      
      if (!isActive) return;
      if (!currentModel) return;
      // 点击右侧卡片区域不触发 3D 拾取
      if (e.target && e.target.closest && e.target.closest("#scene3dPanels")) return;
      var rect = renderer.domElement.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) return;
      mouse.x = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1);
      raycaster.setFromCamera(mouse, camera);
      var targets = [];
      if (interactiveObjects.pavilion) targets.push(interactiveObjects.pavilion);
      if (interactiveObjects["drum-tower"]) targets.push(interactiveObjects["drum-tower"]);
      if (interactiveObjects["bulletin-board"]) targets.push(interactiveObjects["bulletin-board"]);
      if (!targets.length) return;
      var intersects = raycaster.intersectObjects(targets, true);
      if (!intersects.length) return;
      var interactiveRoot = findInteractiveRoot(intersects[0].object);
      var objectName = getInteractiveNameByObject(interactiveRoot);
      if (objectName) startCameraFlyTo(objectName, interactiveRoot);
    }
    window.addEventListener("click", onMouseClick, false);

    function applyParallaxEffect() {
      if (isAnimating) return;
      // 平滑更新鼠标位置
      parallax.currentMouseX += (parallax.targetMouseX - parallax.currentMouseX) * parallaxCfg.smoothFactor;
      parallax.currentMouseY += (parallax.targetMouseY - parallax.currentMouseY) * parallaxCfg.smoothFactor;

      var cameraOffsetX = parallax.currentMouseX * parallaxCfg.cameraMoveFactor * parallaxCfg.maxCameraOffset;
      var cameraOffsetY = parallax.currentMouseY * parallaxCfg.cameraMoveFactor * parallaxCfg.maxCameraOffset;
      var cameraRotationX = -parallax.currentMouseY * parallaxCfg.cameraRotateFactor * parallaxCfg.maxCameraRotation;
      var cameraRotationY = parallax.currentMouseX * parallaxCfg.cameraRotateFactor * parallaxCfg.maxCameraRotation;

      camera.position.copy(parallax.baseCameraPosition);
      camera.position.x += cameraOffsetX;
      camera.position.y += cameraOffsetY;

      camera.rotation.copy(parallax.baseCameraRotation);
      camera.rotation.x += cameraRotationX;
      camera.rotation.y += cameraRotationY;

      // 模型内部视差（按深度衰减）
      if (currentModel) {
        currentModel.traverse(function (child) {
          if (child && child.isMesh && child.userData && child.userData.originalPosition) {
            var depth = child.position.z;
            var depthFactor = Math.max(0, 1 - Math.abs(depth) * 0.01);
            var modelOffsetX = -parallax.currentMouseX * parallaxCfg.modelMoveFactor * depthFactor;
            var modelOffsetY = -parallax.currentMouseY * parallaxCfg.modelMoveFactor * depthFactor;
            child.position.copy(child.userData.originalPosition);
            child.position.x += modelOffsetX;
            child.position.y += modelOffsetY;
          }
        });
      }
    }

    var start = performance.now();
    function tick(now) {
      if (!isActive) return;

      // 相机丝滑飞入动画：完成后打开对应卡片
      if (isAnimating && cameraAnim) {
        var t = (now - cameraAnim.start) / cameraAnim.duration;
        if (t >= 1) t = 1;
        var k = easeInOut(t);
        camera.position.lerpVectors(cameraAnim.fromPos, cameraAnim.toPos, k);
        camera.rotation.x = cameraAnim.fromRot.x + (cameraAnim.toRot.x - cameraAnim.fromRot.x) * k;
        camera.rotation.y = cameraAnim.fromRot.y + (cameraAnim.toRot.y - cameraAnim.fromRot.y) * k;
        camera.rotation.z = cameraAnim.fromRot.z + (cameraAnim.toRot.z - cameraAnim.fromRot.z) * k;

        if (t >= 1) {
          isAnimating = false;
          // 更新视差基准：后续视差围绕飞入后的姿态
          parallax.baseCameraPosition.copy(camera.position);
          parallax.baseCameraRotation.copy(camera.rotation);
          var name = cameraAnim.objectName;
          cameraAnim = null;
          if (name) activateScene3dPanel(name);
        }
      }

      // 主页面动画：按整页滚动进度驱动 60 帧时间轴（0~2）
      if (!isAnimating && keyframeTimelineReady) {
        applyTimelineAtTime(getPageScrollProgress() * 2);
      }

      // 悬停到可交互模型时给出手势反馈
      if (currentModel) {
        raycaster.setFromCamera(mouse, camera);
        var hoverTargets = [];
        if (interactiveObjects.pavilion) hoverTargets.push(interactiveObjects.pavilion);
        if (interactiveObjects["drum-tower"]) hoverTargets.push(interactiveObjects["drum-tower"]);
        if (interactiveObjects["bulletin-board"]) hoverTargets.push(interactiveObjects["bulletin-board"]);
        if (hoverTargets.length) {
          var hoverIntersects = raycaster.intersectObjects(hoverTargets, true);
          if (hoverIntersects.length) {
            var hoverRoot = findInteractiveRoot(hoverIntersects[0].object);
            currentHoverObject = getInteractiveNameByObject(hoverRoot);
            document.body.style.cursor = "pointer";
          } else {
            currentHoverObject = null;
            document.body.style.cursor = "default";
          }
          updateHighlightState();
        }
      }

      updateHighlightAnimations();

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    }

    function startLoop() {
      if (rafId) return;
      rafId = requestAnimationFrame(tick);
    }

    function stopLoop() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    }

    function setActive(next) {
      if (isActive === next) return;
      isActive = next;
      if (isActive) {
        resize();
        setupScene3dSwitchButtons();
        bindRealModules();
        collapseScene3dPanels();
        startLoop();
      } else {
        stopLoop();
        document.body.style.cursor = "default";
        currentHoverObject = null;
        updateHighlightState();
      }
    }

    // 3D 动画贯穿整页：不再受 #scene3d 可见性限制，默认常驻运行
    setActive(true);
  }

  init();
})();
