import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useGame } from "../systems/GameState";
import { playSound } from "../systems/SoundManager";

const SIZE = 5;
const START = 0;
const GOAL = SIZE * SIZE - 1;

export default function AgentNavigator({ onComplete }) {
  const { dispatch } = useGame();
  const [grid, setGrid] = useState(Array(SIZE * SIZE).fill(0));
  const [botPos, setBotPos] = useState(START);
  const [running, setRunning] = useState(false);
  const [episodes, setEpisodes] = useState(0);
  const [totalReward, setTotalReward] = useState(0);
  const [path, setPath] = useState([START]);
  const [reachedGoal, setReachedGoal] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    dispatch({ type: "ADD_CONCEPT", payload: { title: "Reinforcement Learning", desc: "The AI learns by trial and error — getting rewards for good moves and penalties for bad ones." } });
  }, []);

  const toggleCell = (i) => {
    if (i === START || i === GOAL || running) return;
    setGrid(g => {
      const next = [...g];
      next[i] = next[i] === 0 ? 1 : next[i] === 1 ? -1 : 0;
      return next;
    });
  };

  const runEpisode = async () => {
    if (running) return;
    setRunning(true);
    setBotPos(START);
    let current = START;
    let currentPath = [START];
    let reward = 0;

    for (let step = 0; step < 20; step++) {
      await new Promise(r => setTimeout(r, 250));
      const row = Math.floor(current / SIZE);
      const col = current % SIZE;
      const moves = [];
      if (row > 0) moves.push(current - SIZE);
      if (row < SIZE - 1) moves.push(current + SIZE);
      if (col > 0) moves.push(current - 1);
      if (col < SIZE - 1) moves.push(current + 1);

      const best = moves.reduce((a, b) => (grid[b] > grid[a] ? b : a));
      const next = Math.random() > 0.75 ? moves[Math.floor(Math.random() * moves.length)] : best;

      current = next;
      currentPath.push(current);
      reward += grid[current];
      setBotPos(current);
      setPath([...currentPath]);

      if (current === GOAL) {
        reward += 10;
        dispatch({ type: "ADD_XP", payload: 30 });
        if (!reachedGoal && episodes === 0) {
          dispatch({ type: "ADD_ACHIEVEMENT", payload: "Pathfinder" });
        }
        setReachedGoal(true);
        dispatch({ type: "ADD_CONCEPT", payload: { title: "Reward Signal", desc: "The big reward at the goal teaches the AI which paths are worth repeating." } });
        playSound("success");
        break;
      }
      if (grid[current] === -1) {
        playSound("error");
        break;
      }
    }

    setTotalReward(r => r + reward);
    setEpisodes(e => e + 1);
    dispatch({ type: "ADD_XP", payload: 5 });
    setRunning(false);
  };

  const handleFinish = () => {
    dispatch({ type: "HEAL_ARIA", payload: 25 });
    dispatch({ type: "ADD_CONCEPT", payload: { title: "Policy", desc: "The agent's strategy for choosing actions. Through many episodes, it learns the optimal policy." } });
    dispatch({ type: "SET_MISSION_RESULT", payload: { mission: "simdeck", result: { episodes, totalReward, reachedGoal } } });
    setDone(true);
  };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ padding: "48px", textAlign: "center" }}
      >
        <div style={{ fontSize: "4rem", marginBottom: "16px" }}>🚀</div>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#f8fafc", marginBottom: "8px" }}>
          NAVIGATION TRAINING COMPLETE
        </h2>
        <div style={{ display: "flex", justifyContent: "center", gap: "32px", margin: "32px 0" }}>
          <div>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#f97316" }}>{episodes}</div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>EPISODES</div>
          </div>
          <div>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#10b981" }}>{totalReward.toFixed(0)}</div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>TOTAL REWARD</div>
          </div>
        </div>
        <button onClick={onComplete}
          style={{ padding: "16px 48px", background: "#f97316", border: "none", borderRadius: "8px", color: "white", fontSize: "1rem", fontWeight: 800, cursor: "pointer" }}
        >
          RETURN TO STATION
        </button>
      </motion.div>
    );
  }

  return (
    <div style={{ padding: "32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "0.1em" }}>ASTEROID FIELD</h3>
          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Place fuel cells and asteroids, then deploy ARIA</div>
        </div>
        <div style={{ display: "flex", gap: "24px", textAlign: "right" }}>
          <div>
            <div style={{ fontSize: "0.6rem", color: "#64748b" }}>EPISODES</div>
            <div style={{ fontWeight: 800, color: "#f97316" }}>{episodes}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.6rem", color: "#64748b" }}>REWARD</div>
            <div style={{ fontWeight: 800 }}>{totalReward.toFixed(0)}</div>
          </div>
        </div>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
        gap: "8px", marginBottom: "24px",
        background: "rgba(0,0,0,0.3)", borderRadius: "16px", padding: "16px",
      }}>
        {grid.map((val, i) => (
          <motion.div key={i} onClick={() => toggleCell(i)}
            whileHover={!running ? { scale: 0.95 } : {}}
            style={{
              aspectRatio: "1", borderRadius: "10px",
              background: val === 1 ? "rgba(16,185,129,0.15)" : val === -1 ? "rgba(244,63,94,0.15)" : "rgba(255,255,255,0.03)",
              border: `2px solid ${val === 1 ? "#10b981" : val === -1 ? "#f43f5e" : "rgba(255,255,255,0.06)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: running || i === START || i === GOAL ? "default" : "pointer",
              position: "relative", fontSize: "1.5rem",
            }}
          >
            {i === START && botPos !== i && <span style={{ fontSize: "0.6rem", color: "#64748b" }}>START</span>}
            {i === GOAL && <span>⭐</span>}
            {botPos === i && (
              <motion.span layoutId="ship" transition={{ type: "spring", damping: 15 }}>🚀</motion.span>
            )}
            {val === 1 && botPos !== i && i !== GOAL && <span>⛽</span>}
            {val === -1 && botPos !== i && <span>☄️</span>}
            {path.includes(i) && botPos !== i && i !== START && i !== GOAL && val === 0 && (
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f9731644" }} />
            )}
          </motion.div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <button onClick={runEpisode} disabled={running}
          style={{
            flex: 1, padding: "16px", background: running ? "rgba(255,255,255,0.05)" : "#f97316",
            border: "none", borderRadius: "10px", color: "white", fontWeight: 800, cursor: running ? "wait" : "pointer",
            fontSize: "0.9rem", letterSpacing: "0.1em",
          }}
        >
          {running ? "SIMULATING..." : "DEPLOY EPISODE"}
        </button>
        {episodes >= 3 && (
          <button onClick={handleFinish}
            style={{ padding: "16px 24px", background: "#10b981", border: "none", borderRadius: "10px", color: "white", fontWeight: 800, cursor: "pointer", fontSize: "0.9rem" }}
          >
            COMPLETE
          </button>
        )}
      </div>

      <div style={{
        display: "flex", gap: "20px", fontSize: "0.75rem", color: "#94a3b8",
        padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px",
      }}>
        <span>Click tiles: Empty → ⛽ Fuel (+1) → ☄️ Asteroid (-1) → Empty</span>
      </div>
    </div>
  );
}
