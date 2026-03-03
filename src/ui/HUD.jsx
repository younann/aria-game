import React from "react";
import { motion } from "framer-motion";
import { useGame, RANKS } from "../systems/GameState";

export default function HUD() {
  const { state } = useGame();
  const currentRankIndex = RANKS.findIndex(r => r.name === state.rank);
  const nextRank = RANKS[currentRankIndex + 1];
  const prevXp = RANKS[currentRankIndex]?.xp || 0;
  const nextXp = nextRank?.xp || state.xp;
  const progress = nextRank ? (state.xp - prevXp) / (nextXp - prevXp) : 1;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0,
      padding: "12px 24px",
      display: "flex", alignItems: "center", gap: "24px",
      background: "linear-gradient(180deg, rgba(5,5,16,0.95) 0%, transparent 100%)",
      zIndex: 100, pointerEvents: "none",
    }}>
      <div style={{
        background: "rgba(139,92,246,0.2)",
        border: "2px solid #8b5cf6",
        borderRadius: "8px",
        padding: "6px 16px",
        fontSize: "0.75rem",
        fontWeight: 800,
        letterSpacing: "0.15em",
        color: "#c4b5fd",
        textTransform: "uppercase",
        pointerEvents: "auto",
      }}>
        {state.rank}
      </div>
      <div style={{ flex: 1, maxWidth: "300px" }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          fontSize: "0.65rem", color: "#94a3b8", marginBottom: "4px",
        }}>
          <span>XP</span>
          <span>{state.xp} {nextRank ? `/ ${nextXp}` : "(MAX)"}</span>
        </div>
        <div style={{
          height: "8px", background: "rgba(255,255,255,0.08)",
          borderRadius: "4px", overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <motion.div
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: "spring", damping: 20 }}
            style={{
              height: "100%",
              background: "linear-gradient(90deg, #8b5cf6, #06b6d4)",
              borderRadius: "4px",
            }}
          />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "0.65rem", color: "#94a3b8", letterSpacing: "0.1em" }}>ARIA</span>
        <div style={{
          width: "120px", height: "8px",
          background: "rgba(255,255,255,0.08)",
          borderRadius: "4px", overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <motion.div
            animate={{ width: `${state.ariaHealth}%` }}
            transition={{ type: "spring", damping: 20 }}
            style={{
              height: "100%",
              background: state.ariaHealth > 50
                ? "linear-gradient(90deg, #10b981, #34d399)"
                : "linear-gradient(90deg, #f43f5e, #fb923c)",
              borderRadius: "4px",
            }}
          />
        </div>
        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#e2e8f0" }}>
          {state.ariaHealth}%
        </span>
      </div>
      <div style={{
        fontSize: "0.7rem", color: "#fbbf24",
        fontWeight: 700, letterSpacing: "0.1em",
        pointerEvents: "auto",
      }}>
        {state.achievements.length} BADGES
      </div>
    </div>
  );
}
