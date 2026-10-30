// ==============================================================
// KHO BÁU TRIẾT HỌC - CINEMATIC 2D ENGINE & MOBILE TOUCH CONTROLS
// ==============================================================

// Multi-oscillator Web Audio Synthesizer
class SoundManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.bgmPlaying = false;
    this.bgmVolume = 0.52;
    this.bgmGain = null;
    this.noiseBuffer = null;
    this.schedulerTimer = null;
    this.currentStep = 0;
    this.nextStepTime = 0;
    this.totalSteps = 256;
    this.stepDuration = (60 / 128) / 4; // 128 BPM, 16th-note steps (~0.117s)

    // Note frequency lookup table
    this.NOTE_FREQ = {
      C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, B2: 123.47,
      C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
      C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
      C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
      C6: 1046.50, D6: 1174.66, E6: 1318.51, F6: 1396.91, G6: 1567.98, A6: 1760.00
    };

    // 16-bar upbeat cheerful adventure theme
    this.leadBars = [
      [[0,'C5'],[2,'E5'],[4,'G5'],[6,'A5'],[8,'G5',2]],
      [[0,'D5'],[2,'F5'],[4,'E5'],[6,'D5'],[8,'E5',2]],
      [[0,'C5'],[2,'E5'],[4,'A5'],[6,'B5'],[8,'C6',2]],
      [[0,'B5'],[2,'A5'],[4,'G5'],[6,'F5'],[8,'E5'],[10,'D5',2]],
      [[0,'C5'],[2,'G5'],[4,'C6'],[6,'B5'],[8,'A5'],[10,'G5',2]],
      [[0,'E5'],[2,'G5'],[4,'B5'],[6,'A5'],[8,'G5',2]],
      [[0,'F5'],[2,'A5'],[4,'C6'],[6,'A5'],[8,'C6',2]],
      [[0,'D6'],[2,'B5'],[4,'G5'],[6,'A5'],[8,'B5'],[10,'D6',2]],
      [[0,'A5'],[2,'C6'],[4,'E6'],[6,'D6'],[8,'C6',2]],
      [[0,'B5'],[2,'D6'],[4,'F6'],[6,'E6'],[8,'D6',2]],
      [[0,'G5'],[2,'B5'],[4,'E6'],[6,'D6'],[8,'C6'],[10,'B5',2]],
      [[0,'A5'],[2,'C6'],[4,'E6'],[6,'G6'],[8,'E6',2]],
      [[0,'F5'],[2,'A5'],[4,'D6'],[6,'C6'],[8,'B5'],[10,'A5',2]],
      [[0,'B5'],[2,'G5'],[4,'A5'],[6,'B5'],[8,'D6',2]],
      [[0,'C6'],[2,'E5'],[4,'G5'],[6,'C6'],[8,'E6'],[10,'D6',2]],
      [[0,'C6'],[2,'G5'],[4,'E5'],[6,'D5'],[8,'C5',2],[12,'D5'],[14,'E5']]
    ];

    this.bassBars = [
      [[0,'C3'],[4,'C3'],[8,'G2'],[12,'C3']],
      [[0,'G2'],[4,'G2'],[8,'D3'],[12,'G2']],
      [[0,'A2'],[4,'A2'],[8,'E3'],[12,'A2']],
      [[0,'F2'],[4,'F2'],[8,'G2'],[12,'G2']],
      [[0,'C3'],[4,'C3'],[8,'G2'],[12,'C3']],
      [[0,'E2'],[4,'E2'],[8,'B2'],[12,'E2']],
      [[0,'F2'],[4,'F2'],[8,'C3'],[12,'F2']],
      [[0,'G2'],[4,'G2'],[8,'D3'],[12,'B2']],
      [[0,'F2'],[4,'F2'],[8,'C3'],[12,'F2']],
      [[0,'G2'],[4,'G2'],[8,'D3'],[12,'G2']],
      [[0,'E2'],[4,'E2'],[8,'B2'],[12,'E2']],
      [[0,'A2'],[4,'A2'],[8,'E3'],[12,'A2']],
      [[0,'D3'],[4,'D3'],[8,'A2'],[12,'D3']],
      [[0,'G2'],[4,'G2'],[8,'D3'],[12,'G2']],
      [[0,'C3'],[4,'C3'],[8,'G2'],[12,'C3']],
      [[0,'G2'],[4,'A2'],[8,'B2'],[12,'D3']]
    ];

    this.arpBars = [
      [[2,'E4'],[6,'G4'],[10,'C5'],[14,'E4']],
      [[2,'D4'],[6,'G4'],[10,'B4'],[14,'D4']],
      [[2,'C4'],[6,'E4'],[10,'A4'],[14,'C4']],
      [[2,'C4'],[6,'F4'],[10,'A4'],[14,'B4']],
      [[2,'E4'],[6,'G4'],[10,'C5'],[14,'E4']],
      [[2,'E4'],[6,'G4'],[10,'B4'],[14,'E4']],
      [[2,'F4'],[6,'A4'],[10,'C5'],[14,'F4']],
      [[2,'D4'],[6,'G4'],[10,'B4'],[14,'G4']],
      [[2,'F4'],[6,'A4'],[10,'C5'],[14,'F4']],
      [[2,'D4'],[6,'G4'],[10,'B4'],[14,'G4']],
      [[2,'E4'],[6,'G4'],[10,'B4'],[14,'E4']],
      [[2,'C4'],[6,'E4'],[10,'A4'],[14,'C4']],
      [[2,'D4'],[6,'F4'],[10,'A4'],[14,'D4']],
      [[2,'D4'],[6,'G4'],[10,'B4'],[14,'G4']],
      [[2,'E4'],[6,'G4'],[10,'C5'],[14,'E4']],
      [[2,'D4'],[6,'G4'],[10,'B4'],[14,'D4']]
    ];
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(this.enabled ? this.bgmVolume : 0, this.ctx.currentTime);
        this.bgmGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Start cheerful upbeat background music
  startBGM() {
    this.init();
    if (!this.ctx) return;
    if (this.bgmPlaying) return;
    this.bgmPlaying = true;
    if (this.bgmGain) {
      this.bgmGain.gain.setValueAtTime(this.enabled ? this.bgmVolume : 0, this.ctx.currentTime);
    }
    this.currentStep = 0;
    this.nextStepTime = this.ctx.currentTime + 0.05;
    if (this.schedulerTimer) clearInterval(this.schedulerTimer);
    this.schedulerTimer = setInterval(() => this.runScheduler(), 40);
  }

  pauseBGM() {
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.bgmGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);
    }
  }

  resumeBGM() {
    this.init();
    if (!this.bgmPlaying) {
      this.startBGM();
      return;
    }
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.bgmGain.gain.linearRampToValueAtTime(this.bgmVolume, this.ctx.currentTime + 0.12);
    }
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.resumeBGM();
    } else {
      this.pauseBGM();
    }
  }

  duckBGM(duration = 1.2) {
    if (!this.bgmGain || !this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    this.bgmGain.gain.cancelScheduledValues(now);
    this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, now);
    this.bgmGain.gain.linearRampToValueAtTime(this.bgmVolume * 0.25, now + 0.06);
    this.bgmGain.gain.linearRampToValueAtTime(this.bgmVolume, now + duration);
  }

  runScheduler() {
    if (!this.ctx || !this.bgmPlaying) return;
    const lookahead = 0.16;
    while (this.nextStepTime < this.ctx.currentTime + lookahead) {
      if (this.enabled) {
        this.scheduleStep(this.currentStep, this.nextStepTime);
      }
      this.nextStepTime += this.stepDuration;
      this.currentStep = (this.currentStep + 1) % this.totalSteps;
    }
  }

  scheduleStep(step, time) {
    const barIdx = Math.floor(step / 16);
    const barStep = step % 16;

    // 1. Lead Melody
    const barLead = this.leadBars[barIdx];
    if (barLead) {
      for (let i = 0; i < barLead.length; i++) {
        const item = barLead[i];
        if (item[0] === barStep) {
          const freq = this.NOTE_FREQ[item[1]];
          const mult = item[2] || 1;
          this.playLead(freq, time, this.stepDuration * mult * 1.15, 0.22);
          break;
        }
      }
    }

    // 2. Bouncy Bass
    const barBass = this.bassBars[barIdx];
    if (barBass) {
      for (let i = 0; i < barBass.length; i++) {
        const item = barBass[i];
        if (item[0] === barStep) {
          const freq = this.NOTE_FREQ[item[1]];
          this.playBass(freq, time, this.stepDuration * 2.2, 0.22);
          break;
        }
      }
    }

    // 3. Playful Arpeggio
    const barArp = this.arpBars[barIdx];
    if (barArp) {
      for (let i = 0; i < barArp.length; i++) {
        const item = barArp[i];
        if (item[0] === barStep) {
          const freq = this.NOTE_FREQ[item[1]];
          this.playArp(freq, time, this.stepDuration * 1.5, 0.10);
          break;
        }
      }
    }

    // 4. Cheerful Rhythm & Percussion
    // Kick on beats 1 and 3 (steps 0, 8)
    if (barStep === 0 || barStep === 8 || (barIdx === 15 && barStep === 14)) {
      this.playKick(time, 0.18);
    }
    // Snare on beats 2 and 4 (steps 4, 12)
    if (barStep === 4 || barStep === 12) {
      this.playSnare(time, 0.10);
    }
    // Hi-hat on 8th notes
    if (barStep % 2 === 0) {
      this.playHiHat(time, barStep % 4 === 2 ? 0.07 : 0.05);
    }
  }

  getNoiseBuffer() {
    if (this.noiseBuffer) return this.noiseBuffer;
    if (!this.ctx) return null;
    const len = Math.floor(this.ctx.sampleRate * 0.1);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buf;
    return buf;
  }

  playLead(freq, time, dur = 0.15, vol = 0.22) {
    if (!this.enabled || !this.ctx || !freq || !this.bgmGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3600, time);
    filter.frequency.exponentialRampToValueAtTime(1800, time + dur);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(time);
    osc.stop(time + dur);
  }

  playBass(freq, time, dur = 0.22, vol = 0.22) {
    if (!this.enabled || !this.ctx || !freq || !this.bgmGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.linearRampToValueAtTime(vol * 0.7, time + dur * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(time);
    osc.stop(time + dur);
  }

  playArp(freq, time, dur = 0.12, vol = 0.10) {
    if (!this.enabled || !this.ctx || !freq || !this.bgmGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(time);
    osc.stop(time + dur);
  }

  playKick(time, vol = 0.18) {
    if (!this.enabled || !this.ctx || !this.bgmGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.09);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.10);

    osc.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(time);
    osc.stop(time + 0.10);
  }

  playSnare(time, vol = 0.10) {
    if (!this.enabled || !this.ctx || !this.bgmGain) return;
    const buf = this.getNoiseBuffer();
    if (!buf) return;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, time);
    filter.Q.setValueAtTime(1.4, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);

    src.start(time);
    src.stop(time + 0.08);
  }

  playHiHat(time, vol = 0.06) {
    if (!this.enabled || !this.ctx || !this.bgmGain) return;
    const buf = this.getNoiseBuffer();
    if (!buf) return;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7500, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.035);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);

    src.start(time);
    src.stop(time + 0.035);
  }

  playChestOpen() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(960, now + 0.3);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  playCorrectFanfare() {
    if (!this.enabled || !this.ctx) return;
    if (this.bgmPlaying) this.duckBGM(0.7);
    // Triumphant chord progression: C5 -> E5 -> G5 -> C6
    const chord = [523.25, 659.25, 783.99, 1046.50];
    chord.forEach((freq, idx) => {
      const start = this.ctx.currentTime + idx * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.25, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.45);
    });
  }

  playWrongBuzz() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.setValueAtTime(110, now + 0.12);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  playCardHover() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(800, now + 0.08);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  playCardFlip() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.12);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  playCardPowerup() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    // Harmonic explosion
    [440, 554.37, 659.25, 880].forEach(f => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 2, now + 0.4);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    });
  }

  playMatchStart() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    [261.63, 329.63, 392.00, 523.25].forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now + idx * 0.08);
      osc.linearRampToValueAtTime(f * 1.4, now + idx * 0.08 + 0.35);
      gain.gain.setValueAtTime(0.18, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.5);
    });
  }

  playWarningTick() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  playVictoryFanfare() {
    if (!this.enabled || !this.ctx) return;
    if (this.bgmPlaying) this.duckBGM(2.2);
    const notes = [
      { f: 523.25, t: 0.00, d: 0.16 },
      { f: 659.25, t: 0.14, d: 0.16 },
      { f: 783.99, t: 0.28, d: 0.20 },
      { f: 1046.50, t: 0.46, d: 0.55 },
      { f: 1318.51, t: 0.68, d: 0.75 },
    ];
    notes.forEach(n => {
      const start = this.ctx.currentTime + n.t;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, start);
      gain.gain.setValueAtTime(0.28, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + n.d);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + n.d);
    });
  }
}

const sound = new SoundManager();

// Game State
const state = {
  socket: null,
  playerId: null,
  player: {
    x: 450,
    y: 450,
    targetX: null,
    targetY: null,
    name: 'Explorer',
    gender: 'male',
    outfitColor: '#10B981',
    hatColor: '#8B5A2B',
    color: '#10B981',
    score: 0,
    treasuresFound: 0,
    questionsAnswered: 0,
    correct: 0,
    wrong: 0,
    completedTreasures: [],
    failedTreasures: [],
    treasureAttempts: {},
    direction: 'down',
    moving: false,
    speed: 2,
    animFrame: 0
  },
  otherPlayers: {}, // id -> { x, y, targetX, targetY, name, color, score, direction, moving, animFrame }
  treasures: [],
  world: { width: 3600, height: 2700 },
  keys: { up: false, down: false, left: false, right: false },
  joystick: { active: false, startX: 0, startY: 0, dx: 0, dy: 0, touchId: null },
  closestTreasure: null,
  activeQuestion: null,
  pendingDrawId: null,
  pendingCards: [],
  floatingTexts: [],
  particles: [],
  fireflies: [],
  beaconTime: 0,
  matchState: {
    status: 'waiting',
    duration: 600,
    remainingSeconds: 600,
    rankings: []
  }
};

// Canvas references
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const minimapCanvas = document.getElementById('minimapCanvas');
const minimapCtx = minimapCanvas.getContext('2d');
const screenShakeWrapper = document.getElementById('screen-shake-wrapper');

// UI DOM references
const loginModal = document.getElementById('login-modal');
const btnStartGame = document.getElementById('btn-start-game');
const playerNameInput = document.getElementById('player-name-input');
const colorSwatches = document.querySelectorAll('.color-swatch');
const mobileIpDisplay = document.getElementById('mobile-ip-display');

const hudRegionName = document.getElementById('hud-region-name');
const hudOnlineCount = document.getElementById('hud-online-count');
const hudScore = document.getElementById('hud-score');
const hudTreasures = document.getElementById('hud-treasures');
const hudAccuracy = document.getElementById('hud-accuracy');
const btnToggleSound = document.getElementById('btn-toggle-sound');
const proximityPrompt = document.getElementById('proximity-prompt');
const eventTicker = document.getElementById('event-ticker');

// HUD Match Timer DOM
const hudMatchTimerBox = document.getElementById('match-timer-box');
const hudTimerStatus = document.getElementById('hud-timer-status');
const hudTimerDigits = document.getElementById('hud-timer-digits');
const btnOpenLeaderboard = document.getElementById('btn-open-leaderboard');

// Rankings / Podium Modal DOM
const rankingsModal = document.getElementById('rankings-modal');
const btnCloseRankings = document.getElementById('btn-close-rankings');
const btnRankingsClose = document.getElementById('btn-rankings-close');
const rankingsTableBody = document.getElementById('rankings-table-body');
const confettiCanvas = document.getElementById('confetti-canvas');
const podiumCanvas1 = document.getElementById('podiumCanvas1');
const podiumCanvas2 = document.getElementById('podiumCanvas2');
const podiumCanvas3 = document.getElementById('podiumCanvas3');

// QR Code DOM Elements
const loginQrThumbImg = document.getElementById('login-qr-thumb-img');
const loginQrSpinner = document.getElementById('login-qr-spinner');
const btnLoginOpenQr = document.getElementById('btn-login-open-qr');
const loginQrThumbBox = document.getElementById('login-qr-thumb-box');
const btnOpenPlayerQr = document.getElementById('btn-open-player-qr');
const playerQrModal = document.getElementById('player-qr-modal');
const modalQrCodeImg = document.getElementById('modal-qr-code-img');
const modalQrLoading = document.getElementById('modal-qr-loading');
const modalQrUrlInput = document.getElementById('modal-qr-url-input');
const btnCopyPlayerQr = document.getElementById('btn-copy-player-qr');
const playerCopySuccess = document.getElementById('player-copy-success');
const btnClosePlayerQr = document.getElementById('btn-close-player-qr');

// Mission Completed Modal DOM
const missionCompletedModal = document.getElementById('mission-completed-modal');
const missionCompletedMsg = document.getElementById('mission-completed-msg');
const btnMissionCompletedClose = document.getElementById('btn-mission-completed-close');
const persistentCompletionBanner = document.getElementById('persistent-completion-banner');
const podiumCompletionBanner = document.getElementById('podium-completion-banner');

if (btnMissionCompletedClose) {
  btnMissionCompletedClose.addEventListener('click', () => {
    if (missionCompletedModal) {
      missionCompletedModal.classList.remove('active');
      missionCompletedModal.classList.add('hidden');
    }
  });
}

let cachedQrCodeDataUrl = '';
let cachedMobileUrl = '';

function setQrCodeData(dataUrl, mobileUrl, isOnlineMode = false) {
  if (dataUrl) cachedQrCodeDataUrl = dataUrl;
  if (mobileUrl) cachedMobileUrl = mobileUrl;

  const modeBadge = document.querySelector('#login-mobile-box .mobile-badge');
  const modalGuide = document.querySelector('.player-qr-guide');

  if (isOnlineMode || (cachedMobileUrl && cachedMobileUrl.includes('trycloudflare.com'))) {
    if (modeBadge) modeBadge.textContent = '🌐 CHƠI QUA 4G / ONLINE TOÀN CẦU';
    if (modalGuide) modalGuide.innerHTML = `Mở <strong>Camera</strong> hoặc <strong>Zalo</strong> quét mã QR (chơi từ xa qua <strong>4G, 5G</strong> hoặc <strong>mọi mạng Wi-Fi</strong>):`;
  } else {
    if (modeBadge) modeBadge.textContent = '📱 CHƠI BẰNG ĐIỆN THOẠI (WI-FI)';
    if (modalGuide) modalGuide.innerHTML = `Mở <strong>Camera</strong> hoặc <strong>Zalo</strong> quét mã QR (điện thoại kết nối <strong>chung Wi-Fi</strong>):`;
  }

  if (loginQrThumbImg && cachedQrCodeDataUrl) {
    loginQrThumbImg.src = cachedQrCodeDataUrl;
    loginQrThumbImg.style.display = 'block';
    if (loginQrSpinner) loginQrSpinner.style.display = 'none';
  }
  if (modalQrCodeImg && cachedQrCodeDataUrl) {
    modalQrCodeImg.src = cachedQrCodeDataUrl;
    modalQrCodeImg.style.display = 'block';
    if (modalQrLoading) modalQrLoading.style.display = 'none';
  }
  if (modalQrUrlInput && cachedMobileUrl) {
    modalQrUrlInput.value = cachedMobileUrl;
  }
  if (mobileIpDisplay && cachedMobileUrl) {
    mobileIpDisplay.innerHTML = `🌐 <a href="${cachedMobileUrl}" target="_blank" style="color:#fde68a;">${cachedMobileUrl}</a>`;
  }
}

