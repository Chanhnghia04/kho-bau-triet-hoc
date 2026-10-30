// ==========================================
// KHO BÁU TRIẾT HỌC - ADMIN CONTROLLER & RADAR
// ==========================================

const socket = io();

const adminState = {
  players: {}, // id -> player object
  treasures: [],
  selectedPlayerId: null,
  worldWidth: 3600,
  worldHeight: 2700
};

// Canvas references
const radarCanvas = document.getElementById('adminRadarCanvas');
const radarCtx = radarCanvas.getContext('2d');
const radarTooltip = document.getElementById('radar-tooltip');
const ttName = document.getElementById('tt-name');
const ttInfo = document.getElementById('tt-info');

// DOM elements
const statOnlineCount = document.getElementById('stat-online-count');
const statTotalPlayers = document.getElementById('stat-total-players');
const statTreasuresCount = document.getElementById('stat-treasures-count');
const statQuestionsCount = document.getElementById('stat-questions-count');

playerTableBody = document.getElementById('player-table-body');
const tablePlayerCount = document.getElementById('table-player-count');
const eventStream = document.getElementById('event-stream');
const btnClearLogs = document.getElementById('btn-clear-logs');

// Top 3 Ranking DOM
const top3Panel = document.getElementById('top3-panel');
const top3Container = document.getElementById('top3-container');

// Top Actions
const btnAdminBroadcast = document.getElementById('btn-admin-broadcast');
const btnAdminStartTimer = document.getElementById('btn-admin-start-timer');
const btnAdminViewRankings = document.getElementById('btn-admin-view-rankings');
const adminMatchTimer = document.getElementById('admin-match-timer');
const btnAdminTimerText = document.getElementById('btn-admin-timer-text');

// Rankings Modal DOM
const adminRankingsModal = document.getElementById('admin-rankings-modal');
const btnCloseAdminRankings = document.getElementById('btn-close-admin-rankings');
const btnAdminRankingsOk = document.getElementById('btn-admin-rankings-ok');
const adminRankingsTableBody = document.getElementById('admin-rankings-table-body');

// QR Code Modal DOM
const btnShowAdminQr = document.getElementById('btn-show-admin-qr');
const adminQrModal = document.getElementById('admin-qr-modal');
const btnCloseQrModal = document.getElementById('btn-close-qr-modal');
const adminQrImage = document.getElementById('admin-qr-image');
const adminQrLoading = document.getElementById('admin-qr-loading');
const adminQrLinkInput = document.getElementById('admin-qr-link-input');
const btnCopyQrLink = document.getElementById('btn-copy-qr-link');
const copySuccessTip = document.getElementById('copy-success-tip');
const tabQrOnline = document.getElementById('tab-qr-online');
const tabQrLan = document.getElementById('tab-qr-lan');
const adminQrGuideText = document.getElementById('admin-qr-guide-text');

// Tunnel DOM
const btnToggleTunnel = document.getElementById('btn-toggle-tunnel');
const tunnelDot = document.getElementById('tunnel-dot');
const tunnelStatusText = document.getElementById('tunnel-status-text');

let networkState = {
  localIp: '',
  port: 3000,
  lanUrl: '',
  onlineUrl: '',
  isOnlineMode: false,
  activeUrl: '',
  qrCodeDataUrl: '',
  tunnelState: null
};

let selectedQrTab = 'online'; // 'online' or 'lan'
let lanQrCodeDataUrl = '';

// Biome bounds for Radar (3600x2700)
const BIOMES = [
  { name: 'Đồng Cỏ Tri Thức', x: 0, y: 0, w: 1000, h: 1100, color: 'rgba(34, 197, 94, 0.18)', border: '#22c55e' },
  { name: 'Rừng Sâu Đạo Đức', x: 1000, y: 0, w: 850, h: 1100, color: 'rgba(16, 185, 129, 0.22)', border: '#10b981' },
  { name: 'Đền Cổ Bản Ngã', x: 1850, y: 0, w: 900, h: 1100, color: 'rgba(168, 85, 247, 0.18)', border: '#a855f7' },
  { name: 'Tàn Tích Chân Lý', x: 2750, y: 0, w: 850, h: 1100, color: 'rgba(245, 158, 11, 0.18)', border: '#f59e0b' },
  { name: 'Hang Động Tự Do', x: 0, y: 1100, w: 1000, h: 1600, color: 'rgba(99, 102, 241, 0.2)', border: '#6366f1' },
  { name: 'Hồ Nước Ý Thức', x: 1000, y: 1100, w: 850, h: 1600, color: 'rgba(14, 165, 233, 0.24)', border: '#0ea5e9' },
  { name: 'Vương Quốc Biện Chứng', x: 1850, y: 1100, w: 900, h: 1600, color: 'rgba(236, 72, 153, 0.18)', border: '#ec4899' },
  { name: 'Thung Lũng Siêu Hình', x: 2750, y: 1100, w: 850, h: 1600, color: 'rgba(249, 115, 22, 0.2)', border: '#f97316' }
];

