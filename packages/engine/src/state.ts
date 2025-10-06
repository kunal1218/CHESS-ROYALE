import type { Color, GameMessage, ScheduledEvent } from "@pkg/common";
import type { Board, Coord } from "./board.js";

export type Phase = "lobby" | "draft" | "game" | "complete";

export interface GameFlags {
  earthquakes: boolean;
  disco: boolean;
  // Future toggles can live here (e.g. prince unlocks, terrain effects).
}

export interface GameState {
  board: Board;
  phase: Phase;
  toMove: Color;
  moveCount: number;
  seq: number;
  clocks: { w: number; b: number };
  flags: GameFlags;
  schedule: Record<number, ScheduledEvent[]>;
  castling: CastlingRights;
  enPassant: Coord | null;
  result: GameResult | null;
  messages: GameMessage[];
}

export interface SideCastlingRights {
  kingSide: boolean;
  queenSide: boolean;
}

export interface CastlingRights {
  w: SideCastlingRights;
  b: SideCastlingRights;
}

export interface GameResult {
  winner: Color | null;
  method: "checkmate" | "stalemate" | "disconnect";
}
export function makeBoard(width=8, height=8): Board {
  const board: Board = {
    width,
    height,
    cells: new Map(),
    rowOffsets: Array.from({ length: height }, () => 0),
    rowColorInvert: Array.from({ length: height }, () => false)
  };
  return board;
}
export function initialState(): GameState {
  return {
    board: makeBoard(8,8),
    phase: "game",
    toMove: "w",
    moveCount: 0,
    seq: 0,
    clocks: { w: 5*60_000, b: 5*60_000 },
    flags: { earthquakes: false, disco: false },
    schedule: {},
    castling: {
      w: { kingSide: true, queenSide: true },
      b: { kingSide: true, queenSide: true }
    },
    enPassant: null,
    result: null,
    messages: []
  };
}
