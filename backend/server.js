
const express = require("express");
const cors = require("cors");
const { initializeApp, cert } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// Firebase configuration
const serviceAccount = require("./serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
  databaseURL:
    "https://aptiquiz-63d21-default-rtdb.asia-southeast1.firebasedatabase.app",
});

const db = getDatabase();

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "AptiQuiz Backend is running!",
    status: "success",
  });
});

// Firebase connection test
app.get("/api/firebase-test", async (req, res) => {
  try {
    await db.ref("/").get();

    res.json({
      message: "Firebase connected successfully!",
      status: "success",
    });
  } catch (error) {
    console.error("Firebase connection failed:", error.message);

    res.status(500).json({
      message: "Firebase connection failed",
      status: "error",
    });
  }
});

// Start server

 // Create a new quiz room
app.post("/api/rooms", async (req, res) => {
  try {
    const { hostName } = req.body;

    if (!hostName || !hostName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Host name is required",
      });
    }

    let roomCode;
    let roomRef;
    let exists = true;

    // Generate a unique 6-character room code
    while (exists) {
      roomCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      roomRef = db.ref(`rooms/${roomCode}`);
      const snapshot = await roomRef.get();
      exists = snapshot.exists();
    }

    // Save room in Firebase
    await roomRef.set({
      roomCode,
      hostName: hostName.trim(),
      status: "waiting",
      players: {},
      createdAt: Date.now(),
    });

    return res.status(201).json({
      success: true,
      roomCode,
      message: "Room created successfully",
    });
  } catch (error) {
    console.error("Create room error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not create room",
    });
  }
});


app.post("/api/rooms/:roomCode/join", async (req, res) => {
  try {
    const roomCode = req.params.roomCode.trim().toUpperCase();
    const { playerName } = req.body;

    if (
      typeof playerName !== "string" ||
      !playerName.trim() ||
      playerName.trim().length > 30
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a player name (1–30 characters)",
      });
    }

    const roomRef = db.ref(`rooms/${roomCode}`);
    const roomSnapshot = await roomRef.get();

    if (!roomSnapshot.exists()) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const room = roomSnapshot.val();

    if (room.status !== "waiting") {
      return res.status(400).json({
        success: false,
        message: "Room is not accepting players",
      });
    }

    const players = room.players || {};

    if (Object.keys(players).length >= 50) {
      return res.status(400).json({
        success: false,
        message: "Room is full",
      });
    }

    const normalizedName = playerName.trim().toLowerCase();

    const duplicate = Object.values(players).some(
      (player) =>
        player.name.trim().toLowerCase() === normalizedName
    );

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "This player name is already taken",
      });
    }

    const playerRef = roomRef.child("players").push();

    await playerRef.set({
      name: playerName.trim(),
      score: 0,
      correct: 0,
      wrong: 0,
      unanswered: 0,
      joinedAt: Date.now(),
    });

    return res.status(201).json({
      success: true,
      roomCode,
      playerId: playerRef.key,
      playerName: playerName.trim(),
      message: "Joined room successfully",
    });
  } catch (error) {
    console.error("Join room error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not join room",
    });
  }
});
app.listen(PORT, () => {
  console.log(`AptiQuiz backend running at http://localhost:${PORT}`);
});