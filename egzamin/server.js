const express = require('express');
const path = require('path');
const crypto = require('crypto');
const https = require('https');
const app = express();

app.use(express.static('public'));

// Serve files from project root as a fallback so requests like /styles.css and /app.js
// (which may live in the repository root) return 200 instead of 404.
app.use(express.static(path.join(__dirname)));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1439696454947180667/6-KvyLie5bhj4Ig1krYP4C9BZnwE97C_axuYCsgndUxNQLi0WdXUfg70Nd3A_VWiWazT';

const questions = [
  { id: 1, text: "Jakie nakazy możesz wypisać jako zwykły prokurator?", type: "KO" },
  { id: 2, text: "Kto stoi na czele Wydziału Sprawiedliwości?", type: "KO" },
  { id: 3, text: "Ile czasu jest ważny Nakaz Zwolnienia Dyscyplinarnego?", type: "KO" },
  { id: 4, text: "Czy Prokurator może reagować na wezwania adwokatów?", type: "MC", options: ["Tak", "Nie", "Tylko w razie nieobecności adwokatów"], correct: 0 },
  { id: 5, text: "Czym jest ugoda?", type: "DO" },
  { id: 6, text: "Ile wynosi maksymalny czas trwania przesłuchania?", type: "MC", options: ["15 minut", "30 minut", "45 minut", "60 minut"], correct: 3 },
  { id: 7, text: "Czy podczas przesłuchania możesz zadać ciężkie lub trwałe obrażenia ciała w przypadku kiedy osoba nie współpracuje?", type: "MC", options: ["Tak", "Nie"], correct: 1 },
  { id: 8, text: "Czy podczas przesłuchania masz obowiązek wylegitymować się jeszcze raz mimo tego, że zrobiłeś to wcześniej?", type: "MC", options: ["Tak", "Nie"], correct: 0 },
  { id: 9, text: "Wymień osoby, które biorą udział w rozprawie sądowej z powództwa Prokuratury stanu San Andreas?", type: "KO" },
  { id: 10, text: "Jaka jest minimalna jakość materiału dowodowego używanego w rozprawie sądowej?", type: "MC", options: ["360p", "480p", "720p", "1080p"], correct: 3 },
  { id: 11, text: "Czy funkcjonariusz może wycofać przedmioty zatrzymanemu przez przyjazedem prokuratora? Uzasadnij Twoje zdanie.", type: "DO" },
  { id: 12, text: "Czym jest opaska GPS?", type: "DO" },
  { id: 13, text: "Ile jest czasu na spłatę opaski GPS?", type: "MC", options: ["12h", "24h", "48h", "72h"], correct: 3 },
  { id: 14, text: "Czy jako prokurator możesz brać udział w napadach na banki lub sklepy?", type: "KO" },
  { id: 15, text: "Po jakim czasie dowody przedawniają się w sprawach karnych?", type: "MC", options: ["14 dni", "15 dni", "30 dni", "31 dni"], correct: 2 },
  { id: 16, text: "Jakie paragrafy dasz zatrzymanemu, który ma podrobioną licencję na broń i przedawnione badania lekarskie?", type: "KO" },
  { id: 17, text: "Jakie paragrafy możesz dać zatrzymanemu, który postrzelił inną osobę jeżeli wskutek postrzału straciła przytomność?", type: "KO" },
  { id: 18, text: "Jakie paragrafy możesz dać zatrzymanemu, który uciekał od kontroli drogowej?", type: "KO" },
  { id: 19, text: "Co musisz zrobić, żeby sąd uznał za winnego osobę, która spożyła alkohol lub narkotyk podczas prowadzenia pojazdu?", type: "KO" },
  { id: 20, text: "Co musisz zrobić, żeby sąd uznał saszetkę z zieloną/białą/niebieską zawartością jako narkotyk?", type: "DO" },
  { id: 21, text: "Co, jeżeli zatrzymani przyzna się do np. handlu bronią/nielegalnymi przedmiotami/substancjami lub do przynależności do organizacji przestępczej?", type: "DO" },
  { id: 22, text: "Czy paragraf LP.5 można łączyć z paragrafem LP.6?", type: "MC", options: ["Tak", "Nie"], correct: 1 },
  { id: 23, text: "Który paragraf należy doliczyć osobie, która wtargnęła na teren Cayo Perico?", type: "MC", options: ["LP.8", "LP.10", "LP.21", "LP.33"], correct: 2 },
  { id: 24, text: "Jaki paragraf doliczysz zatrzymanemu, który posiada dodatki do broni?", type: "MC", options: ["LP.12", "BP.2"], correct: 0 },
  { id: 25, text: "Czy funkcjonariusz może zatrzymać i zabrać na cele cywila bez ostrzeżenia za noszenie maski?", type: "MC", options: ["Tak", "Nie", "Tylko na kodzie czarnym", "Tylko na kodzie czerwonym"], correct: 1 },
  { id: 26, text: "W jakich godzinach możesz robić napady na bank?", type: "KO" },
  { id: 27, text: "Wymień stanowiska z immunitetem formalnym.", type: "KO" },
  { id: 28, text: "Czy funkcjonariusz publiczny może używać broni prywatnej podczas służby?", type: "KO" },
  { id: 29, text: "Czy cywil może posiadać kamizelki 100% i 150%? Uzasadnij swoje zdanie.", type: "KO" },
  { id: 30, text: "Jaki jest warunek dla legalności kastetu?", type: "KO" },
  { id: 31, text: "Czy cywil może posiadać pałkę elektryczną?", type: "MC", options: ["Tak", "Nie", "Tak, jeżeli jest bez nr lub nieużywany"], correct: 1 },
  { id: 32, text: "Czy cywil może mieć defibrylator na numery innej frakcji, gangu, rodzinki lub innej osoby?", type: "KO" },
  { id: 33, text: "Czy cywil może mieć defibrylator na numery jego lub defibrylator bez numerów?", type: "KO" },
  { id: 34, text: "Czy cywil może mieć przy sobie leki?", type: "KO" },
  { id: 35, text: "Ile funkcjonariusz może posiadać narkotyków?", type: "KO" },
  { id: 36, text: "Jaka jest legalna ilość marihuany?", type: "NUM", correct: 20 },
  { id: 37, text: "Jaka jest legalna ilość saszetek z metamfetaminą?", type: "NUM", correct: 0 },
  { id: 38, text: "Jaka jest legalna ilość saszetek z amfetaminą?", type: "NUM", correct: 0 },
  { id: 39, text: "Jaka jest legalna ilość zerwanych krzaków?", type: "NUM", correct: 2 },
  { id: 40, text: "Jaka jest legalna ilość nasion marihuany?", type: "NUM", correct: 0 },
  { id: 41, text: "Kiedy inhalator staje się przedmiotem nielegalnym?", type: "KO" },
  { id: 42, text: "Czy funkcjonariusz może posiadać substancje chemiczne?", type: "MC", options: ["Tak", "Nie"], correct: 1 },
  { id: 43, text: "W jakich przypadkach szczypce, kable, dekodery itp. stają się nielegalne?", type: "KO" },
  { id: 44, text: "Czy wytrych jest legalny?", type: "MC", options: ["Tak", "Nie"], correct: 1 },
  { id: 45, text: "Czy wykrywacz fotoradarów jest legalny?", type: "MC", options: ["Tylko dla cywila", "Tylko dla funkcjonariusza", "Legalny dla wszystkich", "Nielegalny dla każdego"], correct: 3 },
  { id: 46, text: "Czy cywile mogą posiadać zagłuszacze?", type: "MC", options: ["Tak", "Tylko zagłuszacz komunikacji", "Tylko zagłuszacz GPS", "Nie"], correct: 3 },
  { id: 47, text: "Czy funkcjonariusze państwowi mogą posiadać zagłuszacze?", type: "KO" },
  { id: 48, text: "Czy funkcjonariusz może posiadać fałszywe dokumenty?", type: "KO" },
  { id: 49, text: "Ile lat trzeba mieć, żeby można było uzyskać licencję na broń?", type: "NUM", correct: 21 },
  { id: 50, text: "Czy funkcjonariusz może posiadać P.S.S.I.?", type: "MC", options: ["Tak", "Nie"], correct: 1 },
  { id: 51, text: "Czy funkcjonariusz może posiadać latarnie?", type: "MC", options: ["Tak", "Nie"], correct: 0 },
  { id: 52, text: "Czy funkcjonariusz może posiadać trąbkę?", type: "MC", options: ["Tak", "Nie"], correct: 0 },
  { id: 53, text: "Czy funkcjonariusz może posiadać pendrive z kompromitującymi danymi?", type: "MC", options: ["Tak", "Nie"], correct: 1 },
  { id: 54, text: "Co musi uzyskać osoba poszkodowana, żeby sąd uznał oskarżonego za winnego za art. 156 k.k. lub art. 157 k.k.?", type: "KO" },
  { id: 55, text: "Jeżeli zatrzymany obrazi funkcjonariusza gdy został zatrzymany za inne paragrafy lub gdy przyzna się do innego przestępstwa, czy można mu doliczyć te artykuły?", type: "DO" },
  { id: 56, text: "Jaki artykuł kodeksu karnego mówi o konsekwencjach za fałszywe zeznania?", type: "KO" },
  { id: 57, text: "Jaki artykuł z jakiego dokumentu mówi o obowiązku okazania legitymacji przez funkcjonariusza państwowego?", type: "KO" },
  { id: 58, text: "Jaki artykuł z jakiego dokumentu mówi o obowiązku dostarczenia pożywienia zatrzymanemu?", type: "KO" },
  { id: 59, text: "Wymień hierarchię frakcji państwowych.", type: "DO" },
  { id: 60, text: "Przez jaki okres czasu funkcjonariusze państwowi mają obowiązek przechowywania nagrania z kamery nasobnej?", type: "KO" },
  { id: 61, text: "Czy funkcjonariusz ma obowiązek udzielenia pomocy osobie poszkodowanej lub osobie potrzebującej pomocy?", type: "KO" }
];

