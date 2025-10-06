import { Board, Coord } from "./board.js";
import type { GameState } from "./state.js";
import type { Color } from "@pkg/common";
export declare function findKing(b: Board, color: "w" | "b"): Coord;
export declare function applyMoveShallow(b: Board, from: Coord, to: Coord, ctx: {
    enPassant: Coord | null;
}): Board;
export declare function legalMoves(state: GameState, from: Coord): Coord[];
export declare const isMoveLegal: (state: GameState, from: Coord, to: Coord) => boolean;
export declare function hasAnyLegalMoves(state: GameState, color: Color): boolean;
//# sourceMappingURL=legal.d.ts.map