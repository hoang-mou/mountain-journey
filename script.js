// =============================================================
// 🎮 MOUNTAIN JOURNEY 3D – với Email Notification
// =============================================================

// ====== 1. SCENE 3D CƠ BẢN ======
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

// ====== 2. NHÂN VẬT 3D (.glb thật) ======
let character;
const loader = new THREE.GLTFLoader();

loader.load(
  'https://raw.githubusercontent.com/hoang-mou/mountain-journey/main/assets/character.glb',
  (gltf) => {
    character = gltf.scene;
    character.scale.set(0.8, 0.8, 0.8);
    character.position.set(0, -3.5, 0);
    scene.add(character);
  },
  (xhr) => {
    console.log(`Đang tải mô hình: ${(xhr.loaded / xhr.total * 100).toFixed(0)}%`);
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

// 🌫 Hiệu ứng sương
scene.fog = new THREE.Fog(0xaeecef, 5, 25);

// 🔄 Vòng lặp animation
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
// 🧩 3. PHẦN GIAO DIỆN: QUẢN LÝ MỤC TIÊU & TIẾN ĐỘ
// =============================================================

// 🗂️ DOM Elements
const form = document.getElementById('goalForm');
const input = document.getElementById('goalInput');
const dateInput = document.getElementById('goalDate');
const timeInput = document.getElementById('goalTime');
const emailCheckbox = document.getElementById('emailNotification');
const list = document.getElementById('goalList');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const quoteEl = document.getElementById('quote');

// 📦 Lưu dữ liệu
let goals = JSON.parse(localStorage.getItem('goals')) || [];
let userEmail = localStorage.getItem('userEmail') || '';

// 💬 Câu nói động viên ngẫu nhiên
const quotes = [
  "Không cần nhanh, chỉ cần kiên trì là đủ. 🌱",
  "Một bước nhỏ hôm nay là một chiến thắng. 🏔",
  "Tiếp tục tiến lên, dù chỉ 1%. 💪",
  "Bạn đang làm rất tốt, đừng dừng lại nhé! 🌟",
  "Mỗi hành trình vĩ đại đều bắt đầu bằng một bước nhỏ."
];
quoteEl.textContent = quotes[Math.floor(Math.random() * quotes.length)];


// =============================================================
// 📧 4. HỆ THỐNG EMAIL NOTIFICATION (EmailJS) - ĐÃ CẤU HÌNH
// =============================================================

// ⚙️ Cấu hình EmailJS - THÔNG TIN CỦA BẠN
const EMAILJS_SERVICE_ID = 'service_4yfpzaq';
const EMAILJS_TEMPLATE_ID = 'template_v4ozx4p';
const EMAILJS_PUBLIC_KEY = 'u-3f9feGnUN0uAiaD';

// 📩 Khởi tạo EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

// 🔔 Hàm gửi email nhắc nhở
async function sendReminderEmail(goal) {
  if (!userEmail) {
    console.log('Chưa cấu hình email người dùng');
    return;
  }

  try {
    const templateParams = {
      to_email: userEmail,
      goal_name: goal.text,
      goal_time: `${goal.date} lúc ${goal.time}`,
      message: `🏔️ Nhắc nhở: Đừng quên "${goal.text}" vào ${goal.date} lúc ${goal.time}!\n\nHãy tiếp tục leo núi nhé! 💪`
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );
    
    console.log('✅ Email đã được gửi thành công!', response);
    showNotification('📧 Email nhắc nhở đã được gửi!', 'success');
  } catch (error) {
    console.error('❌ Lỗi gửi email:', error);
    showNotification('⚠️ Không thể gửi email. Vui lòng kiểm tra kết nối.', 'error');
  }
}

// ⏰ Hàm kiểm tra và gửi thông báo theo lịch
function checkScheduledNotifications() {
  const now = new Date();
  
  goals.forEach((goal, index) => {
    if (goal.emailNotification && goal.date && goal.time && !goal.done) {
      const goalDateTime = new Date(`${goal.date}T${goal.time}`);
      const timeDiff = goalDateTime - now;
      
      // Gửi email trước 30 phút (30 * 60 * 1000 milliseconds)
      const thirtyMinutes = 30 * 60 * 1000;
      
      // Kiểm tra: còn từ 29-31 phút và chưa gửi
      if (timeDiff > 0 && timeDiff <= thirtyMinutes && !goal.notificationSent) {
        console.log(`⏰ Sắp đến giờ cho mục tiêu: ${goal.text}`);
        sendReminderEmail(goal);
        goals[index].notificationSent = true;
        localStorage.setItem('goals', JSON.stringify(goals));
      }
    }
  });
}

// Kiểm tra mỗi phút
setInterval(checkScheduledNotifications, 60000);

// 🔔 Hiển thị thông báo trên màn hình
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}


// =============================================================
// 5. QUẢN LÝ EMAIL NGƯỜI DÙNG
// =============================================================

function setupUserEmail() {
  const email = prompt('📧 Nhập email của bạn để nhận thông báo:', userEmail || 'infor.vietinan@gmail.com');
  if (email && email.includes('@')) {
    userEmail = email;
    localStorage.setItem('userEmail', email);
    showNotification('✅ Email đã được lưu: ' + email, 'success');
  } else if (email !== null) {
    alert('⚠️ Email không hợp lệ. Vui lòng nhập lại.');
  }
}

// Nút cấu hình email
const emailSettingsBtn = document.getElementById('emailSettings');
if (emailSettingsBtn) {
  emailSettingsBtn.addEventListener('click', setupUserEmail);
}

// Tự động hỏi email lần đầu
if (!userEmail) {
  setTimeout(() => {
    const wantEmail = confirm('🏔️ Mountain Journey\n\nBạn có muốn nhận thông báo email cho các mục tiêu của mình không?');
    if (wantEmail) {
      setupUserEmail();
    }
  }, 2000);
}


// =============================================================
// 6. HIỂN THỊ DANH SÁCH MỤC TIÊU
// =============================================================

function renderGoals() {
  list.innerHTML = '';

  if (goals.length === 0) {
    list.innerHTML = '<li style="text-align: center; color: #888;">Chưa có mục tiêu nào. Hãy thêm mục tiêu đầu tiên! 🎯</li>';
    updateProgress();
    return;
  }

  goals.forEach((goal, index) => {
    const li = document.createElement('li');
    
    const timeInfo = goal.date && goal.time 
      ? `<small style="color: #888;">⏰ ${formatDate(goal.date)} - ${goal.time}</small><br>`
      : '';
    
    const emailIcon = goal.emailNotification 
      ? '<span style="margin-left: 8px;" title="Thông báo email đã bật">📧</span>' 
      : '';
    
    const sentIcon = goal.notificationSent
      ? '<span style="margin-left: 4px; color: #28a745;" title="Email đã gửi">✓</span>'
      : '';
    
    li.innerHTML = `
      <div style="flex: 1;">
        <span style="text-decoration: ${goal.done ? 'line-through' : 'none'}; color: ${goal.done ? '#888' : '#333'};">
          ${goal.text} ${emailIcon}${sentIcon}
        </span><br>
        ${timeInfo}
      </div>
      <div style="display: flex; gap: 4px;">
        <button onclick="toggleGoal(${index})" style="background: ${goal.done ? '#6c757d' : '#28a745'};">
          ${goal.done ? '↩️' : '✅'}
        </button>
        <button onclick="deleteGoal(${index})" style="background: #dc3545;">🗑️</button>
      </div>
    `;
    list.appendChild(li);
  });

  updateProgress();
}

// Format ngày đẹp hơn
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}


