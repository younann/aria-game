import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGame, RANKS } from "./systems/GameState";
import { getDialogues } from "./systems/DialogueData";
import { MISSIONS, UNLOCK_TREE } from "./systems/MissionConfig";
import { I18nProvider, useI18n } from "./systems/I18nContext";
import GameCanvas from "./engine/GameCanvas";
import { buildStationHub } from "./engine/StationHub";
import StationHubMobile from "./engine/StationHubMobile";
import BridgeIntroMobile from "./engine/BridgeIntroMobile";
import useViewport from "./hooks/useViewport";
import HUD from "./ui/HUD";
import AchievementPopup from "./ui/AchievementPopup";
import DialogueBox from "./ui/DialogueBox";
import MissionBriefing from "./ui/MissionBriefing";
import LevelSelect from "./ui/LevelSelect";
import RankCeremony from "./ui/RankCeremony";
import Codex from "./ui/Codex";
import CodexCardReveal from "./ui/CodexCardReveal";
import SignalClassifier from "./labs/SignalClassifier";
import SynapticWiring from "./labs/SynapticWiring";
import AgentNavigator from "./labs/AgentNavigator";
import PatternScanner from "./labs/PatternScanner";
import MessageDecoder from "./labs/MessageDecoder";
import BiasDetector from "./labs/BiasDetector";
import CommandCenter from "./labs/CommandCenter";

const MISSION_FLOW = {
  datavault:     { introDialogue: "datavault_intro",     completeDialogue: "datavault_complete" },
  opticslab:     { introDialogue: "opticslab_intro",     completeDialogue: "opticslab_complete" },
  commsarray:    { introDialogue: "commsarray_intro",    completeDialogue: "commsarray_complete" },
  neuralcore:    { introDialogue: "neuralcore_intro",    completeDialogue: "neuralcore_complete" },
  simdeck:       { introDialogue: "simdeck_intro",       completeDialogue: "simdeck_complete" },
  ethicschamber: { introDialogue: "ethicschamber_intro", completeDialogue: "ethicschamber_complete" },
  command:       { introDialogue: "command_finale",      completeDialogue: null },
};

const MAIN_MISSIONS = ["datavault", "opticslab", "commsarray", "neuralcore", "simdeck"];

function getRankName(totalStars) {
  let rank = RANKS[0].name;
  for (const r of RANKS) {
    if (totalStars >= r.stars) rank = r.name;
  }
  return rank;
}

function checkUnlocks(state) {
  const newUnlocks = [];
  for (const [roomId, req] of Object.entries(UNLOCK_TREE)) {
    if (state.unlockedRooms.includes(roomId)) continue;
    if (!req.requires || req.requires === "bridge_intro") continue;

    const r = req.requires;
    if (r.allMissionsLevel) {
      const allDone = MAIN_MISSIONS.every(m => state.levelComplete?.[m]?.[r.allMissionsLevel]);
      if (allDone) newUnlocks.push(roomId);
    } else if (r.missionsCompleted) {
      let count = 0;
      for (const m of MAIN_MISSIONS) {
        if (state.levelComplete?.[m]?.[r.level]) count++;
      }
      if (count >= r.missionsCompleted) newUnlocks.push(roomId);
    } else if (r.mission && r.level) {
      if (!state.levelComplete?.[r.mission]?.[r.level]) continue;
      if (r.minStars && (state.totalStars || 0) < r.minStars) continue;
      newUnlocks.push(roomId);
    }
  }
  return newUnlocks;
}

export default function App() {
  const { state } = useGame();
  return (
    <I18nProvider lang={state.lang}>
      <AppContent />
    </I18nProvider>
  );
}

