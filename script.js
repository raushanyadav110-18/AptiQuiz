
const panel = document.getElementById("panel");
const panelTitle = document.getElementById("panelTitle");
const panelText = document.getElementById("panelText");
const setupForm = document.getElementById("setupForm");
const roomField = document.getElementById("roomField");
const topicField = document.getElementById("topicField");
const roomCode = document.getElementById("roomCode");
const message = document.getElementById("message");

let currentMode = "";

function openPanel(mode) {
  currentMode = mode;
  panel.hidden = false;
  message.textContent = "";
  setupForm.reset();

  roomField.hidden = mode !== "join";
  topicField.hidden = mode !== "practice";

  if (mode === "host") {
    panelTitle.textContent = "Host a Quiz";
    panelText.textContent = "Set up your quiz room.";
  } else if (mode === "join") {
    panelTitle.textContent = "Join a Room";
    panelText.textContent = "Enter your name and room code.";
  } else {
    panelTitle.textContent = "Quick Practice";
    panelText.textContent = "Practise aptitude questions on your own.";
  }

  panel.scrollIntoView({ behavior: "smooth", block: "center" });
}


document.getElementById("hostBtn").onclick = () => {
  window.location.href = "create-room.html";
};


document.getElementById("joinBtn").onclick =
  () => openPanel("join");

document.getElementById("practiceBtn").onclick =
  () => openPanel("practice");

setupForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = document.getElementById("playerName").value.trim();

  if (!name) {
    message.textContent = "Please enter your name.";
    return;
  }

  if (currentMode === "host") {
    const code = Math.random().toString(36)
      .slice(2, 8).toUpperCase();

    message.textContent =
      `Demo room code: ${code}. Multiplayer hosting will be connected next.`;

  } else if (currentMode === "join") {
    const code = roomCode.value.trim().toUpperCase();

    if (!/^[A-Z0-9]{6}$/.test(code)) {
      message.textContent =
        "Enter a valid 6-character room code.";
      return;
    }

    message.textContent =
      `Welcome, ${name}! Room ${code} entered in demo mode.`;

  } else {
    const topic = document.getElementById("topic").value;

    sessionStorage.setItem("aptiQuizName", name);
    sessionStorage.setItem("aptiQuizTopic", topic);

    window.location.href = "quiz.html";
  }
});
