import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.183.2/build/three.module.min.js";

const doc = document;
const win = window;
const qs = (selector) => doc.querySelector(selector);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (from, to, alpha) => from + (to - from) * alpha;

const canvas = qs("#home-void-scene");
const glow = qs(".home-ambient-glow");
const titleNode = qs("#home-ambient-title");
const copyNode = qs("#home-ambient-copy");
const prefersReducedMotion = win.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!canvas || prefersReducedMotion) {
    if (canvas) {
        canvas.style.display = "none";
    }
    if (glow) {
        glow.style.display = "none";
    }
} else {
    initHomeImmersive();
}

function initHomeImmersive() {
    let renderer;

    try {
        renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: win.innerWidth > 900,
            powerPreference: "high-performance"
        });
    } catch (error) {
        canvas.style.display = "none";
        if (glow) {
            glow.style.display = "none";
        }
        return;
    }

    if ("outputColorSpace" in renderer && THREE.SRGBColorSpace) {
        renderer.outputColorSpace = THREE.SRGBColorSpace;
    }

    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080808, 0.082);

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
    camera.position.set(0, 0, 11.6);

    const root = new THREE.Group();
    const lattice = new THREE.Group();
    const frameShell = new THREE.Group();
    const shardShell = new THREE.Group();
    const coreShell = new THREE.Group();

    root.add(lattice);
    root.add(frameShell);
    root.add(shardShell);
    root.add(coreShell);
    scene.add(root);

    const sections = [
        { id: "hero", element: qs("#hero") },
        { id: "manifiesto", element: qs("#manifiesto") },
        { id: "nucleo", element: qs("#nucleo") },
        { id: "sistema", element: qs("#sistema") },
        { id: "archivo", element: qs("#archivo") },
        { id: "triada", element: qs("#triada") },
        { id: "lab", element: qs("#lab") },
        { id: "senal", element: qs("#senal") }
    ].filter((item) => item.element);

    const sectionStates = {
        hero: {
            label: "Hero pulse",
            copy: "origin signal / sentence under pressure",
            cameraZ: 11.6,
            fog: 0.082,
            wave: 0.38,
            lift: 0.22,
            depth: 0.62,
            spread: 1.02,
            redBias: 0.18,
            pointOpacity: 0.34,
            frameOpacity: 0.14,
            shardOpacity: 0.06,
            coreOpacity: 0.16,
            frameTwist: 0.18,
            sectionTilt: 0.08,
            glow: 0.58
        },
        manifiesto: {
            label: "Manifesto pressure",
            copy: "clarity sheet / contradiction held in white space",
            cameraZ: 12.2,
            fog: 0.104,
            wave: 0.12,
            lift: 0.08,
            depth: 0.36,
            spread: 1.1,
            redBias: 0.06,
            pointOpacity: 0.18,
            frameOpacity: 0.1,
            shardOpacity: 0.02,
            coreOpacity: 0.08,
            frameTwist: 0.06,
            sectionTilt: 0.02,
            glow: 0.38
        },
        nucleo: {
            label: "Core knot",
            copy: "idea / matter / contradiction compressed into one mass",
            cameraZ: 10.2,
            fog: 0.088,
            wave: 0.28,
            lift: 0.18,
            depth: 0.56,
            spread: 0.88,
            redBias: 0.16,
            pointOpacity: 0.3,
            frameOpacity: 0.16,
            shardOpacity: 0.05,
            coreOpacity: 0.18,
            frameTwist: 0.14,
            sectionTilt: 0.12,
            glow: 0.52
        },
        sistema: {
            label: "System grid",
            copy: "voice / image / behavior aligned inside a rigid frame",
            cameraZ: 10.8,
            fog: 0.094,
            wave: 0.14,
            lift: 0.12,
            depth: 0.42,
            spread: 1.18,
            redBias: 0.1,
            pointOpacity: 0.26,
            frameOpacity: 0.18,
            shardOpacity: 0.03,
            coreOpacity: 0.12,
            frameTwist: 0.08,
            sectionTilt: 0.06,
            glow: 0.44
        },
        archivo: {
            label: "Archive tunnel",
            copy: "discography as residue / phases stored in redacted depth",
            cameraZ: 9.6,
            fog: 0.076,
            wave: 0.34,
            lift: 0.2,
            depth: 0.74,
            spread: 1.24,
            redBias: 0.22,
            pointOpacity: 0.4,
            frameOpacity: 0.12,
            shardOpacity: 0.08,
            coreOpacity: 0.16,
            frameTwist: 0.2,
            sectionTilt: 0.14,
            glow: 0.62
        },
        triada: {
            label: "Triad balance",
            copy: "three functions / one pulse distributed in symmetry",
            cameraZ: 11.2,
            fog: 0.1,
            wave: 0.16,
            lift: 0.1,
            depth: 0.4,
            spread: 0.96,
            redBias: 0.08,
            pointOpacity: 0.2,
            frameOpacity: 0.15,
            shardOpacity: 0.02,
            coreOpacity: 0.14,
            frameTwist: 0.04,
            sectionTilt: 0.04,
            glow: 0.4
        },
        lab: {
            label: "Lab breach",
            copy: "the main system opens / immersive protocols leak forward",
            cameraZ: 9.4,
            fog: 0.072,
            wave: 0.42,
            lift: 0.26,
            depth: 0.82,
            spread: 1.08,
            redBias: 0.28,
            pointOpacity: 0.44,
            frameOpacity: 0.18,
            shardOpacity: 0.1,
            coreOpacity: 0.2,
            frameTwist: 0.24,
            sectionTilt: 0.16,
            glow: 0.68
        },
        senal: {
            label: "Signal aperture",
            copy: "channel open / the field resolves into contact",
            cameraZ: 11.8,
            fog: 0.106,
            wave: 0.1,
            lift: 0.06,
            depth: 0.3,
            spread: 1.32,
            redBias: 0.12,
            pointOpacity: 0.16,
            frameOpacity: 0.1,
            shardOpacity: 0.02,
            coreOpacity: 0.1,
            frameTwist: 0.05,
            sectionTilt: 0.03,
            glow: 0.34
        }
    };

    const numericKeys = [
        "cameraZ",
        "fog",
        "wave",
        "lift",
        "depth",
        "spread",
        "redBias",
        "pointOpacity",
        "frameOpacity",
        "shardOpacity",
        "coreOpacity",
        "frameTwist",
        "sectionTilt",
        "glow"
    ];

    const initialSection = doc.body?.dataset?.homeSection in sectionStates ? doc.body.dataset.homeSection : "hero";
    const target = { ...sectionStates[initialSection] };
    const state = { ...sectionStates[initialSection] };

    const columns = win.innerWidth < 640 ? 28 : win.innerWidth < 1080 ? 34 : 40;
    const rows = win.innerWidth < 640 ? 18 : win.innerWidth < 1080 ? 22 : 24;
    const pointCount = columns * rows;

    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(pointCount * 3);
    const colors = new Float32Array(pointCount * 3);
    const baseX = new Float32Array(pointCount);
    const baseY = new Float32Array(pointCount);
    const baseZ = new Float32Array(pointCount);
    const seeds = new Float32Array(pointCount);
    const redSeeds = new Float32Array(pointCount);

    let cursor = 0;
    for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < columns; col += 1) {
            const offset = cursor * 3;
            const x = (col / Math.max(columns - 1, 1) - 0.5) * 12;
            const y = (row / Math.max(rows - 1, 1) - 0.5) * 8;
            const z = (Math.random() - 0.5) * 4.2;

            baseX[cursor] = x;
            baseY[cursor] = y;
            baseZ[cursor] = z;
            seeds[cursor] = Math.random();
            redSeeds[cursor] = Math.random();

            positions[offset] = x;
            positions[offset + 1] = y;
            positions[offset + 2] = z;
            setColorTriplet(colors, offset, redSeeds[cursor] * 0.12);

            cursor += 1;
        }
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const points = new THREE.Points(
        particleGeometry,
        new THREE.PointsMaterial({
            size: win.innerWidth < 640 ? 0.05 : 0.06,
            transparent: true,
            opacity: state.pointOpacity,
            depthWrite: false,
            vertexColors: true,
            blending: THREE.AdditiveBlending
        })
    );
    lattice.add(points);

    const frames = [
        createFrame(9.4, 6.2, 0xf5f5f5),
        createFrame(7.8, 4.8, 0xd21f3c),
        createFrame(6.2, 3.8, 0xf5f5f5)
    ];

    frames[0].position.z = -1.4;
    frames[1].position.z = 0.6;
    frames[2].position.z = 1.8;
    frames.forEach((frame) => frameShell.add(frame));

    const shards = Array.from({ length: win.innerWidth < 640 ? 8 : 12 }, (_, index) => {
        const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(0.18, 5.2),
            new THREE.MeshBasicMaterial({
                color: index % 3 === 0 ? 0xd21f3c : 0xf5f5f5,
                wireframe: true,
                transparent: true,
                opacity: state.shardOpacity,
                side: THREE.DoubleSide
            })
        );

        mesh.position.set((Math.random() - 0.5) * 9.4, (Math.random() - 0.5) * 6.8, (Math.random() - 0.5) * 4.6);
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        shardShell.add(mesh);

        return {
            mesh,
            seed: Math.random() * Math.PI * 2,
            drift: 0.4 + Math.random() * 0.8
        };
    });

    const coreOuter = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.OctahedronGeometry(1.8, 0)),
        new THREE.LineBasicMaterial({
            color: 0xf5f5f5,
            transparent: true,
            opacity: state.coreOpacity
        })
    );

    const coreInner = new THREE.Mesh(
        new THREE.TorusKnotGeometry(1.1, 0.14, 108, 18),
        new THREE.MeshBasicMaterial({
            color: 0xd21f3c,
            wireframe: true,
            transparent: true,
            opacity: state.coreOpacity * 0.95
        })
    );

    coreShell.add(coreOuter);
    coreShell.add(coreInner);

    const pointer = { x: 0, y: 0 };

    setReadout(sectionStates[initialSection]);
    resize();
    setSection(initialSection);

    const observer = new IntersectionObserver((entries) => {
        const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        if (visible?.target?.id) {
            setSection(visible.target.id);
        }
    }, {
        threshold: [0.2, 0.4, 0.6],
        rootMargin: "-18% 0px -40% 0px"
    });

    sections.forEach((section) => observer.observe(section.element));

    win.addEventListener("pointermove", (event) => {
        pointer.x = lerp(pointer.x, (event.clientX / Math.max(win.innerWidth, 1) - 0.5) * 2, 0.3);
        pointer.y = lerp(pointer.y, (event.clientY / Math.max(win.innerHeight, 1) - 0.5) * 2, 0.3);
    });

    win.addEventListener("resize", resize);

    const timer = new THREE.Timer();
    timer.connect(doc);

    win.addEventListener("beforeunload", () => {
        timer.dispose();
        renderer.dispose();
        particleGeometry.dispose();
        frames.forEach((frame) => frame.geometry.dispose());
    });

    render();

    function createFrame(width, height, color) {
        const geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([
            -width * 0.5, -height * 0.5, 0,
            width * 0.5, -height * 0.5, 0,
            width * 0.5, height * 0.5, 0,
            -width * 0.5, height * 0.5, 0
        ]);

        geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
        return new THREE.LineLoop(
            geometry,
            new THREE.LineBasicMaterial({
                color,
                transparent: true,
                opacity: state.frameOpacity
            })
        );
    }

    function resize() {
        const width = win.innerWidth;
        const height = win.innerHeight;
        const pixelRatio = Math.min(win.devicePixelRatio || 1, width < 720 ? 1.2 : 1.7);

        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(width, height, false);
        camera.aspect = width / Math.max(height, 1);
        camera.updateProjectionMatrix();
    }

    function setReadout(preset) {
        if (titleNode) {
            titleNode.textContent = preset.label;
        }

        if (copyNode) {
            copyNode.textContent = preset.copy;
        }

        if (glow) {
            glow.style.opacity = String(preset.glow);
        }
    }

    function setSection(id) {
        const preset = sectionStates[id] || sectionStates.hero;

        numericKeys.forEach((key) => {
            target[key] = preset[key];
        });

        if (doc.body) {
            doc.body.dataset.homeSection = id;
        }

        setReadout(preset);
    }

    function render(timestamp) {
        timer.update(timestamp);
        const elapsed = timer.getElapsed();
        const scrollRange = Math.max(doc.documentElement.scrollHeight - win.innerHeight, 1);
        const scrollProgress = clamp(win.scrollY / scrollRange, 0, 1);

        numericKeys.forEach((key) => {
            state[key] = lerp(state[key], target[key], 0.05);
        });

        scene.fog.density = state.fog;
        points.material.opacity = state.pointOpacity;
        coreOuter.material.opacity = state.coreOpacity;
        coreInner.material.opacity = state.coreOpacity * 0.95;

        updateLattice(elapsed, scrollProgress);
        updateFrames(elapsed, scrollProgress);
        updateShards(elapsed);
        updateCore(elapsed, scrollProgress);

        root.rotation.x = lerp(root.rotation.x, -pointer.y * 0.1 + state.sectionTilt, 0.05);
        root.rotation.y = lerp(root.rotation.y, pointer.x * 0.14, 0.05);

        camera.position.x = lerp(camera.position.x, pointer.x * 0.55, 0.04);
        camera.position.y = lerp(camera.position.y, -pointer.y * 0.26, 0.04);
        camera.position.z = lerp(camera.position.z, state.cameraZ - scrollProgress * 0.8, 0.04);
        camera.lookAt(pointer.x * 0.18, pointer.y * -0.14, 0);

        renderer.render(scene, camera);
        win.requestAnimationFrame(render);
    }

    function updateLattice(elapsed, scrollProgress) {
        const positionAttr = particleGeometry.getAttribute("position");
        const colorAttr = particleGeometry.getAttribute("color");

        for (let index = 0; index < pointCount; index += 1) {
            const offset = index * 3;
            const seed = seeds[index];
            const xWave = Math.sin(elapsed * 0.5 + baseY[index] * 0.5 + seed * 6) * state.wave;
            const yWave = Math.cos(elapsed * 0.42 + baseX[index] * 0.34 + seed * 5) * state.lift;
            const zWave = Math.sin(elapsed * 0.24 + seed * 8 + scrollProgress * 4) * state.depth;

            positions[offset] = baseX[index] * state.spread + xWave + pointer.x * 0.44;
            positions[offset + 1] = baseY[index] + yWave - pointer.y * 0.26;
            positions[offset + 2] = baseZ[index] + zWave;

            const redMix = clamp(state.redBias + redSeeds[index] * 0.18 + Math.sin(elapsed * 0.72 + seed * 9) * 0.08, 0, 1);
            setColorTriplet(colors, offset, redMix);
        }

        positionAttr.needsUpdate = true;
        colorAttr.needsUpdate = true;
    }

    function updateFrames(elapsed, scrollProgress) {
        frames.forEach((frame, index) => {
            frame.rotation.x = elapsed * (0.05 + index * 0.01) + state.frameTwist * 0.4;
            frame.rotation.y = elapsed * (0.08 + index * 0.02) + scrollProgress * 0.8;
            frame.rotation.z = elapsed * (0.03 + index * 0.015);
            frame.position.x = Math.sin(elapsed * 0.2 + index) * 0.24 + pointer.x * 0.12;
            frame.position.y = Math.cos(elapsed * 0.24 + index) * 0.18 - pointer.y * 0.12;
            frame.material.opacity = state.frameOpacity + Math.sin(elapsed * 0.6 + index) * 0.015;
        });
    }

    function updateShards(elapsed) {
        shards.forEach((shard, index) => {
            shard.mesh.rotation.x += 0.0008 + state.frameTwist * 0.0014;
            shard.mesh.rotation.y += 0.001 + state.wave * 0.0012;
            shard.mesh.rotation.z += 0.0006 + state.redBias * 0.0012;
            shard.mesh.position.x += Math.sin(elapsed * 0.18 + shard.seed + index) * 0.0022;
            shard.mesh.position.y += Math.cos(elapsed * 0.22 + shard.seed) * 0.0018;
            shard.mesh.material.opacity = state.shardOpacity + Math.sin(elapsed * shard.drift + index) * 0.014;
        });
    }

    function updateCore(elapsed, scrollProgress) {
        coreShell.rotation.x = elapsed * (0.14 + state.wave * 0.08);
        coreShell.rotation.y = elapsed * (0.18 + state.frameTwist * 0.14) + scrollProgress * 1.4;
        coreShell.rotation.z = elapsed * (0.06 + state.redBias * 0.08);
        coreShell.position.z = Math.sin(elapsed * 0.32) * 0.22;

        const scale = 1 + Math.sin(elapsed * (0.6 + state.wave * 0.14)) * (0.05 + state.redBias * 0.06);
        coreShell.scale.setScalar(scale);
    }
}

function setColorTriplet(target, offset, redMix) {
    const paper = [0.96, 0.96, 0.96];
    const red = [0.82, 0.12, 0.24];

    target[offset] = lerp(paper[0], red[0], redMix);
    target[offset + 1] = lerp(paper[1], red[1], redMix);
    target[offset + 2] = lerp(paper[2], red[2], redMix);
}
