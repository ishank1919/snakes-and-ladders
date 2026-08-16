// Snakes & Ladders King - Screen 1 & Pure Board Engine

// --- Theme & Preset Definitions ---
const THEMES = {
  cyber: {
    id: 'cyber',
    name: 'Cyber Neon',
    boardBg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    tileEven: '#1e293b',
    tileOdd: '#0f172a',
    gridColor: 'rgba(56, 189, 248, 0.2)',
    textColor: '#f8fafc',
    numberColor: '#94a3b8',
    snakeHead: '#ef4444',
    snakeBody: '#dc2626',
    ladderColor: '#38bdf8',
    ladderRung: '#7dd3fc'
  },
  castle: {
    id: 'castle',
    name: 'Medieval Castle',
    boardBg: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)',
    tileEven: '#292524',
    tileOdd: '#1c1917',
    gridColor: 'rgba(234, 179, 8, 0.2)',
    textColor: '#f5f5f4',
    numberColor: '#a8a29e',
    snakeHead: '#f97316',
    snakeBody: '#ea580c',
    ladderColor: '#eab308',
    ladderRung: '#fde047'
  },
  royal: {
    id: 'royal',
    name: 'Royal Velvet',
    boardBg: 'linear-gradient(135deg, #1e1b4b 0%, #2e1065 100%)',
    tileEven: '#2e1065',
    tileOdd: '#1e1b4b',
    gridColor: 'rgba(192, 132, 252, 0.2)',
    textColor: '#faf5ff',
    numberColor: '#c084fc',
    snakeHead: '#f43f5e',
    snakeBody: '#e11d48',
    ladderColor: '#a855f7',
    ladderRung: '#d8b4fe'
  }
};

const PRESETS = {
  classic: {
    id: 'classic',
    name: 'Classic Board',
    ladders: { 4: 14, 9: 31, 20: 38, 28: 84, 40: 59, 51: 67, 63: 81, 71: 91 },
    snakes: { 17: 7, 54: 34, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 99: 78 }
  }
};

const AVATARS = [
  { id: 'cat', emoji: '🐱' },
  { id: 'dragon', emoji: '🐲' },
  { id: 'fox', emoji: '🦊' },
  { id: 'wizard', emoji: '🧙‍♂️' },
  { id: 'robot', emoji: '🤖' },
  { id: 'unicorn', emoji: '🦄' }
];

const LUDO_COLORS = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Green', hex: '#10b981' },
  { name: 'Blue', hex: '#38bdf8' },
  { name: 'Yellow', hex: '#fbbf24' }
];

// --- Web Audio Synthesizer ---
class SoundFx {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }
  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }
  toggle(enabled) { this.enabled = enabled; }

  playDiceRoll() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 5; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160 + Math.random() * 200, now + i * 0.05);
      osc.frequency.exponentialRampToValueAtTime(40, now + i * 0.05 + 0.04);
      gain.gain.setValueAtTime(0.15, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.05);
    }
  }

  playStep() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(500, now + 0.08);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  playLadderClimb() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [261.63, 329.63, 392.00, 523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.2, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.16);
    });
  }

  playSnakeSlide() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(150, now + 0.5);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.51);
  }

  playVictory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [{ f: 523.25, t: 0 }, { f: 659.25, t: 0.12 }, { f: 783.99, t: 0.24 }, { f: 1046.50, t: 0.36 }].forEach(({ f, t }) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + t);
      gain.gain.setValueAtTime(0.25, now + t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + t);
      osc.stop(now + t + 0.45);
    });
  }
}

const audioFx = new SoundFx();

// --- Coordinate Geometry ---
function getCoordinates(square) {
  if (square < 1) square = 1;
  if (square > 100) square = 100;
  const zeroBased = square - 1;
  const rowFromBottom = Math.floor(zeroBased / 10);
  const isOddRow = rowFromBottom % 2 !== 0;
  const col = isOddRow ? 9 - (zeroBased % 10) : zeroBased % 10;
  const rowFromTop = 9 - rowFromBottom;
  return {
    xPct: (col + 0.5) * 10,
    yPct: (rowFromTop + 0.5) * 10
  };
}

