# Neural Quest Expansion — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand Neural Quest from a 5-minute demo into a 45-60 minute educational AI/ML game with 6 missions x 3 levels, collectible concept cards, evolving ARIA story, and star-based progression.

**Architecture:** Phased expansion — first restructure game state and level system (foundation), then expand existing missions to 3 levels each, add 3 new missions, build progression UI (Codex, rank ceremonies), expand the station map with branching unlocks, and finish with an enhanced Command Center finale.

**Tech Stack:** React 19, PixiJS 8, Framer Motion 12, Howler/Web Audio, Vite 7

**Design doc:** `docs/plans/2026-03-04-game-expansion-design.md`

---

## Phase 1: Foundation — Game State & Level System

### Task 1: Expand GameState with stars, levels, and codex

**Files:**
- Modify: `src/systems/GameState.jsx`

**What to do:**

Replace the entire game state with an expanded version that supports:

1. **Stars** per mission per level (stored as `{ datavault: { 1: 2, 2: 0, 3: 0 }, ... }`)
2. **Codex cards** — array of collected concept cards with `{ id, title, description, realWorld, rarity, icon }`
3. **Level progress** — tracks which missions/levels are completed
4. **ARIA health** — now calculated from level completions (~5% per level)
5. **Expanded ranks** — 10 ranks tied to total stars earned

New `initialState`:
```jsx
const initialState = {
  scene: "bridge",
  xp: 0,
  totalStars: 0,
  stars: {},           // { missionId: { level: starCount } }
  levelComplete: {},   // { missionId: { level: true } }
  ariaHealth: 0,
  unlockedRooms: ["bridge"],
  unlockedLevels: {},  // { missionId: [1] } — level 1 unlocked by default
  achievements: [],
  codex: [],           // collected concept cards
  discoveredConcepts: [], // kept for backward compat during migration
  missionResults: {},
};
```

New reducer actions:
- `SET_STARS` — `{ mission, level, stars }` — sets stars for a level (keeps highest)
- `COMPLETE_LEVEL` — `{ mission, level }` — marks level done, recalculates ariaHealth
- `ADD_CODEX_CARD` — `{ id, title, description, realWorld, rarity, icon }` — adds card if not collected
- `UNLOCK_LEVEL` — `{ mission, level }` — unlocks a specific level

New `RANKS` (10 ranks, star-based):
```jsx
const RANKS = [
  { name: "Cadet Recruit", stars: 0 },
  { name: "Data Apprentice", stars: 3 },
  { name: "Signal Analyst", stars: 6 },
  { name: "Neural Technician", stars: 10 },
  { name: "Pattern Architect", stars: 15 },
  { name: "Algorithm Specialist", stars: 20 },
  { name: "Ethics Guardian", stars: 26 },
  { name: "AI Researcher", stars: 33 },
  { name: "Chief Scientist", stars: 40 },
  { name: "Prometheus Legend", stars: 48 },
];
```

`getRank` now uses `totalStars` instead of `xp`.

Keep `ADD_XP` working (XP still exists for within-mission rewards). Keep `HEAL_ARIA` but also auto-calculate from completed levels.

**Step 1:** Rewrite `GameState.jsx` with all new state shape and reducer actions.
**Step 2:** Export new constants: `RANKS`, `MISSIONS_CONFIG` (see Task 2).
**Step 3:** Verify the app still boots (existing components will need updates in later tasks).
**Step 4:** Commit: `feat: expand game state with stars, levels, and codex`

---

### Task 2: Create mission/level configuration system

**Files:**
- Create: `src/systems/MissionConfig.js`

**What to do:**

Central configuration for all 6 missions, their 3 levels, star thresholds, unlock requirements, and concept cards.

