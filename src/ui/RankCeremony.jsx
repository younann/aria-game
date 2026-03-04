import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "../systems/I18nContext";

/* ── Particle burst ─────────────────────────────────────────────── */

function useParticles(count = 30) {
  return useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const distance = 180 + Math.random() * 220;
      const size = 4 + Math.random() * 6;
      const duration = 0.8 + Math.random() * 0.6;
      const hue = Math.random() > 0.5 ? 270 : 45; // purple or gold
      return { angle, distance, size, duration, hue, id: i };
    });
  }, [count]);
}

function ParticleBurst() {
  const particles = useParticles(30);

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        pointerEvents: "none",
      }}
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos(p.angle) * p.distance,
            y: Math.sin(p.angle) * p.distance,
            opacity: 0,
            scale: 0.2,
          }}
          transition={{ duration: p.duration, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: `hsl(${p.hue}, 85%, 65%)`,
            boxShadow: `0 0 6px hsl(${p.hue}, 85%, 65%)`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Typing effect for ARIA message ─────────────────────────────── */

function TypingMessage({ text, delayMs = 1200 }) {
  const [charIndex, setCharIndex] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delayMs);
    return () => clearTimeout(timeout);
  }, [delayMs]);

  useEffect(() => {
    if (!started || charIndex >= text.length) return;
    const id = setTimeout(() => setCharIndex((c) => c + 1), 35);
    return () => clearTimeout(id);
  }, [started, charIndex, text]);

  if (!started) return null;

  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="status"
      aria-live="polite"
      aria-label={text}
      style={{
        maxWidth: "min(480px, 85vw)",
        textAlign: "center",
        fontSize: "1.05rem",
        lineHeight: 1.6,
        color: "#c4b5fd",
        fontStyle: "italic",
        marginTop: "24px",
        minHeight: "3.2em",
      }}
    >
      {text.slice(0, charIndex)}
      {charIndex < text.length && (
        <span
          style={{
            display: "inline-block",
            width: "2px",
            height: "1em",
            background: "#c4b5fd",
            marginLeft: "2px",
            verticalAlign: "text-bottom",
            animation: "blink 0.6s step-end infinite",
          }}
        />
      )}
    </motion.p>
  );
}

/* ── Main overlay ───────────────────────────────────────────────── */

export default function RankCeremony({ oldRank, newRank, onDismiss }) {
  const { t } = useI18n();
  const message = t(`ranks.message.${newRank}`) || t("rankCeremony.defaultMessage");

  return (
    <AnimatePresence>
      <motion.div
        key="rank-ceremony-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 250,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(3, 2, 20, 0.92)",
          backdropFilter: "blur(6px)",
        }}
        role="dialog"
        aria-modal="true"
        aria-label={`Rank up! From ${oldRank} to ${newRank}`}
      >
        {/* ── Particle burst ───────────────────────────── */}
        <ParticleBurst />

        {/* ── Rank transition row ──────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "28px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Old rank — fades out, moves up */}
          <motion.span
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0.25, y: -18 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "#94a3b8",
              textShadow: "0 0 8px rgba(148,163,184,0.3)",
            }}
          >
            {t(`ranks.${oldRank}`) || oldRank}
          </motion.span>

          {/* Arrow */}
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{
              fontSize: "2.2rem",
              color: "#fbbf24",
            }}
          >
            &rarr;
          </motion.span>

          {/* New rank — scales in with spring, glowing */}
          <motion.span
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 180,
              damping: 14,
              delay: 0.5,
            }}
            style={{
              fontSize: "2.6rem",
              fontWeight: 800,
              background: "linear-gradient(135deg, #a78bfa, #fbbf24)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 18px rgba(167,139,250,0.6))",
              textShadow: "0 0 32px rgba(251,191,36,0.4)",
            }}
          >
            {t(`ranks.${newRank}`) || newRank}
          </motion.span>
        </div>

        {/* ── ARIA congratulation message with typing effect ── */}
        <TypingMessage text={message} delayMs={1400} />

        {/* ── Continue button ──────────────────────────── */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4, duration: 0.5 }}
          onClick={onDismiss}
          style={{
            marginTop: "40px",
            padding: "12px 48px",
            fontSize: "1rem",
            fontWeight: 700,
            letterSpacing: "0.15em",
            color: "#f8fafc",
            background:
              "linear-gradient(135deg, rgba(167,139,250,0.25), rgba(251,191,36,0.2))",
            border: "2px solid rgba(167,139,250,0.5)",
            borderRadius: "8px",
            cursor: "pointer",
            position: "relative",
            zIndex: 1,
            transition: "box-shadow 0.2s, border-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow =
              "0 0 24px rgba(167,139,250,0.4)";
            e.currentTarget.style.borderColor = "#a78bfa";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.borderColor = "rgba(167,139,250,0.5)";
          }}
        >
          {t("rankCeremony.continue")}
        </motion.button>

        {/* Blinking cursor keyframes (injected once) */}
        <style>{`
          @keyframes blink {
            50% { opacity: 0; }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
}
