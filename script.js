// =============================================================
// 🎮 MOUNTAIN JOURNEY 3D — Scene & Character
// =============================================================

// ====== 1) SCENE CƠ BẢN ======
const canvas = document.getElementById('scene');
const scene = new THREE.Scene();

// 🎥 Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 8);

// 💡 Ánh sáng
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

// 🌄 Mặt đất
const groundGeometry = new THREE.PlaneGeometry(50, 50);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x99c1b9 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -4;
scene.add(ground);

// 🏔 Núi (đặt hơi xa để không che nhân vật)
const mountainGeometry = new THREE.ConeGeometry(5, 8, 6);
const mountainMaterial = new THREE.MeshStandardMaterial({ color: 0x8b6b4b });
const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
mountain.position.set(0, 0, -1);
scene.add(mountain);

// ====== 2) NHÂN VẬT 3D (.glb) ======
let character;
const loader = new THREE.GLTFLoader();

loader.load(
  'https://raw.githubusercontent.com/hoang-mou/mountain-journey/main/assets/character.glb',
  (gltf) => {
    character = gltf.scene;

    const box = new THREE.Box3().setFromObject(character);
    const size = new THREE.Vector3();
    box.getSize(size);
    const targetHeight = 1.6;
    const scale = targetHeight / (size.y || 1);
    character.scale.setScalar(scale);

    character.position.set(2.2, -3.2, 2.2);
    character.lookAt(0, 3.5, -1);

    scene.add(character);
  },
  (xhr) => {
    const pct = xhr.total ? (xhr.loaded / xhr.total) * 100 : 0;
    console.log(`Đang tải mô hình: ${pct.toFixed(0)}%`);
  },
  (error) => {
    console.error('Lỗi tải mô hình:', error);
  }
);

// 🎨 Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0xaeecef, 1);
renderer.outputEncoding = THREE.sRGBEncoding;

// 🌫 Fog
scene.fog = new THREE.Fog(0xaeecef, 5, 25);

// 🔄 Loop
function animate() {
  requestAnimationFrame(animate);
  mountain.rotation.y += 0.003;
  renderer.render(scene, camera);
}
animate();

// 📏 Responsive
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


// =============================================================
// 🧩 UI & GOALS — DOM, quotes, render list, toggle, delete, progress
// =============================================================

// 🗂️ DOM elements
const form = document.getElementById('goalForm');
const input = document.getElementById('goalInput');
const dateInput = document.getElementById('goalDate');
const timeInput = document.getElementById('goalTime');
const emailCheckbox = document.getElementById('emailNotification');
const list = document.getElementById('goalList');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const quoteEl = document.getElementById('quote');
const emailSettingsBtn = document.getElementById('emailSettings');

// 💾 LocalStorage
let goals = JSON.parse(localStorage.getItem('goals')) || [];
let userEmail = localStorage.getItem('userEmail') || '';

// 💬 Quote ngẫu nhiên
const quotes = [
  "Không cần nhanh, chỉ cần kiên trì là đủ. 🌱",
  "Một bước nhỏ hôm nay là một chiến thắng. 🏔",
  "Tiếp tục tiến lên, dù chỉ 1%. 💪",
  "Bạn đang làm rất tốt, đừng dừng lại nhé! 🌟",
  "Mỗi hành trình vĩ đại đều bắt đầu bằng một bước nhỏ."
];
if (quoteEl) {
  quoteEl.textContent = quotes[Math.floor(Math.random() * quotes.length)];
}

// ===== Helpers =====
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// ===== Render danh sách goals =====
function renderGoals() {
  list.innerHTML = '';

  if (goals.length === 0) {
    list.innerHTML = '<li style="text-align:center;color:#888;">Chưa có mục tiêu nào. Hãy thêm mục tiêu đầu tiên! 🎯</li>';
    updateProgress();
    return;
  }

  goals.forEach((goal, index) => {
    const li = document.createElement('li');

    const timeInfo = (goal.date && goal.time)
      ? `<small style="color:#888;">⏰ ${formatDate(goal.date)} - ${goal.time}</small><br>`
      : '';

    const emailIcon = goal.emailNotification ? ' <span title="Có nhắc qua email">📧</span>' : '';
    const sentIcon  = goal.notificationSent ? ' <span title="Đã gửi" style="color:#28a745;">✓</span>' : '';

    li.innerHTML = `
      <div style="flex:1;">
        <span style="text-decoration:${goal.done ? 'line-through':'none'};color:${goal.done ? '#888':'#333'}">
          ${goal.text}${emailIcon}${sentIcon}
        </span><br>
        ${timeInfo}
      </div>
      <div style="display:flex;gap:6px;">
        <button onclick="toggleGoal(${index})" style="background:${goal.done ? '#6c757d' : '#28a745'};">
          ${goal.done ? '↩️' : '✅'}
        </button>
        <button onclick="deleteGoal(${index})" style="background:#dc3545;">🗑️</button>
      </div>
    `;

    list.appendChild(li);
  });

  updateProgress();
}