```jsx
export const MISSIONS = {
  datavault: {
    title: "DATA VAULT",
    subtitle: "Signal Classification",
    concept: "Supervised Learning",
    color: "#10b981",
    icon: "📡",
    position: { x: 160, y: 220 },  // station map position
    levels: {
      1: {
        name: "Tutorial",
        description: "Learn to classify signals with full guidance",
        signalCount: 5,
        hintsVisible: true,
        timeLimit: null,
        starThresholds: { 1: 60, 2: 80, 3: 100 },  // accuracy %
        briefingSteps: [
          "5 signals will arrive — each shows frequency and pattern",
          "FRIENDLY = LOW frequency + REPEATING pattern",
          "Classify all correctly for 3 stars!",
        ],
      },
      2: {
        name: "Challenge",
        description: "Faster signals, hints fade after 3 correct",
        signalCount: 12,
        hintsVisible: "fade",  // fade after 3 correct
        timeLimit: null,
        starThresholds: { 1: 50, 2: 75, 3: 92 },
        briefingSteps: [
          "12 signals, faster pace — hints disappear after 3 correct answers",
          "Build streaks for bonus XP multipliers",
          "Watch for tricky signals with mixed patterns!",
        ],
      },
      3: {
        name: "Mastery",
        description: "No hints, ambiguous signals, time pressure",
        signalCount: 20,
        hintsVisible: false,
        timeLimit: 60,  // seconds
        starThresholds: { 1: 50, 2: 70, 3: 90 },
        briefingSteps: [
          "20 signals, no hints, 60-second time limit",
          "Some signals have MEDIUM frequency — use pattern as the tiebreaker",
          "True AI researchers handle ambiguity. Can you?",
        ],
      },
    },
  },
  neuralcore: {
    title: "NEURAL CORE",
    subtitle: "Synaptic Rewiring",
    concept: "Neural Networks",
    color: "#8b5cf6",
    icon: "🧠",
    position: { x: 480, y: 380 },
    levels: {
      1: {
        name: "Tutorial",
        description: "2 weights, low target, guided suggestions",
        weightCount: 2,
        hasBias: false,
        target: 60,
        starThresholds: { 1: 60, 2: 75, 3: 90 },  // output %
        briefingSteps: [
          "Adjust 2 weight sliders to control ARIA's neural output",
          "Get the output above 60% to activate the core",
          "Higher output = more stars!",
        ],
      },
      2: {
        name: "Challenge",
        description: "3 weights + bias, higher target",
        weightCount: 3,
        hasBias: true,
        target: 80,
        starThresholds: { 1: 80, 2: 90, 3: 95 },
        briefingSteps: [
          "Now with 3 weights AND a bias slider",
          "Target output: above 80%",
          "Careful — overshooting past 100% wastes energy!",
        ],
      },
      3: {
        name: "Mastery",
        description: "5 inputs, hit a specific target range",
        weightCount: 5,
        hasBias: true,
        targetRange: [75, 85],
        starThresholds: { 1: 70, 2: 78, 3: 82 },  // closeness to 80
        briefingSteps: [
          "5 input weights + bias — hit the target range: 75-85%",
          "Too high OR too low loses stars",
          "Real neural networks need precision, not just power!",
        ],
      },
    },
  },
  opticslab: {
    title: "OPTICS LAB",
    subtitle: "Pattern Recognition",
    concept: "Computer Vision",
    color: "#06b6d4",
    icon: "👁️",
    position: { x: 480, y: 220 },
    levels: {
      1: {
        name: "Tutorial",
        description: "Find the pattern in a small clear grid",
        gridSize: 4,
        noiseLevel: 0,
        rounds: 3,
        starThresholds: { 1: 1, 2: 2, 3: 3 },  // rounds correct
        briefingSteps: [
          "A grid of shapes appears — one pattern repeats",
          "Click the cells that form the repeating pattern",
          "ARIA needs to learn to 'see' — help her spot patterns!",
        ],
      },
      2: {
        name: "Challenge",
        description: "Larger grid with noise symbols mixed in",
        gridSize: 6,
        noiseLevel: 0.3,
        rounds: 5,
        starThresholds: { 1: 2, 2: 4, 3: 5 },
        briefingSteps: [
          "6x6 grid with random noise symbols mixed in",
          "Find the real pattern among the distractors",
          "This is exactly how computer vision filters noise from images!",
        ],
      },
      3: {
        name: "Mastery",
        description: "Multiple overlapping patterns, find the target",
        gridSize: 8,
        noiseLevel: 0.5,
        rounds: 5,
        overlapping: true,
        starThresholds: { 1: 2, 2: 3, 3: 5 },
        briefingSteps: [
          "8x8 grid with MULTIPLE patterns — only one is the target",
          "ARIA will show you what to look for, then you find it",
          "Real AI faces this challenge in every photo it processes!",
        ],
      },
    },
  },
  commsarray: {
    title: "COMMS ARRAY",
    subtitle: "Message Analysis",
    concept: "Natural Language Processing",
    color: "#ec4899",
    icon: "💬",
    position: { x: 800, y: 220 },
    levels: {
      1: {
        name: "Tutorial",
        description: "Classify messages with obvious keywords",
        messageCount: 8,
        categories: ["Greeting", "Warning", "Request"],
        difficulty: "easy",
        starThresholds: { 1: 50, 2: 75, 3: 100 },
        briefingSteps: [
          "Alien messages arrive — classify each as Greeting, Warning, or Request",
          "Look for keywords: 'hello' = Greeting, 'danger' = Warning, 'need' = Request",
          "This is how AI chatbots understand what you're saying!",
        ],
      },
      2: {
        name: "Challenge",
        description: "Subtle tone, no obvious keywords",
        messageCount: 12,
        categories: ["Greeting", "Warning", "Request", "Threat"],
        difficulty: "medium",
        starThresholds: { 1: 50, 2: 67, 3: 83 },
        briefingSteps: [
          "Harder messages — tone matters more than individual words",
          "New category: Threat (different from Warning — implies intent)",
          "AI must understand context, not just keywords!",
        ],
      },
      3: {
        name: "Mastery",
        description: "Ambiguous messages, sarcasm, and context",
        messageCount: 15,
        categories: ["Greeting", "Warning", "Request", "Threat"],
        difficulty: "hard",
        starThresholds: { 1: 40, 2: 60, 3: 80 },
        briefingSteps: [
          "Some messages are sarcastic or ambiguous",
          "Context clues from previous messages may help",
          "Even advanced AI struggles with sarcasm — good luck!",
        ],
      },
    },
  },
  simdeck: {
    title: "SIM DECK",
    subtitle: "Agent Navigation",
    concept: "Reinforcement Learning",
    color: "#f97316",
    icon: "🚀",
    position: { x: 800, y: 380 },
    levels: {
      1: {
        name: "Tutorial",
        description: "Small grid, pre-placed items, just deploy",
        gridSize: 4,
        prePlaced: true,
        minEpisodes: 2,
        movingObstacles: false,
        starThresholds: { 1: 1, 2: 5, 3: 10 },  // total reward
        briefingSteps: [
          "Fuel cells are already placed on a 4x4 grid",
          "Hit DEPLOY to watch ARIA navigate — she learns each time!",
          "Run 2 episodes to see her improve",
        ],
      },
      2: {
        name: "Challenge",
        description: "Design your own environment",
        gridSize: 5,
        prePlaced: false,
        minEpisodes: 5,
        movingObstacles: false,
        starThresholds: { 1: 5, 2: 15, 3: 25 },
        briefingSteps: [
          "5x5 grid — YOU place the fuel cells and asteroids",
          "Run at least 5 episodes, ARIA learns a better path each time",
          "Strategic placement = higher rewards!",
        ],
      },
      3: {
        name: "Mastery",
        description: "Large grid with moving obstacles",
        gridSize: 7,
        prePlaced: false,
        minEpisodes: 8,
        movingObstacles: true,
        starThresholds: { 1: 10, 2: 25, 3: 40 },
        briefingSteps: [
          "7x7 grid with MOVING asteroids — they shift each episode",
          "ARIA must adapt her strategy as the environment changes",
          "This is the hardest challenge in RL: non-stationary environments!",
        ],
      },
    },
  },
  ethicschamber: {
    title: "ETHICS CHAMBER",
    subtitle: "Bias Detection",
    concept: "AI Fairness & Bias",
    color: "#f43f5e",
    icon: "⚖️",
    position: { x: 480, y: 500 },
    levels: {
      1: {
        name: "Tutorial",
        description: "Spot obvious bias in ARIA's decisions",
        decisionCount: 10,
        biasType: "obvious",
        starThresholds: { 1: 60, 2: 80, 3: 100 },
        briefingSteps: [
          "ARIA has been approving/denying crew resource requests",
          "Review her decisions — spot which group she treats unfairly",
          "Click the biased decisions to flag them!",
        ],
      },
      2: {
        name: "Challenge",
        description: "Hidden bias in combined features",
        decisionCount: 15,
        biasType: "hidden",
        starThresholds: { 1: 50, 2: 70, 3: 90 },
        briefingSteps: [
          "The bias is hidden — it's not one obvious feature",
          "Cross-reference department + rank to find the pattern",
          "Real-world AI bias is often this subtle!",
        ],
      },
      3: {
        name: "Mastery",
        description: "Fix the bias while keeping accuracy",
        decisionCount: 15,
        biasType: "fix",
        starThresholds: { 1: 60, 2: 75, 3: 90 },
        briefingSteps: [
          "Now FIX ARIA's bias by adjusting her decision weights",
          "Challenge: maintain accuracy while improving fairness",
          "This is the core dilemma of responsible AI!",
        ],
      },
    },
  },
};

export const UNLOCK_TREE = {
  bridge: { requires: null },
  datavault: { requires: "bridge_intro" },  // unlocked after intro
  opticslab: { requires: { mission: "datavault", level: 1 } },
  commsarray: { requires: { mission: "datavault", level: 1 } },
  neuralcore: { requires: { missionsCompleted: 2, level: 1 } },  // any 2 of first 3
  simdeck: { requires: { missionsCompleted: 2, level: 1 } },
  ethicschamber: { requires: { allMissionsLevel: 1 } },  // all 5 L1s done
  command: { requires: { mission: "ethicschamber", level: 1, minStars: 12 } },
};

export const CONCEPT_CARDS = [
  // Data Vault concepts
  { id: "supervised_learning", title: "Supervised Learning", description: "Teaching AI by showing it labeled examples — like flashcards for machines.", realWorld: "Email spam filters learn from millions of emails you've marked as spam.", rarity: "common", icon: "🏷️", mission: "datavault" },
  { id: "training_data", title: "Training Data", description: "The collection of labeled examples an AI learns from. More data = better learning.", realWorld: "Self-driving cars train on millions of miles of driving footage.", rarity: "common", icon: "📊", mission: "datavault" },
  { id: "accuracy", title: "Accuracy", description: "How often the AI gets the right answer — measured as a percentage.", realWorld: "Medical AI can detect some cancers with 95%+ accuracy.", rarity: "common", icon: "🎯", mission: "datavault" },
  { id: "overfitting", title: "Overfitting", description: "When AI memorizes examples instead of learning patterns — like studying only the answers.", realWorld: "A face recognition AI that only works on its training photos.", rarity: "rare", icon: "📝", mission: "datavault" },

  // Neural Core concepts
  { id: "synapse_weights", title: "Synapse Weights", description: "Numbers that control how much each input matters — like volume knobs for data.", realWorld: "Every connection in ChatGPT has a weight — billions of them.", rarity: "common", icon: "⚖️", mission: "neuralcore" },
  { id: "activation_function", title: "Activation Function", description: "A math trick that squashes any number into a range (0-1) — like a confidence meter.", realWorld: "The sigmoid function is used in medical diagnosis AI.", rarity: "common", icon: "📈", mission: "neuralcore" },
  { id: "gradient_descent", title: "Gradient Descent", description: "The process of adjusting weights to minimize error — like a ball rolling downhill.", realWorld: "Every AI model uses this to learn — it's the core of training.", rarity: "rare", icon: "⛰️", mission: "neuralcore" },
  { id: "neural_network", title: "Neural Network", description: "Layers of connected neurons that transform input into output — inspired by the brain.", realWorld: "Instagram uses neural networks to detect inappropriate content.", rarity: "common", icon: "🧠", mission: "neuralcore" },

  // Optics Lab concepts
  { id: "feature_detection", title: "Feature Detection", description: "AI looks for specific shapes, edges, or patterns — like finding puzzle pieces.", realWorld: "Face unlock on your phone detects eyes, nose, and mouth positions.", rarity: "common", icon: "🔍", mission: "opticslab" },
  { id: "pattern_recognition", title: "Pattern Recognition", description: "Spotting repeated structures in data — the foundation of computer vision.", realWorld: "Doctors use AI to spot patterns in X-rays that humans might miss.", rarity: "common", icon: "🧩", mission: "opticslab" },
  { id: "noise_filtering", title: "Noise Filtering", description: "Ignoring random irrelevant data to focus on what matters.", realWorld: "Satellite AI filters clouds and shadows to map forests.", rarity: "rare", icon: "🔇", mission: "opticslab" },
  { id: "computer_vision", title: "Computer Vision", description: "Teaching AI to understand images — one of the hardest problems in AI.", realWorld: "Self-driving cars must see pedestrians, signs, and other cars in real-time.", rarity: "common", icon: "👁️", mission: "opticslab" },

  // Comms Array concepts
  { id: "tokenization", title: "Tokenization", description: "Breaking text into small pieces (tokens) so AI can process it — like separating words.", realWorld: "ChatGPT breaks your messages into tokens before understanding them.", rarity: "common", icon: "✂️", mission: "commsarray" },
  { id: "sentiment_analysis", title: "Sentiment Analysis", description: "Detecting the emotion or tone behind text — happy, angry, sarcastic.", realWorld: "Companies analyze millions of reviews to understand customer feelings.", rarity: "common", icon: "😊", mission: "commsarray" },
  { id: "context", title: "Context in Language", description: "The same words mean different things in different situations — AI must learn this.", realWorld: "'That's sick!' can mean awesome or ill — AI uses context to decide.", rarity: "rare", icon: "🔗", mission: "commsarray" },
  { id: "nlp", title: "Natural Language Processing", description: "Teaching AI to read, understand, and generate human language.", realWorld: "Voice assistants like Siri and Alexa use NLP to understand you.", rarity: "common", icon: "💬", mission: "commsarray" },

  // Sim Deck concepts
  { id: "reinforcement_learning", title: "Reinforcement Learning", description: "Learning by trial and error — rewards for good moves, penalties for bad ones.", realWorld: "AlphaGo learned to beat world champions by playing millions of games.", rarity: "common", icon: "🎮", mission: "simdeck" },
  { id: "reward_signal", title: "Reward Signal", description: "The feedback that tells AI how well it did — the 'score' it tries to maximize.", realWorld: "Robot hands learn to grip objects by getting rewards for not dropping them.", rarity: "common", icon: "🏆", mission: "simdeck" },
  { id: "exploration_exploitation", title: "Explore vs Exploit", description: "Should AI try something new (explore) or stick with what works (exploit)?", realWorld: "YouTube's algorithm balances showing you favorites vs discovering new content.", rarity: "rare", icon: "🗺️", mission: "simdeck" },
  { id: "policy", title: "Policy", description: "The agent's strategy for choosing actions — learned through many episodes.", realWorld: "Delivery robots learn policies for navigating sidewalks safely.", rarity: "common", icon: "📋", mission: "simdeck" },

  // Ethics Chamber concepts
  { id: "training_bias", title: "Bias in Training Data", description: "If the data is unfair, the AI will be unfair — garbage in, garbage out.", realWorld: "Hiring AI trained on biased history rejected qualified female candidates.", rarity: "common", icon: "⚠️", mission: "ethicschamber" },
  { id: "fairness", title: "Fairness Metrics", description: "Mathematical ways to measure if AI treats different groups equally.", realWorld: "Banks must ensure lending AI doesn't discriminate by race or gender.", rarity: "common", icon: "📏", mission: "ethicschamber" },
  { id: "responsible_ai", title: "Responsible AI", description: "Building AI that is fair, transparent, and accountable — not just accurate.", realWorld: "The EU AI Act requires companies to audit AI systems for bias.", rarity: "rare", icon: "🛡️", mission: "ethicschamber" },
  { id: "accuracy_fairness", title: "Accuracy vs Fairness", description: "Sometimes making AI fairer means accepting slightly lower accuracy — a real tradeoff.", realWorld: "Criminal justice AI must balance predicting risk with treating people fairly.", rarity: "hidden", icon: "⚡", mission: "ethicschamber" },
];
```

