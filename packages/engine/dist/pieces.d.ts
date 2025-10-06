import type { PieceId, Color } from "./board.js";
export declare const colorOf: (pid: PieceId) => Color;
export declare const isPawn: (pid: PieceId) => boolean;
export declare const isKnight: (pid: PieceId) => boolean;
export declare const isPrince: (pid: PieceId) => boolean;
export declare const isBishop: (pid: PieceId) => boolean;
export declare const isRook: (pid: PieceId) => boolean;
export declare const isQueen: (pid: PieceId) => boolean;
export declare const isKing: (pid: PieceId) => boolean;
export declare const pawnId: (color: Color) => "WP" | "BP";
export declare const knightId: (color: Color) => "WN" | "BN";
export declare const bishopId: (color: Color) => "WB" | "BB";
export declare const rookId: (color: Color) => "WR" | "BR";
export declare const queenId: (color: Color) => "WQ" | "BQ";
export declare const princeId: (color: Color) => "WX" | "BX";
export declare const DIRS: {
    rook: readonly [readonly [1, 0], readonly [-1, 0], readonly [0, 1], readonly [0, -1]];
    bishop: readonly [readonly [1, 1], readonly [1, -1], readonly [-1, 1], readonly [-1, -1]];
    knight: readonly [readonly [1, 2], readonly [2, 1], readonly [-1, 2], readonly [-2, 1], readonly [1, -2], readonly [2, -1], readonly [-1, -2], readonly [-2, -1]];
};
//# sourceMappingURL=pieces.d.ts.map