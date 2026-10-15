
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const crypto = require("crypto");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: [
    "http://127.0.0.1:5500",
    "http://localhost:5500"
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.use(express.json());

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccountPath = path.join(
    __dirname,
    "serviceAccountKey.json"
  );

  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL:
      "https://aptiquiz-63d21-default-rtdb.asia-southeast1.firebasedatabase.app"
  });
}

const db = admin.database();
const roomsRef = db.ref("rooms");

// Generate a unique 6-character room code.
function generateRoomCode() {
  return crypto
    .randomBytes(4)
    .toString("hex")
    .slice(0, 6)
    .toUpperCase();
}

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AptiQuiz backend running at http://localhost:3000"
  });
});

// Firebase connection test
app.get("/api/firebase-test", async (req, res) => {
  try {
    await db.ref(".info/connected").once("value");

    res.json({
      success: true,
      message: "Firebase Admin initialized successfully"
    });
  } catch (error) {
    console.error("Firebase test error:", error);

    res.status(500).json({
      success: false,
      message: "Firebase connection test failed"
    });
  }
});

// Create a room
app.post("/api/rooms", async (req, res) => {
  try {
    const {
      hostName,
      quizTitle,
      topic,
      questionCount,
      questionTime
    } = req.body;

    if (
      typeof hostName !== "string" ||
      !hostName.trim() ||
      typeof quizTitle !== "string" ||
      !quizTitle.trim() ||
      typeof topic !== "string" ||
      !topic.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Host name, quiz title and topic are required."
      });
    }

    const count = Number(questionCount);
    const time = Number(questionTime);

    if (
      !Number.isInteger(count) ||
      count < 1 ||
      count > 50 ||
      !Number.isInteger(time) ||
      time < 5 ||
      time > 120
    ) {
      return res.status(400).json({
        success: false,
        message: "Question count must be 1-50 and time must be 5-120 seconds."
      });
    }

    let roomCode;
    let roomRef;
    let created = false;

    for (let attempt = 0; attempt < 10; attempt++) {
      roomCode = generateRoomCode();
      roomRef = roomsRef.child(roomCode);

      const result = await roomRef.transaction(
        currentData => {
          if (currentData !== null) {
            return;
          }

          return {
            roomCode,
            hostName: hostName.trim(),
            quizTitle: quizTitle.trim(),
            topic: topic.trim(),
            questionCount: count,
            questionTime: time,
            status: "waiting",
            players: {},
            createdAt: admin.database.ServerValue.TIMESTAMP
          };
        },
        undefined,
        false
      );

      if (result.committed) {
        created = true;
        break;
      }
    }

    if (!created) {
      return res.status(500).json({
        success: false,
        message: "Could not generate a unique room code. Try again."
      });
    }

    return res.status(201).json({
      success: true,
      roomCode
    });
  } catch (error) {
    console.error("Create room error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not create room."
    });
  }
});

// Join an existing room
app.post("/api/rooms/:roomCode/join", async (req, res) => {
  try {
    const roomCode = String(req.params.roomCode || "")
      .trim()
      .toUpperCase();

    const playerName =
      typeof req.body.playerName === "string"
        ? req.body.playerName.trim()
        : "";

    if (!/^[A-F0-9]{6}$/.test(roomCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room code."
      });
    }

    if (playerName.length < 2 || playerName.length > 30) {
      return res.status(400).json({
        success: false,
        message: "Player name must be 2-30 characters."
      });
    }

    const roomRef = roomsRef.child(roomCode);
    const snapshot = await roomRef.get();

    if (!snapshot.exists()) {
      return res.status(404).json({
        success: false,
        message: "Room not found. Check the room code."
      });
    }

    const room = snapshot.val();

    if (room.status !== "waiting") {
      return res.status(409).json({
        success: false,
        message: "This room is no longer accepting players."
      });
    }

    const players = room.players || {};
    const playerNames = Object.values(players).map(player =>
      String(player.playerName || "").toLowerCase()
    );

    if (playerNames.includes(playerName.toLowerCase())) {
      return res.status(409).json({
        success: false,
        message: "This player name is already in the room."
      });
    }

    if (Object.keys(players).length >= 50) {
      return res.status(409).json({
        success: false,
        message: "This room is full."
      });
    }

    const playerRef = roomRef.child("players").push();
    const playerId = playerRef.key;

    await playerRef.set({
      playerId,
      playerName,
      joinedAt: admin.database.ServerValue.TIMESTAMP,
      score: 0
    });

    return res.json({
      success: true,
      roomCode,
      playerId,
      playerName,
      message: "Joined room successfully."
    });
  } catch (error) {
    console.error("Join room error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not join room. Please try again."
    });
  }
});

// Handle invalid routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found."
  });
});

// General error handler
app.use((error, req, res, next) => {
  console.error("Server error:", error);

  if (res.headersSent) {
    return next(error);
  }

  res.status(500).json({
    success: false,
    message: "Internal server error."
  });
});

app.listen(PORT, () => {
  console.log(`AptiQuiz backend running at http://localhost:${PORT}`);
});
