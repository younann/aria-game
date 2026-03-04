import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../systems/GameState";
import { useI18n } from "../systems/I18nContext";
import useViewport from "../hooks/useViewport";

const PORTRAITS = {
  commander: { emoji: "👨‍✈️", color: "#3b82f6" },
  aria_glitch: { emoji: "🤖", color: "#f43f5e", glitch: true },
  aria_25: { emoji: "🤖", color: "#fb923c" },
  aria_50: { emoji: "🤖", color: "#eab308" },
  aria_75: { emoji: "🤖", color: "#22d3ee" },
  aria_100: { emoji: "🤖", color: "#10b981" },
};

export default function DialogueBox({ dialogue, onComplete }) {
  const { state } = useGame();
  const { t } = useI18n();
  const { isMobile } = useViewport();
  const [lineIndex, setLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const playerName = state.playerName || "Cadet";
  const personalize = (text) =>
    text.replace(/\{\{playerName\}\}/g, playerName).replace(/Cadet Nova/g, playerName).replace(/\bCadet\b/g, playerName);

  const currentLine = dialogue?.[lineIndex];

  // Reset line index when dialogue changes (e.g., branching choices)
  useEffect(() => {
    setLineIndex(0);
    setDisplayedText("");
    setIsTyping(true);
  }, [dialogue]);

  useEffect(() => {
    if (!currentLine) return;
    const fullText = personalize(currentLine.text);
    setDisplayedText("");
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < fullText.length) {
        setDisplayedText(fullText.slice(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [lineIndex, currentLine, playerName]);

  if (!dialogue || !currentLine) return null;

  const handleAdvance = (nextKey) => {
    if (isTyping) {
      setDisplayedText(personalize(currentLine.text));
      setIsTyping(false);
      return;
    }
    if (nextKey) {
      onComplete(nextKey);
      return;
    }
    if (lineIndex < dialogue.length - 1) {
      setLineIndex(lineIndex + 1);
    } else {
      onComplete(null);
    }
  };

  const portrait = PORTRAITS[currentLine.portrait] || { emoji: "📡", color: "#94a3b8" };

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      style={{
        position: "fixed",
        bottom: isMobile ? 0 : "24px",
        left: 0, right: 0,
        width: isMobile ? "100%" : "min(90vw, 800px)",
        maxHeight: isMobile ? "45vh" : "none",
        overflowY: isMobile ? "auto" : "visible",
        margin: "0 auto",
        background: "rgba(5, 5, 16, 0.97)",
        border: isMobile ? "none" : "2px solid rgba(139, 92, 246, 0.4)",
        borderTop: isMobile ? "2px solid rgba(139, 92, 246, 0.4)" : undefined,
        borderRadius: isMobile ? "16px 16px 0 0" : "16px",
        padding: isMobile ? "16px 16px 20px" : "24px",
        zIndex: 150,
        cursor: "pointer",
        boxSizing: "border-box",
        WebkitOverflowScrolling: "touch",
      }}
      onClick={() => !currentLine.choices && handleAdvance(null)}
    >
      <div style={{ display: "flex", gap: isMobile ? "12px" : "16px", alignItems: "flex-start" }}>
        <div style={{
          width: isMobile ? "40px" : "56px",
          height: isMobile ? "40px" : "56px",
          borderRadius: isMobile ? "10px" : "12px",
          background: `${portrait.color}22`,
          border: `2px solid ${portrait.color}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: isMobile ? "1.3rem" : "1.8rem", flexShrink: 0,
          animation: portrait.glitch ? "glitch 0.3s infinite" : "none",
        }}>
          {portrait.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: "0.7rem", fontWeight: 800,
            color: portrait.color,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}>
            {currentLine.speaker}
          </div>
          <div style={{
            fontSize: "1rem", lineHeight: 1.6, color: "#e2e8f0",
            minHeight: "48px",
          }}>
            {displayedText}
            {isTyping && <span style={{ opacity: 0.5 }}>|</span>}
          </div>
          {currentLine.choices && !isTyping && (
            <div style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? "8px" : "12px",
              marginTop: isMobile ? "12px" : "16px",
            }}>
              {currentLine.choices.map((choice, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); handleAdvance(choice.next); }}
                  style={{
                    padding: isMobile ? "12px 16px" : "10px 20px",
                    fontSize: "0.85rem",
                    background: "rgba(139,92,246,0.15)",
                    border: "1px solid rgba(139,92,246,0.4)",
                    borderRadius: "8px",
                    color: "#c4b5fd",
                    cursor: "pointer",
                    width: isMobile ? "100%" : "auto",
                  }}
                >
                  {choice.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {!currentLine.choices && !isTyping && (
        <div style={{
          textAlign: isMobile ? "center" : "right",
          fontSize: isMobile ? "0.7rem" : "0.6rem",
          color: "#64748b",
          marginTop: isMobile ? "12px" : "8px",
          letterSpacing: "0.1em",
          padding: isMobile ? "8px 0" : "0",
        }}>
          {isMobile ? t("dialogue.clickToContinue") + " ▸" : t("dialogue.clickToContinue") + " ▸"}
        </div>
      )}
    </motion.div>
  );
}
