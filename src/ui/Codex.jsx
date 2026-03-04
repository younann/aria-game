import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../systems/GameState";
import { MISSIONS, CONCEPT_CARDS } from "../systems/MissionConfig";
import { useI18n } from "../systems/I18nContext";

const RARITY_COLORS = {
  common: "#ffffff",
  rare: "#8b5cf6",
  hidden: "#fbbf24",
};

function CardTile({ card, collected, onSelect }) {
  const borderColor = collected
    ? RARITY_COLORS[card.rarity] || "#ffffff"
    : "rgba(255,255,255,0.15)";

  return (
    <motion.button
      whileHover={collected ? { scale: 1.08 } : {}}
      whileTap={collected ? { scale: 0.95 } : {}}
      onClick={() => collected && onSelect(card)}
      style={{
        width: "80px",
        height: "90px",
        background: collected
          ? "rgba(255,255,255,0.06)"
          : "rgba(255,255,255,0.02)",
        border: `2px solid ${borderColor}`,
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        cursor: collected ? "pointer" : "default",
        padding: "6px",
        opacity: collected ? 1 : 0.4,
        transition: "opacity 0.2s",
      }}
    >
      <span style={{ fontSize: "1.5rem", filter: collected ? "none" : "grayscale(1) brightness(0.3)" }}>
        {collected ? card.icon : "?"}
      </span>
      <span style={{
        fontSize: "0.55rem",
        fontWeight: 700,
        color: collected ? "#e2e8f0" : "#475569",
        textAlign: "center",
        lineHeight: 1.2,
        letterSpacing: "0.03em",
        overflow: "hidden",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
      }}>
        {collected ? card.title : "???"}
      </span>
    </motion.button>
  );
}

function ExpandedCard({ card, onClose, t }) {
  const borderColor = RARITY_COLORS[card.rarity] || "#ffffff";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ type: "spring", damping: 25, stiffness: 350 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 250,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
      }}
    >
      <motion.div
        style={{
          background: "rgba(10,10,30,0.98)",
          border: `2px solid ${borderColor}`,
          borderRadius: "16px",
          padding: "32px",
          maxWidth: "360px",
          width: "90%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          boxShadow: `0 0 40px ${borderColor}33`,
          cursor: "pointer",
        }}
      >
        <span style={{ fontSize: "3rem" }}>{card.icon}</span>
        <h3 style={{
          margin: 0,
          fontSize: "1.1rem",
          fontWeight: 800,
          color: "#f1f5f9",
          letterSpacing: "0.08em",
          textAlign: "center",
        }}>
          {card.title}
        </h3>
        <span style={{
          fontSize: "0.6rem",
          fontWeight: 700,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: borderColor,
          background: `${borderColor}18`,
          padding: "4px 12px",
          borderRadius: "999px",
          border: `1px solid ${borderColor}44`,
        }}>
          {t(`codex.rarity.${card.rarity}`)}
        </span>
        <p style={{
          margin: 0,
          fontSize: "0.85rem",
          color: "#cbd5e1",
          lineHeight: 1.6,
          textAlign: "center",
        }}>
          {card.description}
        </p>
        <div style={{
          width: "100%",
          background: "rgba(255,255,255,0.04)",
          borderRadius: "10px",
          padding: "12px 16px",
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{
            fontSize: "0.6rem",
            fontWeight: 700,
            color: "#64748b",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "6px",
          }}>
            {t("codex.realWorld")}
          </div>
          <div style={{
            fontSize: "0.8rem",
            color: "#94a3b8",
            lineHeight: 1.5,
          }}>
            {card.realWorld}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Codex({ isOpen, onClose }) {
  const { state } = useGame();
  const { t } = useI18n();
  const [selectedCard, setSelectedCard] = useState(null);

  const collectedIds = new Set(state.codex.map((c) => c.id));
  const totalCards = CONCEPT_CARDS.length;
  const collectedCount = collectedIds.size;

  // Group cards by mission
  const missionKeys = Object.keys(MISSIONS);
  const cardsByMission = {};
  for (const key of missionKeys) {
    cardsByMission[key] = CONCEPT_CARDS.filter((c) => c.mission === key);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="codex-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              zIndex: 199,
            }}
          />

          {/* Panel */}
          <motion.div
            key="codex-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "min(420px, 90vw)",
              background: "rgba(5,5,16,0.98)",
              zIndex: 200,
              display: "flex",
              flexDirection: "column",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "-8px 0 40px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div style={{
              padding: "24px 24px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              flexShrink: 0,
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <h2 style={{
                  margin: 0,
                  fontSize: "1.2rem",
                  fontWeight: 900,
                  letterSpacing: "0.2em",
                  color: "#e2e8f0",
                }}>
                  {t("codex.title")}
                </h2>
                <button
                  onClick={onClose}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "8px",
                    color: "#94a3b8",
                    fontSize: "1rem",
                    width: "32px",
                    height: "32px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  X
                </button>
              </div>
              <div style={{
                marginTop: "10px",
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "#64748b",
                letterSpacing: "0.1em",
              }}>
                {collectedCount}/{totalCards} {t("codex.cards")}
              </div>
              {/* Progress bar */}
              <div style={{
                marginTop: "8px",
                height: "6px",
                background: "rgba(255,255,255,0.06)",
                borderRadius: "3px",
                overflow: "hidden",
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(collectedCount / totalCards) * 100}%` }}
                  transition={{ type: "spring", damping: 20, delay: 0.3 }}
                  style={{
                    height: "100%",
                    background: "linear-gradient(90deg, #8b5cf6, #06b6d4)",
                    borderRadius: "3px",
                  }}
                />
              </div>
            </div>

            {/* Scrollable Content */}
            <div style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 24px 32px",
            }}>
              {missionKeys.map((missionKey) => {
                const mission = MISSIONS[missionKey];
                const cards = cardsByMission[missionKey];
                if (!cards || cards.length === 0) return null;

                const missionCollected = cards.filter((c) => collectedIds.has(c.id)).length;

                return (
                  <div key={missionKey} style={{ marginBottom: "24px" }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "12px",
                    }}>
                      <span style={{ fontSize: "1rem" }}>{mission.icon}</span>
                      <span style={{
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        letterSpacing: "0.15em",
                        color: mission.color,
                        textTransform: "uppercase",
                      }}>
                        {mission.title}
                      </span>
                      <span style={{
                        fontSize: "0.6rem",
                        color: "#475569",
                        fontWeight: 600,
                        marginLeft: "auto",
                      }}>
                        {missionCollected}/{cards.length}
                      </span>
                    </div>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                      gap: "10px",
                    }}>
                      {cards.map((card) => (
                        <CardTile
                          key={card.id}
                          card={card}
                          collected={collectedIds.has(card.id)}
                          onSelect={setSelectedCard}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Expanded card overlay */}
          <AnimatePresence>
            {selectedCard && (
              <ExpandedCard
                key="expanded-card"
                card={selectedCard}
                onClose={() => setSelectedCard(null)}
                t={t}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
