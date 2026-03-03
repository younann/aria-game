# Neural Quest RPG Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the Neural Quest educational app into a full 2D PixiJS-powered RPG where kids 10-15 play as Cadet Nova repairing an AI companion (ARIA) aboard a space station.

**Architecture:** Dual-layer rendering — PixiJS canvas for the game world (station hub, sprites, particles) with React overlaid for UI (dialogue, HUD, interactive labs). Shared game state via React context. useState-based scene management.

**Tech Stack:** React 19, Vite 7, PixiJS 8, Howler.js, Framer Motion

---

## Phase 1: Foundation (Tasks 1-4)

### Task 1: Install dependencies and scaffold file structure

**Files:**
- Modify: `package.json`
- Create: `src/engine/GameCanvas.jsx`
- Create: `src/systems/GameState.jsx`
- Create: `src/systems/SoundManager.js`

**Step 1: Install PixiJS and Howler.js**

Run: `npm install pixi.js howler`
Expected: Both packages added to package.json dependencies

**Step 2: Create directory structure**

Run:
```bash
mkdir -p src/engine src/characters src/scenes src/ui src/systems src/labs src/assets/sprites src/assets/audio
```

**Step 3: Create GameState context**

Create `src/systems/GameState.jsx`:
```jsx
import React, { createContext, useContext, useReducer } from "react";

const initialState = {
  scene: "bridge",       // current scene
  xp: 0,
  rank: "Cadet Recruit",
  ariaHealth: 0,         // 0-100
  unlockedRooms: ["bridge"],
  achievements: [],
  discoveredConcepts: [],
  dialogueQueue: [],
  missionResults: {},
};

const RANKS = [
  { name: "Cadet Recruit", xp: 0 },
  { name: "Signal Operator", xp: 100 },
  { name: "Neural Technician", xp: 300 },
  { name: "Simulation Pilot", xp: 600 },
  { name: "AI Commander", xp: 1000 },
  { name: "Prometheus Legend", xp: 1500 },
];

function getRank(xp) {
  let rank = RANKS[0].name;
  for (const r of RANKS) {
    if (xp >= r.xp) rank = r.name;
  }
  return rank;
}

function gameReducer(state, action) {
  switch (action.type) {
    case "SET_SCENE":
      return { ...state, scene: action.payload };
    case "ADD_XP": {
      const newXp = state.xp + action.payload;
      return { ...state, xp: newXp, rank: getRank(newXp) };
    }
    case "HEAL_ARIA":
      return { ...state, ariaHealth: Math.min(100, state.ariaHealth + action.payload) };
    case "UNLOCK_ROOM":
      if (state.unlockedRooms.includes(action.payload)) return state;
      return { ...state, unlockedRooms: [...state.unlockedRooms, action.payload] };
    case "ADD_ACHIEVEMENT":
      if (state.achievements.includes(action.payload)) return state;
      return { ...state, achievements: [...state.achievements, action.payload] };
    case "ADD_CONCEPT":
      if (state.discoveredConcepts.find(c => c.title === action.payload.title)) return state;
      return { ...state, discoveredConcepts: [...state.discoveredConcepts, action.payload] };
    case "SET_MISSION_RESULT":
      return { ...state, missionResults: { ...state.missionResults, [action.payload.mission]: action.payload.result } };
    default:
      return state;
  }
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}

export { RANKS };
```

**Step 4: Create SoundManager**

Create `src/systems/SoundManager.js`:
```js
import { Howl } from "howler";

const sounds = {};

export function registerSound(name, src, options = {}) {
  sounds[name] = new Howl({ src: [src], volume: 0.5, ...options });
}

export function playSound(name) {
  if (sounds[name]) sounds[name].play();
}

export function stopSound(name) {
  if (sounds[name]) sounds[name].stop();
}

export function setVolume(name, vol) {
  if (sounds[name]) sounds[name].volume(vol);
}
```

**Step 5: Create GameCanvas wrapper**

Create `src/engine/GameCanvas.jsx`:
```jsx
import React, { useRef, useEffect } from "react";
import { Application } from "pixi.js";

export default function GameCanvas({ onAppReady, width = 960, height = 640 }) {
  const canvasRef = useRef(null);
  const appRef = useRef(null);

  useEffect(() => {
    const app = new Application();
    const init = async () => {
      await app.init({
        width,
        height,
        backgroundColor: 0x050510,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });
      canvasRef.current.appendChild(app.canvas);
      appRef.current = app;
      if (onAppReady) onAppReady(app);
    };
    init();

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={canvasRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: "16px",
        overflow: "hidden",
        position: "relative",
      }}
    />
  );
}
```

**Step 6: Verify it builds**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 7: Commit**

```bash
git init
git add -A
git commit -m "feat: scaffold project structure, add PixiJS + Howler, game state, canvas wrapper"
```

---

### Task 2: Build the HUD overlay

**Files:**
- Create: `src/ui/HUD.jsx`
- Create: `src/ui/AchievementPopup.jsx`

**Step 1: Create HUD component**

Create `src/ui/HUD.jsx`:
```jsx
import React from "react";
import { motion } from "framer-motion";
import { useGame, RANKS } from "../systems/GameState";

export default function HUD() {
  const { state } = useGame();
  const currentRankIndex = RANKS.findIndex(r => r.name === state.rank);
  const nextRank = RANKS[currentRankIndex + 1];
  const prevXp = RANKS[currentRankIndex]?.xp || 0;
  const nextXp = nextRank?.xp || state.xp;
  const progress = nextRank ? (state.xp - prevXp) / (nextXp - prevXp) : 1;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0,
      padding: "12px 24px",
      display: "flex", alignItems: "center", gap: "24px",
      background: "linear-gradient(180deg, rgba(5,5,16,0.95) 0%, transparent 100%)",
      zIndex: 100, pointerEvents: "none",
    }}>
      {/* Rank Badge */}
      <div style={{
        background: "rgba(139,92,246,0.2)",
        border: "2px solid #8b5cf6",
        borderRadius: "8px",
        padding: "6px 16px",
        fontSize: "0.75rem",
        fontWeight: 800,
        letterSpacing: "0.15em",
        color: "#c4b5fd",
        textTransform: "uppercase",
        pointerEvents: "auto",
      }}>
        {state.rank}
      </div>

      {/* XP Bar */}
      <div style={{ flex: 1, maxWidth: "300px" }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          fontSize: "0.65rem", color: "#94a3b8", marginBottom: "4px",
        }}>
          <span>XP</span>
          <span>{state.xp} {nextRank ? `/ ${nextXp}` : "(MAX)"}</span>
        </div>
        <div style={{
          height: "8px", background: "rgba(255,255,255,0.08)",
          borderRadius: "4px", overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <motion.div
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: "spring", damping: 20 }}
            style={{
              height: "100%",
              background: "linear-gradient(90deg, #8b5cf6, #06b6d4)",
              borderRadius: "4px",
            }}
          />
        </div>
      </div>

      {/* ARIA Health */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "0.65rem", color: "#94a3b8", letterSpacing: "0.1em" }}>
          ARIA
        </span>
        <div style={{
          width: "120px", height: "8px",
          background: "rgba(255,255,255,0.08)",
          borderRadius: "4px", overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <motion.div
            animate={{ width: `${state.ariaHealth}%` }}
            transition={{ type: "spring", damping: 20 }}
            style={{
              height: "100%",
              background: state.ariaHealth > 50
                ? "linear-gradient(90deg, #10b981, #34d399)"
                : "linear-gradient(90deg, #f43f5e, #fb923c)",
              borderRadius: "4px",
            }}
          />
        </div>
        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#e2e8f0" }}>
          {state.ariaHealth}%
        </span>
      </div>

      {/* Achievements count */}
      <div style={{
        fontSize: "0.7rem", color: "#fbbf24",
        fontWeight: 700, letterSpacing: "0.1em",
        pointerEvents: "auto",
      }}>
        {state.achievements.length} BADGES
      </div>
    </div>
  );
}
```

