import React from "react";
import { motion } from "framer-motion";
import { useGame, RANKS } from "../systems/GameState";

const REAL_WORLD = [
  { emoji: "🏥", title: "Healthcare", desc: "AI scans millions of X-rays to find tiny signs of illness that humans might miss." },
  { emoji: "🌍", title: "Environment", desc: "Satellites use AI to track deforestation and predict where wildfires might start." },
  { emoji: "🎨", title: "Creative Arts", desc: "Generative AI co-creates music and art, pushing the boundaries of human creativity." },
  { emoji: "🚗", title: "Self-Driving", desc: "Cars use reinforcement learning — the same technique you used — to learn to drive safely." },
];

export default function CommandCenter() {
  const { state } = useGame();

  return (
    <div style={{ padding: "48px", textAlign: "center" }}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 10 }}
        style={{ fontSize: "5rem", marginBottom: "16px" }}
      >
        🏆
      </motion.div>

      <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: "8px" }}>
        <span style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          MISSION ACCOMPLISHED
        </span>
      </h1>
      <p style={{ color: "#94a3b8", fontSize: "1.1rem", marginBottom: "40px", maxWidth: "600px", margin: "0 auto 40px" }}>
        You’ve successfully rebuilt ARIA and saved the ISS Prometheus. Here’s what you mastered:
      </p>

      <div style={{ display: "flex", justifyContent: "center", gap: "32px", marginBottom: "48px", flexWrap: "wrap" }}>
        {[
          { label: "RANK", value: state.rank, color: "#8b5cf6" },
          { label: "XP EARNED", value: state.xp, color: "#06b6d4" },
          { label: "ARIA HEALTH", value: `${state.ariaHealth}%`, color: "#10b981" },
          { label: "ACHIEVEMENTS", value: state.achievements.length, color: "#fbbf24" },
          { label: "AI CONCEPTS", value: state.discoveredConcepts.length, color: "#f97316" },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px", padding: "20px 28px", minWidth: "120px",
            }}
          >
            <div style={{ fontSize: "1.5rem", fontWeight: 900, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: "0.6rem", color: "#64748b", letterSpacing: "0.15em", marginTop: "4px" }}>{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <h3 style={{ fontSize: "1rem", color: "#94a3b8", letterSpacing: "0.15em", marginBottom: "24px" }}>
        AI IN THE REAL WORLD
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", maxWidth: "800px", margin: "0 auto 48px" }}>
        {REAL_WORLD.map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.1 }}
            whileHover={{ y: -4 }}
            style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px", padding: "24px", textAlign: "left",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "12px" }}>{item.emoji}</div>
            <div style={{ fontWeight: 800, marginBottom: "8px", color: "#f8fafc" }}>{item.title}</div>
            <div style={{ fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.5 }}>{item.desc}</div>
          </motion.div>
        ))}
      </div>

      <div style={{
        background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)",
        borderRadius: "16px", padding: "32px", maxWidth: "600px", margin: "0 auto", textAlign: "left",
      }}>
        <h4 style={{ color: "#c4b5fd", marginBottom: "16px", letterSpacing: "0.1em", fontSize: "0.8rem" }}>
          AI CONCEPTS DISCOVERED
        </h4>
        {state.discoveredConcepts.map((c, i) => (
          <div key={i} style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#e2e8f0" }}>{c.title}</div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8", lineHeight: 1.4 }}>{c.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