// Modals
const questionModal = document.getElementById('question-modal');
const btnCloseQuestion = document.getElementById('btn-close-question');
const qThemeTag = document.getElementById('q-theme-tag');
const qTitle = document.getElementById('q-title');
const qScenario = document.getElementById('q-scenario');
const qOptionsList = document.getElementById('q-options-list');
const qCustomAnswer = document.getElementById('q-custom-answer');
const btnSubmitAnswer = document.getElementById('btn-submit-answer');
const qFeedback = document.getElementById('q-feedback');
const feedbackIcon = document.getElementById('feedback-icon');
const feedbackTitle = document.getElementById('feedback-title');
const feedbackDesc = document.getElementById('feedback-desc');

const cardDrawModal = document.getElementById('card-draw-modal');
const cardsContainer = document.getElementById('cards-container');
const cardStatusMsg = document.getElementById('card-status-msg');

const broadcastBanner = document.getElementById('broadcast-banner');
const bannerTitle = document.getElementById('banner-title');
const bannerText = document.getElementById('banner-text');

// Mobile Touch Elements
const touchJoystickZone = document.getElementById('touch-joystick-zone');
const joystickBase = document.getElementById('joystick-base');
const joystickStick = document.getElementById('joystick-stick');
const mobileInteractBtn = document.getElementById('mobile-interact-btn');

// ==============================================================
// ADVANCED WORLD MAP & BIOMES DEFINITION (3600 x 2700)
// ==============================================================
const BIOMES = [
  { name: 'Đồng Cỏ Tri Thức', x: 0, y: 0, w: 1000, h: 1100, ground: '#1c3e20', groundLight: '#25502a', border: '#2d6a33', theme: 'grass' },
  { name: 'Rừng Sâu Đạo Đức', x: 1000, y: 0, w: 850, h: 1100, ground: '#112916', groundLight: '#18381e', border: '#1f4826', theme: 'forest' },
  { name: 'Đền Cổ Bản Ngã', x: 1850, y: 0, w: 900, h: 1100, ground: '#282b3a', groundLight: '#333748', border: '#454a61', theme: 'temple' },
  { name: 'Tàn Tích Chân Lý', x: 2750, y: 0, w: 850, h: 1100, ground: '#463320', groundLight: '#573f27', border: '#6e5033', theme: 'ruins' },
  { name: 'Hang Động Tự Do', x: 0, y: 1100, w: 1000, h: 1600, ground: '#161422', groundLight: '#1f1b31', border: '#2e284b', theme: 'cave' },
  { name: 'Hồ Nước Ý Thức', x: 1000, y: 1100, w: 850, h: 1600, ground: '#091e2e', groundLight: '#0d283e', border: '#133958', theme: 'lake' },
  { name: 'Đền Cổ Bản Ngã (Nam)', x: 1850, y: 1100, w: 900, h: 1600, ground: '#222432', groundLight: '#2a2d3e', border: '#3b3f55', theme: 'temple' },
  { name: 'Tàn Tích Chân Lý (Nam)', x: 2750, y: 1100, w: 850, h: 1600, ground: '#38281a', groundLight: '#453120', border: '#593f29', theme: 'ruins' }
];

// Road Network Waypoints Connecting All 30 Chest Locations
const ROAD_SEGMENTS = [
  // Highway 1: Grassland to Northern Border
  [[450, 400], [250, 250]],
  [[450, 400], [820, 280], [1250, 320], [1520, 220], [1780, 350]],
  // Highway 2: Forest to Temple to Ruins
  [[1780, 350], [2150, 420], [2450, 280], [2650, 450], [2980, 520], [3350, 380]],
  [[2980, 520], [3200, 750]],
  // Highway 3: Socrates Plaza -> South Grasslands -> Cave of Free Will
  [[450, 400], [320, 720], [750, 850], [420, 1350], [780, 1450], [520, 1850], [280, 2200], [750, 2450]],
  // Highway 4: Forest South -> Lake of Consciousness Promenade
  [[1250, 320], [1350, 680], [1680, 820], [1450, 1350], [1720, 1550], [1320, 1850], [1680, 2150], [1400, 2480]],
  // Highway 5: Temple North to Temple South & Ruins South
  [[2150, 420], [2100, 1400], [2480, 1650], [2950, 1650], [3380, 1950]],
  [[1720, 1550], [2100, 1400]]
];

const WORLD_FOLIAGE = [];
const WORLD_LIGHTS = [];
const AMBIENT_PARTICLES = [];

(function initWorldMapData() {
  // 1. Roadside Lamp Posts (40 across 3600x2700 map)
  const lampPositions = [
    [450, 460], [350, 300], [650, 320], [820, 330], [1050, 310], [1250, 380], [1400, 250], [1650, 300],
    [1950, 380], [2150, 480], [2300, 330], [2550, 380], [2800, 480], [2980, 580], [3150, 440], [3350, 440],
    [3200, 820], [380, 600], [320, 780], [550, 800], [750, 920], [420, 1250], [600, 1400], [780, 1520],
    [520, 1780], [380, 2050], [280, 2280], [520, 2350], [750, 2520], [1350, 750], [1680, 890], [1450, 1250],
    [1720, 1620], [1320, 1920], [1680, 2220], [1400, 2550], [2100, 1480], [2480, 1720], [2950, 1720], [3380, 2020]
  ];
  lampPositions.forEach(([lx, ly]) => {
    WORLD_FOLIAGE.push({ x: lx, y: ly, type: 'lamppost', scale: 1 });
    WORLD_LIGHTS.push({ x: lx, y: ly - 36, r: 95, color: 'rgba(253, 224, 71, 0.45)', type: 'lantern' });
  });

  // 2. Oak Trees in Grasslands (0..1000, 0..1100)
  const grassTrees = [
    [120, 100], [280, 80], [400, 150], [150, 240], [200, 350], [120, 480], [220, 580], [380, 620],
    [150, 750], [260, 850], [380, 920], [520, 180], [580, 280], [620, 520], [80, 620], [320, 280],
    [650, 120], [780, 150], [920, 180], [880, 380], [600, 720], [850, 720], [150, 980], [320, 1020], [680, 980]
  ];
  grassTrees.forEach(([tx, ty]) => {
    WORLD_FOLIAGE.push({ x: tx, y: ty, type: 'oak', scale: 0.9 + Math.sin(tx + ty) * 0.25 });
  });

  // 3. Dense Forest Pines and Ancient Oaks in Moral Forest (1000..1850, 0..1100)
  const forestTrees = [
    [1080, 120], [1180, 80], [1320, 140], [1460, 90], [1620, 120], [1760, 140], [1820, 240],
    [1120, 240], [1200, 280], [1380, 260], [1480, 320], [1650, 260], [1720, 380], [1820, 480],
    [1080, 450], [1180, 520], [1280, 480], [1420, 540], [1560, 480], [1680, 560], [1800, 640],
    [1120, 680], [1220, 750], [1380, 820], [1520, 740], [1620, 880], [1780, 840], [1200, 960],
    [1360, 980], [1520, 960], [1680, 1020], [1820, 980]
  ];
  forestTrees.forEach(([tx, ty], i) => {
    WORLD_FOLIAGE.push({ x: tx, y: ty, type: (i % 2 === 0 ? 'pine' : 'ancient_oak'), scale: 1.0 + (i % 3) * 0.15 });
  });

  // 4. Cypress Trees in Temple of the Self (1850..2750, 0..1100)
  const templeCypress = [
    [1920, 120], [2050, 90], [2250, 140], [2400, 90], [2580, 130], [2700, 150],
    [1900, 260], [1980, 320], [2320, 240], [2520, 260], [2680, 320], [1880, 520],
    [1980, 580], [2280, 520], [2420, 540], [2580, 520], [2720, 580], [1920, 720],
    [2020, 780], [2240, 740], [2380, 820], [2560, 780], [2700, 840], [1950, 950],
    [2120, 980], [2300, 960], [2480, 1020], [2680, 980]
  ];
  templeCypress.forEach(([tx, ty]) => {
    WORLD_FOLIAGE.push({ x: tx, y: ty, type: 'cypress', scale: 0.95 + Math.sin(tx) * 0.2 });
  });

  // 5. Desert Palms in Ruins of Truth (2750..3600, 0..2700)
  const ruinPalms = [
    [2820, 150], [2980, 110], [3140, 140], [3320, 110], [3480, 150], [2850, 320],
    [3100, 280], [3450, 290], [2800, 650], [3380, 620], [3520, 680], [2880, 850],
    [3080, 920], [3320, 950], [3500, 880], [2820, 1250], [3050, 1320], [3280, 1280],
    [3460, 1360], [2850, 1520], [3120, 1580], [3350, 1540], [3520, 1620], [2880, 1820],
    [3150, 1860], [3480, 1840], [2900, 2150], [3180, 2220], [3420, 2180], [2950, 2450],
    [3200, 2520], [3450, 2480]
  ];
  ruinPalms.forEach(([tx, ty]) => {
    WORLD_FOLIAGE.push({ x: tx, y: ty, type: 'palm', scale: 0.9 + Math.sin(ty) * 0.25 });
  });

  // 6. Giant Bioluminescent Mushrooms & Crystals in Cave of Free Will (0..1000, 1100..2700)
  const caveFlora = [
    [150, 1180, 'mushroom', '#a855f7'], [320, 1150, 'crystal', '#38bdf8'], [550, 1180, 'crystal', '#c084fc'],
    [750, 1220, 'mushroom', '#06b6d4'], [920, 1180, 'crystal', '#a855f7'], [180, 1380, 'crystal', '#38bdf8'],
    [520, 1320, 'mushroom', '#ec4899'], [850, 1380, 'crystal', '#06b6d4'], [240, 1580, 'mushroom', '#a855f7'],
    [620, 1550, 'crystal', '#c084fc'], [900, 1580, 'mushroom', '#06b6d4'], [160, 1780, 'crystal', '#38bdf8'],
    [380, 1750, 'mushroom', '#a855f7'], [720, 1780, 'crystal', '#06b6d4'], [920, 1750, 'mushroom', '#ec4899'],
    [150, 2020, 'mushroom', '#c084fc'], [420, 2050, 'crystal', '#38bdf8'], [680, 2020, 'mushroom', '#06b6d4'],
    [880, 2080, 'crystal', '#a855f7'], [200, 2350, 'crystal', '#ec4899'], [450, 2320, 'mushroom', '#38bdf8'],
    [620, 2380, 'crystal', '#c084fc'], [880, 2320, 'mushroom', '#06b6d4'], [180, 2580, 'mushroom', '#a855f7'],
    [480, 2550, 'crystal', '#38bdf8'], [780, 2580, 'mushroom', '#ec4899']
  ];
  caveFlora.forEach(([tx, ty, type, col]) => {
    WORLD_FOLIAGE.push({ x: tx, y: ty, type, color: col, scale: 0.95 + Math.sin(tx + ty) * 0.3 });
    WORLD_LIGHTS.push({ x: tx, y: ty - 14, r: 85, color: col, type: 'crystal' });
  });

  // 7. Southern Temple Trees (1850..2750, 1100..2700)
  const southTempleTrees = [
    [1920, 1220], [2150, 1180], [2380, 1240], [2620, 1180], [1950, 1450], [2280, 1420],
    [2550, 1480], [2700, 1420], [1920, 1680], [2180, 1720], [2420, 1680], [2680, 1740],
    [1950, 1950], [2220, 1980], [2450, 1940], [2680, 2020], [1920, 2240], [2180, 2280],
    [2450, 2240], [2680, 2320], [1950, 2520], [2250, 2550], [2500, 2520], [2700, 2580]
  ];
  southTempleTrees.forEach(([tx, ty]) => {
    WORLD_FOLIAGE.push({ x: tx, y: ty, type: 'cypress', scale: 0.95 + Math.sin(tx) * 0.2 });
  });

  // 8. Special Landmark Lights
  WORLD_LIGHTS.push({ x: 450, y: 350, r: 120, color: 'rgba(251, 191, 36, 0.45)', type: 'brazier' });
  WORLD_LIGHTS.push({ x: 1480, y: 200, r: 90, color: 'rgba(253, 224, 71, 0.4)', type: 'lantern' });
  WORLD_LIGHTS.push({ x: 1560, y: 200, r: 90, color: 'rgba(253, 224, 71, 0.4)', type: 'lantern' });
  WORLD_LIGHTS.push({ x: 2150, y: 350, r: 130, color: 'rgba(249, 115, 22, 0.5)', type: 'fire' });
  WORLD_LIGHTS.push({ x: 2450, y: 250, r: 110, color: 'rgba(249, 115, 22, 0.5)', type: 'fire' });
  WORLD_LIGHTS.push({ x: 2980, y: 500, r: 150, color: 'rgba(239, 68, 68, 0.55)', type: 'campfire' });
  WORLD_LIGHTS.push({ x: 3350, y: 360, r: 140, color: 'rgba(250, 204, 21, 0.45)', type: 'obelisk' });
  WORLD_LIGHTS.push({ x: 420, y: 1340, r: 140, color: 'rgba(168, 85, 247, 0.5)', type: 'crystal' });
  WORLD_LIGHTS.push({ x: 1450, y: 1220, r: 180, color: 'rgba(56, 189, 248, 0.55)', type: 'spirit_tree' });
  WORLD_LIGHTS.push({ x: 480, y: 1830, r: 105, color: 'rgba(245, 158, 11, 0.48)', type: 'lantern' });
  WORLD_LIGHTS.push({ x: 560, y: 1830, r: 105, color: 'rgba(245, 158, 11, 0.48)', type: 'lantern' });
  WORLD_LIGHTS.push({ x: 2100, y: 1380, r: 110, color: 'rgba(56, 189, 248, 0.45)', type: 'fountain' });
  WORLD_LIGHTS.push({ x: 1400, y: 2450, r: 150, color: 'rgba(251, 191, 36, 0.5)', type: 'bodhi_tree' });

  // 9. Ambient Particles (120 particles across 3600x2700)
  for (let i = 0; i < 120; i++) {
    const biomeIdx = i % BIOMES.length;
    const b = BIOMES[biomeIdx];
    AMBIENT_PARTICLES.push({
      x: b.x + Math.random() * b.w,
      y: b.y + Math.random() * b.h,
      vx: (Math.random() - 0.4) * 0.6,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2.8 + 1.2,
      phase: Math.random() * Math.PI * 2,
      theme: b.theme,
      baseX: b.x,
      baseW: b.w,
      baseY: b.y,
      baseH: b.h
    });
  }
})();

// Fetch network IP for mobile connection display
fetch('/api/network-info')
  .then(res => res.json())
  .then(data => {
    setQrCodeData(data.qrCodeDataUrl, data.activeUrl || data.mobileUrl, data.isOnlineMode);
  })
  .catch(() => {
    if (mobileIpDisplay) mobileIpDisplay.textContent = 'http://localhost:3000';
  });

// Resize Canvas
function resizeCanvas() {
  const w = window.visualViewport ? window.visualViewport.width : window.innerWidth;
  const h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  canvas.width = Math.floor(w);
  canvas.height = Math.floor(h);
}
window.addEventListener('resize', resizeCanvas);
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', resizeCanvas);
}
resizeCanvas();

// Character Customization State
let selectedGender = 'male';
let selectedOutfitColor = '#10B981';
let selectedHatColor = '#8B5A2B';

// Login Gender Selector
document.querySelectorAll('.btn-gender').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.btn-gender').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedGender = btn.getAttribute('data-gender');
    state.player.gender = selectedGender;
  });
});

// Login Outfit Palette
document.querySelectorAll('#outfit-color-palette .color-swatch').forEach(swatch => {
  swatch.addEventListener('click', () => {
    document.querySelectorAll('#outfit-color-palette .color-swatch').forEach(s => s.classList.remove('active'));
    swatch.classList.add('active');
    selectedOutfitColor = swatch.getAttribute('data-color');
    state.player.outfitColor = selectedOutfitColor;
    state.player.color = selectedOutfitColor;
  });
});

// Login Hat Palette
document.querySelectorAll('#hat-color-palette .hat-swatch').forEach(swatch => {
  swatch.addEventListener('click', () => {
    document.querySelectorAll('#hat-color-palette .hat-swatch').forEach(s => s.classList.remove('active'));
    swatch.classList.add('active');
    selectedHatColor = swatch.getAttribute('data-color');
    state.player.hatColor = selectedHatColor;
  });
});

// Sound Toggle
btnToggleSound.addEventListener('click', () => {
  sound.init();
  sound.toggle();
  btnToggleSound.textContent = sound.enabled ? '🔊' : '🔇';
  btnToggleSound.style.opacity = sound.enabled ? '1' : '0.5';
});

// Auto-resume / Start BGM on first user interaction once in game
['click', 'touchstart', 'keydown'].forEach(evtType => {
  window.addEventListener(evtType, () => {
    if (sound.enabled && !sound.bgmPlaying && state.socket) {
      sound.init();
      sound.startBGM();
    }
  }, { passive: true });
});

// Pause BGM when tab is inactive, resume when returning
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    sound.pauseBGM();
  } else if (sound.enabled && sound.bgmPlaying) {
    sound.resumeBGM();
  }
});

// In-Game Wardrobe Modal Handlers
const btnOpenWardrobe = document.getElementById('btn-open-wardrobe');
const wardrobeModal = document.getElementById('wardrobe-modal');
const btnCloseWardrobe = document.getElementById('btn-close-wardrobe');
const btnSaveWardrobe = document.getElementById('btn-save-wardrobe');

let wardrobeGender = 'male';
let wardrobeOutfit = '#10B981';
let wardrobeHat = '#8B5A2B';

if (btnOpenWardrobe) {
  btnOpenWardrobe.addEventListener('click', () => {
    wardrobeGender = state.player.gender || 'male';
    wardrobeOutfit = state.player.outfitColor || '#10B981';
    wardrobeHat = state.player.hatColor || '#8B5A2B';

    // Sync active classes
    document.querySelectorAll('.btn-wardrobe-gender').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-gender') === wardrobeGender);
    });
    document.querySelectorAll('#wardrobe-outfit-palette .color-swatch').forEach(s => {
      s.classList.toggle('active', s.getAttribute('data-color') === wardrobeOutfit);
    });
    document.querySelectorAll('#wardrobe-hat-palette .hat-swatch').forEach(s => {
      s.classList.toggle('active', s.getAttribute('data-color') === wardrobeHat);
    });

    wardrobeModal.classList.remove('hidden');
    wardrobeModal.classList.add('active');
  });
}

if (btnCloseWardrobe) {
  btnCloseWardrobe.addEventListener('click', () => {
    wardrobeModal.classList.remove('active');
    wardrobeModal.classList.add('hidden');
  });
}

document.querySelectorAll('.btn-wardrobe-gender').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.btn-wardrobe-gender').forEach(btn => btn.classList.remove('active'));
    b.classList.add('active');
    wardrobeGender = b.getAttribute('data-gender');
  });
});

document.querySelectorAll('#wardrobe-outfit-palette .color-swatch').forEach(s => {
  s.addEventListener('click', () => {
    document.querySelectorAll('#wardrobe-outfit-palette .color-swatch').forEach(sw => sw.classList.remove('active'));
    s.classList.add('active');
    wardrobeOutfit = s.getAttribute('data-color');
  });
});

document.querySelectorAll('#wardrobe-hat-palette .hat-swatch').forEach(s => {
  s.addEventListener('click', () => {
    document.querySelectorAll('#wardrobe-hat-palette .hat-swatch').forEach(sw => sw.classList.remove('active'));
    s.classList.add('active');
    wardrobeHat = s.getAttribute('data-color');
  });
});

if (btnSaveWardrobe) {
  btnSaveWardrobe.addEventListener('click', () => {
    state.player.gender = wardrobeGender;
    state.player.outfitColor = wardrobeOutfit;
    state.player.hatColor = wardrobeHat;
    state.player.color = wardrobeOutfit;

    if (state.socket) {
      state.socket.emit('change_appearance', {
        gender: wardrobeGender,
        outfitColor: wardrobeOutfit,
        hatColor: wardrobeHat
      });
    }

    sound.playCardPowerup();
    spawnBurstParticles(state.player.x, state.player.y, wardrobeOutfit, 30);
    addTickerItem('✨ Bạn vừa cập nhật trang phục mới!');
    wardrobeModal.classList.remove('active');
    wardrobeModal.classList.add('hidden');
  });
}