**Step 2: Create AchievementPopup**

Create `src/ui/AchievementPopup.jsx`:
```jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AchievementPopup({ achievement, onDone }) {
  if (!achievement) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        onAnimationComplete={() => setTimeout(onDone, 2000)}
        style={{
          position: "fixed", top: "80px", left: "50%", transform: "translateX(-50%)",
          background: "linear-gradient(135deg, rgba(251,191,36,0.15), rgba(139,92,246,0.15))",
          border: "2px solid #fbbf24",
          borderRadius: "12px",
          padding: "16px 32px",
          zIndex: 200,
          display: "flex", alignItems: "center", gap: "16px",
          boxShadow: "0 0 40px rgba(251,191,36,0.2)",
        }}
      >
        <span style={{ fontSize: "2rem" }}>&#127942;</span>
        <div>
          <div style={{ fontSize: "0.65rem", color: "#fbbf24", fontWeight: 700, letterSpacing: "0.2em", marginBottom: "4px" }}>
            ACHIEVEMENT UNLOCKED
          </div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "#f8fafc" }}>
            {achievement}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
```

**Step 3: Verify build**

Run: `npm run build`
Expected: PASS

**Step 4: Commit**

```bash
git add src/ui/HUD.jsx src/ui/AchievementPopup.jsx
git commit -m "feat: add HUD overlay with XP bar, rank, ARIA health, achievement popup"
```

---

### Task 3: Build the Dialogue System

**Files:**
- Create: `src/ui/DialogueBox.jsx`
- Create: `src/systems/DialogueData.js`

**Step 1: Create DialogueData**

Create `src/systems/DialogueData.js`:
```js
export const DIALOGUES = {
  bridge_intro: [
    { speaker: "Commander", portrait: "commander", text: "Cadet Nova, welcome aboard the ISS Prometheus. I wish we were meeting under better circumstances." },
    { speaker: "Commander", portrait: "commander", text: "A cosmic storm has damaged our onboard AI, ARIA. Without her, the station's systems are failing." },
    { speaker: "Commander", portrait: "commander", text: "Your mission: repair ARIA module by module. You'll need to understand how she thinks to fix her." },
    {
      speaker: "Commander", portrait: "commander",
      text: "Ready to begin, Cadet?",
      choices: [
        { label: "Yes, Commander!", next: "bridge_ready" },
        { label: "What happened to ARIA?", next: "bridge_lore" },
      ],
    },
  ],
  bridge_ready: [
    { speaker: "Commander", portrait: "commander", text: "Good. Head to the Data Vault first. ARIA's memory banks need recalibration." },
    { speaker: "ARIA", portrait: "aria_glitch", text: "H-h-hello... C-Cadet... I can... barely... process..." },
    { speaker: "Commander", portrait: "commander", text: "That's ARIA trying to reach you. Help her, Cadet." },
  ],
  bridge_lore: [
    { speaker: "Commander", portrait: "commander", text: "ARIA was our most advanced Adaptive Research Intelligence Agent. She ran everything — navigation, life support, research." },
    { speaker: "Commander", portrait: "commander", text: "The storm scrambled her neural pathways. We need someone who can learn how AI works to piece her back together." },
    { speaker: "Commander", portrait: "commander", text: "That someone is you. Head to the Data Vault to begin." },
  ],
  datavault_intro: [
    { speaker: "ARIA", portrait: "aria_glitch", text: "C-Cadet... my memory... is fragmented... I can't tell... friend from foe..." },
    { speaker: "ARIA", portrait: "aria_glitch", text: "Incoming signals... I need you to... classify them for me... so I can... relearn..." },
    { speaker: "System", portrait: null, text: "MISSION: Classify incoming alien signals as FRIENDLY or HOSTILE to restore ARIA's pattern recognition." },
  ],
  datavault_complete: [
    { speaker: "ARIA", portrait: "aria_25", text: "I can... see patterns now. Thank you, Cadet. My memory banks are stabilizing." },
    { speaker: "ARIA", portrait: "aria_25", text: "You taught me something called 'Supervised Learning'. Labeling data so I can learn from examples." },
    { speaker: "Commander", portrait: "commander", text: "Excellent work. ARIA's memory is at 25%. Head to the Neural Core next — her thinking circuits need rewiring." },
  ],
  neuralcore_intro: [
    { speaker: "ARIA", portrait: "aria_25", text: "Cadet... I can remember now, but I can't think clearly. My synaptic weights are all wrong." },
    { speaker: "ARIA", portrait: "aria_25", text: "I need you to manually adjust the connections in my neural core. Find the right balance." },
    { speaker: "System", portrait: null, text: "MISSION: Adjust ARIA's synaptic weights to restore her decision-making ability." },
  ],
  neuralcore_complete: [
    { speaker: "ARIA", portrait: "aria_50", text: "My circuits are firing correctly again! I can make decisions now. I feel... clearer." },
    { speaker: "ARIA", portrait: "aria_50", text: "Each connection has a weight — like how important it is. You found the right weights using something called Gradient Descent." },
    { speaker: "Commander", portrait: "commander", text: "ARIA's at 50% and climbing. The Simulation Deck is next — she needs to learn to navigate on her own." },
  ],
  simdeck_intro: [
    { speaker: "ARIA", portrait: "aria_50", text: "I can think now, but I don't know how to ACT. I need to learn by doing — by trial and error." },
    { speaker: "ARIA", portrait: "aria_50", text: "Set up a simulation for me. Place rewards and obstacles. I'll try to find the best path." },
    { speaker: "System", portrait: null, text: "MISSION: Design an environment and train ARIA to navigate through it using reinforcement learning." },
  ],
  simdeck_complete: [
    { speaker: "ARIA", portrait: "aria_75", text: "I've learned to navigate! Each attempt taught me something. Good moves get rewards, bad moves get penalties." },
    { speaker: "ARIA", portrait: "aria_75", text: "This is Reinforcement Learning — learning through experience, not just examples. I'm almost fully repaired!" },
    { speaker: "Commander", portrait: "commander", text: "Outstanding, Cadet. Report to the Command Center. It's time to bring ARIA fully online." },
  ],
  command_finale: [
    { speaker: "ARIA", portrait: "aria_100", text: "Cadet Nova... I am fully operational. Thank you for rebuilding me." },
    { speaker: "ARIA", portrait: "aria_100", text: "You taught me to recognize patterns, to think with weights and biases, and to learn from my own experience." },
    { speaker: "ARIA", portrait: "aria_100", text: "These are the same principles behind every AI on Earth — from medical scanners to self-driving cars." },
    { speaker: "Commander", portrait: "commander", text: "Cadet, you have exceeded all expectations. The ISS Prometheus is safe because of you." },
    { speaker: "Commander", portrait: "commander", text: "On behalf of the Deep Space Research Initiative, I hereby promote you. Well done, Commander." },
  ],
};
```

