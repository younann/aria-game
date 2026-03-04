import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../systems/GameState";
import { MISSIONS, CONCEPT_CARDS } from "../systems/MissionConfig";
import { playSound } from "../systems/SoundManager";
import { useI18n } from "../systems/I18nContext";
import AriaInsight from "../ui/AriaInsight";
import useViewport from "../hooks/useViewport";

// --- Constants ---

const PATTERN_SYMBOLS = ["\u25C6", "\u25CF", "\u25B2", "\u25A0", "\u2605"];
const NOISE_SYMBOLS = ["\u25CB", "\u25A1", "\u25B3", "\u25C7", "\u2606", "\u2662", "\u2666", "\u2281", "\u2295", "\u2298"];

const CYAN = "#06b6d4";
const GREEN = "#10b981";
const RED = "#f43f5e";
const ORANGE = "#f97316";

// --- Pattern Generation Utilities ---

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const PATTERN_TYPES = ["hline", "vline", "diag", "lshape", "tshape", "square", "cross"];

function tryGeneratePattern(type, gridSize) {
  switch (type) {
    case "hline": {
      const len = randInt(3, Math.min(5, gridSize));
      const row = randInt(0, gridSize - 1);
      const col = randInt(0, gridSize - len);
      return Array.from({ length: len }, (_, i) => ({ row, col: col + i }));
    }
    case "vline": {
      const len = randInt(3, Math.min(5, gridSize));
      const row = randInt(0, gridSize - len);
      const col = randInt(0, gridSize - 1);
      return Array.from({ length: len }, (_, i) => ({ row: row + i, col }));
    }
    case "diag": {
      const len = randInt(3, Math.min(5, gridSize));
      const dir = Math.random() > 0.5 ? 1 : -1;
      const row = randInt(0, gridSize - len);
      const col = dir === 1 ? randInt(0, gridSize - len) : randInt(len - 1, gridSize - 1);
      return Array.from({ length: len }, (_, i) => ({ row: row + i, col: col + dir * i }));
    }
    case "lshape": {
      const stemLen = randInt(3, Math.min(4, gridSize - 1));
      const armLen = randInt(2, Math.min(3, gridSize - 1));
      const row = randInt(0, gridSize - stemLen);
      const col = randInt(0, gridSize - armLen);
      const cells = Array.from({ length: stemLen }, (_, i) => ({ row: row + i, col }));
      for (let i = 1; i < armLen; i++) {
        cells.push({ row: row + stemLen - 1, col: col + i });
      }
      return cells;
    }
    case "tshape": {
      const topLen = Math.min(randInt(3, 5), gridSize);
      const stemLen = Math.min(randInt(2, 3), gridSize - 1);
      const row = randInt(0, gridSize - stemLen - 1);
      const col = randInt(0, gridSize - topLen);
      const midCol = col + Math.floor(topLen / 2);
      const cells = Array.from({ length: topLen }, (_, i) => ({ row, col: col + i }));
      for (let i = 1; i <= stemLen; i++) {
        cells.push({ row: row + i, col: midCol });
      }
      return cells;
    }
    case "square": {
      const size = gridSize >= 6 ? randInt(2, 3) : 2;
      const row = randInt(0, gridSize - size);
      const col = randInt(0, gridSize - size);
      const cells = [];
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (size <= 2 || r === 0 || r === size - 1 || c === 0 || c === size - 1) {
            cells.push({ row: row + r, col: col + c });
          }
        }
      }
      return cells;
    }
    case "cross": {
      const arm = 1;
      const centerRow = randInt(arm, gridSize - arm - 1);
      const centerCol = randInt(arm, gridSize - arm - 1);
      return [
        { row: centerRow, col: centerCol },
        { row: centerRow - 1, col: centerCol },
        { row: centerRow + 1, col: centerCol },
        { row: centerRow, col: centerCol - 1 },
        { row: centerRow, col: centerCol + 1 },
      ];
    }
    default:
      return null;
  }
}

