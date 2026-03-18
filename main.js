const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ecrãs e Botões
const startScreen = document.getElementById('start-screen');
const winScreen = document.getElementById('win-screen');
const gameOverScreen = document.getElementById('gameover-screen');
const startButton = document.getElementById('startButton');
const restartButtons = document.querySelectorAll('.restart-button');
const winScoreSpan = document.getElementById('win-score');
const gameOverScoreSpan = document.getElementById('gameover-score');

// Sons
const brickSound = document.getElementById('brick-sound');
const paddleSound = document.getElementById('paddle-sound');
const lifeSound = document.getElementById('life-sound');
const winSound = document.getElementById('win-sound');
const gameOverSound = document.getElementById('gameover-sound');

// Paddle
const PADDLE_START_WIDTH = 100;
const paddleHeight = 15;
let paddleWidth = PADDLE_START_WIDTH;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;
const paddleSpeed = 7;
let widenPaddleTimeout;

// Ball
const ballRadius = 12;
let balls = [];
let fireballTimeout;

// Bricks
const brickRowCount = 4;
const brickColumnCount = 6;
const brickWidth = 90;
const brickHeight = 25;
const brickPadding = 12;
const brickOffsetTop = 50;
const brickOffsetLeft = 35;
const brickColors = ['#ff00ff', '#ff33cc', '#ff6699', '#ff9966'];
let bricks = [];

// Game State
let score;
let lives;
let level;
let gameStarted = false;
let animationFrameId;

// Efeitos e Power-ups
let particles = [];
let powerUps = [];
const POWERUP_CHANCE = 0.35; // 35% de chance
const powerUpTypes = ['widenPaddle', 'multiBall', 'fireball', 'extraLife'];

// --- Funções de Desenho ---
function drawBalls() {
  balls.forEach(ball => {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = ball.isFireball ? '#ff8c00' : '#ff00ff'; // Laranja para fireball
    ctx.shadowColor = ball.isFireball ? '#ff8c00' : '#ff00ff';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.closePath();
  });
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = '#00ffff';
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 15;
  ctx.fill();
  ctx.closePath();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}

function drawHeart(x, y, width, height, color) {
    ctx.save();
    ctx.beginPath();
    const topCurveHeight = height * 0.3;
    ctx.moveTo(x + width / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x, y, x, y + height * 0.7, x + width / 2, y + height);
    ctx.bezierCurveTo(x + width, y + height * 0.7, x + width, y, x + width / 2, y + topCurveHeight);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.restore();
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = bricks[c][r].x, brickY = bricks[c][r].y;
        if (level === 1) {
            ctx.beginPath();
            ctx.rect(brickX, brickY, brickWidth, brickHeight);
            const gradient = ctx.createLinearGradient(brickX, brickY, brickX + brickWidth, brickY);
            gradient.addColorStop(0, bricks[c][r].color);
            gradient.addColorStop(1, '#ffffff');
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.closePath();
        } else { // Level 2
            drawHeart(brickX, brickY, brickWidth, brickHeight, bricks[c][r].color);
        }
      }
    }
  }
}

function drawScore() {
  ctx.font = "24px 'Press Start 2P', cursive";
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`Score: ${score} | Level: ${level}`, 20, 35);
}

function drawLives() {
  ctx.font = "24px 'Press Start 2P', cursive";
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Lives: ' + lives, canvas.width - 200, 35);
}

// --- Lógica de Efeitos e Power-ups ---

function createParticles(brick) {
    for (let i = 0; i < 15; i++) {
        particles.push({x: brick.x + brickWidth / 2, y: brick.y + brickHeight / 2, dx: (Math.random() - 0.5) * 3, dy: (Math.random() - 0.5) * 3, radius: Math.random() * 3 + 1, color: brick.color, life: 30});
    }
}

function handleParticles() {
    particles.forEach((p, i) => {
        p.x += p.dx; p.y += p.dy; p.life--;
        if (p.life <= 0) { particles.splice(i, 1); } 
        else { ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.globalAlpha = p.life / 30; ctx.fill(); ctx.closePath(); }
    });
    ctx.globalAlpha = 1.0;
}

function createPowerUp(brick) {
    if (Math.random() < POWERUP_CHANCE) {
        const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        powerUps.push({x: brick.x + brickWidth / 2, y: brick.y + brickHeight / 2, type: type, size: 15});
    }
}

function handlePowerUps() {
    powerUps.forEach((p, i) => {
        p.y += 2;
        const textMap = { widenPaddle: 'W', multiBall: 'M', fireball: 'F', extraLife: '+'};
        const colorMap = { widenPaddle: '#00ffff', multiBall: '#ffff00', fireball: '#ff8c00', extraLife: '#ff00ff'};
        ctx.font = 'bold 20px sans-serif'; ctx.fillStyle = colorMap[p.type]; ctx.shadowColor = colorMap[p.type]; ctx.shadowBlur = 10;
        ctx.fillText(textMap[p.type], p.x - 8, p.y + 7);
        ctx.shadowBlur = 0;

        if (p.y + p.size > canvas.height - paddleHeight && p.x > paddleX && p.x < paddleX + paddleWidth) {
            activatePowerUp(p.type);
            powerUps.splice(i, 1);
        } else if (p.y > canvas.height) {
            powerUps.splice(i, 1);
        }
    });
}