// --- App State ---
const state = {
  currentScreen: 'home', // 'home', 'game', 'podium', 'lobby'
  mode: 'single',        // 'single', 'multi', 'spectate', 'online'
  presetId: 'classic',
  themeId: 'cyber',
  soundEnabled: true,
  players: [],
  activePlayerIndex: 0,
  diceValue: 1,
  isRolling: false,
  isAnimating: false,
  isReverseMode: false,
  winner: null,
  totalMoves: 0
};

// --- DOM References ---
const screens = {
  home: document.getElementById('screen-home'),
  modeSelect: document.getElementById('screen-mode-select'),
  lobby: document.getElementById('screen-lobby'),
  game: document.getElementById('screen-game'),
  podium: document.getElementById('screen-podium')
};

const el = {
  // Screen 1 Buttons
  btnHomeMenu: document.getElementById('btn-home-menu'),
  btnHomeSound: document.getElementById('btn-home-sound'),
  btnPlayNow: document.getElementById('btn-play-now'),
  btnHomeExit: document.getElementById('btn-home-exit'),

  // Screen 2 Buttons
  btnModeReverse: document.getElementById('btn-mode-reverse'),
  btnModeAi: document.getElementById('btn-mode-ai'),
  btnMode2p: document.getElementById('btn-mode-2p'),
  btnMode3p: document.getElementById('btn-mode-3p'),
  btnMode4p: document.getElementById('btn-mode-4p'),
  btnModeOnline: document.getElementById('btn-mode-online'),
  btnModeBack: document.getElementById('btn-mode-back'),

  // Lobby Screen
  btnCreateRoom: document.getElementById('btn-create-room'),
  btnJoinRoom: document.getElementById('btn-join-room'),
  inputRoomCode: document.getElementById('input-room-code'),
  displayRoomCode: document.getElementById('display-room-code'),
  lobbyPlayersText: document.getElementById('lobby-players-text'),
  lobbyStatusArea: document.getElementById('lobby-status-area'),
  btnStartOnlineGame: document.getElementById('btn-start-online-game'),
  btnLobbyBack: document.getElementById('btn-lobby-back'),

  // Game Arena Elements
  boardContainer: document.getElementById('board-container'),
  tilesGrid: document.getElementById('tiles-grid'),
  laddersGroup: document.getElementById('ladders-group'),
  snakesGroup: document.getElementById('snakes-group'),
  pawnsLayer: document.getElementById('pawns-layer'),
  
  diceCube: document.getElementById('dice-cube'),
  btnRollDice: document.getElementById('btn-roll-dice'),
  activePlayerEmoji: document.getElementById('active-player-emoji'),
  turnBannerText: document.getElementById('turn-banner-text'),
  btnGameFullscreen: document.getElementById('btn-game-fullscreen'),
  btnGameExit: document.getElementById('btn-game-exit'),
  btnGameSound: document.getElementById('btn-game-sound'),
  
  // Modals
  modalMenu: document.getElementById('modal-menu'),
  btnCloseMenu: document.getElementById('btn-close-menu'),
  btnApplyMenu: document.getElementById('btn-apply-menu'),
  modalExit: document.getElementById('modal-exit'),
  btnCancelExit: document.getElementById('btn-cancel-exit'),
  btnConfirmExit: document.getElementById('btn-confirm-exit'),

  // Podium
  podiumSubtitle: document.getElementById('podium-subtitle'),
  podiumRanksContainer: document.getElementById('podium-ranks-container'),
  btnPodiumReplay: document.getElementById('btn-podium-replay'),
  btnPodiumHome: document.getElementById('btn-podium-home')
};

// --- Socket.io Setup ---
let socket = null;
let currentRoom = null;
let isHost = false;
let myPlayerId = null;

