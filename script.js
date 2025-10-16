
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

// 🏔 Tạo núi đơn giản (hình nón)
const mountainGeometry = new THREE.ConeGeometry(5, 8, 6);
const mountainMaterial = new THREE.MeshStandardMaterial({ color: 0x8b6b4b });
const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
mountain.position.y = 0;
scene.add(mountain);

// 🎨 Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0xaeecef, 1); // màu bầu trời

// 🌫 Hiệu ứng sương (fog nhẹ)
scene.fog = new THREE.Fog(0xaeecef, 5, 25);

// 🔄 Vòng lặp animation
function animate() {
  requestAnimationFrame(animate);
  mountain.rotation.y += 0.003; // núi xoay nhẹ cho sinh động
  renderer.render(scene, camera);
}
animate();

// 📏 Responsive
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
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
