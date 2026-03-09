// Abserny Process Flow Animation Script

// Process flow steps
const steps = [
    { icon: '🚀', type: 'init', title: 'App Initialization', desc: 'Load config, create supervisor, initialize services (Camera, YOLO, TTS, Vosk)' },
    { icon: '🎤', type: 'listen', title: 'Listening Mode', desc: 'Vosk processes microphone audio, waiting for trigger words' },
    { icon: '🗣️', type: 'voice', title: 'Voice Command Detected', desc: 'Trigger word recognized: "start", "detect", "see", or "look"' },
    { icon: '📸', type: 'process', title: 'Capture & Process', desc: 'Camera captures frame, YOLO detects objects (confidence > 0.5)' },
    { icon: '📊', type: 'speak', title: 'Generate Description', desc: 'Group objects, create natural language, speak via TTS' },
    { icon: '✔', type: 'complete', title: 'Return to Listening', desc: '3-second cooldown activated, back to listening mode' }
];

// Sample detected objects for demo
const objects = [
    { name: 'Person', x: 50, y: 80, w: 90, h: 180 },
    { name: 'Laptop', x: 220, y: 200, w: 120, h: 80 },
    { name: 'Cup', x: 350, y: 230, w: 50, h: 60 }
];

// Get DOM elements
const flowContainer = document.getElementById('flowSteps');
const sceneStage = document.getElementById('sceneStage');
const statusText = document.getElementById('statusText');

// Create flow steps UI
function createFlowSteps() {
    if (!flowContainer) return;

    steps.forEach((step, index) => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'flow-step';
        stepDiv.id = `step-${index}`;
        stepDiv.innerHTML = `
<div class="step-icon ${step.type}">${step.icon}</div>
<div class="step-content ${step.type}">
    <div class="step-title">${step.title}</div>
    <div class="step-desc">${step.desc}</div>
</div>
`;
        flowContainer.appendChild(stepDiv);
    });
}

// Activate specific step
function activateStep(index) {
    document.querySelectorAll('.flow-step').forEach((step, i) => {
        step.classList.toggle('active', i === index);
    });
}

// Show initialization screen
function showInitScreen() {
    if (!sceneStage) return;

    sceneStage.innerHTML = `
<div class="init-screen active">
    <div class="init-icon">⚙️</div>
    <div class="init-text">Initializing Abserny...</div>
    <div class="init-progress">
        <div class="init-progress-bar"></div>
    </div>
</div>
`;
    if (statusText) statusText.textContent = 'Initializing...';
}

function animateHeroDetections() {
    const boxes = document.querySelectorAll(".hero-visual .detection-box");

    // reset
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


// Show listening screen
function showListeningScreen() {
    if (!sceneStage) return;

    sceneStage.innerHTML = `
<div class="listening-screen active">
    <div class="mic-icon-large">
        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#2196F3" stroke-width="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
        </svg>
    </div>
    <div class="listening-text">Listening...</div>
    <div class="trigger-words">Say: "start", "detect", "see", or "look"</div>
</div>
`;
    if (statusText) statusText.textContent = 'Listening for voice command';
}

// Show voice command screen
function showVoiceCommandScreen() {
    if (!sceneStage) return;

    sceneStage.innerHTML = `
<div class="voice-command-screen active">
    <div class="voice-wave">
        <div class="voice-circle"></div>
        <div class="voice-circle"></div>
        <div class="voice-circle"></div>
    </div>
    <div class="voice-text">"START"</div>
    <div class="trigger-words">Command recognized!</div>
</div>
`;
    if (statusText) statusText.textContent = 'Voice command detected';
}

// Show detection screen
function showDetectionScreen() {
    if (!sceneStage) return;

    sceneStage.innerHTML = `
<div class="detection-screen active">
    <div class="camera-flash" id="cameraFlash"></div>
    <div id="detectionsContainer"></div>
</div>
`;
    if (statusText) statusText.textContent = 'Detecting objects...';

    const flash = document.getElementById('cameraFlash');
    if (flash) {
        flash.classList.add('active');

        setTimeout(() => {
            flash.classList.remove('active');
            const container = document.getElementById('detectionsContainer');
            if (!container) return;

            objects.forEach((obj, i) => {
                setTimeout(() => {
                    const box = document.createElement('div');
                    box.className = 'detection-box';
                    box.style.left = obj.x + 'px';
                    box.style.top = obj.y + 'px';
                    box.style.width = obj.w + 'px';
                    box.style.height = obj.h + 'px';
                    box.style.animation = 'boxDraw 0.5s ease forwards';

                    const label = document.createElement('span');
                    label.className = 'detection-label';
                    label.textContent = obj.name;

                    box.appendChild(label);
                    container.appendChild(box);
                }, i * 300);
            });
        }, 300);
    }
}

// Show speak screen
function showSpeakScreen() {
    if (!sceneStage) return;

    const existingContent = sceneStage.innerHTML;
    sceneStage.innerHTML = existingContent + `
<div class="audio-wave active">
<div class="wave-bar"></div>
<div class="wave-bar"></div>
<div class="wave-bar"></div>
<div class="wave-bar"></div>
<div class="wave-bar"></div>
</div>
<div class="result-text active">
📊 "I see a person, a laptop, and a cup"
</div>
`;
    if (statusText) statusText.textContent = 'Speaking result...';
}

// Show complete screen
function showCompleteScreen() {
    if (!sceneStage) return;

    sceneStage.innerHTML = `
<div class="complete-screen active">
    <div class="complete-icon">✔</div>
    <div class="complete-text">Detection Complete</div>
    <div class="cooldown-timer">3-second cooldown active</div>
</div>
`;
    if (statusText) statusText.textContent = 'Ready for next command';
}

// Sleep utility
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Run animation cycle
async function runCycle() {
    activateStep(0);
    showInitScreen();
    await sleep(2500);

    activateStep(1);
    showListeningScreen();
    await sleep(2500);

    activateStep(2);
    showVoiceCommandScreen();
    await sleep(2000);

    activateStep(3);
    showDetectionScreen();
    await sleep(2000);

    activateStep(4);
    showSpeakScreen();
    await sleep(2500);

    activateStep(5);
    showCompleteScreen();
    await sleep(2500);

    // Loop again
    runCycle();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Create flow steps
    createFlowSteps();

    // Set up intersection observer for scroll-triggered animation
    const processSection = document.getElementById('processSection');
    if (processSection) {
        let animationStarted = false;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animationStarted) {
                    animationStarted = true;
                    runCycle();
                }
            });
        }, { threshold: 0.3 });

        observer.observe(processSection);
    }

    // Initialize Vanta background
    const heroElement = document.getElementById('hero');
    if (heroElement && typeof VANTA !== 'undefined') {
        VANTA.NET({
            el: "#hero",
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x60a5fa,
            backgroundColor: 0x10182C,
            backgroundAlpha: 1.0,
            points: 10.00,
            maxDistance: 22.00,
            spacing: 20.00,
            showDots: true
        });
    }
});
