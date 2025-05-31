const character = document.getElementById('character');
const obstacle = document.querySelector('.obstacle');
const scoreDisplay = document.getElementById('score');
const highestScoreDisplay = document.getElementById('Highest-score');

const jumpSound = new Audio('../Audios/jump-up-245782.mp3');
const gameOverSound = new Audio('../Audios/game-over-6435.mp3');

let isJumping = false;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let isPaused = false;
let obstacles = [];
let spawnInterval;
let moveInterval;

highestScoreDisplay.textContent = `Highest Score: ${highScore}`;

let isMuted = false;

function toggleMute() {
    isMuted = !isMuted;
    jumpSound.muted = isMuted;
    gameOverSound.muted = isMuted;
    console.log(`Sound ${isMuted ? 'muted' : 'unmuted'}`);
}


document.addEventListener('keyup', (event) => {
    if ((event.key === ' ' || event.key === 'ArrowUp') && !isJumping && !isPaused) {
        jump();
    }

    if (event.key.toLowerCase() === 'm') {
        toggleMute();
    }
});


document.addEventListener('click', () => {
    togglePauseGame();
});

// Touch support for mobile
document.addEventListener('touchstart', () => {
    if (!isJumping && !isPaused) {
        jump();
    }
});

// Scroll to top for Page Up button
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function togglePauseGame() {
    isPaused = !isPaused;
    if (isPaused) {
        clearInterval(spawnInterval);
        clearInterval(moveInterval);
        obstacles.forEach(obstacle => obstacle.element.style.animationPlayState = 'paused');
        showPauseMessage();
    } else {
        moveObstacles();
        obstacles.forEach(obstacle => obstacle.element.style.animationPlayState = 'running');
        removePauseMessage();
    }
}

function showPauseMessage() {
    const pauseOverlay = document.createElement('div');
    pauseOverlay.id = 'pause-overlay';
    pauseOverlay.style.position = 'fixed';
    pauseOverlay.style.top = '0';
    pauseOverlay.style.left = '0';
    pauseOverlay.style.width = '100vw';
    pauseOverlay.style.height = '100vh';
    pauseOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    pauseOverlay.style.color = 'white';
    pauseOverlay.style.display = 'flex';
    pauseOverlay.style.flexDirection = 'column';
    pauseOverlay.style.justifyContent = 'center';
    pauseOverlay.style.alignItems = 'center';
    pauseOverlay.style.zIndex = '1000';

    const message = document.createElement('h1');
    message.textContent = 'Game Paused';
    pauseOverlay.appendChild(message);

    document.body.appendChild(pauseOverlay);
}

function removePauseMessage() {
    const pauseOverlay = document.getElementById('pause-overlay');
    if (pauseOverlay) {
        pauseOverlay.remove();
    }
}

function jump() {
    isJumping = true;
    jumpSound.play();
    let jumpHeight = 0;

    const upInterval = setInterval(() => {
        if (isPaused) {
            clearInterval(upInterval);
            return;
        }

        if (jumpHeight >= 200) {
            clearInterval(upInterval);

            const downInterval = setInterval(() => {
                if (isPaused) {
                    clearInterval(downInterval);
                    return;
                }

                if (jumpHeight <= 0) {
                    clearInterval(downInterval);
                    isJumping = false;
                }
                jumpHeight -= 10;
                character.style.bottom = `${jumpHeight + 100}px`;
            }, 20);
        }
        jumpHeight += 10;
        character.style.bottom = `${jumpHeight + 100}px`;
    }, 20);
}

function showGameOverMessage(newHighScore) {
    gameOverSound.play();

    const gameOverOverlay = document.createElement('div');
    gameOverOverlay.id = 'game-over-overlay';
    gameOverOverlay.style.position = 'fixed';
    gameOverOverlay.style.top = '0';
    gameOverOverlay.style.left = '0';
    gameOverOverlay.style.width = '100vw';
    gameOverOverlay.style.height = '100vh';
    gameOverOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    gameOverOverlay.style.color = 'white';
    gameOverOverlay.style.display = 'flex';
    gameOverOverlay.style.flexDirection = 'column';
    gameOverOverlay.style.justifyContent = 'center';
    gameOverOverlay.style.alignItems = 'center';
    gameOverOverlay.style.zIndex = '1000';

    const message = document.createElement('h1');
    message.textContent = newHighScore
        ? `Game Over! New High Score: ${score}`
        : `Game Over! Your Score: ${score}`;
    gameOverOverlay.appendChild(message);

    const restartButton = document.createElement('button');
    restartButton.textContent = 'Restart Game';
    restartButton.style.padding = '10px 20px';
    restartButton.style.fontSize = '16px';
    restartButton.style.cursor = 'pointer';
    restartButton.addEventListener('click', () => {
        window.location.reload();
    });
    gameOverOverlay.appendChild(restartButton);

    document.body.appendChild(gameOverOverlay);
}

function moveObstacles() {
    function spawnObstacle() {
        const obstacle = document.createElement('div');
        obstacle.className = 'obstacle';
        obstacle.style.position = 'absolute';
        obstacle.style.bottom = '100px';
        obstacle.style.left = `${window.innerWidth}px`;
        obstacle.style.animation = 'none';
        document.body.appendChild(obstacle);

        obstacles.push({
            element: obstacle,
            x: window.innerWidth,
        });
    }

    function updateObstacles() {
        obstacles.forEach((obstacle, index) => {
            if (isPaused) return;

            obstacle.x -= 7;
            obstacle.element.style.left = `${obstacle.x}px`;

            const characterBottom = parseInt(character.style.bottom.replace('px', '')) || 1;
            if (obstacle.x < 100 && obstacle.x > 50 && characterBottom < 130) {
                clearInterval(spawnInterval);
                clearInterval(moveInterval);
                obstacles.forEach(obs => obs.element.remove());
                obstacles = [];

                const newHighScore = score > highScore;
                if (newHighScore) {
                    highScore = score;
                    localStorage.setItem('highScore', highScore);
                    highestScoreDisplay.textContent = `Highest Score: ${highScore}`;
                }

                showGameOverMessage(newHighScore);
                return;
            }

            if (obstacle.x < -50) {
                obstacles.splice(index, 1);
                obstacle.element.remove();
                score += 10;
                scoreDisplay.textContent = `Score: ${score}`;
            }
        });
    }

    spawnInterval = setInterval(() => {
        if (!isPaused && Math.random() > 0.6) {
            spawnObstacle();
        }
    }, 800);

    moveInterval = setInterval(() => {
        if (!isPaused) {
            updateObstacles();
        }
    }, 20);
}

moveObstacles();

const bgDay = document.getElementById('bg-day');
const bgNight = document.getElementById('bg-night');

let isDayVisible = true;

setInterval(() => {
    if (isDayVisible) {
        // Fade out day, fade in night
        bgDay.style.opacity = 0;
        bgNight.style.opacity = 1;
    } else {
        // Fade out night, fade in day
        bgDay.style.opacity = 1;
        bgNight.style.opacity = 0;
    }
    isDayVisible = !isDayVisible;
}, 16000); // switch every 16 seconds