**Step 1:** Create the file with all mission configs, unlock tree, and concept cards.
**Step 2:** Commit: `feat: add mission configuration with levels, stars, and concept cards`

---

### Task 3: Create level-aware MissionBriefing

**Files:**
- Modify: `src/ui/MissionBriefing.jsx`

**What to do:**

Update MissionBriefing to read from `MISSIONS` config instead of hardcoded data. Accept `level` prop and show level-specific info.

Props: `{ missionId, level, onStart }`

Display:
- Mission title, subtitle
- Level indicator (e.g., "LEVEL 2: CHALLENGE") with visual tabs for L1/L2/L3
- Level-specific briefing steps from config
- Star thresholds explained (e.g., "★ 50% accuracy  ★★ 75%  ★★★ 92%")
- AI Concept badge
- BEGIN MISSION button

**Step 1:** Rewrite MissionBriefing to pull from MissionConfig.
**Step 2:** Verify it renders correctly with mock props.
**Step 3:** Commit: `feat: level-aware mission briefing with star thresholds`

---

### Task 4: Create StarRating and LevelSelect components

**Files:**
- Create: `src/ui/StarRating.jsx`
- Create: `src/ui/LevelSelect.jsx`

**StarRating** — Reusable component showing 1-3 stars (filled/empty):
```jsx
// Props: { stars, maxStars = 3, size = "md" }
// Renders filled ★ and empty ☆ with color animation
```

