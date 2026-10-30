const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const os = require('os');

const db = require('./database');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// Dynamic Local IP detection for mobile play
function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const LOCAL_IP = getLocalIp();

// Cloudflare Tunnel & Dynamic QR Code Generator for Remote / 4G Play
const QRCode = require('qrcode');
const tunnel = require('./tunnel');
let qrCodeDataUrl = '';
let currentActiveUrl = `http://${LOCAL_IP}:${PORT}`;

async function generateQRCode(url) {
  try {
    qrCodeDataUrl = await QRCode.toDataURL(url, {
      width: 340,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
    currentActiveUrl = url;
    console.log('[QR CODE] Đã sinh mã QR cho:', url);
    return qrCodeDataUrl;
  } catch (err) {
    console.error('[QR CODE] Lỗi tạo mã QR:', err);
    return '';
  }
}

function getNetworkPayload() {
  const tState = tunnel.getTunnelState();
  const isOnline = tState.status === 'online' && Boolean(tState.url);
  const activeUrl = isOnline ? tState.url : `http://${LOCAL_IP}:${PORT}`;
  return {
    localIp: LOCAL_IP,
    port: PORT,
    lanUrl: `http://${LOCAL_IP}:${PORT}`,
    onlineUrl: tState.url,
    isOnlineMode: isOnline,
    mobileUrl: activeUrl,
    activeUrl: activeUrl,
    adminUrl: `${activeUrl}/admin`,
    qrCodeDataUrl: qrCodeDataUrl,
    tunnelState: tState
  };
}

function onTunnelStatusUpdate(tState) {
  const targetUrl = (tState.status === 'online' && tState.url)
    ? tState.url
    : `http://${LOCAL_IP}:${PORT}`;

  generateQRCode(targetUrl).then(() => {
    const payload = getNetworkPayload();
    io.emit('network_mode_changed', payload);
    console.log(`[NETWORK SYNC] Đã cập nhật chế độ mạng: ${payload.isOnlineMode ? 'ONLINE 4G' : 'WI-FI LAN'} -> ${payload.activeUrl}`);
  });
}

// Generate local QR code immediately, then start Cloudflare Tunnel in background
generateQRCode(`http://${LOCAL_IP}:${PORT}`).then(() => {
  tunnel.startTunnel(PORT, onTunnelStatusUpdate).catch(err => {
    console.warn('[TUNNEL] Không thể tự động kết nối tunnel:', err.message);
  });
});

// Load questions and cards
const questionsFile = path.join(__dirname, 'data', 'questions.json');
const cardPoolFile = path.join(__dirname, 'data', 'cardPool.json');

let questions = [];
let cardPool = [];

try {
  questions = JSON.parse(fs.readFileSync(questionsFile, 'utf-8'));
  console.log(`[INFO] Đã nạp thành công ${questions.length} câu hỏi triết học.`);
} catch (e) {
  console.error('[ERROR] Không thể nạp questions.json:', e.message);
}

try {
  cardPool = JSON.parse(fs.readFileSync(cardPoolFile, 'utf-8'));
  console.log(`[INFO] Đã nạp thành công ${cardPool.length} loại thẻ bài vào Card Pool.`);
} catch (e) {
  console.error('[ERROR] Không thể nạp cardPool.json:', e.message);
}

app.use(cors());
app.use(express.json());
// Disable all browser caching so updates apply immediately on refresh
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});
app.use(express.static(path.join(__dirname, 'public'), {
  etag: false,
  maxAge: 0
}));

// Admin route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Network info for mobile QR / connection
app.get('/api/network-info', (req, res) => {
  res.json(getNetworkPayload());
});

app.get('/api/qr', (req, res) => {
  res.json(getNetworkPayload());
});

// Toggle Cloudflare Tunnel for Remote / 4G play
app.post('/api/tunnel/toggle', async (req, res) => {
  const tState = tunnel.getTunnelState();
  if (tState.active) {
    tunnel.stopTunnel();
  } else {
    await tunnel.startTunnel(PORT, onTunnelStatusUpdate);
  }
  res.json(getNetworkPayload());
});

// Stats API
app.get('/api/stats', (req, res) => {
  const allPlayers = db.getAllPlayers();
  const activeCount = Object.keys(activeSockets).length;
  const history = db.getHistory(30);
  const treasures = db.getTreasures();
  res.json({
    activePlayersCount: activeCount,
    totalRegisteredPlayers: allPlayers.length,
    treasuresCount: treasures.length,
    questionsCount: questions.length,
    localIp: LOCAL_IP,
    port: PORT,
    mobileUrl: `http://${LOCAL_IP}:${PORT}`,
    history
  });
});

// World Regions helper (3600x2700 Expanded World)
function getRegionByCoords(x, y) {
  if (y < 1100) {
    if (x < 1000) return 'Đồng Cỏ Tri Thức';
    if (x < 1850) return 'Rừng Sâu Đạo Đức';
    if (x < 2750) return 'Đền Cổ Bản Ngã';
    return 'Tàn Tích Chân Lý';
  } else {
    if (x < 1000) return 'Hang Động Tự Do';
    if (x < 1850) return 'Hồ Nước Ý Thức';
    if (x < 2750) return 'Đền Cổ Bản Ngã';
    return 'Tàn Tích Chân Lý';
  }
}

