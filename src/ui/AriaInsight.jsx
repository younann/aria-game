import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "../systems/I18nContext";

const MAX_QUEUE = 3;

export default function AriaInsight({ insights = [], onDismiss }) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(null);
  const queue = useRef([]);
  const timer = useRef(null);

  const showNext = useCallback(() => {
    if (queue.current.length === 0) {
      setVisible(null);
      return;
    }
    const next = queue.current.shift();
    setVisible(next);
    timer.current = setTimeout(() => {
      if (onDismiss) onDismiss(next.id);
      showNext();
    }, 5000);
  }, [onDismiss]);

  useEffect(() => {
    if (insights.length === 0) return;
    const last = insights[insights.length - 1];
    if (queue.current.some((q) => q.id === last.id) || (visible && visible.id === last.id)) return;

    if (queue.current.length >= MAX_QUEUE) queue.current.shift();
    queue.current.push(last);

    if (!visible) showNext();
  }, [insights, visible, showNext]);

  useEffect(() => {
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);

  const handleDismiss = () => {
    if (timer.current) clearTimeout(timer.current);
    if (visible && onDismiss) onDismiss(visible.id);
    showNext();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={visible.id}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          onClick={handleDismiss}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            padding: "12px 16px",
            background: "rgba(139,92,246,0.12)",
            border: "1px solid rgba(139,92,246,0.25)",
            borderRadius: "12px",
            marginTop: "12px",
            cursor: "pointer",
            maxWidth: "480px",
          }}
        >
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "rgba(139,92,246,0.2)",
            border: "1px solid rgba(139,92,246,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.9rem",
            flexShrink: 0,
          }}>
            🤖
          </div>
          <div>
            <div style={{
              fontSize: "0.6rem",
              fontWeight: 800,
              color: "#a78bfa",
              letterSpacing: "0.15em",
              marginBottom: "4px",
            }}>
              {t("ariaInsight.label")}
            </div>
            <div style={{
              fontSize: "0.8rem",
              color: "#cbd5e1",
              lineHeight: 1.5,
            }}>
              {visible.message}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
