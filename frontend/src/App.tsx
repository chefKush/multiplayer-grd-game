import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import Grid from "./components/Grid";
import PlayerInfo from "./components/PlayerInfo";
import HistoryViewer from "./components/HistoryViewer";
import type { GridCell } from "./types";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [grid, setGrid] = useState<(GridCell | null)[][]>(
    Array(10)
      .fill(null)
      .map(() => Array(10).fill(null))
  );
  const [playerId, setPlayerId] = useState<string>("");
  const [playerName, setPlayerName] = useState<string>("");
  const [playersOnline, setPlayersOnline] = useState<number>(0);
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [inputChar, setInputChar] = useState<string>("");
  const [cooldownTime, setCooldownTime] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [tempPlayerName, setTempPlayerName] = useState<string>("");
  const [showHistory, setShowHistory] = useState<boolean>(false);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Initial state
    socket.on(
      "initial-state",
      ({ grid: initialGrid, playerId: id, playerName: name }) => {
        setGrid(initialGrid);
        setPlayerId(id);
        setPlayerName(name);
        setIsJoined(true);
      }
    );

    // Players count
    socket.on("players-count", (count: number) => {
      setPlayersOnline(count);
    });

    // Cell updated
    socket.on(
      "cell-updated",
      ({ row, col, cell }: { row: number; col: number; cell: GridCell }) => {
        setGrid((prevGrid) => {
          const newGrid = prevGrid.map((r) => [...r]);
          newGrid[row][col] = cell;
          return newGrid;
        });

        // Clear selection if this was the cell we selected
        if (selectedCell?.row === row && selectedCell?.col === col) {
          setSelectedCell(null);
          setInputChar("");
        }
      }
    );

    // Cooldown started
    socket.on(
      "cooldown-started",
      ({ cooldownTime: time }: { cooldownTime: number }) => {
        setCooldownTime(time);
      }
    );

    // Cooldown status
    socket.on(
      "cooldown-status",
      ({ canUpdate, timeLeft }: { canUpdate: boolean; timeLeft: number }) => {
        if (!canUpdate) {
          setCooldownTime(timeLeft);
        } else {
          setCooldownTime(0);
        }
      }
    );

    // Error
    socket.on(
      "error",
      ({ message, timeLeft }: { message: string; timeLeft?: number }) => {
        setError(message);
        if (timeLeft) {
          setCooldownTime(timeLeft);
        }
        setTimeout(() => setError(""), 3000);
      }
    );

    return () => {
      socket.off("initial-state");
      socket.off("players-count");
      socket.off("cell-updated");
      socket.off("cooldown-started");
      socket.off("cooldown-status");
      socket.off("error");
    };
  }, [socket, selectedCell]);

  // Cooldown timer
  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [cooldownTime]);

  // Check cooldown on mount if already joined
  useEffect(() => {
    if (socket && isJoined) {
      socket.emit("check-cooldown");
    }
  }, [socket, isJoined]);

  const handleJoin = () => {
    if (!socket || !tempPlayerName.trim()) {
      setError("Please enter your name");
      setTimeout(() => setError(""), 3000);
      return;
    }
    socket.emit("join", tempPlayerName.trim());
  };

  const handleCellClick = (row: number, col: number) => {
    if (cooldownTime > 0) {
      setError(`Please wait ${cooldownTime} seconds before updating`);
      setTimeout(() => setError(""), 3000);
      return;
    }
    setSelectedCell({ row, col });
    setInputChar("");
  };

  const handleSubmit = () => {
    if (!socket || !selectedCell || !inputChar.trim()) {
      setError("Please select a cell and enter a character");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (cooldownTime > 0) {
      setError(`Please wait ${cooldownTime} seconds before updating`);
      setTimeout(() => setError(""), 3000);
      return;
    }

    socket.emit("update-cell", {
      row: selectedCell.row,
      col: selectedCell.col,
      character: inputChar.trim(),
    });
  };

  const handleCancel = () => {
    setSelectedCell(null);
    setInputChar("");
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            🎮 Multiplayer Grid
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            Join the game and claim your blocks!
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Your Name
              </label>
              <input
                type="text"
                value={tempPlayerName}
                onChange={(e) => setTempPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleJoin()}
                placeholder="Player Name"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition"
                maxLength={20}
              />
            </div>

            <button
              onClick={handleJoin}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition transform hover:scale-105 active:scale-95"
            >
              Join Game
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                🎮 Multiplayer Grid Game
              </h1>
              <p className="text-gray-600 mt-1">
                Select a block and add your Unicode character!
              </p>
            </div>
            <PlayerInfo
              playerName={playerName}
              playersOnline={playersOnline}
              cooldownTime={cooldownTime}
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow animate-pulse">
            <p className="font-medium">⚠️ {error}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Grid */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <Grid
                grid={grid}
                selectedCell={selectedCell}
                onCellClick={handleCellClick}
                playerId={playerId}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Input Panel */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                ✏️ Update Cell
              </h2>

              {selectedCell ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Selected: Row {selectedCell.row + 1}, Col{" "}
                      {selectedCell.col + 1}
                    </p>
                    <input
                      type="text"
                      value={inputChar}
                      onChange={(e) => setInputChar(e.target.value.slice(0, 2))}
                      placeholder="Enter character (e.g., 😊, ♥, A)"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition text-2xl text-center"
                      maxLength={2}
                      disabled={cooldownTime > 0}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Unicode characters, emojis, or letters (max 2 chars)
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSubmit}
                      disabled={cooldownTime > 0 || !inputChar.trim()}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition"
                    >
                      {cooldownTime > 0 ? `Wait ${cooldownTime}s` : "Submit"}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-6 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Click on a cell to select it
                </p>
              )}
            </div>

            {/* History Button */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition"
              >
                {showHistory ? "🎮 Back to Game" : "📜 View History"}
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3">
                📋 How to Play
              </h2>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2">1️⃣</span>
                  Click any cell on the grid
                </li>
                <li className="flex items-start">
                  <span className="mr-2">2️⃣</span>
                  Enter a Unicode character or emoji
                </li>
                <li className="flex items-start">
                  <span className="mr-2">3️⃣</span>
                  Click Submit to update the grid
                </li>
                <li className="flex items-start">
                  <span className="mr-2">⏱️</span>
                  Wait 1 minute before next update
                </li>
                <li className="flex items-start">
                  <span className="mr-2">👥</span>
                  All players share the same grid!
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* History Viewer */}
        {showHistory && socket && (
          <div className="mt-6">
            <HistoryViewer socket={socket} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
