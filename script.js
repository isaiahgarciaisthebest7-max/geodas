const game = document.getElementById("game");
const playerEl = document.getElementById("player");
const statusText = document.getElementById("status");
const modeText = document.getElementById("modeText");

const GAME_WIDTH = 1000;
const GAME_HEIGHT = 300;
const FLOOR = 40;
const CEILING = 260;

let player = {
    x: 150,
    y: FLOOR,
    width: 40,
    height: 40,
    velocity: 0
};

let gravity = 0.9;
let speed = 5;
let mode = "cube";
let spikes = [];
let portals = [];
let running = false;

document.addEventListener("keydown", e => {
    if (e.code === "Space" || e.code === "ArrowUp") {
        if (running) jump();
    }
});

function startLevel(level) {
    reset();
    createLevel(level);
    running = true;
    statusText.innerText = "Level " + level;
    requestAnimationFrame(loop);
}

function reset() {
    spikes = [];
    portals = [];
    document.querySelectorAll(".spike").forEach(e => e.remove());
    player.y = FLOOR;
    player.velocity = 0;
    gravity = 0.9;
    mode = "cube";
    updateModeText();
}

function createLevel(level) {

    const layouts = {
        1: {
            spikes: [600, 750, 900],
            portals: [{x:1000, type:"ship"}]
        },
        2: {
            spikes: [550, 700, 850, 1000],
            portals: [{x:1100, type:"ball"}]
        },
        3: {
            spikes: [600, 650, 700, 900],
            portals: [{x:1000, type:"ufo"}, {x:1300,type:"wave"}]
        }
    };

    layouts[level].spikes.forEach(x => {
        spikes.push({ x: x, y: FLOOR, width: 40, height: 40 });
        let spikeEl = document.createElement("div");
        spikeEl.className = "spike";
        spikeEl.style.left = x + "px";
        spikeEl.style.bottom = FLOOR + "px";
        game.appendChild(spikeEl);
    });

    portals = layouts[level].portals;
}

function jump() {

    if (mode === "cube" && player.y === FLOOR) {
        player.velocity = 16;
    }

    else if (mode === "ship") {
        player.velocity = 8;
    }

    else if (mode === "ball") {
        gravity *= -1;
    }

    else if (mode === "ufo") {
        player.velocity = 13;
    }

    else if (mode === "wave") {
        player.velocity = player.velocity > 0 ? -8 : 8;
    }
}

function loop() {

    if (!running) return;

    updatePhysics();
    moveWorld();
    checkCollision();
    draw();

    requestAnimationFrame(loop);
}

function updatePhysics() {

    if (mode !== "wave") {
        player.velocity -= gravity;
    }

    player.y += player.velocity;

    if (player.y < FLOOR) {
        player.y = FLOOR;
        player.velocity = 0;
    }

    if (player.y > CEILING) {
        player.y = CEILING;
        player.velocity = 0;
    }
}

function moveWorld() {

    spikes.forEach(spike => {
        spike.x -= speed;
    });

    portals.forEach(portal => {
        portal.x -= speed;
    });
}

function checkCollision() {

    for (let spike of spikes) {

        if (
            player.x < spike.x + spike.width &&
            player.x + player.width > spike.x &&
            player.y < spike.y + spike.height &&
            player.y + player.height > spike.y
        ) {
            death();
        }
    }

    for (let portal of portals) {

        if (
            player.x < portal.x + 30 &&
            player.x + player.width > portal.x &&
            player.y < FLOOR + 80 &&
            player.y + player.height > FLOOR
        ) {
            mode = portal.type;
            updateModeText();
        }
    }
}

function draw() {
    playerEl.style.bottom = player.y + "px";

    document.querySelectorAll(".spike").forEach((el, i) => {
        el.style.left = spikes[i].x + "px";
    });
}

function updateModeText() {
    const icons = {
        cube: "⬛ Cube",
        ship: "🚀 Ship",
        ball: "⚪ Ball",
        ufo: "🛸 UFO",
        wave: "🔺 Wave"
    };
    modeText.innerText = icons[mode];
}

function death() {
    running = false;
    statusText.innerText = "💀 You Died";
}
