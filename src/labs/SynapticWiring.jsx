import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../systems/GameState";
import { playSound } from "../systems/SoundManager";
import { MISSIONS, CONCEPT_CARDS } from "../systems/MissionConfig";
import AriaInsight from "../ui/AriaInsight";
import { useI18n } from "../systems/I18nContext";
import useViewport from "../hooks/useViewport";

/* ---------- Constants ---------- */
const INPUT_LABELS = ["VISUAL DATA", "MOTION DATA", "AUDIO DATA"];
const INPUT_ICONS = ["\u{1F441}\uFE0F", "\u{1F3C3}", "\u{1F3B5}"];
const INPUT_NAMES = ["Visual", "Motion", "Audio"];

/* ---------- Helpers ---------- */

function getInputCount(level) {
  return level >= 3 ? 3 : 2;
}

function getInputValues(count) {
  return [1, 0.5, 0.7].slice(0, count);
}

function buildSliderConfigs(levelConfig) {
  const { weightCount, hasBias } = levelConfig;
  const pureWeights = hasBias ? weightCount - 1 : weightCount;
  const sliders = [];
  for (let i = 0; i < pureWeights; i++) {
    sliders.push({
      label: `WEIGHT ${i + 1}: ${INPUT_NAMES[i] || "Input " + (i + 1)} Importance`,
      isBias: false,
      idx: i,
    });
  }
  if (hasBias) {
    sliders.push({ label: "BIAS: Base Threshold", isBias: true, idx: weightCount - 1 });
  }
  return sliders;
}

function calcSigmoid(inputs, weights, hasBias) {
  let sum = 0;
  const wCount = hasBias ? weights.length - 1 : weights.length;
  for (let i = 0; i < wCount; i++) {
    sum += (i < inputs.length ? inputs[i] : 0.5) * weights[i];
  }
  if (hasBias) sum += weights[weights.length - 1];
  return 1 / (1 + Math.exp(-sum));
}

function checkActivated(level, cfg, pct) {
  if (level === 3) {
    const [lo, hi] = cfg.targetRange;
    return pct >= lo && pct <= hi;
  }
  return pct >= cfg.target;
}

function calcStars(level, cfg, pct) {
  const t = cfg.starThresholds;
  if (level === 3) {
    const closeness = 100 - Math.abs(pct - 80);
    if (closeness >= t[3]) return 3;
    if (closeness >= t[2]) return 2;
    if (closeness >= t[1]) return 1;
    return 0;
  }
  if (pct >= t[3]) return 3;
  if (pct >= t[2]) return 2;
  if (pct >= t[1]) return 1;
  return 0;
}

function getCardsForLevel(level) {
  const pool = CONCEPT_CARDS.filter((c) => c.mission === "neuralcore");
  if (level === 1) return pool.filter((c) => c.id === "synapse_weights" || c.id === "activation_function");
  if (level === 2) return pool.filter((c) => c.id === "neural_network");
  if (level === 3) return pool.filter((c) => c.id === "gradient_descent");
  return [];
}

/* ---------- Sub-components ---------- */

function GuideArrow({ visible, direction, t }) {
  if (!visible) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: "absolute", right: "-100px", top: "50%", display: window.innerWidth < 768 ? "none" : "block",
        transform: "translateY(-50%)", fontSize: "0.7rem",
        color: "#a78bfa", fontWeight: 700, whiteSpace: "nowrap",
        pointerEvents: "none", letterSpacing: "0.05em",
      }}
    >
      {direction === "up" ? t("labs.wiring.guideUp") : t("labs.wiring.guideRight")}
    </motion.div>
  );
}

