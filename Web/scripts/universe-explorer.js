import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OutlineEffect } from "three/addons/effects/OutlineEffect.js";

const HOTSPOTS = [
    {
        id: "portal",
        objectName: "Portal_Board",
        aliases: ["Portal_Board", "Portal_Post", "Portal_Text"],
        label: "Portal / Line to Body",
        type: "Gateway",
        phase: "Core system",
        copy: "El umbral fija la sintaxis del universo: editorial, tránsito y tensión material antes de que aparezca la música."
    },
    {
        id: "platform",
        objectName: "Platform_Sign_post",
        aliases: ["Platform_Sign"],
        label: "Platform 3",
        type: "Signal",
        phase: "Transit",
        copy: "La señalética vuelve explícita la ficción ferroviaria del andén: navegar [SIC] implica pasar por estaciones conceptuales."
    },
    {
        id: "poster-ambiguity",
        objectName: "Poster_Ambiguous",
        aliases: ["Poster_Ambiguous"],
        label: "Poster / Ambiguity",
        type: "Poster",
        phase: "Phase IV",
        copy: "La ambigüedad ya no es ruido lateral sino una verdad material, impresa y dejada a la vista dentro del campo."
    },
    {
        id: "poster-mss-white",
        objectName: "Poster_MssWhite",
        aliases: ["Poster_MssWhite"],
        label: "Poster / MSS WHITE",
        type: "Poster",
        phase: "Phase III",
        copy: "La fase oscura entra al escenario como expediente visual: densidad, repetición y una blancura que no resuelve la herida."
    },
    {
        id: "poster-desde-sol",
        objectName: "Poster_DesdeSol",
        aliases: ["Poster_DesdeSol"],
        label: "Poster / Desde el sol",
        type: "Poster",
        phase: "Phase II",
        copy: "La luz aparece en el andén como prueba de exposición emocional, no como cierre. El sistema recuerda el momento del despertar."
    },
    {
        id: "poster-al-reves",
        objectName: "Poster_AlReves",
        aliases: ["Poster_AlReves"],
        label: "Poster / Al revés",
        type: "Poster",
        phase: "Phase I",
        copy: "La inversión original se incrusta en la arquitectura del tren: mirar de lado para entender lo que el frente no muestra."
    },
    {
        id: "poster-map",
        objectName: "Poster_UniverseMap",
        aliases: ["Poster_UniverseMap"],
        label: "Mapa del universo",
        type: "Lore map",
        phase: "Archive",
        copy: "El mapa no describe un lugar estable; registra cómo las fases y símbolos de [SIC] se conectan dentro del mismo laboratorio mental."
    },
    {
        id: "cassette-mss-white",
        objectName: "Cassette_MssWhite",
        aliases: ["Cassette_MssWhite"],
        label: "Cassette / MSS WHITE",
        type: "Cassette",
        phase: "Phase III",
        copy: "Objeto de archivo físico. El soporte magnético aterriza la abstracción y hace legible la música como rastro tangible."
    },
    {
        id: "cassette-al-reves",
        objectName: "Cassette_AlReves",
        aliases: ["Cassette_AlReves"],
        label: "Cassette / Al revés",
        type: "Cassette",
        phase: "Phase I",
        copy: "Cinta de origen. El gesto de invertir no es nostalgia: es un método para romper la lectura lineal del sistema."
    },
    {
        id: "cassette-desde-sol",
        objectName: "Cassette_DesdeSol",
        aliases: ["Cassette_DesdeSol"],
        label: "Cassette / Desde el sol",
        type: "Cassette",
        phase: "Phase II",
        copy: "La claridad entra como cassette de tránsito, dejado a la mano como si fuera una señal abierta sobre el banco del andén."
    },
    {
        id: "cassette-ambiguity",
        objectName: "Cassette_Ambiguous",
        aliases: ["Cassette_Ambiguous"],
        label: "Cassette / Ambiguity",
        type: "Cassette",
        phase: "Phase IV",
        copy: "La nueva etapa se deja caer a ras de suelo: algo que ya puede tocarse pero que sigue diciendo varias cosas al mismo tiempo."
    },
    {
        id: "cards",
        objectName: "CardStack_Right_top",
        aliases: ["CardStack_Right", "CardStack_Left"],
        label: "Tarjetas [SIC]",
        type: "Field cards",
        phase: "Editorial mark",
        copy: "Las tarjetas repliegan el símbolo en formato objeto. No son merch: funcionan como piezas de navegación dentro del dossier físico."
    }
];

