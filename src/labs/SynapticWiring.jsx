import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useGame } from "../systems/GameState";
import { playSound } from "../systems/SoundManager";

export default function SynapticWiring({ onComplete }) {
  const { dispatch } = useGame();
  const [weights, setWeights] = useState([0.5, -0.2, 0.1]);
  const [pulseKey, setPulseKey] = useState(0);
  const [awakened, setAwakened] = useState(false);
  const inputs = [1, 0.5];

  const weightedSum = inputs[0] * weights[0] + inputs[1] * weights[1] + weights[2];
  const output = 1 / (1 + Math.exp(-weightedSum));
  const outputPercent = Math.round(output * 100);

  const getColor = () => {
    if (output > 0.7) return "#10b981";
    if (output < 0.3) return "#f43f5e";
    return "#eab308";
  };

  useEffect(() => {
    dispatch({ type: "ADD_CONCEPT", payload: { title: "Synapse Weights", desc: "Weights determine how much influence each input has on the output — like importance dials." } });
  }, []);

  const handleWeightChange = (i, val) => {
    const next = [...weights];
    next[i] = val;
    setWeights(next);
    setPulseKey(k => k + 1);

    if (output > 0.95) {
      dispatch({ type: "ADD_ACHIEVEMENT", payload: "Weight Wizard" });
    }

    if (Math.abs(val) > 0.8) {
      dispatch({ type: "ADD_CONCEPT", payload: { title: "Gradient Descent", desc: "The process of adjusting weights to minimize error — like a ball rolling downhill to find the lowest point." } });
    }
  };

  const handleAwaken = () => {
    if (output > 0.7 && !awakened) {
      setAwakened(true);
      dispatch({ type: "ADD_XP", payload: 80 });
      dispatch({ type: "HEAL_ARIA", payload: 25 });
      dispatch({ type: "ADD_CONCEPT", payload: { title: "Activation Function", desc: "The sigmoid function squashes any number into a value between 0 and 1 — like a confidence percentage." } });
      playSound("success");
    }
  };

  if (awakened) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ padding: "48px", textAlign: "center" }}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ fontSize: "5rem", marginBottom: "16px" }}
        >
          🧠
        </motion.div>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#f8fafc", marginBottom: "8px" }}>
          NEURAL CORE ONLINE
        </h2>
        <p style={{ color: "#94a3b8", fontSize: "1rem", marginBottom: "32px", maxWidth: "500px", margin: "0 auto 32px" }}>
          ARIA's thinking circuits are restored. You found the right combination of weights using the principles of neural networks.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "32px", marginBottom: "32px" }}>
          <div>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#8b5cf6" }}>{outputPercent}%</div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>FINAL OUTPUT</div>
          </div>
        </div>
        <button onClick={onComplete}
          style={{ padding: "16px 48px", background: "#8b5cf6", border: "none", borderRadius: "8px", color: "white", fontSize: "1rem", fontWeight: 800, cursor: "pointer" }}
        >
          RETURN TO STATION
        </button>
      </motion.div>
    );
  }

  const wireColor = (w) => w > 0 ? "#8b5cf6" : "#f43f5e";
  const wireOpacity = (w) => Math.abs(w) * 0.8 + 0.2;

  return (
    <div style={{ padding: "32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "0.1em" }}>SYNAPTIC MATRIX</h3>
          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Adjust weights to activate ARIA's neural core</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "0.6rem", color: "#64748b", letterSpacing: "0.1em" }}>OUTPUT</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: getColor() }}>{outputPercent}%</div>
        </div>
      </div>

      <div style={{
        background: "rgba(0,0,0,0.3)", borderRadius: "16px",
        padding: "32px", marginBottom: "24px",
        position: "relative", height: "280px",
        display: "flex", alignItems: "center", justifyContent: "space-around",
      }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          <line x1="20%" y1="35%" x2="80%" y2="50%"
            stroke={wireColor(weights[0])} strokeWidth={Math.abs(weights[0]) * 8 + 2}
            opacity={wireOpacity(weights[0])}
          />
          <line x1="20%" y1="65%" x2="80%" y2="50%"
            stroke={wireColor(weights[1])} strokeWidth={Math.abs(weights[1]) * 8 + 2}
            opacity={wireOpacity(weights[1])}
          />
          <motion.circle key={`p1-${pulseKey}`} r="5" fill="white"
            initial={{ cx: "20%", cy: "35%", opacity: 1 }}
            animate={{ cx: "80%", cy: "50%", opacity: 0 }}
            transition={{ duration: 1, ease: "linear" }}
            style={{ filter: "drop-shadow(0 0 6px white)" }}
          />
          <motion.circle key={`p2-${pulseKey}`} r="5" fill="white"
            initial={{ cx: "20%", cy: "65%", opacity: 1 }}
            animate={{ cx: "80%", cy: "50%", opacity: 0 }}
            transition={{ duration: 1.2, ease: "linear" }}
            style={{ filter: "drop-shadow(0 0 6px white)" }}
          />
        </svg>

        <div style={{ display: "flex", flexDirection: "column", gap: "60px", zIndex: 1 }}>
          {["VISUAL DATA", "MOTION DATA"].map((label, i) => (
            <div key={i} style={{
              width: "60px", height: "60px", borderRadius: "12px",
              background: "rgba(139,92,246,0.2)", border: "2px solid #8b5cf6",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexDirection: "column", fontSize: "0.5rem", color: "#c4b5fd",
              fontWeight: 700, letterSpacing: "0.1em", textAlign: "center",
            }}>
              <div style={{ fontSize: "1.2rem", marginBottom: "2px" }}>{i === 0 ? "👁️" : "🏃"}</div>
              {label}
            </div>
          ))}
        </div>

        <motion.div
          animate={{
            boxShadow: `0 0 ${20 + output * 40}px ${getColor()}55`,
            borderColor: getColor(),
          }}
          style={{
            width: "90px", height: "90px", borderRadius: "50%",
            border: "4px solid", background: "rgba(5,5,16,0.8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", zIndex: 1,
          }}
        >
          <div style={{ fontSize: "2rem" }}>���️</div>
          <div style={{ fontSize: "0.6rem", fontWeight: 800, color: getColor() }}>{outputPercent}%</div>
        </motion.div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "WEIGHT 1: Visual Importance", i: 0 },
          { label: "WEIGHT 2: Motion Importance", i: 1 },
          { label: "BIAS: Base Threshold", i: 2 },
        ].map(({ label, i }) => (
          <div key={i} style={{
            background: "rgba(255,255,255,0.03)", borderRadius: "12px",
            padding: "16px", border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#e2e8f0" }}>{label}</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 800, color: wireColor(weights[i]) }}>
                {weights[i].toFixed(1)}
              </span>
            </div>
            <input type="range" min="-1" max="1" step="0.1" value={weights[i]}
              onChange={e => handleWeightChange(i, parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: "#8b5cf6", cursor: "pointer" }}
            />
          </div>
        ))}
      </div>

      <button onClick={handleAwaken} disabled={output <= 0.7}
        style={{
          width: "100%", padding: "18px",
          background: output > 0.7 ? "#8b5cf6" : "rgba(255,255,255,0.05)",
          border: output > 0.7 ? "none" : "1px solid rgba(255,255,255,0.1)",
          borderRadius: "12px", color: "white", fontSize: "1rem",
          fontWeight: 800, cursor: output > 0.7 ? "pointer" : "not-allowed",
          letterSpacing: "0.15em",
        }}
      >
        {output > 0.7 ? "ACTIVATE NEURAL CORE" : "OUTPUT MUST EXCEED 70%"}
      </button>
    </div>
  );
}
