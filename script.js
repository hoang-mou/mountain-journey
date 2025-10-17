// =============================================================
// 🎮 MOUNTAIN JOURNEY 3D — Enhanced 3D Scene
// =============================================================

const canvas = document.getElementById('scene');
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x87ceeb, 30, 100);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
// Điều chỉnh camera cho phù hợp với mobile và desktop
const isMobile = window.innerWidth < 768;
if (isMobile) {
  camera.position.set(20, 10, 30);
} else {
  camera.position.set(15, 12, 25);
}
camera.lookAt(0, 5, 0);

// ====== LIGHTING ======
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffefd5, 1.2);
sunLight.position.set(10, 20, 10);
sunLight.castShadow = true;
scene.add(sunLight);

const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.4);
fillLight.position.set(-10, 5, -10);
scene.add(fillLight);

// ====== GROUND ======
const groundGeometry = new THREE.PlaneGeometry(100, 100, 20, 20);
const groundMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x8fbc8f,
  roughness: 0.8,
  metalness: 0.2
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
ground.receiveShadow = true;
scene.add(ground);

// ====== MOUNTAIN ======
const mountainGroup = new THREE.Group();

// Main mountain peak
const mainPeakGeom = new THREE.ConeGeometry(8, 18, 8);
const mainPeakMat = new THREE.MeshStandardMaterial({ 
  color: 0x8b7355,
  roughness: 0.9,
  flatShading: true
});
const mainPeak = new THREE.Mesh(mainPeakGeom, mainPeakMat);
mainPeak.position.set(0, 9, 0);
mainPeak.castShadow = true;
mountainGroup.add(mainPeak);

// Snow cap on top
const snowCapGeom = new THREE.ConeGeometry(3, 6, 8);
const snowCapMat = new THREE.MeshStandardMaterial({ 
  color: 0xffffff,
  roughness: 0.3,
  metalness: 0.1
});
const snowCap = new THREE.Mesh(snowCapGeom, snowCapMat);
snowCap.position.set(0, 15, 0);
mountainGroup.add(snowCap);

// Side peaks for more natural look
const sidePeak1 = new THREE.Mesh(
  new THREE.ConeGeometry(5, 12, 7),
  new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.9, flatShading: true })
);
sidePeak1.position.set(-8, 6, -3);
sidePeak1.castShadow = true;
mountainGroup.add(sidePeak1);

const sidePeak2 = new THREE.Mesh(
  new THREE.ConeGeometry(4, 10, 6),
  new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.9, flatShading: true })
);
sidePeak2.position.set(7, 5, -4);
sidePeak2.castShadow = true;
mountainGroup.add(sidePeak2);

scene.add(mountainGroup);

// ====== WINDING PATH ======
const pathPoints = [];
const pathMarkers = [];
const checkpoints = [0, 0.25, 0.5, 0.75, 1.0];

for (let i = 0; i <= 100; i++) {
  const t = i / 100;
  const angle = t * Math.PI * 3;
  const radius = 9 * (1 - t * 0.7);
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const y = t * 16;
  
  pathPoints.push(new THREE.Vector3(x, y, z));
  
  // Add checkpoint markers
  if (checkpoints.includes(Math.round(t * 100) / 100)) {
    const markerGeom = new THREE.SphereGeometry(0.3, 8, 8);
    const markerMat = new THREE.MeshStandardMaterial({ 
      color: t === 1 ? 0xffd700 : 0x667eea,
      emissive: t === 1 ? 0xffd700 : 0x667eea,
      emissiveIntensity: 0.5
    });
    const marker = new THREE.Mesh(markerGeom, markerMat);
    marker.position.copy(pathPoints[pathPoints.length - 1]);
    scene.add(marker);
    pathMarkers.push(marker);
    
    // Add flag at summit
    if (t === 1) {
      const flagPoleGeom = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
      const flagPoleMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
      const flagPole = new THREE.Mesh(flagPoleGeom, flagPoleMat);
      flagPole.position.set(x, y + 1, z);
      scene.add(flagPole);
      
      const flagGeom = new THREE.PlaneGeometry(1.2, 0.8);
      const flagMat = new THREE.MeshStandardMaterial({ 
        color: 0xff4444,
        side: THREE.DoubleSide
      });
      const flag = new THREE.Mesh(flagGeom, flagMat);
      flag.position.set(x + 0.6, y + 1.6, z);
      scene.add(flag);
    }
  }
}