// Random Spawn Across The Entire 3600x2700 Map (Non-fixed)
function getRandomSpawnPosition() {
  const marginX = 140;
  const marginY = 140;
  const x = Math.floor(Math.random() * (3600 - marginX * 2) + marginX);
  const y = Math.floor(Math.random() * (2700 - marginY * 2) + marginY);
  const region = getRegionByCoords(x, y);
  return { x, y, region };
}

// In-memory active sockets and pending card draw sessions
const activeSockets = {}; // socketId -> playerId
const onlinePlayers = {}; // playerId -> live player object
const pendingCardDraws = {}; // drawId -> { playerId, cards, timestamp }

// ==========================================
// 10-MINUTE MATCH COUNTDOWN & TOURNAMENT STATE
// ==========================================
const DEFAULT_MATCH_DURATION = 10 * 60; // 600 seconds = 10 minutes
const matchState = {
  status: 'waiting', // 'waiting' | 'running' | 'ended'
  duration: DEFAULT_MATCH_DURATION,
  remainingSeconds: DEFAULT_MATCH_DURATION,
  timerInterval: null,
  startTime: null,
  rankings: []
};

function calculateRankings() {
  const onlineIds = Object.keys(onlinePlayers);
  if (db.cleanupOfflineZeroScorePlayers) {
    db.cleanupOfflineZeroScorePlayers(onlineIds);
  }
  const allDb = db.getAllPlayers();
  const list = allDb.map(p => {
    const live = onlinePlayers[p.id];
    return {
      id: p.id,
      name: live ? live.name : p.name,
      gender: live ? (live.gender || p.gender || 'male') : (p.gender || 'male'),
      outfitColor: live ? (live.outfitColor || p.outfitColor || '#10B981') : (p.outfitColor || '#10B981'),
      hatColor: live ? (live.hatColor || p.hatColor || '#8B5A2B') : (p.hatColor || '#8B5A2B'),
      score: live ? live.score : (p.score || 0),
      treasuresFound: live ? live.treasuresFound : (p.treasuresFound || 0),
      questionsAnswered: live ? live.questionsAnswered : (p.questionsAnswered || 0),
      correct: live ? live.correct : (p.correct || 0),
      wrong: live ? live.wrong : (p.wrong || 0),
      region: live ? live.region : (p.region || 'Đồng Cỏ Tri Thức'),
      isOnline: Boolean(live)
    };
  });

  // Sort by score DESC, then correct DESC, then treasuresFound DESC, then online players first, then wrong ASC
  list.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.correct !== a.correct) return b.correct - a.correct;
    if (b.treasuresFound !== a.treasuresFound) return b.treasuresFound - a.treasuresFound;
    if (b.isOnline !== a.isOnline) return (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0);
    if ((b.questionsAnswered || 0) !== (a.questionsAnswered || 0)) return (b.questionsAnswered || 0) - (a.questionsAnswered || 0);
    return a.wrong - b.wrong;
  });

  let currentRank = 1;
  return list.map((p, idx) => {
    if (idx > 0) {
      const prev = list[idx - 1];
      if (p.score < prev.score) {
        currentRank = idx + 1;
      }
    }
    return {
      ...p,
      rank: currentRank
    };
  });
}

function startMatchTimer(durationSeconds) {
  durationSeconds = durationSeconds || DEFAULT_MATCH_DURATION;
  if (matchState.timerInterval) {
    clearInterval(matchState.timerInterval);
    matchState.timerInterval = null;
  }

  // Reset scores & chest attempts, and scatter all players across the map
  db.resetAllScores();
  for (const pid in onlinePlayers) {
    onlinePlayers[pid].score = 0;
    onlinePlayers[pid].questionsAnswered = 0;
    onlinePlayers[pid].correct = 0;
    onlinePlayers[pid].wrong = 0;
    onlinePlayers[pid].treasuresFound = 0;
    onlinePlayers[pid].completedTreasures = [];
    onlinePlayers[pid].failedTreasures = [];
    onlinePlayers[pid].treasureAttempts = {};
    onlinePlayers[pid].lastCard = null;
    onlinePlayers[pid].hasCompletedAllTreasures = false;

    // Scatter player to random spawn across the whole 3600x2700 map
    const spawn = getRandomSpawnPosition();
    onlinePlayers[pid].x = spawn.x;
    onlinePlayers[pid].y = spawn.y;
    onlinePlayers[pid].region = spawn.region;
    db.upsertPlayer(pid, { x: spawn.x, y: spawn.y, region: spawn.region });

    const sockId = onlinePlayers[pid].socketId;
    if (sockId) {
      io.to(sockId).emit('force_teleport', {
        x: spawn.x,
        y: spawn.y,
        region: spawn.region
      });
    }

    // Broadcast new positions
    io.to('players_room').emit('player_moved', {
      id: pid,
      x: spawn.x,
      y: spawn.y,
      direction: 'down',
      facing: 'right',
      moving: false,
      region: spawn.region
    });
    io.to('admin_room').emit('admin_player_moved', {
      id: pid,
      x: spawn.x,
      y: spawn.y,
      direction: 'down',
      facing: 'right',
      moving: false,
      region: spawn.region
    });
  }

  matchState.status = 'running';
  matchState.duration = durationSeconds;
  matchState.remainingSeconds = durationSeconds;
  matchState.startTime = Date.now();
  matchState.rankings = [];

  const minutes = Math.ceil(durationSeconds / 60);
  const evt = db.addEvent('MATCH_STARTED', 'SYSTEM', 'ADMIN', `Admin đã bắt đầu trận đấu đếm ngược ${minutes} phút!`);
  io.to('admin_room').emit('admin_event', evt);

  // Broadcast match start to all players & admin
  io.emit('match_started', {
    status: matchState.status,
    duration: matchState.duration,
    remainingSeconds: matchState.remainingSeconds
  });

  io.to('players_room').emit('broadcast_announcement', {
    title: '⚔️ TRẬN ĐẤU BẮT ĐẦU! ⚔️',
    text: `Thời gian thi đấu: ${minutes} phút! Hãy giải các rương triết học để ghi điểm và tranh ngôi Quán Quân!`
  });

  matchState.timerInterval = setInterval(() => {
    matchState.remainingSeconds--;

    // Broadcast tick every second
    io.emit('match_timer_tick', {
      status: matchState.status,
      remainingSeconds: matchState.remainingSeconds
    });

    // 1-minute warning
    if (matchState.remainingSeconds === 60) {
      io.to('players_room').emit('broadcast_announcement', {
        title: '⏳ CHỈ CÒN 1 PHÚT! ⏳',
        text: 'Thời gian sắp hết! Hãy nhanh chóng mở và trả lời các rương triết học!'
      });
    }

    if (matchState.remainingSeconds <= 0) {
      clearInterval(matchState.timerInterval);
      matchState.timerInterval = null;
      endMatchTimer();
    }
  }, 1000);
}