function getRandomQuestions(count) {
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Przechowywanie wyników quiz'ów
const quizSessions = {};

function generateSessionId() {
  return crypto.randomBytes(16).toString('hex');
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/edit/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  if (!quizSessions[sessionId]) {
    return res.status(404).send('Sesja nie znaleziona');
  }
  res.sendFile(path.join(__dirname, 'public', 'edit.html'));
});

app.get('/result/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  if (!quizSessions[sessionId]) {
    return res.status(404).send('Sesja nie znaleziona');
  }
  res.sendFile(path.join(__dirname, 'public', 'result.html'));
});

app.get('/api/quiz-start', (req, res) => {
  const selectedQuestions = getRandomQuestions(10);
  const sessionQuestions = selectedQuestions.map(q => ({
    id: q.id,
    text: q.text,
    type: q.type,
    options: q.options || undefined,
    correct: q.correct !== undefined ? q.correct : undefined
  }));
  res.json(sessionQuestions);
});

// Dodana trasa kompatybilności: /quiz-start również zwraca listę pytań
app.get('/quiz-start', (req, res) => {
  const selectedQuestions = getRandomQuestions(10);
  const sessionQuestions = selectedQuestions.map(q => ({
    id: q.id,
    text: q.text,
    type: q.type,
    options: q.options || undefined,
    correct: q.correct !== undefined ? q.correct : undefined
  }));
  res.json(sessionQuestions);
});

