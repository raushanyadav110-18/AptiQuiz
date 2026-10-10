
const questions = [
  {
    topic: "Quantitative Aptitude",
    question: "What is 15% of 200?",
    options: ["15", "20", "30", "35"],
    answer: 2
  },
  {
    topic: "Logical Reasoning",
    question: "Find the next number: 2, 4, 8, 16, __",
    options: ["18", "24", "30", "32"],
    answer: 3
  },
  {
    topic: "Quantitative Aptitude",
    question: "If 5 pens cost ₹50, what is the cost of 8 pens?",
    options: ["₹60", "₹70", "₹80", "₹100"],
    answer: 2
  },
  {
    topic: "Logical Reasoning",
    question: "Which number does not belong: 4, 9, 16, 20, 25?",
    options: ["9", "16", "20", "25"],
    answer: 2
  },
  {
    topic: "Verbal Ability",
    question: "Choose the synonym of 'Rapid'.",
    options: ["Slow", "Fast", "Weak", "Late"],
    answer: 1
  }
];

let current = 0;
let score = 0;
let timeLeft = 15;
let timerId = null;
let answered = false;

const $ = id => document.getElementById(id);

const topic = sessionStorage.getItem("aptiQuizTopic")
  || "Quantitative Aptitude";

$("quizTitle").innerHTML = "Test Your <span>Brain.</span>";

function showQuestion() {
  clearInterval(timerId);
  answered = false;
  timeLeft = 15;

  const q = questions[current];

  $("quizPanel").hidden = false;
  $("resultPanel").hidden = true;
  $("progress").textContent =
    `Question ${current + 1} / ${questions.length}`;
  $("timer").textContent = timeLeft;
  $("topicLabel").textContent = q.topic;
  $("question").textContent = q.question;
  $("feedback").textContent = "";
  $("nextBtn").hidden = true;
  $("progressBar").style.width =
    `${((current + 1) / questions.length) * 100}%`;

  $("options").replaceChildren();

  q.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "submit-btn";
    button.style.marginTop = "0";
    button.style.textAlign = "left";
    button.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
    button.addEventListener("click", () => selectAnswer(index));
    $("options").appendChild(button);
  });

  timerId = setInterval(() => {
    timeLeft--;
    $("timer").textContent = timeLeft;

    if (timeLeft <= 0) {
      finishQuestion(null);
    }
  }, 1000);
}

function selectAnswer(index) {
  if (answered) return;
  finishQuestion(index);
}

function finishQuestion(selected) {
  if (answered) return;
  answered = true;
  clearInterval(timerId);

  const q = questions[current];
  const buttons = $("options").querySelectorAll("button");

  buttons.forEach(button => button.disabled = true);

  if (selected === q.answer) {
    score++;
    $("feedback").textContent = "Correct answer! Well done.";
  } else if (selected === null) {
    $("feedback").textContent =
      `Time's up! Correct answer: ${q.options[q.answer]}`;
  } else {
    $("feedback").textContent =
      `Not quite. Correct answer: ${q.options[q.answer]}`;
  }

  buttons[q.answer].style.background = "#176b4d";

  if (selected !== null && selected !== q.answer) {
    buttons[selected].style.background = "#7b303b";
  }

  $("nextBtn").textContent =
    current === questions.length - 1 ? "See Results →" : "Next Question →";
  $("nextBtn").hidden = false;
}

$("nextBtn").addEventListener("click", () => {
  current++;

  if (current < questions.length) {
    showQuestion();
  } else {
    showResults();
  }
});

function showResults() {
  clearInterval(timerId);
  $("quizPanel").hidden = true;
  $("resultPanel").hidden = false;

  $("finalScore").textContent =
    `Your score: ${score} / ${questions.length}`;

  $("finalMessage").textContent =
    `Accuracy: ${Math.round(score / questions.length * 100)}%. Keep practising!`;
}

$("restartBtn").addEventListener("click", () => {
  current = 0;
  score = 0;
  showQuestion();
});

showQuestion();

