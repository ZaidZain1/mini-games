const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game elements
const scoreSpan = document.getElementById('score');
const highScoreSpan = document.getElementById('highScore');
const finalScore = document.getElementById('finalScore');
const finalHighScore = document.getElementById('finalHighScore');
const resetBtn = document.getElementById('resetBtn');
const pauseBtn = document.getElementById('pauseBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const resumeBtn = document.getElementById('resumeBtn');
const gameOverMessage = document.getElementById('gameOverMessage');
const pauseMessage = document.getElementById('pauseMessage');

// Sound effects
const eatSound = new Audio('../../assets/sounds/eat.mp3');
const gameOverSound = new Audio('../../assets/sounds/gameover.mp3');

// Game settings
const gridSize = 20;
const canvasSize = 400;
const tileCount = canvasSize / gridSize;
const baseSpeed = 100; // ms between updates
const speedIncrease = 2; // ms speed increase per point

// Game state
let snake = [];
let velocity = { x: 0, y: 0 };
let food = { x: 0, y: 0 };
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gamePaused = false;
let gameLoopTimeout;
let currentSpeed = baseSpeed;

// Initialize game
function initGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  velocity = { x: 1, y: 0 };
  score = 0;
  currentSpeed = baseSpeed;
  scoreSpan.textContent = score;
  highScoreSpan.textContent = highScore;
  placeFood();
  
  // Ensure game messages are hidden
  gameOverMessage.classList.add('hidden');
  pauseMessage.classList.add('hidden');
}

// Main game loop
function gameLoop() {
  if (!gameRunning || gamePaused) return;

  update();
  draw();

  // Adjust speed based on score
  const speed = Math.max(baseSpeed - (score * speedIncrease), 50);
  
  gameLoopTimeout = setTimeout(gameLoop, speed);
}

// Update game state
function update() {
  // Move snake
  const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

  // Check wall collisions
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    endGame();
    return;
  }

  // Check self collision
  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    endGame();
    return;
  }

  snake.unshift(head);

  // Check if food eaten
  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreSpan.textContent = score;
    
    if (score > highScore) {
      highScore = score;
      highScoreSpan.textContent = highScore;
      localStorage.setItem('snakeHighScore', highScore);
    }
    
    placeFood();
    eatSound.play();
  } else {
    snake.pop(); // Remove tail segment
  }
}

// Draw game elements
function draw() {
  // Clear canvas
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  // Draw grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < tileCount; i++) {
    ctx.beginPath();
    ctx.moveTo(i * gridSize, 0);
    ctx.lineTo(i * gridSize, canvasSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * gridSize);
    ctx.lineTo(canvasSize, i * gridSize);
    ctx.stroke();
  }

  // Draw food
  ctx.fillStyle = '#e74c3c';
  ctx.beginPath();
  ctx.arc(
    food.x * gridSize + gridSize / 2,
    food.y * gridSize + gridSize / 2,
    gridSize / 2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Draw snake
  snake.forEach((segment, index) => {
    const isHead = index === 0;
    ctx.fillStyle = isHead ? '#27ae60' : '#2ecc71';
    
    ctx.beginPath();
    ctx.roundRect(
      segment.x * gridSize + 1,
      segment.y * gridSize + 1,
      gridSize - 2,
      gridSize - 2,
      isHead ? 6 : 4
    );
    ctx.fill();

    // Draw eyes on head
    if (isHead) {
      ctx.fillStyle = 'white';
      
      // Left eye
      ctx.beginPath();
      ctx.arc(
        segment.x * gridSize + gridSize / 3,
        segment.y * gridSize + gridSize / 3,
        2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      // Right eye
      ctx.beginPath();
      ctx.arc(
        segment.x * gridSize + gridSize / 3 * 2,
        segment.y * gridSize + gridSize / 3,
        2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  });
}

// Place food randomly
function placeFood() {
  let newFoodPos;
  do {
    newFoodPos = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
  } while (snake.some(segment => segment.x === newFoodPos.x && segment.y === newFoodPos.y));

  food = newFoodPos;
}

// End game
function endGame() {
  gameRunning = false;
  clearTimeout(gameLoopTimeout);
  
  finalScore.textContent = score;
  finalHighScore.textContent = highScore;
  
  gameOverMessage.classList.remove('hidden');
  gameOverSound.play();
}

// Pause game
function togglePause() {
  gamePaused = !gamePaused;
  
  if (gamePaused) {
    pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
    pauseMessage.classList.remove('hidden');
  } else {
    pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    pauseMessage.classList.add('hidden');
    gameLoop();
  }
}

// Reset game
function resetGame() {
  clearTimeout(gameLoopTimeout);
  gameOverMessage.classList.add('hidden');
  pauseMessage.classList.add('hidden');
  gamePaused = false;
  pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
  
  initGame();
  gameRunning = true;
  gameLoop();
}

// Event listeners
window.addEventListener('keydown', e => {
  if (!gameRunning || gamePaused) return;

  switch (e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      if (velocity.y === 1) break;
      velocity = { x: 0, y: -1 };
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      if (velocity.y === -1) break;
      velocity = { x: 0, y: 1 };
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      if (velocity.x === 1) break;
      velocity = { x: -1, y: 0 };
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      if (velocity.x === -1) break;
      velocity = { x: 1, y: 0 };
      break;
    case ' ':
      togglePause();
      break;
  }
});

resetBtn.addEventListener('click', resetGame);
playAgainBtn.addEventListener('click', resetGame);
pauseBtn.addEventListener('click', togglePause);
resumeBtn.addEventListener('click', togglePause);

// Start the game
initGame();
gameRunning = true;
gameLoop();