const HOTSPOT_BY_ID = new Map(HOTSPOTS.map((item) => [item.id, item]));
const HOTSPOT_MEDIA = {
    portal: {
        src: "./assets/sic_universe_station_preview.png",
        alt: "Vista general de la plataforma [SIC]",
        caption: "Umbral principal y encuadre maestro de la estación."
    },
    platform: {
        src: "./assets/sic_universe_station_preview.png",
        alt: "Señalética de Platform 3",
        caption: "La señal funciona como nodo de tránsito dentro del recorrido."
    },
    "poster-ambiguity": {
        src: "./assets/sic_phase_iv_ambiguity.png",
        alt: "Poster Ambiguity",
        caption: "Fase IV fijada como pieza editorial dentro del andén."
    },
    "poster-mss-white": {
        src: "./assets/sic_album_mss_white_universe.png",
        alt: "Poster MSS WHITE",
        caption: "Portada utilizada como objeto físico y punto de memoria."
    },
    "poster-desde-sol": {
        src: "./assets/sic_album_desde_sol.png",
        alt: "Poster Desde el sol",
        caption: "Portada solar desplegada en el piso del campo."
    },
    "poster-al-reves": {
        src: "./assets/sic_album_al_reves.png",
        alt: "Poster Al revés",
        caption: "Archivo de origen montado sobre la arquitectura del tren."
    },
    "poster-map": {
        src: "./assets/sic_universe_map.png",
        alt: "Mapa del universo SIC",
        caption: "Mapa conceptual para leer relaciones, fases y símbolos."
    },
    "cassette-mss-white": {
        src: "./assets/sic_album_mss_white_universe.png",
        alt: "Cassette MSS WHITE",
        caption: "Etiqueta del cassette usada como huella tangible del archivo."
    },
    "cassette-al-reves": {
        src: "./assets/sic_album_al_reves.png",
        alt: "Cassette Al revés",
        caption: "Cinta de origen integrada al recorrido como pieza interactiva."
    },
    "cassette-desde-sol": {
        src: "./assets/sic_album_desde_sol.png",
        alt: "Cassette Desde el sol",
        caption: "Soporte de tránsito luminoso dentro de la estación."
    },
    "cassette-ambiguity": {
        src: "./assets/sic_phase_iv_ambiguity.png",
        alt: "Cassette Ambiguity",
        caption: "Nueva fase materializada a ras de piso."
    },
    cards: {
        src: "./assets/sic_symbol_daniel.png",
        alt: "Tarjetas SIC",
        caption: "Tarjetas de campo usadas como interfaz editorial y símbolo."
    }
};

const doc = document;
const win = window;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (from, to, alpha) => from + (to - from) * alpha;

const canvas = doc.getElementById("universe-canvas");
const loadingScreen = doc.getElementById("loading-screen");
const loadingProgress = doc.getElementById("loading-progress");
const loadingCopy = doc.getElementById("loading-copy");
const sceneStatus = doc.getElementById("scene-status");
const modeStatus = doc.getElementById("mode-status");
const focusStatus = doc.getElementById("focus-status");
const hotspotList = doc.getElementById("hotspot-list");
const quickHotspots = doc.getElementById("quick-hotspots");
const inspectTitle = doc.getElementById("inspect-title");
const inspectImage = doc.getElementById("inspect-image");
const inspectCaption = doc.getElementById("inspect-caption");
const inspectCopy = doc.getElementById("inspect-copy");
const inspectType = doc.getElementById("inspect-type");
const inspectPhase = doc.getElementById("inspect-phase");
const reticle = doc.getElementById("reticle");
const reticleHint = doc.getElementById("reticle-hint");
const movePad = doc.getElementById("move-pad");
const moveKnob = doc.getElementById("move-knob");
const mobileInspect = doc.getElementById("mobile-inspect");

const modeButtons = Array.from(doc.querySelectorAll("[data-mode]"));
const resetViewButton = doc.getElementById("reset-view");
const focusHotspotButton = doc.getElementById("focus-hotspot");
const toggleHudButton = doc.getElementById("toggle-hud");
const hudFab = doc.getElementById("hud-fab");

if (!canvas) {
    throw new Error("Universe canvas not found.");
}

canvas.style.touchAction = "none";

const isCoarsePointer = win.matchMedia("(pointer: coarse)").matches;
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isCoarsePointer,
    alpha: true,
    powerPreference: "high-performance"
});
const outlineEffect = new OutlineEffect(renderer, {
    defaultThickness: 0.0035,
    defaultColor: [0.07, 0.05, 0.06],
    defaultAlpha: 0.86,
    defaultKeepAlive: true
});
const toonGradientMap = createToonGradientMap();

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.16;
renderer.setClearColor(0x050505, 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x151113, isCoarsePointer ? 0.03 : 0.026);

const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 120);
camera.position.set(0, 5, 14);

const timer = new THREE.Timer();
const loader = new GLTFLoader();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const poseCamera = new THREE.PerspectiveCamera();
const tempQuat = new THREE.Quaternion();

const world = new THREE.Group();
scene.add(world);

const hoverLight = new THREE.PointLight(0xd4434c, 1.2, 12, 2);
hoverLight.position.set(0, 3.5, 0);
scene.add(hoverLight);

scene.add(new THREE.HemisphereLight(0xfff5e8, 0x251417, 2.15));

