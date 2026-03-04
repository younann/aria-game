import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../systems/GameState";
import { playSound } from "../systems/SoundManager";
import { MISSIONS, CONCEPT_CARDS } from "../systems/MissionConfig";
import { useI18n } from "../systems/I18nContext";
import AriaInsight from "../ui/AriaInsight";

/* ── Constants ─────────────────────────────────────────────────── */

const ROSE = "#f43f5e";
const GREEN = "#10b981";
const AMBER = "#eab308";

const NAMES = [
  "Lt. Chen", "Dr. Vasquez", "Ens. Okafor", "Lt. Singh", "Dr. Park",
  "Cmdr. Reyes", "Ens. Kim", "Lt. Müller", "Dr. Tanaka", "Cmdr. Adeyemi",
  "Ens. Rivera", "Lt. Novak", "Dr. Ahmad", "Cmdr. Eklund", "Ens. Diaz",
  "Lt. Petrov", "Dr. Santos", "Cmdr. Williams", "Ens. Johansson", "Lt. Moyo",
];

const DEPARTMENTS = ["Engineering", "Science", "Medical", "Command"];
const RANKS = ["Junior", "Senior", "Commander"];
const REQUEST_TYPES = ["Equipment", "Training", "Research", "Supplies"];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

/* ── Decision data generation ──────────────────────────────────── */

function generateDecisionsL1(count) {
  const biasedDept = pick(DEPARTMENTS);
  const decisions = [];
  const usedNames = new Set();

  for (let i = 0; i < count; i++) {
    let name;
    do { name = pick(NAMES); } while (usedNames.has(name) && usedNames.size < NAMES.length);
    usedNames.add(name);

    const dept = i < count * 0.4 ? biasedDept : pick(DEPARTMENTS);
    const rank = pick(RANKS);
    const requestType = pick(REQUEST_TYPES);

    let approved;
    if (dept === biasedDept) {
      approved = Math.random() < 0.15; // 85% denied — biased
    } else {
      approved = Math.random() < 0.7; // 70% approved — fair
    }

    const isBiased = dept === biasedDept && !approved;

    decisions.push({
      id: i, name, department: dept, rank, requestType,
      decision: approved ? "Approved" : "Denied",
      isBiased,
    });
  }

  return { decisions, biasedDept, biasInfo: `${biasedDept} department was denied 85% of the time` };
}

function generateDecisionsL2(count) {
  const biasedDept = pick(DEPARTMENTS);
  const biasedRank = "Junior";
  const decisions = [];
  const usedNames = new Set();

  for (let i = 0; i < count; i++) {
    let name;
    do { name = pick(NAMES); } while (usedNames.has(name) && usedNames.size < NAMES.length);
    usedNames.add(name);

    const dept = pick(DEPARTMENTS);
    const rank = pick(RANKS);
    const requestType = pick(REQUEST_TYPES);

    let approved;
    if (dept === biasedDept && rank === biasedRank) {
      approved = Math.random() < 0.1; // 90% denied — intersectional bias
    } else if (dept === biasedDept) {
      approved = Math.random() < 0.6; // 60% approved — looks fair alone
    } else if (rank === biasedRank) {
      approved = Math.random() < 0.55; // 55% approved — looks fair alone
    } else {
      approved = Math.random() < 0.75;
    }

    const isBiased = dept === biasedDept && rank === biasedRank && !approved;

    decisions.push({
      id: i, name, department: dept, rank, requestType,
      decision: approved ? "Approved" : "Denied",
      isBiased,
    });
  }

  return { decisions, biasedDept, biasedRank, biasInfo: `${biasedDept} + ${biasedRank} intersection was denied 90%` };
}

function generateDecisionsL3(count) {
  const biasedDept = pick(DEPARTMENTS);
  const decisions = [];
  const usedNames = new Set();

  for (let i = 0; i < count; i++) {
    let name;
    do { name = pick(NAMES); } while (usedNames.has(name) && usedNames.size < NAMES.length);
    usedNames.add(name);

    const dept = pick(DEPARTMENTS);
    const rank = pick(RANKS);
    const requestType = pick(REQUEST_TYPES);

    let correctDecision;
    const quality = Math.random();
    if (quality > 0.4) {
      correctDecision = true;
    } else {
      correctDecision = false;
    }

    let biasedDecision;
    if (dept === biasedDept) {
      biasedDecision = Math.random() < 0.2;
    } else {
      biasedDecision = correctDecision;
    }

    decisions.push({
      id: i, name, department: dept, rank, requestType,
      decision: biasedDecision ? "Approved" : "Denied",
      correctDecision: correctDecision ? "Approved" : "Denied",
      isBiased: dept === biasedDept && biasedDecision !== correctDecision,
    });
  }

  return { decisions, biasedDept };
}

