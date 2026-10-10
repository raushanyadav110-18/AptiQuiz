
const roomForm = document.getElementById("roomForm");
const roomMessage = document.getElementById("roomMessage");
const settingsPreview = document.getElementById("settingsPreview");

roomForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const hostName = document.getElementById("hostName").value.trim();
  const quizTitle = document.getElementById("quizTitle").value.trim();
  const topic = document.getElementById("topic").value;
  const questionCount = Number(
    document.getElementById("questionCount").value
  );
  const questionTime = Number(
    document.getElementById("questionTime").value
  );

  if (!hostName || !quizTitle) {
    roomMessage.textContent = "Please fill in all required fields.";
    return;
  }

  const settings = {
    hostName,
    quizTitle,
    topic,
    questionCount,
    questionTime
  };

  sessionStorage.setItem("aptiRoomSettings", JSON.stringify(settings));

  roomMessage.textContent = "Quiz settings saved successfully!";

  settingsPreview.replaceChildren();
  settingsPreview.hidden = false;

  const heading = document.createElement("h3");
  heading.textContent = "Your Quiz Configuration";
  settingsPreview.appendChild(heading);

  const details = [
    "Host: " + hostName,
    "Quiz: " + quizTitle,
    "Topic: " + topic,
    "Questions: " + questionCount,
    "Time per question: " + questionTime + " seconds",
    "Maximum quiz time: " + questionCount * questionTime + " seconds"
  ];

  const list = document.createElement("ul");

  details.forEach(function (detail) {
    const item = document.createElement("li");
    item.textContent = detail;
    list.appendChild(item);
  });

  settingsPreview.appendChild(list);

  // Continue to the waiting lobby after saving the settings.
  roomMessage.textContent = "Settings saved! Opening your lobby...";

  window.location.href = "waiting-room.html";
});