if (typeof io !== 'undefined') {
  socket = io();

  socket.on('connect', () => {
    console.log('Connected to multiplayer server.');
  });

  socket.on('room_created', (code) => {
    currentRoom = code;
    isHost = true;
    myPlayerId = socket.id;
    el.displayRoomCode.textContent = code;
    el.lobbyPlayersText.textContent = `Waiting for players (1/4)...`;
    el.lobbyStatusArea.classList.remove('hidden');
    el.btnStartOnlineGame.classList.remove('hidden');
  });

  socket.on('room_joined', (code) => {
    currentRoom = code;
    isHost = false;
    myPlayerId = socket.id;
    el.displayRoomCode.textContent = code;
    el.lobbyPlayersText.textContent = `Waiting for host to start...`;
    el.lobbyStatusArea.classList.remove('hidden');
    el.btnStartOnlineGame.classList.add('hidden');
  });

  socket.on('error_message', (msg) => alert(msg));

  socket.on('player_joined', (playerId) => {
    el.lobbyPlayersText.textContent = `Player joined! Ready to play.`;
    if (isHost && state.currentScreen === 'lobby') {
      socket.emit('sync_state', { targetSocketId: playerId, stateData: serializeGameState() });
    }
  });

  socket.on('player_left', (playerId) => {
    if (state.mode === 'online') alert('A player disconnected from the match.');
  });

  socket.on('initial_state', (stateData) => {
    deserializeGameState(stateData);
  });

  socket.on('perform_roll', (data) => {
    const { playerId, roll } = data;
    executeRoll(roll, playerId);
  });

  socket.on('match_started', (data) => {
    state.mode = 'online';
    const playerIds = data.players;
    
    // Assign players based on the socket IDs received from the server
    const p1Id = playerIds[0];
    const p1 = { id: p1Id, name: p1Id === myPlayerId ? 'Host (You)' : 'Host', avatar: AVATARS[0], color: LUDO_COLORS[0], isAi: false, position: 1 };
    
    // If there's a second player, assign them
    const p2Id = playerIds.length > 1 ? playerIds[1] : 'remote';
    const p2 = { id: p2Id, name: p2Id === myPlayerId ? 'Opponent (You)' : 'Opponent', avatar: AVATARS[2], color: LUDO_COLORS[1], isAi: false, position: 1 };
    
    state.players = [p1, p2];
    navigateTo('game');
  });

  socket.on('game_action', (data) => {
    if (data.action === 'sync_state_only') {
      deserializeGameState(data.data);
    }
  });
}

function serializeGameState() {
  return {
    presetId: state.presetId,
    themeId: state.themeId,
    isReverseMode: state.isReverseMode,
    players: state.players
  };
}

function deserializeGameState(data) {
  state.presetId = data.presetId;
  state.themeId = data.themeId;
  state.isReverseMode = data.isReverseMode;
  // If players were passed in data, use them, otherwise match_started handled it
  if (data.players) state.players = data.players;
}

// --- Screen Router ---
function navigateTo(screenName) {
  state.currentScreen = screenName;
  Object.keys(screens).forEach((name) => {
    if (name === screenName) {
      screens[name].classList.add('active');
    } else {
      screens[name].classList.remove('active');
    }
  });

  if (screenName === 'game') setupAndStartGame();
}

// --- Launch Match ---
function launchMatch() {
  const p1 = { id: 'p1', name: 'Player 1', avatar: AVATARS[0], color: LUDO_COLORS[0], isAi: false, position: 1 };
  const p2 = { id: 'p2', name: 'Player 2', avatar: AVATARS[2], color: LUDO_COLORS[1], isAi: false, position: 1 };
  const p3 = { id: 'p3', name: 'Player 3', avatar: AVATARS[3], color: LUDO_COLORS[2], isAi: false, position: 1 };
  const p4 = { id: 'p4', name: 'Player 4', avatar: AVATARS[5], color: LUDO_COLORS[3], isAi: false, position: 1 };

  if (state.mode === 'ai') {
    state.players = [
      p1,
      { id: 'p2', name: 'Cyber Bot 🤖', avatar: AVATARS[4], color: LUDO_COLORS[1], isAi: true, position: 1 }
    ];
  } else if (state.mode === '2p') {
    state.players = [p1, p2];
  } else if (state.mode === '3p') {
    state.players = [p1, p2, p3];
  } else if (state.mode === '4p') {
    state.players = [p1, p2, p3, p4];
  }

  navigateTo('game');
}

function setupAndStartGame() {
  state.winner = null;
  state.activePlayerIndex = 0;
  state.totalMoves = 0;
  state.players.forEach((p) => (p.position = 1));

  renderBoard();
  renderUI();
  checkAiTrigger();
}

