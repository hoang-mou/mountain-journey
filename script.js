const form = document.getElementById('goalForm');
const input = document.getElementById('goalInput');
const list = document.getElementById('goalList');
const character = document.getElementById('character');
const quoteEl = document.getElementById('quote');

let goals = JSON.parse(localStorage.getItem('goals')) || [];
let lastDate = localStorage.getItem('date');

// 🕐 Reset nếu qua ngày mới
const today = new Date().toDateString();
if (lastDate !== today) {
  goals = [];
  localStorage.setItem('goals', JSON.stringify(goals));
  localStorage.setItem('date', today);
}

// 💬 Câu nói động viên
const quotes = [
  "Mỗi bước nhỏ đều đưa bạn gần đỉnh hơn 🏔",
  "Tiến chậm còn hơn không tiến!",
  "Bạn đang làm rất tốt, cứ tiếp tục 💪",
  "Không cần hoàn hảo, chỉ cần tiến lên mỗi ngày 🌱",
  "Nhìn lại xem, bạn đã đi xa thế nào rồi!"
];
quoteEl.textContent = quotes[Math.floor(Math.random() * quotes.length)];

// Hiển thị danh sách
function renderGoals() {
  list.innerHTML = '';
  goals.forEach((g, i) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span style="text-decoration:${g.done ? 'line-through' : 'none'}">
        ${g.text}
      </span>
      <button onclick="toggleGoal(${i})">${g.done ? '↩️' : '✅'}</button>
    `;
    list.appendChild(li);
  });
  moveCharacter();
}

// Đánh dấu hoàn thành
function toggleGoal(i) {
  goals[i].done = !goals[i].done;
  localStorage.setItem('goals', JSON.stringify(goals));
  renderGoals();
}

// Di chuyển nhân vật
function moveCharacter() {
  const done = goals.filter(g => g.done).length;
  const total = goals.length || 1;
  const progress = (done / total) * 150;
  gsap.to(character, { bottom: progress, duration: 0.6 });
}

// Thêm mục tiêu
form.addEventListener('submit', e => {
  e.preventDefault();
  goals.push({ text: input.value, done: false });
  input.value = '';
  localStorage.setItem('goals', JSON.stringify(goals));
  renderGoals();
});

renderGoals();
