import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../systems/GameState";
import { useI18n } from "../systems/I18nContext";
import { playSound } from "../systems/SoundManager";
import { MISSIONS, CONCEPT_CARDS } from "../systems/MissionConfig";
import AriaInsight from "../ui/AriaInsight";

/* ───────────────────────────── signal generation ───────────────────────────── */

function generateSignals(level, count) {
  const signals = [];
  for (let i = 0; i < count; i++) {
    signals.push(generateOneSignal(i, level));
  }
  return signals;
}

function generateOneSignal(id, level) {
  if (level === 1) {
    const isFriendly = Math.random() > 0.5;
    return makeSignal(id, {
      frequency: isFriendly ? "LOW" : "HIGH",
      pattern: isFriendly ? "REPEATING" : "CHAOTIC",
      label: isFriendly ? "FRIENDLY" : "HOSTILE",
    });
  }

  if (level === 2) {
    const roll = Math.random();
    if (roll < 0.35) {
      return makeSignal(id, { frequency: "LOW", pattern: "REPEATING", label: "FRIENDLY" });
    }
    if (roll < 0.7) {
      return makeSignal(id, { frequency: "HIGH", pattern: "CHAOTIC", label: "HOSTILE" });
    }
    const pattern = Math.random() > 0.5 ? "REPEATING" : "CHAOTIC";
    return makeSignal(id, {
      frequency: "MEDIUM",
      pattern,
      label: pattern === "REPEATING" ? "FRIENDLY" : "HOSTILE",
    });
  }

  // L3: MEDIUM freq + SEMI-REPEATING combos (ambiguous)
  const roll = Math.random();
  if (roll < 0.25) {
    return makeSignal(id, { frequency: "LOW", pattern: "REPEATING", label: "FRIENDLY" });
  }
  if (roll < 0.5) {
    return makeSignal(id, { frequency: "HIGH", pattern: "CHAOTIC", label: "HOSTILE" });
  }
  if (roll < 0.75) {
    const pattern = Math.random() > 0.5 ? "REPEATING" : "CHAOTIC";
    return makeSignal(id, {
      frequency: "MEDIUM",
      pattern,
      label: pattern === "REPEATING" ? "FRIENDLY" : "HOSTILE",
    });
  }
  return makeSignal(id, {
    frequency: "MEDIUM",
    pattern: "SEMI-REPEATING",
    label: Math.random() > 0.5 ? "FRIENDLY" : "HOSTILE",
  });
}

function makeSignal(id, { frequency, pattern, label }) {
  const isFriendly = label === "FRIENDLY";
  const freqSpeed = { LOW: 1.5, MEDIUM: 3.5, HIGH: 6 };
  const patternJitter = { REPEATING: 0, "SEMI-REPEATING": 0.4, CHAOTIC: 1 };
  return {
    id,
    frequency,
    pattern,
    label,
    color: isFriendly ? "#10b981" : frequency === "MEDIUM" ? "#eab308" : "#f43f5e",
    waveSpeed: freqSpeed[frequency] || 3.5,
    jitter: patternJitter[pattern] || 0,
    code: `SIG-${String(Math.floor(Math.random() * 9000) + 1000)}`,
  };
}

/* ──────────────────────────── waveform display ─────────────────────────────── */

function WaveformDisplay({ signal }) {
  const points = Array.from({ length: 40 }, (_, i) => {
    const x = i * 12;
    const freq = signal.waveSpeed;
    const jitterOffset = signal.jitter * Math.sin(i * 1.7 + Date.now() * 0.002) * 12;
    const y = 50 + Math.sin(i * freq * 0.3 + Date.now() * 0.003 * freq) * 30 + jitterOffset;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width="480" height="100" style={{ overflow: "visible" }}>
      <polyline
        points={points}
        fill="none"
        stroke={signal.color}
        strokeWidth="3"
        style={{ filter: `drop-shadow(0 0 8px ${signal.color})` }}
      />
    </svg>
  );
}

/* ──────────────────────────────── timer bar ─────────────────────────────────── */

function TimerBar({ timeLeft, timeLimit }) {
  const pct = Math.max(0, (timeLeft / timeLimit) * 100);
  let barColor = "#10b981";
  if (pct < 33) barColor = "#f43f5e";
  else if (pct < 60) barColor = "#eab308";

  return (
    <div style={{
      width: "100%", height: "8px", background: "rgba(255,255,255,0.06)",
      borderRadius: "4px", marginBottom: "16px", overflow: "hidden",
    }}>
      <motion.div
        animate={{ width: `${pct}%`, backgroundColor: barColor }}
        transition={{ duration: 0.3 }}
        style={{ height: "100%", borderRadius: "4px" }}
      />
    </div>
  );
}

/* ────────────────────────────── star display ────────────────────────────────── */

function StarDisplay({ earned, total = 3 }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "8px", margin: "16px 0" }}>
      {Array.from({ length: total }, (_, i) => (
        <motion.span
          key={i}
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3 + i * 0.2, type: "spring", stiffness: 200 }}
          style={{
            fontSize: "2.5rem",
            color: i < earned ? "#fbbf24" : "#334155",
            filter: i < earned ? "drop-shadow(0 0 8px rgba(251,191,36,0.6))" : "none",
          }}
        >
          {i < earned ? "\u2605" : "\u2606"}
        </motion.span>
      ))}
    </div>
  );
}