function generatePatternCells(type, gridSize) {
  for (let attempt = 0; attempt < 50; attempt++) {
    const cells = tryGeneratePattern(type, gridSize);
    if (cells && cells.every((c) => c.row >= 0 && c.row < gridSize && c.col >= 0 && c.col < gridSize)) {
      return cells;
    }
  }
  // Fallback: short horizontal line
  const len = Math.min(3, gridSize);
  return Array.from({ length: len }, (_, i) => ({ row: 0, col: i }));
}

function generateRound(gridSize, noiseLevel, overlapping) {
  const patternType = pick(PATTERN_TYPES);
  const targetSymbol = pick(PATTERN_SYMBOLS);
  const patternCells = generatePatternCells(patternType, gridSize);

  // Build empty grid
  const grid = Array.from({ length: gridSize * gridSize }, () => ({
    symbol: "",
    isPattern: false,
    isDistractor: false,
  }));

  // Place target pattern
  const patternIndices = new Set();
  for (const cell of patternCells) {
    const idx = cell.row * gridSize + cell.col;
    grid[idx] = { symbol: targetSymbol, isPattern: true, isDistractor: false };
    patternIndices.add(idx);
  }

  let distractorSymbol = null;
  const distractorIndices = new Set();

  // If overlapping (Level 3), place a second distractor pattern
  if (overlapping) {
    const availableSymbols = PATTERN_SYMBOLS.filter((s) => s !== targetSymbol);
    distractorSymbol = pick(availableSymbols);
    let distractorCells;
    let attempts = 0;

    // Keep trying until distractor doesn't fully overlap target
    do {
      const dType = pick(PATTERN_TYPES);
      distractorCells = generatePatternCells(dType, gridSize);
      const dIndices = distractorCells.map((c) => c.row * gridSize + c.col);
      const overlapCount = dIndices.filter((i) => patternIndices.has(i)).length;
      if (overlapCount < distractorCells.length * 0.5) break;
      attempts++;
    } while (attempts < 30);

    for (const cell of distractorCells) {
      const idx = cell.row * gridSize + cell.col;
      if (!patternIndices.has(idx)) {
        grid[idx] = { symbol: distractorSymbol, isPattern: false, isDistractor: true };
        distractorIndices.add(idx);
      }
    }
  }

  // Fill remaining cells with noise or leave empty
  for (let i = 0; i < grid.length; i++) {
    if (!patternIndices.has(i) && !distractorIndices.has(i)) {
      if (noiseLevel > 0 && Math.random() < noiseLevel) {
        grid[i] = { symbol: pick(NOISE_SYMBOLS), isPattern: false, isDistractor: false };
      } else {
        grid[i] = { symbol: "", isPattern: false, isDistractor: false };
      }
    }
  }

  return {
    grid,
    patternCells: [...patternIndices],
    targetSymbol,
    distractorSymbol,
  };
}

// --- Concept Card Helpers ---

const LEVEL_CARDS = {
  1: ["feature_detection", "pattern_recognition"],
  2: ["noise_filtering"],
  3: ["computer_vision"],
};

function awardCards(level, dispatch) {
  const cardIds = LEVEL_CARDS[level] || [];
  for (const id of cardIds) {
    const card = CONCEPT_CARDS.find((c) => c.id === id);
    if (card) {
      dispatch({
        type: "ADD_CODEX_CARD",
        payload: {
          id: card.id,
          title: card.title,
          description: card.description,
          realWorld: card.realWorld,
          rarity: card.rarity,
          icon: card.icon,
        },
      });
    }
  }
}

// --- Phase Constants ---

const PHASE_SCANNING = "scanning";
const PHASE_TARGET_REVEAL = "target_reveal";
const PHASE_PLAY = "play";
const PHASE_RESULT = "result";
const PHASE_COMPLETE = "complete";

// --- Component ---

