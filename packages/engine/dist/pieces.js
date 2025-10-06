export const colorOf = (pid) => (pid[0] === "W" ? "w" : "b");
export const isPawn = (pid) => pid.endsWith("P");
export const isKnight = (pid) => pid.endsWith("N");
export const isPrince = (pid) => pid.endsWith("X");
export const isBishop = (pid) => pid.endsWith("B");
export const isRook = (pid) => pid.endsWith("R");
export const isQueen = (pid) => pid.endsWith("Q");
export const isKing = (pid) => pid.endsWith("K");
export const pawnId = (color) => (color === "w" ? "WP" : "BP");
export const knightId = (color) => (color === "w" ? "WN" : "BN");
export const bishopId = (color) => (color === "w" ? "WB" : "BB");
export const rookId = (color) => (color === "w" ? "WR" : "BR");
export const queenId = (color) => (color === "w" ? "WQ" : "BQ");
export const princeId = (color) => (color === "w" ? "WX" : "BX");
export const DIRS = {
    rook: [[1, 0], [-1, 0], [0, 1], [0, -1]],
    bishop: [[1, 1], [1, -1], [-1, 1], [-1, -1]],
    knight: [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]],
};