const LANG_OPTIONS = [
  { code: "en", label: "English" },
  { code: "he", label: "\u05E2\u05D1\u05E8\u05D9\u05EA" },
  { code: "ar", label: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629" },
];

function AppContent() {
  const { state, dispatch } = useGame();
  const { t, dir } = useI18n();
  const { width: vw, isMobile } = useViewport();
  const dialogues = useMemo(() => getDialogues(t), [t]);
  const canvasWidth = isMobile ? vw : Math.min(vw - 32, 960);
  const canvasHeight = Math.round(canvasWidth * (700 / 960));
  // Phases: name_entry | bridge_intro | hub | level_select | dialogue | briefing | mission | mission_complete_dialogue | complete
  const [phase, setPhase] = useState("name_entry");
  const [currentDialogue, setCurrentDialogue] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [currentMission, setCurrentMission] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [achievementQueue, setAchievementQueue] = useState([]);
  const [showingAchievement, setShowingAchievement] = useState(null);
  const [codexOpen, setCodexOpen] = useState(false);
  const [rankCeremonyData, setRankCeremonyData] = useState(null);
  const pixiAppRef = useRef(null);
  const hubContainerRef = useRef(null);
  const [pixiReadyCounter, setPixiReadyCounter] = useState(0);
  const prevRankRef = useRef(getRankName(state.totalStars || 0));
  const [codexCardQueue, setCodexCardQueue] = useState([]);
  const [showingCodexCard, setShowingCodexCard] = useState(null);
  const prevCodexLength = useRef(state.codex.length);

  const handleNameSubmit = useCallback(() => {
    const name = nameInput.trim() || t("app.defaultName");
    dispatch({ type: "SET_PLAYER_NAME", payload: name });
    setCurrentDialogue(dialogues.bridge_intro);
    setPhase("bridge_intro");
  }, [nameInput, dispatch, t, dialogues]);

  // Watch for new achievements
  const prevAchievements = useRef(state.achievements.length);
  useEffect(() => {
    if (state.achievements.length > prevAchievements.current) {
      const newOnes = state.achievements.slice(prevAchievements.current);
      setAchievementQueue(q => [...q, ...newOnes]);
    }
    prevAchievements.current = state.achievements.length;
  }, [state.achievements]);

  useEffect(() => {
    if (achievementQueue.length > 0 && !showingAchievement) {
      setShowingAchievement(achievementQueue[0]);
      setAchievementQueue(q => q.slice(1));
    }
  }, [achievementQueue, showingAchievement]);

  // Auto-unlock rooms when requirements are met
  useEffect(() => {
    const newUnlocks = checkUnlocks(state);
    for (const roomId of newUnlocks) {
      dispatch({ type: "UNLOCK_ROOM", payload: roomId });
    }
  }, [state.levelComplete, state.totalStars, state.unlockedRooms, dispatch]);

  // Watch for new codex cards
  useEffect(() => {
    if (state.codex.length > prevCodexLength.current) {
      const newCards = state.codex.slice(prevCodexLength.current);
      setCodexCardQueue((q) => [...q, ...newCards]);
    }
    prevCodexLength.current = state.codex.length;
  }, [state.codex]);

  useEffect(() => {
    if (codexCardQueue.length > 0 && !showingCodexCard) {
      setShowingCodexCard(codexCardQueue[0]);
      setCodexCardQueue((q) => q.slice(1));
    }
  }, [codexCardQueue, showingCodexCard]);

  // Detect rank changes
  useEffect(() => {
    const currentRank = getRankName(state.totalStars || 0);
    if (currentRank !== prevRankRef.current) {
      setRankCeremonyData({ oldRank: prevRankRef.current, newRank: currentRank });
      prevRankRef.current = currentRank;
    }
  }, [state.totalStars]);

  const rebuildHub = useCallback(() => {
    const app = pixiAppRef.current;
    if (!app || !app.stage) return;
    if (hubContainerRef.current) {
      app.stage.removeChild(hubContainerRef.current);
      hubContainerRef.current.destroy({ children: true });
    }
    const hub = buildStationHub(app, state.unlockedRooms, handleRoomClick, state.stars || {});
    app.stage.addChild(hub);
    hubContainerRef.current = hub;
  }, [state.unlockedRooms, state.stars]);

  const handlePixiReady = useCallback((app) => {
    pixiAppRef.current = app;
    setPixiReadyCounter(c => c + 1);
  }, []);

  useEffect(() => {
    if (phase === "hub" && pixiAppRef.current && pixiAppRef.current.stage) {
      rebuildHub();
    }
  }, [phase, rebuildHub, pixiReadyCounter]);

  const handleRoomClick = useCallback((roomId) => {
    if (roomId === "bridge") return;
    setCurrentMission(roomId);

    if (roomId === "command") {
      const flow = MISSION_FLOW.command;
      if (dialogues[flow.introDialogue]) {
        setCurrentDialogue(dialogues[flow.introDialogue]);
        setPhase("dialogue");
      } else {
        setPhase("complete");
      }
      return;
    }

    // All other missions: go to level select
    setPhase("level_select");
  }, [dialogues]);

  const handleLevelSelect = useCallback((level) => {
    setCurrentLevel(level);
    const missionId = currentMission;
    const flow = MISSION_FLOW[missionId];

    // Show intro dialogue on first visit to this mission
    const hasCompletedAny = Object.keys(state.levelComplete?.[missionId] || {}).length > 0;
    if (!hasCompletedAny && flow?.introDialogue && dialogues[flow.introDialogue]) {
      setCurrentDialogue(dialogues[flow.introDialogue]);
      setPhase("dialogue");
      return;
    }

    // Show level-specific dialogue for L2/L3 if available
    if (level > 1) {
      const levelDialogueKey = `level${level}_intro`;
      if (dialogues[levelDialogueKey]) {
        setCurrentDialogue(dialogues[levelDialogueKey]);
        setPhase("dialogue");
        return;
      }
    }

    // No dialogue — straight to briefing
    setPhase("briefing");
  }, [currentMission, state.levelComplete, dialogues]);

  const handleLevelSelectBack = useCallback(() => {
    setCurrentMission(null);
    setPhase("hub");
  }, []);

  const handleDialogueComplete = useCallback((nextKey) => {
    if (nextKey && dialogues[nextKey]) {
      setCurrentDialogue(dialogues[nextKey]);
      return;
    }

    if (phase === "bridge_intro" || (phase === "dialogue" && !currentMission)) {
      dispatch({ type: "UNLOCK_ROOM", payload: "datavault" });
      setPhase("hub");
      return;
    }

    if (currentMission === "command") {
      dispatch({ type: "HEAL_ARIA", payload: 25 });
      dispatch({ type: "ADD_XP", payload: 100 });
      setPhase("complete");
      return;
    }

    if (phase === "dialogue" && currentMission) {
      setPhase("briefing");
      return;
    }

    if (phase === "mission_complete_dialogue") {
      setCurrentMission(null);
      setPhase("hub");
      return;
    }
  }, [phase, currentMission, dispatch, dialogues]);

  const handleMissionStart = useCallback(() => {
    setPhase("mission");
  }, []);

  const handleMissionComplete = useCallback((result) => {
    const flow = MISSION_FLOW[currentMission];
    if (flow?.completeDialogue && dialogues[flow.completeDialogue]) {
      setCurrentDialogue(dialogues[flow.completeDialogue]);
      setPhase("mission_complete_dialogue");
    } else {
      setCurrentMission(null);
      setPhase("hub");
    }
  }, [currentMission, dialogues]);

  const handleRankCeremonyDismiss = useCallback(() => {
    setRankCeremonyData(null);
  }, []);

  const renderMission = () => {
    const props = { level: currentLevel, onComplete: handleMissionComplete };
    switch (currentMission) {
      case "datavault":
        return <SignalClassifier {...props} />;
      case "neuralcore":
        return <SynapticWiring {...props} />;
      case "simdeck":
        return <AgentNavigator {...props} />;
      case "opticslab":
        return <PatternScanner {...props} />;
      case "commsarray":
        return <MessageDecoder {...props} />;
      case "ethicschamber":
        return <BiasDetector {...props} />;
      default:
        return null;
    }
  };

  return (
    <div dir={dir} style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: isMobile ? "flex-start" : "center",
      padding: isMobile ? "0" : "16px",
      paddingTop: isMobile ? "56px" : "16px",
    }}>
      {/* HUD - always visible except during intro phases */}
      {phase !== "bridge_intro" && phase !== "name_entry" && <HUD onOpenCodex={() => setCodexOpen(true)} />}

      {/* Achievement Popup */}
      <AchievementPopup
        achievement={showingAchievement}
        onDone={() => setShowingAchievement(null)}
      />

      {/* Name Entry */}
      {phase === "name_entry" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: "center", maxWidth: "500px", width: "100%", padding: isMobile ? "24px 16px" : "0" }}
        >
          <motion.img
            src="/logo.png"
            alt="ARIA — Learn AI, Play & Explore"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{ width: "280px", marginBottom: "24px", filter: "drop-shadow(0 0 24px rgba(139,92,246,0.3))" }}
          />
          <p style={{ color: "#94a3b8", fontSize: "1.1rem", lineHeight: 1.7, marginBottom: "32px" }}>
            {t("app.intro")}
          </p>
          {/* Language selector */}
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "24px" }}>
            {LANG_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                onClick={() => dispatch({ type: "SET_LANGUAGE", payload: opt.code })}
                style={{
                  padding: "8px 20px",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  background: state.lang === opt.code ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.03)",
                  border: state.lang === opt.code ? "2px solid #8b5cf6" : "2px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: state.lang === opt.code ? "#c4b5fd" : "#64748b",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "block", fontSize: "0.75rem", color: "#64748b",
              letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "12px",
            }}>
              {t("app.enterName")}
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
              placeholder={t("app.namePlaceholder")}
              maxLength={20}
              autoFocus
              style={{
                width: "100%", maxWidth: "300px",
                padding: "14px 20px",
                fontSize: "1.1rem",
                textAlign: "center",
                background: "rgba(15, 23, 42, 0.8)",
                border: "2px solid rgba(139, 92, 246, 0.4)",
                borderRadius: "12px",
                color: "#e2e8f0",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>
          <button
            onClick={handleNameSubmit}
            style={{
              padding: "14px 40px",
              fontSize: "1rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
              border: "none",
              borderRadius: "12px",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            {t("app.beginMission")}
          </button>
        </motion.div>
      )}

      {/* Bridge Intro */}
      {phase === "bridge_intro" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: "center", maxWidth: "700px", width: "100%", padding: isMobile ? "16px" : "0" }}
        >
          <motion.img
            src="/logo.png"
            alt="ARIA — Learn AI, Play & Explore"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{ width: isMobile ? "180px" : "280px", marginBottom: "24px", filter: "drop-shadow(0 0 24px rgba(139,92,246,0.3))" }}
          />
          <p style={{ color: "#94a3b8", fontSize: isMobile ? "0.95rem" : "1.1rem", lineHeight: 1.7, marginBottom: "40px" }}>
            {t("app.intro")}
          </p>
          {!isMobile && <GameCanvas onAppReady={handlePixiReady} width={canvasWidth} height={canvasHeight} />}
        </motion.div>
      )}

      {/* Station Hub */}
      {phase === "hub" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: "center", width: "100%" }}
        >
          {isMobile ? (
            <StationHubMobile
              unlockedRooms={state.unlockedRooms}
              onRoomClick={handleRoomClick}
              starsData={state.stars || {}}
            />
          ) : (
            <>
              <div style={{
                fontSize: "0.7rem", color: "#64748b", letterSpacing: "0.2em",
                marginBottom: "16px",
              }}>
                {t("app.selectRoom")}
              </div>
              <GameCanvas onAppReady={handlePixiReady} width={canvasWidth} height={canvasHeight} />
            </>
          )}
        </motion.div>
      )}

      {/* Level Select */}
      <AnimatePresence>
        {phase === "level_select" && currentMission && (
          <LevelSelect
            missionId={currentMission}
            onSelectLevel={handleLevelSelect}
            onBack={handleLevelSelectBack}
          />
        )}
      </AnimatePresence>

      {/* Mission Briefing */}
      <AnimatePresence>
        {phase === "briefing" && currentMission && (
          <MissionBriefing
            missionId={currentMission}
            level={currentLevel}
            onStart={handleMissionStart}
          />
        )}
      </AnimatePresence>

      {/* Active Mission */}
      {phase === "mission" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            width: "100%",
            maxWidth: isMobile ? "100%" : "900px",
            background: "rgba(15,23,42,0.6)",
            border: isMobile ? "none" : "1px solid rgba(255,255,255,0.08)",
            borderRadius: isMobile ? "0" : "20px",
            overflow: "hidden",
          }}
        >
          {renderMission()}
        </motion.div>
      )}

      {/* Command Center Finale */}
      {phase === "complete" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            width: "100%",
            maxWidth: isMobile ? "100%" : "900px",
            background: "rgba(15,23,42,0.6)",
            border: isMobile ? "none" : "1px solid rgba(255,255,255,0.08)",
            borderRadius: isMobile ? "0" : "20px",
            overflow: "hidden",
          }}
        >
          <CommandCenter />
        </motion.div>
      )}

      {/* Dialogue Box - overlays everything */}
      <AnimatePresence>
        {(phase === "bridge_intro" || phase === "dialogue" || phase === "mission_complete_dialogue") && (
          <DialogueBox
            dialogue={currentDialogue}
            onComplete={handleDialogueComplete}
          />
        )}
      </AnimatePresence>

      {/* Codex Panel */}
      <Codex isOpen={codexOpen} onClose={() => setCodexOpen(false)} />

      {/* Codex Card Reveal */}
      {showingCodexCard && (
        <CodexCardReveal
          card={showingCodexCard}
          onDismiss={() => setShowingCodexCard(null)}
        />
      )}

      {/* Rank Ceremony Overlay */}
      <AnimatePresence>
        {rankCeremonyData && (
          <RankCeremony
            oldRank={rankCeremonyData.oldRank}
            newRank={rankCeremonyData.newRank}
            onDismiss={handleRankCeremonyDismiss}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
