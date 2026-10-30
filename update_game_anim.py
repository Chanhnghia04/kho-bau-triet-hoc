with open(r'D:\1\kho-bau-triet-hoc\public\game.js', 'r', encoding='utf-8') as f:
    code = f.read()

start_marker = '// ==============================================================\n// AUTHENTIC 16-BIT PIXEL ART EXPLORER SPRITE SYSTEM'
end_marker = '// Wrapper for in-game players'

pos1 = code.find(start_marker)
pos2 = code.find(end_marker)

new_section = '''// ==============================================================
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

      // 2. Hat recoloring (head region, excluding white feather and dark green ribbon)
      if (!isDefaultHat && y <= 0.42 * h) {
        const isFeather = (x < 0.38 * w && y < 0.35 * h && Math.abs(r - g) <= 12 && Math.abs(g - b) <= 12);
        const isRibbon = (g > r + 20 && g > b + 20);
        if (!isFeather && !isRibbon) {
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
  const gender = p.gender || 'male';
  const vestColor = p.outfitColor || p.color || '#10B981';
  const hatColor = p.hatColor || '#8B5A2B';
  const isMoving = p.moving || false;
  const animPhase = previewAnim > 0 ? previewAnim : (p.animFrame || 0);

  let animName = 'idle';
  let frameIdx = 0;

  if (isMoving) {
    if (dir === 'up') {
      animName = 'walk_up';
      frameIdx = Math.floor(animPhase * 5) % 5;
    } else if (dir === 'left' || dir === 'right') {
      animName = 'walk_side';
      frameIdx = Math.floor(animPhase * 6) % 6;
    } else {
      animName = 'walk_down';
      frameIdx = Math.floor(animPhase * 6) % 6;
    }

    // Spawn walk dust particles under boots
    if (isSelf && Math.random() < 0.25) {
      state.particles.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y + 2,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.4,
        size: Math.random() * 2.2 + 1.2,
        color: 'rgba(203, 213, 225, 0.55)',
        life: 0.7,
        decay: 0.045
      });
    }
  } else if (previewAnim > 0) {
    // In Preview: animated walk showcase!
    animName = 'walk_down';
    frameIdx = Math.floor(previewAnim * 4.5) % 6;
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

  // Direction: if 'left', flip horizontally
  if (dir === 'left') {
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

  // 3. Ethereal Aura / Halo if Self Player
  if (isSelf && drawHUD) {
    c.strokeStyle = 'rgba(251, 191, 36, 0.85)';
    c.lineWidth = 2.5;
    c.beginPath();
    c.arc(0, -drawH / 2, 28 * scale, 0, Math.PI * 2);
    c.stroke();
  }

  // 4. Overhead HUD (Name & Score)
  if (drawHUD) {
    if (dir === 'left') {
      c.scale(-1, 1);
    }
    c.textAlign = 'center';
    c.font = 'bold 11px Nunito';
    c.fillStyle = '#ffffff';
    c.shadowColor = 'rgba(0,0,0,0.95)';
    c.shadowBlur = 5;
    c.fillText(p.name, 0, -drawH - 2);

    c.fillStyle = '#fbbf24';
    c.font = '900 11px Cinzel';
    c.fillText('⭐ ' + (p.score || 0), 0, -drawH - 16);
    c.shadowBlur = 0;
  }

  c.restore();
}

'''

if pos1 != -1 and pos2 != -1:
    updated = code[:pos1] + new_section + code[pos2:]
    with open(r'D:\1\kho-bau-triet-hoc\public\game.js', 'w', encoding='utf-8') as f:
        f.write(updated)
    print('Updated game.js with multi-directional spritesheet system!')
else:
    print('Markers not found!')
