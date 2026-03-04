let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(freq, duration, type = "sine", volume = 0.15) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Audio not available — silently ignore
  }
}

const SOUNDS = {
  success() {
    playTone(523, 0.12, "sine", 0.12);
    setTimeout(() => playTone(659, 0.12, "sine", 0.12), 80);
    setTimeout(() => playTone(784, 0.2, "sine", 0.15), 160);
  },
  error() {
    playTone(300, 0.15, "sawtooth", 0.08);
    setTimeout(() => playTone(220, 0.25, "sawtooth", 0.06), 100);
  },
  click() {
    playTone(800, 0.05, "sine", 0.08);
  },
  rankup() {
    [523, 659, 784, 1047].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, "sine", 0.12), i * 120);
    });
  },
  unlock() {
    playTone(440, 0.1, "triangle", 0.1);
    setTimeout(() => playTone(660, 0.15, "triangle", 0.12), 100);
  },
};

export function playSound(name) {
  if (SOUNDS[name]) SOUNDS[name]();
}

export function registerSound() {
  // No-op: sounds are procedural now
}

export function stopSound() {
  // No-op for procedural sounds
}

export function setVolume() {
  // No-op for procedural sounds
}
