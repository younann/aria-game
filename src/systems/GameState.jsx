import React, { createContext, useContext, useReducer } from "react";

const initialState = {
  scene: "bridge",
  playerName: "",
  lang: "en",
  xp: 0,
  totalStars: 0,
  stars: {},
  levelComplete: {},
  rank: "Cadet Recruit",
  ariaHealth: 0,
  unlockedRooms: ["bridge"],
  unlockedLevels: {},
  achievements: [],
  codex: [],
  discoveredConcepts: [],
  dialogueQueue: [],
  missionResults: {},
};

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

function getRank(totalStars) {
  let rank = RANKS[0].name;
  for (const r of RANKS) {
    if (totalStars >= r.stars) rank = r.name;
  }
  return rank;
}

function calcTotalStars(starsObj) {
  let total = 0;
  for (const mission of Object.values(starsObj)) {
    for (const count of Object.values(mission)) {
      total += count;
    }
  }
  return total;
}

function countCompletedLevels(levelCompleteObj) {
  let count = 0;
  for (const mission of Object.values(levelCompleteObj)) {
    for (const done of Object.values(mission)) {
      if (done) count += 1;
    }
  }
  return count;
}

function gameReducer(state, action) {
  switch (action.type) {
    case "SET_SCENE":
      return { ...state, scene: action.payload };

    case "ADD_XP": {
      const newXp = state.xp + action.payload;
      return { ...state, xp: newXp, rank: getRank(state.totalStars) };
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
      if (state.discoveredConcepts.find((c) => c.title === action.payload.title)) return state;
      return { ...state, discoveredConcepts: [...state.discoveredConcepts, action.payload] };

    case "SET_MISSION_RESULT":
      return {
        ...state,
        missionResults: {
          ...state.missionResults,
          [action.payload.mission]: action.payload.result,
        },
      };

    case "SET_STARS": {
      const { mission, level, stars } = action.payload;
      const missionStars = state.stars[mission] || {};
      const existing = missionStars[level] || 0;
      if (stars <= existing) return state;
      const newMissionStars = { ...missionStars, [level]: stars };
      const newStars = { ...state.stars, [mission]: newMissionStars };
      const newTotalStars = calcTotalStars(newStars);
      return {
        ...state,
        stars: newStars,
        totalStars: newTotalStars,
        rank: getRank(newTotalStars),
      };
    }

    case "COMPLETE_LEVEL": {
      const { mission, level } = action.payload;
      const missionComplete = state.levelComplete[mission] || {};
      if (missionComplete[level]) return state;
      const newMissionComplete = { ...missionComplete, [level]: true };
      const newLevelComplete = { ...state.levelComplete, [mission]: newMissionComplete };
      const completedCount = countCompletedLevels(newLevelComplete);
      const newAriaHealth = Math.min(100, Math.floor((completedCount / 18) * 90));
      return {
        ...state,
        levelComplete: newLevelComplete,
        ariaHealth: newAriaHealth,
      };
    }

    case "ADD_CODEX_CARD": {
      const { id, title, description, realWorld, rarity, icon } = action.payload;
      if (state.codex.find((c) => c.id === id)) return state;
      return {
        ...state,
        codex: [...state.codex, { id, title, description, realWorld, rarity, icon }],
      };
    }

    case "SET_PLAYER_NAME":
      return { ...state, playerName: action.payload };

    case "SET_LANGUAGE":
      return { ...state, lang: action.payload };

    case "UNLOCK_LEVEL": {
      const { mission, level } = action.payload;
      const missionLevels = state.unlockedLevels[mission] || [];
      if (missionLevels.includes(level)) return state;
      return {
        ...state,
        unlockedLevels: {
          ...state.unlockedLevels,
          [mission]: [...missionLevels, level],
        },
      };
    }

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
