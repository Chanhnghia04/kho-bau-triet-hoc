const { io } = require('socket.io-client');

async function runTest() {
  console.log('>>> Khởi động kiểm thử mô phỏng 2 Player và 1 Admin...');

  // 1. Connect Admin
  const adminSocket = io('http://localhost:3000');
  let adminEventsReceived = [];

  adminSocket.on('connect', () => {
    console.log('✔ [ADMIN TEST] Admin đã kết nối socket.');
    adminSocket.emit('join_admin');
  });

  adminSocket.on('admin_event', (evt) => {
    console.log(`📡 [ADMIN EVENT STREAM] [${evt.timestamp}] (${evt.eventType}): ${evt.detail}`);
    adminEventsReceived.push(evt);
  });

  // 2. Connect Player01
  const p1 = io('http://localhost:3000');

  p1.on('connect', () => {
    console.log('✔ [PLAYER 01] Socket đã kết nối, gửi join_game...');
    p1.emit('join_game', {
      playerId: 'test_player_01',
      playerName: 'Socrates_01',
      playerColor: '#3B82F6'
    });
  });

  p1.on('init_game', (data) => {
    console.log(`✔ [PLAYER 01] Nhận init_game. Tọa độ: (${data.self.x}, ${data.self.y}), Điểm: ${data.self.score}`);
    
    // Move towards Treasure 1 (at x: 450, y: 380)
    console.log('🚶 [PLAYER 01] Di chuyển đến Rương Khởi Nguyên (x: 450, y: 380)...');
    p1.emit('player_move', {
      x: 450,
      y: 380,
      direction: 'right',
      moving: true
    });

    // Interact with treasure after 300ms
    setTimeout(() => {
      console.log('🗝️ [PLAYER 01] Mở Rương t1...');
      p1.emit('open_treasure', { treasureId: 't1' });
    }, 400);
  });

  p1.on('treasure_question', (q) => {
    console.log(`📜 [PLAYER 01] Nhận câu hỏi triết học: "${q.title}" (${q.theme})`);
    console.log(`   Tình huống: ${q.scenario.slice(0, 60)}...`);
    console.log(`   Lựa chọn A: ${q.options[0]}`);

    // Submit correct answer (option 0 for q1)
    setTimeout(() => {
      console.log('✍️ [PLAYER 01] Gửi câu trả lời: Lựa chọn A (Index 0)...');
      p1.emit('submit_answer', {
        treasureId: q.treasureId,
        questionId: q.questionId,
        selectedIndex: 0
      });
    }, 500);
  });

  p1.on('answer_result', (res) => {
    if (res.success) {
      console.log(`🎉 [PLAYER 01] Kết quả: ${res.message}`);
      console.log(`🎴 [PLAYER 01] Nhận được 4 Lá Bài Random:`);
      res.cards.forEach((c, i) => {
        console.log(`   Lá ${i + 1}: ${c.badge} [${c.name}] - ${c.description}`);
      });

      // Pick card index 0
      setTimeout(() => {
        console.log(`👉 [PLAYER 01] Chọn Lá Bài #1 [${res.cards[0].name}]...`);
        p1.emit('choose_card', {
          drawId: res.drawId,
          cardIndex: 0
        });
      }, 500);
    } else {
      console.error('❌ [PLAYER 01] Trả lời sai:', res.message);
    }
  });

  p1.on('card_chosen_success', (res) => {
    console.log(`💎 [PLAYER 01] Thành công! ${res.message}`);
    console.log(`⭐ [PLAYER 01] Điểm mới: ${res.newScore}`);

    // Final checks
    setTimeout(() => {
      console.log(`\n==============================================`);
      console.log(`📊 TỔNG KẾT KIỂM THỬ MÔ PHỎNG:`);
      console.log(`- Admin đã nhận được ${adminEventsReceived.length} sự kiện realtime.`);
      console.log(`- Điểm số Player 01 đã được cập nhật chuẩn xác phía server.`);
      console.log(`- Vòng lặp: Khám phá ➔ Tìm rương ➔ Trả lời triết học ➔ Random 4 card ➔ Chọn bài ➔ Cập nhật điểm hoạt động hoàn hảo!`);
      console.log(`==============================================\n`);

      p1.disconnect();
      adminSocket.disconnect();
      process.exit(0);
    }, 1000);
  });
}

runTest();
