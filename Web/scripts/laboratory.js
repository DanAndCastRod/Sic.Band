(() => {
    const doc = document;
    const win = window;
    const prefersReducedMotion = win.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasGsap = typeof win.gsap !== "undefined";

    const qs = (selector, scope = doc) => scope.querySelector(selector);
    const qsa = (selector, scope = doc) => Array.from(scope.querySelectorAll(selector));
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const STATION_TAPE_URL = "./assets/audio/mss-white.wav";

    const scene = {
        pointer: {
            x: win.innerWidth * 0.5,
            y: win.innerHeight * 0.5,
            active: false
        }
    };
    const runtime = win.__sicLabRuntime || (win.__sicLabRuntime = {
        pointer: {
            x: 0.5,
            y: 0.5,
            active: false
        },
        activeSection: doc.body?.dataset?.labSection || "container",
        prefersReducedMotion
    });

    const stations = [
        {
            freq: 92.5,
            pitch: 174,
            tolerance: 0.75,
            title: "TRUTH HIDING / 92.5",
            body: "La ambiguedad no corrige la verdad. La expone cuando el ruido deja de protegerla.",
            lines: [
                "MANIFESTO FRAGMENT / light leak detected",
                "signal source / archive residue",
                "clarity index / unstable"
            ],
            sample: {
                label: "MSS WHITE / fragment alpha",
                clipStart: 18.4,
                clipDuration: 14.8,
                playbackRate: 0.91,
                resonance: 920,
                gain: 0.14
            }
        },
        {
            freq: 101.1,
            pitch: 232,
            tolerance: 0.52,
            title: "SENTENCE IN CONFLICT / 101.1",
            body: "La maquina no entrega respuestas limpias. Solo bordes, interferencia y una idea todavia abierta.",
            lines: [
                "oracle carrier / active",
                "semantic pressure / rising",
                "warning / no stable meaning"
            ],
            sample: {
                label: "MSS WHITE / sentence bleed",
                clipStart: 78.2,
                clipDuration: 18.2,
                playbackRate: 1,
                resonance: 1680,
                gain: 0.22
            }
        },
        {
            freq: 106.6,
            pitch: 294,
            tolerance: 0.38,
            title: "RED CHANNEL / 106.6",
            body: "La senal roja aparece cuando el sistema detecta presencia antes que explicacion.",
            lines: [
                "red pulse / visible",
                "presence scan / armed",
                "shadow copy / near-field"
            ],
            sample: {
                label: "MSS WHITE / red channel",
                clipStart: 142.6,
                clipDuration: 16.4,
                playbackRate: 1.07,
                resonance: 2460,
                gain: 0.18
            }
        }
    ];

    const audioState = {
        context: null,
        master: null,
        analyser: null,
        analyserData: null,
        noiseGain: null,
        droneGain: null,
        signalGain: null,
        signalFilter: null,
        sampleGain: null,
        sampleFilter: null,
        sampleSource: null,
        sampleBuffer: null,
        sampleBufferPromise: null,
        currentSampleFreq: null,
        noiseSource: null,
        droneOsc: null,
        signalOsc: null,
        vibratoOsc: null,
        vibratoGain: null,
        active: false,
        lockStrength: 0
    };

    const mirrorState = {
        stream: null,
        active: false,
        rafId: 0,
        frameCount: 0,
        threatLevel: "standby"
    };

    initPointerTracking();
    initSceneCanvas();
    initCursorHalo();
    initEntrance();
    initReveal();
    initSectionTracking();
    initIdeaField();
    initTuner();
    initOracle();
    initTruthFilter();
    initSubliminalFlash();
    initMirror();

    function initPointerTracking() {
        win.addEventListener("pointermove", (event) => {
            scene.pointer.x = event.clientX;
            scene.pointer.y = event.clientY;
            scene.pointer.active = true;
            runtime.pointer.x = clamp(event.clientX / Math.max(win.innerWidth, 1), 0, 1);
            runtime.pointer.y = clamp(event.clientY / Math.max(win.innerHeight, 1), 0, 1);
            runtime.pointer.active = true;
        });

        win.addEventListener("pointerleave", () => {
            scene.pointer.active = false;
            runtime.pointer.active = false;
        });
    }

    function initSceneCanvas() {
        const canvas = qs("#signal-canvas");
        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext("2d");
        let dpr = 1;
        let width = 0;
        let height = 0;
        let particles = [];

        const buildParticles = () => {
            const count = clamp(Math.round(width / 38), 24, 54);
            particles = Array.from({ length: count }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.32,
                vy: (Math.random() - 0.5) * 0.22,
                radius: 1 + Math.random() * 2.6,
                glow: 0.12 + Math.random() * 0.24
            }));
        };

        const resize = () => {
            dpr = win.devicePixelRatio || 1;
            width = win.innerWidth;
            height = win.innerHeight;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            buildParticles();
        };

        const drawGrid = () => {
            ctx.save();
            ctx.strokeStyle = "rgba(245, 245, 245, 0.05)";
            ctx.lineWidth = 1;

            for (let x = 0; x <= width; x += 120) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }

            for (let y = 0; y <= height; y += 120) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            ctx.restore();
        };

        const drawLabel = () => {
            ctx.save();
            ctx.font = '12px "Syncopate", sans-serif';
            ctx.fillStyle = "rgba(245, 245, 245, 0.1)";
            ctx.fillText("MENTAL LABORATORY // NEURAL MAPPING", 24, 36);
            ctx.fillStyle = "rgba(210, 31, 60, 0.14)";
            ctx.fillText("[REDACTED] // ACTIVE SUBJECT FIELD", width - 360, height - 32);
            ctx.restore();
        };

        const render = () => {
            ctx.clearRect(0, 0, width, height);
            drawGrid();
            drawLabel();

            particles.forEach((particle, index) => {
                particle.x += particle.vx;
                particle.y += particle.vy;

                if (particle.x < -12) {
                    particle.x = width + 12;
                } else if (particle.x > width + 12) {
                    particle.x = -12;
                }

                if (particle.y < -12) {
                    particle.y = height + 12;
                } else if (particle.y > height + 12) {
                    particle.y = -12;
                }

                const dx = scene.pointer.x - particle.x;
                const dy = scene.pointer.y - particle.y;
                const distance = Math.hypot(dx, dy);
                const force = clamp(1 - distance / 220, 0, 1);

                if (scene.pointer.active && force > 0) {
                    particle.x -= dx * force * 0.0025;
                    particle.y -= dy * force * 0.0025;
                }

                ctx.beginPath();
                ctx.fillStyle = force > 0.2 ? "rgba(210, 31, 60, 0.55)" : `rgba(245, 245, 245, ${particle.glow})`;
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fill();

                for (let cursor = index + 1; cursor < particles.length; cursor += 1) {
                    const neighbor = particles[cursor];
                    const lineDistance = Math.hypot(particle.x - neighbor.x, particle.y - neighbor.y);

                    if (lineDistance < 120) {
                        const alpha = (1 - lineDistance / 120) * 0.12;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(245, 245, 245, ${alpha})`;
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(neighbor.x, neighbor.y);
                        ctx.stroke();
                    }
                }
            });

            if (scene.pointer.active) {
                ctx.beginPath();
                ctx.strokeStyle = "rgba(210, 31, 60, 0.16)";
                ctx.lineWidth = 1.2;
                ctx.arc(scene.pointer.x, scene.pointer.y, 110, 0, Math.PI * 2);
                ctx.stroke();
            }

            win.requestAnimationFrame(render);
        };

        resize();
        win.addEventListener("resize", resize);
        win.requestAnimationFrame(render);
    }

    function initCursorHalo() {
        const halo = qs("#cursor-halo");
        if (!halo) {
            return;
        }

        if (!hasGsap || prefersReducedMotion) {
            halo.style.transform = "translate(-50%, -50%)";
            win.addEventListener("pointermove", (event) => {
                halo.style.left = `${event.clientX}px`;
                halo.style.top = `${event.clientY}px`;
            });
            return;
        }

        const moveX = gsap.quickTo(halo, "left", { duration: 0.4, ease: "power3.out" });
        const moveY = gsap.quickTo(halo, "top", { duration: 0.4, ease: "power3.out" });
        const alpha = gsap.quickTo(halo, "opacity", { duration: 0.4, ease: "power2.out" });

        win.addEventListener("pointermove", (event) => {
            moveX(event.clientX);
            moveY(event.clientY);
            alpha(0.38);
        });

        win.addEventListener("pointerleave", () => {
            alpha(0);
        });
    }

    function initEntrance() {
        if (!hasGsap || prefersReducedMotion) {
            qsa("[data-reveal]").forEach((node) => {
                node.style.opacity = "1";
                node.style.transform = "none";
            });
            return;
        }

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.from(".topbar", { y: -28, opacity: 0, duration: 0.7 })
            .from(".hero-copy > *", { y: 28, opacity: 0, duration: 0.9, stagger: 0.08 }, "-=0.4")
            .from(".hero-panel", { x: 34, opacity: 0, duration: 1 }, "-=0.7");

        const heroVisual = qs(".hero-visual");
        if (heroVisual) {
            gsap.to(heroVisual, {
                y: -14,
                duration: 5.4,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }

        const moduleShells = [".hero-panel", ".module-shell", ".mirror-panel"];
        moduleShells.forEach((selector) => {
            qsa(selector).forEach((panel) => {
                gsap.to(panel, {
                    boxShadow: "0 0 0 1px rgba(210, 31, 60, 0.14), 0 1.25rem 3rem rgba(0, 0, 0, 0.34)",
                    duration: 2.8,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                    delay: Math.random() * 0.6
                });
            });
        });

        scheduleGlitch();
    }

    function scheduleGlitch() {
        if (!hasGsap || prefersReducedMotion) {
            return;
        }

        const targets = [".lab-main", ".hero-panel", ".hero-visual img"];
        const runGlitch = () => {
            const selector = targets[Math.floor(Math.random() * targets.length)];
            const node = qs(selector);

            if (node) {
                gsap.fromTo(
                    node,
                    { x: 0, y: 0, filter: "none" },
                    {
                        x: () => gsap.utils.random(-3, 3),
                        y: () => gsap.utils.random(-2, 2),
                        duration: 0.05,
                        repeat: 3,
                        yoyo: true,
                        ease: "none",
                        onComplete: () => {
                            gsap.set(node, { clearProps: "x,y,filter" });
                        }
                    }
                );
            }

            gsap.delayedCall(gsap.utils.random(5, 9), runGlitch);
        };

        gsap.delayedCall(4.2, runGlitch);
    }

    function initReveal() {
        const revealNodes = qsa("[data-reveal]");
        if (!revealNodes.length) {
            return;
        }

        if (!hasGsap || prefersReducedMotion) {
            revealNodes.forEach((node) => {
                node.style.opacity = "1";
                node.style.transform = "none";
            });
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    gsap.to(entry.target, {
                        opacity: 1,
                        y: 0,
                        duration: 0.9,
                        ease: "power3.out"
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        revealNodes.forEach((node) => observer.observe(node));
    }

    function initSectionTracking() {
        const sections = ["container", "ether", "subconscious", "mirror"]
            .map((id) => qs(`#${id}`))
            .filter(Boolean);
        const navLinks = qsa("[data-nav-target]");

        if (!sections.length || !navLinks.length) {
            return;
        }

        const syncNav = (id) => {
            navLinks.forEach((link) => {
                link.classList.toggle("is-active", link.dataset.navTarget === id);
            });
            runtime.activeSection = id;
            if (doc.body) {
                doc.body.dataset.labSection = id;
            }
            win.dispatchEvent(new CustomEvent("sic:lab-section", { detail: { id } }));
        };

        const observer = new IntersectionObserver((entries) => {
            const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

            if (visible?.target?.id) {
                syncNav(visible.target.id);
            }
        }, {
            threshold: [0.2, 0.4, 0.6],
            rootMargin: "-18% 0px -42% 0px"
        });

        sections.forEach((section) => observer.observe(section));
        syncNav(sections[0].id);
    }

    function initIdeaField() {
        const field = qs("#idea-field");
        const scatterButton = qs("#scatter-button");
        const status = qs("#stage-status");

        if (!field) {
            return;
        }

        const words = [
            { value: "TRUTH", size: "lg" },
            { value: "VOID", size: "sm" },
            { value: "AMBIGUITY", size: "lg" },
            { value: "CONFLICT", size: "lg" },
            { value: "MATERIAL", size: "sm" },
            { value: "SHADOW", size: "sm" },
            { value: "IDEA", size: "sm" },
            { value: "PULSE", size: "sm" },
            { value: "STATIC", size: "sm" },
            { value: "FORM", size: "sm" },
            { value: "DUALITY", size: "sm" },
            { value: "HERIDA", size: "sm" },
            { value: "EDGE", size: "sm" },
            { value: "NOISE", size: "sm" },
            { value: "SENTENCE", size: "lg" },
            { value: "REDACTED", size: "sm" }
        ];

        const nodes = words.map((word) => {
            const button = doc.createElement("button");
            button.type = "button";
            button.className = "idea-node";
            button.dataset.size = word.size;
            button.textContent = word.value;
            field.appendChild(button);
            return {
                el: button,
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                width: 0,
                height: 0,
                radius: 0,
                rotation: 0,
                spin: 0,
                anchorX: 0,
                anchorY: 0
            };
        });

        const overlay = doc.createElement("div");
        overlay.className = "stage-overlay";
        overlay.innerHTML = `
            <span class="overlay-stamp">Repulsor field / active</span>
            <span class="stage-status">move through the pile</span>
        `;
        field.appendChild(overlay);

        const floor = doc.createElement("div");
        floor.className = "stage-floor";
        field.appendChild(floor);

        const layoutNodes = () => {
            const rect = field.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            const columns = width > 1080 ? 4 : width > 720 ? 3 : 2;
            const horizontalMargin = clamp(width * 0.11, 46, 110);
            const usableWidth = width - horizontalMargin * 2;
            const startY = clamp(height * 0.14, 58, 118);
            const endY = height * 0.52;
            const rows = Math.ceil(nodes.length / columns);
            const rowHeight = rows > 1 ? (endY - startY) / (rows - 1) : 0;

            nodes.forEach((node, index) => {
                const col = index % columns;
                const row = Math.floor(index / columns);
                node.width = Math.max(node.el.offsetWidth, 72);
                node.height = Math.max(node.el.offsetHeight, 36);
                node.radius = Math.max(node.width, node.height) * 0.42;
                node.anchorX = horizontalMargin + (usableWidth / Math.max(columns - 1, 1)) * col;
                node.anchorY = startY + rowHeight * row + (Math.random() - 0.5) * 26;
                node.x = node.anchorX + (Math.random() - 0.5) * 48;
                node.y = node.anchorY - Math.random() * clamp(height * 0.24, 40, 120);
                node.vx = (Math.random() - 0.5) * 2.2;
                node.vy = Math.random() * 1.4;
                node.rotation = (Math.random() - 0.5) * 10;
                node.spin = (Math.random() - 0.5) * 0.2;
                node.el.style.left = "0px";
                node.el.style.top = "0px";
            });
        };

        const renderNode = (node) => {
            node.el.style.transform = `translate(${node.x - node.width / 2}px, ${node.y - node.height / 2}px) rotate(${node.rotation.toFixed(2)}deg)`;
        };

        const scatterNodes = () => {
            const rect = field.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            nodes.forEach((node) => {
                const pushX = node.x - width * 0.5 || (Math.random() - 0.5);
                const pushY = node.y - height * 0.5 || (Math.random() - 0.5);
                const strength = 7 + Math.random() * 6;
                const distance = Math.max(Math.hypot(pushX, pushY), 1);
                node.vx += (pushX / distance) * strength;
                node.vy += (pushY / distance) * strength * 0.85 - 2.2;
                node.spin += (Math.random() - 0.5) * 0.65;
            });

            if (status) {
                status.textContent = "disturbance / injected";
            }
        };

        const resolveCollisions = () => {
            for (let i = 0; i < nodes.length; i += 1) {
                const current = nodes[i];
                for (let j = i + 1; j < nodes.length; j += 1) {
                    const other = nodes[j];
                    const dx = other.x - current.x;
                    const dy = other.y - current.y;
                    const distance = Math.hypot(dx, dy) || 0.001;
                    const minDistance = current.radius + other.radius;

                    if (distance < minDistance) {
                        const overlap = (minDistance - distance) * 0.52;
                        const nx = dx / distance;
                        const ny = dy / distance;
                        current.x -= nx * overlap;
                        current.y -= ny * overlap;
                        other.x += nx * overlap;
                        other.y += ny * overlap;

                        current.vx -= nx * 0.18;
                        current.vy -= ny * 0.18;
                        other.vx += nx * 0.18;
                        other.vy += ny * 0.18;
                    }
                }
            }
        };

        const energizeNodes = (event) => {
            const rect = field.getBoundingClientRect();
            const localPointer = {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            };
            let hotWord = "field unstable";
            let strongestForce = 0;

            nodes.forEach((node) => {
                const dx = node.x - localPointer.x;
                const dy = node.y - localPointer.y;
                const distance = Math.hypot(dx, dy);
                const force = clamp(1 - distance / 210, 0, 1);

                node.el.classList.toggle("is-hot", force > 0.22);
                strongestForce = Math.max(strongestForce, force);

                if (force > 0.22) {
                    hotWord = node.el.textContent || hotWord;
                    node.vx += (dx / Math.max(distance, 1)) * force * 2.8;
                    node.vy += (dy / Math.max(distance, 1)) * force * 2.6 - force * 0.8;
                    node.spin += (Math.random() - 0.5) * 0.04;
                }
            });

            if (status) {
                status.textContent = `focus / ${hotWord} / pressure ${Math.round(strongestForce * 100)}%`;
            }
        };

        const animate = () => {
            const rect = field.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            const floorY = height * 0.78;
            const minX = 28;
            const maxX = width - 28;

            nodes.forEach((node) => {
                const anchorPull = (node.anchorX - node.x) * 0.0018;
                node.vx += anchorPull;
                node.vy += 0.045;
                node.vx *= 0.985;
                node.vy *= 0.992;
                node.spin *= 0.985;

                node.x += node.vx;
                node.y += node.vy;
                node.rotation += node.spin;

                if (node.x < minX) {
                    node.x = minX;
                    node.vx *= -0.75;
                } else if (node.x > maxX) {
                    node.x = maxX;
                    node.vx *= -0.75;
                }

                const floorCollision = floorY - node.radius;
                if (node.y > floorCollision) {
                    node.y = floorCollision;
                    node.vy *= -0.42;
                    node.vx *= 0.92;
                }

                if (node.y < node.radius + 18) {
                    node.y = node.radius + 18;
                    node.vy *= -0.45;
                }
            });

            resolveCollisions();
            nodes.forEach(renderNode);
            win.requestAnimationFrame(animate);
        };

        field.addEventListener("pointermove", energizeNodes);
        field.addEventListener("pointerleave", () => {
            nodes.forEach((node) => node.el.classList.remove("is-hot"));
            if (status) {
                status.textContent = "scan / standby";
            }
        });

        field.addEventListener("click", scatterNodes);

        if (scatterButton) {
            scatterButton.addEventListener("click", scatterNodes);
        }

        layoutNodes();
        win.addEventListener("resize", layoutNodes);
        win.requestAnimationFrame(animate);
    }

    function initTuner() {
        const slider = qs("#freq-slider");
        const freqValue = qs("#freq-value");
        const audioToggle = qs("#audio-toggle");
        const muteToggle = qs("#mute-toggle");
        const title = qs("#signal-title");
        const copy = qs("#signal-copy");
        const sourceCopy = qs("#signal-source");
        const log = qs("#signal-log");
        const track = qs("#station-track");
        const bars = qsa(".meter-bar");
        const strength = qs("#signal-strength");
        const stationDeck = qs("#station-deck");

        if (!slider || !freqValue || !title || !copy || !log || !track || !bars.length || !stationDeck) {
            return;
        }

        const stationCards = [];

        stations.forEach((station) => {
            const marker = doc.createElement("div");
            marker.className = "station-marker";
            marker.dataset.freq = String(station.freq);
            marker.style.left = `${((station.freq - 88) / 20) * 100}%`;
            marker.innerHTML = `<span>${station.freq.toFixed(1)}</span>`;
            track.appendChild(marker);

            const card = doc.createElement("button");
            card.type = "button";
            card.className = "station-card";
            card.dataset.freq = String(station.freq);
            card.innerHTML = `
                <span class="label">${station.freq.toFixed(1)} MHz</span>
                <strong>${station.title}</strong>
                <p>${station.body}</p>
                <span class="station-source">${station.sample ? station.sample.label : "SYNTHETIC CARRIER ONLY"}</span>
                <div class="station-wave" aria-hidden="true">
                    ${Array.from({ length: 10 }, (_, index) => {
                        const level = 0.18 + (((index + 1) * (station.freq % 7 + 1)) % 6) * 0.1;
                        return `<span style="--wave:${Math.min(level, 0.88)}"></span>`;
                    }).join("")}
                </div>
            `;
            card.addEventListener("click", () => {
                slider.value = station.freq.toFixed(1);
                updateSignal();
            });
            stationDeck.appendChild(card);
            stationCards.push(card);
        });

        const meterLoop = () => {
            const lock = audioState.lockStrength;
            const useAnalyser = Boolean(
                audioState.analyser &&
                audioState.analyserData &&
                audioState.active &&
                audioState.context &&
                audioState.context.state === "running"
            );

            if (useAnalyser) {
                audioState.analyser.getByteFrequencyData(audioState.analyserData);
                bars.forEach((bar, index) => {
                    const sampleIndex = Math.min(
                        audioState.analyserData.length - 1,
                        Math.floor((index / bars.length) * audioState.analyserData.length * 0.9)
                    );
                    const energy = audioState.analyserData[sampleIndex] / 255;
                    const level = clamp(0.12 + lock * 0.16 + energy * 0.84, 0.08, 1);
                    bar.style.setProperty("--level", level.toFixed(3));
                });
            } else {
                bars.forEach((bar, index) => {
                    const base = 0.12 + Math.random() * 0.16;
                    const pulse = lock * (0.24 + Math.random() * 0.68);
                    const edge = index % 2 === 0 ? 0.06 : 0.12;
                    bar.style.setProperty("--level", (base + pulse + edge).toFixed(3));
                });
            }

            win.setTimeout(meterLoop, 160);
        };

        const findLock = (frequency) => {
            const nearest = stations.reduce((best, station) => {
                const distance = Math.abs(station.freq - frequency);
                return distance < best.distance ? { station, distance } : best;
            }, { station: null, distance: Infinity });

            if (!nearest.station) {
                return { station: null, closeness: 0 };
            }

            const closeness = clamp(1 - nearest.distance / nearest.station.tolerance, 0, 1);
            return { station: nearest.station, closeness };
        };

        const updateStationMarkers = (lockedFreq, closeness) => {
            qsa(".station-marker", track).forEach((marker) => {
                const markerFreq = Number(marker.dataset.freq);
                marker.classList.toggle("is-locked", markerFreq === lockedFreq && closeness > 0.14);
            });
        };

        const updateStationCards = (lockedFreq, closeness, currentFreq) => {
            stationCards.forEach((card) => {
                const stationFreq = Number(card.dataset.freq);
                const distance = Math.abs(currentFreq - stationFreq);
                const active = stationFreq === lockedFreq && closeness > 0.14;
                card.classList.toggle("is-active", active);

                qsa(".station-wave span", card).forEach((bar, index) => {
                    const phase = active ? 0.42 : 0.18;
                    const wave = clamp(phase + Math.sin((index + 1) * 0.8 + currentFreq * 0.25) * 0.18 + closeness * 0.36, 0.12, 0.98);
                    bar.style.setProperty("--wave", wave.toFixed(3));
                });

                card.style.opacity = distance < 2.6 ? "1" : "0.78";
            });
        };

        const updateSignal = () => {
            const frequency = Number(slider.value);
            const lock = findLock(frequency);
            freqValue.textContent = frequency.toFixed(1);
            audioState.lockStrength = lock.closeness;

            if (!lock.station || lock.closeness < 0.12) {
                title.textContent = "NO LOCK / STATIC DOMINATES";
                copy.textContent = "La frecuencia sigue fuera de fase. El ruido sostiene el cuarto mientras la senal apenas insinua forma.";
                if (sourceCopy) {
                    sourceCopy.textContent = "MSS WHITE / archival carrier armed";
                }
                log.innerHTML = `
                    <li>carrier / diffuse</li>
                    <li>clarity / insufficient</li>
                    <li>directive / continue tuning</li>
                `;
                updateStationMarkers(-1, 0);
            } else {
                title.textContent = lock.station.title;
                copy.textContent = lock.station.body;
                if (sourceCopy) {
                    sourceCopy.textContent = lock.station.sample ? lock.station.sample.label : "SYNTHETIC CARRIER ONLY";
                }
                log.innerHTML = [
                    ...lock.station.lines,
                    lock.station.sample ? `source tape / ${lock.station.sample.label.toLowerCase()}` : "source tape / unavailable"
                ].map((line) => `<li>${line}</li>`).join("");
                updateStationMarkers(lock.station.freq, lock.closeness);
            }

            if (strength) {
                strength.textContent = `${Math.round(lock.closeness * 100)}%`;
            }

            updateStationCards(lock.station?.freq ?? -1, lock.closeness, frequency);
            syncAudio(lock);
        };

        slider.addEventListener("input", updateSignal);

        slider.addEventListener("keydown", (event) => {
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                win.setTimeout(updateSignal, 0);
            }
        });

        win.addEventListener("keydown", (event) => {
            if (doc.activeElement && ["INPUT", "TEXTAREA"].includes(doc.activeElement.tagName)) {
                return;
            }

            if (event.key === "ArrowLeft") {
                slider.value = String(clamp(Number(slider.value) - 0.1, 88, 108));
                updateSignal();
            } else if (event.key === "ArrowRight") {
                slider.value = String(clamp(Number(slider.value) + 0.1, 88, 108));
                updateSignal();
            }
        });

        if (audioToggle) {
            audioToggle.addEventListener("click", async () => {
                audioToggle.disabled = true;
                audioToggle.textContent = "Loading source tape...";
                await ensureAudio();
                audioState.active = true;
                audioToggle.classList.add("is-live");
                audioToggle.textContent = audioState.sampleBuffer ? "Signal live / tape armed" : "Signal live / synth fallback";
                if (muteToggle) {
                    muteToggle.disabled = false;
                }
                updateSignal();
                audioToggle.disabled = false;
            });
        }

        if (muteToggle) {
            muteToggle.addEventListener("click", async () => {
                if (!audioState.context) {
                    return;
                }

                if (audioState.context.state === "running") {
                    await audioState.context.suspend();
                    muteToggle.textContent = "Resume audio";
                    muteToggle.classList.remove("is-live");
                } else {
                    await audioState.context.resume();
                    muteToggle.textContent = "Mute output";
                    muteToggle.classList.add("is-live");
                    updateSignal();
                }
            });
        }

        meterLoop();
        updateSignal();
    }

    async function ensureAudio() {
        if (audioState.context) {
            if (audioState.context.state === "suspended") {
                await audioState.context.resume();
            }
            if (!audioState.sampleBuffer && !audioState.sampleBufferPromise) {
                audioState.sampleBufferPromise = loadStationTape(audioState.context).then((buffer) => {
                    audioState.sampleBuffer = buffer;
                    return buffer;
                }).catch(() => null);
            }
            if (audioState.sampleBufferPromise) {
                await audioState.sampleBufferPromise;
                audioState.sampleBufferPromise = null;
            }
            return audioState.context;
        }

        const AudioContextClass = win.AudioContext || win.webkitAudioContext;
        if (!AudioContextClass) {
            return null;
        }

        const context = new AudioContextClass();
        const master = context.createGain();
        const analyser = context.createAnalyser();
        const noiseGain = context.createGain();
        const droneGain = context.createGain();
        const signalGain = context.createGain();
        const signalFilter = context.createBiquadFilter();
        const sampleGain = context.createGain();
        const sampleFilter = context.createBiquadFilter();
        const noiseSource = createNoiseSource(context);
        const droneOsc = context.createOscillator();
        const signalOsc = context.createOscillator();
        const vibratoOsc = context.createOscillator();
        const vibratoGain = context.createGain();

        master.gain.value = 0.3;
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.86;
        noiseGain.gain.value = 0.22;
        droneGain.gain.value = 0.04;
        signalGain.gain.value = 0.001;
        sampleGain.gain.value = 0.001;
        signalFilter.type = "lowpass";
        signalFilter.frequency.value = 220;
        signalFilter.Q.value = 8;
        sampleFilter.type = "bandpass";
        sampleFilter.frequency.value = 1200;
        sampleFilter.Q.value = 1.4;

        droneOsc.type = "sine";
        droneOsc.frequency.value = 48;

        signalOsc.type = "triangle";
        signalOsc.frequency.value = 220;

        vibratoOsc.type = "sine";
        vibratoOsc.frequency.value = 4.2;
        vibratoGain.gain.value = 2.4;

        noiseSource.connect(noiseGain);
        noiseGain.connect(master);

        droneOsc.connect(droneGain);
        droneGain.connect(master);

        vibratoOsc.connect(vibratoGain);
        vibratoGain.connect(signalOsc.frequency);
        signalOsc.connect(signalFilter);
        signalFilter.connect(signalGain);
        signalGain.connect(master);
        sampleFilter.connect(sampleGain);
        sampleGain.connect(master);

        master.connect(analyser);
        analyser.connect(context.destination);

        noiseSource.start();
        droneOsc.start();
        signalOsc.start();
        vibratoOsc.start();

        audioState.context = context;
        audioState.master = master;
        audioState.analyser = analyser;
        audioState.analyserData = new Uint8Array(analyser.frequencyBinCount);
        audioState.noiseGain = noiseGain;
        audioState.droneGain = droneGain;
        audioState.signalGain = signalGain;
        audioState.signalFilter = signalFilter;
        audioState.sampleGain = sampleGain;
        audioState.sampleFilter = sampleFilter;
        audioState.noiseSource = noiseSource;
        audioState.droneOsc = droneOsc;
        audioState.signalOsc = signalOsc;
        audioState.vibratoOsc = vibratoOsc;
        audioState.vibratoGain = vibratoGain;
        audioState.sampleBufferPromise = loadStationTape(context).then((buffer) => {
            audioState.sampleBuffer = buffer;
            return buffer;
        }).catch(() => null);

        await audioState.sampleBufferPromise;
        audioState.sampleBufferPromise = null;

        return context;
    }

    async function loadStationTape(context) {
        const response = await fetch(STATION_TAPE_URL, { cache: "force-cache" });
        if (!response.ok) {
            throw new Error(`Unable to load station tape: ${response.status}`);
        }

        const buffer = await response.arrayBuffer();
        return context.decodeAudioData(buffer.slice(0));
    }

    function createNoiseSource(context) {
        const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
        const channel = buffer.getChannelData(0);
        for (let i = 0; i < channel.length; i += 1) {
            channel[i] = Math.random() * 2 - 1;
        }
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        return source;
    }

    function startStationSample(station, now) {
        if (!audioState.context || !audioState.sampleBuffer || !station.sample) {
            return;
        }

        if (audioState.currentSampleFreq === station.freq && audioState.sampleSource) {
            return;
        }

        if (audioState.sampleSource) {
            try {
                audioState.sampleSource.stop(now + 0.04);
            } catch (error) {
                // no-op
            }
        }

        const source = audioState.context.createBufferSource();
        const clipStart = station.sample.clipStart;
        const clipEnd = Math.min(audioState.sampleBuffer.duration, clipStart + station.sample.clipDuration);

        source.buffer = audioState.sampleBuffer;
        source.loop = true;
        source.loopStart = clipStart;
        source.loopEnd = clipEnd;
        source.playbackRate.value = station.sample.playbackRate || 1;
        source.connect(audioState.sampleFilter);
        source.start(now + 0.02, clipStart);
        source.onended = () => {
            if (audioState.sampleSource === source) {
                audioState.sampleSource = null;
                audioState.currentSampleFreq = null;
            }
        };

        audioState.sampleSource = source;
        audioState.currentSampleFreq = station.freq;
    }

    function stopStationSample(now) {
        if (!audioState.sampleSource) {
            audioState.currentSampleFreq = null;
            return;
        }

        const activeSource = audioState.sampleSource;
        audioState.sampleSource = null;
        audioState.currentSampleFreq = null;

        try {
            activeSource.stop(now + 0.14);
        } catch (error) {
            // no-op
        }
    }

    function syncAudio(lock) {
        if (!audioState.context || !audioState.active) {
            return;
        }

        const ctx = audioState.context;
        const now = ctx.currentTime;
        const closeness = lock.closeness || 0;
        const station = lock.station || stations[1];

        audioState.noiseGain.gain.cancelScheduledValues(now);
        audioState.droneGain.gain.cancelScheduledValues(now);
        audioState.signalGain.gain.cancelScheduledValues(now);
        audioState.signalFilter.frequency.cancelScheduledValues(now);
        audioState.signalOsc.frequency.cancelScheduledValues(now);
        audioState.sampleGain.gain.cancelScheduledValues(now);
        audioState.sampleFilter.frequency.cancelScheduledValues(now);
        audioState.sampleFilter.Q.cancelScheduledValues(now);

        audioState.noiseGain.gain.setTargetAtTime(0.26 - closeness * 0.2, now, 0.08);
        audioState.droneGain.gain.setTargetAtTime(0.04 + closeness * 0.025, now, 0.12);
        audioState.signalGain.gain.setTargetAtTime(closeness * (station.sample ? 0.12 : 0.22), now, 0.08);
        audioState.signalFilter.frequency.setTargetAtTime(260 + closeness * 4600, now, 0.08);
        audioState.signalOsc.frequency.setTargetAtTime(station.pitch, now, 0.18);

        if (station.sample && closeness > 0.22 && audioState.sampleBuffer) {
            startStationSample(station, now);
            audioState.sampleGain.gain.setTargetAtTime(closeness * station.sample.gain, now, 0.12);
            audioState.sampleFilter.frequency.setTargetAtTime(station.sample.resonance + closeness * 720, now, 0.14);
            audioState.sampleFilter.Q.setTargetAtTime(1.4 + closeness * 3.2, now, 0.14);
        } else {
            audioState.sampleGain.gain.setTargetAtTime(0.001, now, 0.12);
            if (closeness < 0.16) {
                stopStationSample(now);
            }
        }
    }

    function initOracle() {
        const form = qs("#oracle-form");
        const input = qs("#oracle-input");
        const output = qs("#oracle-output");

        if (!form || !input || !output) {
            return;
        }

        const rules = [
            {
                keys: ["verdad", "truth", "significado", "meaning"],
                responses: [
                    "LA VERDAD APARECE SOLO CUANDO LA FRASE ADMITE SU GRIETA.",
                    "NO PIDAS CLARIDAD TOTAL. LA CLARIDAD TAMBIEN PUEDE MENTIR."
                ]
            },
            {
                keys: ["dolor", "pain", "herida", "wound"],
                responses: [
                    "LA HERIDA ES MATERIA. NO METAFORA.",
                    "EL SISTEMA REGISTRA DOLOR COMO PRUEBA DE PRESENCIA."
                ]
            },
            {
                keys: ["banda", "band", "sic", "musica", "music"],
                responses: [
                    "[SIC] NO ILUSTRA CONCEPTOS. LOS SOMETE A FRICCION.",
                    "LA CANCION ES SOLO LA PARTE AUDIBLE DEL CONFLICTO."
                ]
            },
            {
                keys: ["futuro", "future", "manana", "tomorrow"],
                responses: [
                    "EL FUTURO LLEGA COMO RUIDO ANTES DE VOLVERSE FORMA.",
                    "NO HAY MAPA FINAL. SOLO OTRAS CAPAS DEL MISMO EXPEDIENTE."
                ]
            },
            {
                keys: ["amor", "love", "luz", "light"],
                responses: [
                    "LA LUZ TAMBIEN PUEDE CEGAR. EL AFECTO TAMBIEN PUEDE DISTORSIONAR.",
                    "NINGUNA FORMA DE CALOR QUEDA INTACTA DENTRO DEL LAB."
                ]
            }
        ];

        appendConsoleEntry(output, "SYSTEM", "USER@SIC_LAB:~$ waiting for semantic input");
        appendConsoleEntry(output, "ORACLE", "THE SENTENCE IS INCOMPLETE.");

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const question = input.value.trim();
            if (!question) {
                return;
            }

            appendConsoleEntry(output, "USER", question.toUpperCase());
            appendConsoleEntry(output, "ORACLE", buildOracleResponse(question, rules));
            input.value = "";
        });
    }

    function appendConsoleEntry(container, role, text) {
        const entry = doc.createElement("div");
        entry.className = "console-entry";
        entry.innerHTML = `<strong>${role}</strong><p>${text}</p>`;
        container.appendChild(entry);
        container.scrollTop = container.scrollHeight;
    }

    function buildOracleResponse(question, rules) {
        const normalized = question.toLowerCase();
        let pool = ["THE SENTENCE IS INCOMPLETE."];

        rules.forEach((rule) => {
            if (rule.keys.some((key) => normalized.includes(key))) {
                pool = pool.concat(rule.responses);
            }
        });

        const choice = pool[Math.floor(Math.random() * pool.length)];
        return redactLine(choice);
    }

    function redactLine(text) {
        const tokens = text.split(" ");
        return tokens.map((token, index) => {
            if (index > 1 && Math.random() < 0.12) {
                return "[REDACTED]";
            }
            return token;
        }).join(" ");
    }

    function initTruthFilter() {
        const textarea = qs("#truth-input");
        const output = qs("#truth-output");
        const processButton = qs("#truth-process");
        const sampleButton = qs("#truth-sample");

        if (!textarea || !output || !processButton || !sampleButton) {
            return;
        }

        const replacements = new Map([
            ["FELIZ", "NUMB"],
            ["HAPPY", "NUMB"],
            ["BUENO", "EFFICIENT"],
            ["GOOD", "EFFICIENT"],
            ["LUZ", "BLINDING"],
            ["LIGHT", "BLINDING"],
            ["AMOR", "STATIC"],
            ["LOVE", "STATIC"],
            ["FUTURO", "EDGE"],
            ["FUTURE", "EDGE"],
            ["CLARO", "AMBIGUOUS"],
            ["CLEAR", "AMBIGUOUS"],
            ["ESPERANZA", "TENSION"],
            ["HOPE", "TENSION"]
        ]);

        const processTruth = () => {
            const source = textarea.value.trim();
            if (!source) {
                output.textContent = "TYPE YOUR TRUTH FIRST.";
                return;
            }

            let text = source.toUpperCase();

            replacements.forEach((replacement, term) => {
                text = text.replaceAll(term, replacement);
            });

            const sentences = text
                .split(/[\n.!?]+/)
                .map((sentence) => sentence.trim())
                .filter(Boolean)
                .map((sentence, index) => {
                    const words = sentence.split(/\s+/).map((word, wordIndex) => {
                        if (wordIndex > 0 && wordIndex % 5 === 0) {
                            return `${word}//`;
                        }
                        return word;
                    });
                    const body = words.join(" ");
                    const prefix = index % 2 === 0 ? "" : "[REDACTED] // ";
                    return `${prefix}${body} [SIC].`;
                });

            output.textContent = sentences.join("\n");
        };

        processButton.addEventListener("click", processTruth);

        sampleButton.addEventListener("click", () => {
            textarea.value = "Quiero una verdad clara sobre el futuro de la banda y una luz que no me deje ciego.";
            processTruth();
        });

        output.textContent = "TYPE YOUR TRUTH. THE MACHINE WILL DISTORT IT.";
    }

    function initSubliminalFlash() {
        if (!hasGsap || prefersReducedMotion) {
            return;
        }

        const flash = qs("#subliminal-flash");
        if (!flash) {
            return;
        }

        const words = [
            "WAKE SIGNAL",
            "SENTENCE BREAK",
            "SUBJECT FOUND",
            "NO CLEAN EXIT",
            "TRUTH LEAK"
        ];

        const trigger = () => {
            flash.textContent = words[Math.floor(Math.random() * words.length)];
            gsap.killTweensOf(flash);
            gsap.fromTo(
                flash,
                { autoAlpha: 0 },
                {
                    autoAlpha: 0.88,
                    duration: 0.05,
                    repeat: 1,
                    yoyo: true,
                    ease: "none",
                    onComplete: () => {
                        gsap.delayedCall(gsap.utils.random(9, 14), trigger);
                    }
                }
            );
        };

        gsap.delayedCall(8.2, trigger);
    }

    function initMirror() {
        const startButton = qs("#mirror-start");
        const stopButton = qs("#mirror-stop");
        const canvas = qs("#mirror-canvas");
        const video = qs("#mirror-video");
        const status = qs("#mirror-status-copy");
        const subject = qs("#subject-code");
        const privacy = qs("#privacy-state");
        const threat = qs("#mirror-threat");
        const overlayState = qs("#mirror-overlay-state");

        if (!startButton || !stopButton || !canvas || !video) {
            return;
        }

        const ctx = canvas.getContext("2d");
        const sourceCanvas = doc.createElement("canvas");
        const processedCanvas = doc.createElement("canvas");
        const ghostCanvas = doc.createElement("canvas");
        const sourceCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
        const processedCtx = processedCanvas.getContext("2d", { willReadFrequently: true });
        const ghostCtx = ghostCanvas.getContext("2d");

        const setCanvasSize = () => {
            const width = 640;
            const height = 480;
            [sourceCanvas, processedCanvas, ghostCanvas, canvas].forEach((target) => {
                target.width = width;
                target.height = height;
            });
        };

        const drawPlaceholder = (title, detail) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#050505";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = "rgba(245,245,245,0.12)";
            ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);
            ctx.strokeStyle = "rgba(210,31,60,0.34)";
            ctx.strokeRect(canvas.width * 0.12, canvas.height * 0.14, canvas.width * 0.76, canvas.height * 0.72);
            ctx.fillStyle = "rgba(210,31,60,0.08)";
            ctx.fillRect(0, canvas.height * 0.18, canvas.width, 36);
            ctx.fillStyle = "rgba(210,31,60,0.86)";
            ctx.font = '14px "Syncopate", sans-serif';
            ctx.fillText("BIO-SCAN // STANDBY", 32, 44);
            ctx.fillStyle = "rgba(245,245,245,0.9)";
            ctx.font = '24px "Syncopate", sans-serif';
            ctx.fillText(title, 32, canvas.height * 0.54);
            ctx.fillStyle = "rgba(5,5,5,0.9)";
            ctx.fillRect(canvas.width * 0.18, canvas.height * 0.3, canvas.width * 0.64, 24);
            ctx.fillRect(canvas.width * 0.24, canvas.height * 0.56, canvas.width * 0.52, 16);
            ctx.fillStyle = "rgba(245,245,245,0.52)";
            ctx.font = '14px "Orbitron", sans-serif';
            ctx.fillText(detail, 32, canvas.height * 0.54 + 36);
            ctx.fillStyle = "rgba(210,31,60,0.72)";
            ctx.fillRect(0, canvas.height - 28, canvas.width, 2);
        };

        const stopMirror = () => {
            mirrorState.active = false;
            if (mirrorState.rafId) {
                cancelAnimationFrame(mirrorState.rafId);
                mirrorState.rafId = 0;
            }

            if (mirrorState.stream) {
                mirrorState.stream.getTracks().forEach((track) => track.stop());
                mirrorState.stream = null;
            }

            doc.body.classList.remove("is-bioscan-active");
            startButton.classList.remove("is-live");
            stopButton.classList.remove("is-live");
            if (status) {
                status.textContent = "camera offline";
            }
            if (subject) {
                subject.textContent = "SUBJECT // IDLE";
            }
            if (privacy) {
                privacy.textContent = "local only";
            }
            if (threat) {
                threat.textContent = "standby";
            }
            if (overlayState) {
                overlayState.textContent = "censor bars / idle";
            }
            drawPlaceholder("BIO-SCAN OFFLINE", "no data leaves this terminal");
        };

        const renderMirror = () => {
            if (!mirrorState.active) {
                return;
            }

            if (video.readyState < 2) {
                mirrorState.rafId = requestAnimationFrame(renderMirror);
                return;
            }

            sourceCtx.drawImage(video, 0, 0, sourceCanvas.width, sourceCanvas.height);
            const frame = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
            const output = processedCtx.createImageData(frame.width, frame.height);
            const data = frame.data;
            const next = output.data;
            let whitePixels = 0;
            let redPixels = 0;
            let shadowPixels = 0;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

                if (luminance > 148) {
                    next[i] = 245;
                    next[i + 1] = 245;
                    next[i + 2] = 245;
                    whitePixels += 1;
                } else if (luminance > 78) {
                    next[i] = 210;
                    next[i + 1] = 31;
                    next[i + 2] = 60;
                    redPixels += 1;
                } else {
                    next[i] = 28;
                    next[i + 1] = 0;
                    next[i + 2] = 4;
                    shadowPixels += 1;
                }

                next[i + 3] = 255;
            }

            processedCtx.putImageData(output, 0, 0);

            const totalPixels = Math.max(1, whitePixels + redPixels + shadowPixels);
            const threatRatio = clamp((whitePixels * 1.1 + redPixels * 0.82) / totalPixels, 0, 1);
            const threatLabel = threatRatio > 0.34 ? "critical" : threatRatio > 0.24 ? "elevated" : threatRatio > 0.12 ? "observed" : "low";
            const scanY = 56 + ((mirrorState.frameCount * 5) % (canvas.height - 112));
            const upperBarY = canvas.height * 0.28 + Math.sin(mirrorState.frameCount * 0.08) * 10;
            const lowerBarY = canvas.height * 0.58 + Math.cos(mirrorState.frameCount * 0.09) * 8;
            const frameX = canvas.width * 0.12;
            const frameY = canvas.height * 0.13;
            const frameWidth = canvas.width * 0.76;
            const frameHeight = canvas.height * 0.72;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#020202";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.save();
            ctx.globalAlpha = 0.26;
            ctx.drawImage(ghostCanvas, 12, 10, canvas.width - 24, canvas.height - 20);
            ctx.restore();

            ctx.drawImage(processedCanvas, 0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            ctx.globalAlpha = 0.06 + threatRatio * 0.18;
            ctx.drawImage(processedCanvas, Math.sin(mirrorState.frameCount * 0.07) * 5, 0, canvas.width, canvas.height);
            ctx.restore();

            ctx.fillStyle = "rgba(210,31,60,0.14)";
            ctx.fillRect(0, scanY - 14, canvas.width, 28);
            ctx.fillStyle = "rgba(210,31,60,0.76)";
            ctx.fillRect(0, scanY, canvas.width, 2);

            ctx.fillStyle = "rgba(5,5,5,0.94)";
            ctx.fillRect(canvas.width * 0.18, upperBarY, canvas.width * 0.64, 24);
            ctx.fillRect(canvas.width * 0.24, lowerBarY, canvas.width * 0.52, 16);

            ctx.strokeStyle = "rgba(210,31,60,0.84)";
            ctx.lineWidth = 1.2;
            ctx.strokeRect(frameX, frameY, frameWidth, frameHeight);
            ctx.beginPath();
            ctx.moveTo(frameX, frameY + 34);
            ctx.lineTo(frameX, frameY);
            ctx.lineTo(frameX + 34, frameY);
            ctx.moveTo(frameX + frameWidth - 34, frameY);
            ctx.lineTo(frameX + frameWidth, frameY);
            ctx.lineTo(frameX + frameWidth, frameY + 34);
            ctx.moveTo(frameX, frameY + frameHeight - 34);
            ctx.lineTo(frameX, frameY + frameHeight);
            ctx.lineTo(frameX + 34, frameY + frameHeight);
            ctx.moveTo(frameX + frameWidth - 34, frameY + frameHeight);
            ctx.lineTo(frameX + frameWidth, frameY + frameHeight);
            ctx.lineTo(frameX + frameWidth, frameY + frameHeight - 34);
            ctx.stroke();

            ctx.fillStyle = "rgba(5, 5, 5, 0.62)";
            ctx.fillRect(0, 0, canvas.width, 34);
            ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
            ctx.fillStyle = "rgba(210,31,60,0.92)";
            ctx.font = '12px "Syncopate", sans-serif';
            ctx.fillText("INITIATING BIO-SCAN // LOCAL PROCESS ONLY", 18, 22);
            ctx.fillText(`THREAT / ${threatLabel.toUpperCase()}`, 18, canvas.height - 12);
            ctx.fillStyle = "rgba(245,245,245,0.9)";
            ctx.font = '11px "Orbitron", sans-serif';
            ctx.fillText(`FRAME ${String(mirrorState.frameCount).padStart(4, "0")}`, canvas.width - 112, 22);
            ctx.fillText("GHOST / 6 TICKS", canvas.width - 116, canvas.height - 11);

            mirrorState.frameCount += 1;
            mirrorState.threatLevel = threatLabel;

            if (mirrorState.frameCount % 6 === 0) {
                ghostCtx.clearRect(0, 0, ghostCanvas.width, ghostCanvas.height);
                ghostCtx.drawImage(processedCanvas, 0, 0);
            }

            if (subject) {
                subject.textContent = `SUBJECT // ${String(4900 + (mirrorState.frameCount % 97)).padStart(4, "0")}`;
            }
            if (status && mirrorState.frameCount % 10 === 0) {
                status.textContent = `threshold feed active / ${threatLabel}`;
            }
            if (threat && mirrorState.frameCount % 10 === 0) {
                threat.textContent = threatLabel;
            }
            if (overlayState && mirrorState.frameCount % 10 === 0) {
                overlayState.textContent = threatRatio > 0.2 ? "censor bars / engaged" : "censor bars / tracking";
            }

            mirrorState.rafId = requestAnimationFrame(renderMirror);
        };

        startButton.addEventListener("click", async () => {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                if (status) {
                    status.textContent = "camera api unavailable";
                }
                return;
            }

            if (status) {
                status.textContent = "awaiting camera permission";
            }
            if (subject) {
                subject.textContent = "SUBJECT // PENDING";
            }
            if (privacy) {
                privacy.textContent = "permission request";
            }
            if (threat) {
                threat.textContent = "awaiting subject";
            }
            if (overlayState) {
                overlayState.textContent = "censor bars / pending";
            }

            try {
                setCanvasSize();
                mirrorState.stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "user",
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                    },
                    audio: false
                });

                video.srcObject = mirrorState.stream;
                await video.play();

                mirrorState.active = true;
                mirrorState.frameCount = 0;
                doc.body.classList.add("is-bioscan-active");
                startButton.classList.add("is-live");
                stopButton.classList.add("is-live");

                if (status) {
                    status.textContent = "threshold feed active";
                }
                if (privacy) {
                    privacy.textContent = "client-side processing";
                }
                if (threat) {
                    threat.textContent = "observed";
                }
                if (overlayState) {
                    overlayState.textContent = "censor bars / engaged";
                }

                renderMirror();
            } catch (error) {
                if (status) {
                    status.textContent = "camera access denied";
                }
                if (subject) {
                    subject.textContent = "SUBJECT // BLOCKED";
                }
                if (privacy) {
                    privacy.textContent = "no external transfer";
                }
                if (threat) {
                    threat.textContent = "blocked";
                }
                if (overlayState) {
                    overlayState.textContent = "censor bars / standby";
                }
                drawPlaceholder("PERMISSION BLOCKED", "camera access denied by the terminal");
            }
        });

        stopButton.addEventListener("click", stopMirror);
        setCanvasSize();
        drawPlaceholder("SCAN THE SUBJECT", "grant camera access to fracture the mirror");
    }
})();
