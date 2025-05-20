const cardSymbols = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'];
const difficultySettings = {
  easy: { pairs: 8, columns: 4 },
  medium: { pairs: 10, columns: 5 },
  hard: { pairs: 12, columns: 6 }
};

let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let timer = 0;
let timerInterval;
let gameStarted = false;

const gameBoard = document.getElementById('gameBoard');
const movesCounter = document.getElementById('moves');
const timerDisplay = document.getElementById('timer');
const matchesCounter = document.getElementById('matches');
const resetBtn = document.getElementById('resetBtn');
const winMessage = document.getElementById('winMessage');
const playAgainBtn = document.getElementById('playAgainBtn');
const finalMoves = document.getElementById('finalMoves');
const finalTime = document.getElementById('finalTime');
const difficultySelect = document.getElementById('difficulty');

function startTimer() {
  if (!gameStarted) {
    gameStarted = true;
    timer = 0;
    timerInterval = setInterval(() => {
      timer++;
      timerDisplay.textContent = `${timer}s`;
    }, 1000);
  }
}

function stopTimer() {
  clearInterval(timerInterval);
  gameStarted = false;
}

function resetTimer() {
  stopTimer();
  timer = 0;
  timerDisplay.textContent = "0s";
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createCards() {
  const selectedDifficulty = difficultySelect.value;
  const settings = difficultySettings[selectedDifficulty];
  
  cards = [];
  const selectedSymbols = cardSymbols.slice(0, settings.pairs);
  const doubleSymbols = [...selectedSymbols, ...selectedSymbols];
  shuffle(doubleSymbols);

  gameBoard.innerHTML = '';
  gameBoard.style.gridTemplateColumns = `repeat(${settings.columns}, 1fr)`;
  
  // Update matches counter display
  matchesCounter.textContent = `0/${settings.pairs}`;

  doubleSymbols.forEach((symbol, index) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.symbol = symbol;
    card.dataset.index = index;
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">${symbol}</div>
        <div class="card-back">?</div>
      </div>
    `;
    card.addEventListener('click', () => flipCard(card));
    cards.push(card);
    gameBoard.appendChild(card);
  });
}

function flipCard(card) {
  if (
    flippedCards.length === 2 ||
    card.classList.contains('flipped') ||
    card.classList.contains('matched')
  ) {
    return;
  }

  startTimer();
  card.classList.add('flipped');
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    moves++;
    movesCounter.textContent = moves;
    checkMatch();
  }
}

function checkMatch() {
  const selectedDifficulty = difficultySelect.value;
  const settings = difficultySettings[selectedDifficulty];
  
  const [card1, card2] = flippedCards;
  const symbol1 = card1.dataset.symbol;
  const symbol2 = card2.dataset.symbol;

  if (symbol1 === symbol2) {
    card1.classList.add('matched');
    card2.classList.add('matched');
    matchedPairs++;
    matchesCounter.textContent = `${matchedPairs}/${settings.pairs}`;
    flippedCards = [];

    if (matchedPairs === settings.pairs) {
      setTimeout(() => {
        stopTimer();
        showWinMessage();
      }, 500);
    }
  } else {
    setTimeout(() => {
      card1.classList.remove('flipped');
      card2.classList.remove('flipped');
      flippedCards = [];
    }, 1000);
  }
}

function showWinMessage() {
  finalMoves.textContent = moves;
  finalTime.textContent = timer;
  winMessage.classList.add('visible');
}

function resetGame() {
  const selectedDifficulty = difficultySelect.value;
  const settings = difficultySettings[selectedDifficulty];
  
  moves = 0;
  matchedPairs = 0;
  movesCounter.textContent = moves;
  matchesCounter.textContent = `0/${settings.pairs}`;
  flippedCards = [];
  resetTimer();
  winMessage.classList.remove('visible');
  createCards();
}

// Event Listeners
resetBtn.addEventListener('click', resetGame);
playAgainBtn.addEventListener('click', resetGame);
difficultySelect.addEventListener('change', resetGame);

// Initialize game
resetGame();