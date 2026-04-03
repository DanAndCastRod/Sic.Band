import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OutlineEffect } from "three/addons/effects/OutlineEffect.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const HOTSPOTS = [
    {
        id: "portal",
        objectName: "Portal_Board",
        aliases: ["Portal_Board", "Portal_Post", "Portal_Text"],
        label: "Portal / Line to Body",
        type: "Gateway",
        phase: "Core system",
        copy: "El umbral fija la sintaxis del universo: editorial, transito y tension material antes de que aparezca la musica."
    },
    {
        id: "platform",
        objectName: "Platform_Sign_post",
        aliases: ["Platform_Sign"],
        label: "Platform 3",
        type: "Signal",
        phase: "Transit",
        copy: "La senaletica vuelve explicita la ficcion ferroviaria del anden: navegar [SIC] implica pasar por estaciones conceptuales."
    },
    {
        id: "poster-ambiguity",
        objectName: "Poster_Ambiguous",
        aliases: ["Poster_Ambiguous"],
        label: "Poster / Ambiguity",
        type: "Poster",
        phase: "Phase IV",
        copy: "La ambiguedad ya no es ruido lateral sino una verdad material, impresa y dejada a la vista dentro del campo."
    },
    {
        id: "poster-mss-white",
        objectName: "Poster_MssWhite",
        aliases: ["Poster_MssWhite"],
        label: "Poster / MSS WHITE",
        type: "Poster",
        phase: "Phase III",
        copy: "La fase oscura entra al escenario como expediente visual: densidad, repeticion y una blancura que no resuelve la herida."
    },
    {
        id: "poster-desde-sol",
        objectName: "Poster_DesdeSol",
        aliases: ["Poster_DesdeSol"],
        label: "Poster / Desde el sol",
        type: "Poster",
        phase: "Phase II",
        copy: "La luz aparece en el anden como prueba de exposicion emocional, no como cierre. El sistema recuerda el momento del despertar."
    },
    {
        id: "poster-al-reves",
        objectName: "Poster_AlReves",
        aliases: ["Poster_AlReves"],
        label: "Poster / Al reves",
        type: "Poster",
        phase: "Phase I",
        copy: "La inversion original se incrusta en la arquitectura del tren: mirar de lado para entender lo que el frente no muestra."
    },
    {
        id: "poster-map",
        objectName: "Poster_UniverseMap",
        aliases: ["Poster_UniverseMap"],
        label: "Mapa del universo",
        type: "Lore map",
        phase: "Archive",
        copy: "El mapa no describe un lugar estable; registra como las fases y simbolos de [SIC] se conectan dentro del mismo laboratorio mental."
    },
    {
        id: "cassette-mss-white",
        objectName: "Cassette_MssWhite",
        aliases: ["Cassette_MssWhite"],
        label: "Cassette / MSS WHITE",
        type: "Cassette",
        phase: "Phase III",
        copy: "Objeto de archivo fisico. El soporte magnetico aterriza la abstraccion y hace legible la musica como rastro tangible."
    },
    {
        id: "cassette-al-reves",
        objectName: "Cassette_AlReves",
        aliases: ["Cassette_AlReves"],
        label: "Cassette / Al reves",
        type: "Cassette",
        phase: "Phase I",
        copy: "Cinta de origen. El gesto de invertir no es nostalgia: es un metodo para romper la lectura lineal del sistema."
    },
    {
        id: "cassette-desde-sol",
        objectName: "Cassette_DesdeSol",
        aliases: ["Cassette_DesdeSol"],
        label: "Cassette / Desde el sol",
        type: "Cassette",
        phase: "Phase II",
        copy: "La claridad entra como cassette de transito, dejado a la mano como si fuera una senal abierta sobre el banco del anden."
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
        copy: "Las tarjetas repliegan el simbolo en formato objeto. No son merch: funcionan como piezas de navegacion dentro del dossier fisico."
    },
    {
        id: "crystal-fortress",
        objectName: "Crystal_Base",
        aliases: ["Crystal_Base", "Crystal_0", "Crystal_"],
        label: "Fortaleza de cristal",
        type: "Monumento",
        phase: "Core system",
        copy: "La fortaleza de cristal emerge del centro del anden como un sistema nervioso visible. Cada aguja es una frecuencia congelada del universo [SIC]."
    }
];

const HOTSPOT_BY_ID = new Map(HOTSPOTS.map((item) => [item.id, item]));
const HOTSPOT_ORDER = HOTSPOTS.map((item) => item.id);
const HOTSPOT_MEDIA = {
    portal: {
        src: "./assets/sic_universe_station_preview.png",
        alt: "Vista general de la plataforma [SIC]",
        caption: "Umbral principal y encuadre maestro de la estacion."
    },
    platform: {
        src: "./assets/sic_universe_station_preview.png",
        alt: "Senaletica de Platform 3",
        caption: "La senal funciona como nodo de transito dentro del recorrido."
    },
    "poster-ambiguity": {
        src: "./assets/sic_phase_iv_ambiguity.png",
        alt: "Poster Ambiguity",
        caption: "Fase IV fijada como pieza editorial dentro del anden."
    },
    "poster-mss-white": {
        src: "./assets/sic_album_mss_white_universe.png",
        alt: "Poster MSS WHITE",
        caption: "Portada utilizada como objeto fisico y punto de memoria."
    },
    "poster-desde-sol": {
        src: "./assets/sic_album_desde_sol.png",
        alt: "Poster Desde el sol",
        caption: "Portada solar desplegada en el piso del campo."
    },
    "poster-al-reves": {
        src: "./assets/sic_album_al_reves.png",
        alt: "Poster Al reves",
        caption: "Archivo de origen montado sobre la arquitectura del tren."
    },
    "poster-map": {
        src: "./assets/sic_universe_map.png",
        alt: "Mapa del universo SIC",
        caption: "Mapa conceptual para leer relaciones, fases y simbolos."
    },
    "cassette-mss-white": {
        src: "./assets/sic_album_mss_white_universe.png",
        alt: "Cassette MSS WHITE",
        caption: "Etiqueta del cassette usada como huella tangible del archivo."
    },
    "cassette-al-reves": {
        src: "./assets/sic_album_al_reves.png",
        alt: "Cassette Al reves",
        caption: "Cinta de origen integrada al recorrido como pieza interactiva."
    },
    "cassette-desde-sol": {
        src: "./assets/sic_album_desde_sol.png",
        alt: "Cassette Desde el sol",
        caption: "Soporte de transito luminoso dentro de la estacion."
    },
    "cassette-ambiguity": {
        src: "./assets/sic_phase_iv_ambiguity.png",
        alt: "Cassette Ambiguity",
        caption: "Nueva fase materializada a ras de piso."
    },
    cards: {
        src: "./assets/sic_symbol_daniel.png",
        alt: "Tarjetas SIC",
        caption: "Tarjetas de campo usadas como interfaz editorial y simbolo."
    },
    "crystal-fortress": {
        src: "./assets/sic_universe_station_preview.png",
        alt: "Fortaleza de cristal",
        caption: "Agujas de cristal emergen del centro del anden, frecuencias congeladas del universo [SIC]."
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
const hotspotCounter = doc.getElementById("hotspot-counter");
const inspectTitle = doc.getElementById("inspect-title");
const inspectImage = doc.getElementById("inspect-image");
const inspectCaption = doc.getElementById("inspect-caption");
const inspectCopy = doc.getElementById("inspect-copy");
const inspectType = doc.getElementById("inspect-type");
const inspectPhase = doc.getElementById("inspect-phase");
const inspectTypePill = doc.getElementById("inspect-type-pill");
const inspectPhasePill = doc.getElementById("inspect-phase-pill");
const inspectModePill = doc.getElementById("inspect-mode-pill");
const inspectIndex = doc.getElementById("inspect-index");
const inspectTotal = doc.getElementById("inspect-total");
const dockIndex = doc.getElementById("dock-index");
const dockTitle = doc.getElementById("dock-title");
const dockCopy = doc.getElementById("dock-copy");
const commandDock = doc.getElementById("command-dock");
const reticle = doc.getElementById("reticle");
const reticleHint = doc.getElementById("reticle-hint");
const movePad = doc.getElementById("move-pad");
const moveKnob = doc.getElementById("move-knob");
const mobileInspect = doc.getElementById("mobile-inspect");

const modeButtons = Array.from(doc.querySelectorAll("[data-mode]"));
const resetViewButton = doc.getElementById("reset-view");
const focusHotspotButton = doc.getElementById("focus-hotspot");
const enterExploreButton = doc.getElementById("enter-explore");
const prevHotspotButton = doc.getElementById("prev-hotspot");
const nextHotspotButton = doc.getElementById("next-hotspot");
const dockPrevButton = doc.getElementById("dock-prev");
const dockNextButton = doc.getElementById("dock-next");
const dockFocusButton = doc.getElementById("dock-focus");
const tourHotspotsButton = doc.getElementById("tour-hotspots");
const toggleGuideButton = doc.getElementById("toggle-guide");
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
    powerPreference: "high-performance",
    preserveDrawingBuffer: true
});
const outlineEffect = new OutlineEffect(renderer, {
    defaultThickness: 0.0036,
    defaultColor: [0.07, 0.05, 0.06],
    defaultAlpha: 0.88,
    defaultKeepAlive: true
});