app.post('/api/submit-quiz', (req, res) => {
  const { answers, questions: quizQuestions } = req.body;
  let score = 0;

  const detailedAnswers = quizQuestions.map((q, index) => {
    const userAnswer = answers[index];
    let isCorrect = false;

    if (q.type === 'MC' && userAnswer === q.correct.toString()) {
      isCorrect = true;
      score++;
    } else if (q.type === 'NUM' && parseInt(userAnswer) === q.correct) {
      isCorrect = true;
      score++;
    } else if ((q.type === 'KO' || q.type === 'DO') && userAnswer && userAnswer.trim()) {
      isCorrect = true;
      score++;
    }

    return {
      questionId: q.id,
      questionText: q.text,
      questionType: q.type,
      userAnswer: userAnswer || '',
      isCorrect: isCorrect,
      points: isCorrect ? 1 : 0,
      options: q.options || undefined,
      correctAnswer: q.correct !== undefined ? q.correct : undefined
    };
  });

  const percentage = Math.round((score / 10) * 100);
  const passed = percentage >= 80;
  const sessionId = generateSessionId();

  quizSessions[sessionId] = {
    answers: detailedAnswers,
    score: score,
    total: 10,
    percentage: percentage,
    passed: passed,
    timestamp: new Date()
  };

  const editLink = `${getBaseUrl(req)}/edit/${sessionId}`;
  const resultLink = `${getBaseUrl(req)}/result/${sessionId}`;

  sendDiscordWebhook(editLink, resultLink, score, percentage);

  res.json({
    score,
    total: 10,
    percentage,
    passed,
    sessionId,
    editLink: `/edit/${sessionId}`,
    resultLink: `/result/${sessionId}`
  });
});

function getBaseUrl(req) {
  return `${req.protocol}://${req.get('host')}`;
}

function sendDiscordWebhook(editLink, resultLink, score, percentage) {
  const embed = {
    title: '📋 Nowy Wynik Egzaminu',
    description: `Wynik: **${score}/10** (${percentage}%)`,
    color: percentage >= 80 ? 0x28a745 : 0xdc3545,
    fields: [
      {
        name: '📝 Edytuj Punkty',
        value: editLink,
        inline: false
      },
      {
        name: '📊 Podsumowanie Wyników',
        value: resultLink,
        inline: false
      }
    ],
    timestamp: new Date().toISOString()
  };

  const payload = JSON.stringify({ embeds: [embed] });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': payload.length
    }
  };

  const req = https.request(DISCORD_WEBHOOK_URL, options, (res) => {
    res.on('data', () => {});
    res.on('end', () => {
      console.log('Discord webhook sent successfully');
    });
  });

  req.on('error', (error) => {
    console.error('Discord webhook error:', error);
  });

  req.write(payload);
  req.end();
}

app.get('/api/quiz-session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = quizSessions[sessionId];
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json(session);
});

app.post('/api/update-points/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const { pointsArray } = req.body;

  const session = quizSessions[sessionId];
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  let newScore = 0;
  session.answers.forEach((answer, index) => {
    const newPoints = Math.max(0, Math.min(1, pointsArray[index] || 0));
    answer.points = newPoints;
    newScore += newPoints;
  });

  session.score = newScore;
  session.percentage = Math.round((newScore / 10) * 100);
  session.passed = session.percentage >= 80;

  res.json({
    score: session.score,
    percentage: session.percentage,
    passed: session.passed
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));