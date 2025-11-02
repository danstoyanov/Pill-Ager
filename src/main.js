import Player from './Player.js';
import Enemy from './Enemy.js';
import Projectile from './Projectile.js';
import PowerUp from './PowerUp.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const player = new Player(canvas);

let enemyStandardImage;
let enemyEliteImage;
let enemies = [];
let projectiles = [];
let powerUps = [];
let experienceGems = [];
let gameState = 'menu';
let difficulty = 'normal';
let spawnInterval;
let enemySpawnCounter = 0;

const mainMenu = document.getElementById('mainMenu');
const startButton = document.getElementById('startButton');
const difficultyButton = document.getElementById('difficultyButton');
const difficultyOptions = document.getElementById('difficultyOptions');
const quitButton = document.getElementById('quitButton');

startButton.disabled = true;
startButton.addEventListener('click', startGame);

difficultyButton.addEventListener('click', () => {
    difficultyOptions.style.display = difficultyOptions.style.display === 'none' ? 'block' : 'none';
});

document.querySelectorAll('.difficulty-option').forEach(button => {
    button.addEventListener('click', (e) => {
        setDifficulty(e.target.dataset.difficulty);
        difficultyOptions.style.display = 'none';
    });
});

quitButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to quit?')) {
        window.location.reload();
    }
});

function preloadImages(urls, callback) {
    let loadedCount = 0;
    const images = [];
    urls.forEach((url, index) => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
            loadedCount++;
            if (loadedCount === urls.length) {
                callback(images);
            }
        };
        img.onerror = (err) => {
            console.error('Error loading image:', url, err);
        };
        images[index] = img;
    });
}

const imageName = {
    ENEMY_STANDARD: 0,
    ENEMY_ELITE: 1,
}

function initializeGame(images) {
    enemyStandardImage = images[imageName.ENEMY_STANDARD];
    enemyEliteImage = images[imageName.ENEMY_ELITE];
    startButton.disabled = false;
}

preloadImages([
    'assets/enemy_standard.png',
    'assets/enemy_elite.png',
], initializeGame);

function setDifficulty(newDifficulty) {
    difficulty = newDifficulty;
    if (spawnInterval) {
        clearInterval(spawnInterval);
        spawnInterval = setInterval(spawnEnemy, getSpawnRate());
    }
}

function getSpawnRate() {
    switch (difficulty) {
        case 'easy':
            return 3000;
        case 'normal':
            return 2000;
        case 'hard':
            return 1000;
    }
}

function startGame() {
    gameState = 'playing';
    mainMenu.style.display = 'none';
    canvas.style.display = 'block';
    spawnInterval = setInterval(spawnEnemy, getSpawnRate());
    setInterval(shoot, 1000);
    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);
    update();
}

function spawnEnemy() {
    const size = 20;
    let x, y;
    let health, color;

    if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? 0 - size : canvas.width + size;
        y = Math.random() * canvas.height;
    } else {
        x = Math.random() * canvas.width;
        y = Math.random() < 0.5 ? 0 - size : canvas.height + size;
    }

    if (enemySpawnCounter % 10 === 0) {
        health = 3;
        color = 'purple';
        enemies.push(new Enemy(canvas, x, y, color, health, enemyEliteImage));
    } else {
        health = 1;
        color = 'red';
        enemies.push(new Enemy(canvas, x, y, color, health, enemyStandardImage));
    }
    enemySpawnCounter++;
}

function shoot() {
    const bulletSpeed = 5;
    if (player.weaponType === 'tripleShot') {
        let angle;
        if (player.dx === 0 && player.dy === 0) {
            switch (player.lastMoveDirection) {
                case 'up':
                    angle = -Math.PI / 2;
                    break;
                case 'down':
                    angle = Math.PI / 2;
                    break;
                case 'left':
                    angle = Math.PI;
                    break;
                case 'right':
                    angle = 0;
                    break;
            }
        } else {
            angle = Math.atan2(player.dy, player.dx);
        }

        for (let i = -1; i <= 1; i++) {
            const spreadAngle = angle + (i * Math.PI / 16);
            projectiles.push(new Projectile(player.x + player.width / 2, player.y + player.height / 2, Math.cos(spreadAngle) * bulletSpeed, Math.sin(spreadAngle) * bulletSpeed));
        }
    } else {
        const numBullets = 8;
        for (let i = 0; i < numBullets; i++) {
            const angle = (i / numBullets) * Math.PI * 2;
            projectiles.push(new Projectile(player.x + player.width / 2, player.y + player.height / 2, Math.cos(angle) * bulletSpeed, Math.sin(angle) * bulletSpeed));
        }
    }
}

