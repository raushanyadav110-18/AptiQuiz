
const codeDisplay = document.getElementById("roomCodeDisplay");
const copyCodeBtn = document.getElementById("copyCodeBtn");
const startQuizBtn = document.getElementById("startQuizBtn");
const lobbyMessage = document.getElementById("lobbyMessage");

// Load quiz settings if the host has configured them.
try {
  const savedSettings = sessionStorage.getItem("aptiRoomSettings");

  if (savedSettings) {
    const settings = JSON.parse(savedSettings);

    document.getElementById("quizTitle").textContent =
      settings.quizTitle || "VLSI Challenge";

    document.getElementById("quizTopic").textContent =
      settings.topic || "CMOS";

    document.getElementById("questionCount").textContent =
      settings.questionCount || 10;

    document.getElementById("questionTime").textContent =
      (settings.questionTime || 15) + " sec";

    const hostName = settings.hostName;

    if (hostName) {
      const firstPlayer = document.querySelector(".player-row .player-name");

      if (firstPlayer) {
        firstPlayer.textContent = hostName;
        const avatar = firstPlayer.closest(".player-row")
          .querySelector(".avatar");

        avatar.textContent = hostName.charAt(0).toUpperCase();
      }
    }
  }
} catch (error) {
  console.error("Could not load saved quiz settings.", error);
}

// Copy the demo room code.
copyCodeBtn.addEventListener("click", async function () {
  try {
    await navigator.clipboard.writeText(codeDisplay.textContent.trim());
    copyCodeBtn.textContent = "Copied ✓";
  } catch {
    lobbyMessage.textContent =
      "Copy was unavailable. Please select and copy the room code manually.";
  }
});

// The real quiz will start after backend integration.
startQuizBtn.addEventListener("click", function () {
  lobbyMessage.textContent =
    "Preview only: live rooms, player synchronization and quiz start " +
    "will be enabled when the backend is connected.";
});
