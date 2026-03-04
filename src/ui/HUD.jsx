import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame, RANKS } from "../systems/GameState";
import { useI18n } from "../systems/I18nContext";
import useViewport from "../hooks/useViewport";

const MAX_STARS = 54;

function getAriaHealthGradient(health) {
  if (health <= 25) return "linear-gradient(90deg, #f43f5e, #fb923c)";
  if (health <= 50) return "linear-gradient(90deg, #fb923c, #eab308)";
  if (health <= 75) return "linear-gradient(90deg, #06b6d4, #22d3ee)";
  return "linear-gradient(90deg, #10b981, #34d399)";
}

export default function HUD({ onOpenCodex }) {
  const { state } = useGame();
  const { t } = useI18n();
  const { isMobile } = useViewport();
  const [menuOpen, setMenuOpen] = useState(false);

  const currentRankIndex = RANKS.findIndex(r => r.name === state.rank);
  const nextRank = RANKS[currentRankIndex + 1];
  const prevStars = RANKS[currentRankIndex]?.stars || 0;
  const nextStars = nextRank?.stars || state.totalStars;
  const progress = nextRank ? (state.totalStars - prevStars) / (nextStars - prevStars) : 1;

  if (isMobile) {
    return (
      <>
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0,
          height: "48px",
          padding: "0 12px",
          display: "flex", alignItems: "center", gap: "10px",
          background: "rgba(5,5,16,0.95)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          zIndex: 100,
        }}>
          {/* ARIA health mini */}
          <div style={{
            width: "32px", height: "32px",
            borderRadius: "50%",
            background: `conic-gradient(${state.ariaHealth > 50 ? "#10b981" : "#f43f5e"} ${state.ariaHealth * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <div style={{
              width: "26px", height: "26px", borderRadius: "50%",
              background: "#050510",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.7rem",
            }}>
              {state.ariaHealth > 50 ? "💚" : "💛"}
            </div>
          </div>

          {/* XP bar */}
          <div style={{ flex: 1 }}>
            <div style={{
              height: "6px", background: "rgba(255,255,255,0.08)",
              borderRadius: "3px", overflow: "hidden",
            }}>
              <motion.div
                animate={{ width: `${progress * 100}%` }}
                transition={{ type: "spring", damping: 20 }}
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg, #8b5cf6, #06b6d4)",
                  borderRadius: "3px",
                }}
              />
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between",
              fontSize: "0.55rem", color: "#64748b", marginTop: "2px",
            }}>
              <span>{t(`ranks.${state.rank}`) || state.rank}</span>
              <span>★ {state.totalStars}/{MAX_STARS}</span>
            </div>
          </div>

          {/* Hamburger menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              width: "44px", height: "44px",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: menuOpen ? "rgba(139,92,246,0.2)" : "transparent",
              border: "none",
              borderRadius: "8px",
              fontSize: "1.2rem",
              color: "#94a3b8",
              cursor: "pointer",
              padding: 0,
              flexShrink: 0,
            }}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Dropdown menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "fixed",
                top: "48px", left: 0, right: 0,
                background: "rgba(5,5,16,0.97)",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                padding: "16px",
                zIndex: 99,
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {/* Player name */}
              <div style={{
                fontSize: "0.8rem", color: "#e2e8f0", fontWeight: 700,
              }}>
                {state.playerName}
              </div>

              {/* Rank */}
              <div style={{
                display: "flex", alignItems: "center", gap: "8px",
              }}>
                <span style={{
                  background: "rgba(139,92,246,0.2)",
                  border: "2px solid #8b5cf6",
                  borderRadius: "6px",
                  padding: "4px 12px",
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  color: "#c4b5fd",
                  textTransform: "uppercase",
                }}>
                  {t(`ranks.${state.rank}`) || state.rank}
                </span>
                <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                  ★ {state.totalStars} {nextRank ? `→ ${nextStars}` : `(${t("hud.max")})`}
                </span>
              </div>

              {/* ARIA health */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{t("hud.aria")}</span>
                <div style={{
                  flex: 1, height: "8px",
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: "4px", overflow: "hidden",
                }}>
                  <div style={{
                    width: `${state.ariaHealth}%`,
                    height: "100%",
                    background: getAriaHealthGradient(state.ariaHealth),
                    borderRadius: "4px",
                  }} />
                </div>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#e2e8f0" }}>
                  {state.ariaHealth}%
                </span>
              </div>

              {/* Badges */}
              <div style={{ fontSize: "0.7rem", color: "#fbbf24", fontWeight: 700 }}>
                {state.achievements.length} {t("hud.badges")}
              </div>

              {/* Codex button */}
              <button
                onClick={() => { onOpenCodex(); setMenuOpen(false); }}
                style={{
                  background: "rgba(6,182,212,0.15)",
                  border: "2px solid #06b6d4",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  color: "#22d3ee",
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                📖 {t("hud.codex")}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Desktop/tablet layout (unchanged)
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
        {t(`ranks.${state.rank}`) || state.rank}
      </div>

      <div style={{ flex: 1, maxWidth: "300px" }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          fontSize: "0.65rem", color: "#94a3b8", marginBottom: "4px",
        }}>
          <span>{t("hud.stars")}</span>
          <span>{state.totalStars} {nextRank ? `/ ${nextStars}` : t("hud.max")}</span>
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

      <div style={{
        fontSize: "0.85rem",
        fontWeight: 800,
        color: "#fbbf24",
        letterSpacing: "0.05em",
        whiteSpace: "nowrap",
        pointerEvents: "auto",
      }}>
        <span style={{ fontSize: "1rem" }}>★</span> {state.totalStars}/{MAX_STARS}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "0.65rem", color: "#94a3b8", letterSpacing: "0.1em" }}>{t("hud.aria")}</span>
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
              background: getAriaHealthGradient(state.ariaHealth),
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
        {state.achievements.length} {t("hud.badges")}
      </div>

      <button
        onClick={onOpenCodex}
        style={{
          background: "rgba(6,182,212,0.15)",
          border: "2px solid #06b6d4",
          borderRadius: "8px",
          padding: "6px 14px",
          fontSize: "0.75rem",
          fontWeight: 800,
          letterSpacing: "0.1em",
          color: "#22d3ee",
          cursor: "pointer",
          pointerEvents: "auto",
          transition: "background 0.2s, transform 0.1s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(6,182,212,0.3)";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(6,182,212,0.15)";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        📖 {t("hud.codex")}
      </button>
    </div>
  );
}