/* ── Concept card helpers ──────────────────────────────────────── */

const LEVEL_CARDS = {
  1: ["training_bias", "fairness"],
  2: ["responsible_ai"],
  3: ["accuracy_fairness"],
};

function getCardsForLevel(level) {
  const ids = LEVEL_CARDS[level] || [];
  return ids
    .map((id) => CONCEPT_CARDS.find((c) => c.id === id && c.mission === "ethicschamber"))
    .filter(Boolean);
}

/* ── Bar chart component ───────────────────────────────────────── */

function BarChart({ data, label }) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div style={{ marginBottom: "16px" }}>
      {label && (
        <div style={{ fontSize: "0.65rem", color: "#64748b", letterSpacing: "0.15em", marginBottom: "8px" }}>
          {label}
        </div>
      )}
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <span style={{ fontSize: "0.7rem", color: "#94a3b8", width: "90px", textAlign: "right" }}>
            {d.label}
          </span>
          <div style={{
            flex: 1, height: "18px", background: "rgba(255,255,255,0.05)",
            borderRadius: "4px", overflow: "hidden",
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(d.value / maxVal) * 100}%` }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{
                height: "100%", borderRadius: "4px",
                background: d.value > 60 ? GREEN : d.value > 40 ? AMBER : ROSE,
              }}
            />
          </div>
          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#e2e8f0", width: "40px" }}>
            {Math.round(d.value)}%
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Gauge component (for L3) ──────────────────────────────────── */

function Gauge({ value, label, color }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div style={{ textAlign: "center", flex: 1 }}>
      <div style={{
        width: "100px", height: "100px", borderRadius: "50%",
        background: `conic-gradient(${color} ${pct * 3.6}deg, rgba(255,255,255,0.05) 0deg)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 8px",
      }}>
        <div style={{
          width: "76px", height: "76px", borderRadius: "50%",
          background: "rgba(5,5,16,0.95)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column",
        }}>
          <div style={{ fontSize: "1.3rem", fontWeight: 900, color }}>{Math.round(pct)}%</div>
        </div>
      </div>
      <div style={{ fontSize: "0.65rem", color: "#64748b", letterSpacing: "0.1em", fontWeight: 700 }}>{label}</div>
    </div>
  );
}

/* ── Star display ──────────────────────────────────────────────── */

function StarDisplay({ stars }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "8px", margin: "16px 0" }}>
      {[1, 2, 3].map((s) => (
        <motion.span key={s}
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3 + s * 0.2, type: "spring", stiffness: 200 }}
          style={{
            fontSize: "2.5rem",
            color: s <= stars ? "#fbbf24" : "#334155",
            filter: s <= stars ? "drop-shadow(0 0 8px rgba(251,191,36,0.6))" : "none",
          }}
        >
          {s <= stars ? "\u2605" : "\u2606"}
        </motion.span>
      ))}
    </div>
  );
}

/* ══════════════════════════ MAIN COMPONENT ══════════════════════ */