// ===== Thêm mục tiêu =====
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  const newGoal = {
    text,
    done: false,
    date: dateInput.value || null,
    time: timeInput.value || null,
    emailNotification: !!emailCheckbox.checked,
    notificationSent: false,
    createdAt: new Date().toISOString()
  };

  goals.push(newGoal);

  input.value = '';
  dateInput.value = '';
  timeInput.value = '';
  emailCheckbox.checked = false;

  localStorage.setItem('goals', JSON.stringify(goals));
  renderGoals();
  showNotification('🎯 Mục tiêu đã được thêm!', 'success');
});

// ===== Toggle hoàn thành =====
function toggleGoal(index) {
  goals[index].done = !goals[index].done;
  localStorage.setItem('goals', JSON.stringify(goals));
  renderGoals();
  if (goals[index].done) showNotification('🎉 Hoàn thành mục tiêu!', 'success');
}

// ===== Xóa mục tiêu =====
function deleteGoal(index) {
  if (confirm('❓ Bạn có chắc muốn xóa mục tiêu này?')) {
    goals.splice(index, 1);
    localStorage.setItem('goals', JSON.stringify(goals));
    renderGoals();
    showNotification('🗑️ Mục tiêu đã được xóa', 'info');
  }
}

// ===== Cập nhật tiến độ + di chuyển nhân vật =====
function updateProgress() {
  const total = goals.length;
  const done = goals.filter(g => g.done).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  progressFill.style.width = `${percent}%`;
  progressText.textContent = `${percent}% hoàn thành (${done}/${total} mục tiêu)`;

  moveCharacterByProgress(percent);
}

// Di chuyển nhân vật theo %
function moveCharacterByProgress(percent) {
  if (!character) return;
  const baseY = -3.2;
  const climbHeight = 6;
  const newY = baseY + (percent / 100) * climbHeight;

  gsap.to(character.position, {
    y: newY,
    duration: 1,
    ease: 'power2.out'
  });
}

// ===== Notification nhỏ góc phải =====
function showNotification(message, type = 'info') {
  const el = document.createElement('div');
  el.className = `notification notification-${type}`;
  el.textContent = message;
  document.body.appendChild(el);

  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

// Khởi tạo render lần đầu
renderGoals();


// =============================================================
// 📊 Charts — Hôm nay / Tuần / Tháng + Lưu tiến độ theo ngày
// =============================================================

// DOM cho Tabs & Chart
const tabToday = document.getElementById('tab-today');
const tabWeek  = document.getElementById('tab-week');
const tabMonth = document.getElementById('tab-month');
const chartCanvas = document.getElementById('chartCanvas');
const chartCtx = chartCanvas ? chartCanvas.getContext('2d') : null;

let progressChart = null;

// ===== Helpers ngày-tháng =====
function ymd(date) {
  const d = new Date(date);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}
function getTodayKey() { return ymd(new Date()); }

// Lưu/đọc map % theo ngày
function persistDailyProgress(percent) {
  const key = 'dailyProgress';
  const map = JSON.parse(localStorage.getItem(key) || '{}');
  map[getTodayKey()] = percent;
  localStorage.setItem(key, JSON.stringify(map));
}
function readDailyProgressMap() {
  return JSON.parse(localStorage.getItem('dailyProgress') || '{}');
}

// Tạo nhãn chuỗi ngày gần nhất
function getLastNDaysLabels(n) {
  const out = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push(ymd(d));
  }
  return out;
}
function buildSeriesFor(labels) {
  const map = readDailyProgressMap();
  return labels.map(key => (map[key] ?? 0));
}

// Vẽ biểu đồ theo mode
function renderChart(mode = 'today') {
  if (!chartCtx) return;

  let labels, data, title;

  if (mode === 'today') {
    const total = goals.length;
    const done = goals.filter(g => g.done).length;
    const percent = total ? Math.round((done / total) * 100) : 0;

    labels = ['% hoàn thành'];
    data = [percent];
    title = 'Hôm nay';
  } else if (mode === 'week') {
    labels = getLastNDaysLabels(7);
    data = buildSeriesFor(labels);
    title = '7 ngày qua';
  } else {
    labels = getLastNDaysLabels(30);
    data = buildSeriesFor(labels);
    title = '30 ngày qua';
  }

  if (progressChart) progressChart.destroy();

  progressChart = new Chart(chartCtx, {
    type: mode === 'today' ? 'bar' : 'line',
    data: {
      labels,
      datasets: [{
        label: 'Tiến độ (%)',
        data,
        borderWidth: 2,
        tension: 0.25,
        pointRadius: mode === 'today' ? 0 : 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: true, text: title }
      },
      scales: {
        y: { suggestedMin: 0, suggestedMax: 100, ticks: { stepSize: 20 } }
      }
    }
  });
}