function renderBoard() {
  const theme = THEMES[state.themeId] || THEMES.cyber;
  const preset = PRESETS[state.presetId] || PRESETS.classic;

  el.boardContainer.style.background = theme.boardBg;

  // Build 100 Grid Tiles
  el.tilesGrid.innerHTML = '';
  for (let r = 9; r >= 0; r--) {
    const isOddRow = r % 2 !== 0;
    const cols = isOddRow ? [9,8,7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7,8,9];
    cols.forEach((c) => {
      const tileNum = r * 10 + c + 1;
      const isEven = (r + c) % 2 === 0;

      const tileDiv = document.createElement('div');
      tileDiv.className = 'tile';
      tileDiv.style.backgroundColor = isEven ? theme.tileEven : theme.tileOdd;
      tileDiv.style.borderColor = theme.gridColor;

      const numDiv = document.createElement('div');
      numDiv.className = 'tile-number';
      numDiv.style.color = theme.numberColor;
      numDiv.textContent = tileNum;
      tileDiv.appendChild(numDiv);

      if (tileNum === 1) {
        const badge = document.createElement('div');
        badge.className = 'tile-start-end';
        badge.textContent = 'START';
        tileDiv.appendChild(badge);
      } else if (tileNum === 100) {
        const badge = document.createElement('div');
        badge.className = 'tile-start-end tile-finish';
        badge.textContent = 'WIN 🎉';
        tileDiv.appendChild(badge);
      }

      if (preset.snakes[tileNum]) {
        const icon = document.createElement('div');
        icon.style.cssText = 'font-size: 0.85rem; align-self: flex-end;';
        icon.textContent = '🐍';
        tileDiv.appendChild(icon);
      } else if (preset.ladders[tileNum]) {
        const icon = document.createElement('div');
        icon.style.cssText = 'font-size: 0.85rem; align-self: flex-end;';
        icon.textContent = '🪜';
        tileDiv.appendChild(icon);
      }

      el.tilesGrid.appendChild(tileDiv);
    });
  }

  // SVG Ladders
  el.laddersGroup.innerHTML = '';
  Object.entries(preset.ladders).forEach(([startStr, endNum]) => {
    const startNum = parseInt(startStr, 10);
    const start = getCoordinates(startNum);
    const end = getCoordinates(endNum);

    const dx = end.xPct - start.xPct;
    const dy = end.yPct - start.yPct;
    const len = Math.sqrt(dx * dx + dy * dy);
    const offset = 1.2;
    const nx = (-dy / len) * offset;
    const ny = (dx / len) * offset;

    const r1x1 = start.xPct + nx, r1y1 = start.yPct + ny;
    const r1x2 = end.xPct + nx, r1y2 = end.yPct + ny;
    const r2x1 = start.xPct - nx, r2y1 = start.yPct - ny;
    const r2x2 = end.xPct - nx, r2y2 = end.yPct - ny;

    let svgStr = `<line x1="${r1x1}" y1="${r1y1}" x2="${r1x2}" y2="${r1y2}" stroke="url(#ladderGlow)" stroke-width="0.7" stroke-linecap="round" />
                  <line x1="${r2x1}" y1="${r2y1}" x2="${r2x2}" y2="${r2y2}" stroke="url(#ladderGlow)" stroke-width="0.7" stroke-linecap="round" />`;

    const rungsCount = Math.max(3, Math.floor(len / 3.5));
    for (let i = 1; i < rungsCount; i++) {
      const t = i / rungsCount;
      const rx1 = r1x1 + (r1x2 - r1x1) * t;
      const ry1 = r1y1 + (r1y2 - r1y1) * t;
      const rx2 = r2x1 + (r2x2 - r2x1) * t;
      const ry2 = r2y1 + (r2y2 - r2y1) * t;
      svgStr += `<line x1="${rx1}" y1="${ry1}" x2="${rx2}" y2="${ry2}" stroke="${theme.ladderRung}" stroke-width="0.6" stroke-linecap="round" />`;
    }

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.innerHTML = svgStr;
    el.laddersGroup.appendChild(g);
  });

  // SVG Snakes
  el.snakesGroup.innerHTML = '';
  Object.entries(preset.snakes).forEach(([headStr, tailNum]) => {
    const headNum = parseInt(headStr, 10);
    const head = getCoordinates(headNum);
    const tail = getCoordinates(tailNum);

    const midX = (head.xPct + tail.xPct) / 2;
    const midY = (head.yPct + tail.yPct) / 2;
    const curveOffset = headNum % 2 === 0 ? 6 : -6;
    const cx = midX + curveOffset;
    const cy = midY - curveOffset;

    const pathD = `M ${head.xPct} ${head.yPct} Q ${cx} ${cy} ${tail.xPct} ${tail.yPct}`;

    const svgStr = `
      <path d="${pathD}" fill="none" stroke="rgba(0,0,0,0.5)" stroke-width="2.4" stroke-linecap="round" />
      <path d="${pathD}" fill="none" stroke="url(#snakeGlow)" stroke-width="1.8" stroke-linecap="round" />
      <path d="${pathD}" fill="none" stroke="#fff" stroke-width="0.3" stroke-dasharray="0.6, 0.8" opacity="0.6" />
      <circle cx="${head.xPct}" cy="${head.yPct}" r="1.3" fill="${theme.snakeHead}" stroke="#fff" stroke-width="0.3" />
      <circle cx="${head.xPct - 0.4}" cy="${head.yPct - 0.4}" r="0.3" fill="#fff" />
      <circle cx="${head.xPct + 0.4}" cy="${head.yPct - 0.4}" r="0.3" fill="#fff" />
    `;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.innerHTML = svgStr;
    el.snakesGroup.appendChild(g);
  });

  renderPawns();
}

