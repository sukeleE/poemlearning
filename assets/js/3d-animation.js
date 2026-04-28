// 3D动画和交互功能

// 全局变量
let app, scene, camera, renderer, controls, model, raycaster, mouse;
let isAnimating = false;
let isProcessingClick = false;
let currentPopup = null;
let cameraAnimation = null;
let currentModel = null;
let interactiveObjects = {};
let currentActiveObject = null;
let currentActivePopup = null;
let coverLoadProgress = 0;
let coverLoadStallInterval = null;

function clearCoverLoadStallInterval() {
    if (coverLoadStallInterval) {
        clearInterval(coverLoadStallInterval);
        coverLoadStallInterval = null;
    }
}

function setCoverLoadingProgress(percent) {
    const safePercent = Math.max(0, Math.min(100, Math.round(percent)));
    if (safePercent < coverLoadProgress) return;
    coverLoadProgress = safePercent;
    const coverGate = document.getElementById('coverGate');
    if (!coverGate) return;
    coverGate.style.setProperty('--cover-load-progress', safePercent + '%');
}

function finishCoverLoadingProgress() {
    setCoverLoadingProgress(100);
    const coverGate = document.getElementById('coverGate');
    if (coverGate) {
        coverGate.classList.add('is-loaded');
    }
}

// 相机配置
let cameraConfig = {
    default: { position: [0, 10, 30], target: [0, 5, 0] },
    drumTower: { position: [5, 5, 15], target: [0, 3, 0] },
    pavilion: { position: [-5, 5, 15], target: [0, 3, 0] },
    bulletinBoard: { position: [0, 5, 15], target: [0, 3, 0] },
    basePosition: [2, 11, 25], // 参考test-3d-integration.html中的初始位置
    targetPosition: [3, 11, 25], // 参考test-3d-integration.html中的目标位置
    rotation: {
        baseX: -0.1, // 参考test-3d-integration.html中的初始旋转
        baseY: 0.1,
        targetY: -0.1
    },
    duration: 1.8,
    ease: 'power2.inOut'
};

// 鼠标视差效果配置
const parallaxConfig = {
    cameraMoveFactor: 0.25,
    cameraRotateFactor: 0.12,
    modelMoveFactor: 0.08,
    smoothFactor: 0.1,
    maxCameraOffset: 2.5,
    maxCameraRotation: 0.15
};

// 视差效果状态
const parallaxState = {
    targetMouseX: 0,
    targetMouseY: 0,
    currentMouseX: 0,
    currentMouseY: 0,
    baseCameraPosition: null,
    baseCameraRotation: null
};

// 桃花粒子系统
let peachBlossomParticles = [];
let peachBlossomGeometry, peachBlossomMaterial;

// 文章数据库
const articlesDatabase = {
    'deng-que-lou': {
        title: '登鹳雀楼',
        author: '唐 · 王之涣',
        text: [
            '白日依山尽，黄河入海流。',
            '欲穷千里目，更上一层楼。'
        ],
        analysis: [
            '这首诗描绘了诗人登上鹳雀楼所见的壮丽景色，表达了积极向上的进取精神。',
            '前两句写景，后两句抒情，意境开阔，气势磅礴，是唐代五言绝句的代表作之一。',
            '诗中"欲穷千里目，更上一层楼"两句，不仅是对自然景色的描绘，更是富含哲理的人生感悟，激励人们不断追求更高的目标。'
        ]
    },
    '静夜思': {
        title: '静夜思',
        author: '唐 · 李白',
        text: [
            '床前明月光，疑是地上霜。',
            '举头望明月，低头思故乡。'
        ],
        analysis: [
            '这首诗描写了诗人在寂静的夜晚，看到明月映照在床前，误以为是地上的霜，从而引发了对故乡的思念之情。',
            '诗的语言简洁明快，意境深远，通过对自然景物的描写，表达了诗人对故乡的深切思念。'
        ]
    },
    '望庐山瀑布': {
        title: '望庐山瀑布',
        author: '唐 · 李白',
        text: [
            '日照香炉生紫烟，遥看瀑布挂前川。',
            '飞流直下三千尺，疑是银河落九天。'
        ],
        analysis: [
            '这首诗描绘了庐山瀑布的壮丽景象，表现了诗人对大自然的热爱和赞美之情。',
            '前两句写香炉峰在阳光的照射下，产生紫色的云烟，远远望去，瀑布像一条白练挂在山前。后两句用夸张的手法，描写瀑布从高处飞泻而下的壮观景象。'
        ]
    }
};

// 滚动状态
var scrollState = {
    targetScroll: 0,
    currentScroll: 0,
    scrollProgress: 0,
    easedProgress: 0
};

// 关键帧数据
var keyframes = [
   {
     "time": 0,
     "camX": -32,
     "camY": 5,
     "camZ": 100,
     "rotX": -0.15,
     "rotY": 0,
     "rotZ": 0,
     "modelX": 0,
     "modelY": 0,
     "modelZ": 0,
     "modelRot": 0.02,
     "scale": 1,
     "description": "起始位置"
   },
   {
     "time": 0.25,
     "camX": -10,
     "camY": 5,
     "camZ": 79,
     "rotX": -0.19,
     "rotY": 0.16,
     "rotZ": 0.1,
     "modelX": 0,
     "modelY": 0,
     "modelZ": 0,
     "modelRot": -0.58,
     "scale": 1,
     "ease": "easeInOutSine",
     "description": "第一个右弯"
   },
   {
     "time": 0.5,
     "camX": -30,
     "camY": 5,
     "camZ": 60,
     "rotX": -0.25,
     "rotY": -0.2,
     "rotZ": -0.1,
     "modelX": 0,
     "modelY": 0,
     "modelZ": 0,
     "modelRot": -0.58,
     "scale": 1,
     "ease": "easeInOutSine",
     "description": "第一个左弯"
   },
   {
     "time": 0.75,
     "camX": -0.5,
     "camY": 5,
     "camZ": 44,
     "rotX": -0.3,
     "rotY": 0.25,
     "rotZ": 0.15,
     "modelX": 0,
     "modelY": 0,
     "modelZ": 0,
     "modelRot": -0.48,
     "scale": 1,
     "ease": "easeInOutCubic",
     "description": "第二个右弯"
   },
   {
     "time": 0.97,
     "camX": -9,
     "camY": 5,
     "camZ": 25,
     "rotX": -0.25,
     "rotY": -0.15,
     "rotZ": -0.08,
     "modelX": 0,
     "modelY": 0,
     "modelZ": 0,
     "modelRot": -6.28,
     "scale": 1,
     "ease": "easeInOutCubic",
     "description": "第二个左弯"
   },
   {
     "time": 1.2,
     "camX": 1,
     "camY": 5,
     "camZ": 21.5,
     "rotX": -0.2,
     "rotY": 0.1,
     "rotZ": 0.05,
     "modelX": 0,
     "modelY": 0,
     "modelZ": 0,
     "modelRot": -6.28,
     "scale": 1,
     "ease": "easeInOutCubic",
     "description": "第三个右弯"
   },
   {
     "time": 1.42,
     "camX": 0,
     "camY": 5,
     "camZ": 18,
     "rotX": -0.18,
     "rotY": 0,
     "rotZ": 0,
     "modelX": 0,
     "modelY": 0,
     "modelZ": 0,
     "modelRot": -1.88,
     "scale": 1,
     "ease": "easeInOutQuint",
     "description": "第三个左弯"
   },
   {
     "time": 1.6,
     "camX": -3,
     "camY": 2,
     "camZ": 4,
     "rotX": -0.23,
     "rotY": 0,
     "rotZ": 0,
     "modelX": 0,
     "modelY": 0,
     "modelZ": 0,
     "modelRot": -0.5,
     "scale": 1,
     "ease": "easeInOutQuint",
     "description": "接近中心"
   },
   {
     "time": 1.81,
     "camX": 1,
     "camY": 1,
     "camZ": 8,
     "rotX": -0.08,
     "rotY": 0,
     "rotZ": 0,
     "modelX": 0,
     "modelY": 0,
     "modelZ": 0,
     "modelRot": 0.12,
     "scale": 1,
     "ease": "easeInOutQuint",
     "description": "最终接近"
   },
   {
     "time": 2,
     "camX": 0,
     "camY": 3,
     "camZ": 16,
     "rotX": -0.15,
     "rotY": 0,
     "rotZ": 0,
     "modelX": 0,
     "modelY": 0,
     "modelZ": 0,
     "modelRot": 0.02,
     "scale": 1,
     "ease": "easeInOutQuint",
     "description": "继续接近"
   }
];

