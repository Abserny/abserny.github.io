// ─────────────────────────────────────────────────────────────
//  Abserny — hero detection animation (unchanged)
// ─────────────────────────────────────────────────────────────
function animateHeroDetections() {
    const boxes = document.querySelectorAll(".hero-visual .detection-box");
    boxes.forEach(box => {
        box.style.opacity = "0";
        box.style.animation = "none";
    });
    boxes.forEach((box, index) => {
        setTimeout(() => {
            box.style.opacity = "1";
            box.style.animation = "boxDraw 0.6s ease forwards";
        }, index * 700);
    });
}
animateHeroDetections();
setInterval(animateHeroDetections, 2300);

// ─────────────────────────────────────────────────────────────
//  FSM PROCESS FLOW ANIMATION
//  Actual states: BOOT → READY → SCANNING → SPEAKING → READY
//                                         ↘ ERROR → READY
// ─────────────────────────────────────────────────────────────

const FSM_STATES = [
    {
        id: 'BOOT',
        label: 'BOOT',
        color: '#60a5fa',
        duration: 2800,
        info: 'Loading camera, TTS engine, PanResponder gesture listeners and FSM supervisor.',
        meta: 'React Native · Expo SDK 54',
        screen: buildBootScreen,
    },
    {
        id: 'READY',
        label: 'READY',
        color: '#60a5fa',
        duration: 2600,
        info: 'Idle — full-screen gesture surface active. Double tap anywhere to scan.',
        meta: 'Double tap (320 ms window) → SCANNING',
        screen: buildReadyScreen,
    },
    {
        id: 'SCANNING',
        label: 'SCANNING',
        color: '#a78bfa',
        duration: 3200,
        info: 'Frame captured. Online → Gemini 2.0 Flash Lite. Offline → ML Kit on-device labeling.',
        meta: '1,430 ms online · 380 ms offline',
        screen: buildScanningScreen,
    },
    {
        id: 'SPEAKING',
        label: 'SPEAKING',
        color: '#34d399',
        duration: 3000,
        info: 'TTS speaks the spatial description. Long press to repeat. Swipe to change mode.',
        meta: 'ar-SA rate 0.82 · en-US rate 0.88',
        screen: buildSpeakingScreen,
    },
    {
        id: 'ERROR',
        label: 'ERROR',
        color: '#f87171',
        duration: 2000,
        info: 'API timeout or network failure. FSM speaks an error message and auto-recovers.',
        meta: 'Auto-recover → READY',
        screen: buildErrorScreen,
        skip: true, // only shown occasionally
    },
];

// Mode names cycle during SCANNING
const MODES = [
    { name: 'Scene',   color: '#60a5fa' },
    { name: 'Object',  color: '#a78bfa' },
    { name: 'Read',    color: '#34d399' },
    { name: 'People',  color: '#fbbf24' },
];
let modeIndex = 0;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Screen builders ───────────────────────────────────────────

function buildBootScreen(el) {
    el.innerHTML = `
<div class="fsm-scr fsm-scr--boot">
    <div class="fsm-boot-logo">
        <div class="fsm-boot-eye">
            <div class="fsm-boot-pupil"></div>
        </div>
    </div>
    <div class="fsm-boot-label">Abserny</div>
    <div class="fsm-boot-sub">أبصرني</div>
    <div class="fsm-boot-bar-wrap">
        <div class="fsm-boot-bar"></div>
    </div>
    <div class="fsm-boot-services">
        <span class="fsm-svc" id="svc0">Camera</span>
        <span class="fsm-svc" id="svc1">TTS</span>
        <span class="fsm-svc" id="svc2">Gemini</span>
        <span class="fsm-svc" id="svc3">ML Kit</span>
    </div>
</div>`;
    // stagger service labels appearing
    [0,1,2,3].forEach((i) => {
        setTimeout(() => {
            const s = el.querySelector(`#svc${i}`);
            if (s) s.classList.add('fsm-svc--on');
        }, 400 + i * 400);
    });
}

function buildReadyScreen(el) {
    const mode = MODES[modeIndex % MODES.length];
    el.innerHTML = `
<div class="fsm-scr fsm-scr--ready">
    <div class="fsm-ready-mode" style="--mode-color:${mode.color}">${mode.name}</div>
    <div class="fsm-ready-ring">
        <div class="fsm-ready-ring-inner"></div>
    </div>
    <div class="fsm-ready-hint">
        <span class="fsm-gesture-icon">✦✦</span>
        Double tap to scan
    </div>
</div>`;
}