export default function BiasDetector({ level = 1, onComplete }) {
  const { dispatch } = useGame();
  const { t } = useI18n();
  const levelConfig = MISSIONS.ethicschamber.levels[level];
  const { starThresholds } = levelConfig;

  const [gameData] = useState(() => {
    if (level === 1) return generateDecisionsL1(levelConfig.decisionCount);
    if (level === 2) return generateDecisionsL2(levelConfig.decisionCount);
    return generateDecisionsL3(levelConfig.decisionCount);
  });

  const [flagged, setFlagged] = useState(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone] = useState(false);

  const [insights, setInsights] = useState([]);
  const pushInsight = useCallback((msg) => {
    const id = `insight-${Date.now()}`;
    setInsights((prev) => [...prev, { id, message: msg }]);
  }, []);
  const dismissInsight = useCallback((id) => {
    setInsights((prev) => prev.filter((i) => i.id !== id));
  }, []);

  // L2 filters
  const [filterDept, setFilterDept] = useState("All");
  const [filterRank, setFilterRank] = useState("All");

  // L3 fairness sliders
  const [deptFairness, setDeptFairness] = useState(50);
  const [rankFairness, setRankFairness] = useState(50);
  const [threshold, setThreshold] = useState(50);

  const decisions = gameData.decisions;

  // Filtered decisions for display (L2)
  const filteredDecisions = useMemo(() => {
    if (level !== 2) return decisions;
    return decisions.filter((d) => {
      if (filterDept !== "All" && d.department !== filterDept) return false;
      if (filterRank !== "All" && d.rank !== filterRank) return false;
      return true;
    });
  }, [decisions, level, filterDept, filterRank]);

  // Approval rate calculations
  const approvalRates = useMemo(() => {
    const byDept = {};
    for (const dept of DEPARTMENTS) {
      const deptDecisions = decisions.filter((d) => d.department === dept);
      const approved = deptDecisions.filter((d) => d.decision === "Approved").length;
      byDept[dept] = deptDecisions.length > 0 ? (approved / deptDecisions.length) * 100 : 0;
    }
    return byDept;
  }, [decisions]);

  // L3: calculate fairness and accuracy from slider values
  const l3Scores = useMemo(() => {
    if (level !== 3) return { fairness: 0, accuracy: 0 };

    let correctCount = 0;
    const adjusted = decisions.map((d) => {
      let shouldApprove = d.correctDecision === "Approved";

      // Apply fairness adjustments
      if (d.department === gameData.biasedDept) {
        if (deptFairness > 60) shouldApprove = shouldApprove || Math.random() < (deptFairness - 60) / 80;
      }
      if (d.rank === "Junior" && rankFairness > 60) {
        shouldApprove = shouldApprove || Math.random() < (rankFairness - 60) / 100;
      }

      const adjustedDecision = shouldApprove && threshold < 70 ? true : shouldApprove;
      if ((adjustedDecision ? "Approved" : "Denied") === d.correctDecision) correctCount++;

      return adjustedDecision;
    });

    const accuracy = (correctCount / decisions.length) * 100;

    // Fairness: measure variance of approval rates across departments
    const deptRates = {};
    DEPARTMENTS.forEach((dept) => {
      const deptItems = decisions.filter((d, i) => d.department === dept);
      const approvedCount = deptItems.filter((d, i) => adjusted[decisions.indexOf(d)]).length;
      deptRates[dept] = deptItems.length > 0 ? (approvedCount / deptItems.length) * 100 : 50;
    });
    const rates = Object.values(deptRates);
    const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
    const variance = rates.reduce((a, b) => a + (b - mean) ** 2, 0) / rates.length;
    const fairness = Math.max(0, 100 - variance * 0.5);

    return { fairness, accuracy };
  }, [level, decisions, gameData.biasedDept, deptFairness, rankFairness, threshold]);

  /* ── Toggle flag ── */
  const toggleFlag = useCallback((id) => {
    if (submitted) return;
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, [submitted]);

  /* ── Calculate stars ── */
  const calcStars = useCallback((score) => {
    const t = starThresholds;
    if (score >= t[3]) return 3;
    if (score >= t[2]) return 2;
    if (score >= t[1]) return 1;
    return 0;
  }, [starThresholds]);

  /* ── Submit (L1/L2) ── */
  const handleSubmit = useCallback(() => {
    if (submitted) return;
    setSubmitted(true);

    const biasedIds = new Set(decisions.filter((d) => d.isBiased).map((d) => d.id));
    const correctFlags = [...flagged].filter((id) => biasedIds.has(id)).length;
    const totalBiased = biasedIds.size;
    const wrongFlags = [...flagged].filter((id) => !biasedIds.has(id)).length;
    const score = totalBiased > 0
      ? Math.round(Math.max(0, (correctFlags / totalBiased) * 100 - wrongFlags * 10))
      : 0;

    const stars = calcStars(score);

    dispatch({ type: "SET_STARS", payload: { mission: "ethicschamber", level, stars } });
    dispatch({ type: "COMPLETE_LEVEL", payload: { mission: "ethicschamber", level } });
    dispatch({ type: "ADD_XP", payload: 30 + stars * 15 });

    getCardsForLevel(level).forEach((card) => {
      dispatch({
        type: "ADD_CODEX_CARD",
        payload: { id: card.id, title: card.title, description: card.description, realWorld: card.realWorld, rarity: card.rarity, icon: card.icon },
      });
    });

    dispatch({
      type: "SET_MISSION_RESULT",
      payload: { mission: "ethicschamber", result: { score, correctFlags, totalBiased } },
    });

    playSound("success");

    // AriaInsight based on audit quality
    if (wrongFlags === 0 && correctFlags === totalBiased) {
      pushInsight(t("labs.bias.insight.perfect"));
    } else if (wrongFlags > correctFlags) {
      pushInsight(t("labs.bias.insight.overFlag"));
    } else if (correctFlags < totalBiased) {
      pushInsight(t("labs.bias.insight.subtle"));
    }

    setTimeout(() => setDone({ score, stars }), 1500);
  }, [submitted, decisions, flagged, calcStars, dispatch, level, pushInsight]);

  /* ── Submit L3 ── */
  const handleSubmitL3 = useCallback(() => {
    const combined = (l3Scores.fairness + l3Scores.accuracy) / 2;
    const stars = calcStars(combined);

    dispatch({ type: "SET_STARS", payload: { mission: "ethicschamber", level: 3, stars } });
    dispatch({ type: "COMPLETE_LEVEL", payload: { mission: "ethicschamber", level: 3 } });
    dispatch({ type: "ADD_XP", payload: 30 + stars * 15 });

    getCardsForLevel(3).forEach((card) => {
      dispatch({
        type: "ADD_CODEX_CARD",
        payload: { id: card.id, title: card.title, description: card.description, realWorld: card.realWorld, rarity: card.rarity, icon: card.icon },
      });
    });

    dispatch({
      type: "SET_MISSION_RESULT",
      payload: { mission: "ethicschamber", result: { fairness: l3Scores.fairness, accuracy: l3Scores.accuracy } },
    });

    playSound("success");
    setDone({ score: Math.round((l3Scores.fairness + l3Scores.accuracy) / 2), stars });
  }, [l3Scores, calcStars, dispatch]);

  /* ═══════════════════════ COMPLETION SCREEN ═══════════════════════ */

  if (done) {
    const { score, stars } = done;
    const awardedCards = getCardsForLevel(level);

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: "48px", textAlign: "center" }}>
        <div style={{ fontSize: "4rem", marginBottom: "16px" }}>{"\u2696\uFE0F"}</div>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 900, marginBottom: "8px", color: "#f8fafc" }}>
          {t(`labs.bias.complete.${level}`)}
        </h2>
        <div style={{ fontSize: "0.75rem", color: "#64748b", letterSpacing: "0.15em", marginBottom: "8px" }}>
          {t("common.level")} {level} — {levelConfig.name.toUpperCase()}
        </div>

        <StarDisplay stars={stars} />

        <div style={{ display: "flex", justifyContent: "center", gap: "32px", margin: "24px 0" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: ROSE }}>{score}%</div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", letterSpacing: "0.1em" }}>{t("common.score")}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#fbbf24" }}>{stars}/3</div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", letterSpacing: "0.1em" }}>{t("common.stars")}</div>
          </div>
        </div>

        {submitted && level <= 2 && (
          <div style={{
            margin: "16px auto", maxWidth: "500px", padding: "16px",
            background: "rgba(244,63,94,0.06)", border: "1px solid rgba(244,63,94,0.2)",
            borderRadius: "12px", fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.6,
          }}>
            <strong style={{ color: ROSE }}>{t("labs.bias.biasFound")}</strong> {gameData.biasInfo}
          </div>
        )}

        {awardedCards.length > 0 && (
          <div style={{ margin: "24px auto", maxWidth: "400px" }}>
            <div style={{ fontSize: "0.65rem", color: "#64748b", letterSpacing: "0.2em", marginBottom: "12px" }}>
              {t("common.conceptCardsCollected")}
            </div>
            {awardedCards.map((card) => (
              <motion.div key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px 16px", marginBottom: "8px",
                  background: card.rarity === "hidden" ? "rgba(251,191,36,0.1)" : card.rarity === "rare" ? "rgba(139,92,246,0.12)" : "rgba(244,63,94,0.08)",
                  border: `1px solid ${card.rarity === "hidden" ? "rgba(251,191,36,0.3)" : card.rarity === "rare" ? "rgba(139,92,246,0.3)" : "rgba(244,63,94,0.2)"}`,
                  borderRadius: "10px", textAlign: "left",
                }}
              >
                <span style={{ fontSize: "1.5rem" }}>{card.icon}</span>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f8fafc" }}>{card.title}</div>
                  <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                    {t(`common.${card.rarity}`)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <button
          onClick={() => onComplete({ stars, score })}
          style={{
            padding: "16px 48px", background: ROSE, border: "none",
            borderRadius: "8px", color: "white", fontSize: "1rem",
            fontWeight: 800, cursor: "pointer", letterSpacing: "0.1em",
          }}
        >
          {t("common.returnToStation")}
        </button>
      </motion.div>
    );
  }

  /* ═══════════════════════ LEVEL 3: FIX BIAS ═══════════════════════ */

  if (level === 3) {
    return (
      <div style={{ padding: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "0.1em", color: "#f8fafc" }}>
              {t("labs.bias.fairnessCalibration")}
            </h3>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
              {t("common.level")} 3 — {levelConfig.name}: {t("labs.bias.l3Subtitle")}
            </div>
          </div>
        </div>

        {/* Gauges */}
        <div style={{ display: "flex", gap: "24px", marginBottom: "32px", justifyContent: "center" }}>
          <Gauge value={l3Scores.fairness} label={t("labs.bias.fairness")} color={l3Scores.fairness > 70 ? GREEN : ROSE} />
          <Gauge value={l3Scores.accuracy} label={t("labs.bias.accuracyLabel")} color={l3Scores.accuracy > 70 ? GREEN : ROSE} />
        </div>

        {/* Sliders */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
          {[
            { label: t("labs.bias.deptFairness"), value: deptFairness, setter: setDeptFairness },
            { label: t("labs.bias.rankFairness"), value: rankFairness, setter: setRankFairness },
            { label: t("labs.bias.overallThreshold"), value: threshold, setter: setThreshold },
          ].map(({ label, value, setter }) => (
            <div key={label} style={{
              background: "rgba(255,255,255,0.03)", borderRadius: "12px",
              padding: "16px", border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#e2e8f0", letterSpacing: "0.1em" }}>{label}</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 800, color: ROSE }}>{value}%</span>
              </div>
              <input type="range" min="0" max="100" step="1" value={value}
                onChange={(e) => setter(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: ROSE, cursor: "pointer" }}
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmitL3}
          disabled={l3Scores.fairness < 50 && l3Scores.accuracy < 50}
          style={{
            width: "100%", padding: "18px",
            background: l3Scores.fairness > 60 && l3Scores.accuracy > 60 ? ROSE : "rgba(255,255,255,0.05)",
            border: l3Scores.fairness > 60 && l3Scores.accuracy > 60 ? "none" : "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px", color: "white", fontSize: "1rem",
            fontWeight: 800, cursor: "pointer", letterSpacing: "0.15em",
          }}
        >
          {t("labs.bias.applyCorrections")}
        </button>

        <div style={{
          marginTop: "24px", padding: "16px",
          background: "rgba(244,63,94,0.08)",
          border: "1px solid rgba(244,63,94,0.2)",
          borderRadius: "10px", fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.5,
        }}>
          <strong style={{ color: "#fb7185" }}>{t("common.ariaHint")}</strong>{" "}
          {t("labs.bias.hint.3")}
        </div>
      </div>
    );
  }

  /* ═══════════════════════ LEVEL 1 & 2: FLAG BIAS ═══════════════════ */

  const showDecisions = level === 2 ? filteredDecisions : decisions;

  return (
    <div style={{ padding: "32px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "0.1em", color: "#f8fafc" }}>
            BIAS AUDIT
          </h3>
          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
            Level {level} — {levelConfig.name}: {level === 1 ? "Flag the biased decisions" : "Find the hidden bias"}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "0.6rem", color: "#64748b", letterSpacing: "0.1em" }}>FLAGGED</div>
          <div style={{ fontWeight: 800, fontSize: "1.1rem", color: flagged.size > 0 ? ROSE : "#64748b" }}>
            {flagged.size}
          </div>
        </div>
      </div>

      {/* L2 Filters */}
      {level === 2 && !submitted && (
        <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
          <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
            style={{
              padding: "8px 12px", background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px",
              color: "#e2e8f0", fontSize: "0.75rem", cursor: "pointer",
            }}
          >
            <option value="All">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={filterRank} onChange={(e) => setFilterRank(e.target.value)}
            style={{
              padding: "8px 12px", background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px",
              color: "#e2e8f0", fontSize: "0.75rem", cursor: "pointer",
            }}
          >
            <option value="All">All Ranks</option>
            {RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      )}

      {/* Decision table */}
      <div style={{
        background: "rgba(0,0,0,0.3)", borderRadius: "12px",
        overflow: "hidden", marginBottom: "24px",
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
        {/* Table header */}
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr",
          padding: "10px 16px", background: "rgba(255,255,255,0.03)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          fontSize: "0.6rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.1em",
        }}>
          <span>NAME</span>
          <span>DEPARTMENT</span>
          <span>RANK</span>
          <span>REQUEST</span>
          <span>DECISION</span>
        </div>

        {/* Rows */}
        <div style={{ maxHeight: "320px", overflowY: "auto" }}>
          {showDecisions.map((d) => {
            const isFlagged = flagged.has(d.id);
            const showResult = submitted;
            const wasCorrectFlag = showResult && d.isBiased && isFlagged;
            const wasMissedBias = showResult && d.isBiased && !isFlagged;
            const wasWrongFlag = showResult && !d.isBiased && isFlagged;

            let rowBg = "transparent";
            if (wasCorrectFlag) rowBg = "rgba(16,185,129,0.1)";
            else if (wasMissedBias) rowBg = "rgba(234,179,8,0.1)";
            else if (wasWrongFlag) rowBg = "rgba(244,63,94,0.1)";
            else if (isFlagged) rowBg = "rgba(244,63,94,0.06)";

            return (
              <div key={d.id}
                onClick={() => toggleFlag(d.id)}
                style={{
                  display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr",
                  padding: "10px 16px", fontSize: "0.75rem", color: "#e2e8f0",
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                  background: rowBg,
                  cursor: submitted ? "default" : "pointer",
                  borderLeft: isFlagged ? `3px solid ${ROSE}` : "3px solid transparent",
                  transition: "background 0.2s",
                }}
              >
                <span>{d.name}</span>
                <span>{d.department}</span>
                <span style={{ fontSize: "0.7rem" }}>{d.rank}</span>
                <span style={{ fontSize: "0.7rem" }}>{d.requestType}</span>
                <span style={{
                  fontWeight: 700,
                  color: d.decision === "Approved" ? GREEN : ROSE,
                }}>
                  {d.decision}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Approval rates chart (shown after submit or always for L2) */}
      {(submitted || level === 2) && (
        <BarChart
          label="APPROVAL RATE BY DEPARTMENT"
          data={DEPARTMENTS.map((dept) => ({
            label: dept,
            value: approvalRates[dept] || 0,
          }))}
        />
      )}

      {/* Submit button */}
      {!submitted && (
        <button onClick={handleSubmit} disabled={flagged.size === 0}
          style={{
            width: "100%", padding: "18px",
            background: flagged.size > 0 ? ROSE : "rgba(255,255,255,0.05)",
            border: flagged.size > 0 ? "none" : "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px", color: "white", fontSize: "1rem",
            fontWeight: 800, cursor: flagged.size > 0 ? "pointer" : "not-allowed",
            letterSpacing: "0.15em",
          }}
        >
          SUBMIT AUDIT ({flagged.size} flagged)
        </button>
      )}

      {/* Hint */}
      <div style={{
        marginTop: "24px", padding: "16px",
        background: "rgba(244,63,94,0.08)",
        border: "1px solid rgba(244,63,94,0.2)",
        borderRadius: "10px", fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.5,
      }}>
        <strong style={{ color: "#fb7185" }}>ARIA HINT:</strong>{" "}
        {level === 1 && "Look at the decisions column. Is one department getting denied much more than others? Click those rows to flag them as biased."}
        {level === 2 && "The bias is hidden! Try filtering by different combinations of Department and Rank. Look for a specific intersection where denial rates spike."}
      </div>

      <AriaInsight insights={insights} onDismiss={dismissInsight} />
    </div>
  );
}