// 初始化函数
function init() {
    console.log('初始化3D场景');

    if (typeof THREE === 'undefined') {
        console.error('THREE 未定义：请确认 assets/js/vendor/three-r128.min.js 已随页面加载');
        finishCoverLoadingProgress();
        return;
    }

    // 创建场景
    scene = new THREE.Scene();
    // 减少雾效，让场景更明亮
    scene.fog = new THREE.Fog(0xd8d1c2, 30, 120);
    
    // 创建相机
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(cameraConfig.basePosition[0], cameraConfig.basePosition[1], cameraConfig.basePosition[2]);
    camera.rotation.x = cameraConfig.rotation.baseX;
    camera.rotation.y = cameraConfig.rotation.baseY;
    
    // 初始化视差效果的基础位置和旋转
    parallaxState.baseCameraPosition = camera.position.clone();
    parallaxState.baseCameraRotation = camera.rotation.clone();
    
    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ 
        antialias: false, // 禁用抗锯齿以提高性能
        alpha: true,
        powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.0)); // 进一步降低像素比以提高性能
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = false; // 禁用阴影以提高性能
    if ("outputEncoding" in renderer && THREE.sRGBEncoding) {
        renderer.outputEncoding = THREE.sRGBEncoding;
    } else if ("outputColorSpace" in renderer && THREE.SRGBColorSpace) {
        renderer.outputColorSpace = THREE.SRGBColorSpace;
    }
    // 简化色调映射以提高性能
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = 1.0;
    
    // 添加渲染器到DOM
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    // 添加场景背景
    var textureLoader = new THREE.TextureLoader();
    var backgroundTexture = textureLoader.load('assets/img/极简国风天空背景 (1).png', function() {
        console.log('背景图片加载成功');
        // 确保纹理正确设置
        backgroundTexture.wrapS = THREE.ClampToEdgeWrapping;
        backgroundTexture.wrapT = THREE.ClampToEdgeWrapping;
        backgroundTexture.minFilter = THREE.LinearFilter;
        backgroundTexture.magFilter = THREE.LinearFilter;
        scene.background = backgroundTexture;
    }, undefined, function(error) {
        console.error('背景图片加载失败:', error);
    });
    
    // 添加灯光
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    // 补光
    const fillLight = new THREE.DirectionalLight(0x4fc3f7, 0.3);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);
    
    // 鼠标和射线检测
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // 初始化桃花粒子系统
    initPeachBlossomParticles();
    
    // 加载模型
    loadModel();
    
    // 添加鼠标移动事件
    window.addEventListener('mousemove', onMouseMove, false);
    
    // 添加鼠标点击事件
    window.addEventListener('click', onMouseClick, false);
    
    // 窗口大小调整
    window.addEventListener('resize', onWindowResize, false);
    
    // 添加滚动事件
    window.addEventListener('scroll', onScroll, false);
    
    // 开始动画循环
    animate();
}

// 加载模型
function resolveAssetUrl(relativePath) {
    try {
        return new URL(relativePath, window.location.href).href;
    } catch (e) {
        return relativePath;
    }
}