function buildScanningScreen(el) {
    const mode = MODES[modeIndex % MODES.length];
    el.innerHTML = `
<div class="fsm-scr fsm-scr--scanning">
    <div class="fsm-scan-viewfinder">
        <div class="fsm-scan-corner fsm-scan-corner--tl"></div>
        <div class="fsm-scan-corner fsm-scan-corner--tr"></div>
        <div class="fsm-scan-corner fsm-scan-corner--bl"></div>
        <div class="fsm-scan-corner fsm-scan-corner--br"></div>
        <div class="fsm-scan-line"></div>
    </div>
    <div class="fsm-scan-route" id="scanRoute">
        <span class="fsm-route-node fsm-route-node--on">Frame</span>
        <span class="fsm-route-arrow">→</span>
        <span class="fsm-route-node" id="routeTarget">Gemini</span>
        <span class="fsm-route-arrow" id="routeArrow2">→</span>
        <span class="fsm-route-node" id="routeResult">Description</span>
    </div>
    <div class="fsm-scan-mode" style="color:${mode.color}">${mode.name} mode</div>
</div>`;
    // animate route nodes appearing
    setTimeout(() => {
        const t = el.querySelector('#routeTarget');
        if (t) t.classList.add('fsm-route-node--on');
    }, 800);
    setTimeout(() => {
        const r = el.querySelector('#routeResult');
        if (r) r.classList.add('fsm-route-node--on');
    }, 1600);
}

function buildSpeakingScreen(el) {
    const descriptions = {
        'Scene':  '"A person walking ahead, steps to your left, door straight on."',
        'Object': '"Laptop on desk, cup to the right, chair nearby."',
        'Read':   '"Exit sign above. Price tag reads twelve pounds."',
        'People': '"One person two meters ahead, facing toward you."',
    };
    const mode = MODES[modeIndex % MODES.length];
    const desc = descriptions[mode.name];
    el.innerHTML = `
<div class="fsm-scr fsm-scr--speaking">
    <div class="fsm-speak-wave">
        ${Array(9).fill(0).map((_,i) => `<div class="fsm-speak-bar" style="animation-delay:${i*0.08}s"></div>`).join('')}
    </div>
    <div class="fsm-speak-text">${desc}</div>
    <div class="fsm-speak-hint">Long press to repeat</div>
</div>`;
    modeIndex++;
}

function buildErrorScreen(el) {
    el.innerHTML = `
<div class="fsm-scr fsm-scr--error">
    <div class="fsm-error-icon">!</div>
    <div class="fsm-error-label">API timeout</div>
    <div class="fsm-error-sub">Speaking error message…<br>Recovering to READY</div>
</div>`;
}

// ── State machine runner ──────────────────────────────────────

function setActiveState(stateId) {
    document.querySelectorAll('.fsm-state').forEach(el => {
        const active = el.dataset.state === stateId;
        el.classList.toggle('fsm-state--active', active);
    });

    const def = FSM_STATES.find(s => s.id === stateId);
    if (!def) return;

    const badge = document.getElementById('fsmInfoBadge');
    const text  = document.getElementById('fsmInfoText');
    const meta  = document.getElementById('fsmInfoMeta');

    if (badge) { badge.textContent = def.label; badge.style.background = def.color + '22'; badge.style.color = def.color; badge.style.borderColor = def.color + '55'; }
    if (text)  text.textContent  = def.info;
    if (meta)  meta.textContent  = def.meta;
}

async function runFSM() {
    const screen = document.getElementById('fsmScreen');
    if (!screen) return;

    // Normal cycle: BOOT → READY → SCANNING → SPEAKING → READY → ...
    // Every 4th cycle show ERROR instead of SPEAKING
    let cycle = 0;

    async function tick(stateId) {
        const def = FSM_STATES.find(s => s.id === stateId);
        if (!def) return;
        setActiveState(stateId);
        screen.classList.remove('fsm-screen--visible');
        await sleep(120);
        def.screen(screen);
        screen.classList.add('fsm-screen--visible');
        await sleep(def.duration);
    }

    while (true) {
        await tick('BOOT');
        await tick('READY');
        await tick('SCANNING');

        if (cycle % 4 === 3) {
            await tick('ERROR');
        } else {
            await tick('SPEAKING');
        }

        await tick('READY');
        cycle++;
    }
}

