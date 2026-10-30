import json

questions = [
  # PHẦN 1: TỔNG QUAN VỀ ĐỀ TÀI VÀ NGHIÊN CỨU
  {
    "id": "q1",
    "theme": "Phần 1: Tổng quan đề tài & nghiên cứu",
    "title": "Tác giả bài báo khoa học",
    "scenario": "Bài báo khoa học nghiên cứu về tác động của AI đến công việc có ý nghĩa do tác giả nào thực hiện?",
    "options": [
      "Karl Marx",
      "Lucas Scripter",
      "V.I. Lenin",
      "Adam Smith"
    ],
    "correctIndex": 1,
    "keywords": ["Lucas Scripter", "Scripter", "B"],
    "explanation": "Theo nghiên cứu của Lucas Scripter công bố năm 2026 trên tạp chí AI & Society."
  },
  {
    "id": "q2",
    "theme": "Phần 1: Tổng quan đề tài & nghiên cứu",
    "title": "Câu hỏi trung tâm của bài báo",
    "scenario": "Câu hỏi trung tâm mà bài báo nghiên cứu của Lucas Scripter đặt ra là gì?",
    "options": [
      "AI sẽ giúp GDP toàn cầu tăng trưởng bao nhiêu phần trăm?",
      "Làm thế nào để lập trình một hệ thống AI không mắc lỗi?",
      "AI có đe dọa công việc có ý nghĩa và cuộc sống có ý nghĩa không trong thời kỳ chuyển tiếp?",
      "Bao giờ AI sẽ thay thế hoàn toàn con người trong mọi lĩnh vực?"
    ],
    "correctIndex": 2,
    "keywords": ["đe dọa công việc có ý nghĩa", "thời kỳ chuyển tiếp", "C"],
    "explanation": "Vấn đề trung tâm bài nghiên cứu xem xét là mối đe dọa của AI đối với công việc và cuộc sống có ý nghĩa trong giai đoạn chuyển tiếp."
  },
  {
    "id": "q3",
    "theme": "Phần 1: Tổng quan đề tài & nghiên cứu",
    "title": "Bất bình đẳng xã hội do AI",
    "scenario": "Khía cạnh \"Bất bình đẳng xã hội\" trong bài học được mở rộng phân tích theo hướng nào?",
    "options": [
      "Số liệu đo lường thực nghiệm trực tiếp về chênh lệch thu nhập",
      "Sự bất bình đẳng về cơ hội chuyển đổi và khả năng tiếp cận việc làm mới giữa các nhóm lao động",
      "Dự báo tỷ lệ thất nghiệp cố định trên toàn thế giới",
      "Sự phân hóa giàu nghèo thuần túy do máy móc cơ khí gây ra"
    ],
    "correctIndex": 1,
    "keywords": ["cơ hội chuyển đổi", "khả năng tiếp cận việc làm mới", "B"],
    "explanation": "Khía cạnh bất bình đẳng xã hội được nhấn mạnh ở sự khác biệt về cơ hội chuyển đổi và điều kiện thích ứng giữa các nhóm lao động."
  },
  {
    "id": "q4",
    "theme": "Phần 1: Tổng quan đề tài & nghiên cứu",
    "title": "Phương pháp nghiên cứu chủ đạo",
    "scenario": "Phương pháp nghiên cứu chủ đạo được tác giả Lucas Scripter sử dụng là gì?",
    "options": [
      "Khảo sát thực nghiệm và phỏng vấn hàng ngàn người lao động",
      "Phân tích thống kê toán học và xây dựng mô hình dự báo việc làm",
      "Phân tích lý thuyết và triết học, đối thoại với các công trình đã có",
      "Thí nghiệm xã hội học về chính sách trợ cấp thất nghiệp"
    ],
    "correctIndex": 2,
    "keywords": ["phân tích lý thuyết và triết học", "đối thoại với các công trình đã có", "C"],
    "explanation": "Tác giả sử dụng phương pháp phân tích lý thuyết và triết học, đối thoại với các công trình triết học đã có, không tiến hành khảo sát thực nghiệm."
  },

  # PHẦN 2: BỐI CẢNH VÀ KHUNG LÝ THUYẾT MLN111
  {
    "id": "q5",
    "theme": "Phần 2: Bối cảnh & Khung lý thuyết MLN111",
    "title": "Kết nối lý luận Chương III Triết học Mác – Lênin",
    "scenario": "Khi vận dụng lý luận Chương III (Triết học Mác – Lênin) vào phân tích tác động của AI, hai nội dung cốt lõi nào được kết nối?",
    "options": [
      "Học thuyết hình thái kinh tế – xã hội và Triết học về con người",
      "Cơ sở hạ tầng và Kiến trúc thượng tầng",
      "Tồn tại xã hội và Ý thức xã hội",
      "Đấu tranh giai cấp và Nhà nước"
    ],
    "correctIndex": 0,
    "keywords": ["hình thái kinh tế – xã hội", "Triết học về con người", "A"],
    "explanation": "Nội dung bài học vận dụng hai khối kiến thức cốt lõi: Học thuyết hình thái kinh tế – xã hội và Triết học về con người."
  },
  {
    "id": "q6",
    "theme": "Phần 2: Bối cảnh & Khung lý thuyết MLN111",
    "title": "AI dưới góc nhìn Lực lượng sản xuất",
    "scenario": "Dưới góc nhìn của Học thuyết hình thái kinh tế – xã hội, Trí tuệ nhân tạo (AI) được xem xét là yếu tố nào?",
    "options": [
      "Một Quan hệ sản xuất mới",
      "Công nghệ mới góp phần phát triển Lực lượng sản xuất",
      "Tác nhân thuộc về Kiến trúc thượng tầng",
      "Một hình thái ý thức xã hội độc lập"
    ],
    "correctIndex": 1,
    "keywords": ["Lực lượng sản xuất", "phát triển Lực lượng sản xuất", "B"],
    "explanation": "Trong Triết học Mác, AI được xem là công nghệ mới làm phát triển lực lượng sản xuất, thay đổi công cụ và phương thức tổ chức lao động."
  },
  {
    "id": "q7",
    "theme": "Phần 2: Bối cảnh & Khung lý thuyết MLN111",
    "title": "Triết học về con người & Bản sắc qua lao động",
    "scenario": "Khía cạnh \"Triết học về con người\" trong Chủ nghĩa duy vật lịch sử giúp giải thích điều gì về tác động của việc mất việc làm do AI?",
    "options": [
      "Mất việc làm chỉ thuần túy là tổn thất về mặt kinh tế/thu nhập",
      "Con người chỉ lao động vì bản năng sinh tồn sinh học",
      "Con người tồn tại trong tổng hòa các quan hệ xã hội, nên việc mất việc làm còn ảnh hưởng đến bản sắc, vai trò và ý nghĩa sống",
      "Công việc không có bất kỳ vai trò nào trong việc hình thành ý nghĩa sống"
    ],
    "correctIndex": 2,
    "keywords": ["tổng hòa các quan hệ xã hội", "bản sắc, vai trò và ý nghĩa sống", "C"],
    "explanation": "Con người định hình bản sắc qua lao động và các mối quan hệ xã hội; do đó mất việc làm gây tổn thất vượt ra ngoài yếu tố thu nhập thuần túy."
  },
  {
    "id": "q8",
    "theme": "Phần 2: Bối cảnh & Khung lý thuyết MLN111",
    "title": "Thời gian tác động trọng tâm",
    "scenario": "Khi phân tích tác động của AI, tác giả Scripter lựa chọn tập trung vào khoảng thời gian nào?",
    "options": [
      "Ngắn hạn (thay đổi các nhiệm vụ tức thời)",
      "Trung hạn (giai đoạn chuyển tiếp)",
      "Dài hạn (kịch bản xã hội hậu lao động)",
      "Cả 3 giai đoạn như nhau"
    ],
    "correctIndex": 1,
    "keywords": ["Trung hạn", "giai đoạn chuyển tiếp", "B"],
    "explanation": "Trọng tâm phân tích của Scripter nằm ở giai đoạn chuyển tiếp trung hạn, nơi con người phải tái thích ứng với sự thay đổi của công nghệ."
  },
  {
    "id": "q9",
    "theme": "Phần 2: Bối cảnh & Khung lý thuyết MLN111",
    "title": "Kịch bản xã hội hậu lao động",
    "scenario": "Kịch bản \"Xã hội hậu lao động\" (post-work society) được xếp vào khoảng thời gian nào trong các tranh luận về AI?",
    "options": [
      "Ngắn hạn",
      "Giữa ngắn hạn và trung hạn",
      "Dài hạn (giả định mang tính tranh luận)",
      "Thực tại hiện tại"
    ],
    "correctIndex": 2,
    "keywords": ["Dài hạn", "giả định mang tính tranh luận", "C"],
    "explanation": "Xã hội hậu lao động là kịch bản giả định trong dài hạn, chưa phải là thực tế trước mắt trong giai đoạn chuyển tiếp trung hạn."
  },

  # PHẦN 3: PHƯƠNG PHÁP VÀ LẬP LUẬN CỐT LÕI
  {
    "id": "q10",
    "theme": "Phần 3: Phương pháp & Lập luận cốt lõi",
    "title": "Khái niệm Embeddedness (Tính gắn kết)",
    "scenario": "Khái niệm \"Embeddedness\" (Tính gắn kết) trong bài học dùng để chỉ điều gì?",
    "options": [
      "Bề dày kinh nghiệm chuyên môn của người lao động",
      "Sự gắn kết của nguồn ý nghĩa với bối cảnh và môi trường xã hội xung quanh",
      "Mức độ phức tạp của thuật toán AI",
      "Số lượng công việc hiện có trên thị trường"
    ],
    "correctIndex": 1,
    "keywords": ["Embeddedness", "môi trường xã hội", "B"],
    "explanation": "Embeddedness thể hiện ràng buộc và sự gắn kết của nguồn ý nghĩa công việc với bối cảnh và môi trường xã hội xung quanh."
  },
  {
    "id": "q11",
    "theme": "Phần 3: Phương pháp & Lập luận cốt lõi",
    "title": "Khái niệm Thickness (Chiều sâu bản sắc)",
    "scenario": "Khái niệm \"Thickness\" (Chiều sâu) nhấn mạnh yếu tố nào ở con người?",
    "options": [
      "Mức thu nhập hàng tháng",
      "Số lượng bằng cấp và chứng chỉ cá nhân",
      "Bản sắc, các cam kết và dự án sống được hình thành qua lịch sử cá nhân",
      "Khả năng thích ứng tức thì với công nghệ mới"
    ],
    "correctIndex": 2,
    "keywords": ["Thickness", "lịch sử cá nhân", "dự án sống", "C"],
    "explanation": "Thickness đại diện cho chiều sâu bản sắc, các cam kết và dự án sống (ground projects) được tích lũy và hình thành qua lịch sử cá nhân."
  },
  {
    "id": "q12",
    "theme": "Phần 3: Phương pháp & Lập luận cốt lõi",
    "title": "Phân biệt Embeddedness vs Thickness",
    "scenario": "Điểm khác biệt cơ bản giữa \"Embeddedness\" và \"Thickness\" là gì?",
    "options": [
      "Embeddedness thuộc về quá khứ, Thickness thuộc về tương lai",
      "Embeddedness đại diện cho ràng buộc từ xã hội, còn Thickness là sự gắn bó hình thành từ bản thân cá nhân",
      "Embeddedness chỉ áp dụng cho quản lý, Thickness áp dụng cho công nhân",
      "Hai khái niệm hoàn toàn trùng lặp nghĩa"
    ],
    "correctIndex": 1,
    "keywords": ["ràng buộc từ xã hội", "bản thân cá nhân", "B"],
    "explanation": "Embeddedness là tác động và ràng buộc từ cấu trúc xã hội bên ngoài, còn Thickness là sự gắn bó và chiều sâu tích lũy từ lịch sử cá nhân bên trong."
  },
  {
    "id": "q13",
    "theme": "Phần 3: Phương pháp & Lập luận cốt lõi",
    "title": "Tình huống giả định tài xế xe tải đường dài",
    "scenario": "Trường hợp giả định về tài xế xe tải đường dài bị thay thế bởi xe tự lái dùng để minh họa cho điều gì?",
    "options": [
      "AI giúp người lao động tăng thu nhập nhanh chóng",
      "Nguy cơ mất đi cả thu nhập lẫn lối sống, bản sắc khi nghề nghiệp bị thay thế",
      "Người lao động luôn thích ứng dễ dàng với công nghệ mới",
      "Dữ liệu thực nghiệm trên diện rộng"
    ],
    "correctIndex": 1,
    "keywords": ["mất đi cả thu nhập lẫn lối sống", "bản sắc", "B"],
    "explanation": "Ví dụ minh họa việc mất đi một công việc lâu năm có thể làm tổn hại cả bản sắc và lối sống đã gắn bó sâu sắc qua thời gian."
  },
  {
    "id": "q14",
    "theme": "Phần 3: Phương pháp & Lập luận cốt lõi",
    "title": "Khái niệm Meaning Whack",
    "scenario": "Khái niệm \"Meaning Whack\" được định nghĩa là gì?",
    "options": [
      "Sự mất đi đột ngột của một nguồn ý nghĩa",
      "Sự mất đi trên diện rộng cả một loại nguồn ý nghĩa hay kỹ năng",
      "Sự xuất hiện của các loại hình công việc mới",
      "Quá trình nhận trợ cấp xã hội"
    ],
    "correctIndex": 0,
    "keywords": ["Meaning Whack", "đột ngột", "A"],
    "explanation": "Meaning Whack nhấn mạnh vào tính đột ngột của sự mất mát một nguồn tạo ý nghĩa trong đời sống."
  },
  {
    "id": "q15",
    "theme": "Phần 3: Phương pháp & Lập luận cốt lõi",
    "title": "Khái niệm Meaning Wipe",
    "scenario": "Khái niệm \"Meaning Wipe\" có điểm gì khác biệt so với \"Meaning Whack\"?",
    "options": [
      "Diễn ra nhanh hơn",
      "Mất đi trên diện rộng cả một dạng hoạt động, kỹ năng hoặc vai trò tạo ý nghĩa",
      "Chỉ ảnh hưởng đến người lao động trẻ tuổi",
      "Là sự phục hồi lại ý nghĩa công việc"
    ],
    "correctIndex": 1,
    "keywords": ["Meaning Wipe", "diện rộng", "toàn bộ một dạng hoạt động", "B"],
    "explanation": "Meaning Wipe là sự mất mát trên diện rộng đối với toàn bộ một dạng hoạt động, kỹ năng hoặc vai trò xã hội tạo ý nghĩa."
  },
  {
    "id": "q16",
    "theme": "Phần 3: Phương pháp & Lập luận cốt lõi",
    "title": "Hiện tượng Displacement (Dịch chuyển việc làm)",
    "scenario": "Hiện tượng \"Displacement\" (Sự dịch chuyển việc làm) xảy ra khi nào?",
    "options": [
      "Công việc cũ mất đi, công việc mới xuất hiện nhưng người bị thay thế khó hoặc không thể tiếp cận",
      "Công việc cũ mất đi hoàn toàn và không có công việc mới nào xuất hiện",
      "Công việc cũ giữ nguyên nhưng giảm mức lương",
      "Người lao động tự nguyện nghỉ việc"
    ],
    "correctIndex": 0,
    "keywords": ["Displacement", "công việc mới xuất hiện nhưng khó tiếp cận", "A"],
    "explanation": "Displacement mô tả tình trạng xã hội có tạo ra việc làm mới nhưng người lao động bị mất việc cũ khó hoặc không thể tiếp cận được."
  },
  {
    "id": "q17",
    "theme": "Phần 3: Phương pháp & Lập luận cốt lõi",
    "title": "Hiện tượng Destruction (Hủy diệt việc làm)",
    "scenario": "Khái niệm \"Destruction\" trong bài học mô tả tình trạng nào?",
    "options": [
      "Sự phá hủy công cụ lao động cơ khí",
      "Mất mát ròng các loại việc làm và vai trò có ý nghĩa mà không được thay thế trong trật tự xã hội",
      "Sự gia tăng đột biến về số lượng việc làm",
      "Quá trình công nghiệp hóa truyền thống"
    ],
    "correctIndex": 1,
    "keywords": ["Destruction", "mất mát ròng", "không được thay thế", "B"],
    "explanation": "Destruction ám chỉ sự sụt giảm ròng các công việc và vai trò mang lại ý nghĩa mà không có sự thay thế bù đắp trong trật tự xã hội."
  },

  # PHẦN 4: PHẢN BIỆN VÀ HỒI ĐÁP LÝ LUẬN
  {
    "id": "q18",
    "theme": "Phần 4: Phản biện & Hồi đáp lý luận",
    "title": "Hai phản biện chính về ý nghĩa sống",
    "scenario": "Hai phản biện chính đối với lo ngại về rủi ro mất ý nghĩa sống do thất nghiệp công nghệ là gì?",
    "options": [
      "Công việc không quan trọng & AI không thể thay thế con người",
      "Nguồn ý nghĩa khác (Other Sources) & Nguồn ý nghĩa tốt hơn (Better Sources)",
      "UBI sẽ giải quyết tất cả & Bất bình đẳng sẽ tự biến mất",
      "Con người không cần làm việc & AI sẽ làm hết mọi việc"
    ],
    "correctIndex": 1,
    "keywords": ["Other Sources", "Better Sources", "B"],
    "explanation": "Hai phản biện đặt ra: con người có thể tìm ý nghĩa từ các nguồn khác ngoài công việc, hoặc các nguồn ngoài công việc thậm chí còn tốt hơn công việc."
  },
  {
    "id": "q19",
    "theme": "Phần 4: Phản biện & Hồi đáp lý luận",
    "title": "Nguồn ý nghĩa ngoài công việc",
    "scenario": "Tác giả Scripter nhìn nhận thế nào về các nguồn ý nghĩa ngoài công việc (như gia đình, sở thích, cộng đồng)?",
    "options": [
      "Phủ nhận hoàn toàn giá trị của chúng",
      "Thừa nhận giá trị của chúng nhưng đặt câu hỏi về khả năng tiếp cận thực tế của từng cá nhân",
      "Cho rằng gia đình không đem lại ý nghĩa sống",
      "Khẳng định chỉ có công việc trả lương mới đem lại ý nghĩa"
    ],
    "correctIndex": 1,
    "keywords": ["thừa nhận giá trị", "khả năng tiếp cận thực tế", "B"],
    "explanation": "Tác giả không phủ nhận giá trị của các nguồn ý nghĩa này nhưng nhấn mạnh rào cản tiếp cận thực tế của từng cá nhân cụ thể."
  },
  {
    "id": "q20",
    "theme": "Phần 4: Phản biện & Hồi đáp lý luận",
    "title": "Vấn đề Accessibility Problem (Khả năng tiếp cận)",
    "scenario": "Vấn đề \"Accessibility Problem\" (Khả năng tiếp cận) mang ý nghĩa cốt lõi gì?",
    "options": [
      "Chi phí mua sắm thiết bị công nghệ quá cao",
      "Nguồn ý nghĩa tồn tại về mặt khả năng không đồng nghĩa với việc một cá nhân cụ thể có thể tiếp cận và sống được ngay trong thực tế",
      "Sự thiếu hụt hạ tầng mạng internet",
      "Mọi người đều có thể chuyển đổi sở thích cá nhân ngay lập tức"
    ],
    "correctIndex": 1,
    "keywords": ["Accessibility Problem", "tiếp cận và sống được ngay trong thực tế", "B"],
    "explanation": "Accessibility Problem giải thích rằng một nguồn ý nghĩa có tồn tại trên lý thuyết không đồng nghĩa với việc ai cũng có thể tiếp cận được trong thực tế."
  },
  {
    "id": "q21",
    "theme": "Phần 4: Phản biện & Hồi đáp lý luận",
    "title": "Thu nhập cơ bản phổ quát (UBI)",
    "scenario": "Thu nhập cơ bản phổ quát (UBI) được thảo luận như một giải pháp hỗ trợ điều gì?",
    "options": [
      "Giảm bớt sức ép kinh tế cho người lao động",
      "Khôi phục hoàn toàn bản sắc và ý nghĩa nghề nghiệp đã mất",
      "Thay thế nhu cầu giao tiếp xã hội của con người",
      "Đảm bảo tạo ra việc làm mới ngay lập tức"
    ],
    "correctIndex": 0,
    "keywords": ["UBI", "sức ép kinh tế", "an sinh tài chính", "A"],
    "explanation": "UBI giải quyết khía cạnh an sinh tài chính nhưng không tự động thay thế vai trò xã hội và bản sắc sinh ra từ công việc."
  },
  {
    "id": "q22",
    "theme": "Phần 4: Phản biện & Hồi đáp lý luận",
    "title": "Mối quan hệ UBI và ý nghĩa sống",
    "scenario": "Mối quan hệ giữa chính sách UBI và việc khôi phục ý nghĩa sống được xác định như thế nào?",
    "options": [
      "UBI là giải pháp hoàn hảo và duy nhất",
      "UBI không cần thiết",
      "UBI có thể cần thiết trong giai đoạn chuyển tiếp, nhưng không tự động bù đắp mất mát về ý nghĩa sống",
      "UBI triệt tiêu động lực làm việc của con người"
    ],
    "correctIndex": 2,
    "keywords": ["UBI", "không tự động bù đắp", "ý nghĩa sống", "C"],
    "explanation": "UBI có vai trò rất quan trọng về mặt kinh tế nhưng không đủ để giải quyết toàn diện khủng hoảng ý nghĩa sống khi mất việc làm."
  },

  # PHẦN 5: HÀM Ý VÀ BÀI HỌC THỰC TIỄN
  {
    "id": "q23",
    "theme": "Phần 5: Hàm ý & Bài học thực tiễn",
    "title": "Đóng góp lý luận nổi bật của nghiên cứu",
    "scenario": "Đóng góp lý luận nổi bật của nghiên cứu là gì?",
    "options": [
      "Đưa ra con số chính xác về tỷ lệ thất nghiệp do AI",
      "Chuyển sự chú ý sang giai đoạn chuyển tiếp trung hạn và làm rõ các dạng tổn thất ý nghĩa sống",
      "Phát minh ra mô hình quản lý lao động mới",
      "Khẳng định AI sẽ thay thế hoàn toàn con người"
    ],
    "correctIndex": 1,
    "keywords": ["chuyển sự chú ý", "giai đoạn chuyển tiếp trung hạn", "tổn thất ý nghĩa sống", "B"],
    "explanation": "Đóng góp quan trọng nằm ở việc chuyển trọng tâm phân tích sang giai đoạn chuyển tiếp trung hạn và làm rõ các dạng tổn thất ý nghĩa sống."
  },
  {
    "id": "q24",
    "theme": "Phần 5: Hàm ý & Bài học thực tiễn",
    "title": "Mở rộng trọng tâm thảo luận về AI",
    "scenario": "Từ bài học, trọng tâm thảo luận về AI và việc làm được mở rộng theo hướng nào?",
    "options": [
      "Tìm hiểu thời điểm AI ngừng phát triển",
      "Đặt câu hỏi: \"Ai có thể tiếp cận những việc làm và nguồn ý nghĩa mới đó?\"",
      "Tập trung duy nhất vào kỹ thuật lập trình AI",
      "Đo lường số lượng doanh nghiệp phá sản"
    ],
    "correctIndex": 1,
    "keywords": ["Ai có thể tiếp cận", "việc làm và nguồn ý nghĩa mới", "B"],
    "explanation": "Sự chú ý chuyển từ số lượng công việc thuần túy sang khả năng tiếp cận công bằng giữa các nhóm xã hội khác nhau."
  },
  {
    "id": "q25",
    "theme": "Phần 5: Hàm ý & Bài học thực tiễn",
    "title": "Bài học hành động ở cấp độ Bản thân",
    "scenario": "Từ bài học về tác động của AI, bài học hành động đối với cấp độ \"Bản thân\" người lao động là gì?",
    "options": [
      "Ngừng học tập vì máy móc sẽ làm thay",
      "Chủ động học kỹ năng mới, duy trì năng lực thích nghi và xây dựng đa dạng các nguồn tạo ý nghĩa ngoài công việc",
      "Chỉ trung thành với một kỹ năng duy nhất",
      "Thụ động chờ đợi chính sách trợ cấp"
    ],
    "correctIndex": 1,
    "keywords": ["chủ động học kỹ năng mới", "duy trì năng lực thích nghi", "B"],
    "explanation": "Ở cấp độ cá nhân, người lao động cần chủ động nâng cao năng lực thích ứng và đa dạng hóa các nguồn tạo ý nghĩa sống."
  },
  {
    "id": "q26",
    "theme": "Phần 5: Hàm ý & Bài học thực tiễn",
    "title": "Khuyến nghị chính sách ở cấp độ Xã hội",
    "scenario": "Từ bài học thực tiễn, khuyến nghị chính sách ở cấp độ \"Xã hội\" để giải quyết thất nghiệp công nghệ là gì?",
    "options": [
      "Cấm ứng dụng AI trong sản xuất",
      "Xây dựng chính sách chuyển đổi toàn diện gồm hỗ trợ thu nhập, đào tạo lại, tạo cơ hội tiếp cận và sự công nhận xã hội",
      "Để thị trường tự điều chỉnh hoàn toàn",
      "Buộc toàn bộ lực lượng lao động chuyển sang làm nghệ thuật"
    ],
    "correctIndex": 1,
    "keywords": ["chính sách chuyển đổi toàn diện", "đào tạo lại", "công nhận xã hội", "B"],
    "explanation": "Chính sách xã hội cần hỗ trợ toàn diện về cả kinh tế, đào tạo kỹ năng lẫn cơ hội tái hòa nhập và được công nhận vai trò xã hội."
  },
  {
    "id": "q27",
    "theme": "Phần 5: Hàm ý & Bài học thực tiễn",
    "title": "Bản chất dự báo của nghiên cứu Scripter",
    "scenario": "Khi đánh giá về tác động của AI đến thị trường lao động, nghiên cứu của Scripter có chứng minh AI chắc chắn gây thất nghiệp hàng loạt không?",
    "options": [
      "Có, khẳng định chắc chắn 100%",
      "Không, bài nghiên cứu không đưa ra dự báo thực nghiệm mà tập trung phân tích các nguy cơ lý thuyết và triết học",
      "Có, dựa trên khảo sát thực tế",
      "Khẳng định AI hoàn toàn không gây ảnh hưởng đến việc làm"
    ],
    "correctIndex": 1,
    "keywords": ["không đưa ra dự báo thực nghiệm", "nguy cơ lý thuyết và triết học", "B"],
    "explanation": "Nghiên cứu tập trung phân tích kịch bản nguy cơ triết học chứ không đưa ra dự báo số liệu thực nghiệm chắc chắn."
  },
  {
    "id": "q28",
    "theme": "Phần 5: Hàm ý & Bài học thực tiễn",
    "title": "Liên hệ Chương III Chủ nghĩa duy vật lịch sử",
    "scenario": "Vì sao việc phân tích tác động xã hội của AI lại phù hợp khi liên hệ với Chương III (Chủ nghĩa duy vật lịch sử) trong môn Triết học Mác – Lênin?",
    "options": [
      "Vì Chương III cung cấp khung lý luận về lực lượng sản xuất, quan hệ sản xuất và bản chất xã hội của con người để giải thích sự biến đổi lao động",
      "Vì Chương III chỉ nghiên cứu về máy tính",
      "Vì đây là quy định bắt buộc không dựa trên lý luận",
      "Vì AI là một hình thái kinh tế - xã hội độc lập"
    ],
    "correctIndex": 0,
    "keywords": ["Chương III", "lực lượng sản xuất", "quan hệ sản xuất", "bản chất xã hội của con người", "A"],
    "explanation": "Chủ nghĩa duy vật lịch sử ở Chương III cung cấp cơ sở lý luận về quy luật phát triển sản xuất và bản chất xã hội của con người để giải thích sự biến đổi lao động."
  },
  {
    "id": "q29",
    "theme": "Phần 5: Hàm ý & Bài học thực tiễn",
    "title": "Thuộc tính cốt lõi của Meaning Whack",
    "scenario": "Khái niệm \"Meaning Whack\" nhấn mạnh vào thuộc tính nào của sự tổn thất ý nghĩa?",
    "options": [
      "Quy mô diện rộng",
      "Tính đột ngột",
      "Khả năng tự phục hồi",
      "Tác động tài chính thuần túy"
    ],
    "correctIndex": 1,
    "keywords": ["Meaning Whack", "tính đột ngột", "B"],
    "explanation": "Meaning Whack thể hiện tác động mang tính đột ngột của việc mất mát một nguồn ý nghĩa sống."
  },
  {
    "id": "q30",
    "theme": "Phần 5: Hàm ý & Bài học thực tiễn",
    "title": "Thông điệp cốt lõi của bài học",
    "scenario": "Thông điệp cốt lõi rút ra từ bài học về AI, thất nghiệp công nghệ và ý nghĩa sống là gì?",
    "options": [
      "AI là công nghệ hoàn toàn tiêu cực",
      "Đừng chỉ hỏi công nghệ thay thế được bao nhiêu việc làm, mà hãy hỏi con người được hỗ trợ như thế nào trong quá trình chuyển đổi",
      "Lao động không còn giá trị trong thời đại số",
      "Mọi tổn thất về công việc đều giải quyết được bằng tài chính"
    ],
    "correctIndex": 1,
    "keywords": ["con người được hỗ trợ như thế nào", "quá trình chuyển đổi", "B"],
    "explanation": "Thông điệp trung tâm nhấn mạnh vào việc hỗ trợ con người thích ứng và chuyển đổi bình đẳng trước sự phát triển của công nghệ."
  }
]

with open(r'D:\1\kho-bau-triet-hoc\data\questions.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print('Updated questions.json successfully with exactly 30 questions!')