function loadModel() {
    console.log('开始加载模型...');
    const coverGate = document.getElementById('coverGate');
    if (coverGate) {
        coverGate.classList.remove('is-loaded');
    }
    setCoverLoadingProgress(0);
    clearCoverLoadStallInterval();
    // 在首包进度到来前略推一点，避免「完全不动」；上限低，避免与真实进度打架
    coverLoadStallInterval = setInterval(function () {
        if (coverLoadProgress >= 6) return;
        setCoverLoadingProgress(Math.min(6, coverLoadProgress + 1));
    }, 280);

    if (typeof THREE === 'undefined' || !THREE.GLTFLoader) {
        console.error('GLTFLoader 未就绪，请检查 three.min.js 与 GLTFLoader.js 是否同版本加载成功');
        clearCoverLoadStallInterval();
        finishCoverLoadingProgress();
        return;
    }

    const loader = new THREE.GLTFLoader();

    // 已禁用 Draco：仅按普通 GLB 加载。

    const modelUrls = [
        resolveAssetUrl('assets/models/浮岛301.glb'),
        resolveAssetUrl('assets/models/island301.glb')
    ];
    console.log('模型候选 URL:', modelUrls);

    function onLoad(gltf) {
            clearCoverLoadStallInterval();
            console.log('模型加载成功，开始处理...');
            model = gltf.scene;
            currentModel = model;
            scene.add(model);
            console.log('找到模型:', model.name);
            // 遍历模型，收集可交互对象
            traverseModel(currentModel);
            
            // 计算模型边界框并居中
            const box = new THREE.Box3().setFromObject(currentModel);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());

            // 将模型移到场景中心
            currentModel.position.x = -center.x;
            currentModel.position.y = -box.min.y;
            currentModel.position.z = -center.z;
            
            // 保存模型本身的原始位置，用于视差效果
            currentModel.userData.originalPosition = currentModel.position.clone();
            
            console.log('模型已添加到场景');
            console.log('模型加载完成，可交互对象列表:', Object.keys(interactiveObjects));
            console.log('模型大小:', size);
            console.log('模型位置:', currentModel.position);
            console.log('相机位置:', camera.position);
            console.log('场景中的对象数量:', scene.children.length);
            finishCoverLoadingProgress();
        }

    function onProgress(xhr) {
            if (!xhr) return;
            if (xhr.loaded > 0) clearCoverLoadStallInterval();

            var pct;
            if (xhr.lengthComputable && xhr.total > 0) {
                pct = Math.min(99, (xhr.loaded / xhr.total) * 100);
            } else if (xhr.loaded > 0) {
                // 无 Content-Length（file://、分块传输等）：按已下载字节渐近到 95%，进度条仍会动
                var tau = 120 * 1024 * 1024;
                pct = 95 * (1 - Math.exp(-xhr.loaded / tau));
            } else {
                return;
            }
            console.log('已加载约 ' + Math.round(pct) + '% （bytes: ' + xhr.loaded + (xhr.total ? '/' + xhr.total : '') + '）');
            setCoverLoadingProgress(pct);
        }

    function onError(error, url) {
            clearCoverLoadStallInterval();
            console.error('模型加载错误:', error, 'url=', url);
            finishCoverLoadingProgress();
        }

    async function fetchGlbBuffer(url) {
        const response = await fetch(url, {
            method: 'GET',
            cache: 'no-store',
            credentials: 'same-origin'
        });
        if (!response.ok) {
            throw new Error('HTTP ' + response.status + ' ' + response.statusText);
        }

        const total = Number(response.headers.get('content-length') || 0);
        if (!response.body || !response.body.getReader) {
            const buffer = await response.arrayBuffer();
            onProgress({ loaded: buffer.byteLength, total: total, lengthComputable: total > 0 });
            return buffer;
        }

        const reader = response.body.getReader();
        const chunks = [];
        let loaded = 0;
        while (true) {
            const step = await reader.read();
            if (step.done) break;
            if (step.value) {
                chunks.push(step.value);
                loaded += step.value.byteLength || step.value.length || 0;
                onProgress({ loaded: loaded, total: total, lengthComputable: total > 0 });
            }
        }

        const merged = new Uint8Array(loaded);
        let offset = 0;
        chunks.forEach(function (c) {
            merged.set(c, offset);
            offset += c.byteLength;
        });
        return merged.buffer;
    }

    function parseBufferAsGltf(buffer, url) {
        return new Promise(function (resolve, reject) {
            const resourcePath = url.slice(0, url.lastIndexOf('/') + 1);
            loader.parse(buffer, resourcePath, resolve, reject);
        });
    }

    async function tryLoadModel(index) {
        if (index >= modelUrls.length) {
            onError(new Error('模型候选路径全部加载失败'), modelUrls.join(' | '));
            return;
        }
        const currentUrl = modelUrls[index];
        try {
            const buffer = await fetchGlbBuffer(currentUrl);
            const gltf = await parseBufferAsGltf(buffer, currentUrl);
            onLoad(gltf);
        } catch (error) {
            console.warn('当前模型 URL 加载失败，尝试下一项:', currentUrl, error);
            tryLoadModel(index + 1);
        }
    }

    tryLoadModel(0);
}

// 遍历模型，收集可交互对象
function traverseModel(obj) {
    if (obj.isMesh) {
        // 保存原始位置，用于视差效果
        obj.userData.originalPosition = obj.position.clone();
        
        const hRaw = getMeshNameHierarchy(obj);
        const h = hRaw.toLowerCase();

        // 先匹配亭子：避免含 tower 的亭子名被误判为鼓楼；父级 Group 上的「亭」等也会合并进 hRaw
        const isPavilion = h.includes('亭') || h.includes('pavilion') || h.includes('gazebo') ||
            h.includes('pagoda') || h.includes('guting');
        const isDrum = !isPavilion && (h.includes('drum') || h.includes('鼓楼') || h.includes('gulou') ||
            h.includes('tower') || h.includes('drumtower'));
        const isBulletin = !isPavilion && (h.includes('bulletin') || h.includes('布告') || h.includes('notice') ||
            h.includes('board'));

        if (isPavilion) {
            console.log('识别到古亭对象:', hRaw);
            interactiveObjects['pavilion'] = obj;
            cloneMeshMaterialsForHighlight(obj);
        } else if (isDrum) {
            console.log('识别到鼓楼对象:', hRaw);
            interactiveObjects['drum-tower'] = obj;
            cloneMeshMaterialsForHighlight(obj);
        } else if (isBulletin) {
            console.log('识别到布告板对象:', hRaw);
            interactiveObjects['bulletin-board'] = obj;
            cloneMeshMaterialsForHighlight(obj);
        }
    }

    // 递归遍历子对象
    obj.children.forEach(child => {
        traverseModel(child);
    });
}

// 克隆材质以支持高亮效果
function cloneMeshMaterialsForHighlight(obj) {
    if (!obj.isMesh) return;
    
    // 保存原始材质
    if (!obj.userData.originalMaterial) {
        obj.userData.originalMaterial = obj.material;
    }
    
    // 克隆材质并设置为高亮材质
    if (!obj.userData.highlightMaterial) {
        if (Array.isArray(obj.material)) {
            obj.userData.highlightMaterial = obj.material.map(m => m.clone());
        } else {
            obj.userData.highlightMaterial = obj.material.clone();
        }
    }
    
    // 配置高亮材质
    const processMaterial = (mat) => {
        mat.emissive = new THREE.Color(0xffff00);
        mat.emissiveIntensity = 0.5;
        mat.transparent = true;
        mat.opacity = 0.8;
    };
    
    if (Array.isArray(obj.userData.highlightMaterial)) {
        obj.userData.highlightMaterial.forEach(processMaterial);
    } else {
        processMaterial(obj.userData.highlightMaterial);
    }
}

// 合并网格及其父级命名
function getMeshNameHierarchy(mesh) {
    const parts = [];
    let o = mesh;
    while (o) {
        if (o.name && o.name.trim()) {
            parts.unshift(o.name);
        }
        o = o.parent;
    }
    return parts.join(' / ');
}

// 鼠标移动事件
function onMouseMove(event) {
    if (isAnimating) return;
    if (!model) return;

    // 计算鼠标位置
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // 更新视差目标值
    parallaxState.targetMouseX = mouse.x;
    parallaxState.targetMouseY = mouse.y;
    
    // 更新射线
    raycaster.setFromCamera(mouse, camera);
    
    // 检测物体
    const intersects = raycaster.intersectObjects(model.children, true);
    
    // 处理悬停效果
    if (intersects.length > 0) {
        const object = intersects[0].object;
        
        // 显示提示
        document.body.style.cursor = 'pointer';
    } else {
        document.body.style.cursor = 'default';
    }
}