export default function PatternScanner({ level = 1, onComplete }) {
  const { dispatch } = useGame();
  const { t } = useI18n();
  const { width: vw, isMobile } = useViewport();
  const config = MISSIONS.opticslab.levels[level];
  const { gridSize, noiseLevel, rounds: totalRounds, starThresholds, overlapping } = config;

  const [round, setRound] = useState(1);
  const [roundsCorrect, setRoundsCorrect] = useState(0);
  const [phase, setPhase] = useState(PHASE_SCANNING);
  const [roundData, setRoundData] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [feedback, setFeedback] = useState(null);
  const [dots, setDots] = useState("");
  const timerRef = useRef(null);

  const [insights, setInsights] = useState([]);
  const pushInsight = useCallback((msg) => {
    const id = `insight-${Date.now()}`;
    setInsights((prev) => [...prev, { id, message: msg }]);
  }, []);
  const dismissInsight = useCallback((id) => {
    setInsights((prev) => prev.filter((i) => i.id !== id));
  }, []);

  // Animated dots for scanning phase
  useEffect(() => {
    if (phase === PHASE_SCANNING) {
      let count = 0;
      const interval = setInterval(() => {
        count = (count + 1) % 4;
        setDots(".".repeat(count));
      }, 150);
      return () => clearInterval(interval);
    }
  }, [phase]);

  // Start a new round
  const startRound = useCallback(
    (roundNum) => {
      setRound(roundNum);
      setSelected(new Set());
      setFeedback(null);
      setPhase(PHASE_SCANNING);

      const data = generateRound(gridSize, noiseLevel, !!overlapping);
      setRoundData(data);

      // Scanning phase lasts 0.5s, then target reveal (L3) or play
      timerRef.current = setTimeout(() => {
        if (overlapping) {
          setPhase(PHASE_TARGET_REVEAL);
          timerRef.current = setTimeout(() => {
            setPhase(PHASE_PLAY);
          }, 3000);
        } else {
          setPhase(PHASE_PLAY);
        }
      }, 500);
    },
    [gridSize, noiseLevel, overlapping],
  );

  // Initialize first round on mount
  useEffect(() => {
    startRound(1);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle cell selection
  const toggleCell = useCallback(
    (index) => {
      if (phase !== PHASE_PLAY) return;
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(index)) {
          next.delete(index);
        } else {
          next.add(index);
        }
        return next;
      });
    },
    [phase],
  );

  // Calculate stars from correct rounds
  const getStars = useCallback(
    (correct) => {
      if (correct >= starThresholds[3]) return 3;
      if (correct >= starThresholds[2]) return 2;
      if (correct >= starThresholds[1]) return 1;
      return 0;
    },
    [starThresholds],
  );

  // Finish mission: dispatch state updates, transition to complete
  const finishMission = useCallback(
    (finalCorrect) => {
      const stars = getStars(finalCorrect);

      dispatch({ type: "SET_STARS", payload: { mission: "opticslab", level, stars } });
      dispatch({ type: "COMPLETE_LEVEL", payload: { mission: "opticslab", level } });
      dispatch({ type: "ADD_XP", payload: stars * 20 });
      awardCards(level, dispatch);

      setRoundsCorrect(finalCorrect);
      setPhase(PHASE_COMPLETE);
    },
    [getStars, level, dispatch],
  );

  // Submit scan
  const handleSubmit = useCallback(() => {
    if (phase !== PHASE_PLAY || !roundData) return;

    const patternSet = new Set(roundData.patternCells);
    const selectedArr = [...selected];
    const correctSet = new Set(selectedArr.filter((i) => patternSet.has(i)));
    const wrongSet = new Set(selectedArr.filter((i) => !patternSet.has(i)));
    const missedSet = new Set([...patternSet].filter((i) => !selected.has(i)));

    // Scoring: correct if >= 80% of pattern cells hit AND <= 1 wrong selection
    const hitRate = patternSet.size > 0 ? correctSet.size / patternSet.size : 0;
    const isCorrect = hitRate >= 0.8 && wrongSet.size <= 1;

    if (isCorrect) {
      playSound("success");
      dispatch({ type: "ADD_XP", payload: 15 + level * 5 });
      pushInsight(t("labs.scanner.insight.correct"));
    } else {
      playSound("error");
      pushInsight(t("labs.scanner.insight.wrong"));
    }

    const newRoundsCorrect = isCorrect ? roundsCorrect + 1 : roundsCorrect;
    setRoundsCorrect(newRoundsCorrect);
    setFeedback({ correct: correctSet, missed: missedSet, wrong: wrongSet, isCorrect });
    setPhase(PHASE_RESULT);

    // After 2s, next round or completion
    timerRef.current = setTimeout(() => {
      if (round < totalRounds) {
        startRound(round + 1);
      } else {
        finishMission(newRoundsCorrect);
      }
    }, 2000);
  }, [phase, roundData, selected, round, totalRounds, roundsCorrect, level, dispatch, startRound, finishMission]);

  // --- COMPLETION SCREEN ---

  if (phase === PHASE_COMPLETE) {
    const stars = getStars(roundsCorrect);
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ padding: isMobile ? "24px 16px" : "48px", textAlign: "center" }}
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ fontSize: "4rem", marginBottom: "16px" }}
        >
          {"\uD83D\uDC41\uFE0F"}
        </motion.div>

        <h2 style={{
          fontSize: "1.8rem",
          fontWeight: 900,
          color: "#f8fafc",
          marginBottom: "8px",
        }}>
          {t("labs.scanner.complete")}
        </h2>

        <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "24px" }}>
          {t("labs.scanner.calibrated")}
        </p>

        {/* Star rating */}
        <div style={{ fontSize: "2.5rem", marginBottom: "24px", letterSpacing: "8px" }}>
          {[1, 2, 3].map((s) => (
            <motion.span
              key={s}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: s * 0.3, type: "spring", damping: 8 }}
              style={{
                color: s <= stars ? "#fbbf24" : "#334155",
                textShadow: s <= stars ? "0 0 20px rgba(251,191,36,0.5)" : "none",
              }}
            >
              {s <= stars ? "\u2605" : "\u2606"}
            </motion.span>
          ))}
        </div>

        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "32px",
          margin: "32px 0",
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: CYAN }}>
              {roundsCorrect}/{totalRounds}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", letterSpacing: "0.1em" }}>
              {t("common.roundsCorrect")}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#fbbf24" }}>
              {stars}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", letterSpacing: "0.1em" }}>
              {t("common.starsEarned")}
            </div>
          </div>
        </div>

        <button
          onClick={() => onComplete({ stars, roundsCorrect, totalRounds })}
          style={{
            padding: "16px 48px",
            background: CYAN,
            border: "none",
            borderRadius: "8px",
            color: "white",
            fontSize: "1rem",
            fontWeight: 800,
            cursor: "pointer",
            letterSpacing: "0.1em",
          }}
        >
          {t("common.returnToStation")}
        </button>
      </motion.div>
    );
  }

  // --- MAIN GAME SCREEN ---

  const pad = isMobile ? 32 : 64;
  const maxCell = gridSize <= 4 ? 56 : gridSize <= 6 ? 48 : 42;
  const cellSize = isMobile ? Math.min(maxCell, Math.floor((vw - pad) / gridSize)) : maxCell;

  return (
    <div style={{ padding: isMobile ? "16px" : "32px" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "24px",
      }}>
        <div>
          <h3 style={{
            fontSize: "1.1rem",
            fontWeight: 800,
            letterSpacing: "0.1em",
            color: "#f8fafc",
          }}>
            {t("labs.scanner.title")}
          </h3>
          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
            {t("labs.scanner.subtitle")}
          </div>
        </div>
        <div style={{ display: "flex", gap: "24px", textAlign: "right" }}>
          <div>
            <div style={{ fontSize: "0.6rem", color: "#64748b", letterSpacing: "0.1em" }}>
              {t("labs.scanner.round")}
            </div>
            <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#f8fafc" }}>
              {round}/{totalRounds}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.6rem", color: "#64748b", letterSpacing: "0.1em" }}>
              {t("labs.scanner.correct")}
            </div>
            <div style={{
              fontWeight: 800,
              fontSize: "1.1rem",
              color: roundsCorrect > 0 ? GREEN : "#64748b",
            }}>
              {roundsCorrect}
            </div>
          </div>
        </div>
      </div>

      {/* Phase overlays */}
      <AnimatePresence mode="wait">
        {/* SCANNING phase */}
        {phase === PHASE_SCANNING && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ textAlign: "center", padding: "60px 0", marginBottom: "24px" }}
          >
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{
                fontSize: "1.2rem",
                fontWeight: 800,
                color: CYAN,
                letterSpacing: "0.2em",
              }}
            >
              {t("labs.scanner.scanning")}{dots}
            </motion.div>
          </motion.div>
        )}

        {/* TARGET REVEAL phase (Level 3 only) */}
        {phase === PHASE_TARGET_REVEAL && roundData && (
          <motion.div
            key="target-reveal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              textAlign: "center",
              padding: "48px 0",
              marginBottom: "24px",
              background: "rgba(6,182,212,0.08)",
              border: "2px solid " + CYAN,
              borderRadius: "16px",
            }}
          >
            <div style={{
              fontSize: "0.8rem",
              color: "#94a3b8",
              letterSpacing: "0.2em",
              marginBottom: "12px",
            }}>
              {t("labs.scanner.findPattern")}
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                fontSize: "4rem",
                filter: "drop-shadow(0 0 20px " + CYAN + ")",
              }}
            >
              {roundData.targetSymbol}
            </motion.div>
            <div style={{ marginTop: "12px", fontSize: "0.75rem", color: "#64748b" }}>
              {t("labs.scanner.ignoreDistractor", { symbol: roundData.distractorSymbol })}
            </div>
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 3, ease: "linear" }}
              style={{
                height: "3px",
                background: CYAN,
                borderRadius: "2px",
                margin: "16px auto 0",
                maxWidth: "200px",
              }}
            />
          </motion.div>
        )}

        {/* PLAY and RESULT phases */}
        {(phase === PHASE_PLAY || phase === PHASE_RESULT) && roundData && (
          <motion.div
            key="grid-phase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Target reminder for L3 during play */}
            {overlapping && phase === PHASE_PLAY && (
              <div style={{
                textAlign: "center",
                marginBottom: "12px",
                fontSize: "0.75rem",
                color: CYAN,
                letterSpacing: "0.1em",
              }}>
                {t("labs.scanner.target")}{" "}
                <span style={{ fontSize: "1.2rem", verticalAlign: "middle" }}>
                  {roundData.targetSymbol}
                </span>
              </div>
            )}

            {/* Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(" + gridSize + ", " + cellSize + "px)",
              gap: gridSize <= 4 ? "6px" : "4px",
              justifyContent: "center",
              background: "rgba(0,0,0,0.3)",
              borderRadius: "16px",
              padding: "16px",
              marginBottom: "24px",
            }}>
              {roundData.grid.map((cell, i) => {
                const isSelected = selected.has(i);
                const isRevealed = phase === PHASE_RESULT && feedback;
                const isCorrectHit = isRevealed && feedback.correct.has(i);
                const isMissed = isRevealed && feedback.missed.has(i);
                const isWrong = isRevealed && feedback.wrong.has(i);

                let bg = "rgba(255,255,255,0.03)";
                let borderColor = "rgba(255,255,255,0.08)";
                let shadow = "none";
                let symbolColor = "#94a3b8";

                if (isCorrectHit) {
                  bg = "rgba(16,185,129,0.2)";
                  borderColor = GREEN;
                  shadow = "0 0 12px " + GREEN + "55";
                  symbolColor = GREEN;
                } else if (isMissed) {
                  bg = "rgba(244,63,94,0.15)";
                  borderColor = RED;
                  shadow = "0 0 12px " + RED + "55";
                  symbolColor = RED;
                } else if (isWrong) {
                  bg = "rgba(249,115,22,0.15)";
                  borderColor = ORANGE;
                  shadow = "0 0 12px " + ORANGE + "55";
                  symbolColor = ORANGE;
                } else if (isSelected) {
                  bg = "rgba(6,182,212,0.1)";
                  borderColor = CYAN;
                  shadow = "0 0 10px " + CYAN + "44";
                  symbolColor = "#e2e8f0";
                }

                // Dim empty cells
                if (!cell.symbol && !isSelected && !isRevealed) {
                  symbolColor = "#334155";
                }

                return (
                  <motion.div
                    key={i}
                    onClick={() => toggleCell(i)}
                    whileHover={phase === PHASE_PLAY ? { scale: 0.95 } : {}}
                    whileTap={phase === PHASE_PLAY ? { scale: 0.9 } : {}}
                    animate={
                      isSelected && phase === PHASE_PLAY
                        ? { borderColor: [CYAN, "rgba(6,182,212,0.4)", CYAN] }
                        : {}
                    }
                    transition={
                      isSelected && phase === PHASE_PLAY
                        ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                        : {}
                    }
                    style={{
                      width: cellSize + "px",
                      height: cellSize + "px",
                      borderRadius: "8px",
                      background: bg,
                      border: "2px solid " + borderColor,
                      boxShadow: shadow,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: phase === PHASE_PLAY ? "pointer" : "default",
                      fontSize: cellSize <= 42 ? "1.1rem" : "1.3rem",
                      color: symbolColor,
                      userSelect: "none",
                      transition: phase === PHASE_RESULT ? "all 0.3s ease" : undefined,
                    }}
                  >
                    {cell.symbol || "\u00B7"}
                  </motion.div>
                );
              })}
            </div>

            {/* Round result feedback banner */}
            {phase === PHASE_RESULT && feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  textAlign: "center",
                  marginBottom: "16px",
                  padding: "12px",
                  borderRadius: "10px",
                  background: feedback.isCorrect
                    ? "rgba(16,185,129,0.1)"
                    : "rgba(244,63,94,0.1)",
                  border: "1px solid " + (feedback.isCorrect ? GREEN : RED),
                }}
              >
                <span style={{
                  fontWeight: 800,
                  color: feedback.isCorrect ? GREEN : RED,
                  letterSpacing: "0.1em",
                }}>
                  {t("labs.scanner.roundResult", { round, total: totalRounds })} {"\u2014 "}
                  {feedback.isCorrect
                    ? t("labs.scanner.roundCorrect")
                    : t("labs.scanner.roundMissed", { count: feedback.missed.size })}
                </span>
              </motion.div>
            )}

            {/* Submit button */}
            {phase === PHASE_PLAY && (
              <button
                onClick={handleSubmit}
                disabled={selected.size === 0}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: selected.size > 0 ? CYAN : "rgba(255,255,255,0.05)",
                  border: selected.size > 0 ? "none" : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "white",
                  fontSize: "1rem",
                  fontWeight: 800,
                  cursor: selected.size > 0 ? "pointer" : "not-allowed",
                  letterSpacing: "0.15em",
                  marginBottom: "24px",
                }}
              >
                {t("labs.scanner.submitScan")}
              </button>
            )}

            {/* Hint box */}
            {phase === PHASE_PLAY && (
              <div style={{
                padding: "16px",
                background: "rgba(6,182,212,0.08)",
                border: "1px solid rgba(6,182,212,0.2)",
                borderRadius: "10px",
                fontSize: "0.8rem",
                color: "#94a3b8",
                lineHeight: 1.6,
              }}>
                <strong style={{ color: CYAN }}>{t("common.ariaHint")}</strong>{" "}
                {t(`labs.scanner.hint.${level}`)}
              </div>
            )}

            <AriaInsight insights={insights} onDismiss={dismissInsight} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