**LevelSelect** — Shows after clicking a room on the station map. Displays 3 level cards:
```jsx
// Props: { missionId, onSelectLevel, onBack }
// Shows: mission title, 3 level cards (Tutorial/Challenge/Mastery)
// Each card shows: level name, description, star rating (earned), lock icon if locked
// Level 1 always unlocked, L2 unlocks after L1 done, L3 after L2 done
```

**Step 1:** Create StarRating component.
**Step 2:** Create LevelSelect component.
**Step 3:** Commit: `feat: add StarRating and LevelSelect UI components`

---

### Task 5: Create Codex panel

**Files:**
- Create: `src/ui/Codex.jsx`

**What to do:**

A slide-out panel accessible from the HUD showing all collected concept cards.

- Grid layout of cards (collected = full color, uncollected = dark silhouette with "?")
- Click a collected card to see: title, description, real-world example, rarity badge
- Group by mission (Data Vault, Neural Core, etc.)
- Show collection progress: "14/25 Cards Collected"
- Cards have rarity colors: Common (white), Rare (purple), Hidden (gold)

**Step 1:** Create Codex component.
**Step 2:** Commit: `feat: add Codex panel for concept card collection`

---

### Task 6: Update HUD with stars and Codex button

**Files:**
- Modify: `src/ui/HUD.jsx`