// ─────────────────────────────────────────────────────────────
//  DOMContentLoaded — init everything
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {

    // Hero gradient background
    initHeroBg();

    // FSM — start when section scrolls into view
    const section = document.getElementById('processSection');
    if (section) {
        let started = false;
        new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !started) {
                started = true;
                runFSM();
            }
        }, { threshold: 0.25 }).observe(section);
    }

});

// ─────────────────────────────────────────────────────────────
//  HERO VISUAL — camera POV simulation
//  Cycles through scenes, draws detection boxes, speaks output
// ─────────────────────────────────────────────────────────────

const HV_SCENES = [
    {
        mode: 'Scene', modeColor: '#60a5fa',
        objects: [
            { label: 'Person',    x: 12, y: 18, w: 28, h: 52, priority: true },
            { label: 'Steps',     x: 55, y: 55, w: 38, h: 22 },
            { label: 'Door',      x: 62, y: 10, w: 25, h: 60 },
        ],
        desc: '"Person ahead, steps to your left, door straight on."',
    },
    {
        mode: 'Object', modeColor: '#a78bfa',
        objects: [
            { label: 'Laptop',    x: 18, y: 30, w: 38, h: 28 },
            { label: 'Cup',       x: 62, y: 42, w: 18, h: 24 },
            { label: 'Chair',     x: 8,  y: 52, w: 22, h: 36 },
        ],
        desc: '"Laptop on desk, cup to the right, chair nearby."',
    },
    {
        mode: 'Read', modeColor: '#34d399',
        objects: [
            { label: 'Exit sign', x: 22, y: 12, w: 55, h: 22, priority: true },
            { label: 'Price tag', x: 30, y: 52, w: 38, h: 18 },
        ],
        desc: '"Exit sign above. Price tag reads twelve pounds."',
    },
    {
        mode: 'People', modeColor: '#fbbf24',
        objects: [
            { label: 'Person ×2', x: 15, y: 15, w: 28, h: 60, priority: true },
            { label: 'Person',    x: 58, y: 20, w: 24, h: 55 },
        ],
        desc: '"Two people ahead — one close, one two metres away."',
    },
];

let hvIndex = 0;

function hvSleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function runHeroVisual() {
    const scene    = document.getElementById('hvScene');
    const descEl   = document.getElementById('hvDesc');
    const badge    = document.getElementById('hvModeBadge');
    const statusEl = document.getElementById('hvStatusText');
    const output   = document.getElementById('hvOutput');

    if (!scene) return;

    while (true) {
        const s = HV_SCENES[hvIndex % HV_SCENES.length];
        hvIndex++;

        // ── Set mode badge ──
        badge.textContent = s.mode;
        badge.style.background = s.modeColor + '22';
        badge.style.color      = s.modeColor;
        badge.style.borderColor = s.modeColor + '55';

        // ── READY state ──
        statusEl.textContent = 'READY';
        statusEl.style.color = 'rgba(255,255,255,0.5)';
        scene.innerHTML = '';
        output.classList.remove('hv-output--active');
        descEl.textContent = '';
        await hvSleep(900);

        // ── Double-tap ripple ──
        statusEl.textContent = 'SCANNING';
        statusEl.style.color = s.modeColor;
        const ripple = document.createElement('div');
        ripple.className = 'hv-tap-ripple';
        ripple.style.setProperty('--rc', s.modeColor);
        scene.appendChild(ripple);
        await hvSleep(500);
        ripple.remove();

        // ── Draw detection boxes one by one ──
        for (const obj of s.objects) {
            const box = document.createElement('div');
            box.className = 'hv-box' + (obj.priority ? ' hv-box--priority' : '');
            box.style.cssText = `
left:${obj.x}%; top:${obj.y}%;
width:${obj.w}%; height:${obj.h}%;
--bc: ${s.modeColor};
`;
            const lbl = document.createElement('span');
            lbl.className = 'hv-box-label';
            lbl.textContent = obj.label;
            lbl.style.background = s.modeColor;
            box.appendChild(lbl);
            scene.appendChild(box);
            // stagger
            await hvSleep(320);
        }

        await hvSleep(600);

        // ── SPEAKING — show description ──
        statusEl.textContent = 'SPEAKING';
        output.classList.add('hv-output--active');

        // Typewriter effect
        const words = s.desc.split(' ');
        descEl.textContent = '';
        for (const word of words) {
            descEl.textContent += (descEl.textContent ? ' ' : '') + word;
            await hvSleep(90);
        }

        await hvSleep(2000);

        // ── Fade out ──
        scene.style.opacity = '0';
        output.classList.remove('hv-output--active');
        await hvSleep(400);
        scene.innerHTML = '';
        scene.style.opacity = '1';
        await hvSleep(300);
    }
}

