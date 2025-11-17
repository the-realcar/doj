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

async function loadSessionData() {
  try {
    const response = await fetch(`/api/quiz-session/${sessionId}`);
    if (!response.ok) throw new Error('Session not found');
    const sessionData = await response.json();
    displayResults(sessionData);
  } catch (error) {
    console.error('Error loading session:', error);
    document.getElementById('resultContainer').innerHTML = 
      '<p style="color: var(--error-color);">Błąd: Nie znaleziono sesji</p>';
  }
}

function displayResults(sessionData) {
  document.getElementById('scoreSpan').textContent = sessionData.score;
  document.getElementById('percentageSpan').textContent = sessionData.percentage;
  
  const statusEl = document.getElementById('statusText');
  statusEl.textContent = sessionData.passed ? '✓ ZDANY' : '✗ NIEZDANY';
  statusEl.className = `status-text ${sessionData.passed ? 'passed' : 'failed'}`;

  const container = document.getElementById('resultContainer');
  container.innerHTML = '';

  sessionData.answers.forEach((answer, index) => {
    const resultItem = document.createElement('div');
    resultItem.className = `result-item ${answer.points > 0 ? 'correct' : 'incorrect'}`;
    
    let correctAnswerText = '';
    if (answer.questionType === 'MC' && answer.options) {
      correctAnswerText = `<p><strong>Poprawna odpowiedź:</strong> ${answer.options[answer.correctAnswer]}</p>`;
    }

    resultItem.innerHTML = `
      <div class="result-header">
        <span class="result-number">${index + 1}</span>
        <span class="result-question">${answer.questionText}</span>
        <span class="result-points">${answer.points} / 1</span>
      </div>
      <div class="result-content">
        <p><strong>Odpowiedź użytkownika:</strong> ${answer.userAnswer || '(brak)'}</p>
        ${correctAnswerText}
      </div>
    `;
    container.appendChild(resultItem);
  });
}

document.getElementById('backBtn').addEventListener('click', () => {
  window.location.href = `/edit/${sessionId}`;
});

document.getElementById('homeBtn').addEventListener('click', () => {
  window.location.href = '/';
});

loadSessionData();