// Setup Player & Socket
btnStartGame.addEventListener('click', () => {
  sound.init();
  sound.startBGM();
  const name = playerNameInput.value.trim() || 'Explorer';
  
  // Use sessionStorage so multiple tabs in the same browser are distinct players!
  localStorage.removeItem('philo_player_id');
  let pid = sessionStorage.getItem('philo_player_id');
  if (!pid) {
    pid = 'p_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
    sessionStorage.setItem('philo_player_id', pid);
  }

  state.playerId = pid;
  state.player.name = name;
  state.player.gender = selectedGender;
  state.player.outfitColor = selectedOutfitColor;
  state.player.hatColor = selectedHatColor;
  state.player.color = selectedOutfitColor;

  loginModal.classList.remove('active');
  loginModal.classList.add('hidden');

  connectSocket();
});

// Connect to Socket.IO
function connectSocket() {
  state.socket = io();

  state.socket.on('connect', () => {
    console.log('[SOCKET] Connected to game server.');
    state.socket.emit('join_game', {
      playerId: state.playerId,
      playerName: state.player.name,
      gender: state.player.gender,
      outfitColor: state.player.outfitColor,
      hatColor: state.player.hatColor,
      playerColor: state.player.outfitColor
    });
  });

  state.socket.on('player_id_assigned', (data) => {
    state.playerId = data.playerId;
    sessionStorage.setItem('philo_player_id', data.playerId);
  });

  state.socket.on('init_game', (data) => {
    state.player.x = data.self.x || 450;
    state.player.y = data.self.y || 450;
    state.player.gender = data.self.gender || state.player.gender || 'male';
    state.player.outfitColor = data.self.outfitColor || state.player.outfitColor || '#10B981';
    state.player.hatColor = data.self.hatColor || state.player.hatColor || '#8B5A2B';
    state.player.color = state.player.outfitColor;
    state.player.score = data.self.score || 0;
    state.player.treasuresFound = data.self.treasuresFound || 0;
    state.player.questionsAnswered = data.self.questionsAnswered || 0;
    state.player.correct = data.self.correct || 0;
    state.player.wrong = data.self.wrong || 0;
    state.player.completedTreasures = data.self.completedTreasures || [];
    state.player.failedTreasures = data.self.failedTreasures || [];
    state.player.treasureAttempts = data.self.treasureAttempts || {};
    state.world = data.world || { width: 3600, height: 2700 };
    state.treasures = (data.treasures || []).map(tr => ({
      ...tr,
      completed: (state.player.completedTreasures || []).includes(tr.id),
      failed: (state.player.failedTreasures || []).includes(tr.id)
    }));

    updateHUD();
    checkMissionCompleted();

    state.otherPlayers = {};
    (data.players || []).forEach(p => {
      if (p.id !== state.playerId) {
        state.otherPlayers[p.id] = {
          ...p,
          targetX: p.x,
          targetY: p.y,
          moving: Boolean(p.moving),
          animFrame: 0,
          lastPacketTime: Date.now()
        };
      }
    });

    updateHUD();
    addTickerItem(`Chào mừng ${state.player.name} gia nhập thế giới!`);

    if (data.networkInfo) {
      setQrCodeData(data.networkInfo.qrCodeDataUrl, data.networkInfo.activeUrl || data.networkInfo.mobileUrl, data.networkInfo.isOnlineMode);
    }

    // Sync match timer state if a match is in progress
    if (data.matchState) {
      updateMatchTimerHUD(data.matchState.status, data.matchState.remainingSeconds);
      if (data.matchState.status === 'ended' && data.matchState.rankings && data.matchState.rankings.length > 0) {
        state.matchState.rankings = data.matchState.rankings;
      }
    }
  });

  // Realtime Network Mode Sync (Online 4G vs Local Wi-Fi)
  state.socket.on('network_mode_changed', (netInfo) => {
    if (netInfo) {
      setQrCodeData(netInfo.qrCodeDataUrl, netInfo.activeUrl || netInfo.mobileUrl, netInfo.isOnlineMode);
    }
  });

  // Realtime Player Appearance Changed
  state.socket.on('player_appearance_changed', (data) => {
    if (state.otherPlayers[data.id]) {
      Object.assign(state.otherPlayers[data.id], data);
    }
  });

  state.socket.on('player_joined', (p) => {
    if (!p || p.id === state.playerId) return;
    state.otherPlayers[p.id] = {
      ...p,
      targetX: p.x,
      targetY: p.y,
      moving: Boolean(p.moving),
      animFrame: 0,
      lastPacketTime: Date.now()
    };
    addTickerItem(`✨ ${p.name} vừa bước vào vùng đất.`);
    updateOnlineCount();
  });

  state.socket.on('player_moved', (data) => {
    if (state.otherPlayers[data.id]) {
      const op = state.otherPlayers[data.id];
      op.targetX = data.x;
      op.targetY = data.y;
      op.direction = data.direction;
      if (data.facing) {
        op.facing = data.facing;
      } else if (data.direction === 'left' || data.direction === 'right') {
        op.facing = data.direction;
      }
      op.moving = Boolean(data.moving);
      op.region = data.region;
      op.lastPacketTime = Date.now();
      if (!op.moving) {
        op.animFrame = 0;
      }
    }
  });

  state.socket.on('player_left', (data) => {
    if (state.otherPlayers[data.id]) {
      const name = state.otherPlayers[data.id].name;
      delete state.otherPlayers[data.id];
      addTickerItem(`${name} đã rời khỏi game.`);
      updateOnlineCount();
    }
  });

  state.socket.on('player_score_updated', (data) => {
    if (data.playerId === state.playerId) {
      state.player.score = data.newScore;
      updateHUD();
    } else if (state.otherPlayers[data.playerId]) {
      state.otherPlayers[data.playerId].score = data.newScore;
    }

    const diff = data.newScore - data.prevScore;
    const sign = diff >= 0 ? `+${diff}` : `${diff}`;
    addTickerItem(`✨ ${data.playerName} chọn lá [${data.cardName}]: ${sign} điểm (${data.newScore})`);
  });

  state.socket.on('treasure_question', (qData) => {
    sound.playChestOpen();
    state.activeQuestion = qData;
    showQuestionModal(qData);
  });

  state.socket.on('answer_result', (res) => {
    handleAnswerResult(res);
  });

  state.socket.on('card_chosen_success', (data) => {
    sound.playCardPowerup();
    state.player.score = data.newScore;
    updateHUD();

    // Trigger Screen Shake for WOW impact
    triggerScreenShake();

    const diff = data.newScore - data.prevScore;
    const sign = diff >= 0 ? `+${diff}` : `${diff}`;
    spawnFloatingText(`${data.card.name} (${sign})`, state.player.x, state.player.y - 45, data.card.color);
    spawnBurstParticles(state.player.x, state.player.y, data.card.color, 45);
  });

  state.socket.on('force_teleport', (data) => {
    state.player.x = data.x;
    state.player.y = data.y;
    spawnBurstParticles(state.player.x, state.player.y, '#f59e0b', 40);
    addTickerItem(`Bạn vừa được dịch chuyển đến ${data.region}!`);
  });

  state.socket.on('broadcast_announcement', (data) => {
    showAnnouncement(data.title, data.text);
  });

  state.socket.on('mission_completed', (data) => {
    triggerMissionCompletion(data.message);
  });

  state.socket.on('error_message', (data) => {
    alert(data.message || 'Đã xảy ra lỗi!');
  });

  // ==========================================
  // 10-MINUTE MATCH COUNTDOWN SOCKET LISTENERS
  // ==========================================
  state.socket.on('match_started', (data) => {
    sound.playMatchStart();
    updateMatchTimerHUD('running', data.remainingSeconds);

    // Reset local player stats for fair play
    state.player.score = 0;
    state.player.treasuresFound = 0;
    state.player.questionsAnswered = 0;
    state.player.correct = 0;
    state.player.wrong = 0;
    state.player.completedTreasures = [];
    state.player.failedTreasures = [];
    state.player.treasureAttempts = {};
    state.hasShownMissionCompleted = false;
    if (persistentCompletionBanner) persistentCompletionBanner.classList.add('hidden');
    if (podiumCompletionBanner) podiumCompletionBanner.classList.add('hidden');

    // Reset treasure states
    state.treasures.forEach(tr => {
      tr.completed = false;
      tr.failed = false;
    });

    // Hide waiting overlay
    const waitOverlay = document.getElementById('waiting-overlay');
    if (waitOverlay) waitOverlay.style.display = 'none';

    updateHUD();
    const mins = Math.ceil((data.duration || data.remainingSeconds) / 60);
    addTickerItem(`⚔️ TRẬN ĐẤU ${mins} PHÚT BẮT ĐẦU! Hãy giải rương triết học để ghi điểm!`);
  });

  state.socket.on('match_timer_tick', (data) => {
    updateMatchTimerHUD(data.status, data.remainingSeconds);

    // Warning tick sound in last 10 seconds
    if (data.remainingSeconds <= 10 && data.remainingSeconds > 0) {
      sound.playWarningTick();
    }
  });

  state.socket.on('match_ended', (data) => {
    sound.playVictoryFanfare();
    updateMatchTimerHUD('ended', 0);
    showRankingsModal(data.rankings);
    addTickerItem('🏆 HẾT GIỜ THI ĐẤU! Xem bảng xếp hạng!');
  });

  state.socket.on('match_rankings_data', (data) => {
    showRankingsModal(data.rankings);
  });
}

// Keyboard Listeners
window.addEventListener('keydown', (e) => {
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

  switch (e.code) {
    case 'KeyW':
    case 'ArrowUp':
      state.keys.up = true;
      state.player.targetX = null;
      break;
    case 'KeyS':
    case 'ArrowDown':
      state.keys.down = true;
      state.player.targetX = null;
      break;
    case 'KeyA':
    case 'ArrowLeft':
      state.keys.left = true;
      state.player.targetX = null;
      break;
    case 'KeyD':
    case 'ArrowRight':
      state.keys.right = true;
      state.player.targetX = null;
      break;
    case 'KeyE':
    case 'Space':
      interactWithClosestTreasure();
      break;
  }
});

window.addEventListener('keyup', (e) => {
  switch (e.code) {
    case 'KeyW':
    case 'ArrowUp': state.keys.up = false; break;
    case 'KeyS':
    case 'ArrowDown': state.keys.down = false; break;
    case 'KeyA':
    case 'ArrowLeft': state.keys.left = false; break;
    case 'KeyD':
    case 'ArrowRight': state.keys.right = false; break;
  }
});

// Reset keys when tab loses focus to prevent running in place
window.addEventListener('blur', () => {
  state.keys.up = false;
  state.keys.down = false;
  state.keys.left = false;
  state.keys.right = false;
});

// ==============================================================
// MOBILE TOUCH CONTROLS (DYNAMIC FLOATING VIRTUAL JOYSTICK)
// ==============================================================
touchJoystickZone.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const touch = e.changedTouches[0];
  state.joystick.active = true;
  state.joystick.touchId = touch.identifier;
  state.joystick.startX = touch.clientX;
  state.joystick.startY = touch.clientY;
  state.joystick.dx = 0;
  state.joystick.dy = 0;
  state.player.targetX = null;

  joystickBase.style.left = `${touch.clientX}px`;
  joystickBase.style.top = `${touch.clientY}px`;
  joystickStick.style.left = '50%';
  joystickStick.style.top = '50%';
  joystickBase.classList.remove('hidden');
}, { passive: false });

touchJoystickZone.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (!state.joystick.active) return;

  for (let i = 0; i < e.changedTouches.length; i++) {
    const touch = e.changedTouches[i];
    if (touch.identifier === state.joystick.touchId) {
      let deltaX = touch.clientX - state.joystick.startX;
      let deltaY = touch.clientY - state.joystick.startY;
      const dist = Math.hypot(deltaX, deltaY);
      const maxR = 48;

      if (dist > maxR) {
        deltaX = (deltaX / dist) * maxR;
        deltaY = (deltaY / dist) * maxR;
      }

      state.joystick.dx = deltaX / maxR;
      state.joystick.dy = deltaY / maxR;

      joystickStick.style.left = `calc(50% + ${deltaX}px)`;
      joystickStick.style.top = `calc(50% + ${deltaY}px)`;
      break;
    }
  }
}, { passive: false });

const endJoystick = (e) => {
  if (!state.joystick.active) return;
  state.joystick.active = false;
  state.joystick.dx = 0;
  state.joystick.dy = 0;
  joystickBase.classList.add('hidden');
};

touchJoystickZone.addEventListener('touchend', endJoystick);
touchJoystickZone.addEventListener('touchcancel', endJoystick);

// Tap-To-Move on Game Canvas (Touch right side or click to walk there)
canvas.addEventListener('click', (e) => {
  // If clicking on UI, ignore
  if (state.joystick.active) return;
  const currentCamX = (state.camera && typeof state.camera.x === 'number') ? state.camera.x : (state.player.x - canvas.width / 2);
  const currentCamY = (state.camera && typeof state.camera.y === 'number') ? state.camera.y : (state.player.y - canvas.height / 2);
  state.player.targetX = e.clientX + currentCamX;
  state.player.targetY = e.clientY + currentCamY;
  spawnBurstParticles(state.player.targetX, state.player.targetY, '#38bdf8', 12);
});

// Mobile Action Button
mobileInteractBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  interactWithClosestTreasure();
});

mobileInteractBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  e.stopPropagation();
  interactWithClosestTreasure();
}, { passive: false });

function interactWithClosestTreasure() {
  if (!state.socket) return;

  let targetTreasure = state.closestTreasure;
  if (!targetTreasure && state.treasures && state.player) {
    let nearest = null;
    let nearestDist = 180;
    state.treasures.forEach(tr => {
      const d = Math.hypot(state.player.x - tr.x, state.player.y - tr.y);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = tr;
      }
    });
    targetTreasure = nearest;
  }

  if (!targetTreasure) {
    addTickerItem('⚠️ Hãy di chuyển lại gần một chiếc rương kho báu để mở!');
    return;
  }

  const isCompleted = targetTreasure.completed || (state.player.completedTreasures && state.player.completedTreasures.includes(targetTreasure.id));
  if (isCompleted) {
    addTickerItem(`✨ Bạn đã hoàn thành rương "${targetTreasure.name}" rồi! Hãy đi tìm rương khác.`);
    return;
  }

  const isFailed = targetTreasure.failed || (state.player.failedTreasures && state.player.failedTreasures.includes(targetTreasure.id));
  if (isFailed) {
    addTickerItem(`🔒 Rương "${targetTreasure.name}" đã bị phong ấn do sai 2 lần! Hãy đi tìm rương khác.`);
    return;
  }

  state.socket.emit('open_treasure', { treasureId: targetTreasure.id });
}

function triggerScreenShake() {
  screenShakeWrapper.classList.add('shaking');
  setTimeout(() => {
    screenShakeWrapper.classList.remove('shaking');
  }, 400);
}

function isPlayerCompletedAllTreasures() {
  const total = (state.treasures && state.treasures.length) ? state.treasures.length : 30;
  const completedCount = state.player.completedTreasures ? state.player.completedTreasures.length : 0;
  const failedCount = state.player.failedTreasures ? state.player.failedTreasures.length : 0;
  return (state.player.treasuresFound >= total) || ((completedCount + failedCount) >= total);
}

// Update HUD stats
function updateHUD() {
  hudScore.textContent = state.player.score;
  const total = state.treasures.length || 30;
  hudTreasures.textContent = `${state.player.treasuresFound}/${total}`;
  hudAccuracy.textContent = `${state.player.correct}đ / ${state.player.wrong}s`;
  updateOnlineCount();

  if (isPlayerCompletedAllTreasures()) {
    if (persistentCompletionBanner) persistentCompletionBanner.classList.remove('hidden');
    if (podiumCompletionBanner) podiumCompletionBanner.classList.remove('hidden');
  }
}

function updateOnlineCount() {
  const count = 1 + Object.keys(state.otherPlayers).length;
  hudOnlineCount.textContent = count;
}

function addTickerItem(text) {
  const div = document.createElement('div');
  div.className = 'ticker-item';
  div.textContent = text;
  eventTicker.appendChild(div);
  setTimeout(() => {
    if (div.parentNode) div.parentNode.removeChild(div);
  }, 7000);
}

function showAnnouncement(title, text, duration = 6000) {
  bannerTitle.textContent = title;
  bannerText.textContent = text;
  broadcastBanner.classList.remove('hidden');
  if (window._announcementTimer) clearTimeout(window._announcementTimer);
  window._announcementTimer = setTimeout(() => {
    broadcastBanner.classList.add('hidden');
  }, duration);
}

function triggerMissionCompletion(customMsg) {
  const msg = customMsg || 'Chúc mừng bạn đã hoàn thành nhiệm vụ tìm kiếm kiến thức triết học!';
  try {
    sound.playVictoryFanfare();
  } catch (e) {}
  spawnBurstParticles(state.player.x, state.player.y, '#fbbf24', 60);
  spawnBurstParticles(state.player.x, state.player.y, '#10b981', 60);

  // 1. Hiển thị dòng thông báo vinh danh XUYÊN SUỐT trên màn hình game (không bao giờ ẩn đi đến tận vinh danh!)
  if (persistentCompletionBanner) {
    persistentCompletionBanner.classList.remove('hidden');
  }

  // 2. Dòng thông báo trên bục vinh danh tổng hợp kết quả
  if (podiumCompletionBanner) {
    podiumCompletionBanner.classList.remove('hidden');
  }

  // 3. Popup chúc mừng chính giữa màn hình (để người chơi xác nhận và xem cúp)
  const isDrawingCard = (cardDrawModal && cardDrawModal.classList.contains('active')) ||
                        (questionModal && questionModal.classList.contains('active'));
  if (isDrawingCard) {
    state.pendingMissionModal = true;
  } else if (missionCompletedModal) {
    if (missionCompletedMsg) missionCompletedMsg.textContent = msg;
    missionCompletedModal.classList.remove('hidden');
    missionCompletedModal.classList.add('active');
  }

  // 4. Dòng thông báo rực rỡ ở phía trên màn hình (kéo dài 10 giây)
  showAnnouncement('🏆 KHO BÁU TRIẾT HỌC 🏆', msg, 10000);

  // 5. Ticker dòng sự kiện
  addTickerItem(`🏆 ${msg}`);
}

function checkMissionCompleted() {
  if (isPlayerCompletedAllTreasures()) {
    if (persistentCompletionBanner) persistentCompletionBanner.classList.remove('hidden');
    if (podiumCompletionBanner) podiumCompletionBanner.classList.remove('hidden');
    if (!state.hasShownMissionCompleted) {
      state.hasShownMissionCompleted = true;
      triggerMissionCompletion('Chúc mừng bạn đã hoàn thành nhiệm vụ tìm kiếm kiến thức triết học!');
    } else if (state.pendingMissionModal) {
      const isDrawingCard = (cardDrawModal && cardDrawModal.classList.contains('active')) ||
                            (questionModal && questionModal.classList.contains('active'));
      if (!isDrawingCard && missionCompletedModal) {
        state.pendingMissionModal = false;
        if (missionCompletedMsg) missionCompletedMsg.textContent = 'Chúc mừng bạn đã hoàn thành nhiệm vụ tìm kiếm kiến thức triết học!';
        missionCompletedModal.classList.remove('hidden');
        missionCompletedModal.classList.add('active');
      }
    }
  }
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, s => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[s]));
}