// Kích hoạt tab
function setActiveTab(btn) {
  [tabToday, tabWeek, tabMonth].forEach(b => b && b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

// Sự kiện chuyển tab
if (tabToday) tabToday.addEventListener('click', () => { setActiveTab(tabToday); renderChart('today'); });
if (tabWeek)  tabWeek .addEventListener('click', () => { setActiveTab(tabWeek ); renderChart('week');  });
if (tabMonth) tabMonth.addEventListener('click', () => { setActiveTab(tabMonth); renderChart('month'); });

// Gắn vào updateProgress để tự động lưu % và cập nhật chart
const originalUpdateProgress = updateProgress;
window.updateProgress = function() {
  originalUpdateProgress();
  
  const total = goals.length;
  const done = goals.filter(g => g.done).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  persistDailyProgress(percent);

  if (tabToday && tabToday.classList.contains('active')) {
    renderChart('today');
  }
};

// Vẽ chart mặc định khi load
setActiveTab(tabToday);
renderChart('today');


// =============================================================
// 📧 Email Notification — EmailJS
// =============================================================

const EMAILJS_SERVICE_ID  = 'service_4yfpzaq';
const EMAILJS_TEMPLATE_ID = 'template_v4ozx4p';
const EMAILJS_PUBLIC_KEY  = 'u-3f9feGnUN0uAiaD';

// Khởi tạo EmailJS
try {
  if (window.emailjs && typeof emailjs.init === 'function') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    console.log('✅ EmailJS initialized');
  } else {
    console.warn('⚠️ EmailJS library chưa sẵn sàng.');
  }
} catch (e) {
  console.warn('⚠️ Không thể init EmailJS:', e);
}

// Cấu hình email
function setupUserEmail() {
  const email = prompt('📧 Nhập email của bạn để nhận thông báo:', userEmail || '');
  if (email && email.includes('@')) {
    userEmail = email.trim();
    localStorage.setItem('userEmail', userEmail);
    showNotification('✅ Đã lưu email: ' + userEmail, 'success');
  } else if (email !== null) {
    alert('⚠️ Email không hợp lệ. Vui lòng nhập lại.');
  }
}

// Gắn nút settings
if (emailSettingsBtn) {
  emailSettingsBtn.addEventListener('click', setupUserEmail);
}

// Hỏi lần đầu
if (!userEmail) {
  setTimeout(() => {
    const want = confirm('🏔️ Mountain Journey\n\nBạn có muốn nhận thông báo email cho các mục tiêu không?');
    if (want) setupUserEmail();
  }, 1200);
}

// Gửi email
async function sendReminderEmail(goal) {
  if (!userEmail) {
    console.log('⛔ Chưa cấu hình email người dùng.');
    return;
  }
  if (!window.emailjs || typeof emailjs.send !== 'function') {
    console.log('⛔ EmailJS chưa sẵn sàng.');
    return;
  }

  try {
    const templateParams = {
      to_email: userEmail,
      goal_name: goal.text,
      goal_time: `${goal.date} lúc ${goal.time}`,
      message: `🏔️ Nhắc nhở: Đừng quên "${goal.text}" vào ${goal.date} lúc ${goal.time}!\nHãy tiếp tục leo núi nhé! 💪`
    };

    const res = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
    console.log('✅ Email đã gửi:', res);
    showNotification('📧 Đã gửi email nhắc nhở!', 'success');
  } catch (err) {
    console.error('❌ Lỗi gửi email:', err);
    showNotification('⚠️ Không thể gửi email. Kiểm tra kết nối/cấu hình.', 'error');
  }
}

// Kiểm tra lịch
function checkScheduledNotifications() {
  const now = new Date();
  const THIRTY_MIN = 30 * 60 * 1000;

  goals.forEach((goal, i) => {
    if (!goal || goal.done) return;
    if (!goal.emailNotification || !goal.date || !goal.time) return;

    const goalDateTime = new Date(`${goal.date}T${goal.time}`);
    const diff = goalDateTime - now;

    if (diff > 0 && diff <= THIRTY_MIN && !goal.notificationSent) {
      console.log('⏰ Sắp đến giờ cho mục tiêu:', goal.text);
      sendReminderEmail(goal);
      goals[i].notificationSent = true;
      localStorage.setItem('goals', JSON.stringify(goals));
    }
  });
}

// Cron mỗi phút
setInterval(checkScheduledNotifications, 60000);
checkScheduledNotifications();