// Socket Connection
socket.on('connect', () => {
  console.log('[ADMIN] Connected to server.');
  socket.emit('join_admin');
});

// Full state sync
socket.on('admin_full_state', (data) => {
  adminState.players = {};
  data.players.forEach(p => {
    adminState.players[p.id] = p;
  });
  adminState.treasures = data.treasures || [];

  statTreasuresCount.textContent = adminState.treasures.length;
  statQuestionsCount.textContent = data.questionsCount || 10;

  if (data.networkInfo) {
    updateNetworkUI(data.networkInfo);
  }

  // Clear & populate history (nếu có panel log)
  if (eventStream) {
    eventStream.innerHTML = '';
    if (data.history && data.history.length > 0) {
      data.history.forEach(evt => appendEventLog(evt));
    }
  }

  if (data.matchState) {
    updateAdminTimerDisplay(data.matchState.status, data.matchState.remainingSeconds);
  }

  updateStats();
  renderTable();
  updateTop3Ranking();
});

// Player Joined
socket.on('admin_player_joined', (p) => {
  adminState.players[p.id] = { ...p, isOnline: true };
  updateStats();
  renderTable();
  updateTop3Ranking();
});

// Player Left
socket.on('admin_player_left', (data) => {
  if (adminState.players[data.id]) {
    adminState.players[data.id].isOnline = false;
  }
  updateStats();
  renderTable();
  updateTop3Ranking();
});

// Player Position Update Realtime
socket.on('admin_player_moved', (data) => {
  if (adminState.players[data.id]) {
    const p = adminState.players[data.id];
    p.x = data.x;
    p.y = data.y;
    p.direction = data.direction;
    p.moving = data.moving;
    p.region = data.region;
    p.isOnline = true;
  }
});

// Player Stats Update (Questions / Accuracy)
socket.on('admin_player_stats_update', (p) => {
  if (adminState.players[p.id]) {
    Object.assign(adminState.players[p.id], p);
    updateStats();
    renderTable();
    updateTop3Ranking();
  }
});

// Score change event
socket.on('admin_score_change', (data) => {
  if (adminState.players[data.playerId]) {
    Object.assign(adminState.players[data.playerId], data.updatedPlayer);
    updateStats();
    renderTable();
    updateTop3Ranking();
  }
});

// Live Event Stream
socket.on('admin_event', (evt) => {
  appendEventLog(evt);
});

// Append event to feed
function appendEventLog(evt) {
  if (!eventStream) return;
  const el = document.createElement('div');
  el.className = `log-entry ${evt.eventType || ''}`;
  el.innerHTML = `
    <span class="log-time">[${evt.timestamp || 'Realtime'}]</span>
    <span class="log-msg">${escapeHtml(evt.detail || '')}</span>
  `;
  eventStream.insertBefore(el, eventStream.firstChild);

  // Keep max 80 entries in DOM
  if (eventStream.children.length > 80) {
    eventStream.removeChild(eventStream.lastChild);
  }
}

if (btnClearLogs) {
  btnClearLogs.addEventListener('click', () => {
    if (eventStream) eventStream.innerHTML = '';
  });
}

// Update Top Stat Badges
function updateStats() {
  const all = Object.values(adminState.players);
  const online = all.filter(p => p.isOnline).length;

  statOnlineCount.textContent = online;
  statTotalPlayers.textContent = all.length;
  tablePlayerCount.textContent = `${online} online / ${all.length} tổng`;
}