// 鼠标点击事件
function onMouseClick(event) {
    // 检查是否点击了作者信息元素或古诗信息元素
    if (event.target && event.target.closest && (event.target.closest('.author-info') || event.target.closest('.poem-info'))) {
        console.log('点击了作者信息元素或古诗信息元素，跳过3D模型点击事件');
        return;
    }
    
    console.log('鼠标点击事件触发');
    
    if (isAnimating) {
        console.log('正在动画中，跳过点击事件');
        return;
    }
    
    // 计算鼠标在标准化设备坐标中的位置
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // 更新射线
    raycaster.setFromCamera(mouse, camera);

    // 计算射线与可交互对象的交点
    const intersects = raycaster.intersectObjects(Object.values(interactiveObjects), true);
    console.log('可交互对象数量:', Object.keys(interactiveObjects).length);
    console.log('交点数量:', intersects.length);

    if (intersects.length > 0) {
        // 检查是否在3d交互场景子页面
        const is3dSceneActive = document.getElementById('3d-scene') && document.getElementById('3d-scene').classList.contains('is-scene-active');
        if (!is3dSceneActive) {
            console.log('不在3d交互场景子页面，跳过3D模型点击事件');
            return;
        }
        
        const clickedObject = intersects[0].object;
        console.log('点击的对象:', clickedObject.name);
        
        // 找到父级可交互对象
        let targetObject = clickedObject;
        while (targetObject && !Object.values(interactiveObjects).includes(targetObject)) {
            targetObject = targetObject.parent;
        }

        if (targetObject) {
            console.log('找到的可交互对象:', targetObject.name);
            // 获取对象名称
            let objectName = null;
            for (const [name, obj] of Object.entries(interactiveObjects)) {
                if (obj === targetObject) {
                    objectName = name;
                    break;
                }
            }

            if (objectName) {
                console.log('对象名称:', objectName);
                handleObjectClick(objectName);
            } else {
                console.error('未找到对象名称');
            }
        } else {
            console.error('未找到可交互对象');
        }
    } else {
        console.log('未找到交点');
    }
}

function collapse3DGuideCard() {
    const guideCard = document.querySelector('#3d-scene .card');
    if (!guideCard) return;
    guideCard.classList.add('is-collapsed');
}

// 处理物体点击
function handleObjectClick(objectName) {
    console.log('handleObjectClick 函数被调用:', objectName);
    
    // 防止重复点击
    if (isAnimating || isProcessingClick) {
        console.log('正在动画或处理中，跳过点击处理');
        return;
    }
    
    // 先停止当前相机动画
    stopCurrentAnimation();
    console.log('已停止当前动画');

    // 设置处理状态
    isProcessingClick = true;
    console.log('设置处理状态为 true');

    // 关闭当前打开的弹窗
    if (currentActivePopup) {
        let popup = document.getElementById(currentActivePopup);
        if (popup) {
            popup.classList.remove('show');
        }
        // 取消高亮效果
        if (currentActiveObject) {
            highlightObject(currentActiveObject, false);
        }
        currentActivePopup = null;
    }

    // 激活新对象
    currentActiveObject = objectName;
    
    // 设置动画状态
    isAnimating = true;
    
    // 保存原始平滑因子
    const originalSmoothFactor = parallaxConfig.smoothFactor;
    parallaxConfig.smoothFactor = 0.001;
    
    // 创建GSAP时间线动画
    cameraAnimation = gsap.timeline({
        onStart: () => {
            console.log('开始动画');
        },
        onComplete: function onFlyInComplete() {
            console.log('动画完成回调');
            try {
                parallaxState.baseCameraPosition.copy(camera.position);
                parallaxState.baseCameraRotation.copy(camera.rotation);

                let popupId = `${objectName}-popup`;
                console.log('弹窗ID:', popupId);
                let popup = document.getElementById(popupId);
                console.log('弹窗元素:', popup);
                if (popup) {
                    console.log('准备显示弹窗');
                    popup.classList.remove('show');
                    void popup.offsetWidth;
                    popup.classList.add('show');
                    currentActivePopup = popupId;
                    console.log('弹窗显示完成');
                    
                    // 如果是布告板，更新文章列表
                    if (objectName === 'bulletin-board') {
                        updateBulletinBoard();
                    }
                } else {
                    console.error('未找到弹窗元素:', popupId);
                }
            } catch (error) {
                console.error('动画完成回调出错:', error);
            } finally {
                parallaxConfig.smoothFactor = originalSmoothFactor;
                isAnimating = false;
                isProcessingClick = false;
                console.log('动画状态已重置:', { isAnimating, isProcessingClick });
            }
        },
        onInterrupt: function onFlyInInterrupt() {
            console.log('飞入动画被中断，复位状态');
            parallaxConfig.smoothFactor = originalSmoothFactor;
            isAnimating = false;
            isProcessingClick = false;
        }
    });
    
    // 简单的相机运动
    cameraAnimation.to(camera.position, {
        x: cameraConfig.targetPosition[0],
        y: cameraConfig.targetPosition[1],
        z: cameraConfig.targetPosition[2],
        duration: 2.0,
        ease: 'power3.inOut'
    });
    
    // 旋转动画
    cameraAnimation.to(camera.rotation, {
        y: cameraConfig.rotation.targetY,
        duration: 2.0,
        ease: 'power3.inOut'
    }, '<');

    // 保持高亮效果
    highlightObject(objectName, true);
}

// 显示弹窗
function showPopup(type) {
    // 关闭当前打开的弹窗
    closeAllPopups();

    // 根据类型显示对应的弹窗
    let popupId = '';
    switch (type) {
        case 'drum-tower':
            popupId = 'drum-tower-popup';
            break;
        case 'pavilion':
            popupId = 'pavilion-popup';
            break;
        case 'bulletin-board':
            popupId = 'bulletin-board-popup';
            break;
    }

    if (popupId) {
        const popup = document.getElementById(popupId);
        if (popup) {
            popup.classList.add('show');
            currentActivePopup = popup;
        }
    }
}

// 停止当前动画
function stopCurrentAnimation() {
    console.log('stopCurrentAnimation 函数被调用');
    if (cameraAnimation) {
        cameraAnimation.kill();
        cameraAnimation = null;
    }
}

// 高亮对象
function highlightObject(objectName, highlight) {
    const object = interactiveObjects[objectName];
    if (!object) return;

    // 移除旧的高光效果
    if (object.userData.highlightSprite) {
        scene.remove(object.userData.highlightSprite);
        object.userData.highlightSprite = null;
    }

    if (highlight) {
        // 获取对象的包围盒
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDimension = Math.max(size.x, size.y, size.z);
        
        // 创建光晕纹理
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // 创建径向渐变，模拟球形边缘发光效果
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 256);
        
        // 光晕颜色：边缘发光效果
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(0.9, 'rgba(255, 255, 255, 0.4)');
        gradient.addColorStop(0.95, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 创建纹理
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        // 创建Sprite材质
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        // 创建Sprite
        const sprite = new THREE.Sprite(spriteMaterial);
        
        // 设置Sprite大小
        const spriteSize = maxDimension * 1.5;
        sprite.scale.set(spriteSize, spriteSize, 1);
        sprite.position.copy(center);
        
        // 添加到场景
        scene.add(sprite);
        
        // 保存Sprite引用
        object.userData.highlightSprite = sprite;
    }
}

// 更新布告板（具体实现在文件后半段）

// 关闭所有弹窗
function closeAllPopups() {
    const popups = document.querySelectorAll('.popup');
    popups.forEach(popup => {
        popup.classList.remove('show');
    });
    currentActivePopup = null;
}

