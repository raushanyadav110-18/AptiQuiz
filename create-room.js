
const joinRoomForm = document.getElementById("joinRoomForm");
const playerNameInput = document.getElementById("playerName");
const roomCodeInput = document.getElementById("roomCode");
const joinMessage = document.getElementById("joinMessage");
const joinButton = joinRoomForm.querySelector('button[type="submit"]');

// Keep the room code uppercase while typing.
roomCodeInput.addEventListener("input", function () {
  roomCodeInput.value = roomCodeInput.value
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 6)
    .toUpperCase();
});

joinRoomForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const playerName = playerNameInput.value.trim();
  const roomCode = roomCodeInput.value.trim().toUpperCase();

  if (playerName.length < 2 || playerName.length > 30) {
    joinMessage.style.color = "#ff9baf";
    joinMessage.textContent =
      "Please enter a name between 2 and 30 characters.";
    playerNameInput.focus();
    return;
  }

  if (!/^[A-Z0-9]{6}$/.test(roomCode)) {
    joinMessage.style.color = "#ff9baf";
    joinMessage.textContent =
      "Room code must contain exactly 6 letters or numbers.";
    roomCodeInput.focus();
    return;
  }

  joinButton.disabled = true;
  joinButton.textContent = "Joining room...";
  joinMessage.style.color = "#c5baff";
  joinMessage.textContent = "Connecting to AptiQuiz server...";

  try {
    const response = await fetch(
      `http://localhost:3000/api/rooms/${encodeURIComponent(roomCode)}/join`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ playerName })
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Unable to join this room.");
    }

    // Save the confirmed backend response.
    sessionStorage.setItem("aptiJoinPlayerName", result.playerName);
    sessionStorage.setItem("aptiJoinRoomCode", result.roomCode);
    sessionStorage.setItem("aptiPlayerId", result.playerId);

    // Preserve these details for the next page.
    const settings = JSON.parse(
      sessionStorage.getItem("aptiRoomSettings") || "{}"
    );
    settings.roomCode = result.roomCode;
    sessionStorage.setItem("aptiRoomSettings", JSON.stringify(settings));

    joinMessage.style.color = "#8ff0bd";
    joinMessage.textContent =
      `Successfully joined room ${result.roomCode}! Opening lobby...`;

    // Open the existing waiting lobby.
    setTimeout(() => {
      window.location.href =
        "waiting-room.html?roomCode=" +
        encodeURIComponent(result.roomCode);
    }, 700);

  } catch (error) {
    console.error("Join room error:", error);

    joinMessage.style.color = "#ff9baf";
    joinMessage.textContent =
      error.message === "Failed to fetch"
        ? "Cannot connect to server. Check that the backend is running."
        : error.message;

  } finally {
    joinButton.disabled = false;
    joinButton.textContent = "Join Quiz Room  →";
  }
});