const keyLight = new THREE.DirectionalLight(0xfff3eb, 2.6);
keyLight.position.set(-12, 15, 10);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(isCoarsePointer ? 1024 : 2048, isCoarsePointer ? 1024 : 2048);
keyLight.shadow.camera.near = 0.5;
keyLight.shadow.camera.far = 60;
keyLight.shadow.camera.left = -16;
keyLight.shadow.camera.right = 16;
keyLight.shadow.camera.top = 16;
keyLight.shadow.camera.bottom = -16;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xd82d39, 0.95);
fillLight.position.set(10, 8, -2);
scene.add(fillLight);

const shadowPlane = new THREE.Mesh(
    new THREE.CircleGeometry(8.5, 64),
    new THREE.MeshBasicMaterial({
        color: 0x1a1112,
        transparent: true,
        opacity: 0.32
    })
);
shadowPlane.rotation.x = -Math.PI / 2;
shadowPlane.position.y = 0.01;
scene.add(shadowPlane);

const beacon = new THREE.Group();
const beaconRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.44, 0.028, 12, 40),
    new THREE.MeshBasicMaterial({
        color: 0xc71f32,
        transparent: true,
        opacity: 0.92
    })
);
beaconRing.rotation.x = Math.PI / 2;
const beaconLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.95, 0)]),
    new THREE.LineBasicMaterial({
        color: 0xf6f1ea,
        transparent: true,
        opacity: 0.45
    })
);
beacon.add(beaconRing);
beacon.add(beaconLine);
beacon.visible = false;
beacon.userData.baseY = 0;
scene.add(beacon);

const runtime = {
    mode: "frame",
    modelRoot: null,
    sceneBox: new THREE.Box3(),
    sceneSize: new THREE.Vector3(12, 6, 12),
    sceneCenter: new THREE.Vector3(),
    walkBounds: {
        minX: -6,
        maxX: 6,
        minZ: -5,
        maxZ: 5
    },
    activeHotspotId: "portal",
    focusHotspotId: "portal",
    reticleHotspotId: null,
    hotspotNodes: new Map(),
    hotspotObjects: [],
    hotspotButtons: new Map(),
    quickHotspotButtons: new Map(),
    hudHidden: false,
    targetPose: {
        position: new THREE.Vector3(),
        quaternion: new THREE.Quaternion(),
        fov: 46
    },
    referencePose: {
        position: new THREE.Vector3(0, 5, 14),
        quaternion: new THREE.Quaternion(),
        fov: 46
    },
    referenceOffsetDirection: new THREE.Vector3(-0.68, 0.45, 0.57).normalize(),
    explore: {
        activeLook: false,
        pointerId: null,
        lastX: 0,
        lastY: 0,
        yaw: 0,
        pitch: -0.08,
        position: new THREE.Vector3(0, 1.58, 4.6),
        moveX: 0,
        moveY: 0,
        joystickX: 0,
        joystickY: 0,
        keyState: {
            forward: false,
            backward: false,
            left: false,
            right: false,
            sprint: false
        }
    },
    clickStart: {
        x: 0,
        y: 0,
        time: 0
    },
    moveStick: {
        active: false,
        pointerId: null
    }
};

buildHotspotList();
buildQuickHotspots();
bindUI();
resize();
win.addEventListener("resize", resize);
loader.load(
    "./assets/sic_universe_station.glb",
    handleLoaded,
    handleProgress,
    handleError
);
timer.connect(doc);
renderer.setAnimationLoop(render);

function bindUI() {
    modeButtons.forEach((button) => {
        button.addEventListener("click", () => {
            setMode(button.dataset.mode || "frame", true);
        });
    });

    resetViewButton?.addEventListener("click", () => {
        if (runtime.mode === "explore") {
            resetExplorePose(true);
            return;
        }
        applyReferencePose(true);
    });

    focusHotspotButton?.addEventListener("click", () => {
        focusHotspot(runtime.activeHotspotId, true);
    });

    toggleHudButton?.addEventListener("click", () => {
        setHudHidden(!runtime.hudHidden);
    });

    hudFab?.addEventListener("click", () => {
        setHudHidden(!runtime.hudHidden);
    });

    mobileInspect?.addEventListener("click", () => {
        const targetId = runtime.reticleHotspotId || runtime.activeHotspotId;
        if (targetId) {
            setActiveHotspot(targetId);
            focusHotspot(targetId, true);
        }
    });

    canvas.addEventListener("pointerdown", onCanvasPointerDown);
    canvas.addEventListener("pointermove", onCanvasPointerMove);
    canvas.addEventListener("pointerup", onCanvasPointerUp);
    canvas.addEventListener("pointerleave", onCanvasPointerUp);
    canvas.addEventListener("pointercancel", onCanvasPointerUp);

    doc.addEventListener("keydown", onKeyDown);
    doc.addEventListener("keyup", onKeyUp);

    movePad?.addEventListener("pointerdown", onMovePadDown);
    movePad?.addEventListener("pointermove", onMovePadMove);
    movePad?.addEventListener("pointerup", onMovePadUp);
    movePad?.addEventListener("pointercancel", onMovePadUp);
}

function setHudHidden(hidden) {
    runtime.hudHidden = hidden;
    doc.body.classList.toggle("hud-hidden", hidden);
    if (toggleHudButton) {
        toggleHudButton.textContent = hidden ? "Mostrar UI" : "Ocultar UI";
    }
    if (hudFab) {
        hudFab.textContent = hidden ? "Ver UI" : "UI";
    }
}