**Step 2: Create DialogueBox component**

Create `src/ui/DialogueBox.jsx`:
```jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PORTRAITS = {
  commander: { emoji: "👨‍✈️", color: "#3b82f6" },
  aria_glitch: { emoji: "🤖", color: "#f43f5e", glitch: true },
  aria_25: { emoji: "🤖", color: "#fb923c" },
  aria_50: { emoji: "🤖", color: "#eab308" },
  aria_75: { emoji: "🤖", color: "#22d3ee" },
  aria_100: { emoji: "🤖", color: "#10b981" },
};

export default function DialogueBox({ dialogue, onComplete }) {
  const [lineIndex, setLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const currentLine = dialogue?.[lineIndex];

  useEffect(() => {
    if (!currentLine) return;
    setDisplayedText("");
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < currentLine.text.length) {
        setDisplayedText(currentLine.text.slice(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [lineIndex, currentLine]);

  if (!dialogue || !currentLine) return null;

  const handleAdvance = (nextKey) => {
    if (isTyping) {
      setDisplayedText(currentLine.text);
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
        position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)",
        width: "min(90vw, 800px)",
        background: "rgba(5, 5, 16, 0.95)",
        border: "2px solid rgba(139, 92, 246, 0.4)",
        borderRadius: "16px",
        padding: "24px",
        zIndex: 150,
        cursor: "pointer",
      }}
      onClick={() => !currentLine.choices && handleAdvance(null)}
    >
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
        {/* Portrait */}
        <div style={{
          width: "56px", height: "56px",
          borderRadius: "12px",
          background: `${portrait.color}22`,
          border: `2px solid ${portrait.color}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.8rem", flexShrink: 0,
          animation: portrait.glitch ? "glitch 0.3s infinite" : "none",
        }}>
          {portrait.emoji}
        </div>

        <div style={{ flex: 1 }}>
          {/* Speaker name */}
          <div style={{
            fontSize: "0.7rem", fontWeight: 800,
            color: portrait.color,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}>
            {currentLine.speaker}
          </div>

          {/* Text */}
          <div style={{
            fontSize: "1rem", lineHeight: 1.6, color: "#e2e8f0",
            minHeight: "48px",
          }}>
            {displayedText}
            {isTyping && <span style={{ opacity: 0.5 }}>|</span>}
          </div>

          {/* Choices */}
          {currentLine.choices && !isTyping && (
            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              {currentLine.choices.map((choice, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); handleAdvance(choice.next); }}
                  style={{
                    padding: "10px 20px",
                    fontSize: "0.85rem",
                    background: "rgba(139,92,246,0.15)",
                    border: "1px solid rgba(139,92,246,0.4)",
                    borderRadius: "8px",
                    color: "#c4b5fd",
                    cursor: "pointer",
                  }}
                >
                  {choice.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Advance hint */}
      {!currentLine.choices && !isTyping && (
        <div style={{
          textAlign: "right", fontSize: "0.6rem",
          color: "#64748b", marginTop: "8px",
          letterSpacing: "0.1em",
        }}>
          CLICK TO CONTINUE ▸
        </div>
      )}
    </motion.div>
  );
}
```

**Step 3: Verify build**

Run: `npm run build`
Expected: PASS

**Step 4: Commit**

```bash
git add src/ui/DialogueBox.jsx src/systems/DialogueData.js
git commit -m "feat: add RPG dialogue system with typewriter effect and branching choices"
```

---

### Task 4: Build the Station Hub with PixiJS

**Files:**
- Create: `src/engine/StationHub.js`
- Create: `src/engine/ParticleEffects.js`

**Step 1: Create ParticleEffects**

Create `src/engine/ParticleEffects.js`:
```js
import { Graphics, Container } from "pixi.js";

export function createStarField(app) {
  const container = new Container();
  const stars = [];

  for (let i = 0; i < 80; i++) {
    const star = new Graphics();
    const size = Math.random() * 2 + 0.5;
    star.circle(0, 0, size);
    star.fill({ color: 0xffffff, alpha: Math.random() * 0.6 + 0.2 });
    star.x = Math.random() * app.screen.width;
    star.y = Math.random() * app.screen.height;
    container.addChild(star);
    stars.push({ graphic: star, speed: Math.random() * 0.3 + 0.1, baseAlpha: star.alpha });
  }

  app.ticker.add((ticker) => {
    for (const s of stars) {
      s.graphic.alpha = s.baseAlpha + Math.sin(Date.now() * 0.002 * s.speed) * 0.3;
    }
  });

  return container;
}

export function createDataStream(app, x, y1, y2, color = 0x8b5cf6) {
  const container = new Container();
  const particles = [];

  for (let i = 0; i < 12; i++) {
    const p = new Graphics();
    p.rect(0, 0, 2, Math.random() * 8 + 4);
    p.fill({ color, alpha: 0.4 });
    p.x = x + (Math.random() - 0.5) * 6;
    p.y = y1 + Math.random() * (y2 - y1);
    container.addChild(p);
    particles.push({ graphic: p, speed: Math.random() * 1.5 + 0.5, y1, y2 });
  }

  app.ticker.add(() => {
    for (const p of particles) {
      p.graphic.y -= p.speed;
      if (p.graphic.y < p.y1) p.graphic.y = p.y2;
    }
  });

  return container;
}
```

**Step 2: Create StationHub scene**

Create `src/engine/StationHub.js`:
```js
import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { createStarField, createDataStream } from "./ParticleEffects.js";

const ROOMS = [
  { id: "bridge", label: "BRIDGE", x: 480, y: 100, color: 0x3b82f6, w: 160, h: 80 },
  { id: "datavault", label: "DATA VAULT", x: 200, y: 280, color: 0x10b981, w: 160, h: 80 },
  { id: "neuralcore", label: "NEURAL CORE", x: 480, y: 280, color: 0x8b5cf6, w: 160, h: 80 },
  { id: "simdeck", label: "SIM DECK", x: 760, y: 280, color: 0xf97316, w: 160, h: 80 },
  { id: "command", label: "COMMAND", x: 480, y: 460, color: 0xfbbf24, w: 160, h: 80 },
];

const CORRIDORS = [
  { from: "bridge", to: "datavault" },
  { from: "bridge", to: "neuralcore" },
  { from: "bridge", to: "simdeck" },
  { from: "datavault", to: "command" },
  { from: "neuralcore", to: "command" },
  { from: "simdeck", to: "command" },
];

const labelStyle = new TextStyle({
  fontFamily: "monospace",
  fontSize: 11,
  fontWeight: "bold",
  fill: 0xffffff,
  letterSpacing: 2,
  align: "center",
});

export function buildStationHub(app, unlockedRooms, onRoomClick) {
  const hub = new Container();

  // Background stars
  hub.addChild(createStarField(app));

  // Station title
  const title = new Text({ text: "ISS PROMETHEUS", style: new TextStyle({
    fontFamily: "monospace", fontSize: 16, fontWeight: "bold",
    fill: 0x94a3b8, letterSpacing: 4,
  })});
  title.anchor.set(0.5);
  title.x = app.screen.width / 2;
  title.y = 40;
  hub.addChild(title);

  // Draw corridors
  const roomMap = {};
  for (const r of ROOMS) roomMap[r.id] = r;

  for (const c of CORRIDORS) {
    const from = roomMap[c.from];
    const to = roomMap[c.to];
    const line = new Graphics();
    line.moveTo(from.x, from.y);
    line.lineTo(to.x, to.y);
    line.stroke({ width: 2, color: 0x1e293b, alpha: 0.6 });
    hub.addChild(line);
  }

  // Draw rooms
  for (const room of ROOMS) {
    const isUnlocked = unlockedRooms.includes(room.id);
    const container = new Container();
    container.x = room.x;
    container.y = room.y;

    // Room shape
    const bg = new Graphics();
    bg.roundRect(-room.w / 2, -room.h / 2, room.w, room.h, 12);
    if (isUnlocked) {
      bg.fill({ color: room.color, alpha: 0.15 });
      bg.stroke({ width: 2, color: room.color, alpha: 0.8 });
    } else {
      bg.fill({ color: 0x0f172a, alpha: 0.5 });
      bg.stroke({ width: 1, color: 0x334155, alpha: 0.4 });
    }
    container.addChild(bg);

    // Label
    const label = new Text({ text: room.label, style: new TextStyle({
      ...labelStyle, fill: isUnlocked ? 0xffffff : 0x475569,
    })});
    label.anchor.set(0.5);
    container.addChild(label);

    // Lock icon for locked rooms
    if (!isUnlocked) {
      const lock = new Text({ text: "🔒", style: new TextStyle({ fontSize: 18 }) });
      lock.anchor.set(0.5);
      lock.y = -room.h / 2 - 16;
      container.addChild(lock);
    }

    // Interactivity
    if (isUnlocked) {
      container.eventMode = "static";
      container.cursor = "pointer";
      container.on("pointerover", () => {
        bg.clear();
        bg.roundRect(-room.w / 2, -room.h / 2, room.w, room.h, 12);
        bg.fill({ color: room.color, alpha: 0.3 });
        bg.stroke({ width: 3, color: room.color, alpha: 1 });
      });
      container.on("pointerout", () => {
        bg.clear();
        bg.roundRect(-room.w / 2, -room.h / 2, room.w, room.h, 12);
        bg.fill({ color: room.color, alpha: 0.15 });
        bg.stroke({ width: 2, color: room.color, alpha: 0.8 });
      });
      container.on("pointertap", () => onRoomClick(room.id));
    }

    hub.addChild(container);

    // Data streams for unlocked rooms
    if (isUnlocked) {
      hub.addChild(createDataStream(app, room.x - room.w / 2 - 10, room.y - 40, room.y + 40, room.color));
    }
  }

  return hub;
}
```

**Step 3: Verify build**

Run: `npm run build`
Expected: PASS

**Step 4: Commit**

```bash
git add src/engine/StationHub.js src/engine/ParticleEffects.js
git commit -m "feat: add PixiJS station hub with rooms, corridors, particles, and click interaction"
```

---

## Phase 2: Game Missions (Tasks 5-8)

### Task 5: Build Mission Briefing UI

**Files:**
- Create: `src/ui/MissionBriefing.jsx`

**Step 1: Create MissionBriefing component**

Create `src/ui/MissionBriefing.jsx`:
```jsx
import React from "react";
import { motion } from "framer-motion";

const MISSION_INFO = {
  datavault: {
    title: "DATA VAULT",
    subtitle: "SIGNAL CLASSIFICATION",
    objective: "Classify incoming alien signals as FRIENDLY or HOSTILE to restore ARIA's pattern recognition.",
    concept: "Supervised Learning",
    color: "#10b981",
  },
  neuralcore: {
    title: "NEURAL CORE",
    subtitle: "SYNAPTIC REWIRING",
    objective: "Adjust ARIA's synaptic weights to restore her decision-making circuits.",
    concept: "Neural Networks",
    color: "#8b5cf6",
  },
  simdeck: {
    title: "SIMULATION DECK",
    subtitle: "AGENT NAVIGATION",
    objective: "Design an environment and train ARIA to find the optimal path.",
    concept: "Reinforcement Learning",
    color: "#f97316",
  },
};

export default function MissionBriefing({ missionId, onStart }) {
  const info = MISSION_INFO[missionId];
  if (!info) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        position: "fixed", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(5,5,16,0.9)",
        zIndex: 180,
      }}
    >
      <div style={{
        background: "rgba(15,23,42,0.95)",
        border: `2px solid ${info.color}`,
        borderRadius: "20px",
        padding: "48px",
        maxWidth: "550px",
        width: "90vw",
        textAlign: "center",
      }}>
        <div style={{
          fontSize: "0.65rem", fontWeight: 800,
          color: info.color, letterSpacing: "0.25em",
          marginBottom: "8px",
        }}>
          MISSION BRIEFING
        </div>

        <h2 style={{
          fontSize: "2rem", fontWeight: 900,
          marginBottom: "4px", color: "#f8fafc",
        }}>
          {info.title}
        </h2>

        <div style={{
          fontSize: "0.8rem", color: "#64748b",
          letterSpacing: "0.15em", marginBottom: "32px",
        }}>
          {info.subtitle}
        </div>

        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "24px",
          textAlign: "left",
        }}>
          <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 700, letterSpacing: "0.15em", marginBottom: "8px" }}>
            OBJECTIVE
          </div>
          <div style={{ fontSize: "0.95rem", lineHeight: 1.6, color: "#e2e8f0" }}>
            {info.objective}
          </div>
        </div>

        <div style={{
          display: "inline-block",
          background: `${info.color}22`,
          border: `1px solid ${info.color}66`,
          borderRadius: "20px",
          padding: "6px 16px",
          fontSize: "0.7rem",
          fontWeight: 700,
          color: info.color,
          letterSpacing: "0.1em",
          marginBottom: "32px",
        }}>
          AI CONCEPT: {info.concept}
        </div>

        <div>
          <button
            onClick={onStart}
            style={{
              padding: "16px 48px",
              fontSize: "1rem",
              fontWeight: 800,
              background: info.color,
              border: "none",
              borderRadius: "8px",
              color: "white",
              cursor: "pointer",
              letterSpacing: "0.15em",
            }}
          >
            BEGIN MISSION
          </button>
        </div>
      </div>
    </motion.div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add src/ui/MissionBriefing.jsx