// Post-processing: bloom para cristales y emisiones
const composer = new EffectComposer(renderer);
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(win.innerWidth, win.innerHeight),
    0.35,   // strength — sutil, solo cristales y emisiones
    0.5,    // radius
    0.92    // threshold — alto para que solo lo más brillante haga bloom
);

const toonGradientMap = createToonGradientMap();
const surfaceTextures = createSurfaceTextures();
const textureSlots = ["map", "normalMap", "roughnessMap", "metalnessMap", "aoMap", "emissiveMap", "alphaMap"];

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.82;
renderer.setClearColor(0x090809, 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x090809, isCoarsePointer ? 0.026 : 0.022);

const camera = new THREE.PerspectiveCamera(20, 1, 0.1, 120);
camera.position.set(0, 5, 14);

// Inicializar composer con bloom
composer.addPass(new RenderPass(scene, camera));
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

const timer = new THREE.Timer();
const loader = new GLTFLoader();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const poseCamera = new THREE.PerspectiveCamera();
const tempQuat = new THREE.Quaternion();
const drawBufferSize = new THREE.Vector2();
const accentColor = new THREE.Color(0xff6077);
const hoverColor = new THREE.Color(0xffd1d8);
const renderPoseTarget = new THREE.Vector3(1.7, 0.9, -0.86);
const crystalPoseTarget = new THREE.Vector3(1.36, 1.88, -3.08);
const sceneBoundsIgnorePrefixes = ["VoidBase", "CityStrip_"];

const world = new THREE.Group();
const atmosphereGroup = new THREE.Group();
scene.add(world);
scene.add(atmosphereGroup);

const hoverLight = new THREE.PointLight(0xd4434c, 1.15, 12, 2);
hoverLight.position.set(0, 3.5, 0);
scene.add(hoverLight);

scene.add(new THREE.HemisphereLight(0xfff4ea, 0x0a0608, 0.45));

// KeyLight — matches Blender AREA 5000W at (-4.6,-3.9,8.2) [BL] → (-4.6,8.2,3.9) [Three]
const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
keyLight.position.set(-4.6, 8.2, 3.9);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(isCoarsePointer ? 1024 : 2048, isCoarsePointer ? 1024 : 2048);
keyLight.shadow.camera.near = 0.5;
keyLight.shadow.camera.far = 60;
keyLight.shadow.camera.left = -16;
keyLight.shadow.camera.right = 16;
keyLight.shadow.camera.top = 16;
keyLight.shadow.camera.bottom = -16;
scene.add(keyLight);

// FillLight — matches Blender AREA 1500W at (6.7,2.6,5.0) [BL] → (6.7,5.0,-2.6) [Three]
const fillLight = new THREE.DirectionalLight(0xffffff, 0.7);
fillLight.position.set(6.7, 5.0, -2.6);
scene.add(fillLight);

// RimLight — matches Blender SUN 1.8W rot(44°,-2°,132°), lights from rear-left
const rimLight = new THREE.DirectionalLight(0xe8f0ff, 0.32);
rimLight.position.set(-6, 9, -8);
scene.add(rimLight);

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
        opacity: 0.46
    })
);
beacon.add(beaconRing);
beacon.add(beaconLine);
beacon.visible = false;
beacon.userData.baseY = 0;
scene.add(beacon);

