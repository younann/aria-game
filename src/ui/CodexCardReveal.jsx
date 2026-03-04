import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "../systems/I18nContext";

const RARITY_COLORS = {
  common: "#ffffff",
  rare: "#8b5cf6",
  hidden: "#fbbf24",
};

export default function CodexCardReveal({ card, onDismiss }) {
  const { t } = useI18n();
  const [flipped, setFlipped] = useState(false);

  if (!card) return null;

  const borderColor = RARITY_COLORS[card.rarity] || "#ffffff";

  return (
    <AnimatePresence>
      <motion.div
        key={card.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 300,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.75)",
        }}
      >
        {/* Gold label */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            fontSize: "0.75rem",
            fontWeight: 900,
            letterSpacing: "0.25em",
            color: "#fbbf24",
            textShadow: "0 0 20px rgba(251,191,36,0.4)",
            marginBottom: "24px",
          }}
        >
          {t("codexReveal.unlocked")}
        </motion.div>

        {/* Card with flip */}
        <div style={{ perspective: "1000px", width: "min(320px, 85vw)" }}>
          <motion.div
            initial={{ rotateY: 0 }}
            animate={{ rotateY: flipped ? 0 : 180 }}
            transition={{ duration: 0.6, ease: "easeInOut", delay: flipped ? 0 : 0.5 }}
            onAnimationComplete={() => { if (!flipped) setFlipped(true); }}
            style={{
              transformStyle: "preserve-3d",
              width: "100%",
            }}
          >
            {flipped ? (
              /* Card face */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                style={{
                  background: "rgba(10,10,30,0.98)",
                  border: `2px solid ${borderColor}`,
                  borderRadius: "16px",
                  padding: "32px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "16px",
                  boxShadow: `0 0 40px ${borderColor}33`,
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
            ) : (
              /* Mystery back */
              <div style={{
                background: "rgba(10,10,30,0.98)",
                border: "2px solid rgba(139,92,246,0.4)",
                borderRadius: "16px",
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "300px",
                boxShadow: "0 0 40px rgba(139,92,246,0.15)",
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
              }}>
                <span style={{
                  fontSize: "4rem",
                  color: "#8b5cf6",
                  filter: "drop-shadow(0 0 20px rgba(139,92,246,0.5))",
                }}>
                  ?
                </span>
                <div style={{
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  color: "#a78bfa",
                  letterSpacing: "0.2em",
                  marginTop: "16px",
                }}>
                  {t("codex.title")}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* GOT IT button */}
        {flipped && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={onDismiss}
            style={{
              marginTop: "32px",
              padding: "14px 48px",
              background: "#fbbf24",
              border: "none",
              borderRadius: "8px",
              color: "#0f172a",
              fontSize: "0.9rem",
              fontWeight: 900,
              letterSpacing: "0.15em",
              cursor: "pointer",
            }}
          >
            {t("codexReveal.gotIt")}
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
