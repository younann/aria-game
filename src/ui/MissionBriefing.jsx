import React from "react";
import { motion } from "framer-motion";
import { MISSIONS, CONCEPT_CARDS } from "../systems/MissionConfig";
import { useI18n } from "../systems/I18nContext";

export default function MissionBriefing({ missionId, level = 1, onStart }) {
  const { t } = useI18n();
  const mission = MISSIONS[missionId];
  if (!mission) return null;

  const levelData = mission.levels[level];
  if (!levelData) return null;

  const { color } = mission;
  const title = t(`missions.${missionId}.title`) || mission.title;
  const subtitle = t(`missions.${missionId}.subtitle`) || mission.subtitle;
  const concept = t(`missions.${missionId}.concept`) || mission.concept;
  const { starThresholds } = levelData;
  const levelLabel = t(`briefing.levelLabel.${level}`) || `LEVEL ${level}`;
  const description = t(`missions.${missionId}.levels.${level}.description`) || levelData.description;

  // Build briefing steps from locale, falling back to config
  const briefingSteps = [];
  for (let i = 0; i < (levelData.briefingSteps || []).length; i++) {
    const key = `missions.${missionId}.levels.${level}.briefingSteps.${i}`;
    const val = t(key);
    briefingSteps.push(val !== key ? val : levelData.briefingSteps[i]);
  }

  const conceptCard = CONCEPT_CARDS.find((c) => c.mission === missionId);

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
          {t("common.level")} {level}: {levelLabel}
        </div>

        <div style={{
          fontSize: "0.65rem", fontWeight: 800,
          color, letterSpacing: "0.25em",
          marginBottom: "8px",
        }}>
          {t("briefing.missionBriefing")}
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
            {t("briefing.objective")}
          </div>
          <div style={{ fontSize: "0.95rem", lineHeight: 1.6, color: "#e2e8f0" }}>
            {description}
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
            {t("briefing.howToPlay")}
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
          marginBottom: "8px",
        }}>
          {t("briefing.aiConcept")} {concept}
        </div>
        {conceptCard && (
          <div style={{
            fontSize: "0.8rem",
            color: "#94a3b8",
            lineHeight: 1.5,
            marginBottom: "32px",
            maxWidth: "420px",
          }}>
            {conceptCard.description}
          </div>
        )}

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
            {t("briefing.beginMission")}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
