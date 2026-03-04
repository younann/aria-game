import React from "react";
import { motion } from "framer-motion";

const STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 1 + Math.random() * 2,
  delay: Math.random() * 3,
  duration: 2 + Math.random() * 3,
}));

export default function BridgeIntroMobile() {
  return (
    <div style={{
      position: "relative",
      width: "100%",
      minHeight: "280px",
      background: "radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.08) 0%, rgba(5,5,16,1) 70%)",
      borderRadius: "16px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
    }}>
      {/* Starfield */}
      {STARS.map((star) => (
        <motion.div
          key={star.id}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: star.duration, delay: star.delay, repeat: Infinity }}
          style={{
            position: "absolute",
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            borderRadius: "50%",
            background: "#fff",
          }}
        />
      ))}

      {/* Ship silhouette */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{
          fontSize: "4rem",
          marginBottom: "16px",
          filter: "drop-shadow(0 0 20px rgba(139,92,246,0.5))",
          zIndex: 1,
        }}
      >
        🛸
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        style={{
          fontSize: "0.65rem",
          fontWeight: 800,
          letterSpacing: "0.3em",
          color: "#64748b",
          textTransform: "uppercase",
          zIndex: 1,
          marginBottom: "8px",
        }}
      >
        ISS PROMETHEUS
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        style={{
          fontSize: "0.75rem",
          color: "#94a3b8",
          textAlign: "center",
          lineHeight: 1.6,
          zIndex: 1,
          maxWidth: "280px",
        }}
      >
        Entering bridge... Stand by for ARIA transmission.
      </motion.div>

      {/* Subtle scan line */}
      <motion.div
        animate={{ top: ["-5%", "105%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          left: 0, right: 0,
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
