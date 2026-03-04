import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../systems/GameState";
import { playSound } from "../systems/SoundManager";
import { MISSIONS, CONCEPT_CARDS } from "../systems/MissionConfig";
import AriaInsight from "../ui/AriaInsight";
import { useI18n } from "../systems/I18nContext";

/* -- Pre-placed grid for L1 Tutorial -------------------------------- */
function generatePrePlacedGrid(size) {
  const grid = Array(size * size).fill(0);
  const fuelPositions = [1, 5, 6, 10, 14];
  const asteroidPositions = [3, 12];
  fuelPositions.forEach((p) => {
    if (p > 0 && p < size * size - 1) grid[p] = 1;
  });
  asteroidPositions.forEach((p) => {
    if (p > 0 && p < size * size - 1) grid[p] = -1;
  });
  return grid;
}

/* -- Moving obstacles logic for L3 ---------------------------------- */
function shiftObstacles(grid, size) {
  const goal = size * size - 1;
  const next = [...grid];
  const asteroids = [];
  next.forEach((val, i) => {
    if (val === -1) asteroids.push(i);
  });

  for (const pos of asteroids) {
    const row = Math.floor(pos / size);
    const col = pos % size;
    const candidates = [];
    if (row > 0) candidates.push(pos - size);
    if (row < size - 1) candidates.push(pos + size);
    if (col > 0) candidates.push(pos - 1);
    if (col < size - 1) candidates.push(pos + 1);

    const valid = candidates.filter(
      (c) => c !== 0 && c !== goal && next[c] === 0
    );
    if (valid.length === 0) continue;

    const dest = valid[Math.floor(Math.random() * valid.length)];
    next[pos] = 0;
    next[dest] = -1;
  }
  return next;
}

/* -- Concept card helpers ------------------------------------------- */
const LEVEL_CARDS = {
  1: ["reinforcement_learning", "reward_signal"],
  2: ["exploration_exploitation"],
  3: ["policy"],
};

function getConceptCardsForLevel(level) {
  const ids = LEVEL_CARDS[level] || [];
  return ids
    .map((id) => CONCEPT_CARDS.find((c) => c.id === id && c.mission === "simdeck"))
    .filter(Boolean);
}

/* ═══════════════════════════════════════════════════════════════════════════ */

