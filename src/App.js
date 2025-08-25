import React, { useState, useEffect } from "react";
import "./App.css";

const CATEGORIES = ["Animals", "Fruits", "Tech", "Nature", "Misc"];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const MAX_WRONG = 6;

const DIFFICULTY = {
  easy: 5,
  medium: 7,
  hard: Infinity
};

const CATEGORY_PREFIXES = {
  Animals: "animal",
  Fruits: "fruit",
  Tech: "tech",
  Nature: "nature",
  Misc: "misc"
};

function getFilteredWords(difficulty, category, customWords, words) {
  let pool;
  if (customWords.length > 0) {
    pool = customWords;
  } else if (category) {
    const prefix = CATEGORY_PREFIXES[category];
    pool = words
      .filter(w => w.startsWith(prefix + ":"))
      .map(w => w.split(":")[1]);
  } else {
    pool = words.map(w => w.includes(":") ? w.split(":")[1] : w);
  }
  const maxLen = DIFFICULTY[difficulty];
  return pool.filter(word => word.length <= maxLen);
}

function getRandomWord(words) {
  if (!words || words.length === 0) return null;
  return words[Math.floor(Math.random() * words.length)].toUpperCase();
}

function getRandomLetter(word, guessed) {
  const unguessed = word.split("").filter(l => !guessed.includes(l));
  if (unguessed.length === 0) return null;
  return unguessed[Math.floor(Math.random() * unguessed.length)];
}

function getTimerForDifficulty(difficulty) {
  if (difficulty === "easy") return 60;
  if (difficulty === "medium") return 105;
  if (difficulty === "hard") return 150;   
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function App() {
  const [words, setWords] = useState([]);
  const [difficulty, setDifficulty] = useState(null);
  const [category, setCategory] = useState(null);
  const [customWords, setCustomWords] = useState([]);
  const [word, setWord] = useState("");
  const [guessed, setGuessed] = useState([]);
  const [wrong, setWrong] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [score, setScore] = useState({ wins: 0, losses: 0 });
  const [hintUsed, setHintUsed] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [timer, setTimer] = useState(60);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + "/words.txt")
      .then(res => res.text())
      .then(text => {
        const loadedWords = text.split(/\r?\n/).map(w => w.trim().toLowerCase()).filter(w => w.length > 0);
        setWords(loadedWords);
      });
  }, []);

  const playSound = (type) => {
  };

  useEffect(() => {
    if (difficulty && (category || customWords.length > 0)) {
      const wordsPool = getFilteredWords(difficulty, category, customWords, words);
      const randomWord = getRandomWord(wordsPool);
      const initialTimer = getTimerForDifficulty(difficulty);
      if (!randomWord) {
        setWord("");
        setGameOver(true);
        setWin(false);
        setHintUsed(false);
        setTimerActive(false);
        setTimer(initialTimer);
        return;
      }
      setWord(randomWord);
      setGuessed([]);
      setWrong(0);
      setGameOver(false);
      setWin(false);
      setHintUsed(false);
      setTimer(initialTimer);
      setTimerActive(true);
    }
  }, [difficulty, category, customWords, words]);

  useEffect(() => {
    if (!word) return;
    const isWin = word.split("").every((l) => guessed.includes(l));
    if (isWin) {
      setWin(true);
      setGameOver(true);
      setScore(s => ({ ...s, wins: s.wins + 1 }));
      setTimerActive(false);
      playSound("win");
    } else if (wrong >= MAX_WRONG) {
      setGameOver(true);
      setScore(s => ({ ...s, losses: s.losses + 1 }));
      setTimerActive(false);
      playSound("lose");
    }
  }, [guessed, wrong, word]);

  useEffect(() => {
    if (timerActive && !gameOver) {
      if (timer === 0) {
        setGameOver(true);
        setScore(s => ({ ...s, losses: s.losses + 1 }));
        setTimerActive(false);
        playSound("lose");
      }
      const interval = setInterval(() => setTimer(t => t > 0 ? t - 1 : 0), 1000);
      return () => clearInterval(interval);
    }
  }, [timerActive, timer, gameOver]);

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
    if (!word.includes(letter)) {
      setWrong(wrong + 1);
      playSound("wrong");
    } else {
      playSound("correct");
    }
  };

  const handleRestart = () => {
    const wordsPool = getFilteredWords(difficulty, category, customWords, words);
    const initialTimer = getTimerForDifficulty(difficulty);
    setWord(getRandomWord(wordsPool));
    setGuessed([]);
    setWrong(0);
    setGameOver(false);
    setWin(false);
    setHintUsed(false);
    setTimer(initialTimer);
    setTimerActive(true);
  };

  const handleDifficultySelect = (level) => {
    setDifficulty(level);
    setCategory(null);
    setCustomWords([]);
    setShowCustomInput(false);
  };

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    setCustomWords([]);
    setShowCustomInput(false);
  };

  const handleHint = () => {
    if (hintUsed || gameOver) return;
    const hintLetter = getRandomLetter(word, guessed);
    if (hintLetter) {
      setGuessed([...guessed, hintLetter]);
      setHintUsed(true);
      playSound("hint");
    }
  };

  const handleCustomInput = () => {
    const words = customInput
      .split(",")
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length > 0);
    if (words.length > 0) {
      setCustomWords(words);
      setCategory(null);
      setShowCustomInput(false);
      setCustomInput("");
    }
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
        aria-label={`Guess letter ${l}`}
      >
        {l}
      </button>
    );

  const usedCorrect = guessed.filter(l => word.includes(l));
  const usedWrong = guessed.filter(l => !word.includes(l));

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

  if (!category && customWords.length === 0) {
    return (
      <div className="container">
        <h1>Hangman</h1>
        <div className="category-select">
          <h2>Select Category</h2>
          {CATEGORIES.map(cat =>
            <button key={cat} className="category-btn" onClick={() => handleCategorySelect(cat)}>{cat}</button>
          )}
          <button className="category-btn" onClick={() => setShowCustomInput(true)}>Custom Word(s)</button>
        </div>
        {showCustomInput && (
          <div style={{ marginTop: 16 }}>
            <input
              type="text"
              placeholder="Enter comma-separated words"
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              style={{ width: 220, marginRight: 8 }}
              aria-label="Custom words"
            />
            <button onClick={handleCustomInput}>Start</button>
          </div>
        )}
        <button className="restart-btn" style={{ marginTop: 16 }} onClick={() => setDifficulty(null)}>Back</button>
      </div>
    );
  }

  if (difficulty && (category || customWords.length > 0) && !word) {
    return (
      <div className="container">
        <h1>Hangman</h1>
        <div style={{ color: "red", margin: "20px 0" }}>
          No words available for this difficulty and category.<br />
          <button className="restart-btn" onClick={() => { setCategory(null); setCustomWords([]); }}>Choose Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Hangman</h1>
      <div style={{ marginBottom: "8px", fontWeight: "bold" }}>
        Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        {category && <span> | Category: {category}</span>}
        {customWords.length > 0 && <span> | Custom</span>}
      </div>
      <div style={{ marginBottom: 8 }}>
        <span style={{ marginRight: 16 }}>Wins: {score.wins}</span>
        <span>Losses: {score.losses}</span>
      </div>
      <div style={{ marginBottom: 8 }}>
        <span>⏰ Time left: {formatTime(timer)}</span>
      </div>
      <HangmanDrawing wrong={wrong} />
      <div className="word" aria-label="Word to guess">{renderWord()}</div>
      <div className="letters">{renderButtons()}</div>
      <div className="used-letters">
        <div>
          <span style={{ color: "green" }}>Correct: </span>
          {usedCorrect.map(l => <span key={l} style={{ marginRight: 4 }}>{l}</span>)}
        </div>
        <div>
          <span style={{ color: "red" }}>Wrong: </span>
          {usedWrong.map(l => <span key={l} style={{ marginRight: 4 }}>{l}</span>)}
        </div>
      </div>
      <div className="message" aria-live="polite">
        {win && "🎉 You Win!"}
        {!win && gameOver && `😢 You Lose! Word was: ${word}`}
      </div>
      <button className="restart-btn" onClick={handleRestart}>Restart</button>
      <button className="restart-btn" style={{ marginLeft: "10px" }} onClick={() => { setDifficulty(null); setCategory(null); setCustomWords([]); }}>Change Difficulty</button>
      <button className="restart-btn" style={{ marginLeft: "10px" }} onClick={handleHint} disabled={hintUsed || gameOver}>Hint</button>
    </div>
  );
}

