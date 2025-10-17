// =============================================================
// 🎮 MOUNTAIN JOURNEY 3D — Enhanced Version
// =============================================================

// ====== 1) SCENE CƠ BẢN ======
const canvas = document.getElementById('scene');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 8);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

const groundGeometry = new THREE.PlaneGeometry(50, 50);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x99c1b9 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -4;
scene.add(ground);

const mountainGeometry = new THREE.ConeGeometry(5, 8, 6);
const mountainMaterial = new THREE.MeshStandardMaterial({ color: 0x8b6b4b });
const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
mountain.position.set(0, 0, -1);
scene.add(mountain);

// ====== 2) NHÂN VẬT 3D ======
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
  (error) => console.error('Lỗi tải mô hình:', error)
);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0xaeecef, 1);
renderer.outputEncoding = THREE.sRGBEncoding;

scene.fog = new THREE.Fog(0xaeecef, 5, 25);

function animate() {
  requestAnimationFrame(animate);
  mountain.rotation.y += 0.003;
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


// =============================================================
// 🧩 UI & GOALS — Enhanced với Tags, Recurring, Streak
// =============================================================

// 🗂️ DOM elements
const form = document.getElementById('goalForm');
const input = document.getElementById('goalInput');
const dateInput = document.getElementById('goalDate');
const timeInput = document.getElementById('goalTime');
const emailCheckbox = document.getElementById('emailNotification');
const recurringSelect = document.getElementById('recurringSelect');
const tagInput = document.getElementById('tagInput');
const list = document.getElementById('goalList');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const quoteEl = document.getElementById('quote');
const emailSettingsBtn = document.getElementById('emailSettings');
const streakDisplay = document.getElementById('streakDisplay');
const filterTagsDiv = document.getElementById('filterTags');

// 💾 LocalStorage
let goals = JSON.parse(localStorage.getItem('goals')) || [];
let userEmail = localStorage.getItem('userEmail') || '';
let streakData = JSON.parse(localStorage.getItem('streakData')) || { current: 0, best: 0, lastDate: null };

// 💬 Quotes
const quotes = [
  "Không cần nhanh, chỉ cần kiên trì là đủ. 🌱",
  "Một bước nhỏ hôm nay là một chiến thắng. 🏔",
  "Tiếp tục tiến lên, dù chỉ 1%. 💪",
  "Bạn đang làm rất tốt, đừng dừng lại nhé! 🌟",
  "Mỗi hành trình vĩ đại đều bắt đầu bằng một bước nhỏ."
];
if (quoteEl) quoteEl.textContent = quotes[Math.floor(Math.random() * quotes.length)];

// ===== Helpers =====
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function getTodayKey() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

// ===== STREAK SYSTEM =====
function updateStreak() {
  const today = getTodayKey();
  const total = goals.filter(g => !g.recurring || g.date === today).length;
  const done = goals.filter(g => g.done && (!g.recurring || g.date === today)).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  // Chỉ tính streak nếu hoàn thành >= 80%
  if (percent >= 80) {
    if (streakData.lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = getTodayKey.call(yesterday);

      if (streakData.lastDate === yesterdayKey) {
        streakData.current++;
      } else {
        streakData.current = 1;
      }

      streakData.lastDate = today;
      if (streakData.current > streakData.best) {
        streakData.best = streakData.current;
        showNotification(`🎉 Kỷ lục mới: ${streakData.best} ngày!`, 'success');
      }
      localStorage.setItem('streakData', JSON.stringify(streakData));
    }
  }

  if (streakDisplay) {
    streakDisplay.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span>🔥 Streak: <strong>${streakData.current}</strong> ngày</span>
        <span style="font-size:0.85rem;color:#888;">🏆 Best: ${streakData.best}</span>
      </div>
    `;
  }
}

// ===== RECURRING GOALS =====
function checkRecurringGoals() {
  const today = getTodayKey();
  let needUpdate = false;

  goals.forEach(goal => {
    if (!goal.recurring || goal.recurring === 'none') return;

    // Kiểm tra xem đã tạo instance hôm nay chưa
    const todayInstance = goals.find(g => 
      g.parentId === goal.id && g.date === today
    );

    if (!todayInstance) {
      // Tạo instance mới cho hôm nay
      const newInstance = {
        ...goal,
        id: Date.now() + Math.random(),
        parentId: goal.id,
        date: today,
        done: false,
        notificationSent: false,
        isInstance: true
      };
      goals.push(newInstance);
      needUpdate = true;
    }
  });

  if (needUpdate) {
    localStorage.setItem('goals', JSON.stringify(goals));
    renderGoals();
  }
}

// ===== TAGS SYSTEM =====
function getAllTags() {
  const tags = new Set();
  goals.forEach(g => {
    if (g.tags && Array.isArray(g.tags)) {
      g.tags.forEach(t => tags.add(t));
    }
  });
  return Array.from(tags).sort();
}

let activeTagFilter = null;

function renderTagFilters() {
  if (!filterTagsDiv) return;
  const tags = getAllTags();
  
  if (tags.length === 0) {
    filterTagsDiv.innerHTML = '<small style="color:#888;">Chưa có tag nào</small>';
    return;
  }

  filterTagsDiv.innerHTML = `
    <button class="tag-filter ${!activeTagFilter ? 'active' : ''}" onclick="filterByTag(null)">
      Tất cả
    </button>
    ${tags.map(tag => `
      <button class="tag-filter ${activeTagFilter === tag ? 'active' : ''}" onclick="filterByTag('${tag}')">
        #${tag}
      </button>
    `).join('')}
  `;
}

window.filterByTag = function(tag) {
  activeTagFilter = tag;
  renderGoals();
  renderTagFilters();
};

// ===== Render goals =====
function renderGoals() {
  const today = getTodayKey();
  list.innerHTML = '';

  let filteredGoals = goals.filter(g => {
    // Chỉ hiện goals hôm nay hoặc recurring templates
    if (g.isInstance && g.date !== today) return false;
    if (g.recurring && g.recurring !== 'none' && !g.isInstance) return true;
    if (!g.recurring || g.recurring === 'none') return true;
    return false;
  });

  // Filter by tag
  if (activeTagFilter) {
    filteredGoals = filteredGoals.filter(g => 
      g.tags && g.tags.includes(activeTagFilter)
    );
  }

  if (filteredGoals.length === 0) {
    list.innerHTML = '<li style="text-align:center;color:#888;">Chưa có mục tiêu nào 🎯</li>';
    updateProgress();
    return;
  }

  filteredGoals.forEach((goal, index) => {
    const actualIndex = goals.indexOf(goal);
    const li = document.createElement('li');

    const timeInfo = (goal.date && goal.time && !goal.recurring)
      ? `<small style="color:#888;">⏰ ${formatDate(goal.date)} - ${goal.time}</small><br>`
      : '';

    const recurringBadge = goal.recurring && goal.recurring !== 'none'
      ? `<span style="background:#e3f2fd;color:#1976d2;padding:2px 6px;border-radius:4px;font-size:0.75rem;margin-left:6px;">🔄 ${goal.recurring}</span>`
      : '';

    const emailIcon = goal.emailNotification ? ' <span title="Email thông báo">📧</span>' : '';
    const sentIcon = goal.notificationSent ? ' <span title="Đã gửi" style="color:#28a745;">✓</span>' : '';

    const tagsHtml = goal.tags && goal.tags.length > 0
      ? goal.tags.map(t => `<span class="goal-tag">#${t}</span>`).join('')
      : '';

    li.innerHTML = `
      <div style="flex:1;">
        <span style="text-decoration:${goal.done ? 'line-through':'none'};color:${goal.done ? '#888':'#333'}">
          ${goal.text}${recurringBadge}${emailIcon}${sentIcon}
        </span>
        ${tagsHtml ? `<div style="margin-top:4px;">${tagsHtml}</div>` : ''}
        ${timeInfo}
      </div>
      <div style="display:flex;gap:6px;">
        <button onclick="toggleGoal(${actualIndex})" style="background:${goal.done ? '#6c757d' : '#28a745'};">
          ${goal.done ? '↩️' : '✅'}
        </button>
        ${!goal.isInstance ? `<button onclick="deleteGoal(${actualIndex})" style="background:#dc3545;">🗑️</button>` : ''}
      </div>
    `;

    list.appendChild(li);
  });

  updateProgress();
  updateStreak();
  renderTagFilters();
}

