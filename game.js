// --- 1. Referencias a Elementos del DOM ---
const gameArea = document.getElementById('game-area');
const player = document.getElementById('player'); // Es un <img>
const scoreDisplay = document.getElementById('scoreDisplay');
const menu = document.getElementById('menu');
const startButton = document.getElementById('startButton');
const gameOverScreen = document.getElementById('gameOver');
const restartButton = document.getElementById('restartButton');
const finalScore = document.getElementById('finalScore');

// ***** CAMBIO AQUÍ: Array de Imágenes del Gato *****
// Asegúrate de que estos archivos existan en una carpeta 'img/'
const catImages = [
    'img/splash_1.png', // Nivel 0 (0-99 puntos)
    'img/splash_2.png', // Nivel 1 (100-199 puntos)
    'imgsplash_3.png', // Nivel 2 (200-299 puntos)
    'img/plash_4.png', // Nivel 3 (300-399 puntos)
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
    
    // Resetear a la imagen base (splash_1.png)
    player.src = catImages[0]; 
    playerWidth = player.offsetWidth; 
    
    // Posicionar al jugador en el centro
    gameAreaRect = gameArea.getBoundingClientRect();
    let playerX = (gameAreaRect.width / 2) - (playerWidth / 2);
    player.style.left = playerX + 'px';
    
    menu.style.display = 'none';
    gameOverScreen.style.display = 'none';

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
                // 1 punto por pescado
                updateScore(1); 
                item.remove();
            } else {
                // Tocar algo malo termina el juego
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

    // 70% de probabilidad de pescado
    if (Math.random() < 0.7) {
        itemElement.textContent = items.good;
        itemElement.classList.add('good');
    } else {
        itemElement.textContent = items.bad[Math.floor(Math.random() * items.bad.length)];
        itemElement.classList.add('bad');
    }

    // Posición horizontal aleatoria
    let randomX = Math.floor(Math.random() * (gameAreaRect.width - 40));
    itemElement.style.left = randomX + 'px';
    itemElement.style.top = '-50px';

    gameArea.appendChild(itemElement);
}

/** * Actualiza la puntuación y cambia la imagen del gato.
 */
function updateScore(points) {
    score += points;
    scoreDisplay.textContent = `Puntuación: ${score}`;

    // Lógica para Cambiar imagen (Engordar)
    
    // 1. Calcular el "nivel" del gato (0 para 0-99, 1 para 100-199, etc.)
    // Math.floor(99 / 100) = 0  -> catImages[0] -> splash_1.png
    // Math.floor(100 / 100) = 1 -> catImages[1] -> splash_2.png
    // ...
    // Math.floor(900 / 100) = 9 -> catImages[9] -> splash_10.png
    let catLevel = Math.floor(score / 100);
    
    // 2. Limitar el nivel al máximo de imágenes que tenemos (índice 9)
    if (catLevel >= catImages.length) {
        catLevel = catImages.length - 1; 
    }

    // 3. Cambiar la imagen del gato si es diferente a la actual
    // (Esto evita recargar la imagen en cada frame)
    if (player.src.endsWith(catImages[catLevel]) === false) {
        player.src = catImages[catLevel];
        playerWidth = player.offsetWidth; 
    }
}

function endGame() {
    gameRunning = false;
    clearInterval(itemInterval); // Detener creación de items
    clearInterval(gameLoopInterval); // Detener bucle de juego
    
    // Mostrar pantalla de Game Over
    finalScore.textContent = score;
    gameOverScreen.style.display = 'flex';
    
    // Limpiar items restantes
    document.querySelectorAll('.item').forEach(item => item.remove());
}

/** Revisa la colisión entre dos elementos */
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

/** Mueve al jugador con el ratón */
function movePlayer(event) {
    if (!gameRunning) return;
    
    // Centramos el gato en el cursor
    let newX = event.clientX - gameAreaRect.left - (playerWidth / 2);
    
    // Limitar el movimiento a los bordes del área de juego
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

// Actualizar el tamaño del área de juego si la ventana cambia
window.addEventListener('resize', () => {
    gameAreaRect = gameArea.getBoundingClientRect();
    playerWidth = player.offsetWidth; 
});