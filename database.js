const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, 'data', 'store.json');

// Initial default treasures across 6 biomes in a 2400x1800 map
const DEFAULT_TREASURES = [
  {
    "id": "t1",
    "name": "Rương Tác giả bài báo khoa học",
    "x": 450,
    "y": 380,
    "region": "Đồng Cỏ Tri Thức",
    "questionId": "q1"
  },
  {
    "id": "t2",
    "name": "Rương Câu hỏi trung tâm của bài báo",
    "x": 250,
    "y": 250,
    "region": "Đồng Cỏ Tri Thức",
    "questionId": "q2"
  },
  {
    "id": "t3",
    "name": "Rương Bất bình đẳng xã hội do AI",
    "x": 820,
    "y": 280,
    "region": "Đồng Cỏ Tri Thức",
    "questionId": "q3"
  },
  {
    "id": "t4",
    "name": "Rương Phương pháp nghiên cứu chủ đạo",
    "x": 320,
    "y": 720,
    "region": "Đồng Cỏ Tri Thức",
    "questionId": "q4"
  },
  {
    "id": "t5",
    "name": "Rương Kết nối lý luận Chương III Triết học Mác – Lênin",
    "x": 750,
    "y": 850,
    "region": "Đồng Cỏ Tri Thức",
    "questionId": "q5"
  },
  {
    "id": "t6",
    "name": "Rương AI dưới góc nhìn Lực lượng sản xuất",
    "x": 1250,
    "y": 320,
    "region": "Rừng Sâu Đạo Đức",
    "questionId": "q6"
  },
  {
    "id": "t7",
    "name": "Rương Triết học về con người & Bản sắc qua lao động",
    "x": 1520,
    "y": 220,
    "region": "Rừng Sâu Đạo Đức",
    "questionId": "q7"
  },
  {
    "id": "t8",
    "name": "Rương Thời gian tác động trọng tâm",
    "x": 1780,
    "y": 350,
    "region": "Rừng Sâu Đạo Đức",
    "questionId": "q8"
  },
  {
    "id": "t9",
    "name": "Rương Kịch bản xã hội hậu lao động",
    "x": 1350,
    "y": 680,
    "region": "Rừng Sâu Đạo Đức",
    "questionId": "q9"
  },
  {
    "id": "t10",
    "name": "Rương Khái niệm Embeddedness (Tính gắn kết)",
    "x": 1680,
    "y": 820,
    "region": "Rừng Sâu Đạo Đức",
    "questionId": "q10"
  },
  {
    "id": "t11",
    "name": "Rương Khái niệm Thickness (Chiều sâu bản sắc)",
    "x": 2150,
    "y": 420,
    "region": "Đền Cổ Bản Ngã",
    "questionId": "q11"
  },
  {
    "id": "t12",
    "name": "Rương Phân biệt Embeddedness vs Thickness",
    "x": 2450,
    "y": 280,
    "region": "Đền Cổ Bản Ngã",
    "questionId": "q12"
  },
  {
    "id": "t13",
    "name": "Rương Tình huống giả định tài xế xe tải đường dài",
    "x": 2650,
    "y": 450,
    "region": "Đền Cổ Bản Ngã",
    "questionId": "q13"
  },
  {
    "id": "t14",
    "name": "Rương Khái niệm Meaning Whack",
    "x": 2100,
    "y": 1400,
    "region": "Đền Cổ Bản Ngã (Nam)",
    "questionId": "q14"
  },
  {
    "id": "t15",
    "name": "Rương Khái niệm Meaning Wipe",
    "x": 2480,
    "y": 1650,
    "region": "Đền Cổ Bản Ngã (Nam)",
    "questionId": "q15"
  },
  {
    "id": "t16",
    "name": "Rương Hiện tượng Displacement (Dịch chuyển việc làm)",
    "x": 2980,
    "y": 520,
    "region": "Tàn Tích Chân Lý",
    "questionId": "q16"
  },
  {
    "id": "t17",
    "name": "Rương Hiện tượng Destruction (Hủy diệt việc làm)",
    "x": 3350,
    "y": 380,
    "region": "Tàn Tích Chân Lý",
    "questionId": "q17"
  },
  {
    "id": "t18",
    "name": "Rương Hai phản biện chính về ý nghĩa sống",
    "x": 3200,
    "y": 750,
    "region": "Tàn Tích Chân Lý",
    "questionId": "q18"
  },
  {
    "id": "t19",
    "name": "Rương Nguồn ý nghĩa ngoài công việc",
    "x": 2950,
    "y": 1650,
    "region": "Tàn Tích Chân Lý (Nam)",
    "questionId": "q19"
  },
  {
    "id": "t20",
    "name": "Rương Vấn đề Accessibility Problem (Khả năng tiếp cận)",
    "x": 3380,
    "y": 1950,
    "region": "Tàn Tích Chân Lý (Nam)",
    "questionId": "q20"
  },
  {
    "id": "t21",
    "name": "Rương Thu nhập cơ bản phổ quát (UBI)",
    "x": 420,
    "y": 1350,
    "region": "Hang Động Tự Do",
    "questionId": "q21"
  },
  {
    "id": "t22",
    "name": "Rương Mối quan hệ UBI và ý nghĩa sống",
    "x": 780,
    "y": 1450,
    "region": "Hang Động Tự Do",
    "questionId": "q22"
  },
  {
    "id": "t23",
    "name": "Rương Đóng góp lý luận nổi bật của nghiên cứu",
    "x": 520,
    "y": 1850,
    "region": "Hang Động Tự Do",
    "questionId": "q23"
  },
  {
    "id": "t24",
    "name": "Rương Mở rộng trọng tâm thảo luận về AI",
    "x": 280,
    "y": 2200,
    "region": "Hang Động Tự Do",
    "questionId": "q24"
  },
  {
    "id": "t25",
    "name": "Rương Bài học hành động ở cấp độ Bản thân",
    "x": 750,
    "y": 2450,
    "region": "Hang Động Tự Do",
    "questionId": "q25"
  },
  {
    "id": "t26",
    "name": "Rương Khuyến nghị chính sách ở cấp độ Xã hội",
    "x": 1450,
    "y": 1350,
    "region": "Hồ Nước Ý Thức",
    "questionId": "q26"
  },
  {
    "id": "t27",
    "name": "Rương Bản chất dự báo của nghiên cứu Scripter",
    "x": 1720,
    "y": 1550,
    "region": "Hồ Nước Ý Thức",
    "questionId": "q27"
  },
  {
    "id": "t28",
    "name": "Rương Liên hệ Chương III Chủ nghĩa duy vật lịch sử",
    "x": 1320,
    "y": 1850,
    "region": "Hồ Nước Ý Thức",
    "questionId": "q28"
  },
  {
    "id": "t29",
    "name": "Rương Thuộc tính cốt lõi của Meaning Whack",
    "x": 1680,
    "y": 2150,
    "region": "Hồ Nước Ý Thức",
    "questionId": "q29"
  },
  {
    "id": "t30",
    "name": "Rương Thông điệp cốt lõi của bài học",
    "x": 1400,
    "y": 2480,
    "region": "Hồ Nước Ý Thức",
    "questionId": "q30"
  }
];

