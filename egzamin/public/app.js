const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;
let currentQuestionIndex = 0;
let quizQuestions = [];
let userAnswers = [];

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

// Page Navigation
function showPage(pageName) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.getElementById(pageName).classList.add('active');
}

// Start Quiz
document.getElementById('startBtn').addEventListener('click', async () => {
  try {
    const response = await fetch('/api/quiz-start');
    quizQuestions = await response.json();
    userAnswers = new Array(quizQuestions.length).fill('');
    currentQuestionIndex = 0;
    showQuizPage();
  } catch (error) {
    console.error('Error loading quiz:', error);
    alert('Błąd przy ładowaniu pytań. Spróbuj ponownie.');
  }
});

function showQuizPage() {
  showPage('quizPage');
  displayQuestion(currentQuestionIndex);
  updateProgress();
}

function displayQuestion(index) {
  const question = quizQuestions[index];
  const container = document.getElementById('questionContainer');
  container.innerHTML = '';

  const questionEl = document.createElement('div');
  const questionText = document.createElement('div');
  questionText.className = 'question-text';
  questionText.innerHTML = question.text;
  questionEl.appendChild(questionText);

  if (question.type === 'KO') {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'question-input';
    input.placeholder = 'Wpisz odpowiedź...';
    input.value = userAnswers[index] || '';
    input.addEventListener('change', (e) => {
      userAnswers[index] = e.target.value;
    });
    questionEl.appendChild(input);
  } else if (question.type === 'DO') {
    const textarea = document.createElement('textarea');
    textarea.className = 'question-textarea';
    textarea.placeholder = 'Wpisz szczegółową odpowiedź...';
    textarea.value = userAnswers[index] || '';
    textarea.addEventListener('change', (e) => {
      userAnswers[index] = e.target.value;
    });
    questionEl.appendChild(textarea);
  } else if (question.type === 'MC') {
    const optionsGroup = document.createElement('div');
    optionsGroup.className = 'options-group';
    question.options.forEach((option, optIndex) => {
      const label = document.createElement('label');
      label.className = 'option-label';
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = `question-${index}`;
      radio.value = optIndex;
      radio.checked = userAnswers[index] === optIndex.toString();
      radio.addEventListener('change', (e) => {
        userAnswers[index] = e.target.value;
      });
      label.appendChild(radio);
      const span = document.createElement('span');
      span.textContent = option;
      label.appendChild(span);
      optionsGroup.appendChild(label);
    });
    questionEl.appendChild(optionsGroup);
  } else if (question.type === 'NUM') {
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'question-input';
    input.placeholder = 'Wpisz liczbę...';
    input.value = userAnswers[index] || '';
    input.addEventListener('change', (e) => {
      userAnswers[index] = e.target.value;
    });
    questionEl.appendChild(input);
  }

  container.appendChild(questionEl);
  updateButtonVisibility();
  document.getElementById('currentQuestion').textContent = index + 1;
}

function updateProgress() {
  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
  document.getElementById('progressFill').style.width = progress + '%';
}

function updateButtonVisibility() {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  prevBtn.style.display = currentQuestionIndex > 0 ? 'block' : 'none';
  nextBtn.textContent = currentQuestionIndex === quizQuestions.length - 1 ? 'Zakończ' : 'Dalej';
}

document.getElementById('nextBtn').addEventListener('click', () => {
  if (currentQuestionIndex === quizQuestions.length - 1) {
    submitQuiz();
  } else {
    currentQuestionIndex++;
    displayQuestion(currentQuestionIndex);
    updateProgress();
  }
});

document.getElementById('prevBtn').addEventListener('click', () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    displayQuestion(currentQuestionIndex);
    updateProgress();
  }
});

async function submitQuiz() {
  try {
    const response = await fetch('/api/submit-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: userAnswers, questions: quizQuestions })
    });
    const result = await response.json();
    displaySummary(result);
  } catch (error) {
    console.error('Error submitting quiz:', error);
    alert('Błąd przy przesyłaniu odpowiedzi. Spróbuj ponownie.');
  }
}

function displaySummary(result) {
  document.getElementById('scoreSpan').textContent = result.score;
  document.getElementById('percentageSpan').textContent = result.percentage;
  const statusEl = document.getElementById('statusText');
  statusEl.textContent = result.passed ? '✓ ZDANY' : '✗ NIEZDANY';
  statusEl.className = `status-text ${result.passed ? 'passed' : 'failed'}`;

  const summaryEl = document.getElementById('answersSummary');
  summaryEl.innerHTML = `
    <div class="links-box">
      <h3>Linki do szczegółów:</h3>
      <a href="${result.editLink}" class="link-button edit-link">📝 Edytuj Punkty</a>
      <a href="${result.resultLink}" class="link-button result-link">📊 Podsumowanie Wyników</a>
    </div>
  `;

  showPage('summaryPage');
}

function getUserAnswerText(question, index) {
  const answer = userAnswers[index];
  if (question.type === 'MC') {
    return question.options[parseInt(answer)] || '(brak odpowiedzi)';
  }
  return answer || '(brak odpowiedzi)';
}

document.getElementById('restartBtn').addEventListener('click', () => {
  currentQuestionIndex = 0;
  userAnswers = [];
  quizQuestions = [];
  showPage('startPage');
});
