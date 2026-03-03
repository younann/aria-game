# Neural Quest RPG Redesign

## Overview

Transform the existing Neural Quest educational web app into a full 2D RPG game that teaches AI/ML concepts to kids aged 10-15. Replace the corporate cyberpunk aesthetic with an engaging pixel-art space adventure powered by PixiJS.

## Narrative

**Setting:** ISS Prometheus, a deep-space research station. The station's main AI, ARIA (Adaptive Research Intelligence Agent), has been damaged by a cosmic storm.

**Player:** Cadet Nova, a 13-year-old recruit.

**Mission:** Rebuild ARIA module by module, learning how AI works along the way.

**ARIA Arc:** Starts as a glitchy hologram (static, broken speech). Evolves visually and verbally as the player completes missions. At 0% repair she's barely visible static. At 100% she's a fully rendered character with personality and expressions.

## Tech Stack

- **PixiJS** - 2D WebGL game rendering (station hub, sprites, particles, room scenes)
- **Howler.js** - Audio/SFX
- **Framer Motion** - React UI animations (already installed)
- **React 19 + Vite 7** - App framework (already installed)
- Drop **lucide-react** in favor of pixel-art icons

## Architecture

Dual-layer rendering:
- **PixiJS Canvas** - game world (station hub, room backgrounds, character sprites, particle effects, ARIA hologram)
- **React Overlay** - UI elements on top (dialogue boxes, XP bar, mission briefings, interactive educational labs)

They communicate through shared game state.

### File Structure

```
src/
├── engine/
│   ├── GameCanvas.jsx        - PixiJS canvas wrapper
│   ├── StationHub.js         - Hub world scene (rooms, doors, ambient animations)
│   ├── SpriteManager.js      - Load/manage sprite sheets & textures
│   └── ParticleEffects.js    - Stars, sparks, glitch effects, warp trails
├── characters/
│   ├── Cadet.js              - Player character sprite & movement
│   └── ARIA.js               - AI companion (hologram states, animations)
├── scenes/
│   ├── BridgeScene.js        - Intro mission scene
│   ├── DataVaultScene.js     - Training lab game scene
│   ├── NeuralCoreScene.js    - Neural network game scene
│   ├── SimDeckScene.js       - RL grid game scene
│   └── CommandCenterScene.js - Finale scene
├── ui/
│   ├── DialogueBox.jsx       - RPG-style text box with typewriter effect
│   ├── HUD.jsx               - XP bar, rank badge, minimap, ARIA status
│   ├── MissionBriefing.jsx   - Pre-mission story panel
│   ├── AchievementPopup.jsx  - Toast notifications for unlocks
│   └── StationMap.jsx        - Visual progress map of rooms
├── systems/
│   ├── GameState.js          - Central state (XP, rank, unlocks, ARIA health)
│   ├── DialogueData.js       - All dialogue scripts
│   ├── AchievementSystem.js  - Achievement definitions & tracking
│   └── SoundManager.js       - SFX & ambient audio via Howler.js
├── labs/
│   ├── SignalClassifier.jsx  - Reimagined TrainingLab (classify alien signals)
│   ├── SynapticWiring.jsx    - Reimagined NeuralLab (rewire ARIA's brain)
│   └── AgentNavigator.jsx    - Reimagined RL Lab (asteroid navigation)
├── App.jsx                   - Root: manages scene transitions
├── main.jsx
└── index.css
```

## Station Hub (5 Rooms)

1. **Bridge** (Welcome) - Meet commander, receive mission briefing via dialogue
2. **Data Vault** (Training Lab) - Repair ARIA's memory by classifying alien signals
3. **Neural Core** (Neural Lab) - Rewire ARIA's brain by tuning synaptic connections
4. **Simulation Deck** (RL Lab) - Test ARIA in virtual environments
5. **Command Center** (Expert) - ARIA comes online, graduation ceremony

Rooms are clickable in the hub. Locked rooms glow and unlock as the player progresses.

