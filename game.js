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
    'img/splash_1.png', // Nivel 0 (0-99 puntos)
    'img/splash_2.png', // Nivel 1 (100-199 puntos)
    'img/splash_3.png', // Nivel 2 (200-299 puntos)
    'img/splash_4.png', // Nivel 3 (300-399 puntos)
    'img/splash_5.png', // Nivel 4 (400-499 puntos)
    'img/splash_6.png', // Nivel 5 (500-599 puntos)
    'img/splash_7.png', // Nivel 6 (600-699 puntos)
    'img/splash_8.png', // Nivel 7 (700-799 puntos)
    'img/splash_9.png', // Nivel 8 (800-899 puntos)
    'img/splash_10.png' // Nivel 9 (900+ puntos)
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
    bad: ['🦴', '🍪', '🧸']
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

    itemInterval = setInterval(createItem, 1000); 
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
            if (item.classList.contains('good')) {
                updateScore(1); 
                item.remove();
            } else {
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

    if (Math.random() < 0.7) {
        itemElement.textContent = items.good;
        itemElement.classList.add('good');
    } else {
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

    let catLevel = Math.floor(score / 100);
    
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
    
    // ***** ¡AQUÍ ESTABA EL ERROR CORREGIDO! *****
    // Ahora dice "el2" (Elemento 2)
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
