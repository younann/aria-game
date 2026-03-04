import React from "react";
import { motion } from "framer-motion";
import { MISSIONS } from "../systems/MissionConfig.js";
import { useGame } from "../systems/GameState.jsx";
import { useI18n } from "../systems/I18nContext";
import useViewport from "../hooks/useViewport";
import StarRating from "./StarRating.jsx";

const LEVEL_BADGES = { 1: "I", 2: "II", 3: "III" };

function isLevelUnlocked(levelNum, levelCompleteMap) {
  if (levelNum === 1) return true;
  return !!levelCompleteMap[levelNum - 1];
}

export default function LevelSelect({ missionId, onSelectLevel, onBack }) {
  const { state } = useGame();
  const { t, dir } = useI18n();
  const { isMobile } = useViewport();
  const mission = MISSIONS[missionId];
  if (!mission) return null;

  const missionStars = state.stars[missionId] || {};
  const missionComplete = state.levelComplete[missionId] || {};
  const color = mission.color;

  return (
    <motion.div
      initial={{ opacity: 0, y: isMobile ? 20 : 0, scale: isMobile ? 1 : 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: isMobile ? "stretch" : "center",
        justifyContent: "center",
        background: "rgba(5,5,16,0.92)",
        zIndex: 180,
        overflowY: isMobile ? "auto" : "visible",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div
        style={{
          background: isMobile ? "rgba(15,23,42,1)" : "rgba(15,23,42,0.95)",
          border: isMobile ? "none" : `2px solid ${color}`,
          borderRadius: isMobile ? "0" : "20px",
          padding: isMobile ? "24px 16px 32px" : "40px 36px 32px",
          maxWidth: isMobile ? "100%" : "680px",
          width: isMobile ? "100%" : "92vw",
          textAlign: "center",
          minHeight: isMobile ? "100%" : "auto",
        }}
      >
        {/* Mission header */}
        <div style={{ fontSize: "2.2rem", marginBottom: "6px" }}>
          {mission.icon}
        </div>
        <h2
          style={{
            fontSize: "1.6rem",
            fontWeight: 900,
            color: "#f8fafc",
            margin: "0 0 4px",
          }}
        >
          {t(`missions.${missionId}.title`) || mission.title}
        </h2>
        <div
          style={{
            fontSize: "0.7rem",
            color: "#64748b",
            letterSpacing: "0.18em",
            fontWeight: 600,
            marginBottom: "8px",
          }}
        >
          {t(`missions.${missionId}.subtitle`) || mission.subtitle}
        </div>
        <div
          style={{
            display: "inline-block",
            background: `${color}22`,
            border: `1px solid ${color}55`,
            borderRadius: "20px",
            padding: "4px 14px",
            fontSize: "0.6rem",
            fontWeight: 700,
            color,
            letterSpacing: "0.12em",
            marginBottom: "28px",
          }}
        >
          {t(`missions.${missionId}.concept`) || mission.concept}
        </div>

        {/* Level cards */}
        <div
          style={{
            display: "flex",
            gap: "14px",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: "28px",
          }}
        >
          {[1, 2, 3].map((levelNum) => {
            const levelData = mission.levels[levelNum];
            if (!levelData) return null;
            const unlocked = isLevelUnlocked(levelNum, missionComplete);
            const earnedStars = missionStars[levelNum] || 0;
            const completed = !!missionComplete[levelNum];

            return (
              <motion.div
                key={levelNum}
                whileHover={unlocked ? { scale: 1.05, y: -4 } : {}}
                whileTap={unlocked ? { scale: 0.97 } : {}}
                onClick={() => unlocked && onSelectLevel(levelNum)}
                style={{
                  position: "relative",
                  background: unlocked
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(255,255,255,0.015)",
                  border: `1.5px solid ${
                    unlocked
                      ? completed
                        ? `${color}88`
                        : "rgba(255,255,255,0.1)"
                      : "rgba(255,255,255,0.04)"
                  }`,
                  borderRadius: "14px",
                  padding: "22px 18px 18px",
                  width: isMobile ? "100%" : "175px",
                  cursor: unlocked ? "pointer" : "default",
                  opacity: unlocked ? 1 : 0.4,
                  transition: "border-color 0.2s",
                }}
              >
                {/* Lock overlay */}
                {!unlocked && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2rem",
                      borderRadius: "14px",
                      background: "rgba(5,5,16,0.5)",
                      zIndex: 2,
                    }}
                  >
                    <span role="img" aria-label="locked">
                      {"\uD83D\uDD12"}
                    </span>
                  </div>
                )}

                {/* Level badge */}
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: unlocked ? `${color}33` : "rgba(255,255,255,0.05)",
                    border: `1.5px solid ${unlocked ? `${color}77` : "rgba(255,255,255,0.08)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    color: unlocked ? color : "#475569",
                    letterSpacing: "0.05em",
                  }}
                >
                  {LEVEL_BADGES[levelNum]}
                </div>

                {/* Level name */}
                <div
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 800,
                    color: unlocked ? "#f8fafc" : "#475569",
                    marginBottom: "6px",
                    letterSpacing: "0.04em",
                  }}
                >
                  {t(`missions.${missionId}.levels.${levelNum}.name`) || levelData.name}
                </div>

                {/* Description */}
                <div
                  style={{
                    fontSize: "0.65rem",
                    lineHeight: 1.5,
                    color: unlocked ? "#94a3b8" : "#334155",
                    marginBottom: "14px",
                    minHeight: "32px",
                  }}
                >
                  {t(`missions.${missionId}.levels.${levelNum}.description`) || levelData.description}
                </div>

                {/* Star rating */}
                <StarRating stars={earnedStars} maxStars={3} size="sm" />
              </motion.div>
            );
          })}
        </div>

        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            padding: "12px 28px",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            color: "#94a3b8",
            cursor: "pointer",
            transition: "background 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            e.currentTarget.style.color = "#f8fafc";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            e.currentTarget.style.color = "#94a3b8";
          }}
        >
          {dir === "rtl" ? t("levelSelect.backArrowRTL") : t("levelSelect.backArrow")} {t("levelSelect.backToStation")}
        </button>
      </div>
    </motion.div>
  );
}