class Database {
  constructor() {
    this.data = {
      players: {},
      history: [],
      treasures: DEFAULT_TREASURES
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.players) this.data.players = parsed.players;
        if (parsed.history) this.data.history = parsed.history;
        if (parsed.treasures && parsed.treasures.length > 0) {
          this.data.treasures = parsed.treasures;
        }
      } else {
        this.save();
      }
    } catch (err) {
      console.error('Error loading database store, initializing defaults:', err.message);
      this.save();
    }
  }

  save() {
    try {
      const dir = path.dirname(STORE_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(STORE_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database store:', err.message);
    }
  }

  getPlayer(playerId) {
    return this.data.players[playerId] || null;
  }

  upsertPlayer(playerId, updateData) {
    if (!this.data.players[playerId]) {
      this.data.players[playerId] = {
        id: playerId,
        name: updateData.name || `Player_${playerId.slice(0, 4)}`,
        gender: updateData.gender || 'male',
        outfitColor: updateData.outfitColor || '#10B981',
        hatColor: updateData.hatColor || '#92400e',
        score: 0,
        questionsAnswered: 0,
        correct: 0,
        wrong: 0,
        treasuresFound: 0,
        completedTreasures: [],
        failedTreasures: [],
        treasureAttempts: {},
        x: 400,
        y: 400,
        region: 'Đồng Cỏ Tri Thức',
        onlineSince: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        lastCard: null,
        ...updateData
      };
    } else {
      this.data.players[playerId] = {
        ...this.data.players[playerId],
        ...updateData,
        lastActive: new Date().toISOString()
      };
    }
    this.save();
    return this.data.players[playerId];
  }

  getAllPlayers() {
    return Object.values(this.data.players);
  }

  getTreasures() {
    return this.data.treasures;
  }

  addEvent(eventType, playerId, playerName, detail, prevScore = null, newScore = null) {
    const entry = {
      id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour12: false }),
      isoTime: new Date().toISOString(),
      eventType,
      playerId,
      playerName,
      detail,
      prevScore,
      newScore
    };
    this.data.history.unshift(entry);
    if (this.data.history.length > 300) {
      this.data.history.pop();
    }
    this.save();
    return entry;
  }

  getHistory(limit = 50) {
    return this.data.history.slice(0, limit);
  }

  resetAllScores() {
    for (const id in this.data.players) {
      this.data.players[id].score = 0;
      this.data.players[id].questionsAnswered = 0;
      this.data.players[id].correct = 0;
      this.data.players[id].wrong = 0;
      this.data.players[id].treasuresFound = 0;
      this.data.players[id].completedTreasures = [];
      this.data.players[id].failedTreasures = [];
      this.data.players[id].treasureAttempts = {};
      this.data.players[id].lastCard = null;
    }
    this.addEvent('RESET_ALL', 'SYSTEM', 'ADMIN', 'Admin đã đặt lại toàn bộ điểm số, rương và lượt trả lời của người chơi.');
    this.save();
  }

  cleanupOfflineZeroScorePlayers(onlinePlayerIds = []) {
    const onlineSet = new Set(onlinePlayerIds);
    let removedCount = 0;
    for (const id in this.data.players) {
      const p = this.data.players[id];
      if (!onlineSet.has(id)) {
        const hasScore = Number(p.score) > 0;
        const hasTreasures = (p.treasuresFound && Number(p.treasuresFound) > 0) || (p.completedTreasures && p.completedTreasures.length > 0);
        const hasQuestions = Number(p.questionsAnswered) > 0;
        if (!hasScore && !hasTreasures && !hasQuestions) {
          delete this.data.players[id];
          removedCount++;
        }
      }
    }
    if (removedCount > 0) {
      this.save();
    }
    return removedCount;
  }

  resetTreasuresToDefault() {
    this.data.treasures = JSON.parse(JSON.stringify(DEFAULT_TREASURES));
    this.save();
    return this.data.treasures;
  }

  wipeAllData() {
    this.data.players = {};
    this.data.history = [];
    this.data.treasures = JSON.parse(JSON.stringify(DEFAULT_TREASURES));
    this.save();
  }
}

module.exports = new Database();