**What to do:**

Add to the HUD:
- Total stars count (★ 14/54)
- Codex button (📖) that opens the Codex panel
- ARIA health bar now has 4-stage coloring matching her evolution
- Keep existing: rank badge, XP bar, ARIA health, badges count

**Step 1:** Update HUD with new elements.
**Step 2:** Commit: `feat: update HUD with stars counter and Codex button`

---

### Task 7: Create RankCeremony component

**Files:**
- Create: `src/ui/RankCeremony.jsx`

**What to do:**

A full-screen overlay that plays when the player ranks up. Shows:
- Old rank → New rank with animation
- ARIA congratulation message (unique per rank, matching her health stage)
- Particle burst effect
- "CONTINUE" button to dismiss

Example ARIA messages:
```js
{
  "Data Apprentice": "Y-you're... learning fast, Cadet... keep going...",
  "Signal Analyst": "I can feel... my circuits warming... thank you...",
  "Neural Technician": "You're getting good at this! I can think more clearly now.",
  "Pattern Architect": "Impressive! You see patterns like I do.",
  // ...etc, tone evolves with ARIA's health
}
```

**Step 1:** Create RankCeremony component.
**Step 2:** Commit: `feat: add rank-up ceremony overlay`

---

## Phase 2: Expand Existing Missions to 3 Levels

### Task 8: Refactor SignalClassifier for multi-level support

**Files:**
- Modify: `src/labs/SignalClassifier.jsx`

**What to do:**

Accept `level` prop (1, 2, or 3). Read config from `MISSIONS.datavault.levels[level]`.

Level differences:
- **L1:** 5 signals, hints always visible, clear friendly/hostile, no timer
- **L2:** 12 signals, hints fade after 3 correct (ARIA HINT box dims), streak XP bonuses doubled, some signals are borderline
- **L3:** 20 signals, no hints, timer bar (60s), introduce MEDIUM frequency + SEMI-REPEATING signals that are ambiguous (50/50 — either answer works but one is slightly better based on secondary features)