function renderPawns() {
  el.pawnsLayer.innerHTML = '';
  state.players.forEach((player, pIdx) => {
    const sameTilePlayers = state.players.filter((p) => p.position === player.position);
    const tileIdx = sameTilePlayers.findIndex((p) => p.id === player.id);

    const coords = getCoordinates(player.position);
    let x = coords.xPct;
    let y = coords.yPct;

    if (sameTilePlayers.length > 1) {
      const angle = (tileIdx * (2 * Math.PI)) / sameTilePlayers.length;
      x += Math.cos(angle) * 2.2;
      y += Math.sin(angle) * 2.2;
    }

    const pawnDiv = document.createElement('div');
    pawnDiv.className = 'pawn';
    pawnDiv.style.left = `${x}%`;
    pawnDiv.style.top = `${y}%`;

    pawnDiv.innerHTML = `
      <div class="pawn-avatar-container" style="background: ${player.color.hex};">
        ${player.avatar.emoji}
      </div>
    `;

    el.pawnsLayer.appendChild(pawnDiv);
  });
}

function renderUI() {
  const activePlayer = state.players[state.activePlayerIndex];

  if (activePlayer) {
    el.activePlayerEmoji.textContent = activePlayer.avatar.emoji;
    if (state.mode === 'online') {
       el.turnBannerText.textContent = activePlayer.id === myPlayerId ? 'Your Turn!' : `${activePlayer.name}'s Turn`;
    } else {
       el.turnBannerText.textContent = `${activePlayer.name}'s Turn`;
    }
  }

  let disableRoll = state.isRolling || state.isAnimating || activePlayer?.isAi || !!state.winner;
  
  if (state.mode === 'online' && activePlayer) {
     if (activePlayer.id !== myPlayerId) disableRoll = true;
  }

  el.btnRollDice.disabled = disableRoll;
  el.btnHomeSound.textContent = state.soundEnabled ? '🔊 SOUND ON' : '🔇 MUTED';
  el.btnGameSound.textContent = state.soundEnabled ? '🔊' : '🔇';

  renderPawns();
}

function setDiceTransform(val) {
  let transformStr = 'rotateX(0deg) rotateY(0deg)';
  switch (val) {
    case 1: transformStr = 'rotateX(0deg) rotateY(0deg)'; break;
    case 2: transformStr = 'rotateX(0deg) rotateY(-90deg)'; break;
    case 3: transformStr = 'rotateX(0deg) rotateY(-180deg)'; break;
    case 4: transformStr = 'rotateX(0deg) rotateY(90deg)'; break;
    case 5: transformStr = 'rotateX(-90deg) rotateY(0deg)'; break;
    case 6: transformStr = 'rotateX(90deg) rotateY(0deg)'; break;
  }
  el.diceCube.style.transform = transformStr;
}

