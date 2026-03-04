import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../systems/GameState";
import { playSound } from "../systems/SoundManager";
import { MISSIONS, CONCEPT_CARDS } from "../systems/MissionConfig";
import { useI18n } from "../systems/I18nContext";
import AriaInsight from "../ui/AriaInsight";
import useViewport from "../hooks/useViewport";

/* ── Message bank ──────────────────────────────────────────────── */

const MESSAGES = {
  easy: [
    { text: "GREETINGS EARTH-FRIEND, we come in peace and wish to establish contact.", category: "Greeting", tokens: [{ word: "GREETINGS", importance: 0.9 }, { word: "peace", importance: 0.7 }, { word: "contact", importance: 0.4 }], explanation: "Clear greeting keywords: 'GREETINGS' and 'peace' signal friendly intent." },
    { text: "HELLO, fellow travelers! We have heard much about your species.", category: "Greeting", tokens: [{ word: "HELLO", importance: 0.95 }, { word: "travelers", importance: 0.3 }], explanation: "'HELLO' is one of the most reliable greeting tokens across languages." },
    { text: "Welcome aboard our vessel. We are honored by your presence.", category: "Greeting", tokens: [{ word: "Welcome", importance: 0.85 }, { word: "honored", importance: 0.6 }], explanation: "'Welcome' and 'honored' are strong positive greeting signals." },
    { text: "DANGER: Asteroid belt detected ahead. All ships must alter course immediately.", category: "Warning", tokens: [{ word: "DANGER", importance: 0.95 }, { word: "Asteroid", importance: 0.5 }, { word: "immediately", importance: 0.6 }], explanation: "'DANGER' is a high-confidence warning token. 'immediately' adds urgency." },
    { text: "WARNING: Radiation levels are rising in sector 7. Evacuate now.", category: "Warning", tokens: [{ word: "WARNING", importance: 0.95 }, { word: "Radiation", importance: 0.5 }, { word: "Evacuate", importance: 0.7 }], explanation: "'WARNING' and 'Evacuate' are clear danger signals." },
    { text: "ALERT: Hull breach detected on deck 4. Emergency protocols activated.", category: "Warning", tokens: [{ word: "ALERT", importance: 0.9 }, { word: "breach", importance: 0.7 }, { word: "Emergency", importance: 0.6 }], explanation: "'ALERT', 'breach', and 'Emergency' form a strong warning cluster." },
    { text: "We need additional fuel supplies for our journey. Can you assist?", category: "Request", tokens: [{ word: "need", importance: 0.8 }, { word: "supplies", importance: 0.5 }, { word: "assist", importance: 0.7 }], explanation: "'need' + 'assist' is a classic request pattern." },
    { text: "Please send medical personnel to our ship. We have injured crew.", category: "Request", tokens: [{ word: "Please", importance: 0.7 }, { word: "send", importance: 0.6 }, { word: "injured", importance: 0.5 }], explanation: "'Please send' is a direct request pattern with polite modifier." },
    { text: "Requesting permission to dock at your station for repairs.", category: "Request", tokens: [{ word: "Requesting", importance: 0.9 }, { word: "permission", importance: 0.7 }, { word: "repairs", importance: 0.4 }], explanation: "'Requesting permission' is one of the clearest request phrases." },
    { text: "We require navigational data for the Kepler Nebula route.", category: "Request", tokens: [{ word: "require", importance: 0.85 }, { word: "data", importance: 0.4 }], explanation: "'require' is a formal request word — similar to 'need' but more direct." },
    { text: "CAUTION: Ion storm approaching from the outer rim.", category: "Warning", tokens: [{ word: "CAUTION", importance: 0.9 }, { word: "storm", importance: 0.6 }, { word: "approaching", importance: 0.4 }], explanation: "'CAUTION' signals danger, similar to 'WARNING' and 'ALERT'." },
    { text: "Salutations, noble crew of the Prometheus! We bring good tidings.", category: "Greeting", tokens: [{ word: "Salutations", importance: 0.9 }, { word: "good tidings", importance: 0.6 }], explanation: "'Salutations' is a formal greeting token." },
  ],
  medium: [
    { text: "The asteroid's trajectory has shifted significantly toward inhabited space.", category: "Warning", tokens: [{ word: "trajectory", importance: 0.5 }, { word: "shifted", importance: 0.6 }, { word: "inhabited", importance: 0.7 }], explanation: "No obvious warning keyword, but the CONTEXT implies danger — trajectory shift toward people." },
    { text: "Perhaps you could assist with calibrating our navigation systems.", category: "Request", tokens: [{ word: "Perhaps", importance: 0.3 }, { word: "assist", importance: 0.7 }, { word: "calibrating", importance: 0.4 }], explanation: "Polite/indirect request — 'Perhaps you could' is a softened ask." },
    { text: "It has been too long since our civilizations last spoke.", category: "Greeting", tokens: [{ word: "too long", importance: 0.5 }, { word: "civilizations", importance: 0.4 }, { word: "spoke", importance: 0.6 }], explanation: "Reconnecting after absence — a form of greeting through nostalgia." },
    { text: "Our sensors indicate your shields are failing. You should act.", category: "Warning", tokens: [{ word: "sensors", importance: 0.3 }, { word: "failing", importance: 0.8 }, { word: "act", importance: 0.5 }], explanation: "'Failing' + 'act' suggest urgency without using explicit warning words." },
    { text: "We would be grateful for any spare crystalline fuel cores.", category: "Request", tokens: [{ word: "grateful", importance: 0.4 }, { word: "spare", importance: 0.5 }, { word: "fuel cores", importance: 0.6 }], explanation: "Indirect request — expressing gratitude in advance implies asking for something." },
    { text: "Our weapons are aimed at your bridge. You will comply.", category: "Threat", tokens: [{ word: "weapons", importance: 0.9 }, { word: "aimed", importance: 0.8 }, { word: "comply", importance: 0.7 }], explanation: "'Weapons aimed' + demand to 'comply' = clear hostile intent, not just a warning." },
    { text: "Surrender your cargo or face the consequences.", category: "Threat", tokens: [{ word: "Surrender", importance: 0.9 }, { word: "consequences", importance: 0.7 }], explanation: "'Surrender or else' is an ultimatum — a demand backed by implied force." },
    { text: "We are pleased to finally make your acquaintance, Captain.", category: "Greeting", tokens: [{ word: "pleased", importance: 0.6 }, { word: "acquaintance", importance: 0.7 }], explanation: "Formal greeting: expressing pleasure at meeting someone." },
    { text: "Your sector has been designated as our territory. Leave now.", category: "Threat", tokens: [{ word: "designated", importance: 0.5 }, { word: "territory", importance: 0.6 }, { word: "Leave", importance: 0.8 }], explanation: "Territorial claim + command to leave = hostile assertion of dominance." },
    { text: "The station's life support readings concern us greatly.", category: "Warning", tokens: [{ word: "life support", importance: 0.7 }, { word: "concern", importance: 0.6 }, { word: "greatly", importance: 0.3 }], explanation: "Expressing concern about critical systems implies something is wrong." },
    { text: "If your engineers have a moment, we have a technical question.", category: "Request", tokens: [{ word: "If", importance: 0.3 }, { word: "engineers", importance: 0.4 }, { word: "question", importance: 0.6 }], explanation: "Conditional framing ('if you have a moment') softens the request." },
    { text: "Do not attempt to flee. Our fleet surrounds you.", category: "Threat", tokens: [{ word: "Do not", importance: 0.7 }, { word: "flee", importance: 0.6 }, { word: "surrounds", importance: 0.8 }], explanation: "Prohibition ('do not flee') + display of force ('fleet surrounds') = threat." },
    { text: "We've traveled across three galaxies to reach you. What an honor.", category: "Greeting", tokens: [{ word: "traveled", importance: 0.3 }, { word: "reach you", importance: 0.4 }, { word: "honor", importance: 0.7 }], explanation: "Long journey to meet someone + 'honor' = elaborate greeting." },
    { text: "The nebula's radiation signature is unlike anything we've seen.", category: "Warning", tokens: [{ word: "radiation", importance: 0.7 }, { word: "unlike anything", importance: 0.6 }], explanation: "Unknown radiation pattern implies potential danger — indirect warning." },
  ],
  hard: [
    { text: "Oh wonderful, another meteor shower heading our way.", category: "Warning", tokens: [{ word: "wonderful", importance: 0.4 }, { word: "meteor shower", importance: 0.8 }, { word: "heading our way", importance: 0.6 }], explanation: "SARCASM — 'wonderful' is used ironically. The real meaning is a warning about meteors." },
    { text: "What a delightful surprise to find your ship in our space.", category: "Threat", tokens: [{ word: "delightful", importance: 0.3 }, { word: "surprise", importance: 0.4 }, { word: "our space", importance: 0.8 }], explanation: "Passive-aggressive: 'our space' implies territorial claim. The politeness is menacing." },
    { text: "Sure, take your time responding. It's not like we're running out of oxygen.", category: "Request", tokens: [{ word: "take your time", importance: 0.5 }, { word: "oxygen", importance: 0.8 }], explanation: "Sarcastic urgency — they desperately need help but express it through irony." },
    { text: "How kind of you to ignore our last three distress signals.", category: "Warning", tokens: [{ word: "kind", importance: 0.3 }, { word: "ignore", importance: 0.6 }, { word: "distress signals", importance: 0.9 }], explanation: "Sarcastic — expressing frustration about ignored warnings. The danger is real." },
    { text: "We come bearing gifts. Also, we've noticed your defense systems are... minimal.", category: "Threat", tokens: [{ word: "gifts", importance: 0.3 }, { word: "defense systems", importance: 0.8 }, { word: "minimal", importance: 0.7 }], explanation: "Seemingly friendly, but noting weak defenses is an implicit threat." },
    { text: "The stars shine brighter when old friends reunite, don't they?", category: "Greeting", tokens: [{ word: "stars shine", importance: 0.3 }, { word: "friends", importance: 0.7 }, { word: "reunite", importance: 0.8 }], explanation: "Poetic greeting — metaphorical language expressing joy at reunion." },
    { text: "I'm sure everything will be absolutely fine with the reactor.", category: "Warning", tokens: [{ word: "absolutely fine", importance: 0.5 }, { word: "reactor", importance: 0.8 }], explanation: "False reassurance about critical system = understated warning. Things are NOT fine." },
    { text: "No rush, but our hull integrity drops 2% every minute.", category: "Request", tokens: [{ word: "No rush", importance: 0.4 }, { word: "hull integrity", importance: 0.7 }, { word: "drops", importance: 0.6 }], explanation: "'No rush' contradicts the urgent data — sarcastic way of requesting immediate help." },
    { text: "We would never dream of taking your resources by force. Unless necessary.", category: "Threat", tokens: [{ word: "never dream", importance: 0.3 }, { word: "force", importance: 0.8 }, { word: "Unless", importance: 0.9 }], explanation: "'Unless necessary' reverses the denial — veiled threat of force." },
    { text: "Ah, the legendary Prometheus crew! Stories of your bravery precede you.", category: "Greeting", tokens: [{ word: "legendary", importance: 0.6 }, { word: "bravery", importance: 0.5 }, { word: "precede you", importance: 0.4 }], explanation: "Flattering greeting — admiration and reputation acknowledgment." },
    { text: "It would be a shame if something happened to this lovely space station.", category: "Threat", tokens: [{ word: "shame", importance: 0.5 }, { word: "something happened", importance: 0.9 }, { word: "lovely", importance: 0.2 }], explanation: "Classic veiled threat: 'It would be a shame if...' implies they will make it happen." },
    { text: "Just a routine check — your oxygen reserves seem unusually low today.", category: "Warning", tokens: [{ word: "routine", importance: 0.2 }, { word: "oxygen reserves", importance: 0.8 }, { word: "unusually low", importance: 0.9 }], explanation: "Downplaying ('routine') while flagging critical issue ('oxygen unusually low')." },
    { text: "We miss the days when our species traded freely. Those were good times.", category: "Greeting", tokens: [{ word: "miss", importance: 0.5 }, { word: "traded freely", importance: 0.4 }, { word: "good times", importance: 0.6 }], explanation: "Nostalgic reconnection — expressing a desire to restore relations." },
    { text: "Could someone possibly look at our failing engine? Whenever convenient, of course.", category: "Request", tokens: [{ word: "possibly", importance: 0.3 }, { word: "failing engine", importance: 0.8 }, { word: "convenient", importance: 0.4 }], explanation: "Extreme politeness masking urgency — the engine is FAILING." },
    { text: "Your crew has performed admirably. It would be wise to continue cooperating.", category: "Threat", tokens: [{ word: "admirably", importance: 0.3 }, { word: "wise", importance: 0.6 }, { word: "cooperating", importance: 0.8 }], explanation: "'It would be wise to...' is a veiled threat disguised as advice." },
    { text: "After millennia apart, we finally cross paths again. The universe works in mysterious ways.", category: "Greeting", tokens: [{ word: "millennia", importance: 0.3 }, { word: "cross paths", importance: 0.7 }, { word: "again", importance: 0.5 }], explanation: "Cosmic reunion — philosophical greeting about fate bringing them together." },
  ],
};