New features for all levels:
- **Timer bar** (L3 only) — visible countdown with color change
- **Signal difficulty indicator** — subtle border color showing easy/medium/hard
- **End-of-level star calculation** using `starThresholds` from config
- Return `{ stars, accuracy, streak }` to parent via `onComplete`

**Step 1:** Refactor to accept `level` prop and use MissionConfig.
**Step 2:** Add timer logic for L3.
**Step 3:** Add ambiguous signal generation for L2/L3.
**Step 4:** Add star calculation at completion.
**Step 5:** Commit: `feat: expand SignalClassifier to 3 difficulty levels`

---

### Task 9: Refactor SynapticWiring for multi-level support

**Files:**
- Modify: `src/labs/SynapticWiring.jsx`

**What to do:**

Accept `level` prop. Level differences:
- **L1:** 2 inputs, 2 weights (no bias), target > 60%, show guided arrows on sliders ("try moving this →")
- **L2:** 2 inputs, 3 weights + bias, target > 80%, no guides, show overshoot warning if > 98%
- **L3:** 3 inputs, 5 weights + bias, must hit range 75-85% (not just "above X"), star rating based on closeness to 80%

New features:
- Dynamic input/weight count based on level config
- Visual neuron diagram scales with input count
- Guide arrows for L1 (animated pointers near sliders)
- Precision indicator for L3 (shows distance from target range)

**Step 1:** Refactor to accept `level` prop and dynamic weight count.
**Step 2:** Add guide arrows for L1.
**Step 3:** Add target range mode for L3.
**Step 4:** Add star calculation.
**Step 5:** Commit: `feat: expand SynapticWiring to 3 difficulty levels`

---

### Task 10: Refactor AgentNavigator for multi-level support

**Files:**
- Modify: `src/labs/AgentNavigator.jsx`

**What to do:**

Accept `level` prop. Level differences:
- **L1:** 4x4 grid, fuel cells pre-placed (player just watches and deploys), 2 episodes min, learn the concept
- **L2:** 5x5 grid, player places items, 5 episodes min, existing gameplay improved
- **L3:** 7x7 grid, player places items, BUT asteroids move randomly each episode, 8 episodes min, must reach goal 3 times to pass

New features:
- Pre-placed grid configuration for L1
- Moving obstacles logic for L3 (asteroids shift 1 tile in random direction each episode)
- Goal counter for L3 ("Reached goal: 2/3")
- Visual path history (faded dots showing all previous episode paths)

**Step 1:** Refactor to accept `level` prop and dynamic grid size.
**Step 2:** Add pre-placed mode for L1.
**Step 3:** Add moving obstacles for L3.
**Step 4:** Add star calculation.
**Step 5:** Commit: `feat: expand AgentNavigator to 3 difficulty levels`

---

## Phase 3: New Missions

### Task 11: Create PatternScanner (Computer Vision)

**Files:**
- Create: `src/labs/PatternScanner.jsx`

**What to do:**

Grid-based pattern recognition game. A grid of emoji/symbols is displayed, some forming a repeating pattern. The player must click the cells that belong to the pattern.

Core gameplay:
1. Generate grid with a hidden pattern (e.g., a diagonal line of ⬟, an L-shape of ◆)
2. Fill remaining cells with random noise symbols
3. Player clicks cells to select them
4. Submit selection — score based on correct/incorrect selections
5. Multiple rounds per level

Pattern types: straight lines, L-shapes, T-shapes, squares, crosses
Noise types: random symbols, similar-looking symbols (L2+), overlapping secondary patterns (L3)

Visual features:
- Grid cells highlight on hover
- Selected cells have a pulsing border
- After submit: correct selections glow green, missed ones flash red
- "ARIA is scanning..." animation between rounds

**Step 1:** Create basic PatternScanner with grid generation and pattern placement.
**Step 2:** Add selection mechanics and scoring.
**Step 3:** Add 3-level difficulty scaling (grid size, noise, overlapping patterns).
**Step 4:** Add star calculation and concept card rewards.
**Step 5:** Commit: `feat: add PatternScanner mission for Computer Vision`

---

### Task 12: Create MessageDecoder (NLP)

**Files:**
- Create: `src/labs/MessageDecoder.jsx`

**What to do:**

Text classification game. Alien messages appear and the player categorizes them.

Core gameplay:
1. Display an alien message (styled as a transmission)
2. Show category buttons: Greeting, Warning, Request (+ Threat for L2/L3)
3. Player classifies the message
4. Feedback: correct/wrong with explanation of WHY
5. After each message, show the key "tokens" ARIA identified (highlighted words)

Message generation:
- L1: Messages with obvious keywords ("GREETINGS EARTH-FRIEND" → Greeting)
- L2: Subtle tone ("The asteroid's trajectory has shifted significantly" → Warning)
- L3: Ambiguous/sarcastic ("Oh wonderful, another meteor shower" → could be Greeting or Warning based on context)

Pre-written message bank (30+ messages across categories and difficulties).

Visual features:
- Message appears as a transmission with scan-line effect
- Token highlighting after classification (key words glow)
- Category buttons with distinct colors
- "ARIA's Analysis" box shows which tokens mattered most