// ===== Thêm mục tiêu =====
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  const tags = tagInput.value.trim()
    ? tagInput.value.split(',').map(t => t.trim().replace(/^#/, ''))
    : [];

  const newGoal = {
    id: Date.now(),
    text,
    done: false,
    date: dateInput.value || null,
    time: timeInput.value || null,
    emailNotification: !!emailCheckbox.checked,
    recurring: recurringSelect.value || 'none',
    tags: tags,
    notificationSent: false,
    createdAt: new Date().toISOString()
  };

  goals.push(newGoal);

  input.value = '';
  dateInput.value = '';
  timeInput.value = '';
  tagInput.value = '';
  emailCheckbox.checked = false;
  recurringSelect.value = 'none';

  localStorage.setItem('goals', JSON.stringify(goals));
  renderGoals();
  showNotification('🎯 Mục tiêu đã được thêm!', 'success');
});

// ===== Toggle & Delete =====
window.toggleGoal = function(index) {
  goals[index].done = !goals[index].done;
  localStorage.setItem('goals', JSON.stringify(goals));
  renderGoals();
  if (goals[index].done) showNotification('🎉 Hoàn thành!', 'success');
};

window.deleteGoal = function(index) {
  if (confirm('❓ Bạn có chắc muốn xóa?')) {
    const goal = goals[index];
    // Xóa cả instances nếu là recurring
    if (goal.recurring && goal.recurring !== 'none') {
      goals = goals.filter(g => g.parentId !== goal.id && g.id !== goal.id);
    } else {
      goals.splice(index, 1);
    }
    localStorage.setItem('goals', JSON.stringify(goals));
    renderGoals();
    showNotification('🗑️ Đã xóa', 'info');
  }
};