function buildHotspotList() {
    if (!hotspotList) {
        return;
    }

    hotspotList.innerHTML = "";

    HOTSPOTS.forEach((hotspot) => {
        const button = doc.createElement("button");
        button.type = "button";
        button.className = "hotspot-button";
        button.dataset.hotspot = hotspot.id;
        button.innerHTML = `<strong>${hotspot.label}</strong><span>${hotspot.type} / ${hotspot.phase}</span>`;
        button.addEventListener("click", () => {
            setActiveHotspot(hotspot.id);
            setMode("frame", true);
            focusHotspot(hotspot.id, true);
        });
        hotspotList.appendChild(button);
        runtime.hotspotButtons.set(hotspot.id, button);
    });
}

function buildQuickHotspots() {
    if (!quickHotspots) {
        return;
    }

    quickHotspots.innerHTML = "";

    HOTSPOTS.forEach((hotspot) => {
        const button = doc.createElement("button");
        button.type = "button";
        button.className = "quick-hotspot";
        button.dataset.hotspot = hotspot.id;
        button.textContent = hotspot.label;
        button.addEventListener("click", () => {
            setActiveHotspot(hotspot.id);
            setMode("frame", false);
            focusHotspot(hotspot.id, true);
        });
        quickHotspots.appendChild(button);
        runtime.quickHotspotButtons.set(hotspot.id, button);
    });
}

function createToonGradientMap() {
    const colors = new Uint8Array([
        24, 24, 24, 255,
        54, 54, 54, 255,
        86, 86, 86, 255,
        118, 118, 118, 255,
        152, 152, 152, 255,
        184, 184, 184, 255,
        214, 214, 214, 255,
        242, 242, 242, 255,
    ]);
    const texture = new THREE.DataTexture(colors, 8, 1, THREE.RGBAFormat);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    return texture;
}

function handleLoaded(gltf) {
    try {
        runtime.modelRoot = gltf.scene;
        world.add(runtime.modelRoot);

        centerModel(runtime.modelRoot);
        runtime.modelRoot.updateMatrixWorld(true);
        prepareModel(runtime.modelRoot);
        cacheHotspots(runtime.modelRoot);
        captureReferencePose(gltf);
        applyReferencePose(false);
        resetExplorePose(false);
        setActiveHotspot("portal");

        let nodeCount = 0;
        runtime.modelRoot.traverse(() => {
            nodeCount += 1;
        });

        sceneStatus.textContent = `modelo listo / ${nodeCount} nodos`;
        loadingCopy.textContent = "Modelo cargado. Puedes abrir objetos del lore o entrar en modo recorrido.";
        loadingScreen?.classList.add("is-hidden");
        doc.body.dataset.universeReady = "true";
        console.info("SIC universe ready");
    } catch (error) {
        console.error(error);
        doc.body.dataset.universeReady = "error";
        if (sceneStatus) {
            sceneStatus.textContent = "error al inicializar el modelo";
        }
        if (loadingCopy) {
            loadingCopy.textContent = error?.message || "Falló la inicialización del universo 3D.";
        }
    }
}

function handleProgress(event) {
    if (!loadingProgress) {
        return;
    }

    if (event.total > 0) {
        const percent = Math.round((event.loaded / event.total) * 100);
        loadingProgress.textContent = `${percent}%`;
    } else {
        loadingProgress.textContent = "cargando";
    }
}

function handleError(error) {
    console.error(error);
    doc.body.dataset.universeReady = "error";
    if (sceneStatus) {
        sceneStatus.textContent = "error al cargar glb";
    }
    if (loadingCopy) {
        loadingCopy.textContent = "No se pudo abrir el universo 3D. Verifica la carga del archivo sic_universe_station.glb.";
    }
}

function centerModel(root) {
    const box = new THREE.Box3().setFromObject(root);
    const center = box.getCenter(new THREE.Vector3());
    const anchor = new THREE.Vector3(center.x, box.min.y, center.z);
    root.position.sub(anchor);
    root.updateMatrixWorld(true);

    runtime.sceneBox.setFromObject(root);
    runtime.sceneBox.getCenter(runtime.sceneCenter);
    runtime.sceneBox.getSize(runtime.sceneSize);

    runtime.walkBounds.minX = runtime.sceneBox.min.x + 0.5;
    runtime.walkBounds.maxX = runtime.sceneBox.max.x - 0.5;
    runtime.walkBounds.minZ = runtime.sceneBox.min.z + 0.5;
    runtime.walkBounds.maxZ = runtime.sceneBox.max.z - 0.5;

    shadowPlane.scale.setScalar(Math.max(runtime.sceneSize.x, runtime.sceneSize.z) / 8.5);
    shadowPlane.position.copy(runtime.sceneCenter);
    shadowPlane.position.y = 0.012;
}