// Draw path line
const pathCurve = new THREE.CatmullRomCurve3(pathPoints);
const pathGeometry = new THREE.TubeGeometry(pathCurve, 200, 0.15, 8, false);
const pathMaterial = new THREE.MeshStandardMaterial({ 
  color: 0xd4a574,
  roughness: 0.7
});
const pathMesh = new THREE.Mesh(pathGeometry, pathMaterial);
scene.add(pathMesh);

// ====== CHARACTER ======
let character;
const characterGeom = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 8);
const characterMat = new THREE.MeshStandardMaterial({ color: 0x4a90e2 });
character = new THREE.Mesh(characterGeom, characterMat);
character.position.copy(pathPoints[0]);
character.castShadow = true;
scene.add(character);

// Add simple head
const headGeom = new THREE.SphereGeometry(0.25, 8, 8);
const headMat = new THREE.MeshStandardMaterial({ color: 0xffdbac });
const head = new THREE.Mesh(headGeom, headMat);
head.position.y = 0.8;
character.add(head);

// ====== RENDERER ======
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// ====== ANIMATION ======
let currentProgress = 0;

function animate() {
  requestAnimationFrame(animate);
  
  mountainGroup.rotation.y += 0.001;
  
  pathMarkers.forEach((marker, i) => {
    marker.scale.setScalar(1 + Math.sin(Date.now() * 0.003 + i) * 0.1);
  });
  
  renderer.render(scene, camera);
}
animate();

// ====== MOVE CHARACTER ======
function moveCharacterByProgress(percent) {
  const targetProgress = percent / 100;
  gsap.to({ progress: currentProgress }, {
    progress: targetProgress,
    duration: 2,
    ease: 'power2.out',
    onUpdate: function() {
      currentProgress = this.targets()[0].progress;
      const pointIndex = Math.floor(currentProgress * (pathPoints.length - 1));
      const point = pathPoints[pointIndex];
      
      if (point && character) {
        character.position.copy(point);
        
        const nextIndex = Math.min(pointIndex + 5, pathPoints.length - 1);
        const nextPoint = pathPoints[nextIndex];
        character.lookAt(nextPoint);
        
        const cameraTarget = point.clone();
        cameraTarget.y += 8;
        cameraTarget.z += 15;
        cameraTarget.x += 10;
        
        gsap.to(camera.position, {
          x: cameraTarget.x,
          y: cameraTarget.y,
          z: cameraTarget.z,
          duration: 2,
          ease: 'power2.out'
        });
        
        camera.lookAt(point);
      }
    },
    onComplete: () => {
      if (percent === 100) {
        createFireworks();
      }
    }
  });
}

// ====== FIREWORKS ======
function createFireworks() {
  const summit = pathPoints[pathPoints.length - 1];
  
  for (let burst = 0; burst < 3; burst++) {
    setTimeout(() => {
      const particles = [];
      for (let i = 0; i < 30; i++) {
        const particleGeom = new THREE.SphereGeometry(0.15, 4, 4);
        const particleMat = new THREE.MeshBasicMaterial({ 
          color: Math.random() * 0xffffff 
        });
        const particle = new THREE.Mesh(particleGeom, particleMat);
        particle.position.copy(summit);
        
        const angle = Math.random() * Math.PI * 2;
        const elevation = Math.random() * Math.PI * 0.5;
        const speed = 2 + Math.random() * 2;
        
        particle.userData.velocity = {
          x: Math.cos(angle) * Math.cos(elevation) * speed,
          y: Math.sin(elevation) * speed + 2,
          z: Math.sin(angle) * Math.cos(elevation) * speed
        };
        
        scene.add(particle);
        particles.push(particle);
      }
      
      let frame = 0;
      const animateParticles = () => {
        frame++;
        let allGone = true;
        
        particles.forEach(p => {
          if (p.position.y > summit.y - 5) {
            p.position.x += p.userData.velocity.x * 0.1;
            p.position.y += p.userData.velocity.y * 0.1;
            p.position.z += p.userData.velocity.z * 0.1;
            p.userData.velocity.y -= 0.1;
            p.material.opacity = Math.max(0, 1 - frame / 60);
            p.material.transparent = true;
            allGone = false;
          }
        });
        
        if (!allGone && frame < 100) {
          requestAnimationFrame(animateParticles);
        } else {
          particles.forEach(p => scene.remove(p));
        }
      };
      animateParticles();
    }, burst * 300);
  }
}

