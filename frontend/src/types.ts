export interface GridCell {
  character: string;
  playerId: string;
  playerName: string;
  timestamp: number;
}

export interface GridUpdate {
  row: number;
  col: number;
  character: string;
  playerId: string;
  playerName: string;
  timestamp: number;
}

export interface Player {
  id: string;
  name: string;
  lastUpdateTime: number | null;
  socketId: string;
}