function formatMatchTime(sec) {
  if (sec == null || isNaN(sec)) return '10:00';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function updateMatchTimerHUD(status, remainingSeconds) {
  if (!hudTimerDigits || !hudTimerStatus || !hudMatchTimerBox) return;

  state.matchState.status = status;
  state.matchState.remainingSeconds = remainingSeconds;

  hudTimerDigits.textContent = formatMatchTime(remainingSeconds);

  hudMatchTimerBox.classList.remove('timer-running', 'timer-urgent');

  if (status === 'running') {
    if (remainingSeconds <= 60 && remainingSeconds > 0) {
      hudMatchTimerBox.classList.add('timer-urgent');
      hudTimerStatus.textContent = 'SẮP HẾT GIỜ!';
    } else {
      hudMatchTimerBox.classList.add('timer-running');
      hudTimerStatus.textContent = 'ĐANG THI ĐẤU';
    }
  } else if (status === 'ended') {
    hudTimerStatus.textContent = 'HẾT GIỜ';
    hudTimerDigits.textContent = '00:00';
  } else {
    hudTimerStatus.textContent = 'CHỜ BẮT ĐẦU';
  }

  const waitOverlay = document.getElementById('waiting-overlay');
  if (waitOverlay) {
    waitOverlay.style.display = (status === 'waiting') ? 'flex' : 'none';
  }
}

// Confetti Particle System
let confettiAnimId = null;
function startConfetti() {
  if (!confettiCanvas) return;
  const cCtx = confettiCanvas.getContext('2d');
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  if (confettiAnimId) {
    cancelAnimationFrame(confettiAnimId);
    confettiAnimId = null;
  }

  const confettiPieces = [];
  const colors = ['#f59e0b', '#fbbf24', '#38bdf8', '#10b981', '#ec4899', '#f43f5e', '#a855f7', '#ffffff'];

  for (let i = 0; i < 90; i++) {
    confettiPieces.push({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * (confettiCanvas.height * 0.5) - 60,
      w: Math.random() * 8 + 6,
      h: Math.random() * 5 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 3 + 2.5,
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 7
    });
  }

  const startTime = Date.now();

  function anim() {
    cCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiPieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vRot;
      if (p.y > confettiCanvas.height + 20) {
        p.y = -20;
        p.x = Math.random() * confettiCanvas.width;
      }
      cCtx.save();
      cCtx.translate(p.x, p.y);
      cCtx.rotate((p.rotation * Math.PI) / 180);
      cCtx.fillStyle = p.color;
      cCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      cCtx.restore();
    });

    if (Date.now() - startTime < 12000 && rankingsModal && !rankingsModal.classList.contains('hidden')) {
      confettiAnimId = requestAnimationFrame(anim);
    } else {
      cCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      confettiAnimId = null;
    }
  }

  anim();
}

function renderPodiumChibi(canvasEl, player, scale = 1.0) {
  if (!canvasEl) return;
  const pCtx = canvasEl.getContext('2d');
  pCtx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  if (!player) return;

  const mockP = {
    x: canvasEl.width / 2,
    y: canvasEl.height - 10,
    gender: player.gender || 'male',
    outfitColor: player.outfitColor || '#10B981',
    hatColor: player.hatColor || '#8B5A2B',
    color: player.outfitColor || '#10B981',
    direction: 'down',
    facing: 'right',
    moving: false,
    animFrame: 0
  };

  try {
    drawExplorerCharacter(pCtx, mockP.x, mockP.y, mockP, false, scale, 0.2, false);
  } catch (err) {
    console.error('Error rendering podium chibi:', err);
  }
}

function showRankingsModal(rankings) {
  if (!rankings) rankings = [];
  state.matchState.rankings = rankings;

  const total = (state.treasures && state.treasures.length) ? state.treasures.length : 30;
  const isSelfDone = isPlayerCompletedAllTreasures();
  const hasCompleted30 = isSelfDone || rankings.some(r => {
    const c = (r.completedTreasures && r.completedTreasures.length) || 0;
    const f = (r.failedTreasures && r.failedTreasures.length) || 0;
    return (Number(r.treasuresFound) >= total) || ((c + f) >= total);
  });

  if (podiumCompletionBanner) {
    if (hasCompleted30) {
      podiumCompletionBanner.classList.remove('hidden');
    } else {
      podiumCompletionBanner.classList.add('hidden');
    }
  }

  const p1 = rankings[0] || null;
  const p2 = rankings[1] || null;
  const p3 = rankings[2] || null;

  renderPodiumChibi(podiumCanvas1, p1, 1.25);
  renderPodiumChibi(podiumCanvas2, p2, 1.05);
  renderPodiumChibi(podiumCanvas3, p3, 0.98);

  const name1 = document.getElementById('podium-name-1');
  const score1 = document.getElementById('podium-score-1');
  const sub1 = document.getElementById('podium-sub-1');
  if (name1) name1.textContent = p1 ? p1.name : 'Chưa có';
  if (score1) score1.textContent = p1 ? `${p1.score} pts` : '0 pts';
  if (sub1) sub1.textContent = p1 ? `${p1.treasuresFound}/30 rương` : '0/30 rương';

  const name2 = document.getElementById('podium-name-2');
  const score2 = document.getElementById('podium-score-2');
  const sub2 = document.getElementById('podium-sub-2');
  if (name2) name2.textContent = p2 ? p2.name : 'Chưa có';
  if (score2) score2.textContent = p2 ? `${p2.score} pts` : '0 pts';
  if (sub2) sub2.textContent = p2 ? `${p2.treasuresFound}/30 rương` : '0/30 rương';

  const name3 = document.getElementById('podium-name-3');
  const score3 = document.getElementById('podium-score-3');
  const sub3 = document.getElementById('podium-sub-3');
  if (name3) name3.textContent = p3 ? p3.name : 'Chưa có';
  if (score3) score3.textContent = p3 ? `${p3.score} pts` : '0 pts';
  if (sub3) sub3.textContent = p3 ? `${p3.treasuresFound}/30 rương` : '0/30 rương';

  if (rankingsTableBody) {
    rankingsTableBody.innerHTML = '';
    if (rankings.length === 0) {
      rankingsTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Chưa có người chơi nào tham gia.</td></tr>';
    } else {
      rankings.forEach(p => {
        let rankBadge = `${p.rank}`;
        if (p.rank === 1) rankBadge = '🥇 1';
        else if (p.rank === 2) rankBadge = '🥈 2';
        else if (p.rank === 3) rankBadge = '🥉 3';

        const tr = document.createElement('tr');
        const isCurrent = (p.id === state.playerId);
        if (isCurrent) {
          tr.style.background = 'rgba(245, 158, 11, 0.15)';
        }
        tr.innerHTML = `
          <td style="font-weight:900; font-size:15px; color:${p.rank === 1 ? '#fbbf24' : p.rank === 2 ? '#cbd5e1' : p.rank === 3 ? '#fdba74' : '#94a3b8'}">${rankBadge}</td>
          <td><b>${escapeHtml(p.name)}</b> ${isCurrent ? '<span style="color:#fbbf24; font-size:10px;">(BẠN)</span>' : ''}</td>
          <td class="text-gold" style="font-weight:800; color:#fbbf24;">${p.score} pts</td>
          <td>${p.treasuresFound}/30</td>
          <td><span style="color:#10b981;">${p.correct} đúng</span> / <span style="color:#ef4444;">${p.wrong} sai</span></td>
          <td>${escapeHtml(p.region || 'Đồng Cỏ Tri Thức')}</td>
        `;
        rankingsTableBody.appendChild(tr);
      });
    }
  }

  if (rankingsModal) {
    rankingsModal.classList.remove('hidden');
    rankingsModal.classList.add('active');
    startConfetti();
  }
}

if (btnCloseRankings) {
  btnCloseRankings.addEventListener('click', () => {
    rankingsModal.classList.remove('active');
    rankingsModal.classList.add('hidden');
  });
}
if (btnRankingsClose) {
  btnRankingsClose.addEventListener('click', () => {
    rankingsModal.classList.remove('active');
    rankingsModal.classList.add('hidden');
  });
}
if (btnOpenLeaderboard) {
  btnOpenLeaderboard.addEventListener('click', () => {
    sound.init();
    if (state.socket) {
      state.socket.emit('get_match_rankings');
    }
  });
}

// Player QR Modal Interactions
function openPlayerQrModal() {
  if (!playerQrModal) return;
  playerQrModal.classList.remove('hidden');
  playerQrModal.classList.add('active');
  if (playerCopySuccess) playerCopySuccess.style.display = 'none';

  if (!cachedQrCodeDataUrl) {
    if (modalQrLoading) modalQrLoading.style.display = 'block';
    fetch('/api/qr')
      .then(res => res.json())
      .then(data => {
        if (data.qrCodeDataUrl) {
          setQrCodeData(data.qrCodeDataUrl, data.activeUrl || data.mobileUrl, data.isOnlineMode);
        }
      })
      .catch(err => {
        console.error('Lỗi tải QR:', err);
        if (modalQrLoading) modalQrLoading.textContent = 'Lỗi nạp mã QR. Vui lòng thử lại!';
      });
  } else {
    setQrCodeData(cachedQrCodeDataUrl, cachedMobileUrl);
  }
}

function closePlayerQrModal() {
  if (playerQrModal) {
    playerQrModal.classList.remove('active');
    playerQrModal.classList.add('hidden');
  }
}

if (btnLoginOpenQr) btnLoginOpenQr.addEventListener('click', openPlayerQrModal);
if (loginQrThumbBox) loginQrThumbBox.addEventListener('click', openPlayerQrModal);
if (btnOpenPlayerQr) btnOpenPlayerQr.addEventListener('click', openPlayerQrModal);
if (btnClosePlayerQr) btnClosePlayerQr.addEventListener('click', closePlayerQrModal);

if (playerQrModal) {
  playerQrModal.addEventListener('click', (e) => {
    if (e.target === playerQrModal) closePlayerQrModal();
  });
}

if (btnCopyPlayerQr) {
  btnCopyPlayerQr.addEventListener('click', () => {
    const url = (modalQrUrlInput && modalQrUrlInput.value) || cachedMobileUrl;
    if (!url) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        if (playerCopySuccess) playerCopySuccess.style.display = 'block';
        setTimeout(() => { if (playerCopySuccess) playerCopySuccess.style.display = 'none'; }, 3000);
      }).catch(() => {
        fallbackCopyPlayerText(url);
      });
    } else {
      fallbackCopyPlayerText(url);
    }
  });
}

function fallbackCopyPlayerText(text) {
  if (modalQrUrlInput) {
    modalQrUrlInput.select();
    modalQrUrlInput.setSelectionRange(0, 99999);
    try {
      document.execCommand('copy');
      if (playerCopySuccess) playerCopySuccess.style.display = 'block';
      setTimeout(() => { if (playerCopySuccess) playerCopySuccess.style.display = 'none'; }, 3000);
    } catch (err) {
      console.warn('Fallback copy failed:', err);
    }
  }
}

// Question Modal Logic
let selectedOptionIndex = null;

function showQuestionModal(q) {
  const currentAttempts = (q.attempts || 0) + 1;
  const isLastAttempt = currentAttempts >= 2;
  qThemeTag.textContent = `⚖️ ${q.theme} • Lần thử: ${Math.min(2, currentAttempts)}/2${isLastAttempt ? ' (Cơ hội cuối)' : ''}`;
  qTitle.textContent = q.title;
  qScenario.textContent = q.scenario;
  qCustomAnswer.value = '';
  selectedOptionIndex = null;

  qOptionsList.innerHTML = '';
  q.options.forEach((opt, idx) => {
    const letter = ['A', 'B', 'C', 'D'][idx] || (idx + 1);
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `<span class="option-letter">${letter}</span><span>${opt}</span>`;
    btn.addEventListener('click', () => {
      if (btn.disabled || !state.activeQuestion || !state.socket) return;

      // 1-Click Instant Answer: Immediately select & submit without clicking confirm!
      document.querySelectorAll('.option-btn').forEach(b => {
        b.classList.remove('selected');
        b.disabled = true;
      });
      btn.classList.add('selected');
      selectedOptionIndex = idx;
      qCustomAnswer.value = opt;
      sound.playCardHover();

      if (btnSubmitAnswer) {
        btnSubmitAnswer.disabled = true;
        btnSubmitAnswer.textContent = 'ĐANG XÁC MINH...';
      }

      state.socket.emit('submit_answer', {
        treasureId: state.activeQuestion.treasureId,
        questionId: state.activeQuestion.questionId,
        selectedIndex: idx,
        typedAnswer: opt
      });
    });
    qOptionsList.appendChild(btn);
  });

  qFeedback.classList.add('hidden');
  qFeedback.classList.remove('success', 'wrong');
  if (btnSubmitAnswer) {
    btnSubmitAnswer.disabled = false;
    btnSubmitAnswer.textContent = isLastAttempt ? 'XÁC NHẬN (CƠ HỘI CUỐI)' : 'XÁC NHẬN';
  }

  questionModal.classList.remove('hidden');
  questionModal.classList.add('active');
}

btnCloseQuestion.addEventListener('click', () => {
  questionModal.classList.remove('active');
  questionModal.classList.add('hidden');
  state.activeQuestion = null;
});

btnSubmitAnswer.addEventListener('click', () => {
  if (!state.activeQuestion || !state.socket) return;

  const typed = qCustomAnswer.value.trim();
  if (selectedOptionIndex === null && !typed) {
    alert('Vui lòng chọn 1 phương án hoặc nhập câu trả lời của bạn!');
    return;
  }

  document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
  btnSubmitAnswer.disabled = true;
  btnSubmitAnswer.textContent = 'ĐANG XÁC MINH...';

  state.socket.emit('submit_answer', {
    treasureId: state.activeQuestion.treasureId,
    questionId: state.activeQuestion.questionId,
    selectedIndex: selectedOptionIndex,
    typedAnswer: typed
  });
});

// Handle Answer Result
function handleAnswerResult(res) {
  qFeedback.classList.remove('hidden', 'success', 'wrong');

  if (res.success) {
    sound.playCorrectFanfare();
    qFeedback.classList.add('success');
    feedbackIcon.textContent = '✨';
    feedbackTitle.textContent = 'CHÍNH XÁC!';
    feedbackDesc.textContent = res.explanation;

    const btns = document.querySelectorAll('.option-btn');
    if (selectedOptionIndex !== null && btns[selectedOptionIndex]) {
      btns[selectedOptionIndex].classList.add('correct-choice');
    }

    const tr = state.treasures.find(t => t.id === res.treasureId);
    if (tr) tr.completed = true;
    if (!state.player.completedTreasures.includes(res.treasureId)) {
      state.player.completedTreasures.push(res.treasureId);
      state.player.treasuresFound++;
    }
    state.player.correct++;
    state.player.questionsAnswered++;
    updateHUD();

    spawnBurstParticles(state.player.x, state.player.y, '#10B981', 35);

    // After brief celebration, open 4 Cards Draw Screen
    setTimeout(() => {
      questionModal.classList.remove('active');
      questionModal.classList.add('hidden');
      state.activeQuestion = null;
      open4CardDrawScreen(res.drawId, res.cards);
    }, 1400);

  } else {
    sound.playWrongBuzz();
    qFeedback.classList.add('wrong');
    feedbackIcon.textContent = '❌';

    state.player.wrong++;
    state.player.questionsAnswered++;

    const btns = document.querySelectorAll('.option-btn');
    if (selectedOptionIndex !== null && btns[selectedOptionIndex]) {
      btns[selectedOptionIndex].classList.remove('selected');
      btns[selectedOptionIndex].classList.add('wrong-choice');
    }

    if (res.locked) {
      // Đã trả lời sai lần 2 -> Khóa rương vĩnh viễn với người này!
      const tr = state.treasures.find(t => t.id === res.treasureId);
      if (tr) tr.failed = true;
      if (!state.player.failedTreasures.includes(res.treasureId)) {
        state.player.failedTreasures.push(res.treasureId);
      }

      updateHUD();
      checkMissionCompleted();

      feedbackTitle.textContent = '🔒 RƯƠNG ĐÃ BỊ PHONG ẤN!';
      feedbackDesc.textContent = res.message || 'Bạn đã trả lời sai 2 lần! Rương này đã bị khóa. Hãy đi tìm rương khác!';
      if (btnSubmitAnswer) {
        btnSubmitAnswer.disabled = true;
        btnSubmitAnswer.textContent = 'HẾT LƯỢT (2/2) - ĐÃ KHÓA';
      }

      // Tự động đóng modal sau 2.8 giây và nhắc người chơi đi tìm rương khác
      setTimeout(() => {
        questionModal.classList.remove('active');
        questionModal.classList.add('hidden');
        state.activeQuestion = null;
        addTickerItem(`🔒 Bạn đã trả lời sai 2 lần tại ${tr ? tr.name : 'rương'}. Hãy đi tìm rương khác!`);
        checkMissionCompleted();
      }, 2800);
    } else {
      updateHUD();
      feedbackTitle.textContent = 'CHƯA CHÍNH XÁC (LẦN 1/2)';
      feedbackDesc.textContent = res.message || 'Chưa chính xác. Bạn còn 1 cơ hội cuối cùng cho rương này! Hãy chọn đáp án khác:';
      
      // Re-enable remaining options so player can tap their 2nd attempt choice immediately!
      btns.forEach((b) => {
        if (!b.classList.contains('wrong-choice')) {
          b.disabled = false;
        }
      });
      selectedOptionIndex = null;

      if (btnSubmitAnswer) {
        btnSubmitAnswer.disabled = false;
        btnSubmitAnswer.textContent = 'THỬ LẠI (CƠ HỘI CUỐI - LẦN 2/2)';
      }
    }
  }
}

// ==============================================================
// 4-CARD DESTINY DRAW SCREEN (ÚP LẠI - CHỌN XONG MỚI HIỆN LÊN)
// ==============================================================
function open4CardDrawScreen(drawId, cards) {
  state.pendingDrawId = drawId || `draw_${Date.now()}`;
  state.pendingCards = cards;
  state.isCardSelected = false;

  cardsContainer.innerHTML = '';
  cardStatusMsg.innerHTML = '✨ Trả lời đúng: <strong>+10 điểm</strong>! Hãy chọn 1 lá bài định mệnh để nhân/cộng/chia điểm:';

  cards.forEach((card, idx) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'destiny-card-wrapper';
    wrapper.setAttribute('data-index', idx);
    wrapper.setAttribute('onclick', `selectCardByIndex(${idx})`);

    // Front gradient styling tailored to each card type
    let frontGrad = 'linear-gradient(135deg, #059669, #064e3b)';
    let frontBorder = '#34d399';
    let frontGlow = '0 0 25px rgba(16, 185, 129, 0.6)';

    if (card.type === 'mul_all_2') {
      frontGrad = 'linear-gradient(135deg, #7c3aed, #1e1b4b)';
      frontBorder = '#c084fc';
      frontGlow = '0 0 35px rgba(192, 132, 252, 0.9)';
    } else if (card.type === 'mul_quest_10') {
      frontGrad = 'linear-gradient(135deg, #2563eb, #0f172a)';
      frontBorder = '#60a5fa';
      frontGlow = '0 0 25px rgba(59, 130, 246, 0.8)';
    } else if (card.type === 'add_5') {
      frontGrad = 'linear-gradient(135deg, #059669, #064e3b)';
      frontBorder = '#34d399';
      frontGlow = '0 0 25px rgba(16, 185, 129, 0.8)';
    } else if (card.type === 'sub_5') {
      frontGrad = 'linear-gradient(135deg, #d97706, #451a03)';
      frontBorder = '#fbbf24';
      frontGlow = '0 0 25px rgba(245, 158, 11, 0.7)';
    } else if (card.type === 'zero_quest_10') {
      frontGrad = 'linear-gradient(135deg, #ef4444, #450a0a)';
      frontBorder = '#f87171';
      frontGlow = '0 0 25px rgba(239, 68, 68, 0.7)';
    } else if (card.type === 'div_all_2') {
      frontGrad = 'linear-gradient(135deg, #991b1b, #1f0404)';
      frontBorder = '#ef4444';
      frontGlow = '0 0 35px rgba(239, 68, 68, 0.9)';
    } else if (card.type === 'multiply') {
      frontGrad = 'linear-gradient(135deg, #2563eb, #1e1b4b)';
      frontBorder = '#60a5fa';
      frontGlow = '0 0 30px rgba(59, 130, 246, 0.7)';
    } else if (card.type === 'divide') {
      frontGrad = 'linear-gradient(135deg, #d97706, #451a03)';
      frontBorder = '#fbbf24';
      frontGlow = '0 0 25px rgba(245, 158, 11, 0.6)';
    } else if (card.type === 'subtract') {
      frontGrad = 'linear-gradient(135deg, #dc2626, #450a0a)';
      frontBorder = '#f87171';
      frontGlow = '0 0 25px rgba(239, 68, 68, 0.6)';
    }

    wrapper.innerHTML = `
      <div class="card-inner-flipper">
        <!-- 1. MẶT ÚP (FACE-DOWN BAN ĐẦU) -->
        <div class="card-face-side card-back-side">
          <div class="card-back-ornament">
            <div class="back-mystery-rune">🎴</div>
            <div class="back-card-label">LÁ BÀI #${idx + 1}</div>
            <div class="back-tap-hint">CHỌN LÁ NÀY</div>
          </div>
        </div>

        <!-- 2. MẶT NGỬA (HIỆN LÊN SAU KHI CHỌN) -->
        <div class="card-face-side card-front-side" style="background: ${frontGrad}; border-color: ${frontBorder}; box-shadow: ${frontGlow};">
          <div class="card-top-badge">${card.badge}</div>
          <div class="card-center-val">${card.name}</div>
          <div class="card-bottom-info">
            <div class="card-math-desc">${card.description}</div>
          </div>
        </div>
      </div>
    `;

    wrapper.addEventListener('mouseenter', () => {
      try { sound.playCardHover(); } catch (e) {}
    });

    const handlePick = (e) => {
      if (e) {
        e.stopPropagation();
      }
      selectCard(wrapper, idx, card);
    };

    wrapper.addEventListener('click', handlePick);
    wrapper.addEventListener('pointerup', handlePick);
    wrapper.addEventListener('touchend', handlePick, { passive: true });

    cardsContainer.appendChild(wrapper);
  });

  cardDrawModal.classList.remove('hidden');
  cardDrawModal.classList.add('active');
}

