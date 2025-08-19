import React, { useState, useEffect } from "react";
import "./App.css";

const WORDS = [
  "apple", "banana", "orange", "elephant", "giraffe", "computer", "keyboard",
  "javascript", "react", "developer", "mountain", "ocean", "sunshine",
  "butterfly", "diamond", "rainbow", "chocolate", "adventure", "whisper", "library"
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const MAX_WRONG = 6;

const DIFFICULTY = {
  easy: 5,
  medium: 7,
  hard: Infinity
};

function getFilteredWords(difficulty) {
  const maxLen = DIFFICULTY[difficulty];
  return WORDS.filter(word => word.length <= maxLen);
}

function getRandomWord(words) {
  return words[Math.floor(Math.random() * words.length)].toUpperCase();
}

function App() {
  const [difficulty, setDifficulty] = useState(null);
  const [word, setWord] = useState("");
  const [guessed, setGuessed] = useState([]);
  const [wrong, setWrong] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);

  useEffect(() => {
    if (difficulty) {
      const wordsPool = difficulty === "hard" ? WORDS : getFilteredWords(difficulty);
      setWord(getRandomWord(wordsPool));
      setGuessed([]);
      setWrong(0);
      setGameOver(false);
      setWin(false);
    }
  }, [difficulty]);

  useEffect(() => {
    if (!word) return;
    const isWin = word.split("").every((l) => guessed.includes(l));
    if (isWin) {
      setWin(true);
      setGameOver(true);
    } else if (wrong >= MAX_WRONG) {
      setGameOver(true);
    }
  }, [guessed, wrong, word]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const letter = e.key.toUpperCase();
      if (
        ALPHABET.includes(letter) &&
        !guessed.includes(letter) &&
        !gameOver &&
        word
      ) {
        handleGuess(letter);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [guessed, gameOver, word]);

  const handleGuess = (letter) => {
    if (gameOver || guessed.includes(letter)) return;
    setGuessed([...guessed, letter]);
    if (!word.includes(letter)) setWrong(wrong + 1);
  };

  const handleRestart = () => {
    const wordsPool = difficulty === "hard" ? WORDS : getFilteredWords(difficulty);
    setWord(getRandomWord(wordsPool));
    setGuessed([]);
    setWrong(0);
    setGameOver(false);
    setWin(false);
  };

  const handleDifficultySelect = (level) => {
    setDifficulty(level);
  };

  const renderWord = () =>
    word.split("").map((l, i) =>
      <span key={i} className="letter">
        {guessed.includes(l) || gameOver ? l : "_"}
      </span>
    );

  const renderButtons = () =>
    ALPHABET.map((l) =>
      <button
        key={l}
        className="letter-btn"
        onClick={() => handleGuess(l)}
        disabled={guessed.includes(l) || gameOver}
      >
        {l}
      </button>
    );

  if (!difficulty) {
    return (
      <div className="container">
        <h1>Hangman</h1>
        <div className="difficulty-select">
          <h2>Select Difficulty</h2>
          <button className="difficulty-btn" onClick={() => handleDifficultySelect("easy")}>Easy</button>
          <button className="difficulty-btn" onClick={() => handleDifficultySelect("medium")}>Medium</button>
          <button className="difficulty-btn" onClick={() => handleDifficultySelect("hard")}>Hard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Hangman</h1>
      <div style={{ marginBottom: "8px", fontWeight: "bold" }}>
        Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </div>
      <HangmanDrawing wrong={wrong} />
      <div className="word">{renderWord()}</div>
      <div className="letters">{renderButtons()}</div>
      <div className="message">
        {win && "🎉 You Win!"}
        {!win && gameOver && `😢 You Lose! Word was: ${word}`}
      </div>
      <button className="restart-btn" onClick={handleRestart}>Restart</button>
      <button className="restart-btn" style={{marginLeft: "10px"}} onClick={() => setDifficulty(null)}>Change Difficulty</button>
    </div>
  );
}

function HangmanDrawing({ wrong }) {
  // SVG drawing for hangman
  return (
    <svg width="200" height="200" className="hangman-svg">
      {/* Base */}
      <line x1="20" y1="180" x2="180" y2="180" stroke="#43c6ac" strokeWidth="4" />
      <line x1="60" y1="180" x2="60" y2="20" stroke="#43c6ac" strokeWidth="4" />
      <line x1="60" y1="20" x2="140" y2="20" stroke="#43c6ac" strokeWidth="4" />
      <line x1="140" y1="20" x2="140" y2="40" stroke="#43c6ac" strokeWidth="4" />
      {/* Head */}
      {wrong > 0 && <circle cx="140" cy="55" r="15" stroke="#43c6ac" strokeWidth="4" fill="none" />}
      {/* Body */}
      {wrong > 1 && <line x1="140" y1="70" x2="140" y2="110" stroke="#43c6ac" strokeWidth="4" />}
      {/* Left Arm */}
      {wrong > 2 && <line x1="140" y1="80" x2="120" y2="100" stroke="#43c6ac" strokeWidth="4" />}
      {/* Right Arm */}
      {wrong > 3 && <line x1="140" y1="80" x2="160" y2="100" stroke="#43c6ac" strokeWidth="4" />}
      {/* Left Leg */}
      {wrong > 4 && <line x1="140" y1="110" x2="120" y2="140" stroke="#43c6ac" strokeWidth="4" />}
      {/* Right Leg */}
      {wrong > 5 && <line x1="140" y1="110" x2="160" y2="140" stroke="#43c6ac" strokeWidth="4" />}
    </svg>
  );
}

export default App;
