import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../systems/GameState";
import { playSound } from "../systems/SoundManager";

function generateSignals(count = 15) {
  const signals = [];
  for (let i = 0; i < count; i++) {
    const isFriendly = Math.random() > 0.5;
    signals.push({
      id: i,
      frequency: isFriendly ? "LOW" : "HIGH",
      pattern: isFriendly ? "REPEATING" : "CHAOTIC",
      color: isFriendly ? "#10b981" : "#f43f5e",
      waveSpeed: isFriendly ? 2 : 6,
      label: isFriendly ? "FRIENDLY" : "HOSTILE",
      code: `SIG-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    });
  }
  return signals;
}

function WaveformDisplay({ signal }) {
  const points = Array.from({ length: 40 }, (_, i) => {
    const x = i * 12;
    const freq = signal.waveSpeed;
    const y = 50 + Math.sin((i * freq * 0.3) + Date.now() * 0.003 * freq) * 30;
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

export default function SignalClassifier({ onComplete }) {
  const { dispatch } = useGame();
  const [signals] = useState(() => generateSignals());
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 50);
    return () => clearInterval(interval);
  }, []);

  const handleClassify = useCallback((choice) => {
    const correct = signals[index].label === choice;
    if (correct) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      setBestStreak(b => Math.max(b, streak + 1));
      dispatch({ type: "ADD_XP", payload: 10 + streak * 2 });
      setFeedback("correct");
      playSound("success");

      if (score === 0) {
        dispatch({ type: "ADD_ACHIEVEMENT", payload: "First Contact" });
      }
    } else {
      setStreak(0);
      setFeedback("wrong");
      playSound("error");
    }

    setTimeout(() => {
      setFeedback(null);
      if (index < signals.length - 1) {
        setIndex(i => i + 1);
      } else {
        const accuracy = Math.round(((correct ? score + 1 : score) / signals.length) * 100);
        if (accuracy === 100) {
          dispatch({ type: "ADD_ACHIEVEMENT", payload: "Perfect Epoch" });
        }
        dispatch({ type: "HEAL_ARIA", payload: 25 });
        dispatch({ type: "ADD_CONCEPT", payload: { title: "Supervised Learning", desc: "Teaching AI by showing it labeled examples — like how you classified signals as friendly or hostile." } });
        dispatch({ type: "ADD_CONCEPT", payload: { title: "Training Data", desc: "The collection of labeled examples an AI learns from. More data = better learning." } });
        dispatch({ type: "SET_MISSION_RESULT", payload: { mission: "datavault", result: { accuracy, bestStreak: Math.max(bestStreak, streak + (correct ? 1 : 0)) } } });
        setDone(true);
      }
    }, 600);
  }, [index, signals, score, streak, bestStreak, dispatch]);

  if (done) {
    const accuracy = Math.round(score / signals.length * 100);
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ padding: "48px", textAlign: "center" }}
      >
        <div style={{ fontSize: "4rem", marginBottom: "16px" }}>📡</div>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 900, marginBottom: "8px", color: "#f8fafc" }}>
          SIGNAL ANALYSIS COMPLETE
        </h2>
        <div style={{ display: "flex", justifyContent: "center", gap: "32px", margin: "32px 0" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#10b981" }}>{accuracy}%</div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", letterSpacing: "0.1em" }}>ACCURACY</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#8b5cf6" }}>{bestStreak}</div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", letterSpacing: "0.1em" }}>BEST STREAK</div>
          </div>
        </div>
        <button onClick={onComplete}
          style={{ padding: "16px 48px", background: "#10b981", border: "none", borderRadius: "8px", color: "white", fontSize: "1rem", fontWeight: 800, cursor: "pointer", letterSpacing: "0.1em" }}
        >
          RETURN TO STATION
        </button>
      </motion.div>
    );
  }

  const signal = signals[index];

  return (
    <div style={{ padding: "32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "0.1em", color: "#f8fafc" }}>
            SIGNAL INTERCEPT
          </h3>
          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Classify incoming transmissions</div>
        </div>
        <div style={{ display: "flex", gap: "24px", textAlign: "right" }}>
          <div>
            <div style={{ fontSize: "0.6rem", color: "#64748b", letterSpacing: "0.1em" }}>SIGNAL</div>
            <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>{index + 1}/{signals.length}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.6rem", color: "#64748b", letterSpacing: "0.1em" }}>STREAK</div>
            <div style={{ fontWeight: 800, fontSize: "1.1rem", color: streak > 0 ? "#fbbf24" : "#64748b" }}>
              {streak > 0 ? `x${streak}` : "—"}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={signal.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          style={{
            background: feedback === "correct" ? "rgba(16,185,129,0.1)" : feedback === "wrong" ? "rgba(244,63,94,0.1)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${feedback === "correct" ? "#10b981" : feedback === "wrong" ? "#f43f5e" : "rgba(255,255,255,0.08)"}`,
            borderRadius: "16px",
            padding: "32px",
            marginBottom: "24px",
            textAlign: "center",
          }}
        >
          <div style={{ marginBottom: "16px", fontSize: "0.7rem", color: "#94a3b8", letterSpacing: "0.2em" }}>
            {signal.code}
          </div>
          <WaveformDisplay signal={signal} />
          <div style={{ display: "flex", justifyContent: "center", gap: "32px", marginTop: "24px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.6rem", color: "#64748b", letterSpacing: "0.1em", marginBottom: "4px" }}>FREQUENCY</div>
              <div style={{ fontWeight: 700, color: signal.color }}>{signal.frequency}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.6rem", color: "#64748b", letterSpacing: "0.1em", marginBottom: "4px" }}>PATTERN</div>
              <div style={{ fontWeight: 700, color: signal.color }}>{signal.pattern}</div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div style={{ display: "flex", gap: "16px" }}>
        <button onClick={() => handleClassify("FRIENDLY")}
          style={{ flex: 1, padding: "20px", background: "rgba(16,185,129,0.15)", border: "2px solid #10b981", borderRadius: "12px", color: "#10b981", fontSize: "1rem", fontWeight: 800, cursor: "pointer", letterSpacing: "0.15em" }}
        >
          FRIENDLY
        </button>
        <button onClick={() => handleClassify("HOSTILE")}
          style={{ flex: 1, padding: "20px", background: "rgba(244,63,94,0.15)", border: "2px solid #f43f5e", borderRadius: "12px", color: "#f43f5e", fontSize: "1rem", fontWeight: 800, cursor: "pointer", letterSpacing: "0.15em" }}
        >
          HOSTILE
        </button>
      </div>

      <div style={{
        marginTop: "24px", padding: "16px",
        background: "rgba(139,92,246,0.08)",
        border: "1px solid rgba(139,92,246,0.2)",
        borderRadius: "10px",
        fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.5,
      }}>
        <strong style={{ color: "#c4b5fd" }}>ARIA HINT:</strong> Look at the frequency and pattern. Friendly signals tend to be LOW frequency with REPEATING patterns.
      </div>
    </div>
  );
}