// --- Turn & Dice Handler ---
async function handleRollDice() {
  if (state.isRolling || state.isAnimating || state.winner) return;

  if (state.mode === 'online') {
    const activePlayer = state.players[state.activePlayerIndex];
    if (activePlayer.id !== myPlayerId) return; // Not your turn
    socket.emit('request_roll', currentRoom);
    return;
  }

  // Local game logic
  const rolledVal = Math.floor(Math.random() * 6) + 1;
  executeRoll(rolledVal, null);
}

function executeRoll(rolledVal, remotePlayerId) {
  state.isRolling = true;
  el.diceCube.classList.add('rolling-animation');
  audioFx.playDiceRoll();
  renderUI();

  setTimeout(async () => {
    state.diceValue = rolledVal;
    state.isRolling = false;
    state.totalMoves++;
    el.diceCube.classList.remove('rolling-animation');
    setDiceTransform(rolledVal);

    await processTurn(rolledVal);
  }, 600);
}

async function processTurn(roll) {
  state.isAnimating = true;
  const activePlayer = state.players[state.activePlayerIndex];
  const preset = PRESETS[state.presetId] || PRESETS.classic;
  const startPos = activePlayer.position;

  if (startPos + roll > 100) {
    state.isAnimating = false;
    switchTurn(roll);
    return;
  }

  let currentPos = startPos;
  for (let s = 1; s <= roll; s++) {
    currentPos = startPos + s;
    activePlayer.position = currentPos;
    audioFx.playStep();
    renderPawns();
    await new Promise((res) => setTimeout(res, 220));
  }

  let snakeTail, ladderTop;

  if (state.isReverseMode) {
    const reversedLadders = Object.fromEntries(Object.entries(preset.ladders).map(([k, v]) => [v, parseInt(k, 10)]));
    const reversedSnakes = Object.fromEntries(Object.entries(preset.snakes).map(([k, v]) => [v, parseInt(k, 10)]));
    ladderTop = reversedSnakes[currentPos]; 
    snakeTail = reversedLadders[currentPos]; 
  } else {
    snakeTail = preset.snakes[currentPos];
    ladderTop = preset.ladders[currentPos];
  }

  if (snakeTail) {
    audioFx.playSnakeSlide();
    await new Promise((res) => setTimeout(res, 400));
    activePlayer.position = snakeTail;
    currentPos = snakeTail;
    renderPawns();
    await new Promise((res) => setTimeout(res, 500));
  } else if (ladderTop) {
    audioFx.playLadderClimb();
    await new Promise((res) => setTimeout(res, 400));
    activePlayer.position = ladderTop;
    currentPos = ladderTop;
    renderPawns();
    await new Promise((res) => setTimeout(res, 500));
  }

  state.isAnimating = false;

  if (currentPos === 100) {
    state.winner = activePlayer;
    audioFx.playVictory();
    showPodiumScreen();
    return;
  }

  switchTurn(roll);
}

function switchTurn(roll) {
  if (roll !== 6) {
    state.activePlayerIndex = (state.activePlayerIndex + 1) % state.players.length;
  }
  renderUI();
  checkAiTrigger();
}

function checkAiTrigger() {
  if (state.winner || state.isRolling || state.isAnimating || state.mode === 'online') return;
  const activePlayer = state.players[state.activePlayerIndex];
  if (activePlayer && activePlayer.isAi) {
    setTimeout(() => {
      handleRollDice();
    }, 1100);
  }
}

function showPodiumScreen() {
  const standings = [...state.players].sort((a, b) => b.position - a.position);
  let subtitle = `${state.winner.name} conquered the board in ${state.totalMoves} turns!`;
  if (state.mode === 'online' && state.winner.id === myPlayerId) {
    subtitle = `You conquered the board in ${state.totalMoves} turns!`;
  }
  el.podiumSubtitle.textContent = subtitle;

  el.podiumRanksContainer.innerHTML = standings.map((p, idx) => `
    <div class="standing-row ${idx === 0 ? 'rank-1' : ''}">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <span style="font-size: 1.5rem;">${idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
        <span style="font-size: 1.3rem;">${p.avatar.emoji}</span>
        <span style="font-weight: 800; font-size: 1.1rem;">${p.name} ${p.id === myPlayerId ? '(You)' : ''}</span>
      </div>
      <span style="font-weight: 800; color: var(--ludo-yellow);">Tile ${p.position}</span>
    </div>
  `).join('');

  navigateTo('podium');

  if (typeof window.confetti === 'function') {
    const end = Date.now() + 3 * 1000;
    const frame = () => {
      window.confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 } });
      window.confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }
}