function endMatchTimer() {
  matchState.status = 'ended';
  matchState.remainingSeconds = 0;
  matchState.rankings = calculateRankings();

  const top1 = matchState.rankings[0] ? `${matchState.rankings[0].name} (${matchState.rankings[0].score}đ)` : 'Chưa có';
  const top2 = matchState.rankings[1] ? `${matchState.rankings[1].name} (${matchState.rankings[1].score}đ)` : 'Chưa có';
  const top3 = matchState.rankings[2] ? `${matchState.rankings[2].name} (${matchState.rankings[2].score}đ)` : 'Chưa có';

  const evt = db.addEvent('MATCH_ENDED', 'SYSTEM', 'ADMIN', `Trận đấu kết thúc! 🥇 Quán Quân: ${top1} | 🥈 Á Quân: ${top2} | 🥉 Quý Quân: ${top3}`);
  io.to('admin_room').emit('admin_event', evt);

  io.emit('match_ended', {
    rankings: matchState.rankings,
    totalPlayers: matchState.rankings.length
  });

  io.to('players_room').emit('broadcast_announcement', {
    title: '🏆 HẾT GIỜ THI ĐẤU! 🏆',
    text: `Trận đấu 10 phút đã kết thúc! Chúc mừng Quán Quân ${top1}!`
  });
}

// Draw 4 distinct and balanced cards from card pool
function draw4RandomCards() {
  const selectedCards = [];
  const poolCopy = [...cardPool];

  // Guaranteed diverse selection: pick 4 distinct cards whenever possible
  while (selectedCards.length < 4 && poolCopy.length > 0) {
    const totalWeight = poolCopy.reduce((sum, c) => sum + (c.weight || 10), 0);
    let rand = Math.random() * totalWeight;
    let chosenIndex = 0;

    for (let i = 0; i < poolCopy.length; i++) {
      if (rand < poolCopy[i].weight) {
        chosenIndex = i;
        break;
      }
      rand -= poolCopy[i].weight;
    }

    const chosen = poolCopy.splice(chosenIndex, 1)[0];
    selectedCards.push({
      id: chosen.id,
      name: chosen.name,
      type: chosen.type,
      value: chosen.value,
      description: chosen.description,
      color: chosen.color,
      badge: chosen.badge
    });
  }

  // Fallback if pool is small
  while (selectedCards.length < 4) {
    const rand = cardPool[Math.floor(Math.random() * cardPool.length)];
    selectedCards.push({ ...rand });
  }

  return selectedCards;
}

