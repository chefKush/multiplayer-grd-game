import type { GridCell } from "../types";

interface GridProps {
  grid: (GridCell | null)[][];
  selectedCell: { row: number; col: number } | null;
  onCellClick: (row: number, col: number) => void;
  playerId: string;
}

const Grid = ({ grid, selectedCell, onCellClick, playerId }: GridProps) => {
  const getCellStyle = (row: number, col: number, cell: GridCell | null) => {
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const isMyCell = cell?.playerId === playerId;

    let base =
      "flex items-center justify-center font-bold rounded-xl cursor-pointer transition-all duration-200 border-2 transform hover:scale-105 active:scale-95 aspect-square text-base sm:text-lg md:text-xl";

    if (isSelected) {
      base +=
        " bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.6)]";
    } else if (isMyCell) {
      base +=
        " bg-gradient-to-br from-green-400 to-emerald-500 text-white border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]";
    } else if (cell) {
      base +=
        " bg-gradient-to-br from-sky-400 to-blue-500 text-white border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]";
    } else {
      base +=
        " bg-gradient-to-br from-gray-100 to-gray-200 border-gray-400 text-gray-400 shadow-inner hover:shadow-[0_0_8px_rgba(99,102,241,0.3)]";
    }

    return base;
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Game Grid */}
      <div
        className="
          grid 
          grid-cols-10 
          gap-[0.4rem] sm:gap-2 md:gap-3 
          p-4 sm:p-6 md:p-8 
          bg-gradient-to-br from-slate-50 to-slate-200 
          rounded-3xl 
          shadow-2xl 
          border border-slate-300 
          backdrop-blur-sm
          w-[92vw] sm:w-[80vw] md:w-[60vw] 
          max-w-[720px]
          min-h-[70vw] sm:min-h-[60vw] md:min-h-[45vw]
        "
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              onClick={() => onCellClick(rowIndex, colIndex)}
              className={getCellStyle(rowIndex, colIndex, cell)}
              title={
                cell
                  ? `${cell.character} by ${cell.playerName}\n${new Date(
                      cell.timestamp
                    ).toLocaleString()}`
                  : `Row ${rowIndex + 1}, Col ${colIndex + 1}`
              }
            >
              {cell?.character || ""}
            </div>
          ))
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-6 justify-center text-sm font-medium">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-400 rounded shadow-inner"></div>
          <span className="text-gray-700">Empty</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 border border-emerald-600 rounded shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          <span className="text-gray-700">Your Cell</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-sky-400 to-blue-500 border border-sky-600 rounded shadow-[0_0_8px_rgba(56,189,248,0.5)]"></div>
          <span className="text-gray-700">Other Players</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-indigo-600 border border-indigo-600 rounded shadow-[0_0_10px_rgba(99,102,241,0.6)]"></div>
          <span className="text-gray-700">Selected</span>
        </div>
      </div>
    </div>
  );
};

export default Grid;
