import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Brain, Database, Trophy, Play, Zap, Info, ChevronRight } from "lucide-react";

const LEVELS = [
  { id: "welcome", name: "System Boot", icon: <Bot size={20} /> },
  { id: "training", name: "Data Ingestion", icon: <Database size={20} /> },
  { id: "neural", name: "Synaptic Tuning", icon: <Brain size={20} /> },
  { id: "rl", name: "Policy Optimization", icon: <Zap size={20} /> },
  { id: "expert", name: "Global Deployment", icon: <Trophy size={20} /> },
];

function ResearchLog({ discoveredConcepts, onClose }) {
  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="glass"
      style={{ 
        position: 'fixed', 
        right: 0, 
        top: 0, 
        bottom: 0, 
        width: '400px', 
        zIndex: 1000, 
        padding: '40px',
        borderLeft: '2px solid var(--primary)',
        background: 'rgba(5, 5, 8, 0.95)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h3 className="text-gradient">AI RESEARCH LOG</h3>
        <button onClick={onClose} style={{ padding: '8px 16px', background: 'transparent' }}>CLOSE</button>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {discoveredConcepts.length === 0 && (
          <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No data logs recovered yet. Begin the mission to capture AI fragments.</p>
        )}
        {discoveredConcepts.map((concept, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i} 
            className="glass" 
            style={{ padding: '20px', borderLeft: '3px solid var(--secondary)' }}
          >
            <h4 style={{ color: 'var(--secondary)', marginBottom: '8px', fontSize: '0.8rem', letterSpacing: '0.1em' }}>{concept.title}</h4>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>{concept.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function HUDDecor() {
  return (
    <>
      <div className="hud-corner hud-tl" />
      <div className="hud-corner hud-tr" />
      <div className="hud-corner hud-bl" />
      <div className="hud-corner hud-br" />
    </>
  );
}

function Sidebar({ activeLevel, setActiveLevel }) {
  return (
    <div className="sidebar glass hud-border" style={{ position: 'relative' }}>
      <HUDDecor />
      <div style={{ paddingBottom: '32px' }}>
        <h1 className="text-gradient" style={{ fontSize: '1.5rem', letterSpacing: '0.1em' }}>NEURAL QUEST</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Command Interface v2.0</p>
      </div>
      {LEVELS.map((lvl) => (
        <button 
          key={lvl.id}
          onClick={() => setActiveLevel(lvl.id)}
          className={`glass-interactive ${activeLevel === lvl.id ? 'active' : ''}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: activeLevel === lvl.id ? 'var(--primary)' : 'transparent',
            color: activeLevel === lvl.id ? 'white' : 'var(--text-secondary)',
            textAlign: 'left',
            padding: '12px 18px',
            border: activeLevel === lvl.id ? 'none' : '1px solid transparent'
          }}
        >
          {lvl.icon}
          <span>{lvl.name}</span>
        </button>
      ))}
      <div style={{ marginTop: 'auto', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Your Rank</div>
        <div style={{ fontWeight: 'bold' }}>AI Initiate</div>
      </div>
    </div>
  );
}

function WelcomeScreen({ onStart }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="main-content"
      style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', position: 'relative' }}
    >
      <div className="welcome-bg" />
      <div className="glass hud-border" style={{ padding: '80px', maxWidth: '900px', width: '100%', position: 'relative' }}>
        <HUDDecor />
        <motion.div 
          animate={{ 
            boxShadow: ['0 0 20px rgba(139, 92, 246, 0.2)', '0 0 60px rgba(139, 92, 246, 0.4)', '0 0 20px rgba(139, 92, 246, 0.2)'] 
          }}
          transition={{ duration: 4, repeat: Infinity }}
          style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 40px', border: '1px solid var(--primary)' }}
        >
          <Brain size={60} color="var(--primary)" />
        </motion.div>
        
        <h1 style={{ fontSize: '4rem', marginBottom: '24px', letterSpacing: '-0.02em', fontWeight: 900 }}>THE FUTURE <br/><span className="text-gradient">IS PROGRAMMABLE</span></h1>
        
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '48px', lineHeight: '1.8', maxWidth: '600px', margin: '0 auto 48px' }}>
          Welcome to the Deep Learning Research Initiative. Humanity's cognitive legacy depends on your ability to train the next generation of synthetic intelligence.
        </p>
        
        <button onClick={onStart} style={{ padding: '24px 64px', fontSize: '1rem', fontWeight: 800 }}>
          INITIALIZE SYSTEM BOOT
        </button>

        <div style={{ marginTop: '64px', display: 'flex', justifyContent: 'center', gap: '40px', opacity: 0.5 }}>
           <div style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>SERIAL: X-992-LAB</div>
           <div style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>LOC: LEO ORBIT</div>
           <div style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>STATUS: NOMINAL</div>
        </div>
      </div>
    </motion.div>
  );
}

function TrainingLab({ onConceptDiscovered }) {
  const [data, setData] = useState([]);
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [trainingComplete, setTrainingComplete] = useState(false);
  const [confidence, setConfidence] = useState(0.1);
  const [epoch, setEpoch] = useState(1);

  const generateBots = () => {
    const bots = [];
    for(let i=0; i<15; i++) {
       const isFriendly = Math.random() > 0.5;
       bots.push({
         id: i,
         name: `UNIT-${Math.floor(Math.random()*9000)+1000}`,
         eyeColor: isFriendly ? '#10b981' : '#f43f5e',
         antenna: Math.random() > 0.5 ? 'curved' : 'sharp',
         behavior: isFriendly ? 'waves at you' : 'stares intensely',
         label: isFriendly ? 'Friendly' : 'Hostile'
       });
    }
    return bots;
  }

  useEffect(() => {
    setData(generateBots());
  }, []);

  const handleClassify = (choice) => {
    const isCorrect = data[currentIndex].label === choice;
    if (isCorrect) {
      setScore(s => s + 1);
      setConfidence(c => Math.min(1, c + 0.1));
      if (currentIndex === 0) {
        onConceptDiscovered("Supervised Learning", "This is the process of labeling data to teach an AI. The label (Friendly/Hostile) is the 'Ground Truth'.");
      }
    } else {
      setConfidence(c => Math.max(0, c - 0.15));
    }

    if (currentIndex > 0 && (currentIndex + 1) % 5 === 0) {
      setEpoch(e => e + 1);
      if (epoch === 1) {
        onConceptDiscovered("Epochs", "One full pass through the entire dataset is called an Epoch. Real AI often needs thousands of epochs!");
      }
    }

    if (currentIndex < data.length - 1) {
      setCurrentIndex(c => c + 1);
    } else {
      setTrainingComplete(true);
    }
  }

  if (trainingComplete) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="main-content">
        <div className="glass" style={{ padding: '48px', textAlign: 'center' }}>
          <Zap size={64} color="var(--primary)" style={{ marginBottom: '24px' }} />
          <h2 className="text-gradient">Model Training Stabilized!</h2>
          <p style={{ margin: '24px 0', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
            After {epoch} Epochs, your model achieved {Math.round(score/data.length * 100)}% reliability. 
            The AI has learned to map raw features (Eye color, antenna shape) to complex labels.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button style={{ background: 'var(--secondary)' }}>Access Neural Lab</button>
            <button className="glass" style={{ background: 'transparent' }}>Review Dataset</button>
          </div>
        </div>
      </motion.div>
    )
  }

  const currentBot = data[currentIndex];

  return (
    <div className="main-content">
      <div className="glass hud-border" style={{ padding: '40px', position: 'relative', overflow: 'hidden' }}>
        <HUDDecor />
        {/* Progress HUD */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Database size={18} color="var(--primary)" />
              <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>Neural Training Unit</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Mapping binary features to behavioral labels.</p>
          </div>
          <div style={{ display: 'flex', gap: '32px', textAlign: 'right' }}>
             <div>
               <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Epoch</div>
               <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--secondary)' }}>0{epoch}</div>
             </div>
             <div>
               <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Dataset</div>
               <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{currentIndex + 1} / {data.length}</div>
             </div>
          </div>
        </div>

        {/* Confidence Meter */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>MODEL CONFIDENCE</span>
            <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{Math.round(confidence * 100)}%</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
            <motion.div 
               animate={{ width: `${confidence * 100}%` }}
               style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', boxShadow: '0 0 10px var(--primary-glow)' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentBot?.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              className="glass" 
              style={{ 
                padding: '40px', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '24px',
                border: `1px solid ${currentBot?.eyeColor}33`,
                background: `radial-gradient(circle at center, ${currentBot?.eyeColor}05 0%, transparent 70%)`
              }}
            >
              <div style={{ position: 'relative' }}>
                {/* Scanner Overlay */}
                <motion.div 
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  style={{ 
                    position: 'absolute', 
                    width: '100%', 
                    height: '2px', 
                    background: currentBot?.eyeColor,
                    boxShadow: `0 0 15px ${currentBot?.eyeColor}`,
                    zIndex: 2,
                    left: 0
                  }}
                />
                <div style={{ 
                  width: '140px', 
                  height: '160px', 
                  background: 'rgba(255,255,255,0.05)', 
                  borderRadius: '24px', 
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  border: `2px solid var(--glass-border)`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: currentBot?.eyeColor, boxShadow: `0 0 10px ${currentBot?.eyeColor}` }}></div>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: currentBot?.eyeColor, boxShadow: `0 0 10px ${currentBot?.eyeColor}` }}></div>
                  </div>
                  <div style={{ width: '80px', height: '10px', background: 'white', opacity: 0.1, margin: '30px auto', borderRadius: '5px' }}></div>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ marginBottom: '8px', letterSpacing: '0.2em', color: 'var(--text-secondary)' }}>{currentBot?.name}</h4>
                <div style={{ fontStyle: 'italic', fontSize: '1.1rem', color: currentBot?.eyeColor }}>
                  "{currentBot?.behavior}"
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
             <button onClick={() => handleClassify('Friendly')} style={{ background: '#10b981', padding: '24px' }}>
               LBL_SAFE: FRIENDLY
             </button>
             <button onClick={() => handleClassify('Hostile')} style={{ background: '#f43f5e', padding: '24px' }}>
               LBL_DANGER: HOSTILE
             </button>
             
             <div className="glass" style={{ padding: '24px', borderLeft: '4px solid var(--primary)' }}>
               <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', textTransform: 'uppercase' }}>
                 <Info size={16} /> Research Log: Feature Extraction
               </h5>
               <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                 Your brain naturally sees a "Robot". The AI sees **vectors**. It looks at the hex code of the eye color and the frequency of the behavior to calculate a probability.
               </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function weightColor(w) {
  return w > 0 ? 'var(--primary)' : 'var(--accent)';
}

function Connection({ x1, y1, x2, y2, weight }) {
  const opacity = Math.abs(weight) + 0.1;
  const color = weightColor(weight);
  return (
    <>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={Math.abs(weight) * 12 + 2} opacity={opacity} />
      {Math.abs(weight) > 0.1 && (
        <motion.circle 
          r="4" 
          fill="white"
          animate={{ cx: [x1, x2], cy: [y1, y2] }}
          transition={{ 
            duration: 1.5 / (Math.abs(weight) + 0.2), 
            repeat: Infinity, 
            ease: "linear" 
          }}
          style={{ filter: `drop-shadow(0 0 5px white)` }}
        />
      )}
    </>
  );
}

function NeuralLab({ onConceptDiscovered }) {
  const [weights, setWeights] = useState([0.7, -0.4, 0.2]);
  const inputs = [1, 0];
  
  useEffect(() => {
    onConceptDiscovered("Synapse Weights", "Weights determine how much influence an input has on the final decision. Think of them as 'importance dials'.");
  }, []);

  const handleWeightChange = (index, val) => {
    const newWeights = [...weights];
    newWeights[index] = val;
    setWeights(newWeights);
    if (Math.abs(val) > 0.9) {
      onConceptDiscovered("Gradient Descent", "When weights are adjusted to reduce error, it's like a ball rolling down a hill to find the lowest point.");
    }
  }
  
  const weightedSum = inputs[0] * weights[0] + inputs[1] * weights[1] + weights[2];
  const output = 1 / (1 + Math.exp(-weightedSum));
  
  const getOutputColor = () => {
    if (output > 0.7) return "#10b981";
    if (output < 0.3) return "#f43f5e";
    return "#eab308";
  }

  return (
    <div className="main-content">
      <div className="glass hud-border" style={{ padding: '40px', position: 'relative' }}>
        <HUDDecor />
        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Brain size={24} color="var(--primary)" />
              <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.2em' }}>Synaptic Matrix</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Tuning scalar weights for optimal backpropagation.</p>
          </div>
          <div className="level-badge" style={{ color: 'var(--secondary)', borderColor: 'var(--secondary)' }}>
            Real-time Inference
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '48px' }}>
          <div className="glass" style={{ 
            height: '450px', 
            position: 'relative', 
            display: 'flex', 
            justifyContent: 'space-around', 
            alignItems: 'center',
            padding: '40px',
            background: 'rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }}>
            {/* Legend Background */}
            <div style={{ position: 'absolute', top: 20, left: 20, fontSize: '0.6rem', color: 'rgba(255,255,255,0.1)', fontFamily: 'monospace' }}>
              SUM(Xn * Wn) + B = PROB_Y
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '120px', zIndex: 1 }}>
              <Node label="PIXEL_DATA" sub="INPUT_0" active={inputs[0] === 1} />
              <Node label="MOTION_VEC" sub="INPUT_1" active={inputs[1] === 1} />
            </div>

            <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
              <Connection x1="25%" y1="35%" x2="75%" y2="50%" weight={weights[0]} />
              <Connection x1="25%" y1="65%" x2="75%" y2="50%" weight={weights[1]} />
            </svg>

            <div style={{ zIndex: 1, textAlign: 'center' }}>
              <motion.div 
                animate={{ 
                  scale: 0.9 + (output * 0.2),
                  boxShadow: `0 0 ${30 + output * 50}px ${getOutputColor()}33`,
                  borderColor: getOutputColor()
                }}
                style={{ 
                  width: '100px', 
                  height: '100px', 
                  borderRadius: '50%', 
                  border: '6px solid', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: 'var(--bg-dark)',
                  position: 'relative'
                }}
              >
                <Bot size={50} color={getOutputColor()} />
                <div style={{ position: 'absolute', top: -30, fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                  {Math.round(output * 100)}% POSITIVE
                </div>
              </motion.div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <WeightSlider 
              label="Weight 01 (Visuals)" 
              value={weights[0]} 
              onChange={(v) => handleWeightChange(0, v)} 
              desc="How much the AI prioritizes eye color pixels."
            />
            <WeightSlider 
              label="Weight 02 (Speed)" 
              value={weights[1]} 
              onChange={(v) => handleWeightChange(1, v)} 
              desc="How much the AI prioritizes movement speed."
            />
            <WeightSlider 
              label="System Bias" 
              value={weights[2]} 
              onChange={(v) => handleWeightChange(2, v)} 
              desc="Adjusts the threshold for friendliness."
            />

            <div className="glass" style={{ padding: '24px', marginTop: 'auto', borderRight: '4px solid var(--secondary)' }}>
               <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', textTransform: 'uppercase' }}>
                 <Info size={16} /> Deep Learning Secret
               </h5>
               <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                 In a real "Deep" network, there are millions of these weights. The process of the AI automatically changing these sliders to get the right answer is called **Stochastic Gradient Descent**.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Node({ label, sub, active }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ 
        width: '50px', 
        height: '50px', 
        borderRadius: '12px', 
        border: '2px solid var(--glass-border)',
        background: active ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
        boxShadow: active ? '0 0 20px var(--primary-glow)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Database size={20} color={active ? 'white' : 'var(--text-secondary)'} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '0.1em' }}>{label}</div>
        <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>{sub}</div>
      </div>
    </div>
  );
}

function WeightSlider({ label, value, onChange, desc }) {
  return (
    <div className="glass" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{label}</span>
        <span style={{ color: 'var(--secondary)' }}>{(value * 10).toFixed(1)}</span>
      </div>
      <input 
        type="range" 
        min="-1" 
        max="1" 
        step="0.1" 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
      />
      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '8px' }}>{desc}</p>
    </div>
  )
}

function ReinforcementLab({ onConceptDiscovered }) {
  const [grid, setGrid] = useState(Array(25).fill(0)); // 5x5 grid
  const [botPos, setBotPos] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [episodes, setEpisodes] = useState(0);
  const [totalReward, setTotalReward] = useState(0);
  const [path, setPath] = useState([0]);

  const GOAL = 24;
  const START = 0;

  useEffect(() => {
    onConceptDiscovered("Reinforcement Learning", "Unlike Supervised Learning, here the AI learns by doing. It gets rewards for good moves and penalties for bad ones.");
  }, []);

  const toggleCell = (index) => {
    if (index === START || index === GOAL) return;
    const newGrid = [...grid];
    if (newGrid[index] === 0) newGrid[index] = 1; // Reward
    else if (newGrid[index] === 1) newGrid[index] = -1; // Obstacle
    else newGrid[index] = 0;
    setGrid(newGrid);
  };

  const runSimulation = async () => {
    if (isRunning) return;
    setIsRunning(true);
    let current = START;
    let currentPath = [START];
    let reward = 0;

    for (let step = 0; step < 15; step++) {
      await new Promise(r => setTimeout(r, 300));
      
      const row = Math.floor(current / 5);
      const col = current % 5;
      
      const moves = [];
      if (row > 0) moves.push(current - 5);
      if (row < 4) moves.push(current + 5);
      if (col > 0) moves.push(current - 1);
      if (col < 4) moves.push(current + 1);

      // Simple Greedy Policy with small randomness
      let next;
      const bestMove = moves.reduce((prev, curr) => (grid[curr] > grid[prev] ? curr : prev));
      if (Math.random() > 0.8) {
        next = moves[Math.floor(Math.random() * moves.length)];
      } else {
        next = bestMove;
      }

      current = next;
      currentPath.push(current);
      reward += grid[current];
      setBotPos(current);
      setPath([...currentPath]);

      if (current === GOAL) {
        reward += 10;
        onConceptDiscovered("Goal Bias", "The AI now 'vows' to repeat the actions that led to this massive reward. This is how robots learn to walk or play games!");
        break;
      }
      if (grid[current] === -1) break; // Hit obstacle
    }

    setTotalReward(r => r + reward);
    setEpisodes(e => e + 1);
    setIsRunning(false);
  };

  const resetBot = () => {
    setBotPos(START);
    setPath([START]);
  };

  return (
    <div className="main-content">
      <div className="glass hud-border" style={{ padding: '40px' }}>
        <HUDDecor />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Zap size={18} color="var(--primary)" />
              <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>Agent Policy Controller</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Guide the Nano-Bot to Sector 24 using reward signals.</p>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', gap: '32px' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>EPISODES</div>
              <div style={{ fontWeight: 'bold', color: 'var(--secondary)' }}>{episodes}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>CUMULATIVE_REWARD</div>
              <div style={{ fontWeight: 'bold' }}>{totalReward.toFixed(1)}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '48px' }}>
          {/* 5x5 Grid */}
          <div className="glass" style={{ 
            aspectRatio: '1', 
            display: 'grid', 
            gridTemplateColumns: 'repeat(5, 1fr)', 
            gap: '10px', 
            padding: '20px',
            background: 'rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            {grid.map((val, i) => (
              <motion.div
                key={i}
                onClick={() => toggleCell(i)}
                whileHover={{ scale: 0.95 }}
                style={{
                  background: val === 1 ? 'rgba(16, 185, 129, 0.2)' : 
                              val === -1 ? 'rgba(244, 63, 94, 0.2)' : 
                              'rgba(255,255,255,0.03)',
                  border: `1px solid ${val === 1 ? '#10b981' : val === -1 ? '#f43f5e' : 'var(--glass-border)'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                {i === START && <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', position: 'absolute', top: 5, left: 5 }}>START</span>}
                {i === GOAL && <Trophy size={20} color="var(--secondary)" />}
                {botPos === i && (
                  <motion.div layoutId="bot" transition={{ type: 'spring', damping: 20 }}>
                    <Bot size={32} color="var(--primary)" />
                  </motion.div>
                )}
                {val === 1 && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />}
                {val === -1 && <Zap size={16} color="#f43f5e" />}
              </motion.div>
            ))}
          </div>

          {/* Controls & Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass" style={{ padding: '24px' }}>
              <h4 style={{ marginBottom: '16px', fontSize: '0.9rem' }}>ENVIRONMENT BUILDER</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Click tiles to change state:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem' }}>
                    <div style={{ width: '12px', height: '12px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981' }} />
                    <span>GREEN = REWARD (+1.0)</span>
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem' }}>
                    <div style={{ width: '12px', height: '12px', background: 'rgba(244, 63, 94, 0.2)', border: '1px solid #f43f5e' }} />
                    <span>RED = PENALTY (-1.0)</span>
                 </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={runSimulation} 
                className="pulse" 
                style={{ flex: 1, background: 'var(--secondary)' }}
                disabled={isRunning}
              >
                DEPLOY SIMULATION
              </button>
              <button onClick={resetBot} style={{ background: 'transparent' }}>RESET</button>
            </div>

            <div className="glass" style={{ padding: '24px', marginTop: 'auto', borderLeft: '4px solid var(--primary)' }}>
               <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', textTransform: 'uppercase' }}>
                 <Info size={16} /> Intelligence briefing
               </h5>
               <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                 A **Policy** is the robot's strategy. By trying different paths and seeing which ones lead to rewards, the agent eventually learns the optimal "map" of the environment.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExpertZone() {
  const cases = [
    { title: "Healthcare", desc: "AI scans millions of X-rays to find tiny signs of illness that humans might miss.", icon: <Info /> },
    { title: "Environment", desc: "Satellites use AI to track deforestation and predict where wildfires might start.", icon: <Zap /> },
    { title: "Creative", desc: "Generative AI can co-create music and art with human artists, pushing boundaries.", icon: <Bot /> }
  ];

  return (
    <div className="main-content">
      <div className="glass" style={{ padding: '64px', textAlign: 'center' }}>
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{ marginBottom: '32px' }}
        >
          <Trophy size={80} color="var(--secondary)" />
        </motion.div>
        <h1 className="text-gradient">Mission Accomplished!</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', margin: '24px 0 48px', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto' }}>
          You've successfully completed the NeuralQuest initiation. You've learned how data becomes intelligence, and how weights shape perception.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', textAlign: 'left' }}>
          {cases.map((c, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="glass" 
              style={{ padding: '24px' }}
            >
              <div style={{ color: 'var(--primary)', marginBottom: '16px' }}>{React.cloneElement(c.icon, { size: 24 })}</div>
              <h4 style={{ marginBottom: '12px' }}>{c.title}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{c.desc}</p>
            </motion.div>
          ))}
        </div>

        <div style={{ marginTop: '64px' }}>
             <button style={{ padding: '20px 48px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
               Claim Master Certificate
             </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [activeLevel, setActiveLevel] = useState("welcome");
  const [showLog, setShowLog] = useState(false);
  const [discoveredConcepts, setDiscoveredConcepts] = useState([]);

  const addConcept = (title, desc) => {
    if (!discoveredConcepts.find(c => c.title === title)) {
      setDiscoveredConcepts(prev => [...prev, { title, desc }]);
    }
  };

  useEffect(() => {
    // Initial concept
    addConcept("The Turing Era", "Humans once thought machines could only follow lists of instructions. Now, they learn through experience.");
  }, []);

  return (
    <div className="app-container">
      <Sidebar activeLevel={activeLevel} setActiveLevel={setActiveLevel} />
      
      <div style={{ position: 'fixed', top: '40px', right: '40px', zIndex: 100 }}>
        <button 
          onClick={() => setShowLog(true)} 
          className="glass-interactive"
          style={{ background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Info size={18} /> RESEARCH LOG ({discoveredConcepts.length})
        </button>
      </div>

      <AnimatePresence>
        {showLog && <ResearchLog discoveredConcepts={discoveredConcepts} onClose={() => setShowLog(false)} />}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {activeLevel === "welcome" && (
          <WelcomeScreen 
            key="welcome" 
            onStart={() => {
              setActiveLevel("training");
              addConcept("Pattern Recognition", "The core of AI is identifying recurring structures in noisy data.");
            }} 
          />
        )}
        {activeLevel === "training" && <TrainingLab key="training" onConceptDiscovered={addConcept} />}
        {activeLevel === "neural" && <NeuralLab key="neural" onConceptDiscovered={addConcept} />}
        {activeLevel === "rl" && <ReinforcementLab key="rl" onConceptDiscovered={addConcept} />}
        {activeLevel === "expert" && <ExpertZone key="expert" onConceptDiscovered={addConcept} />}
      </AnimatePresence>
    </div>
  );
}

export default App;