git commit -m "feat: add mission briefing overlay with objective and concept info"
```

---

### Task 6: Build Mission 1 — Signal Classifier (Data Vault)

**Files:**
- Create: `src/labs/SignalClassifier.jsx`

**Step 1: Create SignalClassifier**

Create `src/labs/SignalClassifier.jsx`:
```jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../systems/GameState";
import { playSound } from "../systems/SoundManager";

function generateSignals(count = 15) {
  const signals = [];
  for (let i = 0; i < count; i++) {
    const isFriendly = Math.random() > 0.5;
    signals.push({
      id: i,
      frequency: isFriendly ? "LOW" : "HIGH",
      pattern: isFriendly ? "REPEATING" : "CHAOTIC",
      color: isFriendly ? "#10b981" : "#f43f5e",
      waveSpeed: isFriendly ? 2 : 6,
      label: isFriendly ? "FRIENDLY" : "HOSTILE",
      code: `SIG-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    });
  }
  return signals;
}

function WaveformDisplay({ signal }) {
  const points = Array.from({ length: 40 }, (_, i) => {
    const x = i * 12;
    const freq = signal.waveSpeed;
    const y = 50 + Math.sin((i * freq * 0.3) + Date.now() * 0.003 * freq) * 30;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width="480" height="100" style={{ overflow: "visible" }}>
      <polyline
        points={points}
        fill="none"
        stroke={signal.color}
        strokeWidth="3"
        style={{ filter: `drop-shadow(0 0 8px ${signal.color})` }}
      />
    </svg>
  );
}

export default function SignalClassifier({ onComplete }) {
  const { dispatch } = useGame();
  const [signals] = useState(() => generateSignals());
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);
  const [, setTick] = useState(0);

  // Animate waveform
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 50);
    return () => clearInterval(interval);
  }, []);

  const handleClassify = useCallback((choice) => {
    const correct = signals[index].label === choice;
    if (correct) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      setBestStreak(b => Math.max(b, streak + 1));
      dispatch({ type: "ADD_XP", payload: 10 + streak * 2 });
      setFeedback("correct");
      playSound("success");

      if (score === 0) {
        dispatch({ type: "ADD_ACHIEVEMENT", payload: "First Contact" });
      }
    } else {
      setStreak(0);
      setFeedback("wrong");
      playSound("error");
    }

    setTimeout(() => {
      setFeedback(null);
      if (index < signals.length - 1) {
        setIndex(i => i + 1);
      } else {
        const accuracy = Math.round(((correct ? score + 1 : score) / signals.length) * 100);
        if (accuracy === 100) {
          dispatch({ type: "ADD_ACHIEVEMENT", payload: "Perfect Epoch" });
        }
        dispatch({ type: "HEAL_ARIA", payload: 25 });
        dispatch({ type: "ADD_CONCEPT", payload: { title: "Supervised Learning", desc: "Teaching AI by showing it labeled examples — like how you classified signals as friendly or hostile." } });
        dispatch({ type: "ADD_CONCEPT", payload: { title: "Training Data", desc: "The collection of labeled examples an AI learns from. More data = better learning." } });
        dispatch({ type: "SET_MISSION_RESULT", payload: { mission: "datavault", result: { accuracy, bestStreak: Math.max(bestStreak, streak + (correct ? 1 : 0)) } } });
        setDone(true);
      }
    }, 600);
  }, [index, signals, score, streak, bestStreak, dispatch]);

  if (done) {
    const accuracy = Math.round(score / signals.length * 100);
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ padding: "48px", textAlign: "center" }}
      >
        <div style={{ fontSize: "4rem", marginBottom: "16px" }}>📡</div>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 900, marginBottom: "8px", color: "#f8fafc" }}>
          SIGNAL ANALYSIS COMPLETE
        </h2>
        <div style={{ display: "flex", justifyContent: "center", gap: "32px", margin: "32px 0" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#10b981" }}>{accuracy}%</div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", letterSpacing: "0.1em" }}>ACCURACY</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#8b5cf6" }}>{bestStreak}</div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", letterSpacing: "0.1em" }}>BEST STREAK</div>
          </div>
        </div>
        <button onClick={onComplete}
          style={{ padding: "16px 48px", background: "#10b981", border: "none", borderRadius: "8px", color: "white", fontSize: "1rem", fontWeight: 800, cursor: "pointer", letterSpacing: "0.1em" }}
        >
          RETURN TO STATION
        </button>
      </motion.div>
    );
  }

  const signal = signals[index];

  return (
    <div style={{ padding: "32px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "0.1em", color: "#f8fafc" }}>
            SIGNAL INTERCEPT
          </h3>
          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Classify incoming transmissions</div>
        </div>
        <div style={{ display: "flex", gap: "24px", textAlign: "right" }}>
          <div>
            <div style={{ fontSize: "0.6rem", color: "#64748b", letterSpacing: "0.1em" }}>SIGNAL</div>
            <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>{index + 1}/{signals.length}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.6rem", color: "#64748b", letterSpacing: "0.1em" }}>STREAK</div>
            <div style={{ fontWeight: 800, fontSize: "1.1rem", color: streak > 0 ? "#fbbf24" : "#64748b" }}>
              {streak > 0 ? `x${streak}` : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Signal Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={signal.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          style={{
            background: feedback === "correct" ? "rgba(16,185,129,0.1)" : feedback === "wrong" ? "rgba(244,63,94,0.1)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${feedback === "correct" ? "#10b981" : feedback === "wrong" ? "#f43f5e" : "rgba(255,255,255,0.08)"}`,
            borderRadius: "16px",
            padding: "32px",
            marginBottom: "24px",
            textAlign: "center",
          }}
        >
          <div style={{ marginBottom: "16px", fontSize: "0.7rem", color: "#94a3b8", letterSpacing: "0.2em" }}>
            {signal.code}
          </div>
          <WaveformDisplay signal={signal} />
          <div style={{ display: "flex", justifyContent: "center", gap: "32px", marginTop: "24px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.6rem", color: "#64748b", letterSpacing: "0.1em", marginBottom: "4px" }}>FREQUENCY</div>
              <div style={{ fontWeight: 700, color: signal.color }}>{signal.frequency}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.6rem", color: "#64748b", letterSpacing: "0.1em", marginBottom: "4px" }}>PATTERN</div>
              <div style={{ fontWeight: 700, color: signal.color }}>{signal.pattern}</div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Classify Buttons */}
      <div style={{ display: "flex", gap: "16px" }}>
        <button onClick={() => handleClassify("FRIENDLY")}
          style={{ flex: 1, padding: "20px", background: "rgba(16,185,129,0.15)", border: "2px solid #10b981", borderRadius: "12px", color: "#10b981", fontSize: "1rem", fontWeight: 800, cursor: "pointer", letterSpacing: "0.15em" }}
        >
          FRIENDLY
        </button>
        <button onClick={() => handleClassify("HOSTILE")}
          style={{ flex: 1, padding: "20px", background: "rgba(244,63,94,0.15)", border: "2px solid #f43f5e", borderRadius: "12px", color: "#f43f5e", fontSize: "1rem", fontWeight: 800, cursor: "pointer", letterSpacing: "0.15em" }}
        >
          HOSTILE
        </button>
      </div>

      {/* Hint */}
      <div style={{
        marginTop: "24px", padding: "16px",
        background: "rgba(139,92,246,0.08)",
        border: "1px solid rgba(139,92,246,0.2)",
        borderRadius: "10px",
        fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.5,
      }}>
        💡 <strong style={{ color: "#c4b5fd" }}>ARIA HINT:</strong> Look at the frequency and pattern. Friendly signals tend to be LOW frequency with REPEATING patterns.
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add src/labs/SignalClassifier.jsx
git commit -m "feat: add Signal Classifier mission with waveform display, streaks, and XP"
```

---

### Task 7: Build Mission 2 — Synaptic Wiring (Neural Core)

**Files:**
- Create: `src/labs/SynapticWiring.jsx`

**Step 1: Create SynapticWiring**

Create `src/labs/SynapticWiring.jsx`:
```jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useGame } from "../systems/GameState";
import { playSound } from "../systems/SoundManager";