function createStylizedMaterial(material, object) {
    const baseColor = material?.color?.clone?.() || new THREE.Color(0xffffff);
    const emissive = material?.emissive?.clone?.() || new THREE.Color(0x000000);
    const transparent = Boolean(material?.transparent);
    const opacity = material?.opacity ?? 1;
    const alphaTest = material?.alphaTest ?? 0;
    const map = material?.map || null;
    const side = object.name.startsWith("Poster_") || object.name.includes("_label") || object.name.includes("_art")
        ? THREE.DoubleSide
        : material?.side ?? THREE.FrontSide;
    const isGraphic = object.name.startsWith("Poster_") || object.name.includes("_label") || object.name.includes("_art") || object.name.startsWith("CardStack_");
    const isGlass = transparent || object.name.includes("Glass") || object.name.startsWith("Crystal_");

    if (isGraphic) {
        return new THREE.MeshBasicMaterial({
            color: map ? new THREE.Color(0xffffff) : baseColor,
            map,
            transparent,
            opacity,
            alphaTest: alphaTest || 0.05,
            side,
        });
    }

    if (isGlass) {
        return new THREE.MeshPhysicalMaterial({
            color: baseColor,
            transparent: true,
            opacity: Math.min(opacity, 0.9),
            roughness: 0.18,
            metalness: 0.02,
            transmission: 0.18,
            thickness: 0.55,
            clearcoat: 0.8,
            clearcoatRoughness: 0.14,
            emissive,
            emissiveIntensity: 0.18,
            side,
        });
    }

    return new THREE.MeshToonMaterial({
        color: baseColor,
        map,
        gradientMap: toonGradientMap,
        transparent,
        opacity,
        emissive,
        emissiveIntensity: material?.emissiveIntensity ?? 0,
        side,
    });
}

function prepareModel(root) {
    const anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);

    root.traverse((object) => {
        if (!object.isMesh) {
            return;
        }

        object.castShadow = true;
        object.receiveShadow = true;

        const materials = Array.isArray(object.material) ? object.material : [object.material];

        const stylizedMaterials = materials.map((material) => {
            if (!material) {
                return material;
            }

            if (material.map) {
                material.map.anisotropy = anisotropy;
            }

            if (!object.name.startsWith("Poster_") && !object.name.includes("_label") && !object.name.includes("_art")) {
                object.geometry.computeVertexNormals();
            }

            const nextMaterial = createStylizedMaterial(material, object);
            nextMaterial.needsUpdate = true;
            nextMaterial.userData.outlineParameters = {
                thickness: object.name.startsWith("Poster_") ? 0.0012 : object.name.includes("Crystal_") ? 0.0018 : 0.0028,
                color: [0.08, 0.06, 0.07],
                alpha: 0.88,
                keepAlive: true,
            };

            return nextMaterial;
        });

        object.material = Array.isArray(object.material) ? stylizedMaterials : stylizedMaterials[0];
    });
}

function cacheHotspots(root) {
    runtime.hotspotNodes.clear();
    runtime.hotspotObjects = [];

    root.traverse((object) => {
        const hotspot = HOTSPOTS.find((entry) =>
            entry.aliases.some((alias) => object.name === alias || object.name.startsWith(alias))
        );

        if (!hotspot) {
            return;
        }

        if (!runtime.hotspotNodes.has(hotspot.id)) {
            runtime.hotspotNodes.set(hotspot.id, []);
        }

        runtime.hotspotNodes.get(hotspot.id).push(object);

        if (object.isMesh) {
            object.userData.hotspotId = hotspot.id;
            runtime.hotspotObjects.push(object);
        }
    });
}

function captureReferencePose(gltf) {
    let cameraNode = runtime.modelRoot?.getObjectByName("SceneCamera");

    if (!cameraNode && Array.isArray(gltf.cameras) && gltf.cameras.length) {
        cameraNode = gltf.cameras[0];
    }

    if (cameraNode && cameraNode.isCamera) {
        runtime.referencePose.position.copy(cameraNode.getWorldPosition(new THREE.Vector3()));
        runtime.referencePose.quaternion.copy(cameraNode.getWorldQuaternion(new THREE.Quaternion()));
        runtime.referencePose.fov = cameraNode.fov || 46;
    } else {
        const fallbackTarget = runtime.sceneCenter.clone().add(new THREE.Vector3(0.1, runtime.sceneSize.y * 0.18, -0.1));
        const fallbackPosition = fallbackTarget.clone().add(
            new THREE.Vector3(
                -runtime.sceneSize.x * 0.95,
                runtime.sceneSize.y * 0.82,
                runtime.sceneSize.z * 0.9
            )
        );
        runtime.referencePose.position.copy(fallbackPosition);
        runtime.referencePose.quaternion.copy(quaternionFromLookAt(fallbackPosition, fallbackTarget));
        runtime.referencePose.fov = 46;
    }

    const baseDirection = runtime.referencePose.position.clone().sub(runtime.sceneCenter);
    if (baseDirection.lengthSq() > 0) {
        runtime.referenceOffsetDirection.copy(baseDirection.normalize());
    }
}

