import type { Color, GameMessage, ScheduledEvent } from "@pkg/common";
import type { Board, Coord } from "./board.js";
export type Phase = "lobby" | "draft" | "game" | "complete";
export interface GameFlags {
    earthquakes: boolean;
    disco: boolean;
}
export interface GameState {
    board: Board;
    phase: Phase;
    toMove: Color;
    moveCount: number;
    seq: number;
    clocks: {
        w: number;
        b: number;
    };
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
export declare function makeBoard(width?: number, height?: number): Board;
export declare function initialState(): GameState;
//# sourceMappingURL=state.d.ts.map