export default function SynapticWiring({ onComplete }) {
  const { dispatch } = useGame();
  const [weights, setWeights] = useState([0.5, -0.2, 0.1]);
  const [pulseKey, setPulseKey] = useState(0);
  const [awakened, setAwakened] = useState(false);
  const inputs = [1, 0.5];

  const weightedSum = inputs[0] * weights[0] + inputs[1] * weights[1] + weights[2];
  const output = 1 / (1 + Math.exp(-weightedSum));
  const outputPercent = Math.round(output * 100);

  const getColor = () => {
    if (output > 0.7) return "#10b981";
    if (output < 0.3) return "#f43f5e";
    return "#eab308";
  };

  useEffect(() => {
    dispatch({ type: "ADD_CONCEPT", payload: { title: "Synapse Weights", desc: "Weights determine how much influence each input has on the output — like importance dials." } });
  }, []);

  const handleWeightChange = (i, val) => {
    const next = [...weights];
    next[i] = val;
    setWeights(next);
    setPulseKey(k => k + 1);

    if (output > 0.95) {
      dispatch({ type: "ADD_ACHIEVEMENT", payload: "Weight Wizard" });
    }

    if (Math.abs(val) > 0.8) {
      dispatch({ type: "ADD_CONCEPT", payload: { title: "Gradient Descent", desc: "The process of adjusting weights to minimize error — like a ball rolling downhill to find the lowest point." } });
    }
  };

  const handleAwaken = () => {
    if (output > 0.7 && !awakened) {
      setAwakened(true);
      dispatch({ type: "ADD_XP", payload: 80 });
      dispatch({ type: "HEAL_ARIA", payload: 25 });
      dispatch({ type: "ADD_CONCEPT", payload: { title: "Activation Function", desc: "The sigmoid function squashes any number into a value between 0 and 1 — like a confidence percentage." } });
      playSound("success");
    }
  };

  if (awakened) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ padding: "48px", textAlign: "center" }}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ fontSize: "5rem", marginBottom: "16px" }}
        >
          🧠
        </motion.div>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#f8fafc", marginBottom: "8px" }}>
          NEURAL CORE ONLINE
        </h2>
        <p style={{ color: "#94a3b8", fontSize: "1rem", marginBottom: "32px", maxWidth: "500px", margin: "0 auto 32px" }}>
          ARIA's thinking circuits are restored. You found the right combination of weights using the principles of neural networks.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "32px", marginBottom: "32px" }}>
          <div>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#8b5cf6" }}>{outputPercent}%</div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>FINAL OUTPUT</div>
          </div>
        </div>
        <button onClick={onComplete}
          style={{ padding: "16px 48px", background: "#8b5cf6", border: "none", borderRadius: "8px", color: "white", fontSize: "1rem", fontWeight: 800, cursor: "pointer" }}
        >
          RETURN TO STATION
        </button>
      </motion.div>
    );
  }

  const wireColor = (w) => w > 0 ? "#8b5cf6" : "#f43f5e";
  const wireOpacity = (w) => Math.abs(w) * 0.8 + 0.2;

  return (
    <div style={{ padding: "32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "0.1em" }}>SYNAPTIC MATRIX</h3>
          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Adjust weights to activate ARIA's neural core</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "0.6rem", color: "#64748b", letterSpacing: "0.1em" }}>OUTPUT</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: getColor() }}>{outputPercent}%</div>
        </div>
      </div>

      {/* Neural network visualization */}
      <div style={{
        background: "rgba(0,0,0,0.3)", borderRadius: "16px",
        padding: "32px", marginBottom: "24px",
        position: "relative", height: "280px",
        display: "flex", alignItems: "center", justifyContent: "space-around",
      }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          {/* Wire from input 1 to output */}
          <line x1="20%" y1="35%" x2="80%" y2="50%"
            stroke={wireColor(weights[0])} strokeWidth={Math.abs(weights[0]) * 8 + 2}
            opacity={wireOpacity(weights[0])}
          />
          {/* Wire from input 2 to output */}
          <line x1="20%" y1="65%" x2="80%" y2="50%"
            stroke={wireColor(weights[1])} strokeWidth={Math.abs(weights[1]) * 8 + 2}
            opacity={wireOpacity(weights[1])}
          />
          {/* Animated particles */}
          <motion.circle key={`p1-${pulseKey}`} r="5" fill="white"
            initial={{ cx: "20%", cy: "35%", opacity: 1 }}
            animate={{ cx: "80%", cy: "50%", opacity: 0 }}
            transition={{ duration: 1, ease: "linear" }}
            style={{ filter: "drop-shadow(0 0 6px white)" }}
          />
          <motion.circle key={`p2-${pulseKey}`} r="5" fill="white"
            initial={{ cx: "20%", cy: "65%", opacity: 1 }}
            animate={{ cx: "80%", cy: "50%", opacity: 0 }}
            transition={{ duration: 1.2, ease: "linear" }}
            style={{ filter: "drop-shadow(0 0 6px white)" }}
          />
        </svg>

        {/* Input nodes */}
        <div style={{ display: "flex", flexDirection: "column", gap: "60px", zIndex: 1 }}>
          {["VISUAL DATA", "MOTION DATA"].map((label, i) => (
            <div key={i} style={{
              width: "60px", height: "60px", borderRadius: "12px",
              background: "rgba(139,92,246,0.2)", border: "2px solid #8b5cf6",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexDirection: "column", fontSize: "0.5rem", color: "#c4b5fd",
              fontWeight: 700, letterSpacing: "0.1em", textAlign: "center",
            }}>
              <div style={{ fontSize: "1.2rem", marginBottom: "2px" }}>{i === 0 ? "👁️" : "🏃"}</div>
              {label}
            </div>
          ))}
        </div>

        {/* Output node — ARIA's eye */}
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
          <div style={{ fontSize: "2rem" }}>👁️</div>
          <div style={{ fontSize: "0.6rem", fontWeight: 800, color: getColor() }}>{outputPercent}%</div>
        </motion.div>
      </div>

      {/* Weight sliders */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "WEIGHT 1: Visual Importance", i: 0 },
          { label: "WEIGHT 2: Motion Importance", i: 1 },
          { label: "BIAS: Base Threshold", i: 2 },
        ].map(({ label, i }) => (
          <div key={i} style={{
            background: "rgba(255,255,255,0.03)", borderRadius: "12px",
            padding: "16px", border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#e2e8f0" }}>{label}</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 800, color: wireColor(weights[i]) }}>
                {weights[i].toFixed(1)}
              </span>
            </div>
            <input type="range" min="-1" max="1" step="0.1" value={weights[i]}
              onChange={e => handleWeightChange(i, parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: "#8b5cf6", cursor: "pointer" }}
            />
          </div>
        ))}
      </div>

      {/* Awaken button */}
      <button onClick={handleAwaken} disabled={output <= 0.7}
        style={{
          width: "100%", padding: "18px",
          background: output > 0.7 ? "#8b5cf6" : "rgba(255,255,255,0.05)",
          border: output > 0.7 ? "none" : "1px solid rgba(255,255,255,0.1)",
          borderRadius: "12px", color: "white", fontSize: "1rem",
          fontWeight: 800, cursor: output > 0.7 ? "pointer" : "not-allowed",
          letterSpacing: "0.15em",
        }}
      >
        {output > 0.7 ? "⚡ ACTIVATE NEURAL CORE" : "🔒 OUTPUT MUST EXCEED 70%"}
      </button>
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add src/labs/SynapticWiring.jsx
git commit -m "feat: add Synaptic Wiring mission with weight sliders and neural visualization"
```

---

### Task 8: Build Mission 3 — Agent Navigator (Sim Deck)

**Files:**
- Create: `src/labs/AgentNavigator.jsx`

**Step 1: Create AgentNavigator**

Create `src/labs/AgentNavigator.jsx`:
```jsx
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

      {/* Grid */}
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

      {/* Controls */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <button onClick={runEpisode} disabled={running}
          style={{
            flex: 1, padding: "16px", background: running ? "rgba(255,255,255,0.05)" : "#f97316",
            border: "none", borderRadius: "10px", color: "white", fontWeight: 800, cursor: running ? "wait" : "pointer",
            fontSize: "0.9rem", letterSpacing: "0.1em",
          }}
        >
          {running ? "SIMULATING..." : "🚀 DEPLOY EPISODE"}
        </button>
        {episodes >= 3 && (
          <button onClick={handleFinish}
            style={{ padding: "16px 24px", background: "#10b981", border: "none", borderRadius: "10px", color: "white", fontWeight: 800, cursor: "pointer", fontSize: "0.9rem" }}
          >
            COMPLETE
          </button>
        )}
      </div>

      {/* Legend */}
      <div style={{
        display: "flex", gap: "20px", fontSize: "0.75rem", color: "#94a3b8",
        padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px",
      }}>
        <span>Click tiles: ⬜ Empty → ⛽ Fuel (+1) → ☄️ Asteroid (-1) → ⬜</span>
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add src/labs/AgentNavigator.jsx
git commit -m "feat: add Agent Navigator mission with grid world and RL simulation"
```

---

## Phase 3: Integration (Tasks 9-11)

### Task 9: Build the Command Center finale scene

**Files:**
- Create: `src/labs/CommandCenter.jsx`

**Step 1: Create CommandCenter**

Create `src/labs/CommandCenter.jsx`:
```jsx
import React from "react";
import { motion } from "framer-motion";
import { useGame, RANKS } from "../systems/GameState";

const REAL_WORLD = [
  { emoji: "🏥", title: "Healthcare", desc: "AI scans millions of X-rays to find tiny signs of illness that humans might miss." },
  { emoji: "🌍", title: "Environment", desc: "Satellites use AI to track deforestation and predict where wildfires might start." },
  { emoji: "🎨", title: "Creative Arts", desc: "Generative AI co-creates music and art, pushing the boundaries of human creativity." },
  { emoji: "🚗", title: "Self-Driving", desc: "Cars use reinforcement learning — the same technique you used — to learn to drive safely." },
];

export default function CommandCenter() {
  const { state } = useGame();

  return (
    <div style={{ padding: "48px", textAlign: "center" }}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 10 }}
        style={{ fontSize: "5rem", marginBottom: "16px" }}
      >
        🏆
      </motion.div>

      <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: "8px" }}>
        <span style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          MISSION ACCOMPLISHED
        </span>
      </h1>
      <p style={{ color: "#94a3b8", fontSize: "1.1rem", marginBottom: "40px", maxWidth: "600px", margin: "0 auto 40px" }}>
        You've successfully rebuilt ARIA and saved the ISS Prometheus. Here's what you mastered:
      </p>

      {/* Stats */}
      <div style={{ display: "flex", justifyContent: "center", gap: "32px", marginBottom: "48px", flexWrap: "wrap" }}>
        {[
          { label: "RANK", value: state.rank, color: "#8b5cf6" },
          { label: "XP EARNED", value: state.xp, color: "#06b6d4" },
          { label: "ARIA HEALTH", value: `${state.ariaHealth}%`, color: "#10b981" },
          { label: "ACHIEVEMENTS", value: state.achievements.length, color: "#fbbf24" },
          { label: "AI CONCEPTS", value: state.discoveredConcepts.length, color: "#f97316" },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px", padding: "20px 28px", minWidth: "120px",
            }}
          >
            <div style={{ fontSize: "1.5rem", fontWeight: 900, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: "0.6rem", color: "#64748b", letterSpacing: "0.15em", marginTop: "4px" }}>{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Real world AI */}
      <h3 style={{ fontSize: "1rem", color: "#94a3b8", letterSpacing: "0.15em", marginBottom: "24px" }}>
        AI IN THE REAL WORLD
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", maxWidth: "800px", margin: "0 auto 48px" }}>
        {REAL_WORLD.map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.1 }}
            whileHover={{ y: -4 }}
            style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px", padding: "24px", textAlign: "left",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "12px" }}>{item.emoji}</div>
            <div style={{ fontWeight: 800, marginBottom: "8px", color: "#f8fafc" }}>{item.title}</div>
            <div style={{ fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.5 }}>{item.desc}</div>
          </motion.div>
        ))}
      </div>

      {/* Concepts learned */}
      <div style={{
        background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)",
        borderRadius: "16px", padding: "32px", maxWidth: "600px", margin: "0 auto", textAlign: "left",
      }}>
        <h4 style={{ color: "#c4b5fd", marginBottom: "16px", letterSpacing: "0.1em", fontSize: "0.8rem" }}>
          📚 AI CONCEPTS DISCOVERED
        </h4>
        {state.discoveredConcepts.map((c, i) => (
          <div key={i} style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#e2e8f0" }}>{c.title}</div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8", lineHeight: 1.4 }}>{c.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add src/labs/CommandCenter.jsx
git commit -m "feat: add Command Center finale with stats, achievements, and real-world AI showcase"
```

---

### Task 10: Rewrite App.jsx as the game orchestrator

**Files:**
- Modify: `src/App.jsx` (full rewrite)
- Modify: `src/main.jsx`

**Step 1: Rewrite main.jsx to wrap with GameProvider**

Modify `src/main.jsx`:
```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { GameProvider } from "./systems/GameState";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </StrictMode>
);
```

**Step 2: Rewrite App.jsx**

Replace the entire contents of `src/App.jsx` with the game orchestrator that:
- Manages scene transitions (hub → dialogue → briefing → mission → dialogue → hub)
- Renders the PixiJS canvas for the hub
- Overlays React UI (HUD, DialogueBox, MissionBriefing, Labs)
- Handles the flow: Bridge intro → Data Vault → Neural Core → Sim Deck → Command Center

The App component should:
1. Show the Bridge intro dialogue on first load
2. After intro, show the station hub
3. When a room is clicked, play its intro dialogue → show mission briefing → launch mission
4. After mission, play completion dialogue → unlock next room → return to hub
5. Command Center triggers the finale

**Step 3: Verify dev server**

Run: `npm run dev`
Expected: App runs at localhost, shows the station hub

**Step 4: Commit**

```bash
git add src/App.jsx src/main.jsx
git commit -m "feat: rewrite App.jsx as game orchestrator with scene flow and PixiJS hub"
```

---

### Task 11: Rewrite index.css for game aesthetic

**Files:**
- Modify: `src/index.css` (full rewrite)
- Delete: `src/App.css` (unused)

**Step 1: Rewrite index.css**

Replace with a game-focused stylesheet:
- Dark space background (#050510)
- Remove CRT scanline overlay (too corporate)
- Keep the grid background but make it subtler
- Game-style buttons (chunky, colorful, with hover sound cues)
- Larger base font size for kids (16px minimum body)
- Remove glassmorphism in favor of solid dark panels with colored borders
- Add CSS animation for glitch effect (for ARIA's early state)
- Style the scrollbar to match the theme

**Step 2: Delete App.css**

```bash
rm src/App.css
```

**Step 3: Verify everything renders**

Run: `npm run dev`
Expected: Full game runs with new styling

**Step 4: Commit**

```bash
git add src/index.css
git rm src/App.css
git commit -m "feat: rewrite CSS for game aesthetic, remove unused App.css"
```

---

## Phase 4: Polish (Tasks 12-13)

### Task 12: Add sound effects

**Files:**
- Create: `src/assets/audio/` (generate tones programmatically)
- Modify: `src/systems/SoundManager.js`

**Step 1: Generate sounds programmatically using Web Audio API**

Instead of shipping audio files, generate simple synth tones at runtime using Web Audio API as a fallback / primary approach. Update SoundManager.js to create sounds programmatically:
- `success`: rising two-tone beep
- `error`: descending buzz
- `click`: short blip
- `rankup`: ascending arpeggio
- `ambient`: low drone (looping)

Register these in App.jsx on mount.

**Step 2: Wire sounds to game events**

Add `playSound("click")` to button clicks, `playSound("success")` to correct answers, etc. (Most are already wired in the lab components from Tasks 6-8.)

**Step 3: Commit**

```bash
git add src/systems/SoundManager.js
git commit -m "feat: add procedural sound effects via Web Audio API"
```

---

### Task 13: Final integration test and cleanup

**Step 1: Full playthrough test**

Run: `npm run dev`

Test the complete flow:
1. Bridge intro dialogue plays with typewriter effect
2. Hub shows with Bridge room unlocked
3. Click Data Vault → dialogue → briefing → Signal Classifier works → completion dialogue → hub
4. Click Neural Core → dialogue → briefing → Synaptic Wiring works → completion dialogue → hub
5. Click Sim Deck → dialogue → briefing → Agent Navigator works → completion dialogue → hub
6. Click Command Center → finale dialogue → stats screen
7. XP bar updates correctly throughout
8. ARIA health increases after each mission
9. Achievements pop up when earned

**Step 2: Production build check**

Run: `npm run build`
Expected: Clean build, no warnings

**Step 3: Clean up unused files**

Remove `src/assets/react.svg` and `public/vite.svg` if not needed.

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete Neural Quest RPG - full game with PixiJS, dialogue, missions, and progression"
```