function getMessagesForLevel(level, count) {
  const pool = level === 1 ? MESSAGES.easy : level === 2 ? MESSAGES.medium : MESSAGES.hard;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/* ── Colors ─────────────────────────────────────────────────────── */

const CAT_COLORS = {
  Greeting: "#10b981",
  Warning: "#eab308",
  Request: "#8b5cf6",
  Threat: "#f43f5e",
};

/* ── Concept card helpers ──────────────────────────────────────── */

const LEVEL_CARDS = {
  1: ["tokenization", "sentiment_analysis"],
  2: ["context"],
  3: ["nlp"],
};

function getCardsForLevel(level) {
  const ids = LEVEL_CARDS[level] || [];
  return ids
    .map((id) => CONCEPT_CARDS.find((c) => c.id === id && c.mission === "commsarray"))
    .filter(Boolean);
}

/* ── Scan-line effect ──────────────────────────────────────────── */

function ScanLineOverlay() {
  return (
    <motion.div
      animate={{ top: ["-10%", "110%"] }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      style={{
        position: "absolute", left: 0, right: 0, height: "2px",
        background: "linear-gradient(90deg, transparent, rgba(236,72,153,0.6), transparent)",
        pointerEvents: "none", zIndex: 2,
      }}
    />
  );
}

/* ── Token analysis display ────────────────────────────────────── */

function TokenAnalysis({ message, isCorrect, t }) {
  const catColor = CAT_COLORS[message.category] || "#94a3b8";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        marginTop: "16px", padding: "16px",
        background: "rgba(236,72,153,0.06)",
        border: "1px solid rgba(236,72,153,0.2)",
        borderRadius: "12px",
      }}
    >
      <div style={{ fontSize: "0.65rem", color: "#64748b", letterSpacing: "0.15em", marginBottom: "10px" }}>
        {t("labs.decoder.tokenAnalysis")}
      </div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
        {message.tokens.map((t, i) => (
          <span key={i} style={{
            padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700,
            background: `${catColor}18`, border: `1px solid ${catColor}44`, color: catColor,
            boxShadow: `0 0 ${Math.round(t.importance * 12)}px ${catColor}33`,
          }}>
            {t.word} <span style={{ fontSize: "0.6rem", opacity: 0.7 }}>{Math.round(t.importance * 100)}%</span>
          </span>
        ))}
      </div>
      <div style={{ fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.5 }}>
        {message.explanation}
      </div>
    </motion.div>
  );
}

