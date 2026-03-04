import React, { useState, useCallback, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "./systems/GameState";
import { DIALOGUES } from "./systems/DialogueData";
import GameCanvas from "./engine/GameCanvas";
import { buildStationHub } from "./engine/StationHub";
import HUD from "./ui/HUD";
import AchievementPopup from "./ui/AchievementPopup";
import DialogueBox from "./ui/DialogueBox";
import MissionBriefing from "./ui/MissionBriefing";
import SignalClassifier from "./labs/SignalClassifier";
import SynapticWiring from "./labs/SynapticWiring";
import AgentNavigator from "./labs/AgentNavigator";
import CommandCenter from "./labs/CommandCenter";

const MISSION_FLOW = {
  datavault: { introDialogue: "datavault_intro", completeDialogue: "datavault_complete", unlockNext: "neuralcore" },
  neuralcore: { introDialogue: "neuralcore_intro", completeDialogue: "neuralcore_complete", unlockNext: "simdeck" },
  simdeck: { introDialogue: "simdeck_intro", completeDialogue: "simdeck_complete", unlockNext: "command" },
  command: { introDialogue: "command_finale", completeDialogue: null, unlockNext: null },
};

export default function App() {
  const { state, dispatch } = useGame();
  const [phase, setPhase] = useState("bridge_intro"); // bridge_intro | hub | dialogue | briefing | mission | complete
  const [currentDialogue, setCurrentDialogue] = useState(DIALOGUES.bridge_intro);
  const [currentMission, setCurrentMission] = useState(null);
  const [achievementQueue, setAchievementQueue] = useState([]);
  const [showingAchievement, setShowingAchievement] = useState(null);
  const pixiAppRef = useRef(null);
  const hubContainerRef = useRef(null);
  const [pixiReadyCounter, setPixiReadyCounter] = useState(0);
  const [codexOpen, setCodexOpen] = useState(false);

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

  const rebuildHub = useCallback(() => {
    const app = pixiAppRef.current;
    if (!app || !app.stage) return;
    if (hubContainerRef.current) {
      app.stage.removeChild(hubContainerRef.current);
      hubContainerRef.current.destroy({ children: true });
    }
    const hub = buildStationHub(app, state.unlockedRooms, handleRoomClick);
    app.stage.addChild(hub);
    hubContainerRef.current = hub;
  }, [state.unlockedRooms]);

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
    if (roomId === "bridge") return; // Bridge is just the intro, no mission
    const flow = MISSION_FLOW[roomId];
    if (!flow) return;

    setCurrentMission(roomId);

    if (roomId === "command") {
      // Command center: play finale dialogue then show finale
      setCurrentDialogue(DIALOGUES[flow.introDialogue]);
      setPhase("dialogue");
      return;
    }

    // Other missions: play intro dialogue
    setCurrentDialogue(DIALOGUES[flow.introDialogue]);
    setPhase("dialogue");
  }, []);

  const handleDialogueComplete = useCallback((nextKey) => {
    if (nextKey && DIALOGUES[nextKey]) {
      // Branching dialogue
      setCurrentDialogue(DIALOGUES[nextKey]);
      return;
    }

    if (phase === "bridge_intro" || (phase === "dialogue" && !currentMission)) {
      // Bridge intro done — unlock datavault and go to hub
      dispatch({ type: "UNLOCK_ROOM", payload: "datavault" });
      setPhase("hub");
      return;
    }

    if (currentMission === "command") {
      // Finale dialogue done — show command center
      dispatch({ type: "HEAL_ARIA", payload: 25 });
      dispatch({ type: "ADD_XP", payload: 100 });
      setPhase("complete");
      return;
    }

    if (phase === "dialogue" && currentMission) {
      // Mission intro dialogue done — show briefing
      setPhase("briefing");
      return;
    }

    if (phase === "mission_complete_dialogue") {
      // Mission complete dialogue done — unlock next room, back to hub
      const flow = MISSION_FLOW[currentMission];
      if (flow?.unlockNext) {
        dispatch({ type: "UNLOCK_ROOM", payload: flow.unlockNext });
      }
      setCurrentMission(null);
      setPhase("hub");
      return;
    }
  }, [phase, currentMission, dispatch]);

  const handleMissionStart = useCallback(() => {
    setPhase("mission");
  }, []);

  const handleMissionComplete = useCallback(() => {
    const flow = MISSION_FLOW[currentMission];
    if (flow?.completeDialogue) {
      setCurrentDialogue(DIALOGUES[flow.completeDialogue]);
      setPhase("mission_complete_dialogue");
    } else {
      setCurrentMission(null);
      setPhase("hub");
    }
  }, [currentMission]);

  const renderMission = () => {
    switch (currentMission) {
      case "datavault":
        return <SignalClassifier onComplete={handleMissionComplete} />;
      case "neuralcore":
        return <SynapticWiring onComplete={handleMissionComplete} />;
      case "simdeck":
        return <AgentNavigator onComplete={handleMissionComplete} />;
      default:
        return null;
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}>
      {/* HUD - always visible except during bridge intro */}
      {phase !== "bridge_intro" && <HUD onOpenCodex={() => setCodexOpen(true)} />}

      {/* Achievement Popup */}
      <AchievementPopup
        achievement={showingAchievement}
        onDone={() => setShowingAchievement(null)}
      />

      {/* Bridge Intro */}
      {phase === "bridge_intro" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: "center", maxWidth: "700px" }}
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{ fontSize: "6rem", marginBottom: "24px" }}
          >
            🧠
          </motion.div>
          <h1 style={{
            fontSize: "3.5rem", fontWeight: 900, marginBottom: "12px",
            background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
            backgroundClip: "text", WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            NEURAL QUEST
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1.1rem", lineHeight: 1.7, marginBottom: "40px" }}>
            The ISS Prometheus needs you. An AI named ARIA has been damaged by a cosmic storm.
            Repair her, and learn how artificial intelligence really works.
          </p>
          <GameCanvas onAppReady={handlePixiReady} width={960} height={540} />
        </motion.div>
      )}

      {/* Station Hub */}
      {phase === "hub" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: "center" }}
        >
          <div style={{
            fontSize: "0.7rem", color: "#64748b", letterSpacing: "0.2em",
            marginBottom: "16px",
          }}>
            SELECT A ROOM TO ENTER
          </div>
          <GameCanvas onAppReady={handlePixiReady} width={960} height={540} />
        </motion.div>
      )}

      {/* Mission Briefing */}
      <AnimatePresence>
        {phase === "briefing" && currentMission && (
          <MissionBriefing
            missionId={currentMission}
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
            maxWidth: "900px",
            background: "rgba(15,23,42,0.6)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
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
            maxWidth: "900px",
            background: "rgba(15,23,42,0.6)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
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
    </div>
  );
}
