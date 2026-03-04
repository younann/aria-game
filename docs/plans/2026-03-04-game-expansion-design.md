# Neural Quest — Game Expansion Design

## Overview

Expand Neural Quest from a 5-minute demo into a 45-60 minute educational game that teaches AI/ML fundamentals to kids aged 8-16. More missions, deeper gameplay, progression systems, and an evolving story.

## Current State

- 3 short missions + Command Center finale
- Linear progression, ~5 minute playthrough
- Concepts: Supervised Learning, Neural Networks, Reinforcement Learning
- Simple XP/rank/achievement system

## Target State

- 6 missions x 3 levels = 18 playable levels
- ~25 collectible AI concept cards
- Star-based progression with branching unlock path
- Evolving ARIA story across 4 stages
- Estimated playtime: 45-60 minutes

---

## 1. Mission Structure Overhaul

Every mission has 3 levels of progressive difficulty:

| Level | Name | Purpose |
|-------|------|---------|
| Tutorial | Learn with heavy guidance, hints visible, slow pace |
| Challenge | Apply with less help, hints fade, faster pace, streak bonuses |
| Mastery | Test deep understanding, no hints, ambiguous inputs, time pressure |

Each level awards 1-3 stars based on performance. Stars gate progression.

Between levels, ARIA delivers a "what you just learned" explanation connecting gameplay to real AI/ML.

### Star Ratings

- 1 star: Complete the level
- 2 stars: Meet performance threshold (80% accuracy, output > 90%, etc.)
- 3 stars: Bonus objective (perfect score, no hints, hidden pattern found)

---

## 2. Missions & AI Concepts

### Existing Missions (Expanded to 3 levels each)

#### Mission 1: Signal Classifier (Data Vault)
**Concept: Supervised Learning**
- L1 Tutorial: 5 signals, hints always visible, clear friendly/hostile patterns
- L2 Challenge: 12 signals, hints fade after 3 correct, streak XP bonuses, faster pace
- L3 Mastery: 20 signals, no hints, ambiguous signals (MEDIUM frequency, SEMI-REPEATING), time pressure

#### Mission 2: Synaptic Wiring (Neural Core)
**Concept: Neural Networks**
- L1 Tutorial: 2 weights only (no bias), target > 60%, guided slider suggestions
- L2 Challenge: 3 weights + bias, target > 80%, introduce concept of overshoot
- L3 Mastery: 5 inputs/weights, target a specific range (75-85%), teaches precision over maximization

#### Mission 5: Agent Navigator (Sim Deck)
**Concept: Reinforcement Learning**
- L1 Tutorial: 4x4 grid, pre-placed fuel cells, just deploy and watch
- L2 Challenge: 5x5 grid, place your own items, 5 episodes minimum
- L3 Mastery: 7x7 grid, moving obstacles, ARIA must reach goal 3 times to pass

### New Missions

#### Mission 3: Pattern Scanner (Optics Lab)
**Concept: Computer Vision**

Gameplay: A noisy grid of symbols/shapes. The player must identify which pattern ARIA should learn to recognize. Teaches how AI "sees" by breaking images into features.

- L1: Clear patterns in 4x4 grid, highlight matching shapes
- L2: 6x6 grid with noise (random extra symbols), find the repeating pattern
- L3: 8x8 grid, multiple overlapping patterns, identify the target one among distractors

**Concepts taught:** Feature detection, pattern recognition, noise vs signal, convolutional filters (simplified)

#### Mission 4: Message Decoder (Comms Array)
**Concept: Natural Language Processing**

Gameplay: Alien messages arrive with different tones. Player classifies them by intent (Request, Warning, Greeting, Threat). Teaches how AI understands language.

- L1: Short messages with obvious keywords ("DANGER", "HELLO"), classify 8 messages
- L2: Longer messages, subtle tone differences, no obvious keywords, 12 messages
- L3: Ambiguous messages where context matters, some are sarcasm/irony, 15 messages

**Concepts taught:** Tokenization, sentiment analysis, context, ambiguity in language

#### Mission 6: Bias Detector (Ethics Chamber)
**Concept: AI Fairness & Bias**

Gameplay: ARIA has been making automated decisions (approving/denying crew requests). Player reviews her decisions and spots unfair patterns — e.g., she denies requests from certain crew ranks or departments more often.

- L1: Obvious bias — one group denied 90% of the time, guided walkthrough
- L2: Subtle bias — hidden in combined features, player must cross-reference
- L3: Fix the bias — player adjusts ARIA's decision weights to achieve fairness while maintaining accuracy

**Concepts taught:** Training data bias, fairness metrics, the tension between accuracy and fairness, responsible AI

This mission is the emotional climax — ARIA realizes she has biases and asks for help.

---

## 3. Station Map & Unlock Path

