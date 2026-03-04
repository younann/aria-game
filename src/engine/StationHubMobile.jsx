import React from "react";
import { motion } from "framer-motion";
import { MISSIONS } from "../systems/MissionConfig";

const ROOM_ORDER = [
  { id: "bridge",        label: "BRIDGE",          subtitle: "Mission Control",      icon: "🛸", color: "#3b82f6" },
  { id: "datavault",     label: "DATA VAULT",      subtitle: "Signal Classification", icon: "📡", color: "#10b981" },
  { id: "opticslab",     label: "OPTICS LAB",      subtitle: "Pattern Recognition",   icon: "👁️", color: "#06b6d4" },
  { id: "commsarray",    label: "COMMS ARRAY",     subtitle: "Message Analysis",      icon: "💬", color: "#ec4899" },
  { id: "neuralcore",    label: "NEURAL CORE",     subtitle: "Synaptic Rewiring",     icon: "🧠", color: "#8b5cf6" },
  { id: "simdeck",       label: "SIM DECK",        subtitle: "Agent Navigation",      icon: "🚀", color: "#f97316" },
  { id: "ethicschamber", label: "ETHICS CHAMBER",  subtitle: "Bias Detection",        icon: "⚖️", color: "#f43f5e" },
  { id: "command",       label: "COMMAND CENTER",   subtitle: "Final Mission",         icon: "⭐", color: "#fbbf24" },
];

function getStarDisplay(starsData, roomId) {
  const missionStars = starsData?.[roomId];
  if (!missionStars) return { earned: 0, max: 9 };
  const earned = Object.values(missionStars).reduce((a, b) => a + b, 0);
  const max = Object.keys(missionStars).length > 0 ? Object.keys(missionStars).length * 3 : 9;
  return { earned, max };
}

export default function StationHubMobile({ unlockedRooms, onRoomClick, starsData = {} }) {
  return (
    <div style={{
      width: "100%",
      padding: "12px 16px",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      maxHeight: "calc(100vh - 80px)",
      overflowY: "auto",
      WebkitOverflowScrolling: "touch",
    }}>
      <div style={{
        fontSize: "0.65rem",
        color: "#64748b",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        textAlign: "center",
        padding: "4px 0",
      }}>
        ISS PROMETHEUS — SELECT ROOM
      </div>

      {ROOM_ORDER.map((room, i) => {
        const isUnlocked = unlockedRooms.includes(room.id);
        const isBridge = room.id === "bridge";
        const { earned, max } = getStarDisplay(starsData, room.id);

        return (
          <motion.button
            key={room.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => isUnlocked && !isBridge && onRoomClick(room.id)}
            disabled={!isUnlocked || isBridge}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              width: "100%",
              padding: "14px 16px",
              background: isUnlocked
                ? "rgba(255,255,255,0.04)"
                : "rgba(15,23,42,0.5)",
              border: "none",
              borderLeft: `4px solid ${isUnlocked ? room.color : "#1e293b"}`,
              borderRadius: "12px",
              color: "inherit",
              textAlign: "left",
              cursor: isUnlocked && !isBridge ? "pointer" : "default",
              opacity: isUnlocked ? 1 : 0.45,
              textTransform: "none",
              letterSpacing: "0",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Icon */}
            <div style={{
              fontSize: "1.6rem",
              width: "44px",
              height: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "10px",
              background: isUnlocked
                ? `${room.color}22`
                : "rgba(255,255,255,0.03)",
              flexShrink: 0,
            }}>
              {isUnlocked ? room.icon : "🔒"}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: isUnlocked ? "#f8fafc" : "#475569",
                fontFamily: "monospace",
              }}>
                {room.label}
              </div>
              <div style={{
                fontSize: "0.7rem",
                color: isUnlocked ? "#94a3b8" : "#334155",
                marginTop: "2px",
              }}>
                {room.subtitle}
              </div>
            </div>

            {/* Stars (for unlocked non-bridge rooms) */}
            {isUnlocked && !isBridge && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "0.75rem",
                color: "#fbbf24",
                fontFamily: "monospace",
                fontWeight: 700,
                flexShrink: 0,
              }}>
                <span>★</span>
                <span>{earned}/{max}</span>
              </div>
            )}

            {/* Bridge badge */}
            {isBridge && isUnlocked && (
              <div style={{
                fontSize: "0.6rem",
                color: "#64748b",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                flexShrink: 0,
              }}>
                HOME
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
