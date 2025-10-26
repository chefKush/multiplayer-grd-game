import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Types
interface GridCell {
  character: string;
  playerId: string;
  playerName: string;
  timestamp: number;
}

interface GridUpdate {
  row: number;
  col: number;
  character: string;
  playerId: string;
  playerName: string;
  timestamp: number;
}

interface Player {
  id: string;
  name: string;
  lastUpdateTime: number | null;
  socketId: string;
}

// In-memory state
const grid: (GridCell | null)[][] = Array(10)
  .fill(null)
  .map(() => Array(10).fill(null));
const players: Map<string, Player> = new Map();
const updateHistory: GridUpdate[] = [];

// Helper: Check if player can update
const canPlayerUpdate = (
  playerId: string
): { canUpdate: boolean; timeLeft: number } => {
  const player = players.get(playerId);
  if (!player || !player.lastUpdateTime) {
    return { canUpdate: true, timeLeft: 0 };
  }

  const timeSinceLastUpdate = Date.now() - player.lastUpdateTime;
  const cooldownTime = 60000; // 1 minute in milliseconds

  if (timeSinceLastUpdate >= cooldownTime) {
    return { canUpdate: true, timeLeft: 0 };
  }

  return {
    canUpdate: false,
    timeLeft: Math.ceil((cooldownTime - timeSinceLastUpdate) / 1000),
  };
};

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // Handle player join
  socket.on("join", (playerName: string) => {
    const playerId = socket.id;
    players.set(playerId, {
      id: playerId,
      name: playerName || `Player_${players.size + 1}`,
      lastUpdateTime: null,
      socketId: socket.id,
    });

    // Send initial state to the new player
    socket.emit("initial-state", {
      grid,
      playerId,
      playerName: players.get(playerId)?.name,
    });

    // Broadcast updated player count
    io.emit("players-count", players.size);

    console.log(
      `Player joined: ${players.get(playerId)?.name} (Total: ${players.size})`
    );
  });

  // Handle grid updates
  socket.on(
    "update-cell",
    ({
      row,
      col,
      character,
    }: {
      row: number;
      col: number;
      character: string;
    }) => {
      const playerId = socket.id;
      const player = players.get(playerId);

      if (!player) {
        socket.emit("error", { message: "Player not found" });
        return;
      }

      // Check cooldown
      const { canUpdate, timeLeft } = canPlayerUpdate(playerId);
      if (!canUpdate) {
        socket.emit("error", {
          message: `You must wait ${timeLeft} seconds before updating again`,
          timeLeft,
        });
        return;
      }

      // Validate input
      if (row < 0 || row >= 10 || col < 0 || col >= 10) {
        socket.emit("error", { message: "Invalid cell position" });
        return;
      }

      if (!character || character.length > 2) {
        socket.emit("error", {
          message: "Please enter a valid Unicode character (max 2 chars)",
        });
        return;
      }

      // Update grid
      const timestamp = Date.now();
      grid[row][col] = {
        character,
        playerId,
        playerName: player.name,
        timestamp,
      };

      // Update player's last update time
      player.lastUpdateTime = timestamp;

      // Add to history
      updateHistory.push({
        row,
        col,
        character,
        playerId,
        playerName: player.name,
        timestamp,
      });

      // Broadcast update to all clients
      io.emit("cell-updated", {
        row,
        col,
        cell: grid[row][col],
      });

      // Send cooldown info to the player
      socket.emit("cooldown-started", { cooldownTime: 60 });

      console.log(
        `Cell updated by ${player.name}: (${row}, ${col}) = ${character}`
      );
    }
  );

  // Handle history request
  socket.on("get-history", (timestamp?: number) => {
    let historyData = updateHistory;

    if (timestamp) {
      // Get state at specific timestamp
      const gridAtTime: (GridCell | null)[][] = Array(10)
        .fill(null)
        .map(() => Array(10).fill(null));

      updateHistory
        .filter((update) => update.timestamp <= timestamp)
        .forEach((update) => {
          gridAtTime[update.row][update.col] = {
            character: update.character,
            playerId: update.playerId,
            playerName: update.playerName,
            timestamp: update.timestamp,
          };
        });

      socket.emit("history-state", { grid: gridAtTime, timestamp });
    } else {
      // Send full history
      socket.emit("full-history", historyData);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    players.delete(socket.id);
    io.emit("players-count", players.size);
    console.log(`Client disconnected: ${socket.id} (Total: ${players.size})`);
  });

  // Handle check cooldown
  socket.on("check-cooldown", () => {
    const { canUpdate, timeLeft } = canPlayerUpdate(socket.id);
    socket.emit("cooldown-status", { canUpdate, timeLeft });
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    players: players.size,
    updates: updateHistory.length,
  });
});

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server ready`);
});