window.selectCardByIndex = function(idx) {
  const cards = document.querySelectorAll('.destiny-card-wrapper');
  if (cards[idx] && state.pendingCards && state.pendingCards[idx]) {
    selectCard(cards[idx], idx, state.pendingCards[idx]);
  }
};

function selectCard(selectedWrapper, index, card) {
  if (state.isCardSelected) return; // Đã chọn rồi thì không chọn lại
  state.isCardSelected = true;

  const currentDrawId = state.pendingDrawId || `draw_${Date.now()}`;
  state.pendingDrawId = null;

  // 1. Play Flip Sound & 3D Flip Chosen Card Immediately
  try {
    sound.playCardFlip();
  } catch (e) {
    console.warn('Audio flip error:', e);
  }

  if (selectedWrapper) {
    selectedWrapper.classList.add('is-flipped', 'is-winner');
  }

  cardStatusMsg.innerHTML = `<span style="color: #fbbf24; font-size: 16px; font-weight: 900;">✨ BẠN ĐÃ CHỌN LÁ ${card.name}! (${card.description})</span>`;

  // 2. Play Powerup sound and screen shake
  setTimeout(() => {
    try {
      sound.playCardPowerup();
    } catch (e) {}
    triggerScreenShake();
  }, 250);

  // 3. Flip the other 3 cards so player sees what they were, but dimmed
  const allCards = document.querySelectorAll('.destiny-card-wrapper');
  allCards.forEach((c, idx) => {
    if (idx !== index) {
      setTimeout(() => {
        c.classList.add('is-flipped', 'is-dimmed');
      }, 300 + idx * 70);
    }
  });

  if (state.socket) {
    state.socket.emit('choose_card', {
      drawId: currentDrawId,
      cardIndex: index
    });
  }

  setTimeout(() => {
    cardDrawModal.classList.remove('active');
    cardDrawModal.classList.add('hidden');
    checkMissionCompleted();
  }, 2600);
}

// Floating score text
function spawnFloatingText(text, x, y, color = '#f59e0b') {
  state.floatingTexts.push({
    text,
    x,
    y,
    color,
    alpha: 1.0,
    vy: -1.3
  });
}

// Particle burst
function spawnBurstParticles(x, y, color = '#f59e0b', count = 25) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3.5 + 1.2;
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      size: Math.random() * 4 + 2,
      life: 1.0,
      decay: Math.random() * 0.025 + 0.015
    });
  }
}

// Movement & Physics Loop
let lastMoveEmitTime = 0;
let wasMoving = false;

function updateMovement() {
  const p = state.player;
  if (!p) return;

  // Block movement when match hasn't started or has ended
  if (state.matchState.status !== 'running') {
    p.moving = false;
    p.targetX = null;
    p.targetY = null;
    return;
  }

  let dx = 0;
  let dy = 0;

  // Keyboard
  if (state.keys.up) dy -= 1;
  if (state.keys.down) dy += 1;
  if (state.keys.left) dx -= 1;
  if (state.keys.right) dx += 1;

  // Touch Joystick input
  if (state.joystick.active) {
    dx = state.joystick.dx;
    dy = state.joystick.dy;
  }

  // Tap-to-walk target
  if (p.targetX !== null && p.targetY !== null && !state.joystick.active && dx === 0 && dy === 0) {
    const targetDist = Math.hypot(p.targetX - p.x, p.targetY - p.y);
    if (targetDist > 8) {
      dx = (p.targetX - p.x) / targetDist;
      dy = (p.targetY - p.y) / targetDist;
    } else {
      p.targetX = null;
      p.targetY = null;
    }
  }

  p.moving = dx !== 0 || dy !== 0;

  if (p.moving) {
    // Normalize if diagonal
    const mag = Math.hypot(dx, dy);
    if (mag > 1) {
      dx /= mag;
      dy /= mag;
    }

    if (dx < 0) {
      p.direction = 'left';
      p.facing = 'left';
    } else if (dx > 0) {
      p.direction = 'right';
      p.facing = 'right';
    } else if (dy < 0) {
      p.direction = 'up';
      if (!p.facing) p.facing = 'right';
    } else if (dy > 0) {
      p.direction = 'down';
      if (!p.facing) p.facing = 'right';
    }

    p.x = Math.max(30, Math.min(state.world.width - 30, p.x + dx * p.speed));
    p.y = Math.max(30, Math.min(state.world.height - 30, p.y + dy * p.speed));
    p.animFrame += 0.09;

    // Running dust particles
    if (Math.random() < 0.25) {
      state.particles.push({
        x: p.x + (Math.random() - 0.5) * 10,
        y: p.y + 14,
        vx: -dx * 0.5,
        vy: -0.3,
        color: 'rgba(255,255,255,0.4)',
        size: Math.random() * 3 + 2,
        life: 0.6,
        decay: 0.05
      });
    }

    const now = Date.now();
    if (now - lastMoveEmitTime > 40 && state.socket) {
      state.socket.emit('player_move', {
        x: Math.round(p.x),
        y: Math.round(p.y),
        direction: p.direction,
        facing: p.facing || 'right',
        moving: true
      });
      lastMoveEmitTime = now;
    }
    wasMoving = true;
  } else {
    // Character stopped moving
    p.animFrame = 0;
    if (wasMoving) {
      wasMoving = false;
      if (state.socket) {
        state.socket.emit('player_move', {
          x: Math.round(p.x),
          y: Math.round(p.y),
          direction: p.direction,
          facing: p.facing || 'right',
          moving: false
        });
        lastMoveEmitTime = Date.now();
      }
    }
  }

  // Interpolate other players
  const now = Date.now();
  for (const id in state.otherPlayers) {
    const op = state.otherPlayers[id];
    const distToTarget = Math.hypot(op.targetX - op.x, op.targetY - op.y);
    if (distToTarget > 1) {
      op.x += (op.targetX - op.x) * 0.25;
      op.y += (op.targetY - op.y) * 0.25;
    } else {
      op.x = op.targetX;
      op.y = op.targetY;
    }

    // Safety watchdog: if other player stopped sending movement packets (> 250ms), force moving = false
    if (op.lastPacketTime && (now - op.lastPacketTime > 250)) {
      op.moving = false;
    }

    if (op.moving) {
      op.animFrame += 0.09;
    } else {
      op.animFrame = 0;
    }
  }

  // Update Fireflies
  state.fireflies.forEach(f => {
    f.x += f.vx;
    f.y += f.vy;
    f.glowPhase += 0.04;
    if (f.x < 0) f.x = state.world.width;
    if (f.x > state.world.width) f.x = 0;
    if (f.y < 0) f.y = state.world.height;
    if (f.y > state.world.height) f.y = 0;
  });

  // Check closest treasure for interaction prompt
  let closest = null;
  let minDist = 150;

  state.treasures.forEach(tr => {
    const dist = Math.hypot(p.x - tr.x, p.y - tr.y);
    if (dist < minDist) {
      minDist = dist;
      closest = tr;
    }
  });

  state.closestTreasure = closest;

  // Pulse Mobile Action Button
  if (closest && !closest.completed && !closest.failed) {
    mobileInteractBtn.classList.add('beacon-pulse');
    mobileInteractBtn.classList.remove('btn-dimmed');
  } else {
    mobileInteractBtn.classList.remove('beacon-pulse');
    mobileInteractBtn.classList.add('btn-dimmed');
  }

  if (closest && questionModal.classList.contains('hidden') && cardDrawModal.classList.contains('hidden')) {
    proximityPrompt.classList.remove('hidden');
    const isCompleted = closest.completed || (state.player.completedTreasures && state.player.completedTreasures.includes(closest.id));
    const isFailed = closest.failed || (state.player.failedTreasures && state.player.failedTreasures.includes(closest.id));
    if (isCompleted) {
      proximityPrompt.querySelector('.prompt-text').innerHTML = `✨ <strong>${closest.name}</strong> (Đã hoàn thành! Hãy tìm rương khác)`;
    } else if (isFailed) {
      proximityPrompt.querySelector('.prompt-text').innerHTML = `🔒 <strong>${closest.name}</strong> (Đã phong ấn do sai 2 lần! Hãy tìm rương khác)`;
    } else {
      proximityPrompt.querySelector('.prompt-text').innerHTML = `Ấn <kbd>E</kbd> hoặc Chạm để mở <strong>${closest.name}</strong>`;
    }
  } else {
    proximityPrompt.classList.add('hidden');
  }

  // Update current region label
  let curRegion = 'Đồng Cỏ Tri Thức';
  for (const b of BIOMES) {
    if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) {
      curRegion = b.name.replace(' (Nam)', '');
      break;
    }
  }
  hudRegionName.textContent = curRegion;
}

// Canvas Rendering Loop
function render() {
  updateMovement();

  ctx.fillStyle = '#080c14';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Smooth Camera Boundary Clamping (keeps world filling 100% of screen without black voids)
  const worldW = (state.world && state.world.width) || 3600;
  const worldH = (state.world && state.world.height) || 2700;

  let cameraX = state.player.x - canvas.width / 2;
  let cameraY = state.player.y - canvas.height / 2;

  if (worldW > canvas.width) {
    cameraX = Math.max(0, Math.min(worldW - canvas.width, cameraX));
  } else {
    cameraX = (worldW - canvas.width) / 2;
  }

  if (worldH > canvas.height) {
    cameraY = Math.max(0, Math.min(worldH - canvas.height, cameraY));
  } else {
    cameraY = (worldH - canvas.height) / 2;
  }

  state.camera = { x: cameraX, y: cameraY };

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  // 1. Draw World Ground, Roads, Lake & Decals
  drawWorldBackground(ctx, cameraX, cameraY, canvas.width, canvas.height);

  // 2. Draw Decorative Philosophical Landmarks
  drawEnvironmentLandmarks(ctx, cameraX, cameraY, canvas.width, canvas.height);

  // 3. Draw Trees, Pines, Palms & Lampposts (Foliage)
  drawWorldFoliage(ctx, cameraX, cameraY, canvas.width, canvas.height);

  // 4. Draw Treasures (With Golden Skyward Light Beacons)
  drawTreasures(ctx);

  // 5. Draw Other Players
  for (const id in state.otherPlayers) {
    drawCharacter(ctx, state.otherPlayers[id], false);
  }

  // 6. Draw Local Player
  drawCharacter(ctx, state.player, true);

  // 7. Draw Dynamic Radial Lighting (Braziers, Campfire, Crystals)
  drawDynamicLighting(ctx, cameraX, cameraY, canvas.width, canvas.height);

  // 8. Draw Ambient Atmospheric Particles
  drawAmbientParticles(ctx, cameraX, cameraY, canvas.width, canvas.height);

  // 9. Draw Volumetric God Rays
  drawGodRays(ctx, cameraX, cameraY, canvas.width, canvas.height);

  // 10. Draw Particles & Floating Texts
  drawEffects(ctx);

  ctx.restore();

  // 11. Draw Cinematic Screen Vignette
  drawCinematicVignette(ctx, canvas.width, canvas.height);

  // 12. Draw Minimap
  drawMinimap();

  requestAnimationFrame(render);
}

// ==============================================================
// ADVANCED WORLD MAP RENDERING SYSTEM
// ==============================================================

// 1. Draw World Ground, Cobblestone Roads, Organic Lake & Decals
function drawWorldBackground(c, cameraX, cameraY, viewW, viewH) {
  // Biome Ground Base
  BIOMES.forEach(b => {
    c.fillStyle = b.ground;
    c.fillRect(b.x, b.y, b.w, b.h);

    // Subtle atmospheric grid texture
    c.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    c.lineWidth = 1;
    const tSize = 64;
    for (let x = b.x; x < b.x + b.w; x += tSize) {
      c.beginPath(); c.moveTo(x, b.y); c.lineTo(x, b.y + b.h); c.stroke();
    }
    for (let y = b.y; y < b.y + b.h; y += tSize) {
      c.beginPath(); c.moveTo(b.x, y); c.lineTo(b.x + b.w, y); c.stroke();
    }
  });

  // Organic Lake of Consciousness (x: 680..1080, y: 780..1380)
  drawOrganicLake(c);

  // Cobblestone Highway & Trail Network
  drawCobblestoneRoads(c);

  // Ground Decals (Flower meadows, forest leaves, marble plazas, sand drifts)
  drawGroundDecals(c, cameraX, cameraY, viewW, viewH);

  // World Golden Ornate Outer Border
  c.strokeStyle = '#f59e0b';
  c.lineWidth = 6;
  c.strokeRect(0, 0, state.world.width, state.world.height);
}

// Draw Organic Lake with Deep Depth & Animated Caustics
function drawOrganicLake(c) {
  const lakeCenterX = 1450;
  const lakeCenterY = 1800;
  const radiusX = 300;
  const radiusY = 380;

  // Sandy / Pebble Shoreline
  c.fillStyle = '#1e3a4f';
  c.beginPath();
  c.ellipse(lakeCenterX, lakeCenterY, radiusX + 16, radiusY + 16, 0, 0, Math.PI * 2);
  c.fill();

  // Water Depth Gradient
  const grad = c.createRadialGradient(lakeCenterX, lakeCenterY, 40, lakeCenterX, lakeCenterY, radiusX);
  grad.addColorStop(0, '#041724');
  grad.addColorStop(0.6, '#0369a1');
  grad.addColorStop(1, '#0284c7');
  c.fillStyle = grad;
  c.beginPath();
  c.ellipse(lakeCenterX, lakeCenterY, radiusX, radiusY, 0, 0, Math.PI * 2);
  c.fill();

  // Animated Water Wave Caustics
  const t = Date.now() * 0.002;
  c.strokeStyle = 'rgba(186, 230, 253, 0.28)';
  c.lineWidth = 2.5;
  for (let r = 40; r < radiusX - 20; r += 38) {
    c.beginPath();
    c.ellipse(lakeCenterX, lakeCenterY, r + Math.sin(t + r) * 6, (r * 1.25) + Math.cos(t * 0.8 + r) * 6, 0, 0, Math.PI * 2);
    c.stroke();
  }

  // Floating Water Lilies & Lotuses
  const lilies = [
    [780, 950], [840, 1250], [980, 1280], [1020, 1020], [790, 1180]
  ];
  lilies.forEach(([lx, ly], idx) => {
    // Green pad
    c.fillStyle = '#15803d';
    c.beginPath();
    c.arc(lx, ly, 11, 0.2, Math.PI * 1.85);
    c.lineTo(lx, ly);
    c.fill();
    // Lotus Flower
    c.fillStyle = (idx % 2 === 0 ? '#f472b6' : '#ffffff');
    c.beginPath();
    c.arc(lx, ly - 2, 4.5, 0, Math.PI * 2);
    c.fill();
  });
}