// ====== RESIZE ======
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


// =============================================================
// 🧩 UI & GOALS MANAGEMENT
// =============================================================

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

// ====== DATA ======
let goals = JSON.parse(localStorage.getItem('goals')) || [];
let userEmail = localStorage.getItem('userEmail') || '';
let streakData = JSON.parse(localStorage.getItem('streakData')) || { 
  current: 0, 
  best: 0, 
  lastDate: null 
};

// ====== QUOTES ======
const quotes = [
  "Không cần nhanh, chỉ cần kiên trì là đủ. 🌱",
  "Một bước nhỏ hôm nay là một chiến thắng. 🏔",
  "Tiếp tục tiến lên, dù chỉ 1%. 💪",
  "Bạn đang làm rất tốt, đừng dừng lại nhé! 🌟",
  "Mỗi hành trình vĩ đại đều bắt đầu bằng một bước nhỏ.",
  "Đỉnh núi đang chờ đón bạn! 🏆",
  "Hôm nay tốt hơn hôm qua một chút thôi cũng đủ. ✨"
];
if (quoteEl) quoteEl.textContent = quotes[Math.floor(Math.random() * quotes.length)];

// ====== HELPERS ======
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

// ====== STREAK SYSTEM ======
function updateStreak() {
  const today = getTodayKey();
  const total = goals.filter(g => !g.recurring || g.date === today).length;
  const done = goals.filter(g => g.done && (!g.recurring || g.date === today)).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  if (percent >= 80) {
    if (streakData.lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yy = yesterday.getFullYear();
      const mm = String(yesterday.getMonth() + 1).padStart(2, '0');
      const dd = String(yesterday.getDate()).padStart(2, '0');
      const yesterdayKey = `${yy}-${mm}-${dd}`;

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
        <span style="font-size:0.85rem;color:#fff9;">🏆 Best: ${streakData.best}</span>
      </div>
    `;
  }
}

// ====== RECURRING GOALS ======
function checkRecurringGoals() {
  const today = getTodayKey();
  let needUpdate = false;

  goals.forEach(goal => {
    if (!goal.recurring || goal.recurring === 'none') return;

    const todayInstance = goals.find(g => 
      g.parentId === goal.id && g.date === today
    );

    if (!todayInstance) {
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

// ====== TAGS SYSTEM ======
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

// ====== RENDER GOALS ======
function renderGoals() {
  const today = getTodayKey();
  list.innerHTML = '';

  let filteredGoals = goals.filter(g => {
    if (g.isInstance && g.date !== today) return false;
    if (g.recurring && g.recurring !== 'none' && !g.isInstance) return true;
    if (!g.recurring || g.recurring === 'none') return true;
    return false;
  });

  if (activeTagFilter) {
    filteredGoals = filteredGoals.filter(g => 
      g.tags && g.tags.includes(activeTagFilter)
    );
  }

  if (filteredGoals.length === 0) {
    list.innerHTML = '<li style="text-align:center;color:#888;padding:20px;">Chưa có mục tiêu nào 🎯</li>';
    updateProgress();
    return;
  }

  filteredGoals.forEach((goal) => {
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
        <button onclick="toggleGoal(${actualIndex})" style="background:${goal.done ? '#6c757d' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};">
          ${goal.done ? '↩️' : '✅'}
        </button>
        ${!goal.isInstance ? `<button onclick="deleteGoal(${actualIndex})" style="background:linear-gradient(135deg, #eb3349 0%, #f45c43 100%);">🗑️</button>` : ''}
      </div>
    `;

    list.appendChild(li);
  });

  updateProgress();
  updateStreak();
  renderTagFilters();
}

