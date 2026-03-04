import React from "react";
import { motion } from "framer-motion";
import { MISSIONS } from "../systems/MissionConfig";

const LEVEL_LABELS = {
  1: "TUTORIAL",
  2: "CHALLENGE",
  3: "MASTERY",
};

export default function MissionBriefing({ missionId, level = 1, onStart }) {
  const mission = MISSIONS[missionId];
  if (!mission) return null;

  const levelData = mission.levels[level];
  if (!levelData) return null;

  const { color, title, subtitle, concept } = mission;
  const { briefingSteps, starThresholds } = levelData;
  const levelLabel = LEVEL_LABELS[level] || `LEVEL ${level}`;

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
        border: `2px solid ${color}`,
        borderRadius: "20px",
        padding: "48px",
        maxWidth: "550px",
        width: "90vw",
        textAlign: "center",
      }}>
        {/* Level indicator */}
        <div style={{
          display: "inline-block",
          background: `${color}18`,
          border: `1px solid ${color}44`,
          borderRadius: "6px",
          padding: "4px 14px",
          fontSize: "0.6rem",
          fontWeight: 800,
          color,
          letterSpacing: "0.2em",
          marginBottom: "16px",
        }}>
          LEVEL {level}: {levelLabel}
        </div>

        <div style={{
          fontSize: "0.65rem", fontWeight: 800,
          color, letterSpacing: "0.25em",
          marginBottom: "8px",
        }}>
          MISSION BRIEFING
        </div>
        <h2 style={{
          fontSize: "2rem", fontWeight: 900,
          marginBottom: "4px", color: "#f8fafc",
        }}>
          {title}
        </h2>
        <div style={{
          fontSize: "0.8rem", color: "#64748b",
          letterSpacing: "0.15em", marginBottom: "32px",
        }}>
          {subtitle}
        </div>

        {/* Objective section */}
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
            {levelData.description}
          </div>
        </div>

        {/* How to play — briefing steps */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "24px",
          textAlign: "left",
        }}>
          <div style={{ fontSize: "0.65rem", color, fontWeight: 700, letterSpacing: "0.15em", marginBottom: "12px" }}>
            HOW TO PLAY
          </div>
          {briefingSteps.map((step, i) => (
            <div key={i} style={{
              display: "flex", gap: "10px", alignItems: "flex-start",
              marginBottom: i < briefingSteps.length - 1 ? "10px" : 0,
            }}>
              <div style={{
                minWidth: "22px", height: "22px", borderRadius: "50%",
                background: `${color}33`, border: `1px solid ${color}66`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.65rem", fontWeight: 800, color,
              }}>{i + 1}</div>
              <div style={{ fontSize: "0.85rem", lineHeight: 1.5, color: "#cbd5e1" }}>{step}</div>
            </div>
          ))}
        </div>

        {/* Star thresholds */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "12px",
          padding: "16px 20px",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "center",
          gap: "24px",
        }}>
          {[1, 2, 3].map((stars) => (
            <div key={stars} style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
            }}>
              <div style={{
                fontSize: "1.1rem",
                lineHeight: 1,
                filter: "drop-shadow(0 0 4px rgba(250,204,21,0.4))",
              }}>
                {"\u2605".repeat(stars)}
              </div>
              <div style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#94a3b8",
              }}>
                {starThresholds[stars]}%
              </div>
            </div>
          ))}
        </div>

        {/* AI concept badge */}
        <div style={{
          display: "inline-block",
          background: `${color}22`,
          border: `1px solid ${color}66`,
          borderRadius: "20px",
          padding: "6px 16px",
          fontSize: "0.7rem",
          fontWeight: 700,
          color,
          letterSpacing: "0.1em",
          marginBottom: "32px",
        }}>
          AI CONCEPT: {concept}
        </div>

        <div>
          <button
            onClick={onStart}
            style={{
              padding: "16px 48px",
              fontSize: "1rem",
              fontWeight: 800,
              background: color,
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