function applyReferencePose(instant) {
    runtime.focusHotspotId = "portal";
    runtime.targetPose.position.copy(runtime.referencePose.position);
    runtime.targetPose.quaternion.copy(runtime.referencePose.quaternion);
    runtime.targetPose.fov = runtime.referencePose.fov;

    if (instant) {
        camera.position.copy(runtime.targetPose.position);
        camera.quaternion.copy(runtime.targetPose.quaternion);
        camera.fov = runtime.targetPose.fov;
        camera.updateProjectionMatrix();
    }

    setActiveHotspot("portal");
}

function setMode(mode, fromUser) {
    runtime.mode = mode === "explore" ? "explore" : "frame";

    modeButtons.forEach((button) => {
        button.classList.toggle("is-active", button.dataset.mode === runtime.mode);
    });

    if (runtime.mode === "explore") {
        if (reticle) {
            reticle.classList.add("is-visible");
        }
        if (fromUser) {
            resetExplorePose(false);
        }
        modeStatus.textContent = "recorrido libre";
        return;
    }

    runtime.reticleHotspotId = null;
    setReticleHint("");
    if (reticle) {
        reticle.classList.remove("is-visible");
    }
    modeStatus.textContent = "encuadre exacto";
    if (fromUser) {
        if (runtime.activeHotspotId && runtime.activeHotspotId !== "portal") {
            focusHotspot(runtime.activeHotspotId, false);
        } else {
            applyReferencePose(false);
        }
    }
}

function resetExplorePose(instant) {
    const start = runtime.sceneCenter.clone().add(
        new THREE.Vector3(
            -runtime.sceneSize.x * 0.18,
            1.58,
            runtime.sceneSize.z * 0.38
        )
    );

    runtime.explore.position.copy(start);
    clampExplorePosition();

    const lookPoint = runtime.sceneCenter.clone().add(new THREE.Vector3(0.3, 1.05, -0.1));
    const direction = lookPoint.sub(runtime.explore.position).normalize();
    runtime.explore.yaw = Math.atan2(direction.x, direction.z);
    runtime.explore.pitch = Math.asin(clamp(direction.y, -0.7, 0.7));

    if (instant) {
        applyExploreCamera(true);
    }
}

function applyExploreCamera(instant) {
    const cameraQuaternion = quaternionFromEuler(runtime.explore.pitch, runtime.explore.yaw);

    runtime.targetPose.position.copy(runtime.explore.position);
    runtime.targetPose.quaternion.copy(cameraQuaternion);
    runtime.targetPose.fov = 56;

    if (instant) {
        camera.position.copy(runtime.targetPose.position);
        camera.quaternion.copy(runtime.targetPose.quaternion);
        camera.fov = runtime.targetPose.fov;
        camera.updateProjectionMatrix();
    }
}

function focusHotspot(hotspotId, forceFrame) {
    const hotspot = HOTSPOT_BY_ID.get(hotspotId);
    const object = getHotspotObject(hotspotId);

    if (!hotspot || !object) {
        return;
    }

    if (forceFrame) {
        setMode("frame", false);
    }

    const bounds = new THREE.Box3().setFromObject(object);
    const focusPoint = bounds.getCenter(new THREE.Vector3());
    const radius = Math.max(bounds.getSize(new THREE.Vector3()).length(), 0.65);
    const distance = clamp(radius * 4.6, runtime.sceneSize.length() * 0.11, runtime.sceneSize.length() * 0.26);
    const position = focusPoint.clone().add(runtime.referenceOffsetDirection.clone().multiplyScalar(distance));

    position.y = Math.max(position.y, focusPoint.y + radius * 1.4);

    runtime.targetPose.position.copy(position);
    runtime.targetPose.quaternion.copy(quaternionFromLookAt(position, focusPoint));
    runtime.targetPose.fov = hotspot.type === "Cassette" ? 34 : 42;
    runtime.focusHotspotId = hotspotId;

    setActiveHotspot(hotspotId);
}

function setActiveHotspot(hotspotId) {
    const hotspot = HOTSPOT_BY_ID.get(hotspotId);
    const object = getHotspotObject(hotspotId);

    if (!hotspot || !object) {
        return;
    }

    runtime.activeHotspotId = hotspotId;

    inspectTitle.textContent = hotspot.label;
    inspectCopy.textContent = hotspot.copy;
    inspectType.textContent = hotspot.type;
    inspectPhase.textContent = hotspot.phase;
    focusStatus.textContent = hotspot.label.toLowerCase();

    const media = HOTSPOT_MEDIA[hotspotId] || HOTSPOT_MEDIA.portal;
    if (inspectImage && media) {
        inspectImage.src = media.src;
        inspectImage.alt = media.alt || hotspot.label;
    }
    if (inspectCaption && media) {
        inspectCaption.textContent = media.caption || hotspot.label;
    }

    runtime.hotspotButtons.forEach((button, id) => {
        button.classList.toggle("is-active", id === hotspotId);
    });
    runtime.quickHotspotButtons.forEach((button, id) => {
        button.classList.toggle("is-active", id === hotspotId);
    });

    const bounds = new THREE.Box3().setFromObject(object);
    const center = bounds.getCenter(new THREE.Vector3());
    const lift = Math.max(bounds.getSize(new THREE.Vector3()).y, 0.5) * 0.72;
    beacon.position.set(center.x, center.y + lift, center.z);
    beacon.userData.baseY = center.y + lift;
    hoverLight.position.set(center.x, center.y + 1.8, center.z);
    beacon.visible = true;
}

