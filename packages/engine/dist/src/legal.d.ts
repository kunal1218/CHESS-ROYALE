import { Board, Coord } from "./board";
export interface Flags {
    disco: boolean;
}
export declare function findKing(b: Board, color: "w" | "b"): Coord;
export declare function applyMoveShallow(b: Board, from: Coord, to: Coord): Board;
export declare function legalMoves(b: Board, from: Coord, flags: Flags): Coord[];
export declare const isMoveLegal: (b: Board, from: Coord, to: Coord, flags: Flags) => boolean;