/* ── Star display ──────────────────────────────────────────────── */

function StarDisplay({ earned, total = 3 }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "8px", margin: "16px 0" }}>
      {Array.from({ length: total }, (_, i) => (
        <motion.span key={i}
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3 + i * 0.2, type: "spring", stiffness: 200 }}
          style={{
            fontSize: "2.5rem",
            color: i < earned ? "#fbbf24" : "#334155",
            filter: i < earned ? "drop-shadow(0 0 8px rgba(251,191,36,0.6))" : "none",
          }}
        >
          {i < earned ? "\u2605" : "\u2606"}
        </motion.span>
      ))}
    </div>
  );
}

/* ══════════════════════════ MAIN COMPONENT ══════════════════════ */

export default function MessageDecoder({ level = 1, onComplete }) {
  const { dispatch } = useGame();
  const { t } = useI18n();
  const { isMobile } = useViewport();
  const levelConfig = MISSIONS.commsarray.levels[level];
  const { messageCount, categories, starThresholds } = levelConfig;

  const [messages] = useState(() => getMessagesForLevel(level, messageCount));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState(null); // null | { correct, message }
  const [done, setDone] = useState(false);

  const [insights, setInsights] = useState([]);
  const insightCounter = useRef(0);
  const pushInsight = useCallback((msg) => {
    const id = `insight-${Date.now()}`;
    setInsights((prev) => [...prev, { id, message: msg }]);
  }, []);
  const dismissInsight = useCallback((id) => {
    setInsights((prev) => prev.filter((i) => i.id !== id));
  }, []);

  /* ── finish helper ── */
  const finishMission = useCallback(
    (finalScore) => {
      const accuracy = Math.round((finalScore / messageCount) * 100);
      const th = starThresholds;
      let stars = 0;
      if (accuracy >= th[3]) stars = 3;
      else if (accuracy >= th[2]) stars = 2;
      else if (accuracy >= th[1]) stars = 1;

      dispatch({ type: "SET_STARS", payload: { mission: "commsarray", level, stars } });
      dispatch({ type: "COMPLETE_LEVEL", payload: { mission: "commsarray", level } });
      dispatch({ type: "ADD_XP", payload: 30 + stars * 15 });

      getCardsForLevel(level).forEach((card) => {
        dispatch({
          type: "ADD_CODEX_CARD",
          payload: { id: card.id, title: card.title, description: card.description, realWorld: card.realWorld, rarity: card.rarity, icon: card.icon },
        });
      });

      dispatch({
        type: "SET_MISSION_RESULT",
        payload: { mission: "commsarray", result: { accuracy, bestStreak } },
      });

      setDone({ accuracy, stars, bestStreak });
    },
    [dispatch, level, messageCount, starThresholds, bestStreak],
  );

  /* ── classify handler ── */
  const handleClassify = useCallback(
    (choice) => {
      if (feedback || done) return;
      const msg = messages[index];
      const correct = msg.category === choice;

      let newScore = score;
      let newStreak = streak;
      let newBest = bestStreak;

      if (correct) {
        newScore = score + 1;
        newStreak = streak + 1;
        newBest = Math.max(bestStreak, newStreak);
        dispatch({ type: "ADD_XP", payload: 10 + streak * 3 });
        playSound("success");
        setScore(newScore);
        setStreak(newStreak);
        setBestStreak(newBest);
      } else {
        newStreak = 0;
        setStreak(0);
        playSound("error");
      }

      setFeedback({ correct, message: msg });

      // AriaInsight every 3rd message
      insightCounter.current += 1;
      if (insightCounter.current % 3 === 0) {
        pushInsight(t("labs.decoder.insight.tokenization"));
      }

      setTimeout(() => {
        setFeedback(null);
        if (index < messages.length - 1) {
          setIndex((i) => i + 1);
        } else {
          finishMission(newScore);
        }
      }, 2500);
    },
    [index, messages, score, streak, bestStreak, feedback, done, dispatch, finishMission, pushInsight],
  );

  /* ═══════════════════════ COMPLETION SCREEN ═══════════════════════ */

  if (done) {
    const { accuracy, stars, bestStreak: finalBestStreak } = done;
    const awardedCards = getCardsForLevel(level);

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: isMobile ? "24px 16px" : "48px", textAlign: "center" }}>
        <div style={{ fontSize: "4rem", marginBottom: "16px" }}>💬</div>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 900, marginBottom: "8px", color: "#f8fafc" }}>
          {t("labs.decoder.complete")}
        </h2>
        <div style={{ fontSize: "0.75rem", color: "#64748b", letterSpacing: "0.15em", marginBottom: "8px" }}>
          {t("common.level")} {level} — {levelConfig.name.toUpperCase()}
        </div>

        <StarDisplay earned={stars} />

        <div style={{ display: "flex", justifyContent: "center", gap: "32px", margin: "24px 0" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#ec4899" }}>{accuracy}%</div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", letterSpacing: "0.1em" }}>{t("common.accuracy")}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#8b5cf6" }}>{finalBestStreak}</div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", letterSpacing: "0.1em" }}>{t("common.bestStreak")}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#fbbf24" }}>{stars}/3</div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", letterSpacing: "0.1em" }}>{t("common.stars")}</div>
          </div>
        </div>

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
                  background: card.rarity === "rare" ? "rgba(139,92,246,0.12)" : "rgba(236,72,153,0.08)",
                  border: `1px solid ${card.rarity === "rare" ? "rgba(139,92,246,0.3)" : "rgba(236,72,153,0.2)"}`,
                  borderRadius: "10px", textAlign: "left",
                }}
              >
                <span style={{ fontSize: "1.5rem" }}>{card.icon}</span>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f8fafc" }}>{card.title}</div>
                  <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{card.rarity === "rare" ? t("common.rare") : t("common.common")}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <button
          onClick={() => onComplete({ stars, accuracy, streak: finalBestStreak })}
          style={{
            padding: "16px 48px", background: "#ec4899", border: "none",
            borderRadius: "8px", color: "white", fontSize: "1rem",
            fontWeight: 800, cursor: "pointer", letterSpacing: "0.1em",
          }}
        >
          {t("common.returnToStation")}
        </button>
      </motion.div>
    );
  }

  /* ═══════════════════════ GAMEPLAY SCREEN ═══════════════════════ */

  const msg = messages[index];

  return (
    <div style={{ padding: isMobile ? "16px" : "32px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "0.1em", color: "#f8fafc" }}>
            {t("labs.decoder.title")}
          </h3>
          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
            {t("common.level")} {level} — {levelConfig.name}
          </div>
        </div>
        <div style={{ display: "flex", gap: "24px", textAlign: "right" }}>
          <div>
            <div style={{ fontSize: "0.6rem", color: "#64748b", letterSpacing: "0.1em" }}>{t("labs.decoder.message")}</div>
            <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>{index + 1}/{messages.length}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.6rem", color: "#64748b", letterSpacing: "0.1em" }}>{t("labs.decoder.streak")}</div>
            <div style={{ fontWeight: 800, fontSize: "1.1rem", color: streak > 0 ? "#fbbf24" : "#64748b" }}>
              {streak > 0 ? `x${streak}` : "\u2014"}
            </div>
          </div>
        </div>
      </div>

      {/* Message card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          style={{
            position: "relative", overflow: "hidden",
            background: feedback
              ? feedback.correct ? "rgba(16,185,129,0.08)" : "rgba(244,63,94,0.08)"
              : "rgba(255,255,255,0.03)",
            border: `1px solid ${
              feedback ? (feedback.correct ? "#10b981" : "#f43f5e") : "rgba(255,255,255,0.08)"
            }`,
            borderRadius: "16px", padding: "32px", marginBottom: "24px",
          }}
        >
          {!feedback && <ScanLineOverlay />}

          <div style={{ fontSize: "0.6rem", color: "#64748b", letterSpacing: "0.2em", marginBottom: "16px" }}>
            {t("labs.decoder.incomingTransmission")}
          </div>
          <p style={{
            fontSize: "1.1rem", lineHeight: 1.7, color: "#e2e8f0",
            fontStyle: "italic", margin: 0,
          }}>
            "{msg.text}"
          </p>

          {feedback && (
            <div style={{
              marginTop: "16px", padding: "8px 16px", borderRadius: "8px",
              background: feedback.correct ? "rgba(16,185,129,0.15)" : "rgba(244,63,94,0.15)",
              fontSize: "0.85rem", fontWeight: 700,
              color: feedback.correct ? "#10b981" : "#f43f5e",
            }}>
              {feedback.correct ? t("common.correct") : t("labs.decoder.wrongWas", { category: msg.category })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Token analysis (shown after classification) */}
      <AnimatePresence>
        {feedback && <TokenAnalysis message={feedback.message} isCorrect={feedback.correct} t={t} />}
      </AnimatePresence>

      {/* Category buttons */}
      {!feedback && (
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : categories.length <= 3 ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
          gap: isMobile ? "8px" : "12px", marginBottom: "24px",
        }}>
          {categories.map((cat) => {
            const color = CAT_COLORS[cat] || "#94a3b8";
            return (
              <button key={cat} onClick={() => handleClassify(cat)}
                style={{
                  padding: "18px 12px", background: `${color}15`,
                  border: `2px solid ${color}`, borderRadius: "12px",
                  color, fontSize: "0.9rem", fontWeight: 800,
                  cursor: "pointer", letterSpacing: "0.1em",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = `${color}30`; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = `${color}15`; }}
              >
                {cat.toUpperCase()}
              </button>
            );
          })}
        </div>
      )}

      {/* ARIA hint */}
      {!feedback && (
        <div style={{
          padding: "16px", background: "rgba(236,72,153,0.08)",
          border: "1px solid rgba(236,72,153,0.2)",
          borderRadius: "10px", fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.5,
        }}>
          <strong style={{ color: "#f472b6" }}>{t("common.ariaHint")}</strong>{" "}
          {t(`labs.decoder.hint.${level}`)}
        </div>
      )}

      <AriaInsight insights={insights} onDismiss={dismissInsight} />
    </div>
  );
}
