import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import type { GridCell } from "../types";

interface HistoryUpdate {
  row: number;
  col: number;
  character: string;
  playerId: string;
  playerName: string;
  timestamp: number;
}

interface HistoryViewerProps {
  socket: Socket;
}

const HistoryViewer = ({ socket }: HistoryViewerProps) => {
  const [history, setHistory] = useState<HistoryUpdate[]>([]);
  const [selectedTimestamp, setSelectedTimestamp] = useState<number | null>(
    null
  );
  const [historicalGrid, setHistoricalGrid] = useState<
    (GridCell | null)[][] | null
  >(null);
  const [groupedHistory, setGroupedHistory] = useState<
    Map<number, HistoryUpdate[]>
  >(new Map());

  useEffect(() => {
    // Request full history
    socket.emit("get-history");

    // Listen for history data
    socket.on("full-history", (historyData: HistoryUpdate[]) => {
      setHistory(historyData);

      // Group updates by second
      const grouped = new Map<number, HistoryUpdate[]>();
      historyData.forEach((update) => {
        const secondTimestamp = Math.floor(update.timestamp / 1000) * 1000;
        if (!grouped.has(secondTimestamp)) {
          grouped.set(secondTimestamp, []);
        }
        grouped.get(secondTimestamp)!.push(update);
      });
      setGroupedHistory(grouped);
    });

    socket.on(
      "history-state",
      ({
        grid,
        timestamp,
      }: {
        grid: (GridCell | null)[][];
        timestamp: number;
      }) => {
        setHistoricalGrid(grid);
        setSelectedTimestamp(timestamp);
      }
    );

    return () => {
      socket.off("full-history");
      socket.off("history-state");
    };
  }, [socket]);

  const handleViewAtTime = (timestamp: number) => {
    socket.emit("get-history", timestamp);
  };

  const handleClearView = () => {
    setSelectedTimestamp(null);
    setHistoricalGrid(null);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📜 Update History</h2>
        {selectedTimestamp && (
          <button
            onClick={handleClearView}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg font-medium transition"
          >
            Back to Current
          </button>
        )}
      </div>

      {/* Historical Grid View */}
      {historicalGrid && (
        <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-xl">
          <p className="text-yellow-800 font-medium mb-3">
            🕐 Viewing grid at: {formatDate(selectedTimestamp!)}
          </p>
          <div className="grid grid-cols-10 gap-1">
            {historicalGrid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`hist-${rowIndex}-${colIndex}`}
                  className="aspect-square bg-white border border-gray-300 rounded flex items-center justify-center text-xl"
                  title={
                    cell ? `${cell.character} by ${cell.playerName}` : "Empty"
                  }
                >
                  {cell?.character || ""}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Grouped History Timeline */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {history.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No updates yet. Be the first to update a cell!
          </p>
        ) : (
          Array.from(groupedHistory.entries())
            .sort((a, b) => b[0] - a[0]) // Sort by timestamp descending
            .map(([secondTimestamp, updates]) => (
              <div
                key={secondTimestamp}
                className="border-l-4 border-indigo-500 pl-4 py-2 hover:bg-gray-50 rounded transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">
                    {formatDate(secondTimestamp)}
                  </p>
                  <button
                    onClick={() => handleViewAtTime(secondTimestamp)}
                    className="text-xs px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-full transition"
                  >
                    View Grid
                  </button>
                </div>

                {updates.length > 1 && (
                  <p className="text-xs text-gray-500 mb-2">
                    {updates.length} updates in this second
                  </p>
                )}

                <div className="space-y-1">
                  {updates.map((update, idx) => (
                    <div
                      key={`${update.timestamp}-${idx}`}
                      className="flex items-center gap-3 text-sm"
                    >
                      <span className="text-2xl">{update.character}</span>
                      <span className="text-gray-600">
                        <span className="font-medium text-indigo-600">
                          {update.playerName}
                        </span>{" "}
                        updated ({update.row + 1}, {update.col + 1})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
        )}
      </div>

      {/* Stats */}
      {history.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-indigo-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-indigo-600">
                {history.length}
              </p>
              <p className="text-xs text-gray-600">Total Updates</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-purple-600">
                {new Set(history.map((h) => h.playerId)).size}
              </p>
              <p className="text-xs text-gray-600">Unique Players</p>
            </div>
            <div className="bg-pink-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-pink-600">
                {groupedHistory.size}
              </p>
              <p className="text-xs text-gray-600">Time Points</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-green-600">
                {Math.max(
                  ...Array.from(groupedHistory.values()).map((g) => g.length)
                )}
              </p>
              <p className="text-xs text-gray-600">Max/Second</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryViewer;
