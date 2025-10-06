import type { PieceId, Color } from "./board";
export declare const colorOf: (pid: PieceId) => Color;
export declare const isPawn: (pid: PieceId) => boolean;
export declare const isKnight: (pid: PieceId) => boolean;
export declare const isBishop: (pid: PieceId) => boolean;
export declare const isRook: (pid: PieceId) => boolean;
export declare const isQueen: (pid: PieceId) => boolean;
export declare const isKing: (pid: PieceId) => boolean;
export declare const DIRS: {
    rook: readonly [readonly [1, 0], readonly [-1, 0], readonly [0, 1], readonly [0, -1]];
    bishop: readonly [readonly [1, 1], readonly [1, -1], readonly [-1, 1], readonly [-1, -1]];
    knight: readonly [readonly [1, 2], readonly [2, 1], readonly [-1, 2], readonly [-2, 1], readonly [1, -2], readonly [2, -1], readonly [-1, -2], readonly [-2, -1]];
};
