// --- 1. Referencias a Elementos del DOM ---
const gameArea = document.getElementById('game-area');
const player = document.getElementById('player'); // Es un <img>
const scoreDisplay = document.getElementById('scoreDisplay');
const menu = document.getElementById('menu');
const startButton = document.getElementById('startButton');
const gameOverScreen = document.getElementById('gameOver');
const restartButton = document.getElementById('restartButton');
const finalScore = document.getElementById('finalScore');

const catImages = [
    'img/splash_1.png', // Nivel 0 (0-59 puntos)
    'img/splash_2.png', // Nivel 1 (60-119 puntos)
    'img/splash_3.png', // Nivel 2 (120-179 puntos)
    'img/splash_4.png', // etc...
    'img/splash_5.png',
    'img/splash_6.png',
    'img/splash_7.png',
    'img/splash_8.png',
    'img/splash_9.png',
    'img/splash_10.png' // Nivel 9 (540+ puntos)
];

// --- 2. Variables de Estado del Juego ---
let score = 0;
let gameRunning = false;
let itemInterval;
let gameLoopInterval;
let gameAreaRect = gameArea.getBoundingClientRect();
let playerWidth = player.offsetWidth;

const items = {
    good: '🐟',
    bad: ['🦴', '🍪', '🧸'],
    special: '🐠' // ***** NUEVO: Pescado Dorado *****
};

// --- 3. Funciones del Juego ---

function startGame() {
    score = 0;
    gameRunning = true;
    scoreDisplay.textContent = 'Puntuación: 0';
    
    player.src = catImages[0]; 
    playerWidth = player.offsetWidth; 
    
    gameAreaRect = gameArea.getBoundingClientRect();
    let playerX = (gameAreaRect.width / 2) - (playerWidth / 2);
    player.style.left = playerX + 'px';
    
    menu.style.display = 'none';
    gameOverScreen.style.display = 'none';

    // Limpiar intervalos antiguos por si acaso
    clearInterval(itemInterval);
    clearInterval(gameLoopInterval);

    // ***** CAMBIO 3: Más Acción *****
    // Los objetos ahora caen cada 700ms (antes 1000ms)
    itemInterval = setInterval(createItem, 700); 
    gameLoopInterval = setInterval(gameLoop, 16); 
}

function gameLoop() {
    if (!gameRunning) return;

    let fallingItems = document.querySelectorAll('.item');
    fallingItems.forEach(item => {
        let top = parseInt(item.style.top);
        top += 5; // Velocidad de caída
        item.style.top = top + 'px';

        if (checkCollision(player, item)) {
            
            // ***** CAMBIO 2: Lógica del Pescado Dorado *****
            if (item.classList.contains('special')) {
                updateScore(10); // 10 puntos
                item.remove();
            } else if (item.classList.contains('good')) {
                updateScore(1); // 1 punto
                item.remove();
            } else {
                // Es un objeto malo
                endGame();
            }
        }
        else if (top > gameAreaRect.height) {
            item.remove();
        }
    });
}

function createItem() {
    const itemElement = document.createElement('div');
    itemElement.classList.add('item');

    // ***** CAMBIO 2: Probabilidad del Pescado Dorado *****
    let chance = Math.random();

    if (chance < 0.1) { // 10% de probabilidad de Pescado Dorado
        itemElement.textContent = items.special;
        itemElement.classList.add('special');
    } else if (chance < 0.7) { // 60% de probabilidad de Pescado normal (0.1 + 0.6 = 0.7)
        itemElement.textContent = items.good;
        itemElement.classList.add('good');
    } else { // 30% de probabilidad de objeto malo
        itemElement.textContent = items.bad[Math.floor(Math.random() * items.bad.length)];
        itemElement.classList.add('bad');
    }

    let randomX = Math.floor(Math.random() * (gameAreaRect.width - 40));
    itemElement.style.left = randomX + 'px';
    itemElement.style.top = '-50px';

    gameArea.appendChild(itemElement);
}

function updateScore(points) {
    score += points;
    scoreDisplay.textContent = `Puntuación: ${score}`;

    // ***** CAMBIO 1: Progreso más Rápido *****
    // Ahora se divide entre 60 (antes 100)
    let catLevel = Math.floor(score / 60);
    
    if (catLevel >= catImages.length) {
        catLevel = catImages.length - 1; 
    }

    if (player.src.endsWith(catImages[catLevel]) === false) {
        player.src = catImages[catLevel];
        playerWidth = player.offsetWidth; 
    }
}

function endGame() {
    gameRunning = false;
    clearInterval(itemInterval); 
    clearInterval(gameLoopInterval); 
    
    finalScore.textContent = score;
    gameOverScreen.style.display = 'flex';
    
    document.querySelectorAll('.item').forEach(item => item.remove());
}

function checkCollision(el1, el2) {
    const rect1 = el1.getBoundingClientRect();
    const rect2 = el2.getBoundingClientRect(); 
    
    return !(
        rect1.top > rect2.bottom ||
        rect1.right < rect2.left ||
        rect1.bottom < rect2.top ||
        rect1.left > rect2.right
    );
}

function movePlayer(event) {
    if (!gameRunning) return;

    event.preventDefault();

    let clientX;
    
    if (event.touches) {
        clientX = event.touches[0].clientX;
    } else {
        clientX = event.clientX;
    }
    
    let newX = clientX - gameAreaRect.left - (playerWidth / 2);
    
    if (newX < 0) newX = 0;
    if (newX > gameAreaRect.width - playerWidth) {
        newX = gameAreaRect.width - playerWidth;
    }
    
    player.style.left = newX + 'px';
}

// --- 4. Event Listeners (Poner todo en marcha) ---
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

gameArea.addEventListener('mousemove', movePlayer);
gameArea.addEventListener('touchstart', movePlayer, { passive: false });
gameArea.addEventListener('touchmove', movePlayer, { passive: false });


window.addEventListener('resize', () => {
    gameAreaRect = gameArea.getBoundingClientRect();
    playerWidth = player.offsetWidth; 
});