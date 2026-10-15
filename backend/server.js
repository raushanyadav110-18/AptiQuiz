
const joinRoomForm = document.getElementById("joinRoomForm");
const playerNameInput = document.getElementById("playerName");
const roomCodeInput = document.getElementById("roomCode");
const joinMessage = document.getElementById("joinMessage");
const joinButton = joinRoomForm.querySelector('button[type="submit"]');

// Keep room code uppercase.
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

  if (playerName.length < 2) {
    joinMessage.textContent =
      "Please enter a name with at least 2 characters.";
    return;
  }

  if (!/^[A-Z0-9]{6}$/.test(roomCode)) {
    joinMessage.textContent =
      "Room code must contain exactly 6 letters or numbers.";
    return;
  }

  joinButton.disabled = true;
  joinMessage.style.color = "#c5baff";
  joinMessage.textContent = "Joining room...";

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
      throw new Error(result.message || "Could not join room.");
    }

    sessionStorage.setItem("aptiJoinPlayerName", playerName);
    sessionStorage.setItem("aptiJoinRoomCode", roomCode);
    sessionStorage.setItem("aptiPlayerId", result.playerId);

    joinMessage.style.color = "#86efac";
    joinMessage.textContent = "Room joined successfully!";

    window.location.href =
      "waiting-room.html?roomCode=" + encodeURIComponent(roomCode);

  } catch (error) {
    console.error("Join room error:", error);

    joinMessage.style.color = "#ff9baf";
    joinMessage.textContent =
      error.message === "Failed to fetch"
        ? "Cannot connect to backend. Check that the server is running."
        : error.message;

  } finally {
    joinButton.disabled = false;
  }
});
