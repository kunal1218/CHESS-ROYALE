// Piece identification and utility functions.
import type { PieceId, Color } from "./board.js";
export const colorOf = (pid: PieceId): Color => (pid[0] === "W" ? "w" : "b");
export const isPawn   = (pid: PieceId) => pid.endsWith("P");
export const isKnight = (pid: PieceId) => pid.endsWith("N");
export const isPrince = (pid: PieceId) => pid.endsWith("X");
export const isBishop = (pid: PieceId) => pid.endsWith("B");
export const isRook   = (pid: PieceId) => pid.endsWith("R");
export const isQueen  = (pid: PieceId) => pid.endsWith("Q");
export const isKing   = (pid: PieceId) => pid.endsWith("K");

export const pawnId   = (color: Color) => (color === "w" ? "WP" : "BP");
export const knightId = (color: Color) => (color === "w" ? "WN" : "BN");
export const bishopId = (color: Color) => (color === "w" ? "WB" : "BB");
export const rookId   = (color: Color) => (color === "w" ? "WR" : "BR");
export const queenId  = (color: Color) => (color === "w" ? "WQ" : "BQ");
export const princeId = (color: Color) => (color === "w" ? "WX" : "BX");

export const DIRS = {
  rook:   [[ 1,0],[-1,0],[0, 1],[0,-1]] as const,
  bishop: [[ 1,1],[ 1,-1],[-1,1],[-1,-1]] as const,
  knight: [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]] as const,
};