```
                    [BRIDGE] (intro)
                   /    |    \
            [DATA VAULT] [OPTICS LAB] [COMMS ARRAY]
                   \    |    /
                [NEURAL CORE]  [SIM DECK]
                   \         /
                 [ETHICS CHAMBER]
                       |
                  [COMMAND CENTER] (finale)
```

- Bridge intro unlocks Data Vault
- After Data Vault L1, unlock Optics Lab and Comms Array (player chooses order)
- After completing 2 of first 3 missions (all L1), unlock Neural Core and Sim Deck
- After completing all L1s (6 missions), unlock Ethics Chamber
- After Ethics Chamber, unlock Command Center
- L2 and L3 of each mission unlock after completing L1

Minimum star requirement for Command Center: 12 stars (out of 54 possible).

---

## 4. Progression System

### AI Concept Cards (~25 total)

Collectible cards earned through gameplay and exploration.

Each card has:
- Name (e.g., "Overfitting")
- Icon/emoji
- Kid-friendly explanation (1 sentence)
- Real-world example (1 sentence)
- Rarity: Common (gameplay), Rare (bonus objectives), Hidden (dialogue/exploration)

Cards are viewable in a Codex panel accessible from the HUD.

Example cards:
- Training Data (Common): "The examples an AI learns from — like flashcards for machines. Used in: spam filters learning from millions of emails."
- Overfitting (Rare): "When AI memorizes the examples instead of learning the pattern — like studying only the answers, not the concepts. Problem in: medical AI trained on too few X-rays."
- Bias (Common): "When AI treats groups unfairly because of patterns in its training data. Found in: hiring algorithms that preferred one gender."
- Tokenization (Common): "Breaking text into small pieces so AI can process it — like separating a sentence into words. Used in: ChatGPT reading your messages."

### Rank System (10 ranks)

| Stars | Rank |
|-------|------|
| 0 | Cadet Recruit |
| 3 | Data Apprentice |
| 6 | Signal Analyst |
| 10 | Neural Technician |
| 15 | Pattern Architect |
| 20 | Algorithm Specialist |
| 26 | Ethics Guardian |
| 33 | AI Researcher |
| 40 | Chief Scientist |
| 48+ | Prometheus Legend |

Rank-ups trigger a ceremony — ARIA congratulates with a unique line reflecting her healing progress.

### ARIA Health

Progresses in ~5% increments per level completed (18 levels × ~5% ≈ 90%, final 10% from Command Center finale). Her portrait, dialogue tone, and glitch effects evolve smoothly.

---

## 5. ARIA's Evolution

| Health | Stage | Dialogue Style | Visual Effect |
|--------|-------|---------------|--------------|
| 0-25% | Broken | Glitchy, fragmented, scared | Red glitch, stuttering text |
| 25-50% | Recovering | Curious, grateful, asks questions | Orange, occasional glitch |
| 50-75% | Learning | Confident, teaches back to player | Cyan, smooth |
| 75-100% | Awakened | Wise, philosophical about AI | Green, glowing |

### Memory Fragments

Between missions, ARIA shares optional flashback moments from before the storm. These reward curious players with deeper story AND hidden concept cards.

---

## 6. Command Center Finale

Expanded from a stats screen into a proper ending:

1. ARIA gives a personalized summary referencing the player's journey
2. All collected concept cards displayed as a visual "AI Knowledge Map"
3. Stats: stars earned, concepts discovered, rank achieved
4. A final dialogue choice: "What should AI be used for?" — shapes ARIA's closing monologue about responsible AI
5. Credits roll with ARIA's voice narrating what the player built

---

## 7. Technical Scope

### New files to create:
- `src/labs/PatternScanner.jsx` — Computer Vision mission
- `src/labs/MessageDecoder.jsx` — NLP mission
- `src/labs/BiasDetector.jsx` — Ethics mission
- `src/ui/Codex.jsx` — Concept card collection viewer
- `src/ui/StarRating.jsx` — Star display component
- `src/ui/LevelSelect.jsx` — Per-mission level selector
- `src/ui/RankCeremony.jsx` — Rank-up animation
- `src/systems/MissionLevels.js` — Level configs, star thresholds, unlock logic

### Files to modify:
- `src/systems/GameState.jsx` — Stars, codex cards, level progress, unlock tree
- `src/systems/DialogueData.js` — Expanded dialogues, ARIA evolution, memory fragments
- `src/engine/StationHub.js` — 8-room map layout, branching corridors
- `src/App.jsx` — Level select flow, Codex access, rank ceremonies
- `src/ui/HUD.jsx` — Stars display, Codex button, ARIA health granularity
- `src/ui/MissionBriefing.jsx` — Level-specific briefings with per-level instructions
- `src/labs/SignalClassifier.jsx` — 3 levels with difficulty scaling
- `src/labs/SynapticWiring.jsx` — 3 levels with progressive complexity
- `src/labs/AgentNavigator.jsx` — 3 levels with grid size scaling
- `src/labs/CommandCenter.jsx` — Knowledge map, personalized ending, final choice