export default function AgentNavigator({ level = 1, onComplete }) {
  const { dispatch } = useGame();
  const { t } = useI18n();

  const levelConfig = MISSIONS.simdeck.levels[level];
  const SIZE = levelConfig.gridSize;
  const START = 0;
  const GOAL = SIZE * SIZE - 1;

  const [grid, setGrid] = useState(() =>
    levelConfig.prePlaced ? generatePrePlacedGrid(SIZE) : Array(SIZE * SIZE).fill(0)
  );
  const [botPos, setBotPos] = useState(START);
  const [running, setRunning] = useState(false);
  const [episodes, setEpisodes] = useState(0);
  const [totalReward, setTotalReward] = useState(0);
  const [path, setPath] = useState([START]);
  const [goalReaches, setGoalReaches] = useState(0);
  const [done, setDone] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const [pathHistory, setPathHistory] = useState([]);
  const [explorationRate, setExplorationRate] = useState(0.75);

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

  const awardedCards = useRef(new Set());

  useEffect(() => {
    const cards = getConceptCardsForLevel(level);
    cards.forEach((card) => {
      if (!awardedCards.current.has(card.id)) {
        awardedCards.current.add(card.id);
        dispatch({
          type: "ADD_CODEX_CARD",
          payload: { id: card.id, title: card.title, description: card.description, realWorld: card.realWorld, rarity: card.rarity, icon: card.icon },
        });
      }
    });
  }, [level, dispatch]);

  const toggleCell = useCallback((i) => {
    if (levelConfig.prePlaced) return;
    if (i === START || i === GOAL || running) return;
    setGrid((g) => {
      const next = [...g];
      next[i] = next[i] === 0 ? 1 : next[i] === 1 ? -1 : 0;
      return next;
    });
  }, [running, levelConfig.prePlaced, START, GOAL]);

  const runEpisode = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setBotPos(START);
    let current = START;
    let currentPath = [START];
    let reward = 0;
    let reachedGoalThisEpisode = false;

    const maxSteps = SIZE * SIZE * 2;
    const stepDelay = SIZE <= 4 ? 300 : SIZE <= 5 ? 250 : 180;

    for (let step = 0; step < maxSteps; step++) {
      await new Promise((r) => setTimeout(r, stepDelay));
      const row = Math.floor(current / SIZE);
      const col = current % SIZE;
      const moves = [];
      if (row > 0) moves.push(current - SIZE);
      if (row < SIZE - 1) moves.push(current + SIZE);
      if (col > 0) moves.push(current - 1);
      if (col < SIZE - 1) moves.push(current + 1);

      const rate = Math.max(0.1, 0.75 - episodes * 0.08);
      const best = moves.reduce((a, b) => {
        const scoreA = grid[a] + (a === GOAL ? 10 : 0);
        const scoreB = grid[b] + (b === GOAL ? 10 : 0);
        return scoreB > scoreA ? b : a;
      });
      const next = Math.random() < rate
        ? moves[Math.floor(Math.random() * moves.length)]
        : best;

      current = next;
      currentPath.push(current);
      reward += grid[current];
      setBotPos(current);
      setPath([...currentPath]);

      if (current === GOAL) {
        reward += 10;
        reachedGoalThisEpisode = true;
        dispatch({ type: "ADD_XP", payload: 30 });
        playSound("success");
        break;
      }
      if (grid[current] === -1) {
        playSound("error");
        break;
      }
    }

    setPathHistory((prev) => [...prev, currentPath]);
    if (reachedGoalThisEpisode) {
      setGoalReaches((g) => g + 1);
    }
    setTotalReward((r) => r + reward);
    setEpisodes((e) => e + 1);
    setExplorationRate(Math.max(0.1, 0.75 - (episodes + 1) * 0.08));
    dispatch({ type: "ADD_XP", payload: 5 });

    // AriaInsight triggers
    if (reachedGoalThisEpisode) {
      pushOnce("firstgoal", t("labs.navigator.insight.firstGoal"));
    }
    if (!reachedGoalThisEpisode && reward < 0) {
      pushOnce("asteroid", t("labs.navigator.insight.asteroid"));
    }
    const nextRate = Math.max(0.1, 0.75 - (episodes + 1) * 0.08);
    if (nextRate < 0.3) {
      pushOnce("lowexplore", t("labs.navigator.insight.lowExplore"));
    }

    if (levelConfig.movingObstacles) {
      setGrid((g) => shiftObstacles(g, SIZE));
    }

    setRunning(false);
  }, [running, grid, episodes, SIZE, START, GOAL, dispatch, levelConfig.movingObstacles, pushOnce]);

  const calculateStars = useCallback(() => {
    const thresholds = levelConfig.starThresholds;
    if (totalReward >= thresholds[3]) return 3;
    if (totalReward >= thresholds[2]) return 2;
    if (totalReward >= thresholds[1]) return 1;
    return 0;
  }, [totalReward, levelConfig.starThresholds]);

  const canComplete = useCallback(() => {
    if (episodes < levelConfig.minEpisodes) return false;
    if (level === 3 && goalReaches < 3) return false;
    return true;
  }, [episodes, level, goalReaches, levelConfig.minEpisodes]);

  const handleFinish = useCallback(() => {
    const stars = calculateStars();
    setEarnedStars(stars);

    dispatch({ type: "SET_STARS", payload: { mission: "simdeck", level, stars } });
    dispatch({ type: "COMPLETE_LEVEL", payload: { mission: "simdeck", level } });
    dispatch({ type: "HEAL_ARIA", payload: 25 });
    dispatch({ type: "ADD_XP", payload: 10 });
    dispatch({
      type: "SET_MISSION_RESULT",
      payload: { mission: "simdeck", result: { level, episodes, totalReward, goalReaches } },
    });

    playSound("success");
    setDone(true);
  }, [calculateStars, dispatch, level, episodes, totalReward, goalReaches]);

  const handleReturn = useCallback(() => {
    if (onComplete) {
      onComplete({ stars: earnedStars, episodes, totalReward, goalReaches });
    }
  }, [onComplete, earnedStars, episodes, totalReward, goalReaches]);

  const getCellPathInfo = useCallback((cellIndex) => {
    const inCurrentPath = path.includes(cellIndex);
    const historicalHits = [];
    pathHistory.forEach((ep, epIdx) => {
      if (ep.includes(cellIndex)) historicalHits.push(epIdx);
    });
    return { inCurrentPath, historicalHits };
  }, [path, pathHistory]);

  const cellBorderRadius = SIZE <= 4 ? "12px" : SIZE <= 5 ? "10px" : "8px";
  const cellFontSize = SIZE <= 4 ? "1.6rem" : SIZE <= 5 ? "1.4rem" : "1.1rem";
  const gridGap = SIZE <= 5 ? "8px" : "5px";
  const gridPadding = SIZE <= 5 ? "16px" : "12px";

  /* ═══════════════════════════ COMPLETION SCREEN ═══════════════════════════════ */

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ padding: "48px", textAlign: "center" }}
      >
        <div style={{ fontSize: "4rem", marginBottom: "16px" }}>🚀</div>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#f8fafc", marginBottom: "8px" }}>
          {t("labs.navigator.completeTitle")}
        </h2>
        <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "24px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          {t("common.level")} {level} — {levelConfig.name}
        </div>

        <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "24px" }}>
          {[1, 2, 3].map((s) => (
            <motion.span key={s}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: s * 0.2, type: "spring", stiffness: 200 }}
              style={{
                fontSize: "2.5rem",
                color: s <= earnedStars ? "#fbbf24" : "#334155",
                filter: s <= earnedStars ? "drop-shadow(0 0 8px rgba(251,191,36,0.6))" : "none",
              }}
            >
              {s <= earnedStars ? "\u2605" : "\u2606"}
            </motion.span>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "32px", margin: "32px 0" }}>
          <div>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#f97316" }}>{episodes}</div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{t("labs.navigator.episodes")}</div>
          </div>
          <div>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#10b981" }}>{totalReward.toFixed(0)}</div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{t("labs.navigator.totalReward")}</div>
          </div>
          {level === 3 && (
            <div>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "#8b5cf6" }}>{goalReaches}</div>
              <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{t("labs.navigator.goalReaches")}</div>
            </div>
          )}
        </div>

        {getConceptCardsForLevel(level).length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "0.7rem", color: "#64748b", marginBottom: "8px", letterSpacing: "0.1em" }}>
              {t("common.codexCardsEarned")}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
              {getConceptCardsForLevel(level).map((card) => (
                <motion.div key={card.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    padding: "8px 16px",
                    background: card.rarity === "rare" ? "rgba(139,92,246,0.15)" : "rgba(249,115,22,0.1)",
                    border: `1px solid ${card.rarity === "rare" ? "rgba(139,92,246,0.3)" : "rgba(249,115,22,0.2)"}`,
                    borderRadius: "8px", fontSize: "0.8rem",
                    color: card.rarity === "rare" ? "#a78bfa" : "#fb923c",
                  }}
                >
                  <span style={{ marginRight: "6px" }}>{card.icon}</span>
                  {card.title}
                  {card.rarity === "rare" && (
                    <span style={{ marginLeft: "8px", fontSize: "0.6rem", color: "#a78bfa", fontWeight: 700 }}>{t("common.rare")}</span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <button onClick={handleReturn}
          style={{
            padding: "16px 48px", background: "#f97316", border: "none",
            borderRadius: "8px", color: "white", fontSize: "1rem",
            fontWeight: 800, cursor: "pointer", letterSpacing: "0.05em",
          }}
        >
          {t("common.returnToStation")}
        </button>
      </motion.div>
    );
  }

  /* ═══════════════════════════ GAMEPLAY SCREEN ═══════════════════════════════ */

  return (
    <div style={{ padding: "32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "0.1em", margin: 0 }}>
            {t("labs.navigator.title")}
          </h3>
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "4px" }}>
            {levelConfig.prePlaced
              ? t("labs.navigator.instructionPrePlaced")
              : t("labs.navigator.instructionPlace")}
          </div>
          <div style={{ fontSize: "0.65rem", color: "#475569", marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {t("common.level")} {level} — {levelConfig.name} — {SIZE}x{SIZE} grid
          </div>
        </div>
        <div style={{ display: "flex", gap: "24px", textAlign: "right" }}>
          <div>
            <div style={{ fontSize: "0.6rem", color: "#64748b" }}>{t("labs.navigator.episodes")}</div>
            <div style={{ fontWeight: 800, color: "#f97316" }}>
              {episodes}<span style={{ color: "#475569", fontWeight: 400 }}>/{levelConfig.minEpisodes}</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.6rem", color: "#64748b" }}>{t("labs.navigator.reward")}</div>
            <div style={{ fontWeight: 800 }}>{totalReward.toFixed(0)}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.6rem", color: "#64748b" }}>{t("labs.navigator.exploreRate")}</div>
            <div style={{ fontWeight: 800, color: explorationRate > 0.4 ? "#f97316" : "#10b981" }}>
              {Math.round(explorationRate * 100)}%
            </div>
          </div>
          {level === 3 && (
            <div>
              <div style={{ fontSize: "0.6rem", color: "#64748b" }}>{t("labs.navigator.goalReached")}</div>
              <div style={{ fontWeight: 800, color: goalReaches >= 3 ? "#10b981" : "#8b5cf6" }}>
                {goalReaches}/3
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
        gap: gridGap, marginBottom: "24px",
        background: "rgba(0,0,0,0.3)", borderRadius: "16px", padding: gridPadding,
      }}>
        {grid.map((val, i) => {
          const { inCurrentPath, historicalHits } = getCellPathInfo(i);
          const isStart = i === START;
          const isGoal = i === GOAL;
          const isBotHere = botPos === i;
          const showFuel = val === 1 && !isBotHere && !isGoal;
          const showAsteroid = val === -1 && !isBotHere;
          const isReadOnly = levelConfig.prePlaced || running || isStart || isGoal;

          const showHistoryDot = !isBotHere && !isStart && !isGoal && val === 0 && !inCurrentPath && historicalHits.length > 0;
          const showCurrentDot = inCurrentPath && !isBotHere && !isStart && !isGoal && val === 0;
          const historyOpacity = showHistoryDot ? Math.min(0.5, 0.1 + historicalHits.length * 0.06) : 0;

          return (
            <motion.div key={i} onClick={() => toggleCell(i)}
              whileHover={!isReadOnly ? { scale: 0.95 } : {}}
              style={{
                aspectRatio: "1", borderRadius: cellBorderRadius,
                background: val === 1 ? "rgba(16,185,129,0.15)" : val === -1 ? "rgba(244,63,94,0.15)" : "rgba(255,255,255,0.03)",
                border: `2px solid ${val === 1 ? "#10b981" : val === -1 ? "#f43f5e" : "rgba(255,255,255,0.06)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: isReadOnly ? "default" : "pointer",
                position: "relative", fontSize: cellFontSize,
              }}
            >
              {isStart && !isBotHere && <span style={{ fontSize: "0.6rem", color: "#64748b" }}>{t("labs.navigator.start")}</span>}
              {isGoal && <span>⭐</span>}
              {isBotHere && (
                <motion.span layoutId="ship" transition={{ type: "spring", damping: 15 }}>🚀</motion.span>
              )}
              {showFuel && <span>⛽</span>}
              {showAsteroid && <span>☄️</span>}

              {showHistoryDot && (
                <div style={{
                  width: "5px", height: "5px", borderRadius: "50%",
                  background: `rgba(249,115,22,${historyOpacity})`, position: "absolute",
                }} />
              )}
              {showCurrentDot && (
                <div style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: "rgba(249,115,22,0.7)", boxShadow: "0 0 6px rgba(249,115,22,0.4)",
                  position: "absolute",
                }} />
              )}
            </motion.div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <button onClick={runEpisode} disabled={running}
          style={{
            flex: 1, padding: "16px",
            background: running ? "rgba(255,255,255,0.05)" : "#f97316",
            border: "none", borderRadius: "10px", color: "white",
            fontWeight: 800, cursor: running ? "wait" : "pointer",
            fontSize: "0.9rem", letterSpacing: "0.1em",
          }}
        >
          {running ? t("labs.navigator.simulating") : t("labs.navigator.deployEpisode")}
        </button>

        <AnimatePresence>
          {canComplete() && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={handleFinish}
              style={{
                padding: "16px 24px", background: "#10b981",
                border: "none", borderRadius: "10px", color: "white",
                fontWeight: 800, cursor: "pointer", fontSize: "0.9rem",
                letterSpacing: "0.05em",
              }}
            >
              {t("labs.navigator.complete")}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {levelConfig.movingObstacles && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{
            padding: "10px 16px", background: "rgba(139,92,246,0.08)",
            border: "1px solid rgba(139,92,246,0.2)", borderRadius: "10px",
            fontSize: "0.75rem", color: "#a78bfa", marginBottom: "16px",
            display: "flex", alignItems: "center", gap: "8px",
          }}
        >
          <span style={{ fontSize: "1rem" }}>⚠️</span>
          <span><strong>{t("labs.navigator.nonStationary")}</strong> {t("labs.navigator.nonStationaryDesc")}</span>
        </motion.div>
      )}

      <div style={{
        padding: "16px", background: "rgba(249,115,22,0.08)",
        border: "1px solid rgba(249,115,22,0.2)", borderRadius: "10px",
        fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.6,
      }}>
        <strong style={{ color: "#fb923c" }}>{t("labs.navigator.howItWorks")}</strong>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "8px" }}>
          <span>{t("labs.navigator.legend.ariaStart")}</span>
          <span>{t("labs.navigator.legend.goal")}</span>
          <span>{t("labs.navigator.legend.fuel")}</span>
          <span>{t("labs.navigator.legend.asteroid")}</span>
        </div>
        <div style={{ marginTop: "8px", color: "#64748b" }}>
          {levelConfig.prePlaced
            ? t("labs.navigator.instructionPrePlacedLong", { min: levelConfig.minEpisodes })
            : t("labs.navigator.instructionPlaceLong")}
          {level === 3 && ` ${t("labs.navigator.l3GoalNote")}`}
        </div>
      </div>

      <AriaInsight insights={insights} onDismiss={dismissInsight} />

      {episodes > 0 && !canComplete() && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: "16px", padding: "12px 16px",
            background: "rgba(255,255,255,0.03)", borderRadius: "10px",
            fontSize: "0.75rem", color: "#64748b", textAlign: "center",
          }}
        >
          {episodes < levelConfig.minEpisodes && (
            <span>{t("labs.navigator.moreEpisodes", { count: levelConfig.minEpisodes - episodes })}</span>
          )}
          {episodes >= levelConfig.minEpisodes && level === 3 && goalReaches < 3 && (
            <span>{t("labs.navigator.moreGoals", { count: 3 - goalReaches })}</span>
          )}
        </motion.div>
      )}
    </div>
  );
}
