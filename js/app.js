const $ = (id) => document.getElementById(id);

const screens = {
  home: $("home-screen"),
  quiz: $("quiz-screen"),
  result: $("result-screen")
};

let questions = [];
let currentIndex = 0;
let answers = [];
let playerName = "Guest";
let timerId = null;
let timeLeft = 10;
let finished = false;

const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[char]));

function showScreen(name) {
  Object.values(screens).forEach(screen => screen.classList.add("hidden"));
  screens[name].classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateQuestionCount() {
  const category = $("category-select").value;
  const count = category === "All" ? quizQuestions.length :
    quizQuestions.filter(q => q.category === category).length;
  $("question-count").textContent = `${count} questions`;
}
$("category-select").addEventListener("change", updateQuestionCount);

function startQuiz() {
  const category = $("category-select").value;
  playerName = $("player-name").value.trim() || "Guest";
  questions = quizQuestions.filter(q => category === "All" || q.category === category)
    .map(q => ({ ...q, options: [...q.options] }));

  if (!questions.length) {
    alert("No questions are available for this category yet.");
    return;
  }

  // Shuffle question order and option order for a fresh attempt.
  questions = shuffle(questions).map(q => ({ ...q, options: shuffle(q.options) }));
  currentIndex = 0;
  answers = Array(questions.length).fill(null);
  finished = false;
  $("quiz-category-label").textContent = category === "All" ? "ALL TOPICS" : category.toUpperCase();
  showScreen("quiz");
  renderQuestion();
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function renderQuestion() {
  clearInterval(timerId);
  timeLeft = 10;
  updateTimer();
  const q = questions[currentIndex];
  $("question-number").textContent = `QUESTION ${String(currentIndex + 1).padStart(2, "0")}`;
  $("question-text").textContent = q.question;
  $("question-progress").textContent = `Question ${currentIndex + 1} of ${questions.length}`;
  const percent = Math.round(((currentIndex + 1) / questions.length) * 100);
  $("progress-percent").textContent = `${percent}% completed`;
  $("progress-fill").style.width = `${(currentIndex / questions.length) * 100}%`;

  $("options-list").innerHTML = "";
  q.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `option${answers[currentIndex] === option ? " selected" : ""}`;
    button.innerHTML = `<span class="option-letter">${String.fromCharCode(65 + index)}</span><span>${escapeHTML(option)}</span>`;
    button.addEventListener("click", () => selectAnswer(option));
    $("options-list").appendChild(button);
  });

  $("prev-btn").disabled = currentIndex === 0;
  $("next-btn").classList.toggle("hidden", currentIndex === questions.length - 1);
  $("submit-btn").classList.toggle("hidden", currentIndex !== questions.length - 1);
  timerId = setInterval(tickTimer, 1000);
}

function selectAnswer(option) {
  if (finished) return;
  answers[currentIndex] = option;
  document.querySelectorAll(".option").forEach(button => {
    button.classList.toggle("selected", button.textContent.trim().slice(1).trim() === option);
  });
}

function updateTimer() {
  $("timer").textContent = timeLeft;
  $("timer").parentElement.classList.toggle("warning", timeLeft <= 3);
}

function tickTimer() {
  timeLeft -= 1;
  updateTimer();
  if (timeLeft <= 0) {
    clearInterval(timerId);
    if (currentIndex < questions.length - 1) {
      currentIndex += 1;
      renderQuestion();
    } else {
      finishQuiz();
    }
  }
}

function finishQuiz() {
  if (finished) return;
  finished = true;
  clearInterval(timerId);
  const correct = questions.filter((q, i) => answers[i] === q.answer).length;
  const skipped = answers.filter(answer => answer === null).length;
  const wrong = questions.length - correct - skipped;
  const percent = Math.round((correct / questions.length) * 100);

  $("result-title").textContent = percent >= 80 ? `Excellent work, ${playerName}!` :
    percent >= 50 ? `Good effort, ${playerName}!` : `Keep practising, ${playerName}!`;
  $("result-message").textContent = `You answered ${correct} out of ${questions.length} questions correctly.`;
  $("score-value").textContent = `${percent}%`;
  $("score-circle").style.background = `conic-gradient(var(--purple) ${percent * 3.6}deg, #eeedfa 0deg)`;
  $("result-icon").textContent = percent >= 80 ? "🏆" : percent >= 50 ? "🎯" : "🌱";
  $("correct-count").textContent = correct;
  $("wrong-count").textContent = wrong;
  $("skipped-count").textContent = skipped;

  saveScore({ name: playerName, score: percent, correct, total: questions.length, date: new Date().toLocaleDateString() });
  renderLeaderboard();
  showScreen("result");
}

function saveScore(entry) {
  const scores = JSON.parse(localStorage.getItem("quizifyScores") || "[]");
  scores.push(entry);
  scores.sort((a, b) => b.score - a.score || b.correct - a.correct);
  localStorage.setItem("quizifyScores", JSON.stringify(scores.slice(0, 10)));
}

function renderLeaderboard() {
  const scores = JSON.parse(localStorage.getItem("quizifyScores") || "[]");
  $("leaderboard-list").innerHTML = scores.length ? scores.map((entry, index) =>
    `<div class="leader-row"><span>${index + 1}. ${escapeHTML(entry.name)} <small>· ${escapeHTML(entry.date)}</small></span><span>${entry.score}%</span></div>`
  ).join("") : '<p class="empty-state">No scores saved yet. Complete a quiz to appear here.</p>';
}

function renderReview() {
  $("review-list").innerHTML = questions.map((q, index) => {
    const chosen = answers[index];
    const isCorrect = chosen === q.answer;
    const statusClass = isCorrect ? "correct-text" : "wrong-text";
    const status = isCorrect ? "Correct" : chosen ? "Incorrect" : "Skipped";
    return `<div class="review-item">
      <h4>${index + 1}. ${escapeHTML(q.question)}</h4>
      <p class="${statusClass}">${status} · Your answer: ${escapeHTML(chosen || "No answer")}</p>
      <p>Correct answer: <strong>${escapeHTML(q.answer)}</strong></p>
      <p>${escapeHTML(q.explanation)}</p>
    </div>`;
  }).join("");
  $("review-panel").classList.remove("hidden");
}

$("start-btn").addEventListener("click", startQuiz);
$("prev-btn").addEventListener("click", () => {
  if (currentIndex > 0) { currentIndex -= 1; renderQuestion(); }
});
$("next-btn").addEventListener("click", () => {
  if (currentIndex < questions.length - 1) { currentIndex += 1; renderQuestion(); }
});
$("submit-btn").addEventListener("click", () => {
  const unanswered = answers.filter(answer => answer === null).length;
  if (unanswered && !confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
  finishQuiz();
});
$("retry-btn").addEventListener("click", startQuiz);
$("review-btn").addEventListener("click", renderReview);
$("close-review-btn").addEventListener("click", () => $("review-panel").classList.add("hidden"));
$("clear-scores-btn").addEventListener("click", () => {
  if (confirm("Clear all saved scores from this browser?")) {
    localStorage.removeItem("quizifyScores");
    renderLeaderboard();
  }
});

updateQuestionCount();
renderLeaderboard();
