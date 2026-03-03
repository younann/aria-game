import React from "react";
import { motion } from "framer-motion";

const MISSION_INFO = {
  datavault: {
    title: "DATA VAULT",
    subtitle: "SIGNAL CLASSIFICATION",
    objective: "Classify incoming alien signals as FRIENDLY or HOSTILE to restore ARIA's pattern recognition.",
    concept: "Supervised Learning",
    color: "#10b981",
  },
  neuralcore: {
    title: "NEURAL CORE",
    subtitle: "SYNAPTIC REWIRING",
    objective: "Adjust ARIA's synaptic weights to restore her decision-making circuits.",
    concept: "Neural Networks",
    color: "#8b5cf6",
  },
  simdeck: {
    title: "SIMULATION DECK",
    subtitle: "AGENT NAVIGATION",
    objective: "Design an environment and train ARIA to find the optimal path.",
    concept: "Reinforcement Learning",
    color: "#f97316",
  },
};

export default function MissionBriefing({ missionId, onStart }) {
  const info = MISSION_INFO[missionId];
  if (!info) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        position: "fixed", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(5,5,16,0.9)",
        zIndex: 180,
      }}
    >
      <div style={{
        background: "rgba(15,23,42,0.95)",
        border: `2px solid ${info.color}`,
        borderRadius: "20px",
        padding: "48px",
        maxWidth: "550px",
        width: "90vw",
        textAlign: "center",
      }}>
        <div style={{
          fontSize: "0.65rem", fontWeight: 800,
          color: info.color, letterSpacing: "0.25em",
          marginBottom: "8px",
        }}>
          MISSION BRIEFING
        </div>
        <h2 style={{
          fontSize: "2rem", fontWeight: 900,
          marginBottom: "4px", color: "#f8fafc",
        }}>
          {info.title}
        </h2>
        <div style={{
          fontSize: "0.8rem", color: "#64748b",
          letterSpacing: "0.15em", marginBottom: "32px",
        }}>
          {info.subtitle}
        </div>
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "24px",
          textAlign: "left",
        }}>
          <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 700, letterSpacing: "0.15em", marginBottom: "8px" }}>
            OBJECTIVE
          </div>
          <div style={{ fontSize: "0.95rem", lineHeight: 1.6, color: "#e2e8f0" }}>
            {info.objective}
          </div>
        </div>
        <div style={{
          display: "inline-block",
          background: `${info.color}22`,
          border: `1px solid ${info.color}66`,
          borderRadius: "20px",
          padding: "6px 16px",
          fontSize: "0.7rem",
          fontWeight: 700,
          color: info.color,
          letterSpacing: "0.1em",
          marginBottom: "32px",
        }}>
          AI CONCEPT: {info.concept}
        </div>
        <div>
          <button
            onClick={onStart}
            style={{
              padding: "16px 48px",
              fontSize: "1rem",
              fontWeight: 800,
              background: info.color,
              border: "none",
              borderRadius: "8px",
              color: "white",
              cursor: "pointer",
              letterSpacing: "0.15em",
            }}
          >
            BEGIN MISSION
          </button>
        </div>
      </div>
    </motion.div>
  );
}