/* ────────────────────────── concept card helpers ────────────────────────────── */

const DATAVAULT_CARDS = CONCEPT_CARDS.filter((c) => c.mission === "datavault");

function getCardsForLevel(level) {
  if (level === 1) return DATAVAULT_CARDS.slice(0, 2);
  if (level === 2) return DATAVAULT_CARDS.slice(2, 3);
  if (level === 3) return DATAVAULT_CARDS.slice(3, 4);
  return [];
}

/* ══════════════════════════ MAIN COMPONENT ══════════════════════════════════ */

export default function SignalClassifier({ level = 1, onComplete }) {
  const { dispatch } = useGame();
  const { t } = useI18n();

  const levelConfig = MISSIONS.datavault.levels[level];
  const signalCount = levelConfig.signalCount;
  const hintsVisible = levelConfig.hintsVisible;
  const timeLimit = levelConfig.timeLimit;

  const [signals] = useState(() => generateSignals(level, signalCount));
  const [index, setIndex] = useState(0);

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);
  const [, setTick] = useState(0);

  const [timeLeft, setTimeLeft] = useState(timeLimit || 0);
  const timerActive = useRef(timeLimit != null && timeLimit > 0);
  const timerDone = useRef(false);

  const [hintOpacity, setHintOpacity] = useState(
    hintsVisible === true || hintsVisible === "fade" ? 1 : 0
  );
  const showHint = hintsVisible === true || (hintsVisible === "fade" && hintOpacity > 0);

  const [insights, setInsights] = useState([]);
  const insightCounter = useRef(0);
  const pushInsight = useCallback((msg) => {
    const id = `insight-${Date.now()}`;
    setInsights((prev) => [...prev, { id, message: msg }]);
  }, []);
  const dismissInsight = useCallback((id) => {
    setInsights((prev) => prev.filter((i) => i.id !== id));
  }, []);

  // waveform animation tick
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 50);
    return () => clearInterval(interval);
  }, []);

  // timer countdown (L3)
  useEffect(() => {
    if (!timerActive.current || done) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.1) {
          timerDone.current = true;
          return 0;
        }
        return Math.max(0, t - 0.1);
      });
    }, 100);
    return () => clearInterval(interval);
  }, [done]);

  /* ── finish helper ── */
  const finishMission = useCallback(
    (finalScore, total, finalBestStreak) => {
      const accuracy = Math.round((finalScore / total) * 100);

      const thresholds = levelConfig.starThresholds;
      let earnedStars = 0;
      if (accuracy >= thresholds[3]) earnedStars = 3;
      else if (accuracy >= thresholds[2]) earnedStars = 2;
      else if (accuracy >= thresholds[1]) earnedStars = 1;

      dispatch({ type: "SET_STARS", payload: { mission: "datavault", level, stars: earnedStars } });
      dispatch({ type: "COMPLETE_LEVEL", payload: { mission: "datavault", level } });
      dispatch({ type: "HEAL_ARIA", payload: 25 });

      const cards = getCardsForLevel(level);
      cards.forEach((card) => {
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
      });

      if (finalScore > 0 && level === 1) {
        dispatch({ type: "ADD_ACHIEVEMENT", payload: "First Contact" });
      }
      if (accuracy === 100) {
        dispatch({ type: "ADD_ACHIEVEMENT", payload: "Perfect Epoch" });
      }

      dispatch({
        type: "ADD_CONCEPT",
        payload: {
          title: "Supervised Learning",
          desc: "Teaching AI by showing it labeled examples — like how you classified signals as friendly or hostile.",
        },
      });
      dispatch({
        type: "ADD_CONCEPT",
        payload: {
          title: "Training Data",
          desc: "The collection of labeled examples an AI learns from. More data = better learning.",
        },
      });

      dispatch({
        type: "SET_MISSION_RESULT",
        payload: {
          mission: "datavault",
          result: { accuracy, bestStreak: finalBestStreak },
        },
      });

      setDone({ accuracy, stars: earnedStars, bestStreak: finalBestStreak });
    },
    [dispatch, level, levelConfig]
  );

  // if timer runs out, end the mission
  useEffect(() => {
    if (timerDone.current && !done) {
      finishMission(score, signalCount, bestStreak);
    }
  }, [timeLeft]);

  /* ── classify handler ── */
  const handleClassify = useCallback(
    (choice) => {
      if (done) return;
      const correct = signals[index].label === choice;

      let newScore = score;
      let newStreak = streak;
      let newBest = bestStreak;
      let newCorrectCount = correctCount;

      if (correct) {
        newScore = score + 1;
        newStreak = streak + 1;
        newBest = Math.max(bestStreak, newStreak);
        newCorrectCount = correctCount + 1;

        const streakMultiplier = level >= 2 ? 4 : 2;
        dispatch({ type: "ADD_XP", payload: 10 + streak * streakMultiplier });
        setFeedback("correct");
        playSound("success");

        setScore(newScore);
        setStreak(newStreak);
        setBestStreak(newBest);
        setCorrectCount(newCorrectCount);

        if (hintsVisible === "fade" && newCorrectCount >= 3) {
          setHintOpacity(0);
        }
      } else {
        newStreak = 0;
        setStreak(0);
        setFeedback("wrong");
        playSound("error");
      }

      // AriaInsight every 3rd classification
      insightCounter.current += 1;
      if (insightCounter.current % 3 === 0) {
        const sig = signals[index];
        if (correct && sig.frequency === "LOW") {
          pushInsight(t("labs.classifier.insight.lowFriendly"));
        } else if (!correct) {
          pushInsight(t("labs.classifier.insight.mislabeled"));
        } else if (sig.frequency === "MEDIUM") {
          pushInsight(t("labs.classifier.insight.ambiguous"));
        } else {
          pushInsight(t("labs.classifier.insight.practice"));
        }
      }

      setTimeout(() => {
        setFeedback(null);
        if (index < signals.length - 1) {
          setIndex((i) => i + 1);
        } else {
          finishMission(newScore, signals.length, newBest);
        }
      }, 600);
    },
    [index, signals, score, streak, bestStreak, correctCount, done, dispatch, level, hintsVisible, finishMission, pushInsight]
  );

  /* ═══════════════════════════ COMPLETION SCREEN ═══════════════════════════════ */

  if (done) {
    const { accuracy, stars, bestStreak: finalBestStreak } = done;
    const awardedCards = getCardsForLevel(level);

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: "48px", textAlign: "center" }}>
        <div style={{ fontSize: "4rem", marginBottom: "16px" }}>📡</div>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 900, marginBottom: "8px", color: "#f8fafc" }}>
          {t("labs.classifier.complete")}
        </h2>
        <div style={{ fontSize: "0.75rem", color: "#64748b", letterSpacing: "0.15em", marginBottom: "8px" }}>
          {t("common.level")} {level} — {levelConfig.name.toUpperCase()}
        </div>

        <StarDisplay earned={stars} />

        <div style={{ display: "flex", justifyContent: "center", gap: "32px", margin: "24px 0" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#10b981" }}>{accuracy}%</div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", letterSpacing: "0.1em" }}>{t("common.accuracy")}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#8b5cf6" }}>{finalBestStreak}</div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", letterSpacing: "0.1em" }}>{t("common.bestStreak")}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#fbbf24" }}>{stars}/3</div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", letterSpacing: "0.1em" }}>{t("common.stars")}</div>
          </div>
        </div>

        {awardedCards.length > 0 && (
          <div style={{ margin: "24px auto", maxWidth: "400px" }}>
            <div style={{ fontSize: "0.65rem", color: "#64748b", letterSpacing: "0.2em", marginBottom: "12px" }}>
              {t("common.conceptCardsCollected")}
            </div>
            {awardedCards.map((card) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px 16px", marginBottom: "8px",
                  background: card.rarity === "rare" ? "rgba(139,92,246,0.12)" : "rgba(16,185,129,0.08)",
                  border: `1px solid ${card.rarity === "rare" ? "rgba(139,92,246,0.3)" : "rgba(16,185,129,0.2)"}`,
                  borderRadius: "10px", textAlign: "left",
                }}
              >
                <span style={{ fontSize: "1.5rem" }}>{card.icon}</span>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f8fafc" }}>{card.title}</div>
                  <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                    {card.rarity === "rare" ? t("common.rare") : t("common.common")}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <button
          onClick={() => onComplete({ stars, accuracy, streak: finalBestStreak })}
          style={{
            padding: "16px 48px", background: "#10b981", border: "none",
            borderRadius: "8px", color: "white", fontSize: "1rem",
            fontWeight: 800, cursor: "pointer", letterSpacing: "0.1em",
          }}
        >
          {t("common.returnToStation")}
        </button>
      </motion.div>
    );
  }

  /* ═══════════════════════════ GAMEPLAY SCREEN ═══════════════════════════════ */

  const signal = signals[index];

  return (
    <div style={{ padding: "32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "0.1em", color: "#f8fafc" }}>
            {t("labs.classifier.title")}
          </h3>
          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
            {t("common.level")} {level} — {levelConfig.name}
          </div>
        </div>
        <div style={{ display: "flex", gap: "24px", textAlign: "right" }}>
          <div>
            <div style={{ fontSize: "0.6rem", color: "#64748b", letterSpacing: "0.1em" }}>{t("labs.classifier.signal")}</div>
            <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>{index + 1}/{signals.length}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.6rem", color: "#64748b", letterSpacing: "0.1em" }}>{t("labs.classifier.streak")}</div>
            <div style={{ fontWeight: 800, fontSize: "1.1rem", color: streak > 0 ? "#fbbf24" : "#64748b" }}>
              {streak > 0 ? `x${streak}` : "\u2014"}
            </div>
          </div>
          {timeLimit && (
            <div>
              <div style={{ fontSize: "0.6rem", color: "#64748b", letterSpacing: "0.1em" }}>{t("labs.classifier.time")}</div>
              <div style={{
                fontWeight: 800, fontSize: "1.1rem",
                color: timeLeft < 15 ? "#f43f5e" : timeLeft < 30 ? "#eab308" : "#10b981",
              }}>
                {Math.ceil(timeLeft)}s
              </div>
            </div>
          )}
        </div>
      </div>

      {timeLimit && <TimerBar timeLeft={timeLeft} timeLimit={timeLimit} />}

      <AnimatePresence mode="wait">
        <motion.div
          key={signal.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          style={{
            background: feedback === "correct" ? "rgba(16,185,129,0.1)" : feedback === "wrong" ? "rgba(244,63,94,0.1)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${feedback === "correct" ? "#10b981" : feedback === "wrong" ? "#f43f5e" : "rgba(255,255,255,0.08)"}`,
            borderRadius: "16px", padding: "32px", marginBottom: "24px", textAlign: "center",
          }}
        >
          <div style={{ marginBottom: "16px", fontSize: "0.7rem", color: "#94a3b8", letterSpacing: "0.2em" }}>
            {signal.code}
          </div>
          <WaveformDisplay signal={signal} />
          <div style={{ display: "flex", justifyContent: "center", gap: "32px", marginTop: "24px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.6rem", color: "#64748b", letterSpacing: "0.1em", marginBottom: "4px" }}>{t("labs.classifier.frequency")}</div>
              <div style={{ fontWeight: 700, color: signal.color }}>{signal.frequency}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.6rem", color: "#64748b", letterSpacing: "0.1em", marginBottom: "4px" }}>{t("labs.classifier.pattern")}</div>
              <div style={{ fontWeight: 700, color: signal.color }}>{signal.pattern}</div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div style={{ display: "flex", gap: "16px" }}>
        <button
          onClick={() => handleClassify("FRIENDLY")}
          style={{
            flex: 1, padding: "20px", background: "rgba(16,185,129,0.15)",
            border: "2px solid #10b981", borderRadius: "12px", color: "#10b981",
            fontSize: "1rem", fontWeight: 800, cursor: "pointer", letterSpacing: "0.15em",
          }}
        >
          {t("labs.classifier.friendly")}
        </button>
        <button
          onClick={() => handleClassify("HOSTILE")}
          style={{
            flex: 1, padding: "20px", background: "rgba(244,63,94,0.15)",
            border: "2px solid #f43f5e", borderRadius: "12px", color: "#f43f5e",
            fontSize: "1rem", fontWeight: 800, cursor: "pointer", letterSpacing: "0.15em",
          }}
        >
          {t("labs.classifier.hostile")}
        </button>
      </div>

      {showHint && (
        <motion.div
          animate={{ opacity: hintOpacity }}
          transition={{ duration: 0.8 }}
          style={{
            marginTop: "24px", padding: "16px",
            background: "rgba(139,92,246,0.08)",
            border: "1px solid rgba(139,92,246,0.2)",
            borderRadius: "10px", fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.5,
          }}
        >
          <strong style={{ color: "#c4b5fd" }}>{t("common.ariaHint")}</strong>{" "}
          {level === 1
            ? t("labs.classifier.hint.1")
            : t("labs.classifier.hint.2")}
        </motion.div>
      )}

      <AriaInsight insights={insights} onDismiss={dismissInsight} />
    </div>
  );
}