// Socket.io Handlers
io.on('connection', (socket) => {
  // Handle Player Join
  socket.on('join_game', (payload = {}) => {
    let rawId = payload.playerId || `p_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`;
    let playerId = rawId.trim();

    // Prevent collision when opening 2 tabs in same browser with same cached ID
    if (onlinePlayers[playerId] && onlinePlayers[playerId].socketId !== socket.id) {
      playerId = `${playerId}_${Math.random().toString(36).substring(2, 6)}`;
      socket.emit('player_id_assigned', { playerId });
    }

    const playerName = (payload.playerName || `Người Khám Phá #${Math.floor(Math.random() * 900 + 100)}`).slice(0, 24);
    const gender = payload.gender || 'male';
    const outfitColor = payload.outfitColor || payload.playerColor || '#10B981';
    const hatColor = payload.hatColor || '#92400e';

    // Assign non-fixed random spawn across the entire 3600x2700 map
    const spawn = getRandomSpawnPosition();
    let playerRecord = db.upsertPlayer(playerId, {
      name: playerName,
      gender,
      outfitColor,
      hatColor,
      color: outfitColor,
      x: spawn.x,
      y: spawn.y,
      region: spawn.region
    });

    activeSockets[socket.id] = playerId;
    onlinePlayers[playerId] = {
      ...playerRecord,
      socketId: socket.id,
      direction: 'down',
      facing: 'right',
      moving: false,
      isOnline: true
    };

    socket.join('players_room');

    const completedList = (playerRecord && playerRecord.completedTreasures) || [];
    const failedList = (playerRecord && playerRecord.failedTreasures) || [];
    const attemptsMap = (playerRecord && playerRecord.treasureAttempts) || {};

    const treasures = db.getTreasures().map(t => ({
      ...t,
      completed: completedList.includes(t.id),
      failed: failedList.includes(t.id),
      attempts: attemptsMap[t.id] || 0
    }));

    const totalTreasuresCount = (db.data.treasures && db.data.treasures.length) ? db.data.treasures.length : 30;
    const isCompletedAll = (Number(onlinePlayers[playerId].treasuresFound) >= totalTreasuresCount) || 
                           ((completedList.length + failedList.length) >= totalTreasuresCount);

    socket.emit('init_game', {
      self: onlinePlayers[playerId],
      players: Object.values(onlinePlayers).filter(p => p.id !== playerId),
      treasures,
      isCompletedAll,
      world: { width: 3600, height: 2700 },
      networkInfo: getNetworkPayload(),
      matchState: {
        status: matchState.status,
        duration: matchState.duration,
        remainingSeconds: matchState.remainingSeconds,
        rankings: matchState.rankings
      }
    });

    socket.to('players_room').emit('player_joined', onlinePlayers[playerId]);

    const evt = db.addEvent('JOIN', playerId, playerName, `${playerName} đã tham gia thế giới khám phá.`);
    io.to('admin_room').emit('admin_event', evt);
    io.to('admin_room').emit('admin_player_joined', onlinePlayers[playerId]);

    console.log(`[PLAYER JOINED] ${playerName} (${playerId}) connected.`);
  });

  // Handle Player Movement
  socket.on('player_move', (data) => {
    const playerId = activeSockets[socket.id];
    if (!playerId || !onlinePlayers[playerId]) return;

    const p = onlinePlayers[playerId];
    const prevRegion = p.region;

    p.x = Math.max(20, Math.min(3580, Number(data.x) || p.x));
    p.y = Math.max(20, Math.min(2680, Number(data.y) || p.y));
    p.direction = data.direction || p.direction;
    if (data.facing) {
      p.facing = data.facing;
    } else if (data.direction === 'left' || data.direction === 'right') {
      p.facing = data.direction;
    }
    p.moving = Boolean(data.moving);
    p.region = getRegionByCoords(p.x, p.y);

    if (prevRegion !== p.region) {
      db.upsertPlayer(playerId, { x: p.x, y: p.y, region: p.region });
      const evt = db.addEvent('REGION_CHANGE', playerId, p.name, `${p.name} di chuyển đến ${p.region}`);
      io.to('admin_room').emit('admin_event', evt);
    }

    socket.to('players_room').emit('player_moved', {
      id: playerId,
      x: p.x,
      y: p.y,
      direction: p.direction,
      facing: p.facing,
      moving: p.moving,
      region: p.region
    });

    io.to('admin_room').emit('admin_player_moved', {
      id: playerId,
      x: p.x,
      y: p.y,
      direction: p.direction,
      facing: p.facing,
      moving: p.moving,
      region: p.region
    });
  });

  // Handle Appearance Change (Outfit & Gender)
  socket.on('change_appearance', (data) => {
    const playerId = activeSockets[socket.id];
    if (!playerId || !onlinePlayers[playerId]) return;

    const p = onlinePlayers[playerId];
    p.gender = data.gender || p.gender || 'male';
    p.outfitColor = data.outfitColor || p.outfitColor || '#10B981';
    p.hatColor = data.hatColor || p.hatColor || '#92400e';
    p.color = p.outfitColor;

    db.upsertPlayer(playerId, {
      gender: p.gender,
      outfitColor: p.outfitColor,
      hatColor: p.hatColor,
      color: p.outfitColor
    });

    io.to('players_room').emit('player_appearance_changed', {
      id: playerId,
      gender: p.gender,
      outfitColor: p.outfitColor,
      hatColor: p.hatColor,
      color: p.outfitColor
    });

    io.to('admin_room').emit('admin_player_stats_update', p);
  });

  // Handle Treasure Open Request
  socket.on('open_treasure', (data) => {
    const playerId = activeSockets[socket.id];
    if (!playerId || !onlinePlayers[playerId]) return;

    const p = onlinePlayers[playerId];
    const treasureId = data.treasureId;
    const treasures = db.getTreasures();
    const treasure = treasures.find(t => t.id === treasureId);

    if (!treasure) {
      socket.emit('error_message', { message: 'Kho báu không tồn tại!' });
      return;
    }

    const dist = Math.hypot(p.x - treasure.x, p.y - treasure.y);
    if (dist > 180) {
      socket.emit('error_message', { message: 'Bạn đang đứng quá xa kho báu!' });
      return;
    }

    if (matchState.status === 'ended') {
      socket.emit('error_message', {
        message: 'Trận đấu 10 phút đã kết thúc! Hãy xem bảng vinh danh thứ hạng hoặc đợi Admin bắt đầu trận mới.'
      });
      return;
    }

    const q = questions.find(item => item.id === treasure.questionId) || questions[0];
    if (!q) {
      socket.emit('error_message', { message: 'Không tìm thấy câu hỏi triết học!' });
      return;
    }

    const failedList = p.failedTreasures || [];
    if (failedList.includes(treasureId)) {
      socket.emit('error_message', {
        message: `Rương "${treasure.name}" đã bị phong ấn do bạn đã trả lời sai 2 lần! 🔒 Hãy khám phá các rương khác trên thế giới.`
      });
      return;
    }

    const completedList = p.completedTreasures || [];
    if (completedList.includes(treasureId)) {
      socket.emit('error_message', {
        message: `✨ Bạn đã mở thành công rương "${treasure.name}" rồi! Hãy đi tìm các rương kho báu khác.`
      });
      return;
    }

    const attemptsMap = p.treasureAttempts || {};
    const attempts = attemptsMap[treasureId] || 0;

    const evt = db.addEvent('TREASURE_INTERACT', playerId, p.name, `${p.name} đang mở kho báu "${treasure.name}" (${treasure.region})`);
    io.to('admin_room').emit('admin_event', evt);

    socket.emit('treasure_question', {
      treasureId: treasure.id,
      treasureName: treasure.name,
      region: treasure.region,
      questionId: q.id,
      theme: q.theme,
      title: q.title,
      scenario: q.scenario,
      options: q.options,
      attempts: attempts,
      maxAttempts: 2,
      alreadyCompleted: (p.completedTreasures || []).includes(treasure.id),
      alreadyFailed: failedList.includes(treasure.id)
    });
  });

  // Handle Question Answer Submission
  socket.on('submit_answer', (data) => {
    const playerId = activeSockets[socket.id];
    if (!playerId || !onlinePlayers[playerId]) return;

    const p = onlinePlayers[playerId];
    const { treasureId, questionId, selectedIndex, typedAnswer } = data;
    const q = questions.find(item => item.id === questionId);

    if (!q) {
      socket.emit('error_message', { message: 'Câu hỏi không hợp lệ!' });
      return;
    }

    const failedList = p.failedTreasures || [];
    if (failedList.includes(treasureId)) {
      socket.emit('error_message', {
        message: 'Rương này đã bị khóa do bạn đã trả lời sai 2 lần! 🔒 Hãy đi tìm rương khác.'
      });
      return;
    }

    const completedList = p.completedTreasures || [];
    if (completedList.includes(treasureId)) {
      socket.emit('error_message', {
        message: 'Bạn đã hoàn thành câu hỏi ở rương này rồi! Không thể nhận điểm thêm lần nữa.'
      });
      return;
    }

    let isCorrect = false;

    if (selectedIndex !== undefined && selectedIndex !== null) {
      isCorrect = Number(selectedIndex) === q.correctIndex;
    } else if (typedAnswer && typeof typedAnswer === 'string') {
      const lowerInput = typedAnswer.toLowerCase().trim();
      const correctOption = q.options[q.correctIndex].toLowerCase();
      isCorrect = lowerInput === correctOption ||
        (q.keywords && q.keywords.some(k => lowerInput.includes(k.toLowerCase())));
    }

    p.questionsAnswered = (p.questionsAnswered || 0) + 1;

    if (isCorrect) {
      p.correct = (p.correct || 0) + 1;

      if (!p.completedTreasures) p.completedTreasures = [];
      if (!p.completedTreasures.includes(treasureId)) {
        p.completedTreasures.push(treasureId);
        p.treasuresFound = (p.treasuresFound || 0) + 1;
      }

      // Generate 4 distinct random cards from pool
      const fourCards = draw4RandomCards();
      const drawId = `draw_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      pendingCardDraws[drawId] = {
        playerId,
        treasureId,
        cards: fourCards,
        timestamp: Date.now()
      };

      db.upsertPlayer(playerId, {
        questionsAnswered: p.questionsAnswered,
        correct: p.correct,
        treasuresFound: p.treasuresFound,
        completedTreasures: p.completedTreasures
      });

      const totalTreasuresCount = (db.data.treasures && db.data.treasures.length) ? db.data.treasures.length : 30;
      const completedCount = p.completedTreasures ? p.completedTreasures.length : 0;
      const failedCount = p.failedTreasures ? p.failedTreasures.length : 0;
      const isCompletedAll = (p.treasuresFound >= totalTreasuresCount) || ((completedCount + failedCount) >= totalTreasuresCount);

      if (isCompletedAll && !p.hasCompletedAllTreasures) {
        p.hasCompletedAllTreasures = true;
        socket.emit('mission_completed', {
          title: '🏆 KHO BÁU TRIẾT HỌC 🏆',
          message: 'Chúc mừng bạn đã hoàn thành nhiệm vụ tìm kiếm kiến thức triết học!'
        });
        io.to('players_room').emit('broadcast_announcement', {
          title: '🌟 TOÀN MÁY CHỦ VINH DANH 🌟',
          text: `Chúc mừng bạn ${p.name} đã hoàn thành nhiệm vụ tìm kiếm kiến thức triết học!`
        });
        const compEvt = db.addEvent('MISSION_COMPLETED', playerId, p.name, `🎉 ${p.name} đã hoàn thành xuất sắc 30/30 rương triết học!`);
        io.to('admin_room').emit('admin_event', compEvt);
      }

      // Send 4 cards to client so they are IMMEDIATELY DISPLAYED
      socket.emit('answer_result', {
        success: true,
        treasureId,
        drawId,
        cards: fourCards,
        explanation: q.explanation,
        message: 'Chính xác! ✨ Bạn nhận 10 điểm cơ bản. Hãy lật 1 trong 4 lá bài định mệnh!',
        isCompletedAll
      });

      const evt = db.addEvent(
        'ANSWER_CORRECT',
        playerId,
        p.name,
        `${p.name} trả lời đúng câu hỏi "${q.title}". Đang chọn 1 trong 4 lá bài [${fourCards.map(c => c.name).join(', ')}]!`
      );
      io.to('admin_room').emit('admin_event', evt);
      io.to('admin_room').emit('admin_player_stats_update', p);

    } else {
      p.wrong = (p.wrong || 0) + 1;

      if (!p.treasureAttempts) p.treasureAttempts = {};
      p.treasureAttempts[treasureId] = (p.treasureAttempts[treasureId] || 0) + 1;
      const currentAttempts = p.treasureAttempts[treasureId];

      if (currentAttempts >= 2) {
        // Locked after 2 failed attempts!
        if (!p.failedTreasures) p.failedTreasures = [];
        if (!p.failedTreasures.includes(treasureId)) {
          p.failedTreasures.push(treasureId);
        }

        db.upsertPlayer(playerId, {
          questionsAnswered: p.questionsAnswered,
          wrong: p.wrong,
          treasureAttempts: p.treasureAttempts,
          failedTreasures: p.failedTreasures
        });

        socket.emit('answer_result', {
          success: false,
          treasureId,
          locked: true,
          attempts: currentAttempts,
          maxAttempts: 2,
          message: 'Bạn đã trả lời chưa chính xác lần thứ 2! 🔒 Rương này đã bị phong ấn. Hãy đi tìm rương khác!'
        });

        const evt = db.addEvent(
          'TREASURE_LOCKED',
          playerId,
          p.name,
          `${p.name} trả lời sai 2 lần tại rương "${q.title}". Rương đã bị khóa!`
        );
        io.to('admin_room').emit('admin_event', evt);
        io.to('admin_room').emit('admin_player_stats_update', p);

        const totalTreasuresCount = (db.data.treasures && db.data.treasures.length) ? db.data.treasures.length : 30;
        const completedCount = p.completedTreasures ? p.completedTreasures.length : 0;
        const failedCount = p.failedTreasures ? p.failedTreasures.length : 0;
        const isCompletedAll = (p.treasuresFound >= totalTreasuresCount) || ((completedCount + failedCount) >= totalTreasuresCount);

        if (isCompletedAll && !p.hasCompletedAllTreasures) {
          p.hasCompletedAllTreasures = true;
          socket.emit('mission_completed', {
            title: '🏆 KHO BÁU TRIẾT HỌC 🏆',
            message: 'Chúc mừng bạn đã hoàn thành nhiệm vụ tìm kiếm kiến thức triết học!'
          });
          io.to('players_room').emit('broadcast_announcement', {
            title: '🌟 TOÀN MÁY CHỦ VINH DANH 🌟',
            text: `Chúc mừng bạn ${p.name} đã hoàn thành nhiệm vụ tìm kiếm kiến thức triết học!`
          });
          const compEvt = db.addEvent('MISSION_COMPLETED', playerId, p.name, `🎉 ${p.name} đã hoàn thành toàn bộ 30/30 rương triết học!`);
          io.to('admin_room').emit('admin_event', compEvt);
        }

      } else {
        // 1 attempt remaining
        db.upsertPlayer(playerId, {
          questionsAnswered: p.questionsAnswered,
          wrong: p.wrong,
          treasureAttempts: p.treasureAttempts
        });

        socket.emit('answer_result', {
          success: false,
          treasureId,
          locked: false,
          attempts: currentAttempts,
          maxAttempts: 2,
          message: 'Câu trả lời chưa chính xác ❌ (Lần 1/2). Bạn còn 1 cơ hội cuối cùng cho rương này!'
        });

        const evt = db.addEvent(
          'ANSWER_WRONG',
          playerId,
          p.name,
          `${p.name} trả lời chưa chính xác câu hỏi "${q.title}" (Lần 1/2).`
        );
        io.to('admin_room').emit('admin_event', evt);
        io.to('admin_room').emit('admin_player_stats_update', p);
      }
    }
  });

  // Handle Card Selection
  socket.on('choose_card', (data) => {
    const playerId = activeSockets[socket.id];
    if (!playerId || !onlinePlayers[playerId]) return;

    const p = onlinePlayers[playerId];
    const { drawId, cardIndex } = data;
    let session = pendingCardDraws[drawId];

    if (!session) {
      // Resilient fallback: find any pending draw for this player
      const pendingKey = Object.keys(pendingCardDraws).find(k => pendingCardDraws[k].playerId === playerId);
      if (pendingKey) {
        session = pendingCardDraws[pendingKey];
        delete pendingCardDraws[pendingKey];
      }
    } else {
      delete pendingCardDraws[drawId];
    }

    let card = null;
    if (session && session.cards) {
      card = session.cards[Number(cardIndex) || 0];
    }
    if (!card) {
      // Fallback: generate a random card so player is never stuck
      const pool = draw4RandomCards();
      card = pool[Number(cardIndex) || 0] || pool[0];
    }

    const prevScore = p.score || 0;
    // Nguyên tắc chuẩn: Trả lời đúng chắc chắn nhận 10 điểm cơ bản
    const baseWithTen = prevScore + 10;
    let newScore = baseWithTen;

    switch (card.type) {
      case 'mul_quest_10': // x2 10 điểm đó -> nhận 20 điểm vào tổng
        newScore = prevScore + 20;
        break;
      case 'mul_all_2': // x2 toàn bộ điểm -> nhân đôi toàn bộ tổng điểm
        newScore = baseWithTen * 2;
        break;
      case 'add_5': // +5 điểm -> nhận 15 điểm
        newScore = baseWithTen + 5;
        break;
      case 'sub_5': // -5 điểm -> nhận 5 điểm (không âm)
        newScore = Math.max(0, baseWithTen - 5);
        break;
      case 'zero_quest_10': // x0 10 điểm đó -> mất 10 điểm câu hỏi
        newScore = prevScore;
        break;
      case 'div_all_2': // chia 2 toàn bộ số điểm
        newScore = Math.max(0, Math.floor(baseWithTen / 2));
        break;
      // Fallback
      case 'add':
        newScore = baseWithTen + (card.value || 0);
        break;
      case 'subtract':
        newScore = Math.max(0, baseWithTen - (card.value || 0));
        break;
      case 'multiply':
        newScore = baseWithTen * (card.value || 1);
        break;
      case 'divide':
        newScore = Math.max(0, Math.floor(baseWithTen / (card.value || 1)));
        break;
      default:
        newScore = baseWithTen;
    }

    p.score = newScore;
    p.lastCard = card.name;

    db.upsertPlayer(playerId, {
      score: newScore,
      lastCard: card.name
    });

    socket.emit('card_chosen_success', {
      card,
      prevScore,
      newScore,
      message: `Bạn đã chọn ${card.badge} ${card.name}! Điểm số: ${prevScore} ➔ ${newScore}`
    });

    io.to('players_room').emit('player_score_updated', {
      playerId,
      playerName: p.name,
      cardName: card.name,
      prevScore,
      newScore
    });

    const logText = `${p.name} chọn lá [${card.name}]. Điểm số thay đổi: ${prevScore} ➔ ${newScore}`;
    const evt = db.addEvent('CARD_CHOSEN', playerId, p.name, logText, prevScore, newScore);

    io.to('admin_room').emit('admin_event', evt);
    io.to('admin_room').emit('admin_score_change', {
      playerId,
      playerName: p.name,
      cardName: card.name,
      prevScore,
      newScore,
      updatedPlayer: p
    });

    console.log(`[CARD CHOSEN] ${p.name} picked ${card.name}. Score: ${prevScore} -> ${newScore}`);
  });

  // Admin Socket Connection
  socket.on('join_admin', () => {
    socket.join('admin_room');
    console.log(`[ADMIN] Socket ${socket.id} connected to Admin Panel.`);

    const allDbPlayers = db.getAllPlayers();
    const mergedList = allDbPlayers.map(p => {
      const live = onlinePlayers[p.id];
      return {
        ...p,
        isOnline: Boolean(live),
        x: live ? live.x : p.x,
        y: live ? live.y : p.y,
        direction: live ? live.direction : (p.direction || 'down'),
        moving: live ? live.moving : false,
        region: live ? live.region : (p.region || 'Đồng Cỏ Tri Thức')
      };
    });

    socket.emit('admin_full_state', {
      players: mergedList,
      treasures: db.getTreasures(),
      history: db.getHistory(50),
      questionsCount: questions.length,
      networkInfo: getNetworkPayload(),
      matchState: {
        status: matchState.status,
        duration: matchState.duration,
        remainingSeconds: matchState.remainingSeconds,
        rankings: matchState.rankings
      }
    });
  });

  // Admin Start Match Timer (custom duration)
  socket.on('admin_action_start_timer', (data) => {
    const minutes = (data && data.durationMinutes && data.durationMinutes >= 1 && data.durationMinutes <= 60)
      ? data.durationMinutes : 10;
    startMatchTimer(minutes * 60);
    const allDbPlayers = db.getAllPlayers();
    io.to('admin_room').emit('admin_full_state', {
      players: allDbPlayers.map(p => ({ ...p, isOnline: Boolean(onlinePlayers[p.id]) })),
      treasures: db.getTreasures(),
      history: db.getHistory(50),
      questionsCount: questions.length,
      networkInfo: getNetworkPayload(),
      matchState: {
        status: matchState.status,
        duration: matchState.duration,
        remainingSeconds: matchState.remainingSeconds,
        rankings: matchState.rankings
      }
    });
  });

  // Admin Toggle Cloudflare Tunnel (Remote / 4G Play)
  socket.on('admin_toggle_tunnel', async () => {
    const tState = tunnel.getTunnelState();
    if (tState.active) {
      tunnel.stopTunnel();
    } else {
      await tunnel.startTunnel(PORT, onTunnelStatusUpdate);
    }
  });

  // Admin Stop / End Match Timer
  socket.on('admin_action_stop_timer', () => {
    if (matchState.status === 'running') {
      endMatchTimer();
    }
  });

  // Get Match Rankings (Leaderboard)
  socket.on('get_match_rankings', (callback) => {
    const ranks = (matchState.status === 'ended' && matchState.rankings.length > 0)
      ? matchState.rankings
      : calculateRankings();
    if (typeof callback === 'function') {
      callback({ status: matchState.status, rankings: ranks });
    } else {
      socket.emit('match_rankings_data', { status: matchState.status, rankings: ranks });
    }
  });

  // Admin Reset Scores
  socket.on('admin_action_reset_scores', () => {
    db.resetAllScores();
    for (const pid in onlinePlayers) {
      onlinePlayers[pid].score = 0;
      onlinePlayers[pid].questionsAnswered = 0;
      onlinePlayers[pid].correct = 0;
      onlinePlayers[pid].wrong = 0;
      onlinePlayers[pid].treasuresFound = 0;
      onlinePlayers[pid].completedTreasures = [];
      onlinePlayers[pid].failedTreasures = [];
      onlinePlayers[pid].treasureAttempts = {};
      onlinePlayers[pid].lastCard = null;
      onlinePlayers[pid].hasCompletedAllTreasures = false;
    }
    io.to('players_room').emit('broadcast_announcement', {
      title: 'HỆ THỐNG',
      text: 'Admin đã đặt lại điểm số và kho báu của tất cả người chơi!'
    });
    io.to('admin_room').emit('admin_full_state', {
      players: db.getAllPlayers().map(p => ({ ...p, isOnline: Boolean(onlinePlayers[p.id]) })),
      treasures: db.getTreasures(),
      history: db.getHistory(50),
      questionsCount: questions.length,
      networkInfo: { mobileUrl: `http://${LOCAL_IP}:${PORT}` }
    });
  });

  // Admin Wipe All Players & History
  socket.on('admin_action_wipe_all', () => {
    db.wipeAllData();
    for (const pid in onlinePlayers) {
      onlinePlayers[pid].score = 0;
      onlinePlayers[pid].questionsAnswered = 0;
      onlinePlayers[pid].correct = 0;
      onlinePlayers[pid].wrong = 0;
      onlinePlayers[pid].treasuresFound = 0;
      onlinePlayers[pid].completedTreasures = [];
      onlinePlayers[pid].failedTreasures = [];
      onlinePlayers[pid].treasureAttempts = {};
      onlinePlayers[pid].lastCard = null;
      onlinePlayers[pid].hasCompletedAllTreasures = false;
    }
    io.to('players_room').emit('broadcast_announcement', {
      title: 'HỆ THỐNG',
      text: 'Toàn bộ dữ liệu điểm số và kho báu đã được làm mới hoàn toàn!'
    });
    io.to('admin_room').emit('admin_full_state', {
      players: db.getAllPlayers().map(p => ({ ...p, isOnline: Boolean(onlinePlayers[p.id]) })),
      treasures: db.getTreasures(),
      history: db.getHistory(50),
      questionsCount: questions.length,
      networkInfo: { mobileUrl: `http://${LOCAL_IP}:${PORT}` }
    });
  });

  // Admin Broadcast
  socket.on('admin_action_broadcast', (data) => {
    const text = data.text || 'Thông báo từ Admin!';
    io.to('players_room').emit('broadcast_announcement', {
      title: 'THÔNG BÁO TỪ ADMIN',
      text
    });
    const evt = db.addEvent('ADMIN_BROADCAST', 'SYSTEM', 'ADMIN', `Phát loa: "${text}"`);
    io.to('admin_room').emit('admin_event', evt);
  });

  // Admin Teleport
  socket.on('admin_action_teleport', (data) => {
    const { playerId, x, y } = data;
    const p = onlinePlayers[playerId];
    if (p) {
      p.x = x;
      p.y = y;
      p.region = getRegionByCoords(x, y);
      const targetSocket = io.sockets.sockets.get(p.socketId);
      if (targetSocket) {
        targetSocket.emit('force_teleport', { x, y, region: p.region });
      }
      io.to('players_room').emit('player_moved', {
        id: playerId,
        x: p.x,
        y: p.y,
        direction: p.direction,
        moving: false,
        region: p.region
      });
      const evt = db.addEvent('ADMIN_TELEPORT', playerId, p.name, `Admin dịch chuyển ${p.name} đến (${x}, ${y}) - ${p.region}`);
      io.to('admin_room').emit('admin_event', evt);
    }
  });

  // Handle Disconnect
  socket.on('disconnect', () => {
    const playerId = activeSockets[socket.id];
    delete activeSockets[socket.id];

    if (playerId && onlinePlayers[playerId]) {
      const p = onlinePlayers[playerId];
      if (p.socketId === socket.id) {
        const pName = p.name;
        delete onlinePlayers[playerId];

        db.upsertPlayer(playerId, { x: p.x, y: p.y, region: p.region });

        socket.to('players_room').emit('player_left', { id: playerId });

        const evt = db.addEvent('LEAVE', playerId, pName, `${pName} đã rời khỏi game.`);
        io.to('admin_room').emit('admin_event', evt);
        io.to('admin_room').emit('admin_player_left', { id: playerId, name: pName });

        console.log(`[PLAYER LEFT] ${pName} (${playerId}) disconnected.`);
      }
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🎮 Game "Kho Báu Triết Học" đang chạy trên cổng ${PORT}`);
  console.log(`💻 Người chơi máy tính:   http://localhost:${PORT}`);
  console.log(`📱 Chơi trên điện thoại:  http://${LOCAL_IP}:${PORT}`);
  console.log(`👑 Admin Dashboard:       http://localhost:${PORT}/admin`);
  console.log(`====================================================`);
});