function update() {
    if (gameState === 'playing') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        player.update();
        player.draw(ctx);

        enemies.forEach((enemy, enemyIndex) => {
            enemy.update(player);
            enemy.draw(ctx);
        });

        projectiles.forEach((projectile, projectileIndex) => {
            projectile.update();
            projectile.draw(ctx);

            if (projectile.x < 0 || projectile.x > canvas.width || projectile.y < 0 || projectile.y > canvas.height) {
                projectiles.splice(projectileIndex, 1);
            }
        });

        powerUps.forEach((powerUp, powerUpIndex) => {
            powerUp.draw(ctx);
        });

        experienceGems.forEach((gem, gemIndex) => {
            ctx.fillStyle = gem.color;
            ctx.fillRect(gem.x, gem.y, gem.width, gem.height);
        });

        detectCollision();

        if (player.powerUpActive) {
            player.powerUpTimer -= 16;
            if (player.powerUpTimer <= 0) {
                player.powerUpActive = false;
                player.weaponType = 'default';
            }
        }

        drawHealthBar();
        drawExperienceBar();

    } else if (gameState === 'game_over') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'white';
        ctx.font = '50px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);

        ctx.font = '20px Arial';
        ctx.fillText('Press R to Restart', canvas.width / 2, canvas.height / 2 + 40);
    }

    requestAnimationFrame(update);
}

function detectCollision() {
    enemies.forEach((enemy, enemyIndex) => {
        projectiles.forEach((projectile, projectileIndex) => {
            if (
                projectile.x < enemy.x + enemy.width &&
                projectile.x + projectile.width > enemy.x &&
                projectile.y < enemy.y + enemy.height &&
                projectile.y + projectile.height > enemy.y
            ) {
                projectiles.splice(projectileIndex, 1);
                enemy.health--;

                if (enemy.health <= 0) {
                    if (enemy.color === 'purple') {
                        powerUps.push(new PowerUp(enemy.x, enemy.y, 'tripleShot'));
                    }
                    experienceGems.push({ x: enemy.x, y: enemy.y, width: 10, height: 10, color: 'lime' });
                    enemies.splice(enemyIndex, 1);
                }
            }
        });

        if (
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y
        ) {
            enemies.splice(enemyIndex, 1);
            player.health -= 10;
            if (player.health <= 0) {
                gameState = 'game_over';
            }
        }
    });

    powerUps.forEach((powerUp, powerUpIndex) => {
        if (
            player.x < powerUp.x + 10 &&
            player.x + player.width > powerUp.x &&
            player.y < powerUp.y + 10 &&
            player.y + player.height > powerUp.y
        ) {
            powerUps.splice(powerUpIndex, 1);
            player.weaponType = powerUp.type;
            player.powerUpActive = true;
            player.powerUpTimer = 5000;
        }
    });

    experienceGems.forEach((gem, gemIndex) => {
        if (
            player.x < gem.x + gem.width &&
            player.x + player.width > gem.x &&
            player.y < gem.y + gem.height &&
            player.y + player.height > gem.y
        ) {
            experienceGems.splice(gemIndex, 1);
            player.experience += 10;
            if (player.experience >= player.maxExperience) {
                levelUp();
            }
        }
    });
}

function drawHealthBar() {
    const barWidth = 200;
    const barHeight = 10;
    const x = 10;
    const y = 10;

    ctx.fillStyle = '#555';
    ctx.fillRect(x, y, barWidth, barHeight);

    const progress = (player.health / player.maxHealth) * barWidth;
    ctx.fillStyle = 'red';
    ctx.fillRect(x, y, progress, barHeight);
}

function drawExperienceBar() {
    const barWidth = 200;
    const barHeight = 10;
    const x = canvas.width / 2 - barWidth / 2;
    const y = 10;

    ctx.fillStyle = '#555';
    ctx.fillRect(x, y, barWidth, barHeight);

    const progress = (player.experience / player.maxExperience) * barWidth;
    ctx.fillStyle = '#0f0';
    ctx.fillRect(x, y, progress, barHeight);

    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText(`Level: ${player.level}`, x, y + 25);
}

function levelUp() {
    player.level++;
    player.experience = 0;
    player.maxExperience *= 1.5;
    console.log(`Level up! New level: ${player.level}`);
}

function restartGame() {
    player.health = player.maxHealth;
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.experience = 0;
    player.level = 1;
    enemies.length = 0;
    projectiles.length = 0;
    powerUps.length = 0;
    experienceGems.length = 0;
    gameState = 'playing';
}

document.addEventListener('keydown', (e) => {
    if (gameState === 'game_over' && e.key === 'r') {
        restartGame();
    }
});

function keyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'd') {
        player.moveRight();
    } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        player.moveLeft();
    } else if (e.key === 'ArrowUp' || e.key === 'w') {
        player.moveUp();
    } else if (e.key === 'ArrowDown' || e.key === 's') {
        player.moveDown();
    }
}

function keyUp(e) {
    if (
        (e.key === 'ArrowRight' || e.key === 'd') && player.dx > 0 ||
        (e.key === 'ArrowLeft' || e.key === 'a') && player.dx < 0
    ) {
        player.stopX();
    }

    if (
        (e.key === 'ArrowUp' || e.key === 'w') && player.dy < 0 ||
        (e.key === 'ArrowDown' || e.key === 's') && player.dy > 0
    ) {
        player.stopY();
    }
}