// Draw Cobblestone Roads connecting All Landmarks
function drawCobblestoneRoads(c) {
  c.save();
  c.lineCap = 'round';
  c.lineJoin = 'round';

  // 1. Dark Curb Borders (52px wide)
  c.strokeStyle = '#27221a';
  c.lineWidth = 50;
  ROAD_SEGMENTS.forEach(seg => {
    c.beginPath();
    c.moveTo(seg[0][0], seg[0][1]);
    for (let i = 1; i < seg.length; i++) c.lineTo(seg[i][0], seg[i][1]);
    c.stroke();
  });

  // 2. Weathered Stone Surface (44px wide)
  c.strokeStyle = '#4a3f31';
  c.lineWidth = 42;
  ROAD_SEGMENTS.forEach(seg => {
    c.beginPath();
    c.moveTo(seg[0][0], seg[0][1]);
    for (let i = 1; i < seg.length; i++) c.lineTo(seg[i][0], seg[i][1]);
    c.stroke();
  });

  // 3. Inner Paver Texture Dashes
  c.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  c.lineWidth = 2;
  c.setLineDash([12, 10]);
  ROAD_SEGMENTS.forEach(seg => {
    c.beginPath();
    c.moveTo(seg[0][0], seg[0][1]);
    for (let i = 1; i < seg.length; i++) c.lineTo(seg[i][0], seg[i][1]);
    c.stroke();
  });
  c.setLineDash([]);

  // 4. Circular Paved Intersection Plazas
  const plazas = [
    [450, 400, 75], [850, 340, 50], [1450, 420, 68], [1950, 550, 52],
    [2100, 400, 55], [400, 950, 50], [920, 1050, 48], [1250, 1450, 58],
    [1550, 1100, 54], [2050, 1200, 52]
  ];
  plazas.forEach(([px, py, pr]) => {
    c.fillStyle = '#2c261e';
    c.beginPath(); c.arc(px, py, pr + 4, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#4c4032';
    c.beginPath(); c.arc(px, py, pr, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(251, 191, 36, 0.35)';
    c.lineWidth = 2;
    c.stroke();
  });

  c.restore();
}

// Ground Decals (Flower meadows, fallen leaves, marble mosaic, sand drifts)
function drawGroundDecals(c, cameraX, cameraY, viewW, viewH) {
  // Grassland Wildflowers (Yellow, White, Lavender)
  const flowerBeds = [
    [220, 200, '#facc15'], [320, 360, '#f8fafc'], [180, 500, '#c084fc'], [420, 620, '#fb7185'],
    [540, 220, '#facc15'], [300, 150, '#38bdf8'], [120, 380, '#facc15']
  ];
  flowerBeds.forEach(([fx, fy, col]) => {
    if (fx < cameraX - 50 || fx > cameraX + viewW + 50 || fy < cameraY - 50 || fy > cameraY + viewH + 50) return;
    c.fillStyle = col;
    for (let i = 0; i < 6; i++) {
      const ox = (i % 3) * 12 - 12;
      const oy = Math.floor(i / 3) * 10 - 5;
      c.beginPath();
      c.arc(fx + ox, fy + oy, 2.5, 0, Math.PI * 2);
      c.fill();
    }
  });

  // Moral Forest Leaf Drifts (Autumn Gold, Amber, Bronze)
  const leafDrifts = [
    [720, 180], [820, 260], [920, 180], [780, 420], [890, 520], [1020, 420]
  ];
  leafDrifts.forEach(([lx, ly], idx) => {
    if (lx < cameraX - 50 || lx > cameraX + viewW + 50 || ly < cameraY - 50 || ly > cameraY + viewH + 50) return;
    c.fillStyle = (idx % 2 === 0 ? '#b45309' : '#d97706');
    for (let i = 0; i < 7; i++) {
      const ox = (i * 9) - 27;
      const oy = ((i * 5) % 11) - 5;
      c.beginPath();
      c.ellipse(lx + ox, ly + oy, 4, 2, (i * 0.7), 0, Math.PI * 2);
      c.fill();
    }
  });

  // Ruins Sand Ripples
  const sandDunes = [
    [1850, 250], [2200, 300], [1820, 600], [2180, 750], [1920, 1250], [2250, 1400]
  ];
  sandDunes.forEach(([sx, sy]) => {
    if (sx < cameraX - 80 || sx > cameraX + viewW + 80 || sy < cameraY - 50 || sy > cameraY + viewH + 50) return;
    c.strokeStyle = 'rgba(251, 191, 36, 0.15)';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(sx - 40, sy);
    c.bezierCurveTo(sx - 20, sy - 8, sx + 20, sy + 8, sx + 40, sy);
    c.stroke();
  });

  // Cave Crystal Fissures (Glowing neon veins on floor)
  const caveVeins = [
    [200, 920], [320, 1150], [150, 1350], [300, 1550], [520, 1200]
  ];
  caveVeins.forEach(([vx, vy], idx) => {
    if (vx < cameraX - 60 || vx > cameraX + viewW + 60 || vy < cameraY - 60 || vy > cameraY + viewH + 60) return;
    c.strokeStyle = (idx % 2 === 0 ? 'rgba(168, 85, 247, 0.35)' : 'rgba(6, 182, 212, 0.35)');
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(vx - 24, vy);
    c.lineTo(vx - 6, vy + 12);
    c.lineTo(vx + 14, vy - 8);
    c.lineTo(vx + 28, vy + 14);
    c.stroke();
  });
}

// 2. Draw Landmark Centerpieces for All 10 Treasures
function drawEnvironmentLandmarks(c, cameraX, cameraY, viewW, viewH) {
  // 1. Đồng Cỏ Tri Thức Landmarks
  drawSocratesForum(c, 450, 400);

  // 2. Rừng Sâu Đạo Đức Landmarks
  drawGoldenMeanShrine(c, 1520, 220);

  // 3. Đền Cổ Bản Ngã Landmarks (Ship of Theseus & Parthenon)
  drawShipOfTheseus(c, 2150, 530);
  drawParthenonColonnade(c, 2150, 320);

  // 4. Tàn Tích Chân Lý Landmarks (Plato's Cave & Obelisk of Truth)
  drawPlatoCave(c, 2980, 520);
  drawTruthObelisk(c, 3350, 380);
  drawRawlsJusticeGate(c, 3200, 750);

  // 5. Hang Động Tự Do Landmarks (Crystal Cavern & Chinese Room)
  drawCrystalCavern(c, 420, 1350);
  drawChineseRoom(c, 520, 1850);

  // 6. Hồ Nước Ý Thức Landmarks (Wooden Pier, Spirit Tree & Fountain)
  drawLakePierAndSpiritTree(c, 1450, 1350);
  drawEpicureanGarden(c, 2100, 1400);
  drawCommonsAgora(c, 1680, 820);
}

// Socrates Forum (Spawn Plaza)
function drawSocratesForum(c, x, y) {
  // 8-Pointed Golden Compass Star on Plaza Floor
  c.save();
  c.translate(x, y);
  c.fillStyle = '#f59e0b';
  for (let i = 0; i < 8; i++) {
    c.rotate(Math.PI / 4);
    c.beginPath();
    c.moveTo(0, -50);
    c.lineTo(6, -14);
    c.lineTo(0, 0);
    c.lineTo(-6, -14);
    c.closePath();
    c.fill();
  }
  c.restore();

  // Tiered Marble Pedestal & Bust of Socrates
  c.fillStyle = 'rgba(0,0,0,0.35)';
  c.beginPath(); c.ellipse(x, y + 26, 28, 12, 0, 0, Math.PI * 2); c.fill();

  c.fillStyle = '#64748b';
  c.fillRect(x - 24, y + 2, 48, 22);
  c.fillStyle = '#94a3b8';
  c.fillRect(x - 20, y - 18, 40, 20);

  // Bust Head & Beard
  c.fillStyle = '#f1f5f9';
  c.beginPath(); c.arc(x, y - 32, 14, 0, Math.PI * 2); c.fill();
  // Beard
  c.fillStyle = '#cbd5e1';
  c.beginPath();
  c.moveTo(x - 12, y - 28);
  c.quadraticCurveTo(x, y - 10, x + 12, y - 28);
  c.fill();

  // Directional Signpost
  c.fillStyle = '#78350f';
  c.fillRect(x + 55, y - 30, 8, 50);
  c.fillStyle = '#b45309';
  c.fillRect(x + 35, y - 40, 48, 14);
  c.fillStyle = '#ffffff';
  c.font = 'bold 8px Nunito';
  c.textAlign = 'center';
  c.fillText('ĐẠO ĐỨC ➔', x + 59, y - 30);
}

// Golden Mean Shrine (Moral Forest)
function drawGoldenMeanShrine(c, x, y) {
  // Stone Altar Table
  c.fillStyle = 'rgba(0,0,0,0.4)';
  c.beginPath(); c.ellipse(x, y + 20, 42, 16, 0, 0, Math.PI * 2); c.fill();

  c.fillStyle = '#334155';
  c.fillRect(x - 36, y - 10, 72, 28);
  c.fillStyle = '#475569';
  c.fillRect(x - 42, y - 18, 84, 10);

  // Balanced Zen Cairn Stones on Altar
  c.fillStyle = '#64748b';
  c.beginPath(); c.ellipse(x, y - 22, 16, 6, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#94a3b8';
  c.beginPath(); c.ellipse(x, y - 30, 11, 5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#cbd5e1';
  c.beginPath(); c.ellipse(x, y - 37, 6, 4, 0, 0, Math.PI * 2); c.fill();

  // Flanking Stone Lantern Towers with glowing candlelight
  [x - 50, x + 50].forEach(lx => {
    c.fillStyle = '#334155';
    c.fillRect(lx - 8, y - 16, 16, 32);
    // Roof
    c.fillStyle = '#475569';
    c.beginPath();
    c.moveTo(lx - 14, y - 16);
    c.lineTo(lx, y - 28);
    c.lineTo(lx + 14, y - 16);
    c.closePath();
    c.fill();
    // Warm Candle Glow
    c.fillStyle = '#fef08a';
    c.beginPath(); c.arc(lx, y - 14, 4, 0, Math.PI * 2); c.fill();
  });
}

// Ship of Theseus on Quay (Ancient Greek Galley)
function drawShipOfTheseus(c, x, y) {
  // Stone Quay Dock
  c.fillStyle = 'rgba(0,0,0,0.45)';
  c.beginPath(); c.ellipse(x, y + 42, 90, 24, 0, 0, Math.PI * 2); c.fill();

  c.fillStyle = '#334155';
  c.fillRect(x - 85, y + 16, 170, 26);
  c.fillStyle = '#475569';
  c.fillRect(x - 90, y + 12, 180, 8);

  // Ship Keel & Hull
  c.fillStyle = '#78350f';
  c.beginPath();
  c.moveTo(x - 80, y - 5);
  c.quadraticCurveTo(x, y + 25, x + 80, y - 5);
  c.lineTo(x + 75, y - 18);
  c.lineTo(x - 75, y - 18);
  c.closePath();
  c.fill();

  // Bronze Ram at Bow
  c.fillStyle = '#d97706';
  c.beginPath();
  c.moveTo(x + 75, y);
  c.lineTo(x + 95, y + 4);
  c.lineTo(x + 75, y + 12);
  c.closePath();
  c.fill();

  // Row of Circular Bronze Shields along gunwale
  for (let s = -60; s <= 60; s += 24) {
    c.fillStyle = '#b45309';
    c.beginPath(); c.arc(x + s, y - 14, 6.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#fbbf24';
    c.beginPath(); c.arc(x + s, y - 14, 3, 0, Math.PI * 2); c.fill();
  }

  // Wooden Oars dipping to slipway
  c.strokeStyle = '#92400e';
  c.lineWidth = 2;
  for (let o = -50; o <= 50; o += 20) {
    c.beginPath();
    c.moveTo(x + o, y - 5);
    c.lineTo(x + o + 14, y + 24);
    c.stroke();
  }

  // Mast & Billowing Crimson-and-Gold Sail
  c.fillStyle = '#451a03';
  c.fillRect(x - 4, y - 85, 8, 70);
  // Cross Spar
  c.fillRect(x - 44, y - 82, 88, 5);

  // Billowing Crimson Sail
  c.fillStyle = '#b91c1c';
  c.beginPath();
  c.moveTo(x - 40, y - 80);
  c.quadraticCurveTo(x, y - 65, x + 40, y - 80);
  c.lineTo(x + 36, y - 35);
  c.quadraticCurveTo(x, y - 22, x - 36, y - 35);
  c.closePath();
  c.fill();

  // Golden Greek Meander / Owl emblem on Sail
  c.fillStyle = '#fbbf24';
  c.beginPath(); c.arc(x, y - 52, 9, 0, Math.PI * 2); c.fill();

  // Rigging
  c.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(x, y - 85); c.lineTo(x - 75, y - 18);
  c.moveTo(x, y - 85); c.lineTo(x + 75, y - 18);
  c.stroke();
}

// Parthenon Colonnade (Temple of Self)
function drawParthenonColonnade(c, x, y) {
  // Stylobate Platform Steps
  c.fillStyle = '#334155';
  c.fillRect(x - 130, y + 50, 260, 18);
  c.fillStyle = '#475569';
  c.fillRect(x - 120, y + 42, 240, 10);
  c.fillStyle = '#64748b';
  c.fillRect(x - 110, y + 34, 220, 10);

  // 6 Fluted Ionic Columns
  for (let cx = -100; cx <= 100; cx += 40) {
    // Base
    c.fillStyle = '#94a3b8';
    c.fillRect(x + cx - 12, y + 26, 24, 8);
    // Shaft with 3D gradient
    const colGrad = c.createLinearGradient(x + cx - 9, 0, x + cx + 9, 0);
    colGrad.addColorStop(0, '#64748b');
    colGrad.addColorStop(0.5, '#cbd5e1');
    colGrad.addColorStop(1, '#475569');
    c.fillStyle = colGrad;
    c.fillRect(x + cx - 8, y - 45, 16, 72);
    // Volute Capital
    c.fillStyle = '#cbd5e1';
    c.fillRect(x + cx - 12, y - 53, 24, 9);
    c.fillStyle = '#94a3b8';
    c.beginPath(); c.arc(x + cx - 9, y - 48, 4, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(x + cx + 9, y - 48, 4, 0, Math.PI * 2); c.fill();
  }

  // Marble Architrave & Pediment Frieze
  c.fillStyle = '#475569';
  c.fillRect(x - 115, y - 65, 230, 14);
  c.fillStyle = '#64748b';
  c.beginPath();
  c.moveTo(x - 115, y - 65);
  c.lineTo(x, y - 105);
  c.lineTo(x + 115, y - 65);
  c.closePath();
  c.fill();

  // Golden Phi Symbol on Pediment Frieze
  c.fillStyle = '#fbbf24';
  c.font = 'bold 22px Cinzel';
  c.textAlign = 'center';
  c.fillText('Φ', x, y - 73);

  // 2 Classical Statues (Plato & Aristotle)
  [-70, 70].forEach((sx, idx) => {
    c.fillStyle = '#f1f5f9';
    c.fillRect(x + sx - 6, y - 15, 12, 36);
    c.beginPath(); c.arc(x + sx, y - 22, 6, 0, Math.PI * 2); c.fill();
  });

  // Flaming Bronze Tripod Braziers
  [-115, 115].forEach(bx => {
    c.fillStyle = '#78350f';
    c.fillRect(x + bx - 6, y + 8, 12, 24);
    c.beginPath(); c.arc(x + bx, y + 8, 14, 0, Math.PI); c.fill();
    // Flame
    c.fillStyle = '#f97316';
    c.beginPath();
    c.moveTo(x + bx - 8, y + 6);
    c.quadraticCurveTo(x + bx, y - 18 + Math.sin(Date.now() * 0.015) * 4, x + bx + 8, y + 6);
    c.fill();
    c.fillStyle = '#fef08a';
    c.beginPath(); c.arc(x + bx, y, 4, 0, Math.PI * 2); c.fill();
  });
}

// Plato's Cave (Ruins of Truth)
function drawPlatoCave(c, x, y) {
  // Massive Sandstone Cliff Formation
  c.fillStyle = '#451a03';
  c.beginPath();
  c.moveTo(x - 90, y + 50);
  c.lineTo(x - 85, y - 40);
  c.lineTo(x - 40, y - 75);
  c.lineTo(x + 40, y - 78);
  c.lineTo(x + 85, y - 35);
  c.lineTo(x + 90, y + 50);
  c.closePath();
  c.fill();

  // Jagged Rock Highlight Strata
  c.fillStyle = '#78350f';
  c.beginPath();
  c.moveTo(x - 80, y - 30);
  c.lineTo(x - 30, y - 65);
  c.lineTo(x + 35, y - 68);
  c.lineTo(x + 75, y - 25);
  c.lineTo(x + 65, y - 15);
  c.lineTo(x - 70, y - 18);
  c.closePath();
  c.fill();

  // Cave Mouth Entrance Arch (Deep Pitch Shadow)
  c.fillStyle = '#0f0a06';
  c.beginPath();
  c.ellipse(x, y + 10, 48, 44, 0, Math.PI, 0);
  c.lineTo(x + 48, y + 45);
  c.lineTo(x - 48, y + 45);
  c.closePath();
  c.fill();

  // Inside Cave: Glowing Flickering Campfire
  const flameH = Math.sin(Date.now() * 0.02) * 5 + 16;
  c.fillStyle = '#ea580c';
  c.beginPath();
  c.moveTo(x - 10, y + 36);
  c.quadraticCurveTo(x, y + 36 - flameH, x + 10, y + 36);
  c.fill();
  c.fillStyle = '#fde047';
  c.beginPath(); c.arc(x, y + 32, 5, 0, Math.PI * 2); c.fill();

  // Shadow Puppets projected on cave wall (Amphora & Horse Silhouette)
  const shadowBob = Math.sin(Date.now() * 0.005) * 3;
  c.fillStyle = 'rgba(20, 10, 5, 0.75)';
  // Shadow 1: Amphora
  c.beginPath(); c.arc(x - 22, y - 2 + shadowBob, 7, 0, Math.PI * 2); c.fill();
  c.fillRect(x - 25, y + 3 + shadowBob, 6, 8);
  // Shadow 2: Puppet Horse
  c.fillRect(x + 12, y - 6 - shadowBob, 16, 9);
  c.fillRect(x + 24, y - 14 - shadowBob, 6, 9);

  // Inscription above arch
  c.fillStyle = '#fde047';
  c.font = 'bold 9px Cinzel';
  c.textAlign = 'center';
  c.fillText('ẢO ẢNH & CHÂN LÝ', x, y - 50);
}

// Great Obelisk of Truth
function drawTruthObelisk(c, x, y) {
  // Pedestal Slabs
  c.fillStyle = 'rgba(0,0,0,0.4)';
  c.beginPath(); c.ellipse(x, y + 25, 36, 14, 0, 0, Math.PI * 2); c.fill();

  c.fillStyle = '#594129';
  c.fillRect(x - 28, y + 4, 56, 18);
  c.fillStyle = '#705234';
  c.fillRect(x - 22, y - 6, 44, 12);

  // Obelisk Tapering Pillar
  const obeliskGrad = c.createLinearGradient(x - 16, 0, x + 16, 0);
  obeliskGrad.addColorStop(0, '#594129');
  obeliskGrad.addColorStop(0.5, '#a37748');
  obeliskGrad.addColorStop(1, '#463320');
  c.fillStyle = obeliskGrad;
  c.beginPath();
  c.moveTo(x - 16, y - 6);
  c.lineTo(x - 9, y - 110);
  c.lineTo(x + 9, y - 110);
  c.lineTo(x + 16, y - 6);
  c.closePath();
  c.fill();

  // Golden Pyramidion Point
  c.fillStyle = '#fbbf24';
  c.beginPath();
  c.moveTo(x - 9, y - 110);
  c.lineTo(x, y - 128);
  c.lineTo(x + 9, y - 110);
  c.closePath();
  c.fill();

  // Glowing Inscribed Greek Runes (Alpha, Omega, Psi, Phi, Pi)
  const runeGlow = (Math.sin(Date.now() * 0.004) + 1) * 0.4 + 0.6;
  c.fillStyle = `rgba(254, 240, 138, ${runeGlow})`;
  c.font = 'bold 11px Cinzel';
  c.textAlign = 'center';
  const runes = ['Ω', 'Ψ', 'Φ', 'Π', 'A'];
  runes.forEach((rn, idx) => {
    c.fillText(rn, x, y - 90 + (idx * 18));
  });
}

// Crystal Spire Cavern (Cave of Free Will)
function drawCrystalCavern(c, x, y) {
  // Giant Amethyst & Sapphire Spire Crystals
  const crystals = [
    { ox: -24, h: 56, w: 14, col: '#a855f7', colLight: '#d8b4fe' },
    { ox: 0, h: 74, w: 18, col: '#38bdf8', colLight: '#bae6fd' },
    { ox: 22, h: 50, w: 12, col: '#c084fc', colLight: '#f3e8ff' },
    { ox: -10, h: 42, w: 10, col: '#06b6d4', colLight: '#a5f3fc' }
  ];

  c.fillStyle = 'rgba(0,0,0,0.5)';
  c.beginPath(); c.ellipse(x, y + 12, 38, 14, 0, 0, Math.PI * 2); c.fill();

  crystals.forEach(cr => {
    // Crystal Body
    c.fillStyle = cr.col;
    c.beginPath();
    c.moveTo(x + cr.ox - cr.w / 2, y + 4);
    c.lineTo(x + cr.ox, y + 4 - cr.h);
    c.lineTo(x + cr.ox + cr.w / 2, y + 4);
    c.closePath();
    c.fill();

    // Shaded Facet
    c.fillStyle = cr.colLight;
    c.beginPath();
    c.moveTo(x + cr.ox, y + 4 - cr.h);
    c.lineTo(x + cr.ox + cr.w / 2, y + 4);
    c.lineTo(x + cr.ox, y + 4);
    c.closePath();
    c.fill();
  });
}

// Lake Pier & Spirit Tree on Island of Soul
function drawLakePierAndSpiritTree(c, x, y) {
  // Long Wooden Pier (x: 840 to 980)
  c.fillStyle = '#451a03';
  c.fillRect(x - 90, y - 10, 180, 24);
  c.fillStyle = '#78350f';
  c.fillRect(x - 90, y - 12, 180, 4);

  // Pier Planks Lines
  c.strokeStyle = '#290f03';
  c.lineWidth = 1.5;
  for (let px = x - 85; px <= x + 85; px += 14) {
    c.beginPath(); c.moveTo(px, y - 12); c.lineTo(px, y + 14); c.stroke();
  }

  // Wooden Posts with brass oil lamps
  [-80, -20, 40, 80].forEach(ox => {
    c.fillStyle = '#290f03';
    c.fillRect(x + ox - 3, y - 24, 6, 16);
    c.fillStyle = '#fde047';
    c.beginPath(); c.arc(x + ox, y - 20, 3.5, 0, Math.PI * 2); c.fill();
  });

  // Islet of the Soul with Luminous Cyan Weeping Willow Tree
  const islandX = x;
  const islandY = y - 130;
  c.fillStyle = '#1e3a24';
  c.beginPath(); c.ellipse(islandX, islandY + 20, 52, 22, 0, 0, Math.PI * 2); c.fill();

  // Willow Trunk
  c.fillStyle = '#27170a';
  c.fillRect(islandX - 8, islandY - 35, 16, 45);

  // Swaying Bioluminescent Willow Foliage
  const willowSway = Math.sin(Date.now() * 0.002) * 5;
  const cyanGrad = c.createRadialGradient(islandX, islandY - 45, 10, islandX, islandY - 45, 55);
  cyanGrad.addColorStop(0, '#38bdf8');
  cyanGrad.addColorStop(0.7, '#0284c7');
  cyanGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');
  c.fillStyle = cyanGrad;
  c.beginPath(); c.arc(islandX + willowSway, islandY - 45, 52, 0, Math.PI * 2); c.fill();

  // Hanging Vine Strands
  c.strokeStyle = '#7dd3fc';
  c.lineWidth = 2;
  for (let vx = -36; vx <= 36; vx += 12) {
    c.beginPath();
    c.moveTo(islandX + vx, islandY - 40);
    c.quadraticCurveTo(islandX + vx + willowSway, islandY - 10, islandX + vx + (willowSway * 1.5), islandY + 8);
    c.stroke();
  }
}

// Epicurean Garden & Tiered Fountain (Temple South)
function drawEpicureanGarden(c, x, y) {
  // Circular Tiered Fountain
  c.fillStyle = 'rgba(0,0,0,0.35)';
  c.beginPath(); c.ellipse(x, y + 22, 38, 14, 0, 0, Math.PI * 2); c.fill();

  // Basin
  c.fillStyle = '#475569';
  c.beginPath(); c.ellipse(x, y + 8, 36, 15, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#0284c7';
  c.beginPath(); c.ellipse(x, y + 7, 30, 11, 0, 0, Math.PI * 2); c.fill();

  // Tier 2 Bowl
  c.fillStyle = '#64748b';
  c.fillRect(x - 6, y - 18, 12, 22);
  c.beginPath(); c.ellipse(x, y - 18, 18, 8, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#38bdf8';
  c.beginPath(); c.ellipse(x, y - 19, 14, 5, 0, 0, Math.PI * 2); c.fill();

  // Water Jet Sparkles
  c.fillStyle = '#ffffff';
  c.beginPath();
  c.arc(x, y - 30 + Math.sin(Date.now() * 0.01) * 3, 3, 0, Math.PI * 2);
  c.fill();

  // Marble Pergola Trellis with Flowering Wisteria Vines
  c.fillStyle = '#94a3b8';
  c.fillRect(x - 65, y - 35, 8, 48);
  c.fillRect(x + 57, y - 35, 8, 48);
  c.fillStyle = '#64748b';
  c.fillRect(x - 70, y - 42, 140, 8);

  // Purple Wisteria Flower clusters
  c.fillStyle = '#c084fc';
  for (let wx = -60; wx <= 60; wx += 20) {
    c.beginPath(); c.arc(x + wx, y - 32, 6, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(x + wx, y - 26, 4, 0, Math.PI * 2); c.fill();
  }
}

// Rawls' Veil of Ignorance Gate & Scales of Justice
function drawRawlsJusticeGate(c, x, y) {
  // Crystal Archway Pillars
  c.fillStyle = 'rgba(0,0,0,0.4)';
  c.beginPath(); c.ellipse(x, y + 25, 45, 14, 0, 0, Math.PI * 2); c.fill();

  c.fillStyle = '#594129';
  c.fillRect(x - 42, y - 50, 16, 70);
  c.fillRect(x + 26, y - 50, 16, 70);
  // Lintel Beam
  c.fillStyle = '#705234';
  c.fillRect(x - 48, y - 58, 96, 12);

  // Golden Scales of Justice suspended in arch
  c.strokeStyle = '#fbbf24';
  c.lineWidth = 2.5;
  // Center post & beam
  c.beginPath();
  c.moveTo(x, y - 44); c.lineTo(x, y - 10);
  c.moveTo(x - 22, y - 36); c.lineTo(x + 22, y - 36);
  c.stroke();

  // Scale Pans
  [-22, 22].forEach(px => {
    c.beginPath();
    c.moveTo(x + px, y - 36);
    c.lineTo(x + px - 7, y - 20);
    c.lineTo(x + px + 7, y - 20);
    c.closePath();
    c.fillStyle = 'rgba(251, 191, 36, 0.4)';
    c.fill();
    c.stroke();
  });
}

// Chinese Room Pagoda Pavilion (John Searle)
function drawChineseRoom(c, x, y) {
  // Platform & Shadow
  c.fillStyle = 'rgba(0,0,0,0.45)';
  c.beginPath(); c.ellipse(x, y + 28, 54, 18, 0, 0, Math.PI * 2); c.fill();

  c.fillStyle = '#261b2b';
  c.fillRect(x - 48, y + 8, 96, 20);

  // 4 Vermilion Pillars
  c.fillStyle = '#b91c1c';
  c.fillRect(x - 40, y - 38, 8, 48);
  c.fillRect(x - 14, y - 38, 8, 48);
  c.fillRect(x + 6, y - 38, 8, 48);
  c.fillRect(x + 32, y - 38, 8, 48);

  // Upturned Double Eaves with Golden Tiles
  c.fillStyle = '#d97706';
  c.beginPath();
  c.moveTo(x - 58, y - 38);
  c.quadraticCurveTo(x, y - 48, x + 58, y - 38);
  c.lineTo(x + 48, y - 56);
  c.quadraticCurveTo(x, y - 62, x - 48, y - 56);
  c.closePath();
  c.fill();

  // Upper Roof Peak
  c.fillStyle = '#b45309';
  c.beginPath();
  c.moveTo(x - 38, y - 56);
  c.quadraticCurveTo(x, y - 76, x + 38, y - 56);
  c.closePath();
  c.fill();

  // Hanging Amber Paper Lanterns
  [-36, 36].forEach(lx => {
    c.fillStyle = '#f59e0b';
    c.beginPath(); c.ellipse(x + lx, y - 26, 6, 8, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#ef4444';
    c.fillRect(x + lx - 2, y - 18, 4, 6);
  });

  // Calligraphy Banners 「知」 & 「行」
  c.fillStyle = '#fef3c7';
  c.fillRect(x - 12, y - 32, 10, 24);
  c.fillRect(x + 2, y - 32, 10, 24);
  c.fillStyle = '#0f172a';
  c.font = 'bold 9px sans-serif';
  c.textAlign = 'center';
  c.fillText('知', x - 7, y - 16);
  c.fillText('行', x + 7, y - 16);
}

// Agora of Commons & Stone Well
function drawCommonsAgora(c, x, y) {
  // Stone Circular Well
  c.fillStyle = 'rgba(0,0,0,0.35)';
  c.beginPath(); c.ellipse(x, y + 16, 26, 10, 0, 0, Math.PI * 2); c.fill();

  c.fillStyle = '#475569';
  c.beginPath(); c.ellipse(x, y + 4, 24, 11, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#1e293b';
  c.beginPath(); c.ellipse(x, y + 2, 18, 8, 0, 0, Math.PI * 2); c.fill();

  // Timber A-Frame Posts & Roof
  c.fillStyle = '#78350f';
  c.fillRect(x - 16, y - 28, 4, 30);
  c.fillRect(x + 12, y - 28, 4, 30);

  // Roof
  c.fillStyle = '#92400e';
  c.beginPath();
  c.moveTo(x - 22, y - 28);
  c.lineTo(x, y - 42);
  c.lineTo(x + 22, y - 28);
  c.closePath();
  c.fill();

  // Amphoras / Pots around well
  c.fillStyle = '#b45309';
  c.beginPath(); c.arc(x - 26, y + 6, 6, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(x + 24, y + 8, 7, 0, Math.PI * 2); c.fill();
}

// 3. Draw Diverse World Foliage (Trees, Palms, Pines, Glowing Mushrooms, Lampposts)
function drawWorldFoliage(c, cameraX, cameraY, viewW, viewH) {
  const tTime = Date.now() * 0.0015;

  WORLD_FOLIAGE.forEach(f => {
    // Viewport Culling for maximum 60 FPS performance
    if (f.x < cameraX - 120 || f.x > cameraX + viewW + 120 || f.y < cameraY - 140 || f.y > cameraY + viewH + 80) return;

    const s = f.scale || 1;
    const sway = Math.sin(tTime + f.x) * 3;

    if (f.type === 'oak' || f.type === 'ancient_oak') {
      const isAncient = (f.type === 'ancient_oak');
      const r = (isAncient ? 48 : 38) * s;

      // Drop Shadow
      c.fillStyle = 'rgba(0,0,0,0.36)';
      c.beginPath(); c.ellipse(f.x, f.y + 18 * s, r * 0.9, 14 * s, 0, 0, Math.PI * 2); c.fill();

      // Trunk
      c.fillStyle = isAncient ? '#2a1a0f' : '#3e2710';
      c.fillRect(f.x - 8 * s, f.y - 12 * s, 16 * s, 30 * s);

      // Multi-layer Canopy with wind sway
      c.fillStyle = isAncient ? '#133e1c' : '#14532d';
      c.beginPath(); c.arc(f.x + sway, f.y - 28 * s, r, 0, Math.PI * 2); c.fill();

      c.fillStyle = isAncient ? '#185226' : '#16a34a';
      c.beginPath(); c.arc(f.x + sway - 10 * s, f.y - 34 * s, r * 0.7, 0, Math.PI * 2); c.fill();

      c.fillStyle = isAncient ? '#226b33' : '#4ade80';
      c.beginPath(); c.arc(f.x + sway + 8 * s, f.y - 42 * s, r * 0.45, 0, Math.PI * 2); c.fill();

    } else if (f.type === 'pine') {
      // Pine / Fir tree (Conical layered needle foliage)
      c.fillStyle = 'rgba(0,0,0,0.32)';
      c.beginPath(); c.ellipse(f.x, f.y + 14 * s, 26 * s, 9 * s, 0, 0, Math.PI * 2); c.fill();

      c.fillStyle = '#2b180d';
      c.fillRect(f.x - 6 * s, f.y - 8 * s, 12 * s, 22 * s);

      // 3 Tapering Triangular Tiers
      c.fillStyle = '#064e3b';
      c.beginPath();
      c.moveTo(f.x - 28 * s, f.y - 6 * s); c.lineTo(f.x + sway, f.y - 38 * s); c.lineTo(f.x + 28 * s, f.y - 6 * s);
      c.fill();

      c.fillStyle = '#047857';
      c.beginPath();
      c.moveTo(f.x - 22 * s, f.y - 24 * s); c.lineTo(f.x + sway, f.y - 54 * s); c.lineTo(f.x + 22 * s, f.y - 24 * s);
      c.fill();

      c.fillStyle = '#10b981';
      c.beginPath();
      c.moveTo(f.x - 16 * s, f.y - 42 * s); c.lineTo(f.x + sway, f.y - 70 * s); c.lineTo(f.x + 16 * s, f.y - 42 * s);
      c.fill();

    } else if (f.type === 'cypress') {
      // Slender Mediterranean Cypress
      c.fillStyle = 'rgba(0,0,0,0.28)';
      c.beginPath(); c.ellipse(f.x, f.y + 10 * s, 16 * s, 7 * s, 0, 0, Math.PI * 2); c.fill();

      c.fillStyle = '#301c10';
      c.fillRect(f.x - 4 * s, f.y - 6 * s, 8 * s, 16 * s);

      c.fillStyle = '#1e3a24';
      c.beginPath(); c.ellipse(f.x + (sway * 0.5), f.y - 36 * s, 14 * s, 42 * s, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#2f5a38';
      c.beginPath(); c.ellipse(f.x + (sway * 0.5) - 3 * s, f.y - 38 * s, 9 * s, 36 * s, 0, 0, Math.PI * 2); c.fill();

    } else if (f.type === 'palm') {
      // Desert Date Palm
      c.fillStyle = 'rgba(0,0,0,0.3)';
      c.beginPath(); c.ellipse(f.x, f.y + 8 * s, 22 * s, 8 * s, 0, 0, Math.PI * 2); c.fill();

      // Curved Trunk
      c.strokeStyle = '#78350f';
      c.lineWidth = 9 * s;
      c.beginPath();
      c.moveTo(f.x, f.y);
      c.quadraticCurveTo(f.x + 8 * s, f.y - 30 * s, f.x + 14 * s + sway, f.y - 60 * s);
      c.stroke();

      // Drooping Palm Fronds
      const crownX = f.x + 14 * s + sway;
      const crownY = f.y - 60 * s;
      c.strokeStyle = '#15803d';
      c.lineWidth = 4 * s;
      for (let p = 0; p < 6; p++) {
        const ang = (p * Math.PI / 3) + (tTime * 0.2);
        c.beginPath();
        c.moveTo(crownX, crownY);
        c.quadraticCurveTo(crownX + Math.cos(ang) * 24 * s, crownY + Math.sin(ang) * 12 * s - 8 * s, crownX + Math.cos(ang) * 44 * s, crownY + Math.sin(ang) * 26 * s + 8 * s);
        c.stroke();
      }

    } else if (f.type === 'mushroom') {
      // Bioluminescent Giant Mushroom (Cave)
      c.fillStyle = 'rgba(0,0,0,0.4)';
      c.beginPath(); c.ellipse(f.x, f.y + 6 * s, 16 * s, 6 * s, 0, 0, Math.PI * 2); c.fill();

      c.fillStyle = '#e2e8f0';
      c.fillRect(f.x - 4 * s, f.y - 14 * s, 8 * s, 20 * s);

      c.fillStyle = f.color || '#a855f7';
      c.beginPath(); c.arc(f.x, f.y - 14 * s, 18 * s, Math.PI, 0); c.fill();

      c.fillStyle = '#ffffff';
      c.beginPath(); c.arc(f.x - 7 * s, f.y - 20 * s, 2.5 * s, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(f.x + 6 * s, f.y - 18 * s, 2.5 * s, 0, Math.PI * 2); c.fill();

    } else if (f.type === 'crystal') {
      // Single glowing crystal spike
      c.fillStyle = f.color || '#38bdf8';
      c.beginPath();
      c.moveTo(f.x - 8 * s, f.y + 4);
      c.lineTo(f.x, f.y - 34 * s);
      c.lineTo(f.x + 8 * s, f.y + 4);
      c.closePath();
      c.fill();

    } else if (f.type === 'lamppost') {
      // Wrought Iron Roadside Lamppost
      c.fillStyle = '#1e293b';
      c.fillRect(f.x - 3, f.y - 34, 6, 36);
      c.fillRect(f.x - 7, f.y - 2, 14, 4);

      // Lantern Glass & Glow
      c.fillStyle = '#fde047';
      c.beginPath(); c.arc(f.x, f.y - 32, 6, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#ffffff';
      c.beginPath(); c.arc(f.x, f.y - 32, 2.5, 0, Math.PI * 2); c.fill();

      // Top Cap
      c.fillStyle = '#0f172a';
      c.beginPath();
      c.moveTo(f.x - 8, f.y - 36);
      c.lineTo(f.x, f.y - 44);
      c.lineTo(f.x + 8, f.y - 36);
      c.closePath();
      c.fill();
    }
  });
}

// 4. Draw Dynamic Radial Lighting (Lighter Blend Mode)
function drawDynamicLighting(c, cameraX, cameraY, viewW, viewH) {
  c.save();
  c.globalCompositeOperation = 'lighter';

  WORLD_LIGHTS.forEach(l => {
    // Viewport Culling
    if (l.x < cameraX - l.r || l.x > cameraX + viewW + l.r || l.y < cameraY - l.r || l.y > cameraY + viewH + l.r) return;

    const flicker = Math.sin(Date.now() * 0.005 + l.x) * (l.r * 0.06);
    const rad = Math.max(10, l.r + flicker);

    const grad = c.createRadialGradient(l.x, l.y, 0, l.x, l.y, rad);
    grad.addColorStop(0, l.color);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    c.fillStyle = grad;
    c.beginPath();
    c.arc(l.x, l.y, rad, 0, Math.PI * 2);
    c.fill();
  });

  c.restore();
}

// 5. Draw Atmospheric Volumetric God Rays
function drawGodRays(c, cameraX, cameraY, viewW, viewH) {
  c.save();
  const rayTime = Date.now() * 0.0006;
  const rayAlpha = Math.sin(rayTime) * 0.03 + 0.07; // Soft breathing opacity

  c.fillStyle = `rgba(254, 240, 138, ${rayAlpha})`;
  for (let i = 0; i < 4; i++) {
    const rx = cameraX - 200 + (i * 320) + (Math.sin(rayTime + i) * 60);
    c.beginPath();
    c.moveTo(rx, cameraY - 100);
    c.lineTo(rx + 140, cameraY - 100);
    c.lineTo(rx - 120, cameraY + viewH + 100);
    c.lineTo(rx - 260, cameraY + viewH + 100);
    c.closePath();
    c.fill();
  }
  c.restore();
}

// 6. Draw Multi-Biome Ambient Particles
function drawAmbientParticles(c, cameraX, cameraY, viewW, viewH) {
  AMBIENT_PARTICLES.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.phase += 0.03;

    // Wrap around its home biome bounds
    if (p.x < p.baseX) p.x = p.baseX + p.baseW;
    if (p.x > p.baseX + p.baseW) p.x = p.baseX;
    if (p.y < p.baseY) p.y = p.baseY + p.baseH;
    if (p.y > p.baseY + p.baseH) p.y = p.baseY;

    if (p.x < cameraX - 20 || p.x > cameraX + viewW + 20 || p.y < cameraY - 20 || p.y > cameraY + viewH + 20) return;

    const pulse = (Math.sin(p.phase) + 1) * 0.35 + 0.3;

    if (p.theme === 'grass') {
      // Dandelion Fluff
      c.fillStyle = `rgba(254, 240, 138, ${pulse})`;
      c.beginPath(); c.arc(p.x, p.y, p.size, 0, Math.PI * 2); c.fill();
    } else if (p.theme === 'forest') {
      // Autumn Leaf Drift
      c.fillStyle = `rgba(217, 119, 6, ${pulse})`;
      c.beginPath(); c.ellipse(p.x, p.y, p.size * 1.5, p.size * 0.8, p.phase, 0, Math.PI * 2); c.fill();
    } else if (p.theme === 'lake') {
      // Water Shimmer Sparkle
      c.fillStyle = `rgba(186, 230, 253, ${pulse * 1.2})`;
      c.beginPath(); c.arc(p.x, p.y, p.size * 0.9, 0, Math.PI * 2); c.fill();
    } else if (p.theme === 'cave') {
      // Crystal Spore
      c.fillStyle = `rgba(192, 132, 252, ${pulse * 1.3})`;
      c.beginPath(); c.arc(p.x, p.y, p.size * 1.1, 0, Math.PI * 2); c.fill();
    } else if (p.theme === 'ruins') {
      // Golden Sand Mote
      c.fillStyle = `rgba(251, 191, 36, ${pulse * 0.9})`;
      c.beginPath(); c.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2); c.fill();
    } else {
      // Temple Ethereal Particle
      c.fillStyle = `rgba(255, 255, 255, ${pulse * 0.8})`;
      c.beginPath(); c.arc(p.x, p.y, p.size, 0, Math.PI * 2); c.fill();
    }
  });
}

// 7. Draw Cinematic Vignette on Screen Edges
function drawCinematicVignette(c, viewW, viewH) {
  const rad = Math.max(viewW, viewH) * 0.75;
  const vig = c.createRadialGradient(viewW / 2, viewH / 2, rad * 0.45, viewW / 2, viewH / 2, rad);
  vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vig.addColorStop(1, 'rgba(3, 7, 18, 0.45)');
  c.fillStyle = vig;
  c.fillRect(0, 0, viewW, viewH);
}

// Draw Treasures (With Golden Skyward Beacon & Particle Sparkles)
function drawTreasures(c) {
  const tTime = Date.now() * 0.0035;

  state.treasures.forEach(tr => {
    const isCompleted = tr.completed || (state.player && state.player.completedTreasures && state.player.completedTreasures.includes(tr.id));
    const isFailed = tr.failed || (state.player && state.player.failedTreasures && state.player.failedTreasures.includes(tr.id));
    const isClosest = state.closestTreasure && state.closestTreasure.id === tr.id;

    if (!isCompleted && !isFailed) {
      // 1. Golden Skyward Beacon of Light
      const grad = c.createLinearGradient(tr.x, tr.y, tr.x, tr.y - 120);
      grad.addColorStop(0, 'rgba(245, 158, 11, 0.4)');
      grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      c.fillStyle = grad;
      c.beginPath();
      c.moveTo(tr.x - 14, tr.y);
      c.lineTo(tr.x + 14, tr.y);
      c.lineTo(tr.x + 30, tr.y - 120);
      c.lineTo(tr.x - 30, tr.y - 120);
      c.closePath();
      c.fill();

      // Pulsing Aura
      const pulse = Math.sin(tTime * 2) * 6 + 22;
      c.fillStyle = isClosest ? 'rgba(245, 158, 11, 0.5)' : 'rgba(245, 158, 11, 0.25)';
      c.beginPath();
      c.arc(tr.x, tr.y, pulse + 8, 0, Math.PI * 2);
      c.fill();

      // Sparkles
      if (Math.random() < 0.25) {
        state.particles.push({
          x: tr.x + (Math.random() - 0.5) * 44,
          y: tr.y + (Math.random() - 0.5) * 44,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -Math.random() * 1.6,
          color: '#fef08a',
          size: Math.random() * 3 + 1,
          life: 0.8,
          decay: 0.035
        });
      }
    }

    // Shadow
    c.fillStyle = 'rgba(0,0,0,0.4)';
    c.beginPath();
    c.ellipse(tr.x, tr.y + 14, 20, 9, 0, 0, Math.PI * 2);
    c.fill();

    // Chest Body
    c.fillStyle = isCompleted ? '#64748b' : (isFailed ? '#334155' : '#92400e');
    c.fillRect(tr.x - 20, tr.y - 14, 40, 26);

    // Chest Lid
    c.fillStyle = isCompleted ? '#94a3b8' : (isFailed ? '#475569' : '#d97706');
    c.fillRect(tr.x - 22, tr.y - 20, 44, 11);

    // Lock & Trims
    c.fillStyle = isCompleted ? '#475569' : (isFailed ? '#991b1b' : '#fde047');
    c.fillRect(tr.x - 5, tr.y - 11, 10, 11);
    c.strokeStyle = isCompleted ? '#334155' : (isFailed ? '#ef4444' : '#f59e0b');
    c.lineWidth = 1.5;
    c.strokeRect(tr.x - 20, tr.y - 14, 40, 26);

    // Sleek, compact badge pill for chest to prevent visual overlap with players
    const iconPrefix = isCompleted ? '✔ ' : (isFailed ? '🔒 ' : '🔑 ');
    const badgeText = iconPrefix + tr.name;
    c.save();
    c.font = 'bold 10px Nunito, -apple-system, BlinkMacSystemFont, sans-serif';
    c.textAlign = 'left';
    c.textBaseline = 'middle';
    const textW = Math.ceil(c.measureText(badgeText).width);
    const padX = 8;
    const pillW = textW + padX * 2;
    const pillH = 18;
    const pillX = Math.round(tr.x - pillW / 2);
    const pillY = Math.round(tr.y - 34);

    // Translucent dark background pill
    c.fillStyle = 'rgba(10, 15, 28, 0.9)';
    c.strokeStyle = isCompleted ? '#10b981' : (isFailed ? '#ef4444' : '#f59e0b');
    c.lineWidth = 1.2;
    c.beginPath();
    if (c.roundRect) {
      c.roundRect(pillX, pillY, pillW, pillH, 9);
    } else {
      c.rect(pillX, pillY, pillW, pillH);
    }
    c.fill();
    c.stroke();

    // Text inside pill: strictly placed at pillX + padX to eliminate any alignment skew on mobile
    c.fillStyle = isCompleted ? '#6ee7b7' : (isFailed ? '#fca5a5' : '#fde68a');
    c.fillText(badgeText, pillX + padX, pillY + pillH / 2);
    c.restore();
  });
}

// ==============================================================
// AUTHENTIC MULTI-DIRECTIONAL ANIMATED SPRITE SYSTEM
// Extracted from official animationplayer.jpg:
// - idle: 4 breathing frames
// - walk_down: 6 full-stride front walk frames
// - walk_side: 6 full-stride side walk frames
// - walk_up: 5 full-stride back walk frames (authentic artist back-view!)
// Full Male & Female variants with dynamic palette tinting
// ==============================================================
const VER = 'v=9_' + Date.now();

const PLAYER_SPRITES = {
  male: { idle: [], walk_down: [], walk_side: [], walk_up: [] },
  female: { idle: [], walk_down: [], walk_side: [], walk_up: [] }
};

for (let i = 0; i < 4; i++) {
  const m = new Image(); m.src = '/assets/player_anim/idle_' + i + '.png?' + VER;
  PLAYER_SPRITES.male.idle.push(m);
  const f = new Image(); f.src = '/assets/player_anim_female/idle_' + i + '.png?' + VER;
  PLAYER_SPRITES.female.idle.push(f);
}
for (let i = 0; i < 6; i++) {
  const m = new Image(); m.src = '/assets/player_anim/walk_down_' + i + '.png?' + VER;
  PLAYER_SPRITES.male.walk_down.push(m);
  const f = new Image(); f.src = '/assets/player_anim_female/walk_down_' + i + '.png?' + VER;
  PLAYER_SPRITES.female.walk_down.push(f);
}
for (let i = 0; i < 6; i++) {
  const m = new Image(); m.src = '/assets/player_anim/walk_side_' + i + '.png?' + VER;
  PLAYER_SPRITES.male.walk_side.push(m);
  const f = new Image(); f.src = '/assets/player_anim_female/walk_side_' + i + '.png?' + VER;
  PLAYER_SPRITES.female.walk_side.push(f);
}
for (let i = 0; i < 5; i++) {
  const m = new Image(); m.src = '/assets/player_anim/walk_up_' + i + '.png?' + VER;
  PLAYER_SPRITES.male.walk_up.push(m);
  const f = new Image(); f.src = '/assets/player_anim_female/walk_up_' + i + '.png?' + VER;
  PLAYER_SPRITES.female.walk_up.push(f);
}

const spriteCache = new Map();

function hexToRgb(hex) {
  if (!hex || hex[0] !== '#') return { r: 16, g: 185, b: 129 };
  const num = parseInt(hex.slice(1), 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function getTintedExplorerSprite(gender, animName, frameIdx, vestHex, hatHex) {
  const isFemale = (gender === 'female');
  const charSet = isFemale ? PLAYER_SPRITES.female : PLAYER_SPRITES.male;
  const frames = charSet[animName] || charSet.idle;
  if (!frames || frames.length === 0) return null;
  
  const baseImg = frames[frameIdx % frames.length];
  if (!baseImg || !baseImg.complete || baseImg.naturalWidth === 0) {
    return null;
  }

  const vHex = (vestHex || '#10B981').toUpperCase();
  const hHex = (hatHex || '#8B5A2B').toUpperCase();
  const cacheKey = (isFemale ? 'female' : 'male') + '_' + animName + '_' + (frameIdx % frames.length) + '_' + vHex + '_' + hHex;

  if (spriteCache.has(cacheKey)) {
    return spriteCache.get(cacheKey);
  }

  const w = baseImg.naturalWidth;
  const h = baseImg.naturalHeight;
  const offCanvas = document.createElement('canvas');
  offCanvas.width = w;
  offCanvas.height = h;
  const offCtx = offCanvas.getContext('2d');
  offCtx.drawImage(baseImg, 0, 0);

  const isDefaultVest = (vHex === '#10B981' || vHex === '#166534');
  const isDefaultHat = (hHex === '#8B5A2B');

  if (!isDefaultVest || !isDefaultHat) {
    const imgData = offCtx.getImageData(0, 0, w, h);
    const data = imgData.data;
    const vestRgb = hexToRgb(vHex);
    const hatRgb = hexToRgb(hHex);

    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (a === 0) continue;

      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const pixelIdx = i / 4;
      const x = pixelIdx % w;
      const y = Math.floor(pixelIdx / w);

      // 1. Vest recoloring (torso region)
      if (!isDefaultVest && y >= 0.35 * h && y <= 0.78 * h) {
        if (g > r + 15 && g > b + 15) {
          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 95.0;
          data[i] = Math.min(255, Math.round(vestRgb.r * lum));
          data[i + 1] = Math.min(255, Math.round(vestRgb.g * lum));
          data[i + 2] = Math.min(255, Math.round(vestRgb.b * lum));
          continue;
        }
      }

      // 2. Hat recoloring (strictly hat region y <= 0.25*h, strictly protecting skin/face and feather)
      if (!isDefaultHat && y <= 0.25 * h) {
        const isFeather = (Math.abs(r - g) <= 14 && Math.abs(g - b) <= 14 && (r + g + b) / 3 >= 140);
        const isRibbon = (g > r + 15 && g > b + 15);
        const isOutline = ((r + g + b) / 3 < 50);
        const isSkin = (r > 165 && g > 110 && b > 75 && (r - b) > 25 && (r - g) < 85);

        if (!isFeather && !isRibbon && !isOutline && !isSkin) {
          if (r > 60 && r > b + 15 && (r - g) <= 75 && r > g - 10) {
            const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 130.0;
            data[i] = Math.min(255, Math.round(hatRgb.r * lum));
            data[i + 1] = Math.min(255, Math.round(hatRgb.g * lum));
            data[i + 2] = Math.min(255, Math.round(hatRgb.b * lum));
          }
        }
      }
    }
    offCtx.putImageData(imgData, 0, 0);
  }

  spriteCache.set(cacheKey, offCanvas);
  return offCanvas;
}

// Draw Detailed Explorer Character (Matching reference picture with multi-frame animations)
function drawExplorerCharacter(c, x, y, p, isSelf = false, scale = 1, previewAnim = 0, drawHUD = true) {
  const dir = p.direction || 'down';
  const facing = p.facing || (dir === 'left' ? 'left' : 'right');
  const gender = p.gender || 'male';
  const vestColor = p.outfitColor || p.color || '#10B981';
  const hatColor = p.hatColor || '#8B5A2B';
  const isMoving = p.moving || false;
  const animPhase = previewAnim > 0 ? previewAnim : (p.animFrame || 0);

  let animName = 'idle';
  let frameIdx = 0;

  if (isMoving) {
    // Mọi hướng di chuyển (lên, xuống, trái, phải) đều dùng chung animation bước đi ngang (walk_side)
    // Hoàn toàn không dùng động tác leo trèo hay đào bới
    animName = 'walk_side';
    frameIdx = Math.floor(animPhase) % 6;

  } else if (previewAnim > 0) {
    // In Preview: animated walk showcase!
    animName = 'walk_side';
    frameIdx = Math.floor(previewAnim * 1.5) % 6;
  } else {
    // In Game Idle
    animName = 'idle';
    frameIdx = Math.floor(Date.now() * 0.003) % 4;
  }

  c.save();
  c.translate(x, y);

  // 1. Soft Oval Ground Shadow
  c.fillStyle = 'rgba(0, 0, 0, 0.38)';
  c.beginPath();
  c.ellipse(0, 4, 18 * scale, 7 * scale, 0, 0, Math.PI * 2);
  c.fill();

  // Direction: if facing left, flip horizontally
  const isFacingLeft = (facing === 'left' || dir === 'left');
  if (isFacingLeft) {
    c.scale(-1, 1);
  }

  const sprite = getTintedExplorerSprite(gender, animName, frameIdx, vestColor, hatColor);

  const drawW = 46 * scale;
  const drawH = 74 * scale;

  if (sprite) {
    c.imageSmoothingEnabled = false; // Sharp 16-bit retro pixel art
    c.drawImage(sprite, -drawW / 2, -drawH + 4, drawW, drawH);
  } else {
    c.fillStyle = vestColor;
    c.fillRect(-drawW / 4, -drawH / 2, drawW / 2, drawH / 2);
  }



  // 4. Overhead HUD (Name & Score)
  if (drawHUD) {
    if (isFacingLeft) {
      c.scale(-1, 1);
    }
    c.textAlign = 'center';
    c.shadowBlur = 0;

    // Player Name with crisp outline
    c.font = 'bold 11px Nunito';
    c.strokeStyle = 'rgba(0,0,0,0.85)';
    c.lineWidth = 3;
    c.strokeText(p.name || '', 0, -drawH - 2);
    c.fillStyle = isSelf ? '#38bdf8' : '#ffffff';
    c.fillText(p.name || '', 0, -drawH - 2);

    // Score with crisp outline
    c.font = '900 11px Cinzel';
    c.strokeStyle = 'rgba(0,0,0,0.85)';
    c.lineWidth = 3;
    c.strokeText('⭐ ' + (p.score || 0), 0, -drawH - 16);
    c.fillStyle = '#fbbf24';
    c.fillText('⭐ ' + (p.score || 0), 0, -drawH - 16);
  }

  c.restore();
}

// Wrapper for in-game players
function drawCharacter(c, p, isSelf) {
  drawExplorerCharacter(c, p.x, p.y, p, isSelf, 1, 0, true);
}

// Draw Floating Texts & Particles
function drawEffects(c) {
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const pt = state.particles[i];
    pt.x += pt.vx;
    pt.y += pt.vy;
    pt.life -= pt.decay;
    if (pt.life <= 0) {
      state.particles.splice(i, 1);
      continue;
    }
    c.globalAlpha = pt.life;
    c.fillStyle = pt.color;
    c.beginPath();
    c.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
    c.fill();
  }
  c.globalAlpha = 1.0;

  for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
    const ft = state.floatingTexts[i];
    ft.y += ft.vy;
    ft.alpha -= 0.015;
    if (ft.alpha <= 0) {
      state.floatingTexts.splice(i, 1);
      continue;
    }
    c.globalAlpha = ft.alpha;
    c.font = '900 20px Cinzel';
    c.fillStyle = ft.color;
    c.shadowColor = 'rgba(0,0,0,0.9)';
    c.shadowBlur = 8;
    c.textAlign = 'center';
    c.fillText(ft.text, ft.x, ft.y);
  }
  c.globalAlpha = 1.0;
  c.shadowBlur = 0;
}

// Minimap
function drawMinimap() {
  const mw = minimapCanvas.width;
  const mh = minimapCanvas.height;
  const scaleX = mw / state.world.width;
  const scaleY = mh / state.world.height;

  minimapCtx.fillStyle = '#060a12';
  minimapCtx.fillRect(0, 0, mw, mh);

  // Biomes Ground
  BIOMES.forEach(b => {
    minimapCtx.fillStyle = b.ground;
    minimapCtx.fillRect(b.x * scaleX, b.y * scaleY, b.w * scaleX, b.h * scaleY);
  });

  // Minimap Organic Lake
  minimapCtx.fillStyle = '#0369a1';
  minimapCtx.beginPath();
  minimapCtx.ellipse(1450 * scaleX, 1800 * scaleY, 300 * scaleX, 380 * scaleY, 0, 0, Math.PI * 2);
  minimapCtx.fill();

  // Minimap Roads
  minimapCtx.strokeStyle = 'rgba(168, 140, 100, 0.45)';
  minimapCtx.lineWidth = 2.5;
  minimapCtx.lineCap = 'round';
  minimapCtx.lineJoin = 'round';
  ROAD_SEGMENTS.forEach(seg => {
    minimapCtx.beginPath();
    minimapCtx.moveTo(seg[0][0] * scaleX, seg[0][1] * scaleY);
    for (let i = 1; i < seg.length; i++) {
      minimapCtx.lineTo(seg[i][0] * scaleX, seg[i][1] * scaleY);
    }
    minimapCtx.stroke();
  });

  // Minimap Treasures
  const chestPulse = (Math.sin(Date.now() * 0.006) + 1) * 0.5;
  state.treasures.forEach(tr => {
    if (tr.completed) {
      minimapCtx.fillStyle = '#10B981';
      minimapCtx.beginPath();
      minimapCtx.arc(tr.x * scaleX, tr.y * scaleY, 2.5, 0, Math.PI * 2);
      minimapCtx.fill();
    } else if (tr.failed) {
      minimapCtx.fillStyle = '#ef4444';
      minimapCtx.beginPath();
      minimapCtx.arc(tr.x * scaleX, tr.y * scaleY, 2.5, 0, Math.PI * 2);
      minimapCtx.fill();
    } else {
      // Pulsing Golden Ring
      minimapCtx.fillStyle = '#f59e0b';
      minimapCtx.beginPath();
      minimapCtx.arc(tr.x * scaleX, tr.y * scaleY, 3 + chestPulse * 1.5, 0, Math.PI * 2);
      minimapCtx.fill();
      minimapCtx.strokeStyle = '#fef08a';
      minimapCtx.lineWidth = 1;
      minimapCtx.stroke();
    }
  });

  // Other Players
  for (const id in state.otherPlayers) {
    const op = state.otherPlayers[id];
    minimapCtx.fillStyle = '#38bdf8';
    minimapCtx.beginPath();
    minimapCtx.arc(op.x * scaleX, op.y * scaleY, 3, 0, Math.PI * 2);
    minimapCtx.fill();
  }

  // Self Player (Blinking Crimson / Amber)
  const flash = (Math.sin(Date.now() * 0.008) + 1) * 0.5;
  minimapCtx.fillStyle = `rgba(239, 68, 68, ${0.6 + flash * 0.4})`;
  minimapCtx.beginPath();
  minimapCtx.arc(state.player.x * scaleX, state.player.y * scaleY, 4.5, 0, Math.PI * 2);
  minimapCtx.fill();
  minimapCtx.strokeStyle = '#ffffff';
  minimapCtx.lineWidth = 1.2;
  minimapCtx.stroke();
}

requestAnimationFrame(render);

// ==============================================================
// CHARACTER PREVIEW RENDERING LOOP (LOGIN & WARDROBE)
// ==============================================================
const loginPreviewCanvas = document.getElementById('loginCharPreview');
const loginPreviewCtx = loginPreviewCanvas ? loginPreviewCanvas.getContext('2d') : null;

const wardrobePreviewCanvas = document.getElementById('wardrobeCharPreview');
const wardrobePreviewCtx = wardrobePreviewCanvas ? wardrobePreviewCanvas.getContext('2d') : null;

let previewAnimPhase = 0;

function renderCharacterPreviews() {
  previewAnimPhase += 0.05;

  // 1. Render Login Setup Preview
  if (loginPreviewCtx && loginModal && !loginModal.classList.contains('hidden')) {
    loginPreviewCtx.clearRect(0, 0, loginPreviewCanvas.width, loginPreviewCanvas.height);

    const tempPlayer = {
      name: '',
      gender: selectedGender || 'male',
      outfitColor: selectedOutfitColor || '#10B981',
      hatColor: selectedHatColor || '#8B5A2B',
      direction: 'down',
      score: 0,
      moving: false
    };

    drawExplorerCharacter(
      loginPreviewCtx,
      loginPreviewCanvas.width / 2,
      loginPreviewCanvas.height - 16,
      tempPlayer,
      false,
      1.55,
      previewAnimPhase,
      false
    );
  }

  // 2. Render Wardrobe In-Game Preview
  if (wardrobePreviewCtx && wardrobeModal && !wardrobeModal.classList.contains('hidden')) {
    wardrobePreviewCtx.clearRect(0, 0, wardrobePreviewCanvas.width, wardrobePreviewCanvas.height);

    const tempWardrobePlayer = {
      name: '',
      gender: wardrobeGender || 'male',
      outfitColor: wardrobeOutfit || '#10B981',
      hatColor: wardrobeHat || '#8B5A2B',
      direction: 'down',
      score: 0,
      moving: false
    };

    drawExplorerCharacter(
      wardrobePreviewCtx,
      wardrobePreviewCanvas.width / 2,
      wardrobePreviewCanvas.height - 16,
      tempWardrobePlayer,
      false,
      1.55,
      previewAnimPhase,
      false
    );
  }

  requestAnimationFrame(renderCharacterPreviews);
}

requestAnimationFrame(renderCharacterPreviews);
