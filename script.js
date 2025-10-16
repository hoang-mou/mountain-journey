const form = document.getElementById('goalForm');
const input = document.getElementById('goalInput');
const list = document.getElementById('goalList');
const character = document.getElementById('character');

let goals = JSON.parse(localStorage.getItem('goals')) || [];

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

function toggleGoal(i) {
  goals[i].done = !goals[i].done;
  localStorage.setItem('goals', JSON.stringify(goals));
  renderGoals();
}

function moveCharacter() {
  const done = goals.filter(g => g.done).length;
  const total = goals.length || 1;
  const progress = (done / total) * 150; // chiều cao leo
  gsap.to(character, { bottom: progress, duration: 0.6 });
}

form.addEventListener('submit', e => {
  e.preventDefault();
  goals.push({ text: input.value, done: false });
  input.value = '';
  localStorage.setItem('goals', JSON.stringify(goals));
  renderGoals();
});

renderGoals();