// 关闭弹窗
function closePopup(popupId) {
    let originalSmoothFactor;
    
    try {
        let popup = document.getElementById(popupId);
        if (popup) {
            popup.classList.remove('show');
            if (currentActivePopup === popupId) {
                currentActivePopup = null;
            }
        }

        // 取消高亮效果
        if (currentActiveObject) {
            highlightObject(currentActiveObject, false);
            currentActiveObject = null;
        }

        currentActivePopup = null;
        
        // 如果正在动画，先停止当前动画
        stopCurrentAnimation();
        
        // 设置动画状态
        isAnimating = true;
        
        // 保存原始平滑因子
        originalSmoothFactor = parallaxConfig.smoothFactor;
        parallaxConfig.smoothFactor = 0.001;
    
        // 创建返回动画时间线
        cameraAnimation = gsap.timeline({
            onStart: () => {
                console.log('开始返回动画');
            },
            onComplete: function onReturnComplete() {
                console.log('返回动画完成回调');
                try {
                    camera.position.set(cameraConfig.basePosition[0], cameraConfig.basePosition[1], cameraConfig.basePosition[2]);
                    camera.rotation.set(cameraConfig.rotation.baseX, cameraConfig.rotation.baseY, 0);

                    parallaxState.baseCameraPosition.set(cameraConfig.basePosition[0], cameraConfig.basePosition[1], cameraConfig.basePosition[2]);
                    parallaxState.baseCameraRotation.set(cameraConfig.rotation.baseX, cameraConfig.rotation.baseY, 0);
                } catch (error) {
                    console.error('关闭弹窗动画完成回调出错:', error);
                } finally {
                    parallaxConfig.smoothFactor = originalSmoothFactor;
                    isAnimating = false;
                    isProcessingClick = false;
                }
            },
            onInterrupt: function onReturnInterrupt() {
                console.log('返回动画被中断，复位状态');
                parallaxConfig.smoothFactor = originalSmoothFactor;
                isAnimating = false;
                isProcessingClick = false;
            }
        });
        
        // 简单的相机返回运动
        cameraAnimation.to(camera.position, {
            x: cameraConfig.basePosition[0],
            y: cameraConfig.basePosition[1],
            z: cameraConfig.basePosition[2],
            duration: 2.0,
            ease: 'power3.inOut'
        });
        
        // 旋转动画
        cameraAnimation.to(camera.rotation, {
            x: cameraConfig.rotation.baseX,
            y: cameraConfig.rotation.baseY,
            z: 0,
            duration: 2.0,
            ease: 'power3.inOut'
        }, '<');
    } catch (error) {
        console.error('关闭弹窗出错:', error);
        // 确保状态重置
        isAnimating = false;
        isProcessingClick = false;
    }
}

// 窗口大小调整
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// 滚动事件
function onScroll() {
    scrollState.targetScroll = window.scrollY;
}

// 应用鼠标视差效果
function applyParallaxEffect() {
    if (isAnimating) return;
    
    // 平滑更新鼠标位置
    parallaxState.currentMouseX += (parallaxState.targetMouseX - parallaxState.currentMouseX) * parallaxConfig.smoothFactor;
    parallaxState.currentMouseY += (parallaxState.targetMouseY - parallaxState.currentMouseY) * parallaxConfig.smoothFactor;
    
    // 计算相机偏移
    const cameraOffsetX = parallaxState.currentMouseX * parallaxConfig.cameraMoveFactor * parallaxConfig.maxCameraOffset;
    const cameraOffsetY = parallaxState.currentMouseY * parallaxConfig.cameraMoveFactor * parallaxConfig.maxCameraOffset;
    
    // 计算相机旋转
    const cameraRotationX = -parallaxState.currentMouseY * parallaxConfig.cameraRotateFactor * parallaxConfig.maxCameraRotation;
    const cameraRotationY = parallaxState.currentMouseX * parallaxConfig.cameraRotateFactor * parallaxConfig.maxCameraRotation;
    
    // 应用相机位置偏移
    camera.position.copy(parallaxState.baseCameraPosition);
    camera.position.x += cameraOffsetX;
    camera.position.y += cameraOffsetY;
    
    // 应用相机旋转
    camera.rotation.copy(parallaxState.baseCameraRotation);
    camera.rotation.x += cameraRotationX;
    camera.rotation.y += cameraRotationY;
    
    // 为场景中的模型应用视差效果（根据深度）
    if (currentModel) {
        currentModel.traverse((child) => {
            if (child.isMesh && child.userData.originalPosition) {
                // 计算模型的深度（Z值）
                const depth = child.position.z;
                
                // 根据深度计算移动幅度（深度越大，移动越小）
                const depthFactor = Math.max(0, 1 - Math.abs(depth) * 0.01);
                const modelOffsetX = -parallaxState.currentMouseX * parallaxConfig.modelMoveFactor * depthFactor;
                const modelOffsetY = -parallaxState.currentMouseY * parallaxConfig.modelMoveFactor * depthFactor;
                
                // 应用模型偏移
                child.position.copy(child.userData.originalPosition);
                child.position.x += modelOffsetX;
                child.position.y += modelOffsetY;
            }
        });
    }
}

// 更新光晕动画效果
function updateHighlightAnimations() {
    const time = Date.now() * 0.001; // 获取当前时间（秒）
    
    // 遍历所有可交互对象
    for (const [name, object] of Object.entries(interactiveObjects)) {
        if (object.userData.highlightSprite) {
            const sprite = object.userData.highlightSprite;
            
            // 透明度脉动
            const pulseOpacity = 0.5 + Math.sin(time * 1.4) * 0.1;
            
            // 缩放动画
            const pulseScale = 1 + Math.sin(time * 1.8) * 0.15;
            
            // 应用脉动效果
            sprite.material.opacity = pulseOpacity;
            const baseScale = sprite.userData.baseScale || sprite.scale.x;
            sprite.userData.baseScale = baseScale;
            sprite.scale.set(baseScale * pulseScale, baseScale * pulseScale, 1);
        }
    }
}

// 初始化桃花粒子系统
function initPeachBlossomParticles() {
    console.log('初始化桃花粒子系统');
    
    // 创建粒子几何
    peachBlossomGeometry = new THREE.PlaneGeometry(1, 1);
    
    // 创建粒子材质
    const textureLoader = new THREE.TextureLoader();
    const peachBlossomTexture = textureLoader.load('assets/img/花瓣透明通道_爱给网_aigei_com.png', () => {
        console.log('桃花花瓣纹理加载成功');
    }, undefined, (error) => {
        console.error('桃花花瓣纹理加载失败:', error);
    });
    
    peachBlossomMaterial = new THREE.MeshBasicMaterial({
        map: peachBlossomTexture,
        transparent: true,
        alphaTest: 0.5,
        side: THREE.DoubleSide
    });
    
    // 清空现有粒子
    peachBlossomParticles = [];
    
    // 创建多个粒子
    for (let i = 0; i < 50; i++) {
        const particle = new THREE.Mesh(peachBlossomGeometry, peachBlossomMaterial);
        
        // 随机位置
        const x = (Math.random() - 0.5) * 20;
        const y = Math.random() * 10 + 15;
        const z = (Math.random() - 0.5) * 10;
        
        particle.position.set(x, y, z);
        
        // 缩放粒子
        particle.scale.set(0.3, 0.3, 0.3);
        
        // 随机初始旋转
        particle.rotation.x = Math.random() * Math.PI * 2;
        particle.rotation.y = Math.random() * Math.PI * 2;
        particle.rotation.z = Math.random() * Math.PI * 2;
        
        // 添加到场景
        scene.add(particle);
        
        // 存储粒子信息
        peachBlossomParticles.push({
            mesh: particle,
            speed: Math.random() * 0.05 + 0.02,
            driftX: (Math.random() - 0.5) * 0.02,
            driftZ: (Math.random() - 0.5) * 0.005,
            rotationSpeedX: Math.random() * 0.03 + 0.01,
            rotationSpeedY: Math.random() * 0.02 + 0.005,
            rotationSpeedZ: Math.random() * 0.01 + 0.005
        });
    }
    
    console.log('桃花粒子系统初始化完成，创建了', peachBlossomParticles.length, '个粒子');
}