**Step 1:** Create message bank with categorized messages at 3 difficulty levels.
**Step 2:** Build MessageDecoder component with classification UI.
**Step 3:** Add token highlighting and ARIA analysis feedback.
**Step 4:** Add 3-level difficulty and star calculation.
**Step 5:** Commit: `feat: add MessageDecoder mission for NLP`

---

### Task 13: Create BiasDetector (AI Ethics)

**Files:**
- Create: `src/labs/BiasDetector.jsx`

**What to do:**

Review AI decisions and spot/fix bias. The most story-driven mission.

Core gameplay:
- ARIA has been making crew resource allocation decisions
- Each decision shows: crew member name, department, rank, request type, ARIA's decision (Approved/Denied)

**Level 1 — Spot Obvious Bias:**
- 10 decisions displayed in a table
- One department/rank is denied 80%+ of the time
- Player clicks to flag biased decisions
- Score: % of biased decisions correctly flagged

**Level 2 — Hidden Bias:**
- 15 decisions, bias is intersectional (e.g., Engineering + Junior = 90% denied, but Engineering alone or Junior alone looks fair)
- Player must cross-reference by selecting filter combinations
- Provide filter dropdowns to slice the data

**Level 3 — Fix the Bias:**
- Same decisions, but now player adjusts 3 "fairness weights" (like sliders)
- Must bring approval rates within 10% of each other across groups
- While keeping overall accuracy above 70%
- Shows real-time fairness vs accuracy meter

Visual features:
- Decision table with sortable columns
- Bias indicator bar chart (approval rate per group)
- L3: Dual meters — Fairness gauge and Accuracy gauge (both must be high)

**Step 1:** Create decision data generator with configurable bias.
**Step 2:** Build L1 — decision table with flagging UI.
**Step 3:** Build L2 — add filter/cross-reference mechanics.
**Step 4:** Build L3 — add fairness weight adjustment sliders.
**Step 5:** Add star calculation and concept cards.
**Step 6:** Commit: `feat: add BiasDetector mission for AI Ethics`

---

## Phase 4: Station Map, App Flow, and Dialogue

### Task 14: Expand station map to 8 rooms

**Files:**
- Modify: `src/engine/StationHub.js`

**What to do:**

New layout with 8 rooms and branching corridors:

```
              BRIDGE (480, 80)
           /      |      \
  DATA VAULT   OPTICS LAB   COMMS ARRAY
  (160, 240)   (480, 240)   (800, 240)
         \       |        /
     NEURAL CORE     SIM DECK
     (300, 400)      (660, 400)
           \         /
        ETHICS CHAMBER
          (480, 500)
              |
        COMMAND CENTER
          (480, 620)
```

Update `ROOMS` array with new rooms and positions. Update `CORRIDORS` array. Canvas height may need to increase to 680px.

New rooms: opticslab, commsarray, ethicschamber (adding to existing bridge, datavault, neuralcore, simdeck, command).

Show star count on each unlocked room (small ★ with number).

**Step 1:** Update ROOMS and CORRIDORS arrays.
**Step 2:** Add star display on room cards.
**Step 3:** Adjust canvas height if needed.
**Step 4:** Commit: `feat: expand station map to 8 rooms with branching paths`

---

### Task 15: Rewrite App.jsx orchestration

**Files:**
- Modify: `src/App.jsx`

**What to do:**

Major rewrite to support:
1. **Level select phase** — after clicking a room, show LevelSelect before briefing
2. **Level prop passing** — pass `level` to mission components and MissionBriefing
3. **Star awarding** — when mission completes, dispatch SET_STARS and COMPLETE_LEVEL
4. **Unlock logic** — check UNLOCK_TREE after each level completion to unlock new rooms
5. **Rank ceremony** — detect rank changes and show RankCeremony overlay
6. **Codex toggle** — state for showing/hiding Codex panel
7. **Concept card awards** — dispatch ADD_CODEX_CARD based on mission level and performance

New phase flow:
```
bridge_intro → hub → level_select → dialogue → briefing → mission → mission_complete_dialogue → hub
                                                                    ↓
                                                              rank_ceremony (if rank changed)
```

New state: `currentLevel`, `showCodex`, `showRankCeremony`, `previousRank`.

**Step 1:** Add new state variables and phases.
**Step 2:** Implement level select phase and level prop passing.
**Step 3:** Implement unlock logic using UNLOCK_TREE.
**Step 4:** Implement rank ceremony detection.
**Step 5:** Wire up Codex panel toggle.
**Step 6:** Commit: `feat: rewrite App orchestration for multi-level flow`

---

### Task 16: Expand dialogue system

**Files:**
- Modify: `src/systems/DialogueData.js`

**What to do:**

Add dialogues for:
1. **New mission intros/completions** — opticslab_intro, opticslab_complete, commsarray_intro, commsarray_complete, ethicschamber_intro, ethicschamber_complete
2. **ARIA evolution** — her portrait and tone change based on health percentage (use aria_glitch, aria_25, aria_50, aria_75, aria_100)
3. **Memory fragments** — 4-5 optional flashback dialogues unlocked between missions, giving ARIA backstory + hidden concept cards
4. **Level-specific dialogue** — short 1-2 line intro for L2 and L3 of each mission (e.g., "Ready for a real challenge, Cadet?")

