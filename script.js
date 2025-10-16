// 🗂️ Khởi tạo các phần tử DOM
const form = document.getElementById('goalForm');
const input = document.getElementById('goalInput');
const list = document.getElementById('goalList');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const quoteEl = document.getElementById('quote');

// 📦 Lấy dữ liệu cũ từ localStorage
let goals = JSON.parse(localStorage.getItem('goals')) || [];

// 💬 Danh sách câu quote ngẫu nhiên
const quotes = [
  "Không cần nhanh, chỉ cần kiên trì là đủ. 🌱",
  "Một bước nhỏ hôm nay là một chiến thắng. 🏔",
  "Tiếp tục tiến lên, dù chỉ 1%. 💪",
  "Bạn đang làm rất tốt, đừng dừng lại nhé! 🌟",
  "Mỗi hành trình vĩ đại đều bắt đầu bằng một bước nhỏ."
];

// 🎯 Hiển thị quote ngẫu nhiên
quoteEl.textContent = quotes[Math.floor(Math.random() * quotes.length)];


// ====== HÀM HIỂN THỊ DANH SÁCH MỤC TIÊU ======
function renderGoals() {
  list.innerHTML = '';

  goals.forEach((goal, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span style="text-decoration: ${goal.done ? 'line-through' : 'none'}">
        ${goal.text}
      </span>
      <butt