const runtime = {
    mode: "frame",
    guideCollapsed: isCoarsePointer,
    modelRoot: null,
    modelAnchor: new THREE.Vector3(),
    sceneBox: new THREE.Box3(),
    sceneSize: new THREE.Vector3(12, 6, 12),
    sceneCenter: new THREE.Vector3(),
    walkBounds: {
        minX: -6,
        maxX: 6,
        minZ: -5,
        maxZ: 5
    },
    activeHotspotId: HOTSPOT_ORDER[0],
    focusHotspotId: HOTSPOT_ORDER[0],
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
        position: new THREE.Vector3(-9.35, 5.10, 7.32),
        quaternion: new THREE.Quaternion(),
        fov: 20
    },
    referencePose2: {
        position: new THREE.Vector3(0.20, 5.90, 7.80),
        quaternion: new THREE.Quaternion(),
        fov: 22
    },
    referenceOffsetDirection: new THREE.Vector3(-0.68, 0.45, 0.57).normalize(),
    atmosphereSprites: [],
    crystalFortress: null,
    dustParticles: null,
    tour: {
        active: false,
        nextAdvanceAt: 0,
        duration: 4.8
    },
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
setGuideCollapsed(runtime.guideCollapsed);
setTourActive(false);
setHudHidden(false);
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
        setTourActive(false);
        if (runtime.mode === "explore") {
            resetExplorePose(true);
            return;
        }
        const poseIndex = runtime.mode === "frame2" ? 1 : 0;
        applyReferencePose(true, poseIndex);
    });

    focusHotspotButton?.addEventListener("click", () => {
        setTourActive(false);
        focusHotspot(runtime.activeHotspotId, true);
    });

    enterExploreButton?.addEventListener("click", () => {
        setTourActive(false);
        enterExploreFromHotspot(runtime.activeHotspotId);
    });

    prevHotspotButton?.addEventListener("click", () => {
        setTourActive(false);
        focusRelativeHotspot(-1);
    });

    nextHotspotButton?.addEventListener("click", () => {
        setTourActive(false);
        focusRelativeHotspot(1);
    });

    dockPrevButton?.addEventListener("click", () => {
        setTourActive(false);
        focusRelativeHotspot(-1);
    });

    dockNextButton?.addEventListener("click", () => {
        setTourActive(false);
        focusRelativeHotspot(1);
    });

    dockFocusButton?.addEventListener("click", () => {
        setTourActive(false);
        focusHotspot(runtime.activeHotspotId, true);
    });

    tourHotspotsButton?.addEventListener("click", () => {
        setTourActive(!runtime.tour.active);
    });

    toggleGuideButton?.addEventListener("click", () => {
        setGuideCollapsed(!runtime.guideCollapsed);
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
            setTourActive(false);
            setActiveHotspot(targetId);
            focusHotspot(targetId, true);
            if (isCoarsePointer) {
                setGuideCollapsed(true);
            }
        }
    });

    canvas.addEventListener("pointerdown", onCanvasPointerDown);
    canvas.addEventListener("pointermove", onCanvasPointerMove);
    canvas.addEventListener("pointerup", onCanvasPointerUp);
    canvas.addEventListener("pointerleave", onCanvasPointerUp);
    canvas.addEventListener("pointercancel", onCanvasPointerUp);

    doc.addEventListener("keydown", onKeyDown);
    doc.addEventListener("keyup", onKeyUp);
    doc.addEventListener("visibilitychange", () => {
        if (doc.hidden) {
            setTourActive(false);
        }
    });

    movePad?.addEventListener("pointerdown", onMovePadDown);
    movePad?.addEventListener("pointermove", onMovePadMove);
    movePad?.addEventListener("pointerup", onMovePadUp);
    movePad?.addEventListener("pointercancel", onMovePadUp);

    bindDockSwipe();
}

function setGuideCollapsed(collapsed) {
    runtime.guideCollapsed = collapsed;
    doc.body.classList.toggle("guide-collapsed", collapsed);
    if (toggleGuideButton) {
        toggleGuideButton.textContent = collapsed ? "Mostrar guia" : "Ocultar guia";
    }
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

function setTourActive(active) {
    runtime.tour.active = active;
    runtime.tour.nextAdvanceAt = timer.getElapsed() + runtime.tour.duration;

    if (tourHotspotsButton) {
        tourHotspotsButton.textContent = active ? "Detener tour" : "Iniciar tour";
        tourHotspotsButton.classList.toggle("is-active", active);
    }

    if (active) {
        if (runtime.mode === "explore") {
            setMode("frame", false);
        }
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
            setTourActive(false);
            setActiveHotspot(hotspot.id);
            setMode("frame", false);
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
            setTourActive(false);
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
        22, 22, 22, 255,
        48, 48, 48, 255,
        82, 82, 82, 255,
        118, 118, 118, 255,
        152, 152, 152, 255,
        184, 184, 184, 255,
        214, 214, 214, 255,
        244, 244, 244, 255,
    ]);
    const texture = new THREE.DataTexture(colors, 8, 1, THREE.RGBAFormat);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    return texture;
}

function createSurfaceTextures() {
    return {
        paper: makeCanvasTexture(256, 7, 7, (ctx, size) => {
            ctx.fillStyle = "#f3ede4";
            ctx.fillRect(0, 0, size, size);
            ctx.strokeStyle = "rgba(70, 54, 50, 0.14)";
            ctx.lineWidth = 2;
            for (let y = 20; y < size + 20; y += 28) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.bezierCurveTo(size * 0.2, y - 9, size * 0.74, y + 8, size, y - 3);
                ctx.stroke();
            }
            for (let i = 0; i < 180; i += 1) {
                ctx.fillStyle = `rgba(120, 96, 88, ${0.04 + (i % 5) * 0.01})`;
                ctx.fillRect((i * 17) % size, (i * 37) % size, 2, 2);
            }
        }),
        panel: makeCanvasTexture(256, 3.2, 2.6, (ctx, size) => {
            ctx.fillStyle = "#dfd3c5";
            ctx.fillRect(0, 0, size, size);
            ctx.strokeStyle = "rgba(24, 17, 18, 0.12)";
            ctx.lineWidth = 6;
            for (let x = -size; x < size * 2; x += 34) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x + size, size);
                ctx.stroke();
            }
            ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
            ctx.lineWidth = 2;
            for (let y = 18; y < size; y += 52) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(size, y);
                ctx.stroke();
            }
            ctx.fillStyle = "rgba(24, 17, 18, 0.08)";
            for (let i = 0; i < 90; i += 1) {
                ctx.fillRect((i * 29) % size, (i * 53) % size, 3, 3);
            }
        }),
        halftone: makeCanvasTexture(256, 4.5, 4.5, (ctx, size) => {
            ctx.fillStyle = "#efe5de";
            ctx.fillRect(0, 0, size, size);
            ctx.fillStyle = "rgba(80, 16, 24, 0.18)";
            for (let y = 14; y < size; y += 22) {
                for (let x = 14; x < size; x += 22) {
                    const radius = 2 + ((x + y) % 3);
                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
            ctx.lineWidth = 1;
            ctx.strokeRect(4, 4, size - 8, size - 8);
        }),
        organic: makeCanvasTexture(256, 3.8, 3.8, (ctx, size) => {
            ctx.fillStyle = "#f2e9dc";
            ctx.fillRect(0, 0, size, size);
            ctx.strokeStyle = "rgba(40, 24, 28, 0.12)";
            ctx.lineWidth = 3;
            for (let i = 0; i < 22; i += 1) {
                const startX = (i * 41) % size;
                const startY = (i * 67) % size;
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.bezierCurveTo(startX + 18, startY - 12, startX + 34, startY + 14, startX + 58, startY + 2);
                ctx.stroke();
            }
            ctx.fillStyle = "rgba(30, 20, 20, 0.05)";
            for (let i = 0; i < 140; i += 1) {
                ctx.fillRect((i * 19) % size, (i * 71) % size, 2, 2);
            }
        }),
        glow: makeRadialTexture(),
    };
}