// 重置桃花粒子
function resetPeachBlossomParticle(particle) {
    particle.position.y = Math.random() * 10 + 15;
    particle.position.x = (Math.random() - 0.5) * 20;
    particle.position.z = (Math.random() - 0.5) * 10;
    // 重置旋转
    particle.rotation.x = Math.random() * Math.PI * 2;
    particle.rotation.y = Math.random() * Math.PI * 2;
    particle.rotation.z = Math.random() * Math.PI * 2;
}

// 更新桃花粒子
function updatePeachBlossomParticles() {
    peachBlossomParticles.forEach(particle => {
        // 下落
        particle.mesh.position.y -= particle.speed;
        
        // 水平漂移
        particle.mesh.position.x += particle.driftX;
        
        // 深度方向漂移
        particle.mesh.position.z += particle.driftZ;
        
        // 自旋转
        particle.mesh.rotation.x += particle.rotationSpeedX;
        particle.mesh.rotation.y += particle.rotationSpeedY;
        particle.mesh.rotation.z += particle.rotationSpeedZ;
        
        // 重置位置
        if (particle.mesh.position.y < -5) {
            resetPeachBlossomParticle(particle.mesh);
        }
    });
}

// 应用关键帧动画
function applyKeyframeAnimation() {
    if (!model || !camera) return;
    
    // 计算滚动进度
    const scrollHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight;
    if (scrollHeight > 0) {
        scrollState.currentScroll += (scrollState.targetScroll - scrollState.currentScroll) * 0.1;
        scrollState.scrollProgress = Math.min(scrollState.currentScroll / scrollHeight, 1);
    }
    
    // 平滑滚动进度
    scrollState.easedProgress += (scrollState.scrollProgress - scrollState.easedProgress) * 0.05;
    
    // 根据滚动进度计算当前关键帧
    const animationTime = scrollState.easedProgress * 2.0; // 2.0是关键帧的总时间
    
    // 找到当前时间对应的关键帧
    let startKeyframe = keyframes[0];
    let endKeyframe = keyframes[keyframes.length - 1];
    
    for (let i = 0; i < keyframes.length - 1; i++) {
        if (animationTime >= keyframes[i].time && animationTime <= keyframes[i + 1].time) {
            startKeyframe = keyframes[i];
            endKeyframe = keyframes[i + 1];
            break;
        }
    }
    
    // 计算当前时间在两个关键帧之间的比例
    const timeRatio = (animationTime - startKeyframe.time) / (endKeyframe.time - startKeyframe.time);
    
    // 应用缓动函数
    const easedRatio = applyEasing(timeRatio, startKeyframe.ease);
    
    // 插值计算模型位置和旋转
    if (currentModel && currentModel.userData.originalPosition) {
        currentModel.position.x = currentModel.userData.originalPosition.x + lerp(startKeyframe.modelX, endKeyframe.modelX, easedRatio);
        currentModel.position.y = currentModel.userData.originalPosition.y + lerp(startKeyframe.modelY, endKeyframe.modelY, easedRatio);
        currentModel.position.z = currentModel.userData.originalPosition.z + lerp(startKeyframe.modelZ, endKeyframe.modelZ, easedRatio);
        currentModel.rotation.y = lerp(startKeyframe.modelRot, endKeyframe.modelRot, easedRatio);
    } else if (model) {
        model.position.x = lerp(startKeyframe.modelX, endKeyframe.modelX, easedRatio);
        model.position.y = lerp(startKeyframe.modelY, endKeyframe.modelY, easedRatio);
        model.position.z = lerp(startKeyframe.modelZ, endKeyframe.modelZ, easedRatio);
        model.rotation.y = lerp(startKeyframe.modelRot, endKeyframe.modelRot, easedRatio);
    }
    
    // 插值计算摄像机位置和旋转
    camera.position.x = lerp(startKeyframe.camX, endKeyframe.camX, easedRatio);
    camera.position.y = lerp(startKeyframe.camY, endKeyframe.camY, easedRatio);
    camera.position.z = lerp(startKeyframe.camZ, endKeyframe.camZ, easedRatio);
    camera.rotation.x = lerp(startKeyframe.rotX, endKeyframe.rotX, easedRatio);
    camera.rotation.y = lerp(startKeyframe.rotY, endKeyframe.rotY, easedRatio);
    camera.rotation.z = lerp(startKeyframe.rotZ, endKeyframe.rotZ, easedRatio);
    
    // 调试：显示动画状态
    if (Math.random() < 0.1) { // 每10帧显示一次，避免日志过多
        console.log('动画时间:', animationTime);
        console.log('滚动进度:', scrollState.scrollProgress);
        console.log('模型位置:', model.position);
        console.log('相机位置:', camera.position);
    }
}

// 应用缓动函数
function applyEasing(t, ease) {
    switch (ease) {
        case "easeInOutSine":
            return 0.5 * (1 - Math.cos(Math.PI * t));
        case "easeInOutCubic":
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        case "easeInOutQuint":
            return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
        default:
            return t;
    }
}

