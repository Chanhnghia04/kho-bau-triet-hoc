const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let tunnelProcess = null;
let tunnelState = {
  active: false,
  url: null,
  status: 'offline', // 'offline', 'connecting', 'online', 'error'
  error: null
};

let statusChangeCallback = null;

function notifyStatus() {
  if (typeof statusChangeCallback === 'function') {
    try {
      statusChangeCallback({ ...tunnelState });
    } catch (e) {
      console.error('[TUNNEL] Callback error:', e);
    }
  }
}

function getCloudflaredPath() {
  const localBin = path.join(__dirname, 'bin', 'cloudflared.exe');
  if (fs.existsSync(localBin)) {
    return localBin;
  }
  return 'cloudflared';
}

function startTunnel(port = 3000, onStatusChange = null) {
  if (onStatusChange) {
    statusChangeCallback = onStatusChange;
  }

  if (tunnelProcess) {
    console.log('[TUNNEL] Tunnel is already running:', tunnelState.url);
    return Promise.resolve(tunnelState);
  }

  return new Promise((resolve) => {
    const binPath = getCloudflaredPath();
    console.log(`[TUNNEL] Khởi động Cloudflare Tunnel cho port ${port}...`);

    tunnelState = {
      active: true,
      url: null,
      status: 'connecting',
      error: null
    };
    notifyStatus();

    try {
      tunnelProcess = spawn(binPath, ['tunnel', '--url', `http://localhost:${port}`], {
        windowsHide: true
      });
    } catch (err) {
      console.error('[TUNNEL] Lỗi chạy cloudflared:', err);
      tunnelState = {
        active: false,
        url: null,
        status: 'error',
        error: err.message
      };
      notifyStatus();
      return resolve(tunnelState);
    }

    let urlFound = false;

    const handleOutput = (chunk) => {
      const text = chunk.toString();
      // Cloudflare outputs the quick tunnel URL like: https://xxxx-xxxx.trycloudflare.com
      const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
      if (match && !urlFound) {
        urlFound = true;
        tunnelState.url = match[0];
        tunnelState.status = 'online';
        tunnelState.error = null;
        console.log(`[TUNNEL] 🌐 ĐÃ KẾT NỐI ONLINE THÀNH CÔNG! Link từ xa: ${tunnelState.url}`);
        notifyStatus();
        resolve(tunnelState);
      }
    };

    if (tunnelProcess.stdout) tunnelProcess.stdout.on('data', handleOutput);
    if (tunnelProcess.stderr) tunnelProcess.stderr.on('data', handleOutput);

    tunnelProcess.on('error', (err) => {
      console.error('[TUNNEL ERROR]', err);
      tunnelState.status = 'error';
      tunnelState.error = err.message;
      tunnelState.active = false;
      notifyStatus();
      if (!urlFound) resolve(tunnelState);
    });

    tunnelProcess.on('close', (code) => {
      console.log(`[TUNNEL] Đã dừng tiến trình Tunnel (code ${code}).`);
      tunnelProcess = null;
      tunnelState = {
        active: false,
        url: null,
        status: 'offline',
        error: null
      };
      notifyStatus();
    });

    // Timeout fallback after 20s if no URL is parsed
    setTimeout(() => {
      if (!urlFound && tunnelState.status === 'connecting') {
        tunnelState.status = 'error';
        tunnelState.error = 'Quá thời gian kết nối Cloudflare Tunnel (20s).';
        notifyStatus();
        resolve(tunnelState);
      }
    }, 20000);
  });
}

function stopTunnel() {
  if (tunnelProcess) {
    console.log('[TUNNEL] Đang dừng Cloudflare Tunnel...');
    try {
      tunnelProcess.kill('SIGINT');
    } catch (e) {
      try { tunnelProcess.kill(); } catch (_) {}
    }
    tunnelProcess = null;
  }
  tunnelState = {
    active: false,
    url: null,
    status: 'offline',
    error: null
  };
  notifyStatus();
  return tunnelState;
}

function getTunnelState() {
  return { ...tunnelState };
}

module.exports = {
  startTunnel,
  stopTunnel,
  getTunnelState
};