// Render Players Table
function renderTable() {
  const all = Object.values(adminState.players);
  // Sort by online first, then by highest score
  all.sort((a, b) => {
    if (a.isOnline !== b.isOnline) return b.isOnline ? 1 : -1;
    return (b.score || 0) - (a.score || 0);
  });

  if (all.length === 0) {
    playerTableBody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding: 20px; color: #64748b;">Chưa có người chơi nào kết nối.</td></tr>`;
    return;
  }

  playerTableBody.innerHTML = '';
  all.forEach(p => {
    const tr = document.createElement('tr');
    if (p.id === adminState.selectedPlayerId) tr.classList.add('active-row');

    const statusBadge = p.isOnline
      ? `<span class="badge-status-pill status-online">ONLINE</span>`
      : `<span class="badge-status-pill status-offline">OFFLINE</span>`;

    tr.innerHTML = `
      <td class="td-player">
        <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${p.color || '#3b82f6'};"></span>
        <span>${escapeHtml(p.name)}</span>
      </td>
      <td class="td-score">${p.score || 0}</td>
      <td><b>${p.correct || 0}</b> / ${p.questionsAnswered || 0}</td>
      <td style="color:#06b6d4;">${p.treasuresFound || 0} 🗝️</td>
      <td style="color:#e2e8f0;">${escapeHtml(p.region || 'Đồng Cỏ')}</td>
      <td>${statusBadge}</td>
    `;

    tr.addEventListener('click', () => {
      selectPlayer(p.id);
    });

    playerTableBody.appendChild(tr);
  });
}

// Select a player
function selectPlayer(id) {
  adminState.selectedPlayerId = id;
  renderTable();
}

// ==========================================
// REALTIME TOP 1, 2, 3 RANKING PANEL
// ==========================================
function updateTop3Ranking() {
  if (!top3Container) return;
  const playersList = Object.values(adminState.players || {});

  // Sort players by score DESC, correct DESC, treasuresFound DESC, wrong ASC
  playersList.sort((a, b) => {
    if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
    if ((b.correct || 0) !== (a.correct || 0)) return (b.correct || 0) - (a.correct || 0);
    if ((b.treasuresFound || 0) !== (a.treasuresFound || 0)) return (b.treasuresFound || 0) - (a.treasuresFound || 0);
    return (a.wrong || 0) - (b.wrong || 0);
  });

  const titleEl = document.getElementById('rankings-panel-title');
  if (titleEl) {
    titleEl.textContent = '🏆 BẢNG XẾP HẠNG';
  }

  top3Container.innerHTML = '';

  if (playersList.length === 0) {
    top3Container.innerHTML = `
      <div style="text-align: center; padding: 24px 10px; color: #64748b; font-size: 13px;">
        Chưa có người chơi nào tham gia. Đang chờ kết nối realtime...
      </div>
    `;
    return;
  }

  // Tính thứ hạng chuẩn có hỗ trợ ĐỒNG HẠNG theo điểm số
  let currentRank = 1;
  playersList.forEach((p, idx) => {
    if (idx > 0) {
      const prev = playersList[idx - 1];
      if ((p.score || 0) < (prev.score || 0)) {
        currentRank = idx + 1;
      }
    }

    let rankCardClass = 'rank-general';
    let rankBadgeText = '';
    let badgeColorClass = 'badge-general';

    if (currentRank === 1) {
      rankCardClass = 'rank-gold';
      rankBadgeText = '🥇 HẠNG 1';
      badgeColorClass = 'badge-gold';
    } else if (currentRank === 2) {
      rankCardClass = 'rank-silver';
      rankBadgeText = '🥈 HẠNG 2';
      badgeColorClass = 'badge-silver';
    } else if (currentRank === 3) {
      rankCardClass = 'rank-bronze';
      rankBadgeText = '🥉 HẠNG 3';
      badgeColorClass = 'badge-bronze';
    } else {
      // Không để số 4, 5, 6... mà hiển thị huy hiệu người tham gia / đồng hạng
      rankCardClass = 'rank-general';
      rankBadgeText = '🎖️ ĐỒNG HẠNG';
      badgeColorClass = 'badge-general';
    }

    const card = document.createElement('div');
    card.className = `top3-card ${rankCardClass}`;
    if (p.id === adminState.selectedPlayerId) {
      card.classList.add('selected-card');
    }

    const initial = (p.name || 'P').charAt(0).toUpperCase();
    const avatarBg = p.color || (currentRank === 1 ? '#f59e0b' : currentRank === 2 ? '#94a3b8' : currentRank === 3 ? '#d97706' : '#3b82f6');
    const statusClass = p.isOnline ? 'online' : 'offline';
    const statusTitle = p.isOnline ? 'Đang online' : 'Đã offline';

    card.innerHTML = `
      <div class="top3-badge ${badgeColorClass}">${rankBadgeText}</div>
      <div class="top3-avatar" style="background:${avatarBg};">${initial}</div>
      <div class="top3-details">
        <div class="top3-name-row">
          <span class="top3-name">${escapeHtml(p.name || 'Ẩn danh')}</span>
          <span class="top3-status-dot ${statusClass}" title="${statusTitle}"></span>
          <span class="top3-region-inline">• ${escapeHtml(p.region || 'Đồng Cỏ')}</span>
        </div>
        <div class="top3-mini-stats">
          <span>🗝️ ${p.treasuresFound || 0} rương</span>
          <span>🎯 ${p.correct || 0}Đ / ${p.wrong || 0}S</span>
        </div>
      </div>
      <div class="top3-score-wrap">
        <span class="top3-score-num">${p.score || 0}</span>
        <span class="top3-score-text">ĐIỂM</span>
      </div>
    `;

    card.addEventListener('click', () => {
      selectPlayer(p.id);
    });

    top3Container.appendChild(card);
  });
}

