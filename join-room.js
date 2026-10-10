
const joinRoomForm = document.getElementById("joinRoomForm");
const playerNameInput = document.getElementById("playerName");
const roomCodeInput = document.getElementById("roomCode");
const joinMessage = document.getElementById("joinMessage");

// Keep the room code uppercase while typing.
roomCodeInput.addEventListener("input", function () {
  roomCodeInput.value = roomCodeInput.value
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 6)
    .toUpperCase();
});

joinRoomForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const playerName = playerNameInput.value.trim();
  const roomCode = roomCodeInput.value.trim().toUpperCase();

  if (playerName.length < 2) {
    joinMessage.style.color = "#ff9baf";
    joinMessage.textContent =
      "Please enter a name with at least 2 characters.";
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

  // Save details for later backend integration.
  sessionStorage.setItem("aptiJoinPlayerName", playerName);
  sessionStorage.setItem("aptiJoinRoomCode", roomCode);

  joinMessage.style.color = "#c5baff";
  joinMessage.textContent =
    "Details validated! Real room joining will work after the multiplayer backend is connected.";
});

