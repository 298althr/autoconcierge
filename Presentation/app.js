const SCENES = {
    "011": { swipe: { up: "021" }, insight: "Swipe up to discover" },
    "021": { swipe: { right: "022" }, insight: "Swipe right for details" },
    "022": { hotspots: [{ x: 42, y: 58, w: 15, h: 20, target: "031" }], insight: "Activate the switch" },
    "031": { swipe: { left: "032" }, insight: "Swipe left to rotate" },
    "032": { swipe: { left: "033", right: "031" }, insight: "Swipe left and right" },
    "033": { swipe: { right: "032", up: "041" }, insight: "Swipe up to step closer" },
    "041": { hotspots: [{ x: 55, y: 44, w: 25, h: 15, video: "042.mp4", next: "051" }], insight: "Open the door" },
    "051": { swipe: { left: "052" }, insight: "Swipe left to sit inside" },
    "052": { hotspots: [{ x: 15, y: 40, w: 50, h: 45, target: "061" }], insight: "Take the wheel" },
    "061": { duration: 3000, next: "071", insight: "Preparing systems..." },
    "071": { doubleTap: "072", insight: "Double tap to start" },
    "072": {
        hotspots: [{ x: 35, y: 76, w: 30, h: 20, target: "081", circle: true, audioOnHit: "082.MP3", delay: 1000 }],
        insight: "Press Start"
    },
    "081": { duration: 5000, next: "091", insight: "Engine engaged" },
    "091": { clickAnywhere: { video: "100.mp4", next: "rx350", showCTA: false }, insight: "Tap to launch" },
    "rx350": { showDetails: true, insight: "Explore the RX350" }
};

let currentSceneId = "011";
let isAnimating = false;
let lastTapTime = 0;
let interactionReady = false;

const layers = {
    A: document.getElementById('layer-a'),
    B: document.getElementById('layer-b')
};
const vid = document.getElementById('fullscreen-video');
const ovl = document.getElementById('interaction-overlay');
const audio = document.getElementById('persistent-audio');
const ambientAudio = document.getElementById('ambient-audio');
const popup = document.getElementById('cta-popup');
const insightEl = document.getElementById('action-insight');

function init() {
    renderScene("011");
    attachEvents();
}

function renderScene(id) {
    const scene = SCENES[id];
    if (!scene) return;

    currentSceneId = id;
    const active = layers.A.classList.contains('active') ? layers.A : layers.B;
    const next = active === layers.A ? layers.B : layers.A;

    // 1. Prepare next layer
    next.classList.remove('active', 'leaving');
    next.style.backgroundImage = `url('assets/${id}.png')`;

    // Force reflow
    void next.offsetWidth;

    // 2. Set current active to 'leaving' (underlay)
    active.classList.add('leaving');
    active.classList.remove('active');

    // 3. Set incoming to 'active' (fades in on top)
    next.classList.add('active');

    // 4. Update Insights
    insightEl.classList.remove('visible');
    setTimeout(() => {
        insightEl.textContent = scene.insight || "";
        insightEl.classList.add('visible');
    }, 500);

    // 5. Cleanup
    setTimeout(() => {
        active.classList.remove('leaving');
        active.style.backgroundImage = 'none';
        isAnimating = false;

        // Auto-transitions
        if (scene.duration) {
            setTimeout(() => {
                if (currentSceneId === id) move(scene.next);
            }, scene.duration);
        }

    }, 1100);

    renderHotspots(scene);
}

function renderHotspots(scene) {
    ovl.innerHTML = '';
    if (!scene.hotspots) return;

    scene.hotspots.forEach(s => {
        const h = document.createElement('div');
        h.className = "hotspot" + (s.circle ? " circle" : "");
        h.style.cssText = `left:${s.x}%; top:${s.y}%; width:${s.w}%; height:${s.h}%; pointer-events: auto;`;

        const trigger = () => {
            if (isAnimating) return;
            handleFirstInteraction();

            // Handle Sync Advantage (Engine start logic)
            if (s.audioOnHit) {
                audio.src = `assets/${s.audioOnHit}`;
                audio.play().catch(() => { });
            }

            if (s.video) {
                playVideo(`assets/${s.video}`, s.next);
            } else if (s.target) {
                if (s.delay) {
                    setTimeout(() => move(s.target), s.delay);
                } else {
                    move(s.target);
                }
            }
        };

        h.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            trigger();
        });

        h.onclick = (e) => {
            if (interactionReady && window.ontouchstart !== undefined) return;
            e.stopPropagation();
            trigger();
        };

        ovl.appendChild(h);
    });
}

function playVideo(src, nextId, cta = false) {
    handleFirstInteraction();
    audio.pause();

    vid.src = src;
    vid.classList.add('visible');
    vid.play().catch(e => console.warn("Video play error"));

    vid.onended = () => {
        vid.classList.remove('visible');
        if (nextId) {
            if (nextId === "rx350") {
                showRX350Details();
            } else {
                move(nextId);
            }
        }
        if (cta) popup.classList.add('visible');
    };
}

function move(targetId) {
    if (isAnimating || !targetId) return;
    isAnimating = true;
    renderScene(targetId);
}

function handleFirstInteraction() {
    if (!interactionReady) {
        interactionReady = true;
        // Start persistent background loop
        ambientAudio.play().catch(() => { });
    }
}

function attachEvents() {
    let sx, sy;

    ovl.addEventListener('touchstart', (e) => {
        sx = e.touches[0].clientX;
        sy = e.touches[0].clientY;
        handleFirstInteraction();
    }, { passive: false });

    ovl.addEventListener('touchend', (e) => {
        const dx = sx - e.changedTouches[0].clientX;
        const dy = sy - e.changedTouches[0].clientY;
        const scene = SCENES[currentSceneId];

        if (isAnimating || !scene) return;

        // Swipe Detection
        if (Math.abs(dx) > 35 || Math.abs(dy) > 35) {
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 35 && scene.swipe?.left) move(scene.swipe.left);
                else if (dx < -35 && scene.swipe?.right) move(scene.swipe.right);
            } else {
                if (dy > 35 && scene.swipe?.up) move(scene.swipe.up);
                else if (dy < -35 && scene.swipe?.down) move(scene.swipe.down);
            }
            return;
        }

        // Tap Detection
        const now = Date.now();
        if (now - lastTapTime < 400 && lastTapTime > 0) {
            if (scene.doubleTap) move(scene.doubleTap);
            lastTapTime = 0;
            return;
        }
        lastTapTime = now;

        if (scene.clickAnywhere) {
            playVideo(`assets/${scene.clickAnywhere.video}`, scene.clickAnywhere.next, scene.clickAnywhere.showCTA);
        }
        
        if (scene.showDetails) {
            showRX350Details();
        }
    });

    document.body.addEventListener('click', () => {
        handleFirstInteraction();
    }, { once: true });
}

function showRX350Details() {
    // Hide the interactive experience
    document.getElementById('app').style.display = 'none';
    
    // Show the RX350 details page
    window.location.href = 'rx350.html';
}

init();