// --- Screen 1 Event Handlers ---
el.btnPlayNow.addEventListener('click', () => {
  navigateTo('modeSelect');
});

// Screen 2 Event Handlers
el.btnModeReverse.addEventListener('click', () => {
  state.isReverseMode = !state.isReverseMode;
  el.btnModeReverse.innerHTML = state.isReverseMode ? '🔄 REVERSE: ON' : '🔄 REVERSE';
  if (state.isReverseMode) {
    el.btnModeReverse.classList.add('btn-red-danger');
    el.btnModeReverse.classList.remove('btn-top-action');
  } else {
    el.btnModeReverse.classList.remove('btn-red-danger');
    el.btnModeReverse.classList.add('btn-top-action');
  }
});
el.btnModeAi.addEventListener('click', () => { state.mode = 'ai'; launchMatch(); });
el.btnMode2p.addEventListener('click', () => { state.mode = '2p'; launchMatch(); });
el.btnMode3p.addEventListener('click', () => { state.mode = '3p'; launchMatch(); });
el.btnMode4p.addEventListener('click', () => { state.mode = '4p'; launchMatch(); });
el.btnModeOnline.addEventListener('click', () => navigateTo('lobby'));
el.btnModeBack.addEventListener('click', () => navigateTo('home'));

// Lobby Event Handlers
el.btnCreateRoom.addEventListener('click', () => {
  if (socket) socket.emit('create_room');
});
el.btnJoinRoom.addEventListener('click', () => {
  const code = el.inputRoomCode.value.trim().toUpperCase();
  if (code && socket) socket.emit('join_room', code);
});
el.btnStartOnlineGame.addEventListener('click', () => {
  if (isHost && socket) {
    // Sync the final board settings to the guest before starting
    socket.emit('game_action', { roomCode: currentRoom, action: 'sync_state_only', data: serializeGameState() });
    // Tell the server to start the game and send player assignments
    socket.emit('start_game', currentRoom);
  }
});
el.btnLobbyBack.addEventListener('click', () => navigateTo('modeSelect'));

// Top Bar Action Buttons
el.btnHomeMenu.addEventListener('click', () => el.modalMenu.classList.remove('hidden'));

const toggleSound = () => {
  state.soundEnabled = !state.soundEnabled;
  audioFx.toggle(state.soundEnabled);
  renderUI();
};
el.btnHomeSound.addEventListener('click', toggleSound);
el.btnGameSound.addEventListener('click', toggleSound);

el.btnGameFullscreen.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => console.log(err));
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
  }
});

// Modals
el.btnHomeExit.addEventListener('click', () => el.modalExit.classList.remove('hidden'));
el.btnGameExit.addEventListener('click', () => el.modalExit.classList.remove('hidden'));
el.btnCancelExit.addEventListener('click', () => el.modalExit.classList.add('hidden'));
el.btnConfirmExit.addEventListener('click', () => {
  el.modalExit.classList.add('hidden');
  if (state.mode === 'online' && socket) {
    // Basic disconnect simulation
    window.location.reload(); 
  } else {
    navigateTo('home');
  }
});

el.btnCloseMenu.addEventListener('click', () => el.modalMenu.classList.add('hidden'));
el.btnApplyMenu.addEventListener('click', () => el.modalMenu.classList.add('hidden'));

document.querySelectorAll('[data-mode]').forEach((card) => {
  card.addEventListener('click', () => {
    document.querySelectorAll('[data-mode]').forEach((c) => c.classList.remove('selected'));
    card.classList.add('selected');
    state.mode = card.dataset.mode;
  });
});

document.querySelectorAll('[data-theme]').forEach((card) => {
  card.addEventListener('click', () => {
    document.querySelectorAll('[data-theme]').forEach((c) => c.classList.remove('selected'));
    card.classList.add('selected');
    state.themeId = card.dataset.theme;
  });
});

el.btnRollDice.addEventListener('click', handleRollDice);
el.btnPodiumReplay.addEventListener('click', () => navigateTo('game'));
el.btnPodiumHome.addEventListener('click', () => navigateTo('home'));

// --- App Initialization ---
navigateTo('home');