// =============================================================
// 7. THÊM MỤC TIÊU
// =============================================================

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  const newGoal = {
    text,
    done: false,
    date: dateInput.value || null,
    time: timeInput.value || null,
    emailNotification: emailCheckbox.checked,
    notificationSent: false,
    createdAt: new Date().toISOString()
  };

  // Nếu bật email notification nhưng chưa có email
  if (newGoal.emailNotification && !userEmail) {
    const confirm = window.confirm('Bạn cần cấu hình email để nhận thông báo. Thiết lập ngay?');
    if (confirm) {
      setupUserEmail();
    }
  }

  goals.push(newGoal);
  
  // Reset form
  input.value = '';
  dateInput.value = '';
  timeInput.value = '';
  emailCheckbox.checked = false;
  
  localStorage.setItem('goals', JSON.stringify(goals));
  renderGoals();
  showNotification('🎯 Mục tiêu đã được thêm!', 'success');
});


// =============================================================
// 8. CÁC HÀM QUẢN LÝ MỤC TIÊU
// =============================================================

function toggleGoal(index) {
  goals[index].done = !goals[index].done;
  localStorage.setItem('goals', JSON.stringify(goals));
  renderGoals();
  
  if (goals[index].done) {
    showNotification('🎉 Chúc mừng! Bạn đã hoàn thành mục tiêu!', 'success');
  }
}

function deleteGoal(index) {
  if (confirm('❓ Bạn có chắc muốn xóa mục tiêu này?')) {
    goals.splice(index, 1);
    localStorage.setItem('goals', JSON.stringify(goals));
    renderGoals();
    showNotification('🗑️ Mục tiêu đã được xóa', 'info');
  }
}


// =============================================================
// 9. CẬP NHẬT TIẾN ĐỘ + ANIMATION
// =============================================================

function updateProgress() {
  const total = goals.length;
  const done = goals.filter(g => g.done).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  progressFill.style.width = `${percent}%`;
  progressText.textContent = `${percent}% hoàn thành (${done}/${total} mục tiêu)`;

  moveCharacterByProgress(percent);
}

function moveCharacterByProgress(percent) {
  if (!character) return;

  const baseY = -3.5;
  const climbHeight = 6;
  const newY = baseY + (percent / 100) * climbHeight;

  gsap.to(character.position, {
    y: newY,
    duration: 1,
    ease: "power2.out"
  });
}


// =============================================================
// 10. KHỞI TẠO VÀ TEST
// =============================================================

// Hiển thị thông tin debug
console.log('🏔️ Mountain Journey đã khởi động!');
console.log('📧 EmailJS đã được cấu hình với Service ID:', EMAILJS_SERVICE_ID);
console.log('📬 Email người dùng:', userEmail || 'Chưa thiết lập');
console.log('📋 Số mục tiêu hiện tại:', goals.length);

// Render goals
renderGoals();

// Kiểm tra notification ngay khi load
checkScheduledNotifications();

// Test function (để test email, uncomment dòng dưới)
// setTimeout(() => {
//   if (userEmail) {
//     sendReminderEmail({
//       text: 'Test Email Notification',
//       date: new Date().toLocaleDateString('en-CA'),
//       time: new Date().toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'})
//     });
//   }
// }, 3000);