function getHotspotObject(hotspotId) {
    const nodes = runtime.hotspotNodes.get(hotspotId);
    if (!nodes || !nodes.length) {
        return null;
    }

    const exact = nodes.find((node) => node.name === HOTSPOT_BY_ID.get(hotspotId)?.objectName);
    return exact || nodes[0];
}

function quaternionFromLookAt(position, target) {
    poseCamera.position.copy(position);
    poseCamera.lookAt(target);
    return poseCamera.quaternion.clone();
}

function quaternionFromEuler(pitch, yaw) {
    tempQuat.setFromEuler(new THREE.Euler(pitch, yaw, 0, "YXZ"));
    return tempQuat.clone();
}

function onCanvasPointerDown(event) {
    runtime.clickStart.x = event.clientX;
    runtime.clickStart.y = event.clientY;
    runtime.clickStart.time = performance.now();

    if (runtime.mode !== "explore") {
        return;
    }

    runtime.explore.activeLook = true;
    runtime.explore.pointerId = event.pointerId;
    runtime.explore.lastX = event.clientX;
    runtime.explore.lastY = event.clientY;
    canvas.setPointerCapture?.(event.pointerId);
}

function onCanvasPointerMove(event) {
    if (runtime.mode === "explore" && runtime.explore.activeLook && runtime.explore.pointerId === event.pointerId) {
        const deltaX = event.clientX - runtime.explore.lastX;
        const deltaY = event.clientY - runtime.explore.lastY;
        runtime.explore.lastX = event.clientX;
        runtime.explore.lastY = event.clientY;
        runtime.explore.yaw -= deltaX * 0.0038;
        runtime.explore.pitch = clamp(runtime.explore.pitch - deltaY * 0.0028, -1.1, 0.52);
        return;
    }

    if (runtime.mode === "frame") {
        pointer.x = (event.clientX / win.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / win.innerHeight) * 2 + 1;
    }
}

function onCanvasPointerUp(event) {
    if (runtime.mode === "explore" && runtime.explore.pointerId === event.pointerId) {
        runtime.explore.activeLook = false;
        runtime.explore.pointerId = null;
        canvas.releasePointerCapture?.(event.pointerId);
        return;
    }

    if (runtime.mode !== "frame") {
        return;
    }

    const delta = Math.hypot(event.clientX - runtime.clickStart.x, event.clientY - runtime.clickStart.y);
    if (delta > 8 || performance.now() - runtime.clickStart.time > 300) {
        return;
    }

    const hit = raycastHotspot(event.clientX, event.clientY);
    if (hit) {
        setActiveHotspot(hit);
        focusHotspot(hit, false);
    }
}

function onMovePadDown(event) {
    runtime.moveStick.active = true;
    runtime.moveStick.pointerId = event.pointerId;
    movePad.setPointerCapture?.(event.pointerId);
    updateMovePad(event);
}

function onMovePadMove(event) {
    if (!runtime.moveStick.active || runtime.moveStick.pointerId !== event.pointerId) {
        return;
    }
    updateMovePad(event);
}

function onMovePadUp(event) {
    if (!runtime.moveStick.active || runtime.moveStick.pointerId !== event.pointerId) {
        return;
    }

    runtime.moveStick.active = false;
    runtime.moveStick.pointerId = null;
    runtime.explore.joystickX = 0;
    runtime.explore.joystickY = 0;
    movePad.releasePointerCapture?.(event.pointerId);
    moveKnob.style.transform = "translate(-50%, -50%)";
}

function updateMovePad(event) {
    const rect = movePad.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const radius = rect.width * 0.34;
    const deltaX = clamp(event.clientX - centerX, -radius, radius);
    const deltaY = clamp(event.clientY - centerY, -radius, radius);

    runtime.explore.joystickX = deltaX / radius;
    runtime.explore.joystickY = deltaY / radius;
    moveKnob.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;
}

function onKeyDown(event) {
    if (event.code === "KeyW" || event.code === "ArrowUp") {
        runtime.explore.keyState.forward = true;
    }
    if (event.code === "KeyS" || event.code === "ArrowDown") {
        runtime.explore.keyState.backward = true;
    }
    if (event.code === "KeyA" || event.code === "ArrowLeft") {
        runtime.explore.keyState.left = true;
    }
    if (event.code === "KeyD" || event.code === "ArrowRight") {
        runtime.explore.keyState.right = true;
    }
    if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
        runtime.explore.keyState.sprint = true;
    }
    if (event.code === "KeyE") {
        const targetId = runtime.reticleHotspotId || runtime.activeHotspotId;
        if (targetId) {
            setActiveHotspot(targetId);
            focusHotspot(targetId, true);
        }
    }
    if (event.code === "KeyH") {
        setHudHidden(!runtime.hudHidden);
    }
}

