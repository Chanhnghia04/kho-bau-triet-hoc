const { io } = require('socket.io-client');

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('✔ Kết nối socket thành công');
  socket.emit('join_game', {
    playerId: 'test_limit_player_' + Date.now(),
    playerName: 'Aristotle',
    gender: 'male',
    outfitColor: '#10B981',
    hatColor: '#8B5A2B'
  });
});

socket.on('init_game', (data) => {
  console.log('✔ Đã vào game. Bắt đầu test rương t1 (tại vị trí xuất phát)...');
  socket.emit('open_treasure', { treasureId: 't1' });
});

let wrongCount = 0;

socket.on('treasure_question', (qData) => {
  console.log(`📜 Nhận câu hỏi rương ${qData.treasureId}: "${qData.title}". Lần thử đã dùng: ${qData.attempts}/2`);
  // Cố tình trả lời sai (Index 3 là sai cho đa số câu hỏi)
  socket.emit('submit_answer', {
    treasureId: qData.treasureId,
    questionId: qData.questionId,
    selectedIndex: 3
  });
});

socket.on('answer_result', (res) => {
  wrongCount++;
  console.log(`📌 Kết quả lần ${wrongCount}: success=${res.success}, locked=${res.locked}, attempts=${res.attempts}/2`);
  console.log(`   Thông báo: ${res.message}`);

  if (wrongCount === 1) {
    if (!res.locked && res.attempts === 1) {
      console.log('✔ PASS test lần 1: Rương chưa khóa, còn 1 cơ hội.');
      // Thử lại lần 2 (vẫn cố tình trả lời sai)
      setTimeout(() => {
        socket.emit('submit_answer', {
          treasureId: res.treasureId,
          questionId: 'q1',
          selectedIndex: 2
        });
      }, 500);
    } else {
      console.error('❌ FAIL test lần 1: Rương bị sai logic');
      process.exit(1);
    }
  } else if (wrongCount === 2) {
    if (res.locked && res.attempts === 2) {
      console.log('✔ PASS test lần 2: Rương đã bị KHÓA sau 2 lần trả lời sai!');
      // Thử mở lại rương này xem server có chặn không
      setTimeout(() => {
        console.log('🔍 Thử mở lại rương t1 đã bị khóa...');
        socket.emit('open_treasure', { treasureId: 't1' });
      }, 500);
    } else {
      console.error('❌ FAIL test lần 2: Rương không bị khóa');
      process.exit(1);
    }
  }
});

socket.on('error_message', (err) => {
  console.log(`🔒 Server phản hồi chặn mở rương: "${err.message}"`);
  console.log('🎉 TẤT CẢ CÁC BƯỚC TEST GIỚI HẠN 2 LẦN ĐỀU ĐẠT CHUẨN 100%!');
  socket.disconnect();
  process.exit(0);
});