function HangmanDrawing({ wrong }) {
  return (
    <svg width="200" height="200" className="hangman-svg" aria-label="Hangman drawing">
      {/* Base */}
      <line x1="20" y1="180" x2="180" y2="180" stroke="#43c6ac" strokeWidth="4" />
      <line x1="60" y1="180" x2="60" y2="20" stroke="#43c6ac" strokeWidth="4" />
      <line x1="60" y1="20" x2="140" y2="20" stroke="#43c6ac" strokeWidth="4" />
      <line x1="140" y1="20" x2="140" y2="40" stroke="#43c6ac" strokeWidth="4" />
      {/* Head */}
      {wrong > 0 && <circle cx="140" cy="55" r="15" stroke="#43c6ac" strokeWidth="4" fill="none" style={{ transition: "all 0.3s" }} />}
      {/* Body */}
      {wrong > 1 && <line x1="140" y1="70" x2="140" y2="110" stroke="#43c6ac" strokeWidth="4" style={{ transition: "all 0.3s" }} />}
      {/* Left Arm */}
      {wrong > 2 && <line x1="140" y1="80" x2="120" y2="100" stroke="#43c6ac" strokeWidth="4" style={{ transition: "all 0.3s" }} />}
      {/* Right Arm */}
      {wrong > 3 && <line x1="140" y1="80" x2="160" y2="100" stroke="#43c6ac" strokeWidth="4" style={{ transition: "all 0.3s" }} />}
      {/* Left Leg */}
      {wrong > 4 && <line x1="140" y1="110" x2="120" y2="140" stroke="#43c6ac" strokeWidth="4" style={{ transition: "all 0.3s" }} />}
      {/* Right Leg */}
      {wrong > 5 && <line x1="140" y1="110" x2="160" y2="140" stroke="#43c6ac" strokeWidth="4" style={{ transition: "all 0.3s" }} />}
    </svg>
  );
}

export default App;