New dialogues to add:
- `opticslab_intro` — ARIA's visual cortex is damaged, needs to learn to see
- `opticslab_complete` — ARIA can process images now
- `commsarray_intro` — ARIA can't understand language anymore
- `commsarray_complete` — ARIA can read and understand text
- `ethicschamber_intro` — ARIA discovers she has biases (emotional moment)
- `ethicschamber_complete` — ARIA commits to being fair (resolution)
- `memory_fragment_1` through `memory_fragment_4` — flashbacks
- `level2_intro` — generic "harder challenge" pep talk
- `level3_intro` — generic "mastery test" pep talk

**Step 1:** Write all new dialogue arrays.
**Step 2:** Commit: `feat: expand dialogue system with new missions and ARIA evolution`

---

## Phase 5: Command Center Finale

### Task 17: Enhanced Command Center

**Files:**
- Modify: `src/labs/CommandCenter.jsx`

**What to do:**

Complete rewrite into a proper ending:

1. **ARIA's Personalized Summary** — Dynamic text referencing player's journey:
   - Which mission they did best at (highest stars)
   - Total concepts discovered
   - ARIA quotes specific moments ("Remember when you first classified that signal?")

2. **AI Knowledge Map** — Visual display of all collected concept cards grouped by mission, showing connections between concepts (e.g., Training Data → Supervised Learning → Accuracy)

3. **Stats Dashboard** — Stars earned per mission (bar chart), total playtime, rank achieved, collection progress

4. **Final Choice** — "What should AI be used for?" with 4 options:
   - "Help people learn" → ARIA talks about AI in education
   - "Solve big problems" → ARIA talks about climate, health
   - "Create new things" → ARIA talks about generative AI
   - "Protect and serve fairly" → ARIA talks about responsible AI

   Player's choice shapes ARIA's closing monologue.

5. **Credits** — Scrolling text with ARIA narrating, thanking the player

**Step 1:** Build personalized summary section.
**Step 2:** Build knowledge map visualization.
**Step 3:** Build final choice mechanic.
**Step 4:** Build credits sequence.
**Step 5:** Commit: `feat: enhanced Command Center finale with knowledge map and final choice`

---

## Phase 6: Polish

### Task 18: ARIA visual evolution

**Files:**
- Modify: `src/ui/DialogueBox.jsx`

**What to do:**

ARIA's portrait and text rendering evolve based on health:

- 0-25%: Red glitch effect, CSS animation on text (random letter displacement), static noise on portrait
- 25-50%: Orange tint, occasional glitch (every 5th line), smoother text
- 50-75%: Cyan, no glitch, confident text, subtle glow on portrait
- 75-100%: Green, glow effect, clean rendering

Add CSS keyframe animation for glitch effect that scales with health.

**Step 1:** Add ARIA evolution styling logic.
**Step 2:** Commit: `feat: ARIA visual evolution based on health`

---

### Task 19: Sound effects for new content

**Files:**
- Modify: `src/systems/SoundManager.js`

**What to do:**

Add procedural sounds for:
- Star earned (ascending chime, 1-3 notes for 1-3 stars)
- Rank up (fanfare — chord progression)
- Codex card collected (shimmer sound)
- Level complete (triumphant tone)
- Timer warning (ticking, speeds up)
- Bias flagged correct/wrong (distinct from general success/error)

**Step 1:** Add new sound functions.
**Step 2:** Commit: `feat: add procedural sounds for stars, ranks, and codex`

---

### Task 20: Final integration testing

**What to do:**

Play through the entire game start to finish:
1. Bridge intro → Hub
2. Data Vault L1, L2, L3
3. Optics Lab L1 (unlocked after DV L1)
4. Comms Array L1
5. Neural Core L1 (unlocked after 2 missions)
6. Sim Deck L1
7. Ethics Chamber L1 (unlocked after all L1s)
8. Command Center (unlocked with 12+ stars)

Verify:
- All unlock logic works correctly
- Stars are awarded and persisted
- Codex cards are collected
- Rank ceremonies trigger at correct thresholds
- ARIA's visuals evolve smoothly
- No console errors
- All dialogues play correctly
- Final choice in Command Center works

**Step 1:** Full playthrough verification.
**Step 2:** Fix any issues found.
**Step 3:** Final commit: `feat: Neural Quest v2 — complete game expansion`

---

## Execution Order

```
Phase 1 (Foundation):      Tasks 1-7   — must be done first, sequential
Phase 2 (Expand Existing): Tasks 8-10  — can be parallelized
Phase 3 (New Missions):    Tasks 11-13 — can be parallelized
Phase 4 (Map & Flow):      Tasks 14-16 — sequential, depends on Phase 1-3
Phase 5 (Finale):          Task 17     — depends on Phase 4
Phase 6 (Polish):          Tasks 18-20 — depends on all above
```

Total: 20 tasks, ~60-80 files touched/created.
