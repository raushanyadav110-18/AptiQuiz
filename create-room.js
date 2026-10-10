
const roomForm = document.getElementById("roomForm");
const roomMessage = document.getElementById("roomMessage");
const settingsPreview = document.getElementById("settingsPreview");

roomForm.addEventListener("submit", async function (event) {
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

  if (!hostName || !quizTitle || !topic) {
    roomMessage.textContent = "Please fill in all required fields.";
    return;
  }

  roomMessage.textContent = "Creating your quiz room...";

  try {
    const response = await fetch("http://localhost:3000/api/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        hostName,
        quizTitle,
        topic,
        questionCount,
        questionTime
      })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Could not create room.");
    }

    const settings = {
      hostName,
      quizTitle,
      topic,
      questionCount,
      questionTime,
      roomCode: result.roomCode
    };

    sessionStorage.setItem("aptiRoomSettings", JSON.stringify(settings));
    sessionStorage.setItem("aptiRoomCode", result.roomCode);

    roomMessage.textContent =
      "Room created! Code: " + result.roomCode;

    if (settingsPreview) {
      settingsPreview.hidden = false;
      settingsPreview.textContent =
        "Your room code is: " + result.roomCode;
    }

    window.location.href =
      "waiting-room.html?roomCode=" +
      encodeURIComponent(result.roomCode);

  } catch (error) {
    console.error("Create room error:", error);
    roomMessage.textContent =
      error.message === "Failed to fetch"
        ? "Cannot connect to backend. Check that the server is running."
        : error.message;
  }
});