// 缓动函数
function easeInOutSine(t) {
    return (1 + Math.sin(Math.PI * t - Math.PI / 2)) / 2;
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeInOutQuint(t) {
    return t < 0.5 ? 16 * t * t * t * t * t : 1 + Math.pow(-2 * t + 2, 5) / 2;
}

// 线性插值
function lerp(a, b, t) {
    return a + (b - a) * t;
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    
    if (!isAnimating) {
        // 更新视差效果
        parallaxState.currentMouseX += (parallaxState.targetMouseX - parallaxState.currentMouseX) * parallaxConfig.smoothFactor;
        parallaxState.currentMouseY += (parallaxState.targetMouseY - parallaxState.currentMouseY) * parallaxConfig.smoothFactor;
        
        // 限制偏移量
        const limitedMouseX = Math.max(-1, Math.min(1, parallaxState.currentMouseX));
        const limitedMouseY = Math.max(-1, Math.min(1, parallaxState.currentMouseY));
        
        // 应用相机视差
        if (parallaxState.baseCameraPosition) {
            camera.position.x = parallaxState.baseCameraPosition.x + limitedMouseX * parallaxConfig.maxCameraOffset;
            camera.position.y = parallaxState.baseCameraPosition.y - limitedMouseY * (parallaxConfig.maxCameraOffset * 0.5);
            
            camera.rotation.y = parallaxState.baseCameraRotation.y + limitedMouseX * parallaxConfig.maxCameraRotation;
            camera.rotation.x = parallaxState.baseCameraRotation.x + limitedMouseY * (parallaxConfig.maxCameraRotation * 0.5);
        }
        
        // 应用模型视差
        if (model) {
            // 对模型本身应用视差效果
            if (model.userData.originalPosition) {
                model.position.x = model.userData.originalPosition.x - limitedMouseX * parallaxConfig.modelMoveFactor;
                model.position.y = model.userData.originalPosition.y + limitedMouseY * parallaxConfig.modelMoveFactor;
            }
            
            // 对模型的子对象应用视差效果
            model.children.forEach(child => {
                if (child.userData.originalPosition) {
                    child.position.x = child.userData.originalPosition.x - limitedMouseX * parallaxConfig.modelMoveFactor;
                    child.position.y = child.userData.originalPosition.y + limitedMouseY * parallaxConfig.modelMoveFactor;
                }
            });
        }
    }
    
    // 更新桃花粒子
    updatePeachBlossomParticles();
    
    // 渲染场景
    renderer.render(scene, camera);
}

// 切换标签页
function switchTab(tabId) {
    // 隐藏所有标签页
    document.querySelectorAll('.tab-page').forEach(page => {
        page.classList.remove('active');
    });
    
    // 移除所有标签按钮的激活状态
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 显示选中的标签页
    document.getElementById('page-' + tabId).classList.add('active');
    
    // 激活对应的标签按钮
    document.getElementById('tab-' + tabId).classList.add('active');

    if (tabId === 'browse') {
        updateBulletinBoard();
    } else if (tabId === 'myarticles') {
        loadMyArticles();
    }
}

function loadArticle(articleId) {
    const article = articlesDatabase[articleId];
    if (!article) return;

    document.getElementById('poem-title').textContent = article.title;
    document.getElementById('poem-author').textContent = article.author;

    const poemTextElement = document.getElementById('poem-text');
    poemTextElement.innerHTML = '';
    article.text.forEach(line => {
        const p = document.createElement('p');
        p.style.margin = '10px 0';
        p.style.fontStyle = 'italic';
        p.style.fontSize = '1.1em';
        p.style.fontFamily = 'STSong, SimSun, serif';
        p.style.color = '#212121';
        p.textContent = line;
        poemTextElement.appendChild(p);
    });

    const articleAnalysisElement = document.getElementById('article-analysis');
    articleAnalysisElement.innerHTML = '<h3 style="margin-bottom: 10px; color: #795548; font-size: 1.1em;">文章赏析</h3>';
    article.analysis.forEach(paragraph => {
        const p = document.createElement('p');
        p.style.marginBottom = '10px';
        p.style.color = '#212121';
        p.textContent = paragraph;
        articleAnalysisElement.appendChild(p);
    });
}

function getEditorPayload(published) {
    const titleInput = document.getElementById('poem-compose-title') || document.getElementById('article-title');
    const contentInput = document.getElementById('poem-compose-text') || document.getElementById('article-content');
    const authorInputEl = document.getElementById('article-author');
    const templateSelect = document.getElementById('drum-compose-template');

    const title = (titleInput && titleInput.value ? titleInput.value : '').trim();
    const authorInput = (authorInputEl && authorInputEl.value ? authorInputEl.value : '').trim();
    const content = (contentInput && contentInput.value ? contentInput.value : '').trim();
    const user = window.DBService ? window.DBService.getCurrentUser() : { id: 'u_guest', username: '游客' };
    const author = authorInput || user.username || '匿名';
    const inferredTitle = title || ('未命名古诗 · ' + ((templateSelect && templateSelect.options[templateSelect.selectedIndex]) ? templateSelect.options[templateSelect.selectedIndex].text : '自由体'));
    return { title: inferredTitle, author, content, userId: user.id, published: !!published };
}

async function saveArticle() {
    if (!window.DBService) {
        alert('数据服务未初始化');
        return;
    }
    const payload = getEditorPayload(false);
    if (!payload.content) {
        alert('请先写下诗句内容');
        return;
    }

    const result = await window.DBService.createArticle(payload);
    if (result.success) {
        setComposeStatus('草稿已保存。');
        alert('草稿已保存到本地。');
        await loadMyArticles();
    }
}

async function publishArticle() {
    if (!window.DBService) {
        alert('数据服务未初始化');
        return;
    }
    const payload = getEditorPayload(true);
    if (!payload.content) {
        alert('请先写下诗句内容');
        return;
    }

    const result = await window.DBService.createArticle(payload);
    if (result.success) {
        setComposeStatus('发表成功，布告板已更新。');
        alert('发表成功！其它用户可在布告板文章列表浏览此古诗。');
        await updateBulletinBoard();
        await loadMyArticles();
    }
}

function previewArticle() {
    const payload = getEditorPayload(false);
    if (!payload.content) {
        alert('请先写下诗句内容');
        return;
    }
    alert('标题：' + payload.title + '\n作者：' + payload.author + '\n\n' + payload.content);
}

function setComposeStatus(message) {
    const status = document.getElementById('compose-publish-status');
    if (!status) return;
    status.textContent = message;
}

function bindComposeActionButtons() {
    const publishBtn = document.getElementById('compose-publish-btn');
    if (publishBtn && !publishBtn.dataset.bound) {
        publishBtn.addEventListener('click', publishArticle);
        publishBtn.dataset.bound = '1';
    }

    const draftBtn = document.getElementById('compose-save-draft-btn');
    if (draftBtn && !draftBtn.dataset.bound) {
        draftBtn.addEventListener('click', saveArticle);
        draftBtn.dataset.bound = '1';
    }

    const previewBtn = document.getElementById('compose-preview-btn');
    if (previewBtn && !previewBtn.dataset.bound) {
        previewBtn.addEventListener('click', previewArticle);
        previewBtn.dataset.bound = '1';
    }
}

async function loadMyArticles() {
    const container = document.getElementById('myarticles-list-container');
    if (!container || !window.DBService) return;
    const user = window.DBService.getCurrentUser();
    const list = await window.DBService.getArticles(false, user.id);
    if (!list.length) {
        container.innerHTML = '<div class="no-articles">暂无草稿，快去写第一篇吧。</div>';
        return;
    }

    container.innerHTML = '';
    list.forEach(article => {
        const card = document.createElement('div');
        card.className = 'article-card';
        card.innerHTML =
            '<h4>' + article.title + '</h4>' +
            '<div class="article-meta">作者：' + article.author + ' | 更新时间：' + new Date(article.updatedAt || article.createdAt).toLocaleString() + '</div>' +
            '<p>' + (article.content.length > 80 ? article.content.slice(0, 80) + '...' : article.content) + '</p>' +
            '<div class="article-actions">' +
            '  <button class="btn" onclick="editArticle(\'' + article.id + '\')">编辑</button>' +
            '  <button class="btn" onclick="previewArticleById(\'' + article.id + '\')">预览</button>' +
            '  <button class="btn btn-secondary" onclick="removeArticle(\'' + article.id + '\')">删除</button>' +
            '</div>';
        container.appendChild(card);
    });
}

async function editArticle(articleId) {
    if (!window.DBService) return;
    const article = await window.DBService.getArticle(articleId);
    if (!article) return;
    switchTab('write');
    document.getElementById('article-title').value = article.title || '';
    document.getElementById('article-author').value = article.author || '';
    document.getElementById('article-content').value = article.content || '';
}

async function previewArticleById(articleId) {
    if (!window.DBService) return;
    const article = await window.DBService.getArticle(articleId);
    if (!article) return;
    alert('标题：' + article.title + '\n作者：' + article.author + '\n\n' + article.content);
}

async function removeArticle(articleId) {
    if (!window.DBService) return;
    if (!confirm('确定删除该文章？')) return;
    await window.DBService.deleteArticle(articleId);
    await loadMyArticles();
    await updateBulletinBoard();
}

async function updateBulletinBoard() {
    const container = document.getElementById('articles-list');
    if (!container || !window.DBService) return;
    const articles = await window.DBService.getArticles(true);
    if (!articles.length) {
        container.innerHTML = '<div class="no-articles">暂无已发布文章。</div>';
        return;
    }

    container.innerHTML = '';
    for (const article of articles) {
        const comments = await window.DBService.getComments(article.id);
        const card = document.createElement('div');
        card.className = 'article-card';
        card.innerHTML =
            '<h4>' + article.title + '</h4>' +
            '<div class="article-meta">作者：' + article.author + ' | 发布时间：' + new Date(article.createdAt).toLocaleString() + '</div>' +
            '<p>' + article.content + '</p>' +
            '<div class="article-actions">' +
            '  <button class="btn" onclick="likeArticle(\'' + article.id + '\')">点赞 (' + (article.likes || 0) + ')</button>' +
            '  <button class="btn" onclick="toggleFavorite(\'' + article.id + '\')">收藏 (' + (article.favoriteCount || 0) + ')</button>' +
            '  <button class="btn" onclick="toggleComments(\'' + article.id + '\')">评论 (' + comments.length + ')</button>' +
            '</div>' +
            '<div id="comments-box-' + article.id + '" style="display:none; margin-top:10px;">' +
            '  <div id="comments-list-' + article.id + '" style="margin-bottom:10px;">' +
               comments.map(c => '<p style="margin:6px 0; color:#5a422b;"><strong>' + c.username + '：</strong>' + c.content + '</p>').join('') +
            '  </div>' +
            '  <div style="display:flex; gap:8px;">' +
            '    <input id="comment-input-' + article.id + '" type="text" placeholder="写下评论..." style="flex:1; padding:8px; border:1px solid rgba(121,85,72,0.3);" />' +
            '    <button class="btn" onclick="addComment(\'' + article.id + '\')">发表</button>' +
            '  </div>' +
            '</div>';
        container.appendChild(card);
    }
}

function toggleComments(articleId) {
    const box = document.getElementById('comments-box-' + articleId);
    if (!box) return;
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
}

async function addComment(articleId) {
    if (!window.DBService) return;
    const input = document.getElementById('comment-input-' + articleId);
    if (!input) return;
    const content = (input.value || '').trim();
    if (!content) {
        alert('评论不能为空');
        return;
    }
    await window.DBService.addComment(articleId, content);
    input.value = '';
    await updateBulletinBoard();
}

async function likeArticle(articleId) {
    if (!window.DBService) return;
    await window.DBService.toggleLike(articleId);
    await updateBulletinBoard();
}

async function toggleFavorite(articleId) {
    if (!window.DBService) return;
    await window.DBService.toggleFavorite(articleId);
    await updateBulletinBoard();
}

async function showMyFavorites() {
    const container = document.getElementById('articles-list');
    if (!container || !window.DBService) return;
    const favs = await window.DBService.getFavoriteArticles();
    if (!favs.length) {
        container.innerHTML = '<div class="no-articles">你还没有收藏文章。</div>';
        return;
    }
    container.innerHTML = '';
    favs.forEach(article => {
        const card = document.createElement('div');
        card.className = 'article-card';
        card.innerHTML =
            '<h4>' + article.title + '</h4>' +
            '<div class="article-meta">作者：' + article.author + '</div>' +
            '<p>' + article.content + '</p>' +
            '<div class="article-actions">' +
            '  <button class="btn btn-secondary" onclick="toggleFavorite(\'' + article.id + '\')">取消收藏</button>' +
            '</div>';
        container.appendChild(card);
    });
}

// 切换背景音乐
function toggleBackgroundMusic() {
    const music = document.getElementById('background-music');
    const button = document.getElementById('bgm-toggle');
    if (!music || !button) return;

    if (music.paused) {
        music.play();
        button.classList.add('active');
        button.textContent = '⏸ 音乐';
    } else {
        music.pause();
        button.classList.remove('active');
        button.textContent = '▶ 音乐';
    }
}

function setBackgroundMusicVolume(value) {
    const music = document.getElementById('background-music');
    if (!music) return;
    const next = Number(value);
    if (Number.isNaN(next)) return;
    music.volume = Math.max(0, Math.min(1, next));
}

function initBackgroundMusicControls() {
    const music = document.getElementById('background-music');
    const button = document.getElementById('bgm-toggle');
    const slider = document.getElementById('bgm-volume');
    if (!music || !button || !slider) return;

    if (!music.dataset.userVolumeBound) {
        slider.value = String(music.volume || 0.6);
        slider.addEventListener('input', function () {
            setBackgroundMusicVolume(slider.value);
        });
        button.addEventListener('click', toggleBackgroundMusic);
        music.dataset.userVolumeBound = '1';
    }

    button.textContent = music.paused ? '▶ 音乐' : '⏸ 音乐';
    button.classList.toggle('active', !music.paused);
}

async function bootstrapContentData() {
    if (!window.DBService) return;
    const published = await window.DBService.getArticles(true);
    if (published.length) return;
    const seeds = Object.keys(articlesDatabase).map(function (k) {
        const item = articlesDatabase[k];
        return {
            title: item.title,
            author: item.author,
            content: (item.text || []).join('\n'),
            userId: 'u_guest',
            published: true
        };
    });
    for (const seed of seeds) {
        await window.DBService.createArticle(seed);
    }
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', async function () {
    try {
        init();
    } catch (e) {
        console.error('3D 初始化失败:', e);
    }
    initBackgroundMusicControls();
    bindComposeActionButtons();
    const guideCard = document.querySelector('#3d-scene .card');
    if (guideCard) {
        guideCard.addEventListener('click', function () {
            guideCard.classList.add('is-collapsed');
        });
    }
    await bootstrapContentData();
    updateBulletinBoard();
    loadMyArticles();
});
