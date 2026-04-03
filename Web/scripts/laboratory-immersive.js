import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.183.2/build/three.module.min.js";

const doc = document;
const win = window;
const qs = (selector) => doc.querySelector(selector);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (from, to, alpha) => from + (to - from) * alpha;

const runtime = win.__sicLabRuntime || (win.__sicLabRuntime = {
    pointer: {
        x: 0.5,
        y: 0.5,
        active: false
    },
    activeSection: doc.body?.dataset?.labSection || "container",
    prefersReducedMotion: win.matchMedia("(prefers-reduced-motion: reduce)").matches
});

const canvas = qs("#void-scene");
const titleNode = qs("#ambient-title");
const copyNode = qs("#ambient-copy");

if (!canvas || runtime.prefersReducedMotion) {
    if (canvas) {
        canvas.style.display = "none";
    }
} else {
    bootImmersiveField();
}

function bootImmersiveField() {
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
        return;
    }

    if ("outputColorSpace" in renderer && THREE.SRGBColorSpace) {
        renderer.outputColorSpace = THREE.SRGBColorSpace;
    }

    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020202, 0.09);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
    camera.position.set(0, 0.1, 8.4);

    const field = new THREE.Group();
    const particleShell = new THREE.Group();
    const shardShell = new THREE.Group();
    const ringShell = new THREE.Group();
    const coreShell = new THREE.Group();

    field.add(particleShell);
    field.add(shardShell);
    field.add(ringShell);
    field.add(coreShell);
    scene.add(field);

    const sectionStates = {
        container: {
            label: "Container lattice",
            copy: "compact lattice / conflict held in suspension",
            cameraZ: 8.6,
            rootX: 0.16,
            rootY: 0.26,
            fog: 0.096,
            tunnel: 0.86,
            pulse: 0.24,
            wave: 0.18,
            spread: 0.9,
            lift: 0.7,
            depthPulse: 0.22,
            redBias: 0.14,
            pointsOpacity: 0.44,
            shardOpacity: 0.08,
            knotOpacity: 0.14,
            ringOpacity: 0.12,
            mirror: 0
        },
        ether: {
            label: "Ether carrier",
            copy: "signal tunnel / resonance rising through tape and static",
            cameraZ: 7.8,
            rootX: 0.08,
            rootY: 0.62,
            fog: 0.082,
            tunnel: 1.2,
            pulse: 0.42,
            wave: 0.86,
            spread: 1.08,
            lift: 0.88,
            depthPulse: 0.46,
            redBias: 0.3,
            pointsOpacity: 0.6,
            shardOpacity: 0.1,
            knotOpacity: 0.2,
            ringOpacity: 0.18,
            mirror: 0.08
        },
        subconscious: {
            label: "Subconscious fracture",
            copy: "semantic shards / unstable language inside the field",
            cameraZ: 7.2,
            rootX: -0.1,
            rootY: 0.94,
            fog: 0.112,
            tunnel: 0.98,
            pulse: 0.58,
            wave: 0.46,
            spread: 1.28,
            lift: 1.02,
            depthPulse: 0.36,
            redBias: 0.18,
            pointsOpacity: 0.5,
            shardOpacity: 0.16,
            knotOpacity: 0.16,
            ringOpacity: 0.1,
            mirror: 0.2
        },
        mirror: {
            label: "Mirror breach",
            copy: "symmetry violated / subject under abstract surveillance",
            cameraZ: 6.5,
            rootX: 0.22,
            rootY: 1.28,
            fog: 0.074,
            tunnel: 1.32,
            pulse: 0.7,
            wave: 0.72,
            spread: 0.84,
            lift: 0.76,
            depthPulse: 0.58,
            redBias: 0.4,
            pointsOpacity: 0.68,
            shardOpacity: 0.12,
            knotOpacity: 0.26,
            ringOpacity: 0.22,
            mirror: 0.56
        }
    };

    const numericKeys = [
        "cameraZ",
        "rootX",
        "rootY",
        "fog",
        "tunnel",
        "pulse",
        "wave",
        "spread",
        "lift",
        "depthPulse",
        "redBias",
        "pointsOpacity",
        "shardOpacity",
        "knotOpacity",
        "ringOpacity",
        "mirror"
    ];

    const currentSection = runtime.activeSection in sectionStates ? runtime.activeSection : "container";
    const target = { ...sectionStates[currentSection] };
    const state = { ...sectionStates[currentSection] };

    const particleCount = win.innerWidth < 540 ? 760 : win.innerWidth < 980 ? 1220 : 1820;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const baseRadius = new Float32Array(particleCount);
    const baseAngle = new Float32Array(particleCount);
    const baseLift = new Float32Array(particleCount);
    const baseDepth = new Float32Array(particleCount);
    const baseSpeed = new Float32Array(particleCount);
    const baseSeed = new Float32Array(particleCount);
    const baseRedMix = new Float32Array(particleCount);

    for (let index = 0; index < particleCount; index += 1) {
        const offset = index * 3;
        const angle = Math.random() * Math.PI * 2;
        const radius = 1.1 + Math.random() * 2.9;
        const lift = (Math.random() - 0.5) * 4.8;
        const depth = (Math.random() - 0.5) * 18;
        const speed = 0.38 + Math.random() * 0.92;
        const seed = Math.random();
        const redMix = Math.random();

        baseAngle[index] = angle;
        baseRadius[index] = radius;
        baseLift[index] = lift;
        baseDepth[index] = depth;
        baseSpeed[index] = speed;
        baseSeed[index] = seed;
        baseRedMix[index] = redMix;

        positions[offset] = Math.cos(angle) * radius;
        positions[offset + 1] = lift;
        positions[offset + 2] = depth;

        setColorTriplet(colors, offset, redMix * 0.22);
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particles = new THREE.Points(
        particleGeometry,
        new THREE.PointsMaterial({
            size: win.innerWidth < 540 ? 0.05 : 0.07,
            transparent: true,
            opacity: state.pointsOpacity,
            depthWrite: false,
            vertexColors: true,
            blending: THREE.AdditiveBlending
        })
    );
    particleShell.add(particles);

    const cage = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.8, 1)),
        new THREE.LineBasicMaterial({
            color: 0xf5f5f5,
            transparent: true,
            opacity: 0.2
        })
    );
    coreShell.add(cage);

    const knot = new THREE.Mesh(
        new THREE.TorusKnotGeometry(1.28, 0.17, 140, 18),
        new THREE.MeshBasicMaterial({
            color: 0xd21f3c,
            wireframe: true,
            transparent: true,
            opacity: state.knotOpacity
        })
    );
    coreShell.add(knot);

    const rings = [
        createRing(2.18, 0xf5f5f5),
        createRing(2.54, 0xd21f3c),
        createRing(2.9, 0xf5f5f5)
    ];
    rings[0].rotation.x = Math.PI * 0.5;
    rings[1].rotation.y = Math.PI * 0.5;
    rings[2].rotation.z = Math.PI * 0.5;
    rings.forEach((ring) => ringShell.add(ring));

    const shardGeometry = new THREE.PlaneGeometry(0.22, 3.6, 1, 8);
    const shards = Array.from({ length: win.innerWidth < 540 ? 10 : 16 }, (_, index) => {
        const material = new THREE.MeshBasicMaterial({
            color: index % 3 === 0 ? 0xd21f3c : 0xf5f5f5,
            wireframe: true,
            transparent: true,
            opacity: state.shardOpacity,
            side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(shardGeometry, material);
        const angle = (index / Math.max(1, 15)) * Math.PI * 2;
        const radius = 2.2 + Math.random() * 1.8;
        const lift = (Math.random() - 0.5) * 3.6;
        const seed = Math.random() * Math.PI * 2;
        const speed = 0.4 + Math.random() * 0.8;

        mesh.position.set(Math.cos(angle) * radius, lift, Math.sin(angle) * radius * 0.55);
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        shardShell.add(mesh);

        return { mesh, angle, radius, lift, seed, speed };
    });

    const pointer = {
        x: 0,
        y: 0
    };

    const readout = {
        title: currentSection,
        copy: sectionStates[currentSection].copy
    };

    setSection(currentSection);
    resize();
    win.addEventListener("resize", resize);
    win.addEventListener("sic:lab-section", (event) => {
        if (event.detail?.id) {
            setSection(event.detail.id);
        }
    });
    win.addEventListener("beforeunload", () => {
        timer.dispose();
        renderer.dispose();
        particleGeometry.dispose();
        shardGeometry.dispose();
    });

    const timer = new THREE.Timer();
    timer.connect(doc);
    render();

    function createRing(radius, color) {
        return new THREE.Mesh(
            new THREE.TorusGeometry(radius, 0.03, 12, 112),
            new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: state.ringOpacity,
                wireframe: true
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

    function setSection(id) {
        const preset = sectionStates[id] || sectionStates.container;

        numericKeys.forEach((key) => {
            target[key] = preset[key];
        });

        readout.title = preset.label;
        readout.copy = preset.copy;

        if (titleNode) {
            titleNode.textContent = readout.title;
        }

        if (copyNode) {
            copyNode.textContent = readout.copy;
        }
    }

    function render(timestamp) {
        timer.update(timestamp);
        const elapsed = timer.getElapsed();
        const scrollRange = Math.max(doc.documentElement.scrollHeight - win.innerHeight, 1);
        const scrollProgress = clamp(win.scrollY / scrollRange, 0, 1);
        const pointerX = ((runtime.pointer?.x ?? 0.5) - 0.5) * 2;
        const pointerY = ((runtime.pointer?.y ?? 0.5) - 0.5) * 2;

        pointer.x = lerp(pointer.x, pointerX, 0.055);
        pointer.y = lerp(pointer.y, pointerY, 0.055);

        numericKeys.forEach((key) => {
            state[key] = lerp(state[key], target[key], 0.045);
        });

        scene.fog.density = state.fog;
        particles.material.opacity = state.pointsOpacity;
        knot.material.opacity = state.knotOpacity + Math.sin(elapsed * 0.72) * 0.015;
        cage.material.opacity = 0.12 + state.mirror * 0.12;

        rings.forEach((ring, index) => {
            ring.material.opacity = state.ringOpacity + Math.sin(elapsed * (0.52 + index * 0.1)) * 0.02;
        });

        updateParticles(elapsed, scrollProgress, pointer.x, pointer.y);
        updateShards(elapsed, pointer.x, pointer.y);
        updateCore(elapsed, scrollProgress, pointer.x, pointer.y);

        camera.position.x = lerp(camera.position.x, pointer.x * 0.72, 0.06);
        camera.position.y = lerp(camera.position.y, -pointer.y * 0.48 + Math.sin(elapsed * 0.22) * 0.08, 0.06);
        camera.position.z = lerp(camera.position.z, state.cameraZ - scrollProgress * 0.84, 0.05);
        camera.lookAt(pointer.x * 0.28, pointer.y * -0.18, 0);

        renderer.render(scene, camera);
        win.requestAnimationFrame(render);
    }

    function updateParticles(elapsed, scrollProgress, pointerX, pointerY) {
        const positionAttr = particleGeometry.getAttribute("position");
        const colorAttr = particleGeometry.getAttribute("color");

        for (let index = 0; index < particleCount; index += 1) {
            const offset = index * 3;
            const spin = elapsed * (0.18 + baseSpeed[index] * 0.14);
            const orbit = baseAngle[index] + spin * (0.9 + state.wave * 0.34) + scrollProgress * 1.2;
            const radius = baseRadius[index] * (0.84 + state.tunnel * 0.36) + Math.sin(spin * 1.4 + baseSeed[index] * 8) * (0.08 + state.pulse * 0.18);
            const wave = Math.sin(elapsed * (0.8 + baseSpeed[index]) + baseDepth[index] * 0.3 + baseSeed[index] * 4) * (0.12 + state.wave * 0.7);
            const mirrorOffset = state.mirror * Math.sign(Math.cos(baseAngle[index])) * 0.24;

            positions[offset] = Math.cos(orbit) * radius + pointerX * 0.62 + mirrorOffset;
            positions[offset + 1] = baseLift[index] * state.lift + wave - pointerY * 0.42;
            positions[offset + 2] = baseDepth[index] + Math.sin(elapsed * 0.4 + baseSeed[index] * 10) * state.depthPulse;

            const redMix = clamp(baseRedMix[index] * 0.4 + state.redBias + Math.sin(elapsed * 0.9 + baseSeed[index] * 5) * state.pulse * 0.12, 0, 1);
            setColorTriplet(colors, offset, redMix);
        }

        positionAttr.needsUpdate = true;
        colorAttr.needsUpdate = true;
    }

    function updateShards(elapsed, pointerX, pointerY) {
        shards.forEach((shard, index) => {
            const drift = elapsed * (0.18 + shard.speed * 0.2);
            const pulse = Math.sin(drift + shard.seed);

            shard.mesh.position.x = Math.cos(shard.angle + elapsed * 0.09 + shard.seed) * (shard.radius * state.spread) + pointerX * 0.18;
            shard.mesh.position.y = shard.lift + pulse * (0.22 + state.wave * 0.38) - pointerY * 0.12;
            shard.mesh.position.z = Math.sin(shard.angle * 2.4 + drift) * (0.6 + state.mirror * 1.2);

            shard.mesh.rotation.x += 0.001 + state.wave * 0.0009;
            shard.mesh.rotation.y += 0.0012 + state.pulse * 0.0008;
            shard.mesh.rotation.z += 0.0006 + state.mirror * 0.0012;
            shard.mesh.material.opacity = state.shardOpacity + Math.sin(elapsed * 0.7 + index) * 0.02;
        });
    }

    function updateCore(elapsed, scrollProgress, pointerX, pointerY) {
        field.rotation.x = lerp(field.rotation.x, state.rootX + pointerY * 0.08, 0.035);
        field.rotation.y = lerp(field.rotation.y, state.rootY + pointerX * 0.14, 0.035);
        field.position.z = Math.sin(elapsed * 0.24) * 0.2 - scrollProgress * 0.3;

        particleShell.rotation.z += 0.0009 + state.wave * 0.0011;
        particleShell.rotation.y += 0.001 + state.pulse * 0.001;

        shardShell.rotation.x = Math.sin(elapsed * 0.2) * 0.2 + state.mirror * 0.18;
        shardShell.rotation.y += 0.0008 + state.wave * 0.0008;

        coreShell.rotation.x = elapsed * (0.14 + state.wave * 0.07);
        coreShell.rotation.y = elapsed * (0.18 + state.pulse * 0.08) + scrollProgress * 1.8;
        coreShell.scale.setScalar(1 + Math.sin(elapsed * (0.64 + state.wave * 0.16)) * (0.06 + state.pulse * 0.04));

        ringShell.rotation.x = elapsed * (0.11 + state.mirror * 0.06);
        ringShell.rotation.y = elapsed * (0.08 + state.wave * 0.12);
        ringShell.rotation.z = elapsed * (0.05 + state.pulse * 0.06);
    }
}

function setColorTriplet(target, offset, redMix) {
    const paper = [0.96, 0.96, 0.96];
    const red = [0.82, 0.12, 0.24];

    target[offset] = lerp(paper[0], red[0], redMix);
    target[offset + 1] = lerp(paper[1], red[1], redMix);
    target[offset + 2] = lerp(paper[2], red[2], redMix);
}