if (btnAdminBroadcast) {
  btnAdminBroadcast.addEventListener('click', () => {
    const msg = prompt('Nhập nội dung thông báo phát cho toàn bộ người chơi:');
    if (msg && msg.trim()) {
      socket.emit('admin_action_broadcast', { text: msg.trim() });
    }
  });
}

function formatMatchTime(sec) {
  if (sec == null || isNaN(sec)) return '10:00';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function updateAdminTimerDisplay(status, remainingSeconds) {
  if (adminMatchTimer) {
    adminMatchTimer.textContent = formatMatchTime(remainingSeconds);
  }
  if (btnAdminStartTimer && btnAdminTimerText) {
    if (status === 'running') {
      btnAdminStartTimer.classList.add('btn-timer-running');
      btnAdminTimerText.textContent = `⏹ Dừng Lại (${formatMatchTime(remainingSeconds)})`;
    } else if (status === 'ended') {
      btnAdminStartTimer.classList.remove('btn-timer-running');
      btnAdminTimerText.textContent = '▶ Bắt Đầu Lại';
      if (adminMatchTimer) adminMatchTimer.textContent = '00:00 (Hết giờ)';
    } else {
      btnAdminStartTimer.classList.remove('btn-timer-running');
      btnAdminTimerText.textContent = '▶ Bắt Đầu';
    }
  }
}

if (btnAdminStartTimer) {
  btnAdminStartTimer.addEventListener('click', () => {
    // If currently running, click will stop match
    if (btnAdminStartTimer.classList.contains('btn-timer-running')) {
      if (confirm('Dừng trận đấu ngay bây giờ và tổng kết điểm vinh danh?')) {
        socket.emit('admin_action_stop_timer');
      }
      return;
    }

    const timerInput = document.getElementById('admin-timer-input');
    const minutes = timerInput ? parseInt(timerInput.value, 10) : 10;
    const duration = (!isNaN(minutes) && minutes >= 1 && minutes <= 60) ? minutes : 10;

    // Immediately start the match countdown
    socket.emit('admin_action_start_timer', { durationMinutes: duration });
  });
}

function showAdminRankings(rankings) {
  if (!rankings) rankings = [];
  adminState.rankings = rankings;

  const p1 = rankings[0] || null;
  const p2 = rankings[1] || null;
  const p3 = rankings[2] || null;

  const name1 = document.getElementById('admin-pname-1');
  const score1 = document.getElementById('admin-pscore-1');
  const sub1 = document.getElementById('admin-psub-1');
  if (name1) name1.textContent = p1 ? p1.name : 'Chưa có';
  if (score1) score1.textContent = p1 ? `${p1.score} pts` : '0 pts';
  if (sub1) sub1.textContent = p1 ? `${p1.treasuresFound}/30 rương` : '0 rương';

  const name2 = document.getElementById('admin-pname-2');
  const score2 = document.getElementById('admin-pscore-2');
  const sub2 = document.getElementById('admin-psub-2');
  if (name2) name2.textContent = p2 ? p2.name : 'Chưa có';
  if (score2) score2.textContent = p2 ? `${p2.score} pts` : '0 pts';
  if (sub2) sub2.textContent = p2 ? `${p2.treasuresFound}/30 rương` : '0 rương';

  const name3 = document.getElementById('admin-pname-3');
  const score3 = document.getElementById('admin-pscore-3');
  const sub3 = document.getElementById('admin-psub-3');
  if (name3) name3.textContent = p3 ? p3.name : 'Chưa có';
  if (score3) score3.textContent = p3 ? `${p3.score} pts` : '0 pts';
  if (sub3) sub3.textContent = p3 ? `${p3.treasuresFound}/30 rương` : '0 rương';

  if (adminRankingsTableBody) {
    adminRankingsTableBody.innerHTML = '';
    if (rankings.length === 0) {
      adminRankingsTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Chưa có người chơi nào tham gia.</td></tr>';
    } else {
      rankings.forEach(p => {
        let rankBadge = `${p.rank}`;
        if (p.rank === 1) rankBadge = '🥇 1';
        else if (p.rank === 2) rankBadge = '🥈 2';
        else if (p.rank === 3) rankBadge = '🥉 3';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="font-weight:900; font-size:15px; color:${p.rank === 1 ? '#fbbf24' : p.rank === 2 ? '#cbd5e1' : p.rank === 3 ? '#fdba74' : '#94a3b8'}">${rankBadge}</td>
          <td><b>${escapeHtml(p.name)}</b></td>
          <td class="text-gold font-bold">${p.score}</td>
          <td>${p.treasuresFound}/30</td>
          <td><span style="color:#10b981;">${p.correct} đúng</span> / <span style="color:#ef4444;">${p.wrong} sai</span></td>
          <td>${escapeHtml(p.region || 'Đồng Cỏ Tri Thức')}</td>
        `;
        adminRankingsTableBody.appendChild(tr);
      });
    }
  }

  if (adminRankingsModal) {
    adminRankingsModal.classList.remove('hidden');
  }
}

if (btnCloseAdminRankings) {
  btnCloseAdminRankings.addEventListener('click', () => {
    adminRankingsModal.classList.add('hidden');
  });
}
if (btnAdminRankingsOk) {
  btnAdminRankingsOk.addEventListener('click', () => {
    adminRankingsModal.classList.add('hidden');
  });
}
if (btnAdminViewRankings) {
  btnAdminViewRankings.addEventListener('click', () => {
    socket.emit('get_match_rankings');
  });
}

// Timer Socket Listeners
socket.on('match_started', (data) => {
  updateAdminTimerDisplay('running', data.remainingSeconds);
});

socket.on('match_timer_tick', (data) => {
  updateAdminTimerDisplay(data.status, data.remainingSeconds);
});

socket.on('match_ended', (data) => {
  updateAdminTimerDisplay('ended', 0);
  showAdminRankings(data.rankings);
});

socket.on('match_rankings_data', (data) => {
  showAdminRankings(data.rankings);
});

// RADAR CANVAS RENDERING LOOP
function renderRadar() {
  if (!radarCanvas || !radarCtx) return;
  const cw = radarCanvas.width || 960;
  const ch = radarCanvas.height || 720;
  const worldW = adminState.worldWidth || 3600;
  const worldH = adminState.worldHeight || 2700;
  const scaleX = cw / worldW;
  const scaleY = ch / worldH;

  try {

  // Background
  radarCtx.fillStyle = '#060a12';
  radarCtx.fillRect(0, 0, cw, ch);

  // 1. Draw Biomes
  BIOMES.forEach(b => {
    radarCtx.fillStyle = b.color;
    radarCtx.fillRect(b.x * scaleX, b.y * scaleY, b.w * scaleX, b.h * scaleY);
    radarCtx.strokeStyle = b.border;
    radarCtx.lineWidth = 1;
    radarCtx.strokeRect(b.x * scaleX, b.y * scaleY, b.w * scaleX, b.h * scaleY);

    // Biome Name
    radarCtx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    radarCtx.font = 'bold 11px Nunito';
    radarCtx.textAlign = 'center';
    radarCtx.fillText(b.name, (b.x + b.w / 2) * scaleX, (b.y + 24) * scaleY);
  });

  // World Boundary
  radarCtx.strokeStyle = '#f59e0b';
  radarCtx.lineWidth = 2;
  radarCtx.strokeRect(0, 0, cw, ch);

  // 2. Draw Treasures
  adminState.treasures.forEach(tr => {
    const tx = tr.x * scaleX;
    const ty = tr.y * scaleY;

    radarCtx.fillStyle = '#f59e0b';
    radarCtx.beginPath();
    radarCtx.arc(tx, ty, 5, 0, Math.PI * 2);
    radarCtx.fill();

    // Diamond marker
    radarCtx.strokeStyle = '#fef08a';
    radarCtx.lineWidth = 1.5;
    radarCtx.stroke();

    radarCtx.fillStyle = '#cbd5e1';
    radarCtx.font = '9px JetBrains Mono';
    radarCtx.textAlign = 'center';
    radarCtx.fillText(tr.name, tx, ty - 8);
  });

  // 3. Draw All Players as Interactive Dots (● Player 01)
  const time = Date.now() * 0.005;

  for (const id in adminState.players) {
    const p = adminState.players[id];
    const px = (p.x || 400) * scaleX;
    const py = (p.y || 400) * scaleY;
    const isSelected = p.id === adminState.selectedPlayerId;
    const isOnline = p.isOnline;

    // Movement Pulse Ripple if moving
    if (isOnline && p.moving) {
      const pulseR = 8 + Math.sin(time * 2) * 5;
      radarCtx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      radarCtx.lineWidth = 1.5;
      radarCtx.beginPath();
      radarCtx.arc(px, py, pulseR, 0, Math.PI * 2);
      radarCtx.stroke();
    }

    // Selected Target Ring
    if (isSelected) {
      radarCtx.strokeStyle = '#fbbf24';
      radarCtx.lineWidth = 2;
      radarCtx.beginPath();
      radarCtx.arc(px, py, 12, 0, Math.PI * 2);
      radarCtx.stroke();
    }

    // Player Dot
    radarCtx.fillStyle = isOnline ? (p.color || '#38bdf8') : '#64748b';
    radarCtx.beginPath();
    radarCtx.arc(px, py, isOnline ? 6.5 : 4.5, 0, Math.PI * 2);
    radarCtx.fill();

    radarCtx.strokeStyle = '#ffffff';
    radarCtx.lineWidth = 1.5;
    radarCtx.stroke();

    // Player Label (● Player Name & Score)
    radarCtx.fillStyle = isOnline ? '#ffffff' : '#94a3b8';
    radarCtx.font = isSelected ? 'bold 12px Nunito' : 'bold 11px Nunito';
    radarCtx.textAlign = 'center';
    radarCtx.fillText(`● ${p.name}`, px, py - 10);

    // Score subtitle
    if (isOnline) {
      radarCtx.fillStyle = '#fbbf24';
      radarCtx.font = '900 10px JetBrains Mono';
      radarCtx.fillText(`${p.score || 0} pts`, px, py + 16);
    }
  }
  } catch (err) {
    console.error('Radar render error:', err);
  }

  requestAnimationFrame(renderRadar);
}

// Click on Radar Canvas to select Player
radarCanvas.addEventListener('click', (e) => {
  const rect = radarCanvas.getBoundingClientRect();
  const clickX = (e.clientX - rect.left) * (radarCanvas.width / rect.width);
  const clickY = (e.clientY - rect.top) * (radarCanvas.height / rect.height);

  const scaleX = radarCanvas.width / adminState.worldWidth;
  const scaleY = radarCanvas.height / adminState.worldHeight;

  let clickedId = null;
  let minDist = 20;

  for (const id in adminState.players) {
    const p = adminState.players[id];
    const px = (p.x || 400) * scaleX;
    const py = (p.y || 400) * scaleY;
    const dist = Math.hypot(clickX - px, clickY - py);
    if (dist < minDist) {
      minDist = dist;
      clickedId = p.id;
    }
  }

  if (clickedId) {
    selectPlayer(clickedId);
  }
});

// Tooltip on Hover
radarCanvas.addEventListener('mousemove', (e) => {
  const rect = radarCanvas.getBoundingClientRect();
  const mouseX = (e.clientX - rect.left) * (radarCanvas.width / rect.width);
  const mouseY = (e.clientY - rect.top) * (radarCanvas.height / rect.height);

  const scaleX = radarCanvas.width / adminState.worldWidth;
  const scaleY = radarCanvas.height / adminState.worldHeight;

  let hoveredPlayer = null;
  for (const id in adminState.players) {
    const p = adminState.players[id];
    const px = (p.x || 400) * scaleX;
    const py = (p.y || 400) * scaleY;
    if (Math.hypot(mouseX - px, mouseY - py) < 14) {
      hoveredPlayer = p;
      break;
    }
  }

  if (hoveredPlayer) {
    radarTooltip.classList.remove('hidden');
    radarTooltip.style.left = `${e.clientX - rect.left + 15}px`;
    radarTooltip.style.top = `${e.clientY - rect.top + 10}px`;
    ttName.textContent = hoveredPlayer.name;
    ttInfo.textContent = `Điểm: ${hoveredPlayer.score || 0} | ${hoveredPlayer.region || 'Đồng Cỏ'} | ${hoveredPlayer.isOnline ? 'Online' : 'Offline'}`;
  } else {
    radarTooltip.classList.add('hidden');
  }
});

radarCanvas.addEventListener('mouseleave', () => {
  radarTooltip.classList.add('hidden');
});

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[s]));
}

// QR Modal Interactions
function updateNetworkUI(netInfo) {
  if (!netInfo) return;
  Object.assign(networkState, netInfo);

  // Update Tunnel pill in navbar
  if (tunnelStatusText && tunnelDot) {
    const tState = netInfo.tunnelState || {};
    if (tState.status === 'online' && netInfo.onlineUrl) {
      tunnelStatusText.textContent = 'BẬT (4G)';
      tunnelStatusText.className = 'stat-val highlight-green';
      tunnelDot.className = 'tunnel-pulse-dot online';
      if (btnToggleTunnel) btnToggleTunnel.title = `4G đang hoạt động: ${netInfo.onlineUrl}. Bấm để chuyển về Wi-Fi cục bộ.`;
    } else if (tState.status === 'connecting') {
      tunnelStatusText.textContent = 'ĐANG KẾT NỐI...';
      tunnelStatusText.className = 'stat-val highlight-gold';
      tunnelDot.className = 'tunnel-pulse-dot connecting';
      if (btnToggleTunnel) btnToggleTunnel.title = 'Đang kết nối Cloudflare Tunnel...';
    } else {
      tunnelStatusText.textContent = 'TẮT (WI-FI)';
      tunnelStatusText.className = 'stat-val';
      tunnelStatusText.style.color = '#94a3b8';
      tunnelDot.className = 'tunnel-pulse-dot offline';
      if (btnToggleTunnel) btnToggleTunnel.title = 'Chế độ 4G đang tắt. Bấm để bật kết nối Internet từ xa.';
    }
  }

  // Update mobile link pill
  const adminMob = document.getElementById('admin-mobile-url');
  if (adminMob) {
    adminMob.textContent = netInfo.activeUrl || netInfo.mobileUrl || netInfo.lanUrl;
  }

  // Auto-select online tab if online is active
  if (networkState.isOnlineMode && selectedQrTab !== 'lan') {
    selectedQrTab = 'online';
  } else if (!networkState.isOnlineMode) {
    selectedQrTab = 'lan';
  }

  renderQrModalContent();
}

function renderQrModalContent() {
  const isOnlineTab = (selectedQrTab === 'online');
  const hasOnlineUrl = Boolean(networkState.onlineUrl);
  const targetUrl = (isOnlineTab && hasOnlineUrl) ? networkState.onlineUrl : networkState.lanUrl;

  if (tabQrOnline) tabQrOnline.classList.toggle('active', isOnlineTab);
  if (tabQrLan) tabQrLan.classList.toggle('active', !isOnlineTab);

  if (adminQrLinkInput) adminQrLinkInput.value = targetUrl || '';

  if (adminQrGuideText) {
    if (isOnlineTab && hasOnlineUrl) {
      adminQrGuideText.innerHTML = `Bật <strong>Camera</strong> hoặc <strong>Zalo</strong> quét mã QR (hoạt động với <strong>4G, 5G</strong> hoặc <strong>bất kỳ Wi-Fi nào</strong>):`;
    } else {
      adminQrGuideText.innerHTML = `Bật <strong>Camera</strong> hoặc <strong>Zalo</strong> quét mã QR (điện thoại cần <strong>kết nối chung Wi-Fi</strong> với máy tính chủ):`;
    }
  }

  if (adminQrImage) {
    if (isOnlineTab && networkState.qrCodeDataUrl) {
      adminQrImage.src = networkState.qrCodeDataUrl;
      adminQrImage.style.display = 'block';
      if (adminQrLoading) adminQrLoading.style.display = 'none';
    } else {
      // Local LAN QR code
      if (!lanQrCodeDataUrl && networkState.lanUrl) {
        if (adminQrLoading) adminQrLoading.style.display = 'block';
        fetch('/api/network-info')
          .then(r => r.json())
          .then(d => {
            if (d.qrCodeDataUrl) {
              if (selectedQrTab === 'lan') {
                lanQrCodeDataUrl = d.qrCodeDataUrl;
                adminQrImage.src = lanQrCodeDataUrl;
                adminQrImage.style.display = 'block';
                if (adminQrLoading) adminQrLoading.style.display = 'none';
              }
            }
          });
      } else if (lanQrCodeDataUrl) {
        adminQrImage.src = lanQrCodeDataUrl;
        adminQrImage.style.display = 'block';
        if (adminQrLoading) adminQrLoading.style.display = 'none';
      } else if (networkState.qrCodeDataUrl) {
        adminQrImage.src = networkState.qrCodeDataUrl;
        adminQrImage.style.display = 'block';
        if (adminQrLoading) adminQrLoading.style.display = 'none';
      }
    }
  }
}

// Socket: Realtime network mode broadcast
socket.on('network_mode_changed', (netInfo) => {
  console.log('[ADMIN] Network mode updated:', netInfo);
  updateNetworkUI(netInfo);
});

// Toggle Tunnel on click
if (btnToggleTunnel) {
  btnToggleTunnel.addEventListener('click', () => {
    if (tunnelStatusText) {
      tunnelStatusText.textContent = 'ĐANG ĐỔI...';
      tunnelStatusText.className = 'stat-val highlight-gold';
    }
    if (tunnelDot) tunnelDot.className = 'tunnel-pulse-dot connecting';
    socket.emit('admin_toggle_tunnel');
  });
}

// Mode tabs inside modal
if (tabQrOnline) {
  tabQrOnline.addEventListener('click', () => {
    selectedQrTab = 'online';
    renderQrModalContent();
  });
}

if (tabQrLan) {
  tabQrLan.addEventListener('click', () => {
    selectedQrTab = 'lan';
    renderQrModalContent();
  });
}

// QR Modal Open / Close
function openAdminQrModal() {
  if (!adminQrModal) return;
  adminQrModal.classList.remove('hidden');
  if (copySuccessTip) copySuccessTip.style.display = 'none';

  if (!networkState.activeUrl) {
    if (adminQrLoading) adminQrLoading.style.display = 'block';
    fetch('/api/network-info')
      .then(res => res.json())
      .then(data => {
        updateNetworkUI(data);
      })
      .catch(err => {
        console.error('Lỗi nạp network info:', err);
        if (adminQrLoading) adminQrLoading.textContent = 'Lỗi nạp mã QR. Vui lòng thử lại!';
      });
  } else {
    renderQrModalContent();
  }
}

function closeAdminQrModal() {
  if (adminQrModal) adminQrModal.classList.add('hidden');
}

if (btnShowAdminQr) {
  btnShowAdminQr.addEventListener('click', openAdminQrModal);
}

if (btnCloseQrModal) {
  btnCloseQrModal.addEventListener('click', closeAdminQrModal);
}

if (adminQrModal) {
  adminQrModal.addEventListener('click', (e) => {
    if (e.target === adminQrModal) closeAdminQrModal();
  });
}

if (btnCopyQrLink) {
  btnCopyQrLink.addEventListener('click', () => {
    const url = (adminQrLinkInput && adminQrLinkInput.value) || networkState.activeUrl;
    if (!url) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        if (copySuccessTip) copySuccessTip.style.display = 'block';
        setTimeout(() => { if (copySuccessTip) copySuccessTip.style.display = 'none'; }, 3000);
      }).catch(() => {
        fallbackCopyText(url);
      });
    } else {
      fallbackCopyText(url);
    }
  });
}

function fallbackCopyText(text) {
  if (adminQrLinkInput) {
    adminQrLinkInput.select();
    adminQrLinkInput.setSelectionRange(0, 99999);
    try {
      document.execCommand('copy');
      if (copySuccessTip) copySuccessTip.style.display = 'block';
      setTimeout(() => { if (copySuccessTip) copySuccessTip.style.display = 'none'; }, 3000);
    } catch (err) {
      console.warn('Copy fallback failed:', err);
    }
  }
}

// Start Radar Loop
requestAnimationFrame(renderRadar);
