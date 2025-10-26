interface PlayerInfoProps {
  playerName: string;
  playersOnline: number;
  cooldownTime: number;
}

const PlayerInfo = ({
  playerName,
  playersOnline,
  cooldownTime,
}: PlayerInfoProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Player Name */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg px-6 py-3 shadow-lg">
        <p className="text-white text-sm font-medium">Your Name</p>
        <p className="text-white text-xl font-bold">{playerName}</p>
      </div>

      {/* Players Online */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg px-6 py-3 shadow-lg">
        <p className="text-white text-sm font-medium">Players Online</p>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          <p className="text-white text-xl font-bold">{playersOnline}</p>
        </div>
      </div>

      {/* Cooldown Timer */}
      {cooldownTime > 0 && (
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg px-6 py-3 shadow-lg">
          <p className="text-white text-sm font-medium">Cooldown</p>
          <p className="text-white text-xl font-bold">{cooldownTime}s</p>
        </div>
      )}
    </div>
  );
};

export default PlayerInfo;
