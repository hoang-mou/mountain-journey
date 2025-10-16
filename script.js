// =============================================================
//  🎮 MOUNTAIN JOURNEY 3D
// =============================================================

// ====== SCENE 3D CƠ BẢN ======
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

// 🌄 Mặt đất / nền
const groundGeometry = new THREE.PlaneGeometry(50, 50);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x99c1b9 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -4;
scene.add(ground);

// 🏔 Núi hình chóp
const mountainGeometry = new THREE.ConeGeometry(5, 8, 6);
const mountainMaterial = new THREE.MeshStandardMaterial({ color: 0x8b6b4b });
const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
mountain.position.y = 0;
scene.add(mountain);

// 🧗‍♂️ NHÂN VẬT (placeholder cube)
const characterGeometry = new THREE.BoxGeometry(0.5, 1, 0.5);
const characterMaterial = new THREE.MeshStandardMaterial({ color: 0x3a5a40 });
const character = new THREE.Mesh(characterGeometry, characterMaterial);
character.position.set(0, -3.5, 0);
scene.add(character);

// 🎨 Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0xaeecef, 1); // màu bầu trời

// 🌫 Hiệu ứng sương
scene.fog = new THREE.Fog(0xaeecef, 5, 25);

// 🔄 Animation loop
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
//  🧩 PHẦN GIAO DIỆN: QUẢN LÝ MỤC TIÊU & TIẾN ĐỘ
// =============================================================

// 🗂️ DOM Elements
const form = document.getElementById('goalForm');
const input = document.getElementById('goalInput');
const list = document.getElementById('goalList');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const quoteEl = document.getElementById('quote');

// 📦 LocalStorage
let goals = JSON.parse(localStorage.getItem('goals')) || [];

// 💬 Câu nói động viên
const quotes = [
  "Không cần nhanh, chỉ cần kiên trì là đủ. 🌱",
  "Một bước nhỏ hôm nay là một chiến thắng. 🏔",
  "Tiếp tục tiến lên, dù chỉ 1%. 💪",
  "Bạn đang làm rất tốt, đừng dừng lại nhé! 🌟",
  "Mỗi hành trình vĩ đại đều bắt đầu bằng một bước nhỏ."
];
quoteEl.textContent = quotes[Math.floor(Math.random() * quotes.length)];


// ====== HIỂN THỊ DANH SÁCH ======
function renderGoals() {
  list.innerHTML = '';

  goals.forEach((goal, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span style="text-decoration: ${goal.done ? 'line-through' : 'none'}">
        ${goal.text}
      </span>
      <button onclick="toggleGoal(${index})">${goal.done ? '↩️' : '✅'}</button>
    `;
    list.appendChild(li);
  });

  updateProgress();
}


// ====== THÊM MỤC TIÊU ======
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  goals.push({ text, done: false });
  input.value = '';
  localStorage.setItem('goals', JSON.stringify(goals));
  renderGoals();
});


// ====== ĐÁNH DẤU HOÀN THÀNH / HỦY ======
function toggleGoal(index) {
  goals[index].done = !goals[index].done;
  localStorage.setItem('goals', JSON.stringify(goals));
  renderGoals();
}


// ====== CẬP NHẬT TIẾN ĐỘ + ANIMATION ======
function updateProgress() {
  const total = goals.length;
  const done = goals.filter(g => g.done).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  progressFill.style.width = `${percent}%`;
  progressText.textContent = `${percent}% hoàn thành`;

  moveCharacterByProgress(percent);
}


// ====== ANIMATION NHÂN VẬT LEO NÚI ======
function moveCharacterByProgress(percent) {
  const baseY = -3.5; // vị trí bắt đầu
  const climbHeight = 6; // chiều cao leo tối đa
  const newY = baseY + (percent / 100) * climbHeight;

  gsap.to(character.position, {
    y: newY,
    duration: 1,
    ease: "power2.out"
  });
}


// ====== KHỞI TẠO ======
renderGoals();