function makeCanvasTexture(size, repeatX, repeatY, painter) {
    const textureCanvas = doc.createElement("canvas");
    textureCanvas.width = size;
    textureCanvas.height = size;
    const ctx = textureCanvas.getContext("2d");
    painter(ctx, size);
    const texture = new THREE.CanvasTexture(textureCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
    texture.needsUpdate = true;
    return texture;
}

function makeRadialTexture() {
    const textureCanvas = doc.createElement("canvas");
    textureCanvas.width = 256;
    textureCanvas.height = 256;
    const ctx = textureCanvas.getContext("2d");
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.22, "rgba(255,255,255,0.78)");
    gradient.addColorStop(0.58, "rgba(255,255,255,0.18)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    const texture = new THREE.CanvasTexture(textureCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
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
        buildAtmosphere(runtime.modelRoot);
        captureReferencePose(gltf);
        applyReferencePose(true);
        resetExplorePose(false);
        setActiveHotspot(HOTSPOT_ORDER[0]);

        let nodeCount = 0;
        runtime.modelRoot.traverse(() => {
            nodeCount += 1;
        });

        if (sceneStatus) {
            sceneStatus.textContent = `modelo listo / ${nodeCount} nodos`;
        }
        if (loadingCopy) {
            loadingCopy.textContent = "Modelo cargado. Puedes abrir objetos del lore, iniciar el tour o entrar en modo recorrido.";
        }
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
            loadingCopy.textContent = error?.message || "Fallo la inicializacion del universo 3D.";
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
    runtime.modelAnchor.copy(anchor);
    root.position.sub(anchor);
    root.updateMatrixWorld(true);

    runtime.sceneBox.copy(computeFocusBounds(root));
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

function computeFocusBounds(root) {
    const focusBox = new THREE.Box3();
    const meshBox = new THREE.Box3();
    let hasContent = false;

    root.traverse((node) => {
        if (!node?.isMesh) {
            return;
        }

        if (sceneBoundsIgnorePrefixes.some((prefix) => node.name?.startsWith(prefix))) {
            return;
        }

        meshBox.setFromObject(node);
        if (meshBox.isEmpty()) {
            return;
        }

        if (!hasContent) {
            focusBox.copy(meshBox);
            hasContent = true;
            return;
        }

        focusBox.union(meshBox);
    });

    return hasContent ? focusBox : new THREE.Box3().setFromObject(root);
}

function buildAtmosphere(root) {
    runtime.atmosphereSprites.forEach((sprite) => {
        sprite.material.dispose?.();
    });
    runtime.atmosphereSprites = [];
    atmosphereGroup.clear();

    const glowTexture = surfaceTextures.glow;
    const crystal = root.getObjectByName("Crystal_Base");
    const frontCar = root.getObjectByName("FrontCar");
    const portal = root.getObjectByName("Portal_Board");

    // Lamp post warm point lights — match Blender 5× point 650W #fff4ea
    const lampNames = ["LampPost_01", "LampPost_02", "LampPost_03", "LampPost_04", "LampPost_05",
                       "Lamp_Post_1", "Lamp_Post_2", "Lamp_Post_3", "Lamp_Post_4", "Lamp_Post_5"];
    const seenLamps = new Set();
    root.traverse((node) => {
        const matchedName = lampNames.find((n) => node.name === n || node.name.startsWith(n));
        if (matchedName && !seenLamps.has(matchedName)) {
            seenLamps.add(matchedName);
            const lampPos = node.getWorldPosition(new THREE.Vector3());
            const lampLight = new THREE.PointLight(0xfff4ea, 1.4, 14, 2);
            lampLight.position.set(lampPos.x, lampPos.y + 2.2, lampPos.z);
            atmosphereGroup.add(lampLight);
        }
    });

    if (crystal) {
        const crystalPos = crystal.getWorldPosition(new THREE.Vector3());

        // Fortaleza de la Soledad — cluster de cristales procedurales
        const fortressBase = crystalPos.clone();
        fortressBase.y = 0;
        runtime.crystalFortress = buildCrystalFortress(fortressBase, atmosphereGroup);

        // Glow sprite central
        const sprite = createGlowSprite(glowTexture, 0x88bbff, 0.32, new THREE.Vector3(10, 10, 1));
        sprite.position.copy(crystalPos);
        sprite.position.y += 3.5;
        atmosphereGroup.add(sprite);
        runtime.atmosphereSprites.push(sprite);

        // Segundo glow más concentrado
        const innerGlow = createGlowSprite(glowTexture, 0xffffff, 0.16, new THREE.Vector3(4, 6, 1));
        innerGlow.position.copy(crystalPos);
        innerGlow.position.y += 2.2;
        atmosphereGroup.add(innerGlow);
        runtime.atmosphereSprites.push(innerGlow);
    }

    // Partículas de polvo brillante
    runtime.dustParticles = buildDustParticles(
        isCoarsePointer ? 220 : 500,
        runtime.sceneBox,
        atmosphereGroup
    );

    if (frontCar) {
        const sprite = createGlowSprite(glowTexture, 0xff9d86, 0.12, new THREE.Vector3(9.6, 5.4, 1));
        sprite.position.copy(frontCar.getWorldPosition(new THREE.Vector3()));
        sprite.position.y += 0.9;
        atmosphereGroup.add(sprite);
        runtime.atmosphereSprites.push(sprite);
    }

    if (portal) {
        const sprite = createGlowSprite(glowTexture, 0xffffff, 0.08, new THREE.Vector3(5.8, 4.8, 1));
        sprite.position.copy(portal.getWorldPosition(new THREE.Vector3()));
        sprite.position.y += 1.2;
        atmosphereGroup.add(sprite);
        runtime.atmosphereSprites.push(sprite);
    }

    for (let index = 0; index < 7; index += 1) {
        const sprite = createGlowSprite(glowTexture, index % 2 === 0 ? 0xff6477 : 0xfff0e3, 0.04, new THREE.Vector3(1.5, 1.5, 1));
        sprite.position.set(
            runtime.sceneBox.min.x + 1.5 + (index * 1.7) % Math.max(runtime.sceneSize.x - 3, 1),
            1.2 + (index % 3) * 0.5,
            runtime.sceneBox.min.z + 1.2 + (index * 2.1) % Math.max(runtime.sceneSize.z - 2.4, 1)
        );
        sprite.userData.floatPhase = index * 0.7;
        atmosphereGroup.add(sprite);
        runtime.atmosphereSprites.push(sprite);
    }
}

function createGlowSprite(map, color, opacity, scale) {
    const material = new THREE.SpriteMaterial({
        map,
        color,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.copy(scale);
    return sprite;
}

// Genera una aguja de cristal individual (geometría procedural hexagonal)
function createCrystalShard(height, radius, color, emissiveColor, emissiveIntensity) {
    const sides = 6;
    const geo = new THREE.ConeGeometry(radius, height, sides, 1, false);
    // Estirar asimetría para aspecto natural
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        if (y > height * 0.35) {
            pos.setX(i, pos.getX(i) * 0.55);
            pos.setZ(i, pos.getZ(i) * 0.55);
        }
    }
    geo.computeVertexNormals();

    const mat = new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.04,
        metalness: 0.02,
        transmission: 0.68,
        thickness: 1.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.03,
        emissive: emissiveColor,
        emissiveIntensity,
        transparent: true,
        opacity: 0.82,
        depthWrite: false,
        side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

// Genera el cluster de cristales tipo "Fortaleza de la Soledad" alrededor de un punto
function buildCrystalFortress(basePosition, parentGroup) {
    const crystalGroup = new THREE.Group();
    crystalGroup.position.copy(basePosition);
    crystalGroup.userData.isCrystalFortress = true;

    // Paleta de cristales — tonos hielo/blanco/rojo-profundo
    const palettes = [
        { color: 0xe8f0ff, emissive: 0x8ab4ff, intensity: 0.35 }, // hielo azulado
        { color: 0xf7f4f9, emissive: 0xb8d4ff, intensity: 0.28 }, // blanco cristal
        { color: 0xd0d8f0, emissive: 0x6e9fff, intensity: 0.32 }, // steel-ice
        { color: 0xfff0f3, emissive: 0xff4466, intensity: 0.22 }, // cristal rosado [SIC]
        { color: 0x561419, emissive: 0xff2244, intensity: 0.40 }, // rojo profundo
    ];

    // Aguja central — la más alta y visible
    const mainShard = createCrystalShard(4.8, 0.42, 0xe8f0ff, 0x88bbff, 0.38);
    mainShard.position.set(0, 2.4, 0);
    mainShard.rotation.set(0.05, 0, -0.04);
    crystalGroup.add(mainShard);

    // Agujas satélite: configuración explícita para aspecto dramático
    const shards = [
        { h: 3.6, r: 0.34, x: 0.8, z: 0.4, tiltX: 0.15, tiltZ: -0.22, p: 0 },
        { h: 3.2, r: 0.30, x: -0.6, z: 0.7, tiltX: -0.12, tiltZ: 0.18, p: 1 },
        { h: 2.8, r: 0.26, x: 0.3, z: -0.9, tiltX: 0.20, tiltZ: 0.10, p: 2 },
        { h: 2.4, r: 0.22, x: -1.1, z: -0.3, tiltX: -0.18, tiltZ: -0.14, p: 3 },
        { h: 2.0, r: 0.20, x: 1.2, z: -0.5, tiltX: 0.10, tiltZ: 0.25, p: 4 },
        { h: 3.0, r: 0.28, x: -0.2, z: -1.2, tiltX: -0.08, tiltZ: -0.20, p: 0 },
        { h: 1.8, r: 0.18, x: 0.9, z: 1.0, tiltX: 0.22, tiltZ: -0.08, p: 1 },
        { h: 2.6, r: 0.24, x: -1.3, z: 0.5, tiltX: -0.14, tiltZ: 0.12, p: 2 },
        { h: 1.5, r: 0.16, x: 0.5, z: 1.3, tiltX: 0.08, tiltZ: 0.30, p: 3 },
        { h: 1.2, r: 0.14, x: -0.8, z: -1.1, tiltX: -0.25, tiltZ: -0.05, p: 4 },
        { h: 3.4, r: 0.32, x: 0.0, z: 1.1, tiltX: 0.04, tiltZ: -0.16, p: 0 },
        { h: 1.6, r: 0.15, x: 1.4, z: 0.1, tiltX: 0.18, tiltZ: 0.14, p: 1 },
    ];

    shards.forEach((cfg) => {
        const pal = palettes[cfg.p];
        const shard = createCrystalShard(cfg.h, cfg.r, pal.color, pal.emissive, pal.intensity);
        shard.position.set(cfg.x, cfg.h * 0.5, cfg.z);
        shard.rotation.set(cfg.tiltX, Math.random() * Math.PI * 2, cfg.tiltZ);
        crystalGroup.add(shard);
    });

    // Luces internas del cluster
    const innerLight1 = new THREE.PointLight(0x88bbff, 2.4, 12, 2);
    innerLight1.position.set(0, 3.5, 0);
    innerLight1.userData.baseIntensity = 2.4;
    crystalGroup.add(innerLight1);

    const innerLight2 = new THREE.PointLight(0xff4466, 0.8, 8, 2);
    innerLight2.position.set(0.5, 1.5, -0.5);
    innerLight2.userData.baseIntensity = 0.8;
    crystalGroup.add(innerLight2);

    parentGroup.add(crystalGroup);
    return crystalGroup;
}

// Partículas flotantes — polvo brillante alrededor de los cristales
function buildDustParticles(count, bounds, parentGroup) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        positions[i * 3] = bounds.min.x + Math.random() * (bounds.max.x - bounds.min.x);
        positions[i * 3 + 1] = Math.random() * 5.5;
        positions[i * 3 + 2] = bounds.min.z + Math.random() * (bounds.max.z - bounds.min.z);
        sizes[i] = 0.02 + Math.random() * 0.06;
        phases[i] = Math.random() * Math.PI * 2;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("phase", new THREE.BufferAttribute(phases, 1));

    const material = new THREE.PointsMaterial({
        color: 0xd0e4ff,
        size: 0.05,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    points.userData.isDustParticles = true;
    parentGroup.add(points);
    return points;
}

// Blender-exact material overrides por nombre de objeto
// Valores: Charcoal=#0c0c0d r=0.42 m=0.18 | Cream=#f6f2ee r=0.90 | Crimson=#c1564c r=0.48 m=0.02
// Graphite=#1c1a1c r=0.46 m=0.12 | GlassRed=#561419 r=0.08 emit=0.24
function getNameBasedOverride(name) {
    // Tren — cuerpo Charcoal + trim Crimson
    if (name.startsWith("FrontCar") || name.startsWith("BackCar") || name.startsWith("TrainCar") ||
        name.startsWith("Train_Body") || name.startsWith("Train_Roof") || name.startsWith("Train_Floor") ||
        name.startsWith("Train_Frame") || name.startsWith("Track_")) {
        return { color: 0x0c0c0d, roughness: 0.42, metalness: 0.18 };
    }
    if (name.includes("_Trim") || name.includes("_Accent") || name.includes("_Strip") ||
        name.startsWith("Train_Door") || name.startsWith("FloorLine")) {
        return { color: 0xc1564c, roughness: 0.48, metalness: 0.02 };
    }
    // Suelo y plataforma — Cream mate
    if (name.startsWith("Ground") || name.startsWith("Back_Platform") || name.startsWith("Right_Service_Pad")) {
        return { color: 0xf6f2ee, roughness: 0.90, metalness: 0.0 };
    }
    // Mobiliario de andén — Graphite
    if (name.startsWith("Bench_") || name.startsWith("Table_") || name.startsWith("Pillar_") ||
        name.startsWith("LampPost") || name.startsWith("Lamp_Post")) {
        return { color: 0x1c1a1c, roughness: 0.46, metalness: 0.12 };
    }
    // Árboles — Crimson orgánico
    if (name.startsWith("Tree_")) {
        return { color: 0xc1564c, roughness: 0.88, metalness: 0.0 };
    }
    return null;
}

function createStylizedMaterial(material, object) {
    const baseColor = material?.color?.clone?.() || new THREE.Color(0xffffff);
    const emissive = material?.emissive?.clone?.() || new THREE.Color(0x000000);
    const transparent = Boolean(material?.transparent);
    const opacity = material?.opacity ?? 1;
    const alphaTest = material?.alphaTest ?? 0;
    const originalMap = material?.map || null;
    const normalMap = material?.normalMap || null;
    const roughnessMap = material?.roughnessMap || null;
    const metalnessMap = material?.metalnessMap || null;
    const aoMap = material?.aoMap || null;
    const emissiveMap = material?.emissiveMap || null;
    const alphaMap = material?.alphaMap || null;

    // Cassettes con textura y paneles de señal con textura → MeshBasicMaterial (igual que posters)
    const isCassetteWithMap = object.name.startsWith("Cassette_") && Boolean(originalMap);
    const isSignPanel = (object.name.startsWith("Portal_") || object.name.startsWith("Platform_Sign") ||
                         object.name.startsWith("Sign_")) && Boolean(originalMap);
    const isGraphic = object.name.startsWith("Poster_") || object.name.includes("_label") ||
        object.name.includes("_art") || object.name.startsWith("CardStack_") ||
        isCassetteWithMap || isSignPanel;

    const side = (object.name.startsWith("Poster_") || object.name.includes("_label") || object.name.includes("_art"))
        ? THREE.DoubleSide
        : material?.side ?? THREE.FrontSide;

    const isGlass = transparent || object.name.includes("Glass") || object.name.startsWith("Crystal_");
    const hasSurfaceMaps = Boolean(originalMap || normalMap || roughnessMap || metalnessMap || aoMap || emissiveMap || alphaMap);

    // Overrides PBR por nombre (no aplica a gráficos ni vidrio)
    const nameOv = (!isGraphic && !isGlass) ? getNameBasedOverride(object.name) : null;
    const effectiveColor = nameOv?.color !== undefined ? new THREE.Color(nameOv.color) : baseColor;
    const effectiveRoughness = nameOv?.roughness ?? material?.roughness ?? 0.72;
    const effectiveMetalness = nameOv?.metalness ?? material?.metalness ?? 0.08;

    const proceduralMap = !isGraphic && !isGlass && !originalMap ? pickProceduralTexture(object, effectiveColor) : null;

    if (isGraphic) {
        return rememberMaterialState(new THREE.MeshBasicMaterial({
            color: originalMap ? new THREE.Color(0xffffff) : baseColor,
            map: originalMap,
            alphaMap,
            transparent,
            opacity,
            alphaTest: alphaTest || 0.05,
            side,
        }));
    }

    if (isGlass) {
        const glassRoughness = material?.roughness ?? (roughnessMap ? 0.08 : 0.05);
        const isCrystal = object.name.startsWith("Crystal_");
        return rememberMaterialState(new THREE.MeshPhysicalMaterial({
            color: originalMap ? new THREE.Color(0xffffff) : baseColor,
            map: originalMap,
            normalMap,
            roughnessMap,
            alphaMap,
            transparent: true,
            opacity: Math.min(opacity, 0.88),
            roughness: glassRoughness,
            metalness: 0.04,
            transmission: isCrystal ? 0.72 : 0.34,
            thickness: 0.58,
            clearcoat: 0.96,
            clearcoatRoughness: glassRoughness * 0.5,
            emissive: (emissive.r + emissive.g + emissive.b) > 0.03 ? emissive : baseColor.clone().multiplyScalar(0.18),
            emissiveIntensity: isCrystal ? 0.20 : 0.24,
            side,
            depthWrite: false,
        }));
    }

    if (hasSurfaceMaps) {
        return rememberMaterialState(new THREE.MeshStandardMaterial({
            color: originalMap ? new THREE.Color(0xffffff) : effectiveColor,
            map: originalMap || proceduralMap,
            normalMap,
            roughnessMap,
            metalnessMap,
            aoMap,
            emissive,
            emissiveMap,
            emissiveIntensity: material?.emissiveIntensity ?? 0,
            alphaMap,
            transparent,
            opacity,
            alphaTest,
            roughness: effectiveRoughness,
            metalness: effectiveMetalness,
            side,
        }));
    }

    return rememberMaterialState(new THREE.MeshStandardMaterial({
        color: effectiveColor,
        map: proceduralMap,
        transparent,
        opacity,
        emissive,
        emissiveIntensity: material?.emissiveIntensity ?? 0,
        roughness: effectiveRoughness,
        metalness: effectiveMetalness,
        side,
    }));
}

function rememberMaterialState(material) {
    material.userData.baseColor = material.color?.clone?.() || null;
    material.userData.baseEmissive = material.emissive?.clone?.() || null;
    material.userData.baseEmissiveIntensity = material.emissiveIntensity ?? 0;
    return material;
}

function setMaterialTextureAnisotropy(material, anisotropy) {
    textureSlots.forEach((slot) => {
        const texture = material?.[slot];
        if (texture) {
            texture.anisotropy = anisotropy;
        }
    });
}

function bindDockSwipe() {
    if (!commandDock || !isCoarsePointer) {
        return;
    }

    const touchState = {
        active: false,
        startX: 0,
        startY: 0,
    };

    commandDock.addEventListener("pointerdown", (event) => {
        if (event.pointerType !== "touch") {
            return;
        }
        touchState.active = true;
        touchState.startX = event.clientX;
        touchState.startY = event.clientY;
    });

    commandDock.addEventListener("pointerup", (event) => {
        if (!touchState.active || event.pointerType !== "touch") {
            return;
        }

        const deltaX = event.clientX - touchState.startX;
        const deltaY = event.clientY - touchState.startY;
        touchState.active = false;

        if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) {
            return;
        }

        setTourActive(false);
        focusRelativeHotspot(deltaX < 0 ? 1 : -1);
    });

    commandDock.addEventListener("pointercancel", () => {
        touchState.active = false;
    });
}

function pickProceduralTexture(object, baseColor) {
    const name = object.name;
    const isRedDominant = baseColor.r > baseColor.g * 1.22 && baseColor.r > baseColor.b * 1.12;

    if (
        name.startsWith("Ground") ||
        name.startsWith("Platform") ||
        name.startsWith("Back_Platform") ||
        name.startsWith("Right_Service_Pad") ||
        name.startsWith("FloorLine")
    ) {
        return surfaceTextures.paper;
    }

    if (name.startsWith("Tree_")) {
        return surfaceTextures.organic;
    }

    if (isRedDominant) {
        return surfaceTextures.halftone;
    }

    return surfaceTextures.panel;
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

            setMaterialTextureAnisotropy(material, anisotropy);

            if (!object.name.startsWith("Poster_") && !object.name.includes("_label") && !object.name.includes("_art")) {
                object.geometry.computeVertexNormals();
            }

            const nextMaterial = createStylizedMaterial(material, object);
            setMaterialTextureAnisotropy(nextMaterial, anisotropy);

            nextMaterial.needsUpdate = true;
            nextMaterial.userData.outlineParameters = {
                thickness: object.name.startsWith("Poster_")
                    ? 0.0013
                    : object.name.includes("Crystal_")
                        ? 0.0018
                        : 0.0029,
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
    const sx = runtime.sceneSize.x;
    const sy = runtime.sceneSize.y;
    const sz = runtime.sceneSize.z;
    let cameraNode = gltf.scene?.getObjectByName("SceneCamera") || runtime.modelRoot?.getObjectByName("SceneCamera");
    if (!cameraNode && Array.isArray(gltf.cameras) && gltf.cameras.length) {
        cameraNode = gltf.cameras[0];
    }

    if (cameraNode && cameraNode.isCamera) {
        const cameraPosition = cameraNode.getWorldPosition(new THREE.Vector3());
        runtime.referencePose.position.copy(cameraPosition);
        runtime.referencePose.quaternion.copy(quaternionFromLookAt(cameraPosition, renderPoseTarget));
        runtime.referencePose.fov = cameraNode.fov || 20;
    } else {
        const t1 = renderPoseTarget.clone();
        const p1 = t1.clone().add(new THREE.Vector3(-sx * 0.42, sy * 2.8, sz * 0.66));
        runtime.referencePose.position.copy(p1);
        runtime.referencePose.quaternion.copy(quaternionFromLookAt(p1, t1));
        runtime.referencePose.fov = 20;
    }

    const crystalObject = runtime.modelRoot?.getObjectByName("Crystal_0") || runtime.modelRoot?.getObjectByName("Crystal_Base");
    const t2 = crystalObject
        ? new THREE.Box3().setFromObject(crystalObject).getCenter(new THREE.Vector3()).setY(crystalPoseTarget.y)
        : crystalPoseTarget.clone();
    const p2 = t2.clone().add(new THREE.Vector3(sx * 0.12, sy * 2.55, sz * 0.54));
    runtime.referencePose2.position.copy(p2);
    runtime.referencePose2.quaternion.copy(quaternionFromLookAt(p2, t2));
    runtime.referencePose2.fov = 22;

    const baseDirection = runtime.referencePose.position.clone().sub(renderPoseTarget);
    if (baseDirection.lengthSq() > 0) {
        runtime.referenceOffsetDirection.copy(baseDirection.normalize());
    }
}

function applyReferencePose(instant, poseIndex) {
    const pose = poseIndex === 1 ? runtime.referencePose2 : runtime.referencePose;
    runtime.focusHotspotId = HOTSPOT_ORDER[0];
    runtime.targetPose.position.copy(pose.position);
    runtime.targetPose.quaternion.copy(pose.quaternion);
    runtime.targetPose.fov = pose.fov;

    if (instant) {
        camera.position.copy(runtime.targetPose.position);
        camera.quaternion.copy(runtime.targetPose.quaternion);
        camera.fov = runtime.targetPose.fov;
        camera.updateProjectionMatrix();
    }

    setActiveHotspot(HOTSPOT_ORDER[0]);
}

function setMode(mode, fromUser) {
    if (mode === "explore") {
        runtime.mode = "explore";
    } else if (mode === "frame2") {
        runtime.mode = "frame2";
    } else {
        runtime.mode = "frame";
    }

    modeButtons.forEach((button) => {
        button.classList.toggle("is-active", button.dataset.mode === runtime.mode);
    });

    if (inspectModePill) {
        if (runtime.mode === "explore") {
            inspectModePill.textContent = "Explore";
        } else if (runtime.mode === "frame2") {
            inspectModePill.textContent = "Frame / UV2";
        } else {
            inspectModePill.textContent = "Frame / UV1";
        }
    }

    if (runtime.mode === "explore") {
        reticle?.classList.add("is-visible");
        if (fromUser) {
            if (isCoarsePointer) {
                setGuideCollapsed(true);
            }
            resetExplorePose(false);
        }
        if (modeStatus) {
            modeStatus.textContent = "recorrido libre";
        }
        return;
    }

    runtime.reticleHotspotId = null;
    setReticleHint("");
    reticle?.classList.remove("is-visible");

    if (modeStatus) {
        modeStatus.textContent = runtime.mode === "frame2" ? "encuadre cristal" : "encuadre exacto";
    }

    if (fromUser) {
        const poseIndex = runtime.mode === "frame2" ? 1 : 0;
        if (poseIndex === 0 && runtime.activeHotspotId && runtime.activeHotspotId !== HOTSPOT_ORDER[0]) {
            focusHotspot(runtime.activeHotspotId, false);
        } else {
            applyReferencePose(false, poseIndex);
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

function enterExploreFromHotspot(hotspotId) {
    const object = getHotspotObject(hotspotId);
    if (!object) {
        return;
    }

    const bounds = new THREE.Box3().setFromObject(object);
    const focusPoint = bounds.getCenter(new THREE.Vector3());
    const radius = Math.max(bounds.getSize(new THREE.Vector3()).length(), 0.65);
    const approach = runtime.referenceOffsetDirection.clone().multiplyScalar(-Math.max(radius * 1.55, 1.5));
    const position = focusPoint.clone().add(approach);
    position.y = 1.58;

    runtime.explore.position.copy(position);
    clampExplorePosition();

    const lookDirection = focusPoint.clone().sub(runtime.explore.position).normalize();
    runtime.explore.yaw = Math.atan2(lookDirection.x, lookDirection.z);
    runtime.explore.pitch = clamp(Math.asin(lookDirection.y), -0.75, 0.42);

    setMode("explore", false);
    if (isCoarsePointer) {
        setGuideCollapsed(true);
    }
    applyExploreCamera(true);
    setActiveHotspot(hotspotId);
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
    const distance = clamp(radius * 4.45, runtime.sceneSize.length() * 0.11, runtime.sceneSize.length() * 0.26);
    const position = focusPoint.clone().add(runtime.referenceOffsetDirection.clone().multiplyScalar(distance));

    position.y = Math.max(position.y, focusPoint.y + radius * 1.36);

    runtime.targetPose.position.copy(position);
    runtime.targetPose.quaternion.copy(quaternionFromLookAt(position, focusPoint));
    runtime.targetPose.fov = hotspot.type === "Cassette" ? 34 : hotspot.type === "Poster" ? 38 : 42;
    runtime.focusHotspotId = hotspotId;

    setActiveHotspot(hotspotId);
}

function focusRelativeHotspot(direction) {
    const currentIndex = getHotspotIndex(runtime.activeHotspotId);
    const nextIndex = (currentIndex + direction + HOTSPOT_ORDER.length) % HOTSPOT_ORDER.length;
    const nextHotspotId = HOTSPOT_ORDER[nextIndex];
    setActiveHotspot(nextHotspotId);
    focusHotspot(nextHotspotId, true);
}

function getHotspotIndex(hotspotId) {
    const index = HOTSPOT_ORDER.indexOf(hotspotId);
    return index >= 0 ? index : 0;
}

function setActiveHotspot(hotspotId) {
    const hotspot = HOTSPOT_BY_ID.get(hotspotId);
    const object = getHotspotObject(hotspotId);

    if (!hotspot || !object) {
        return;
    }

    runtime.activeHotspotId = hotspotId;

    const hotspotIndex = getHotspotIndex(hotspotId);
    const indexLabel = `${String(hotspotIndex + 1).padStart(2, "0")} / ${String(HOTSPOT_ORDER.length).padStart(2, "0")}`;
    const compactIndex = String(hotspotIndex + 1).padStart(2, "0");

    if (inspectTitle) {
        inspectTitle.textContent = hotspot.label;
    }
    if (inspectCopy) {
        inspectCopy.textContent = hotspot.copy;
    }
    if (inspectType) {
        inspectType.textContent = hotspot.type;
    }
    if (inspectPhase) {
        inspectPhase.textContent = hotspot.phase;
    }
    if (inspectTypePill) {
        inspectTypePill.textContent = hotspot.type;
    }
    if (inspectPhasePill) {
        inspectPhasePill.textContent = hotspot.phase;
    }
    if (inspectIndex) {
        inspectIndex.textContent = compactIndex;
    }
    if (inspectTotal) {
        inspectTotal.textContent = `/ ${String(HOTSPOT_ORDER.length).padStart(2, "0")}`;
    }
    if (focusStatus) {
        focusStatus.textContent = hotspot.label.toLowerCase();
    }
    if (hotspotCounter) {
        hotspotCounter.textContent = indexLabel;
    }
    if (dockIndex) {
        dockIndex.textContent = compactIndex;
    }
    if (dockTitle) {
        dockTitle.textContent = hotspot.label;
    }
    if (dockCopy) {
        dockCopy.textContent = hotspot.copy;
    }

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
        setTourActive(false);
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
    if (event.code === "KeyQ") {
        event.preventDefault();
        setTourActive(false);
        focusRelativeHotspot(-1);
    }
    if (event.code === "KeyE") {
        event.preventDefault();
        if (runtime.mode === "explore") {
            const targetId = runtime.reticleHotspotId || runtime.activeHotspotId;
            if (targetId) {
                setTourActive(false);
                setActiveHotspot(targetId);
                focusHotspot(targetId, true);
            }
        } else {
            setTourActive(false);
            focusRelativeHotspot(1);
        }
    }
    if (event.code === "KeyT") {
        event.preventDefault();
        setTourActive(!runtime.tour.active);
    }
    if (event.code === "KeyG") {
        event.preventDefault();
        setGuideCollapsed(!runtime.guideCollapsed);
    }
    if (event.code === "KeyH") {
        event.preventDefault();
        setHudHidden(!runtime.hudHidden);
    }
    if (event.code === "Tab") {
        event.preventDefault();
        setTourActive(false);
        focusRelativeHotspot(event.shiftKey ? -1 : 1);
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
        const speed = runtime.explore.keyState.sprint ? 5.4 : 3.35;
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

function updateTour(elapsed) {
    if (!runtime.tour.active) {
        return;
    }

    if (elapsed >= runtime.tour.nextAdvanceAt) {
        const nextIndex = (getHotspotIndex(runtime.activeHotspotId) + 1) % HOTSPOT_ORDER.length;
        const nextHotspotId = HOTSPOT_ORDER[nextIndex];
        setActiveHotspot(nextHotspotId);
        focusHotspot(nextHotspotId, true);
        runtime.tour.nextAdvanceAt = elapsed + runtime.tour.duration;
    }
}

function updateHotspotVisuals(elapsed) {
    runtime.hotspotNodes.forEach((nodes, hotspotId) => {
        const isActive = hotspotId === runtime.activeHotspotId;
        const isReticle = hotspotId === runtime.reticleHotspotId;
        const pulse = 0.1 + (Math.sin(elapsed * 3.4) + 1) * 0.05;
        const mixAmount = isActive ? 0.16 + pulse : isReticle ? 0.08 : 0;
        const targetColor = isActive ? accentColor : hoverColor;

        nodes.forEach((node) => {
            if (!node.isMesh) {
                return;
            }

            const materials = Array.isArray(node.material) ? node.material : [node.material];
            materials.forEach((material) => {
                if (!material?.userData?.baseColor) {
                    return;
                }

                material.color.copy(material.userData.baseColor);
                if (mixAmount > 0) {
                    material.color.lerp(targetColor, mixAmount);
                }

                if (material.emissive && material.userData.baseEmissive) {
                    material.emissive.copy(material.userData.baseEmissive);
                    if (mixAmount > 0) {
                        material.emissive.lerp(accentColor, Math.min(mixAmount * 0.6, 0.22));
                    }
                }

                if (typeof material.userData.baseEmissiveIntensity === "number") {
                    material.emissiveIntensity = material.userData.baseEmissiveIntensity + (isActive ? 0.14 + pulse * 0.3 : isReticle ? 0.06 : 0);
                }
            });
        });
    });
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

    updateTour(elapsed);
    updateHotspotVisuals(elapsed);

    if (beacon.visible) {
        beacon.rotation.y = elapsed * 0.8;
        beaconRing.material.opacity = 0.74 + Math.sin(elapsed * 2.4) * 0.16;
        beacon.position.y = beacon.userData.baseY + Math.sin(elapsed * 1.8) * 0.045;
    }

    hoverLight.intensity = 1.08 + Math.sin(elapsed * 2.8) * 0.18;

    runtime.atmosphereSprites.forEach((sprite, index) => {
        const phase = sprite.userData.floatPhase ?? index * 0.37;
        sprite.position.y += Math.sin(elapsed * 0.7 + phase) * 0.0009;
        sprite.material.opacity = (index < 3 ? 0.11 : 0.04) + Math.sin(elapsed * 1.3 + phase) * 0.018;
    });

    // Animación de la fortaleza de cristales
    if (runtime.crystalFortress) {
        const fortress = runtime.crystalFortress;
        fortress.children.forEach((child, i) => {
            if (child.isMesh && child.material?.emissive) {
                const pulse = 0.7 + Math.sin(elapsed * 1.2 + i * 0.8) * 0.3;
                child.material.emissiveIntensity = (child.material.userData.baseEmissiveIntensity || 0.3) * pulse;
                child.material.opacity = 0.72 + Math.sin(elapsed * 0.9 + i * 0.5) * 0.1;
            }
            if (child.isPointLight) {
                child.intensity = child.userData.baseIntensity
                    ? child.userData.baseIntensity * (0.8 + Math.sin(elapsed * 1.6 + i) * 0.2)
                    : child.intensity;
            }
        });
        // Rotación lenta del cluster completo
        fortress.rotation.y = elapsed * 0.04;
    }

    // Animación de partículas de polvo
    if (runtime.dustParticles) {
        const posAttr = runtime.dustParticles.geometry.attributes.position;
        const phaseAttr = runtime.dustParticles.geometry.attributes.phase;
        for (let i = 0; i < posAttr.count; i++) {
            const ph = phaseAttr.getX(i);
            posAttr.setY(i, posAttr.getY(i) + Math.sin(elapsed * 0.4 + ph) * 0.001);
            posAttr.setX(i, posAttr.getX(i) + Math.cos(elapsed * 0.3 + ph) * 0.0004);
        }
        posAttr.needsUpdate = true;
        runtime.dustParticles.material.opacity = 0.32 + Math.sin(elapsed * 0.5) * 0.1;
    }

    renderer.getDrawingBufferSize(drawBufferSize);
    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, drawBufferSize.x, drawBufferSize.y);
    renderer.clear(true, true, true);
    composer.render(dt);
}

function resize() {
    const width = win.innerWidth;
    const height = win.innerHeight;
    const pixelRatio = Math.min(win.devicePixelRatio || 1, isCoarsePointer ? 1.35 : 1.8);

    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    composer.setPixelRatio(pixelRatio);
    composer.setSize(width, height);
    bloomPass.resolution.set(width, height);
    outlineEffect.setSize(width, height);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
}
