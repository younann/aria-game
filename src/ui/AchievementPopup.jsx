import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "../systems/I18nContext";

export default function AchievementPopup({ achievement, onDone }) {
  const { t } = useI18n();
  if (!achievement) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        onAnimationComplete={() => setTimeout(onDone, 2000)}
        style={{
          position: "fixed", top: "80px", left: "50%", transform: "translateX(-50%)",
          background: "linear-gradient(135deg, rgba(251,191,36,0.15), rgba(139,92,246,0.15))",
          border: "2px solid #fbbf24",
          borderRadius: "12px",
          padding: "16px 32px",
          zIndex: 200,
          display: "flex", alignItems: "center", gap: "16px",
          boxShadow: "0 0 40px rgba(251,191,36,0.2)",
        }}
      >
        <span style={{ fontSize: "2rem" }}>&#127942;</span>
        <div>
          <div style={{ fontSize: "0.65rem", color: "#fbbf24", fontWeight: 700, letterSpacing: "0.2em", marginBottom: "4px" }}>
            {t("achievement.unlocked")}
          </div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "#f8fafc" }}>
            {achievement}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
