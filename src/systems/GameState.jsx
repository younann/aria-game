import React, { createContext, useContext, useReducer } from "react";

const initialState = {
  scene: "bridge",
  xp: 0,
  rank: "Cadet Recruit",
  ariaHealth: 0,
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
