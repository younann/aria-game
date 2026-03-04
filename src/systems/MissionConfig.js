export const MISSIONS = {
  datavault: {
    title: "DATA VAULT",
    subtitle: "Signal Classification",
    concept: "Supervised Learning",
    color: "#10b981",
    icon: "📡",
    position: { x: 160, y: 220 },
    levels: {
      1: {
        name: "Tutorial",
        description: "Learn to classify signals with full guidance",
        signalCount: 5,
        hintsVisible: true,
        timeLimit: null,
        starThresholds: { 1: 60, 2: 80, 3: 100 },
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
        hintsVisible: "fade",
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
        timeLimit: 60,
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
        starThresholds: { 1: 60, 2: 75, 3: 90 },
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
        starThresholds: { 1: 70, 2: 78, 3: 82 },
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
        starThresholds: { 1: 1, 2: 2, 3: 3 },
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
        starThresholds: { 1: 1, 2: 5, 3: 10 },
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
  datavault: { requires: "bridge_intro" },
  opticslab: { requires: { mission: "datavault", level: 1 } },
  commsarray: { requires: { mission: "datavault", level: 1 } },
  neuralcore: { requires: { missionsCompleted: 2, level: 1 } },
  simdeck: { requires: { missionsCompleted: 2, level: 1 } },
  ethicschamber: { requires: { allMissionsLevel: 1 } },
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

/**
 * Build locale-aware missions object.
 * Overlays translated title, subtitle, concept, level names/descriptions/briefingSteps.
 * Structural data (colors, thresholds, gridSize, etc.) is preserved from MISSIONS.
 */
export function getMissions(t) {
  const result = {};
  for (const [id, mission] of Object.entries(MISSIONS)) {
    const levels = {};
    for (const [lvl, levelData] of Object.entries(mission.levels)) {
      const briefingSteps = levelData.briefingSteps.map(
        (_, si) => t(`missions.${id}.levels.${lvl}.briefingSteps.${si}`)
      );
      levels[lvl] = {
        ...levelData,
        name: t(`missions.${id}.levels.${lvl}.name`),
        description: t(`missions.${id}.levels.${lvl}.description`),
        briefingSteps,
      };
    }
    result[id] = {
      ...mission,
      title: t(`missions.${id}.title`),
      subtitle: t(`missions.${id}.subtitle`),
      concept: t(`missions.${id}.concept`),
      levels,
    };
  }
  return result;
}

/**
 * Build locale-aware concept cards.
 * Overlays translated title, description, realWorld.
 * Structural data (id, rarity, icon, mission) is preserved.
 */
export function getConceptCards(t) {
  return CONCEPT_CARDS.map((card) => ({
    ...card,
    title: t(`cards.${card.id}.title`),
    description: t(`cards.${card.id}.description`),
    realWorld: t(`cards.${card.id}.realWorld`),
  }));
}