// Start hero visual on load
document.addEventListener('DOMContentLoaded', () => {
    runHeroVisual();
});


// ─────────────────────────────────────────────────────────────
//  HERO BACKGROUND — animated gradient, cursor reactive
// ─────────────────────────────────────────────────────────────
function initHeroBg() {
    const hero = document.getElementById('hero');
    if (!hero) return;

    // Create canvas behind everything
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;';
    hero.prepend(canvas);
    const ctx = canvas.getContext('2d');

    let W, H;

    // Mouse position — normalised 0..1, starts centered
    const mouse = { x: 0.5, y: 0.4 };
    // Smoothed mouse — lerps toward actual mouse slowly
    const smooth = { x: 0.5, y: 0.4 };

    // Autonomous blobs that drift slowly on their own
    const blobs = [
        { ox: 0.18, oy: 0.38, r: 0.55, h: 213, s: 75, l: 16, a: 0.13, speed: 0.00018, phase: 0 },
        { ox: 0.78, oy: 0.22, r: 0.45, h: 220, s: 65, l: 14, a: 0.09, speed: 0.00013, phase: 1.2 },
        { ox: 0.50, oy: 0.75, r: 0.42, h: 165, s: 60, l: 15, a: 0.07, speed: 0.00021, phase: 2.5 },
        { ox: 0.85, oy: 0.65, r: 0.38, h: 210, s: 70, l: 13, a: 0.06, speed: 0.00016, phase: 0.8 },
    ];

    function resize() {
        W = canvas.width  = hero.offsetWidth;
        H = canvas.height = hero.offsetHeight;
    }

    let t = 0;

    function draw() {
        t++;

        // Lerp smooth mouse toward actual (very slow — 0.018 factor)
        smooth.x += (mouse.x - smooth.x) * 0.018;
        smooth.y += (mouse.y - smooth.y) * 0.018;

        ctx.clearRect(0, 0, W, H);

        blobs.forEach(b => {
            // Autonomous drift using sin/cos
            const drift = t * b.speed;
            const bx = (b.ox + Math.sin(drift + b.phase) * 0.12 + (smooth.x - 0.5) * 0.10) * W;
            const by = (b.oy + Math.cos(drift + b.phase * 0.7) * 0.08 + (smooth.y - 0.5) * 0.07) * H;
            const br = b.r * Math.min(W, H);

            const g = ctx.createRadialGradient(bx, by, 0, bx, by, br);
            g.addColorStop(0,   `hsla(${b.h},${b.s}%,${b.l}%,${b.a})`);
            g.addColorStop(0.5, `hsla(${b.h},${b.s}%,${b.l}%,${b.a * 0.4})`);
            g.addColorStop(1,   'transparent');

            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(bx, by, br, 0, Math.PI * 2);
            ctx.fill();
        });

        // Cursor highlight — a soft glow that follows mouse closely
        const cx = smooth.x * W;
        const cy = smooth.y * H;
        const cr = Math.min(W, H) * 0.28;
        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
        cg.addColorStop(0,   'rgba(96,165,250,0.055)');
        cg.addColorStop(0.6, 'rgba(96,165,250,0.018)');
        cg.addColorStop(1,   'transparent');
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(cx, cy, cr, 0, Math.PI * 2);
        ctx.fill();

        requestAnimationFrame(draw);
    }

    // Track mouse over hero
    hero.addEventListener('mousemove', e => {
        const r = hero.getBoundingClientRect();
        mouse.x = (e.clientX - r.left)  / r.width;
        mouse.y = (e.clientY - r.top)   / r.height;
    });

    window.addEventListener('resize', resize);
    resize();
    draw();
}