// ====== ADD GOAL ======
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

// ====== TOGGLE & DELETE ======
window.toggleGoal = function(index) {
  goals[index].done = !goals[index].done;
  localStorage.setItem('goals', JSON.stringify(goals));
  renderGoals();
  if (goals[index].done) showNotification('🎉 Hoàn thành!', 'success');
};

window.deleteGoal = function(index) {
  if (confirm('❓ Bạn có chắc muốn xóa?')) {
    const goal = goals[index];
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

// ====== PROGRESS ======
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
  persistDailyProgress(percent);
}

// ====== NOTIFICATION ======
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


// =============================================================
// 📊 CHARTS
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
    labels = ['Tiến độ'];
    data = [percent];
    title = '🎯 Hôm nay';
  } else if (mode === 'week') {
    labels = getLastNDaysLabels(7).map(d => {
      const parts = d.split('-');
      return `${parts[2]}/${parts[1]}`;
    });
    data = buildSeriesFor(getLastNDaysLabels(7));
    title = '📅 7 ngày qua';
  } else {
    labels = getLastNDaysLabels(30).map(d => {
      const parts = d.split('-');
      return `${parts[2]}/${parts[1]}`;
    });
    data = buildSeriesFor(getLastNDaysLabels(30));
    title = '📈 30 ngày qua';
  }

  if (progressChart) progressChart.destroy();

  progressChart = new Chart(chartCtx, {
    type: mode === 'today' ? 'bar' : 'line',
    data: {
      labels,
      datasets: [{
        label: 'Tiến độ (%)',
        data,
        backgroundColor: mode === 'today' 
          ? 'rgba(102, 126, 234, 0.8)' 
          : 'rgba(102, 126, 234, 0.2)',
        borderColor: 'rgb(102, 126, 234)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: mode === 'today' ? 0 : 4,
        pointBackgroundColor: 'rgb(102, 126, 234)',
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { 
          display: true, 
          text: title,
          font: { size: 14, weight: 'bold' },
          color: '#333'
        }
      },
      scales: {
        y: { 
          suggestedMin: 0, 
          suggestedMax: 100, 
          ticks: { stepSize: 20 },
          grid: { color: 'rgba(0,0,0,0.05)' }
        },
        x: {
          grid: { display: false }
        }
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


// =============================================================
// 📧 EMAIL NOTIFICATION
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
  const email = prompt('📧 Nhập email để nhận thông báo:', userEmail || '');
  if (email && email.includes('@')) {
    userEmail = email.trim();
    localStorage.setItem('userEmail', userEmail);
    showNotification('✅ Đã lưu email thành công!', 'success');
  } else if (email !== null) {
    alert('⚠️ Email không hợp lệ');
  }
}

if (emailSettingsBtn) emailSettingsBtn.addEventListener('click', setupUserEmail);

if (!userEmail) {
  setTimeout(() => {
    const want = confirm('🏔️ Mountain Journey\n\nBạn có muốn nhận thông báo email cho mục tiêu của mình không?');
    if (want) setupUserEmail();
  }, 1500);
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
    showNotification('📧 Email nhắc nhở đã được gửi!', 'success');
  } catch (err) {
    console.error('❌ Email error:', err);
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


// =============================================================
// 🚀 INITIALIZATION
// =============================================================

checkRecurringGoals();
renderGoals();
setActiveTab(tabToday);
renderChart('today');

setInterval(checkRecurringGoals, 60 * 60 * 1000);