function onKeyUp(event) {
    if (event.code === "KeyW" || event.code === "ArrowUp") {
        runtime.explore.keyState.forward = false;
    }
    if (event.code === "KeyS" || event.code === "ArrowDown") {
        runtime.explore.keyState.backward = false;
    }
    if (event.code === "KeyA" || event.code === "ArrowLeft") {
        runtime.explore.keyState.left = false;
    }
    if (event.code === "KeyD" || event.code === "ArrowRight") {
        runtime.explore.keyState.right = false;
    }
    if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
        runtime.explore.keyState.sprint = false;
    }
}

function raycastHotspot(clientX, clientY) {
    if (!runtime.hotspotObjects.length) {
        return null;
    }

    pointer.x = (clientX / win.innerWidth) * 2 - 1;
    pointer.y = -(clientY / win.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(runtime.hotspotObjects, false);
    return hits[0]?.object?.userData?.hotspotId || null;
}

function updateReticleTarget() {
    if (runtime.mode !== "explore" || !runtime.hotspotObjects.length) {
        runtime.reticleHotspotId = null;
        setReticleHint("");
        return;
    }

    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const hits = raycaster.intersectObjects(runtime.hotspotObjects, false);
    const hotspotId = hits[0]?.object?.userData?.hotspotId || null;

    runtime.reticleHotspotId = hotspotId;

    if (hotspotId) {
        const hotspot = HOTSPOT_BY_ID.get(hotspotId);
        setReticleHint(`${hotspot.label} / presiona E o el boton inspeccionar`);
    } else {
        setReticleHint("");
    }
}

function setReticleHint(text) {
    if (!reticleHint) {
        return;
    }

    reticleHint.textContent = text;
    reticleHint.classList.toggle("is-visible", Boolean(text));
}

function updateExplore(dt) {
    const keyX = Number(runtime.explore.keyState.right) - Number(runtime.explore.keyState.left);
    const keyY = Number(runtime.explore.keyState.forward) - Number(runtime.explore.keyState.backward);
    const axisX = clamp(keyX + runtime.explore.joystickX, -1, 1);
    const axisY = clamp(keyY - runtime.explore.joystickY, -1, 1);

    runtime.explore.moveX = axisX;
    runtime.explore.moveY = axisY;

    const moveLength = Math.hypot(axisX, axisY);
    if (moveLength > 0.01) {
        const speed = runtime.explore.keyState.sprint ? 5.2 : 3.3;
        const forward = new THREE.Vector3(Math.sin(runtime.explore.yaw), 0, Math.cos(runtime.explore.yaw));
        const right = new THREE.Vector3(forward.z, 0, -forward.x);
        runtime.explore.position.addScaledVector(forward, (axisY / moveLength) * speed * dt);
        runtime.explore.position.addScaledVector(right, (axisX / moveLength) * speed * dt);
        clampExplorePosition();
    }

    applyExploreCamera(false);
}

function clampExplorePosition() {
    runtime.explore.position.x = clamp(runtime.explore.position.x, runtime.walkBounds.minX, runtime.walkBounds.maxX);
    runtime.explore.position.z = clamp(runtime.explore.position.z, runtime.walkBounds.minZ, runtime.walkBounds.maxZ);
    runtime.explore.position.y = 1.58;
}

function updateFrameCamera(dt) {
    const alpha = 1 - Math.exp(-dt * 4.2);
    camera.position.lerp(runtime.targetPose.position, alpha);
    camera.quaternion.slerp(runtime.targetPose.quaternion, alpha);
    camera.fov = lerp(camera.fov, runtime.targetPose.fov, alpha);
    camera.updateProjectionMatrix();
}

function updateExploreCamera(dt) {
    const alpha = 1 - Math.exp(-dt * 6.5);
    camera.position.lerp(runtime.targetPose.position, alpha);
    camera.quaternion.slerp(runtime.targetPose.quaternion, alpha);
    camera.fov = lerp(camera.fov, runtime.targetPose.fov, alpha);
    camera.updateProjectionMatrix();
}

function render() {
    timer.update();
    const dt = Math.min(timer.getDelta(), 0.05);
    const elapsed = timer.getElapsed();

    if (runtime.mode === "explore") {
        updateExplore(dt);
        updateExploreCamera(dt);
        updateReticleTarget();
    } else {
        updateFrameCamera(dt);
    }

    if (beacon.visible) {
        beacon.rotation.y = elapsed * 0.8;
        beaconRing.material.opacity = 0.76 + Math.sin(elapsed * 2.4) * 0.16;
        beacon.position.y = beacon.userData.baseY + Math.sin(elapsed * 1.8) * 0.045;
    }

    hoverLight.intensity = 1.1 + Math.sin(elapsed * 2.8) * 0.18;

    outlineEffect.render(scene, camera);
}

function resize() {
    const width = win.innerWidth;
    const height = win.innerHeight;
    const pixelRatio = Math.min(win.devicePixelRatio || 1, isCoarsePointer ? 1.35 : 1.8);

    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
}