// ===== Progress =====
function updateProgress() {
  const today = getTodayKey();
  const todayGoals = goals.filter(g => 
    (!g.recurring || g.recurring === 'none' || g.isInstance) && 
    (!g.date || g.date === today)
  );
  const total = todayGoals.length;
  const done = todayGoals.filter(g => g.done).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  progressFill.style.width = `${percent}%`;
  progressText.textContent = `${percent}% hoàn thành (${done}/${total} mục tiêu)`;

  moveCharacterByProgress(percent);
}

function moveCharacterByProgress(percent) {
  if (!character) return;
  const baseY = -3.2;
  const climbHeight = 6;
  const newY = baseY + (percent / 100) * climbHeight;
  gsap.to(character.position, { y: newY, duration: 1, ease: 'power2.out' });
}

// ===== Notification =====
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

// ===== Init =====
checkRecurringGoals();
renderGoals();

// Check recurring mỗi giờ
setInterval(checkRecurringGoals, 60 * 60 * 1000);


// =============================================================
// 📊 Charts
// =============================================================

const tabToday = document.getElementById('tab-today');
const tabWeek = document.getElementById('tab-week');
const tabMonth = document.getElementById('tab-month');
const chartCanvas = document.getElementById('chartCanvas');
const chartCtx = chartCanvas ? chartCanvas.getContext('2d') : null;

let progressChart = null;

function ymd(date) {
  const d = new Date(date);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function persistDailyProgress(percent) {
  const key = 'dailyProgress';
  const map = JSON.parse(localStorage.getItem(key) || '{}');
  map[getTodayKey()] = percent;
  localStorage.setItem(key, JSON.stringify(map));
}

function readDailyProgressMap() {
  return JSON.parse(localStorage.getItem('dailyProgress') || '{}');
}

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

function setActiveTab(btn) {
  [tabToday, tabWeek, tabMonth].forEach(b => b && b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

if (tabToday) tabToday.addEventListener('click', () => { setActiveTab(tabToday); renderChart('today'); });
if (tabWeek) tabWeek.addEventListener('click', () => { setActiveTab(tabWeek); renderChart('week'); });
if (tabMonth) tabMonth.addEventListener('click', () => { setActiveTab(tabMonth); renderChart('month'); });

const originalUpdateProgress = updateProgress;
window.updateProgress = function() {
  originalUpdateProgress();
  const total = goals.length;
  const done = goals.filter(g => g.done).length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  persistDailyProgress(percent);
  if (tabToday && tabToday.classList.contains('active')) renderChart('today');
};

setActiveTab(tabToday);
renderChart('today');


// =============================================================
// 📧 Email Notification
// =============================================================

const EMAILJS_SERVICE_ID = 'service_4yfpzaq';
const EMAILJS_TEMPLATE_ID = 'template_v4ozx4p';
const EMAILJS_PUBLIC_KEY = 'u-3f9feGnUN0uAiaD';

try {
  if (window.emailjs && typeof emailjs.init === 'function') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    console.log('✅ EmailJS initialized');
  }
} catch (e) {
  console.warn('⚠️ EmailJS init failed:', e);
}

function setupUserEmail() {
  const email = prompt('📧 Nhập email:', userEmail || '');
  if (email && email.includes('@')) {
    userEmail = email.trim();
    localStorage.setItem('userEmail', userEmail);
    showNotification('✅ Đã lưu email', 'success');
  } else if (email !== null) {
    alert('⚠️ Email không hợp lệ');
  }
}

if (emailSettingsBtn) emailSettingsBtn.addEventListener('click', setupUserEmail);

if (!userEmail) {
  setTimeout(() => {
    const want = confirm('🏔️ Mountain Journey\n\nNhận thông báo email?');
    if (want) setupUserEmail();
  }, 1200);
}

async function sendReminderEmail(goal) {
  if (!userEmail || !window.emailjs) return;
  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: userEmail,
      goal_name: goal.text,
      goal_time: `${goal.date} lúc ${goal.time}`,
      message: `🏔️ Nhắc nhở: "${goal.text}"`
    });
    showNotification('📧 Email đã gửi!', 'success');
  } catch (err) {
    console.error('Email error:', err);
  }
}

function checkScheduledNotifications() {
  const now = new Date();
  const THIRTY_MIN = 30 * 60 * 1000;
  goals.forEach((goal, i) => {
    if (!goal || goal.done || !goal.emailNotification || !goal.date || !goal.time) return;
    const goalDateTime = new Date(`${goal.date}T${goal.time}`);
    const diff = goalDateTime - now;
    if (diff > 0 && diff <= THIRTY_MIN && !goal.notificationSent) {
      sendReminderEmail(goal);
      goals[i].notificationSent = true;
      localStorage.setItem('goals', JSON.stringify(goals));
    }
  });
}

setInterval(checkScheduledNotifications, 60000);
checkScheduledNotifications();
