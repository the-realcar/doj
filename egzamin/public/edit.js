const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;
const sessionId = window.location.pathname.split('/')[2];

// Theme Management
const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
  htmlElement.classList.add('dark-theme');
  themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
  htmlElement.classList.toggle('dark-theme');
  const isDark = htmlElement.classList.contains('dark-theme');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  themeToggle.textContent = isDark ? '☀️' : '🌙';
});

let sessionData = null;

async function loadSessionData() {
  try {
    const response = await fetch(`/api/quiz-session/${sessionId}`);
    if (!response.ok) throw new Error('Session not found');
    sessionData = await response.json();
    displayEditForm();
  } catch (error) {
    console.error('Error loading session:', error);
    document.getElementById('editContainer').innerHTML = 
      '<p style="color: var(--error-color);">Błąd: Nie znaleziono sesji</p>';
  }
}

function displayEditForm() {
  const container = document.getElementById('editContainer');
  container.innerHTML = '';

  sessionData.answers.forEach((answer, index) => {
    const editItem = document.createElement('div');
    editItem.className = 'edit-item';
    editItem.innerHTML = `
      <div class="edit-question">
        <strong>${index + 1}. ${answer.questionText}</strong>
      </div>
      <div class="edit-answer">
        <p><strong>Odpowiedź użytkownika:</strong> ${answer.userAnswer || '(brak)'}</p>
      </div>
      <div class="edit-points">
        <label for="points-${index}">Punkty:</label>
        <input 
          type="number" 
          id="points-${index}" 
          class="points-input" 
          min="0" 
          max="1" 
          step="0.5"
          value="${answer.points}"
          data-index="${index}"
        />
        <span class="points-label">/1</span>
      </div>
    `;
    container.appendChild(editItem);
  });
}

document.getElementById('saveBtn').addEventListener('click', async () => {
  const pointsArray = [];
  document.querySelectorAll('.points-input').forEach(input => {
    pointsArray.push(parseFloat(input.value) || 0);
  });

  try {
    const response = await fetch(`/api/update-points/${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pointsArray })
    });

    if (!response.ok) throw new Error('Update failed');
    const result = await response.json();

    sessionData.score = result.score;
    sessionData.percentage = result.percentage;
    sessionData.passed = result.passed;

    const messageEl = document.getElementById('updateMessage');
    messageEl.textContent = '✓ Zmiany zapisane!';
    messageEl.className = 'message success';
    setTimeout(() => {
      messageEl.textContent = '';
      messageEl.className = 'message';
    }, 3000);
  } catch (error) {
    console.error('Error updating points:', error);
    const messageEl = document.getElementById('updateMessage');
    messageEl.textContent = '✗ Błąd przy zapisywaniu zmian';
    messageEl.className = 'message error';
  }
});

document.getElementById('viewResultBtn').addEventListener('click', () => {
  window.location.href = `/result/${sessionId}`;
});

loadSessionData();