## RPG Progression

### XP & Ranks

Kids earn XP for correct classifications, weight adjustments, completing missions. Bonus XP for streaks, speed, and discovering hidden concepts.

| Rank | XP Required | Unlocked After |
|------|-------------|----------------|
| Cadet Recruit | 0 | Start |
| Signal Operator | 100 | Data Vault |
| Neural Technician | 300 | Neural Core |
| Simulation Pilot | 600 | Sim Deck |
| AI Commander | 1000 | Command Center |
| Prometheus Legend | 1500 | Hidden (completionist) |

### ARIA Health System

- Repair Progress bar (0-100%)
- Each completed mission restores ~20%, bonus actions restore extra
- Visual evolution at 0%, 25%, 50%, 75%, 100%

### Achievements (~15 total)

- "First Contact" - Classify first signal correctly
- "Perfect Epoch" - 100% accuracy in a training round
- "Weight Wizard" - Push sigmoid output above 95%
- "Pathfinder" - Guide agent to goal on first try
- "ARIA's Voice" - Fully repair ARIA
- Mix of easy, medium, and hidden achievements

### Dialogue System

- RPG-style text box at bottom with character portrait
- Typewriter text effect, press to advance
- Branching choices at key moments (both valid, teaches trade-offs)
- ARIA's dialogue coherence improves with repair progress

## Mission Designs

### Mission 1: Data Vault - "Alien Signal Classifier"

Intercepting alien transmissions on a radar screen. Signals appear as PixiJS animated waveforms with visual features (color, frequency, pattern). Drag signals into FRIENDLY or HOSTILE bins on a conveyor belt. Timer pressure + combo streaks for bonus XP. ARIA gives glitchy hints that improve as you classify correctly.

**Teaches:** supervised learning, labeling, epochs, accuracy

### Mission 2: Neural Core - "Rewire ARIA's Brain"

Neural network visualized as glowing wires inside ARIA's head (PixiJS rendered). Particles flow along wires reflecting weight values. Drag wire connectors to adjust weights instead of plain sliders. Output neuron is ARIA's eye that glows green/yellow/red based on sigmoid output. Finding the right weights triggers ARIA "wake up" animation.

**Teaches:** weights, bias, activation functions, gradient descent

### Mission 3: Simulation Deck - "Asteroid Navigation"

5x5 grid becomes a PixiJS space field with asteroids (obstacles) and fuel cells (rewards). ARIA is a small ship sprite being trained to navigate. Place fuel cells and asteroids, watch ARIA's pathfinding episodes with thruster animations. Each episode shows ARIA's "thinking" via dotted lines for considered paths.

**Teaches:** reinforcement learning, rewards, policies, exploration vs exploitation

### Mission 4: Command Center - "ARIA Online"

Cinematic sequence where ARIA's hologram assembles fully and delivers a speech. Interactive "AI in the real world" showcase with holographic scenes. Player receives final rank and certificate with stats.

## Visual Design

- **Pixel-art sprites** (16-bit aesthetic) for characters and station
- **Top-down hub** with animated details: blinking consoles, floating holograms, airlock steam
- **Distinct room palettes:** Bridge=blue, Data Vault=green, Neural Core=purple, Sim Deck=orange, Command=gold
- **ARIA glitch shader** in PixiJS that smooths as she's repaired
- **Particle effects:** ambient star field, sparks, data streams, XP orbs, rank-up explosions
- **Chunky colorful game UI** - thick borders, rounded corners, bold colors, large readable fonts
- **Animated button hover states** with sound feedback

## Audio Design (Howler.js)

- Ambient space hum in the hub
- Beeps/chirps for UI interactions
- Success jingle for correct answers
- Rank-up fanfare
- ARIA's "voice" - synthesized tones evolving from static to melodic
- No voice acting

## Navigation

useState-based scene management (no router). Scene transitions handled by App.jsx with Framer Motion animations.