function PrecisionIndicator({ outputPercent, targetRange, t }) {
  const [lo, hi] = targetRange;
  const center = (lo + hi) / 2;
  const inRange = outputPercent >= lo && outputPercent <= hi;
  const distance = Math.abs(outputPercent - center);
  const marker = Math.max(0, Math.min(100, outputPercent));

  return (
    <div style={{
      marginBottom: "24px", padding: "16px",
      background: "rgba(0,0,0,0.3)", borderRadius: "12px",
      border: `1px solid ${inRange ? "rgba(16,185,129,0.3)" : "rgba(244,63,94,0.3)"}`,
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: "12px",
      }}>
        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#e2e8f0", letterSpacing: "0.1em" }}>
          {t("labs.wiring.precisionIndicator")}
        </span>
        <span style={{ fontSize: "0.75rem", fontWeight: 800, color: inRange ? "#10b981" : "#f43f5e" }}>
          {inRange ? t("labs.wiring.inRange") : t("labs.wiring.fromCenter", { distance: distance.toFixed(1) })}
        </span>
      </div>

      <div style={{
        position: "relative", height: "32px",
        background: "rgba(255,255,255,0.05)", borderRadius: "8px", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", left: `${lo}%`, width: `${hi - lo}%`,
          top: 0, bottom: 0, background: "rgba(16,185,129,0.2)",
          borderLeft: "2px solid rgba(16,185,129,0.5)",
          borderRight: "2px solid rgba(16,185,129,0.5)",
        }} />
        <div style={{
          position: "absolute", left: `${center}%`, top: "4px", bottom: "4px",
          width: "2px", background: "rgba(16,185,129,0.6)", transform: "translateX(-1px)",
        }} />
        <motion.div
          animate={{ left: `${marker}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          style={{
            position: "absolute", top: "2px", bottom: "2px",
            width: "4px", borderRadius: "2px",
            background: inRange ? "#10b981" : "#f43f5e",
            transform: "translateX(-2px)",
            boxShadow: `0 0 12px ${inRange ? "#10b981" : "#f43f5e"}`,
          }}
        />
      </div>

      <div style={{
        display: "flex", justifyContent: "space-between",
        marginTop: "6px", fontSize: "0.6rem", color: "#64748b",
      }}>
        <span>0%</span>
        <span style={{ color: "#10b981" }}>{lo}%</span>
        <span style={{ color: "#10b981", fontWeight: 700 }}>{center}% (target)</span>
        <span style={{ color: "#10b981" }}>{hi}%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

function NeuronDiagram({ inputValues, weights, output, outputPercent, getColor, pulseKey, hasBias, level, t }) {
  const wireColor = (w) => (w > 0 ? "#8b5cf6" : "#f43f5e");
  const wireOpacity = (w) => Math.abs(w) * 0.8 + 0.2;
  const count = inputValues.length;
  const pureWeights = hasBias ? weights.length - 1 : weights.length;

  const inputYs = [];
  if (count === 1) {
    inputYs.push(50);
  } else {
    const span = 70;
    const start = 50 - span / 2;
    for (let i = 0; i < count; i++) {
      inputYs.push(start + (span / (count - 1)) * i);
    }
  }

  const lines = [];
  for (let w = 0; w < pureWeights; w++) {
    const srcIdx = Math.min(w, count - 1);
    lines.push({
      x1: "20%", y1: `${inputYs[srcIdx]}%`,
      x2: "80%", y2: "50%",
      weight: weights[w], key: `w${w}`,
    });
  }

  return (
    <div style={{
      background: "rgba(0,0,0,0.3)", borderRadius: "16px",
      padding: "32px", marginBottom: "24px",
      position: "relative", height: count > 2 ? "340px" : "280px",
      display: "flex", alignItems: "center", justifyContent: "space-around",
    }}>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        {lines.map((l) => (
          <line key={l.key}
            x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke={wireColor(l.weight)}
            strokeWidth={Math.abs(l.weight) * 8 + 2}
            opacity={wireOpacity(l.weight)}
          />
        ))}
        {lines.map((l, i) => (
          <motion.circle key={`pulse-${l.key}-${pulseKey}`} r="5" fill="white"
            initial={{ cx: l.x1, cy: l.y1, opacity: 1 }}
            animate={{ cx: l.x2, cy: l.y2, opacity: 0 }}
            transition={{ duration: 0.8 + i * 0.15, ease: "linear" }}
            style={{ filter: "drop-shadow(0 0 6px white)" }}
          />
        ))}
      </svg>

      <div style={{ display: "flex", flexDirection: "column", gap: count > 2 ? "40px" : "60px", zIndex: 1 }}>
        {inputValues.map((_, i) => (
          <div key={i} style={{
            width: "60px", height: "60px", borderRadius: "12px",
            background: "rgba(139,92,246,0.2)", border: "2px solid #8b5cf6",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", fontSize: "0.5rem", color: "#c4b5fd",
            fontWeight: 700, letterSpacing: "0.1em", textAlign: "center",
          }}>
            <div style={{ fontSize: "1.2rem", marginBottom: "2px" }}>{INPUT_ICONS[i]}</div>
            {t(`labs.wiring.inputLabel.${i}`)}
          </div>
        ))}
      </div>

      <motion.div
        animate={{
          boxShadow: `0 0 ${20 + output * 40}px ${getColor()}55`,
          borderColor: getColor(),
        }}
        style={{
          width: "90px", height: "90px", borderRadius: "50%",
          border: "4px solid", background: "rgba(5,5,16,0.8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column", zIndex: 1,
        }}
      >
        <div style={{ fontSize: "2rem" }}>🧠</div>
        <div style={{ fontSize: "0.6rem", fontWeight: 800, color: getColor() }}>{outputPercent}%</div>
      </motion.div>
    </div>
  );
}

function StarDisplay({ stars, maxStars = 3 }) {
  return (
    <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "16px" }}>
      {Array.from({ length: maxStars }, (_, i) => (
        <motion.span key={i}
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: i * 0.2, type: "spring", stiffness: 200 }}
          style={{
            fontSize: "2.5rem",
            filter: i < stars ? "drop-shadow(0 0 8px #fbbf24)" : "none",
            opacity: i < stars ? 1 : 0.3,
          }}
        >
          {i < stars ? "\u2605" : "\u2606"}
        </motion.span>
      ))}
    </div>
  );
}

/* ══════════════════════════ MAIN COMPONENT ══════════════════════════════════ */

export default function SynapticWiring({ level = 1, onComplete }) {
  const { dispatch } = useGame();
  const { t } = useI18n();
  const { isMobile } = useViewport();
  const levelConfig = MISSIONS.neuralcore.levels[level];
  const { weightCount, hasBias } = levelConfig;
  const target = levelConfig.target || null;
  const targetRange = levelConfig.targetRange || null;

  const inputCount = getInputCount(level);
  const inputValues = getInputValues(inputCount);
  const sliderConfigs = buildSliderConfigs(levelConfig);

  const [weights, setWeights] = useState(() => new Array(weightCount).fill(0.1));
  const [pulseKey, setPulseKey] = useState(0);
  const [awakened, setAwakened] = useState(false);
  const [guidesVisible, setGuidesVisible] = useState(level === 1);
  const adjustedRef = useRef(new Set());

  const [insights, setInsights] = useState([]);
  const firedInsights = useRef(new Set());
  const pushOnce = useCallback((key, msg) => {
    if (firedInsights.current.has(key)) return;
    firedInsights.current.add(key);
    setInsights((prev) => [...prev, { id: key, message: msg }]);
  }, []);
  const dismissInsight = useCallback((id) => {
    setInsights((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const output = calcSigmoid(inputValues, weights, hasBias);
  const outputPercent = Math.round(output * 100);
  const activated = checkActivated(level, levelConfig, outputPercent);
  const earnedStars = calcStars(level, levelConfig, outputPercent);

  // Milestone insights
  if (outputPercent >= 50 && outputPercent < 90) {
    pushOnce("sigmoid50", t("labs.wiring.insight.sigmoid50"));
  }
  if (outputPercent > 90) {
    pushOnce("precision90", t("labs.wiring.insight.precision90"));
  }
  if (level === 3 && targetRange && outputPercent >= targetRange[0] && outputPercent <= targetRange[1]) {
    pushOnce("l3precision", t("labs.wiring.insight.l3precision"));
  }

  const getColor = () => {
    if (level === 3) {
      return targetRange && outputPercent >= targetRange[0] && outputPercent <= targetRange[1]
        ? "#10b981" : "#f43f5e";
    }
    if (output > 0.7) return "#10b981";
    if (output < 0.3) return "#f43f5e";
    return "#eab308";
  };

  const handleWeightChange = (i, val) => {
    const next = [...weights];
    next[i] = val;
    setWeights(next);
    setPulseKey((k) => k + 1);

    if (level === 1 && guidesVisible) {
      adjustedRef.current.add(i);
      if (adjustedRef.current.size >= weightCount) setGuidesVisible(false);
    }
  };

  const handleAwaken = () => {
    if (!activated || awakened) return;
    setAwakened(true);

    const stars = earnedStars;
    dispatch({ type: "SET_STARS", payload: { mission: "neuralcore", level, stars } });
    dispatch({ type: "COMPLETE_LEVEL", payload: { mission: "neuralcore", level } });
    dispatch({ type: "ADD_XP", payload: 40 + stars * 20 });
    dispatch({ type: "HEAL_ARIA", payload: 15 + stars * 5 });

    getCardsForLevel(level).forEach((card) => {
      dispatch({
        type: "ADD_CODEX_CARD",
        payload: { id: card.id, title: card.title, description: card.description, realWorld: card.realWorld, rarity: card.rarity, icon: card.icon },
      });
    });

    if (level === 1) {
      dispatch({ type: "ADD_CONCEPT", payload: { title: "Synapse Weights", desc: "Weights determine how much influence each input has on the output — like importance dials." } });
      dispatch({ type: "ADD_CONCEPT", payload: { title: "Activation Function", desc: "The sigmoid function squashes any number into a value between 0 and 1 — like a confidence percentage." } });
    }
    if (output > 0.95) {
      dispatch({ type: "ADD_ACHIEVEMENT", payload: "Weight Wizard" });
    }

    playSound("success");
  };

  const handleComplete = () => {
    if (onComplete) onComplete({ stars: earnedStars, outputPercent });
  };

  const showOvershoot = level === 2 && outputPercent > 98;

  const getButtonText = () => {
    if (level === 3) {
      if (activated) return t("labs.wiring.activateCore");
      if (outputPercent < targetRange[0]) return t("labs.wiring.outputMustBeAbove", { min: targetRange[0] });
      if (outputPercent > targetRange[1]) return t("labs.wiring.outputMustBeBelow", { max: targetRange[1] });
      return t("labs.wiring.targetRange", { min: targetRange[0], max: targetRange[1] });
    }
    return activated ? t("labs.wiring.activateCore") : t("labs.wiring.outputMustExceed", { target });
  };

  const getHintText = () => {
    return t(`labs.wiring.hint.${level}`);
  };

  /* ═══════════════════════════ COMPLETION SCREEN ═══════════════════════════════ */

  if (awakened) {
    const stars = earnedStars;
    const cards = getCardsForLevel(level);

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ padding: isMobile ? "24px 16px" : "48px", textAlign: "center" }}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ fontSize: "5rem", marginBottom: "16px" }}
        >
          🧠
        </motion.div>

        <h2 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#f8fafc", marginBottom: "8px" }}>
          {t("labs.wiring.complete")}
        </h2>
        <p style={{ color: "#94a3b8", fontSize: "1rem", maxWidth: "500px", margin: "0 auto 24px" }}>
          {t(`labs.wiring.completeMsg.${level}`)}
        </p>

        <StarDisplay stars={stars} />

        <div style={{ display: "flex", justifyContent: "center", gap: "32px", marginBottom: "24px" }}>
          <div>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#8b5cf6" }}>{outputPercent}%</div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{t("common.finalOutput")}</div>
          </div>
          <div>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#fbbf24" }}>{stars}/3</div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{t("common.starsEarned")}</div>
          </div>
          {level === 3 && (
            <div>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: Math.abs(outputPercent - 80) <= 5 ? "#10b981" : "#f43f5e" }}>
                {Math.abs(outputPercent - 80)}%
              </div>
              <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{t("common.fromCenter")}</div>
            </div>
          )}
        </div>

        {cards.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "0.7rem", color: "#64748b", letterSpacing: "0.15em", marginBottom: "12px" }}>
              {t("common.conceptCardsEarned")}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
              {cards.map((card) => (
                <motion.div key={card.id}
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                  style={{
                    padding: "12px 16px", borderRadius: "10px",
                    background: card.rarity === "rare"
                      ? "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.2))"
                      : "rgba(139,92,246,0.1)",
                    border: `1px solid ${card.rarity === "rare" ? "#a78bfa" : "rgba(139,92,246,0.3)"}`,
                    display: "flex", alignItems: "center", gap: "8px",
                  }}
                >
                  <span style={{ fontSize: "1.2rem" }}>{card.icon}</span>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#e2e8f0" }}>{card.title}</div>
                    <div style={{ fontSize: "0.6rem", color: "#94a3b8" }}>{card.rarity === "rare" ? t("common.rare") : t("common.common")}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <button onClick={handleComplete}
          style={{
            padding: "16px 48px", background: "#8b5cf6", border: "none",
            borderRadius: "8px", color: "white", fontSize: "1rem",
            fontWeight: 800, cursor: "pointer", letterSpacing: "0.1em",
          }}
        >
          {t("common.returnToStation")}
        </button>
      </motion.div>
    );
  }

  /* ═══════════════════════════ MAIN INTERFACE ═══════════════════════════════ */

  return (
    <div style={{ padding: isMobile ? "16px" : "32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: isMobile ? "20px" : "32px", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "0.1em", margin: 0 }}>
            {t("labs.wiring.title")}
          </h3>
          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
            {t(`labs.wiring.subtitle.${level}`)}
          </div>
          <div style={{ marginTop: "4px", fontSize: "0.6rem", fontWeight: 700, color: "#a78bfa", letterSpacing: "0.15em" }}>
            {t("common.level")} {level} — {levelConfig.name.toUpperCase()}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "0.6rem", color: "#64748b", letterSpacing: "0.1em" }}>{t("labs.wiring.output")}</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: getColor() }}>{outputPercent}%</div>
          <div style={{ fontSize: "0.6rem", color: "#64748b", marginTop: "2px" }}>
            {level === 3 ? t("labs.wiring.targetRange", { min: targetRange[0], max: targetRange[1] }) : t("labs.wiring.target", { target })}
          </div>
        </div>
      </div>

      {level === 3 && <PrecisionIndicator outputPercent={outputPercent} targetRange={targetRange} t={t} />}

      <AnimatePresence>
        {showOvershoot && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginBottom: "16px", padding: "12px 16px",
              background: "rgba(234,179,8,0.1)",
              border: "1px solid rgba(234,179,8,0.3)",
              borderRadius: "10px", fontSize: "0.8rem",
              color: "#fbbf24", fontWeight: 700,
              display: "flex", alignItems: "center", gap: "8px",
            }}
          >
            {t("labs.wiring.overshootWarning")}
          </motion.div>
        )}
      </AnimatePresence>

      <NeuronDiagram
        inputValues={inputValues}
        weights={weights}
        output={output}
        outputPercent={outputPercent}
        getColor={getColor}
        pulseKey={pulseKey}
        hasBias={hasBias}
        level={level}
        t={t}
      />

      <div style={{ display: "flex", justifyContent: "center", gap: "4px", marginBottom: "16px", fontSize: "1.2rem" }}>
        {[1, 2, 3].map((s) => (
          <span key={s} style={{
            opacity: earnedStars >= s ? 1 : 0.2,
            filter: earnedStars >= s ? "drop-shadow(0 0 4px #fbbf24)" : "none",
            transition: "all 0.3s ease",
          }}>
            {earnedStars >= s ? "\u2605" : "\u2606"}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
        {sliderConfigs.map(({ label, idx }) => {
          const showGuide = level === 1 && guidesVisible && !adjustedRef.current.has(idx);
          return (
            <div key={idx} style={{
              background: "rgba(255,255,255,0.03)", borderRadius: "12px",
              padding: "16px", border: "1px solid rgba(255,255,255,0.06)",
              position: "relative",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#e2e8f0" }}>{label}</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 800, color: weights[idx] > 0 ? "#8b5cf6" : "#f43f5e" }}>
                  {weights[idx].toFixed(1)}
                </span>
              </div>
              <input type="range" min="-1" max="1" step="0.1"
                value={weights[idx]}
                onChange={(e) => handleWeightChange(idx, parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#8b5cf6", cursor: "pointer" }}
              />
              {showGuide && <GuideArrow visible direction={idx === 0 ? "up" : "right"} t={t} />}
            </div>
          );
        })}
      </div>

      <button onClick={handleAwaken} disabled={!activated}
        style={{
          width: "100%", padding: "18px",
          background: activated ? "#8b5cf6" : "rgba(255,255,255,0.05)",
          border: activated ? "none" : "1px solid rgba(255,255,255,0.1)",
          borderRadius: "12px", color: "white", fontSize: "1rem",
          fontWeight: 800, cursor: activated ? "pointer" : "not-allowed",
          letterSpacing: "0.15em", transition: "all 0.3s ease",
        }}
      >
        {getButtonText()}
      </button>

      <div style={{
        marginTop: "24px", padding: "16px",
        background: "rgba(139,92,246,0.08)",
        border: "1px solid rgba(139,92,246,0.2)",
        borderRadius: "10px", fontSize: "0.8rem",
        color: "#94a3b8", lineHeight: 1.5,
      }}>
        <strong style={{ color: "#c4b5fd" }}>{t("common.ariaHint")}</strong> {getHintText()}
      </div>

      <AriaInsight insights={insights} onDismiss={dismissInsight} />
    </div>
  );
}