function activatePowerUp(type) {
    if (type === 'widenPaddle') {
        if (widenPaddleTimeout) clearTimeout(widenPaddleTimeout);
        paddleWidth = PADDLE_START_WIDTH * 1.5;
        widenPaddleTimeout = setTimeout(() => { paddleWidth = PADDLE_START_WIDTH; }, 10000);
    } else if (type === 'multiBall') {
        const newBall1 = createNewBall();
        const newBall2 = createNewBall();
        newBall1.dx = -newBall1.dx;
        balls.push(newBall1, newBall2);
    } else if (type === 'fireball') {
        if (fireballTimeout) clearTimeout(fireballTimeout);
        balls.forEach(ball => ball.isFireball = true);
        fireballTimeout = setTimeout(() => { balls.forEach(ball => ball.isFireball = false); }, 8000);
    } else if (type === 'extraLife') {
        lives++;
    }
}

// --- Lógica do Jogo ---

function initBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: c*(brickWidth+brickPadding)+brickOffsetLeft, y: r*(brickHeight+brickPadding)+brickOffsetTop, status: 1, color: brickColors[r] };
        }
    }
}

function createNewBall() {
    const speed = level === 1 ? 3 : 4;
    return { x: canvas.width / 2, y: canvas.height - 30, dx: speed * (Math.random() > 0.5 ? 1 : -1), dy: -speed, isFireball: false };
}

function resetLevel() {
    balls = [createNewBall()];
    paddleX = (canvas.width - paddleWidth) / 2;
}

function collisionDetection() {
  // Parte 1: Detectar e processar todas as colisões neste frame
  balls.forEach(ball => {
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        const b = bricks[c][r];
        if (b.status === 1) {
          if (ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
            if (!ball.isFireball) {
              ball.dy = -ball.dy;
            }
            b.status = 0;
            score++;
            brickSound.play();
            createParticles(b);
            createPowerUp(b);
          }
        }
      }
    }
  });

  // Parte 2: Verificar o estado do nível DEPOIS de todas as colisões
  let bricksLeft = 0;
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        bricksLeft++;
      }
    }
  }

  // Parte 3: Decidir o que fazer
  if (bricksLeft === 0) {
    if (level === 1) {
      // Avança para o nível 2
      level++;
      initBricks(); // Prepara os tijolos do próximo nível
      resetLevel(); // Coloca a bola na posição inicial
    } else {
      // Venceu o jogo (passou todos os níveis)
      showWinScreen();
    }
  }
}

function updateBallPositions() {
    balls.forEach((ball, index) => {
        ball.x += ball.dx; ball.y += ball.dy;
        if (ball.x + ball.dx > canvas.width - ballRadius || ball.x + ball.dx < ballRadius) ball.dx = -ball.dx;
        if (ball.y + ball.dy < ballRadius) ball.dy = -ball.dy;
        else if (ball.y + ball.dy > canvas.height - ballRadius) {
            if (ball.x > paddleX && ball.x < paddleX + paddleWidth) {
                ball.dy = -ball.dy;
                paddleSound.play();
            } else {
                balls.splice(index, 1);
            }
        }
    });

    if (balls.length === 0) {
        lives--;
        lifeSound.play();
        if (!lives) { showGameOverScreen(); }
        else { resetLevel(); }
    }
}

function updatePaddlePosition() {
    if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += paddleSpeed;
    else if (leftPressed && paddleX > 0) paddleX -= paddleSpeed;
}

function draw() {
  if (!gameStarted) return;
  ctx.fillStyle = 'rgba(26, 10, 42, 0.25)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawPaddle();
  handleParticles();
  handlePowerUps();
  drawBalls();
  drawScore();
  drawLives();
  collisionDetection();
  updateBallPositions();
  updatePaddlePosition();
  animationFrameId = requestAnimationFrame(draw);
}

// --- Controlo de Estado do Jogo ---

function showWinScreen() {
    gameStarted = false; winSound.play();
    cancelAnimationFrame(animationFrameId);
    canvas.style.display = 'none';
    winScoreSpan.textContent = score;
    winScreen.style.display = 'block';
}

function showGameOverScreen() {
    gameStarted = false; gameOverSound.play();
    cancelAnimationFrame(animationFrameId);
    canvas.style.display = 'none';
    gameOverScoreSpan.textContent = score;
    gameOverScreen.style.display = 'block';
}

function startGame() {
  startScreen.style.display = 'none'; winScreen.style.display = 'none'; gameOverScreen.style.display = 'none';
  canvas.style.display = 'block';
  score = 0; lives = 3; level = 1; rightPressed = false; leftPressed = false;
  paddleWidth = PADDLE_START_WIDTH;
  particles = []; powerUps = [];
  if (widenPaddleTimeout) clearTimeout(widenPaddleTimeout);
  if (fireballTimeout) clearTimeout(fireballTimeout);

  initBricks();
  resetLevel();
  
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  gameStarted = true;
  draw();
}

// --- Event Listeners ---

document.addEventListener('keydown', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = true;
    else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = true;
});
document.addEventListener('keyup', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = false;
    else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = false;
});
document.addEventListener('mousemove', (e) => {
  const relativeX = e.clientX - canvas.offsetLeft;
  if (gameStarted && relativeX > paddleWidth / 2 && relativeX < canvas.width - paddleWidth / 2) {
    paddleX = relativeX - paddleWidth / 2;
  }
});

startButton.addEventListener('click', startGame);
restartButtons.forEach(button => button.addEventListener('click', startGame));
