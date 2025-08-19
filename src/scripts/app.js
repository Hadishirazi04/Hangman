const wordDisplay = document.getElementById('wordDisplay');
const lettersDiv = document.getElementById('letters');
const messageDiv = document.getElementById('message');
const restartBtn = document.getElementById('restartBtn');
const canvas = document.getElementById('hangmanCanvas');
const ctx = canvas.getContext('2d');

let words = [];
let selectedWord = '';
let guessedLetters = [];
let wrongGuesses = 0;
const maxWrong = 6;

// Load words from words.txt
fetch('assets/words.txt')
    .then(res => res.text())
    .then(text => {
        words = text.split('\n').map(w => w.trim()).filter(Boolean);
        startGame();
    });

function startGame() {
    selectedWord = words[Math.floor(Math.random() * words.length)].toUpperCase();
    guessedLetters = [];
    wrongGuesses = 0;
    messageDiv.textContent = '';
    drawHangman();
    displayWord();
    displayLetters();
}

function displayWord() {
    wordDisplay.textContent = selectedWord.split('').map(
        letter => guessedLetters.includes(letter) ? letter : '_'
    ).join(' ');
}

function displayLetters() {
    lettersDiv.innerHTML = '';
    for (let i = 65; i <= 90; i++) {
        const letter = String.fromCharCode(i);
        const btn = document.createElement('button');
        btn.textContent = letter;
        btn.className = 'letter-btn';
        btn.disabled = guessedLetters.includes(letter) || isGameOver();
        btn.onclick = () => guessLetter(letter);
        lettersDiv.appendChild(btn);
    }
}

function guessLetter(letter) {
    if (guessedLetters.includes(letter) || isGameOver()) return;
    guessedLetters.push(letter);
    if (!selectedWord.includes(letter)) {
        wrongGuesses++;
        drawHangman();
    }
    displayWord();
    displayLetters();
    checkGame();
}

function checkGame() {
    if (selectedWord.split('').every(l => guessedLetters.includes(l))) {
        messageDiv.textContent = '🎉 You Win!';
        disableAll();
    } else if (wrongGuesses >= maxWrong) {
        messageDiv.textContent = `😢 You Lose! Word was: ${selectedWord}`;
        disableAll();
    }
}

function isGameOver() {
    return wrongGuesses >= maxWrong || selectedWord.split('').every(l => guessedLetters.includes(l));
}

function disableAll() {
    document.querySelectorAll('.letter-btn').forEach(btn => btn.disabled = true);
}

restartBtn.onclick = startGame;

// Draw hangman on canvas
function drawHangman() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Base
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#43c6ac';
    ctx.beginPath();
    ctx.moveTo(20, 180); ctx.lineTo(180, 180); // ground
    ctx.moveTo(60, 180); ctx.lineTo(60, 20);   // pole
    ctx.lineTo(140, 20);                       // top bar
    ctx.lineTo(140, 40);                       // rope
    ctx.stroke();

    // Draw parts based on wrongGuesses
    if (wrongGuesses > 0) { // Head
        ctx.beginPath();
        ctx.arc(140, 55, 15, 0, Math.PI * 2);
        ctx.stroke();
    }
    if (wrongGuesses > 1) { // Body
        ctx.beginPath();
        ctx.moveTo(140, 70); ctx.lineTo(140, 110);
        ctx.stroke();
    }
    if (wrongGuesses > 2) { // Left arm
        ctx.beginPath();
        ctx.moveTo(140, 80); ctx.lineTo(120, 100);
        ctx.stroke();
    }
    if (wrongGuesses > 3) { // Right arm
        ctx.beginPath();
        ctx.moveTo(140, 80); ctx.lineTo(160, 100);
        ctx.stroke();
    }
    if (wrongGuesses > 4) { // Left leg
        ctx.beginPath();
        ctx.moveTo(140, 110); ctx.lineTo(120, 140);
        ctx.stroke();
    }
    if (wrongGuesses > 5) { // Right leg
        ctx.beginPath();
        ctx.moveTo(140, 110); ctx.lineTo(160, 140);
        ctx.stroke();
    }
}