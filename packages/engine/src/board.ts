// Basic board and cell utilities.

export type Coord = { x: number; y: number };
export type Color = "w" | "b";
export type PieceId = string; // e.g. "WP","BQ"

export interface PieceRestrictions {
  noPromotion?: boolean;
}

export interface PieceFlags {
  restrictions?: PieceRestrictions;
}

export interface Cell {
  piece?: PieceId;
  pieceFlags?: PieceFlags;
  terrain?: "normal" | "shop" | "blocked";
}
export interface Board {
  width: number;
  height: number;
  cells: Map<string, Cell>;
  rowOffsets: number[];
  rowColorInvert: boolean[];
}

export const key = (x: number, y: number) => `${x}:${y}`;
export const inBounds = (b: Board, x: number, y: number) =>
  x >= 0 && x < b.width && y >= 0 && y < b.height;
export const at = (b: Board, x: number, y: number): Cell | undefined =>
  inBounds(b, x, y) ? b.cells.get(key(x, y)) : undefined;
export const set = (b: Board, x: number, y: number, cell: Cell) =>
  b.cells.set(key(x, y), cell);
export function shallowCloneBoard(b: Board): Board {
  return {
    width: b.width,
    height: b.height,
    cells: new Map(b.cells),
    rowOffsets: [...b.rowOffsets],
    rowColorInvert: [...b.rowColorInvert]
  };
}

export const getRowOffset = (b: Board, y: number) => b.rowOffsets[y] ?? 0;
export const setRowOffset = (b: Board, y: number, offset: number) => {
  ensureRowArray(b);
  b.rowOffsets[y] = offset;
};
export const getRowInvert = (b: Board, y: number) => b.rowColorInvert[y] ?? false;
export const setRowInvert = (b: Board, y: number, invert: boolean) => {
  ensureRowArray(b);
  ensureColorArray(b);
  b.rowColorInvert[y] = invert;
};

export function resetRowOffsets(b: Board) {
  b.rowOffsets = Array.from({ length: b.height }, () => 0);
  b.rowColorInvert = Array.from({ length: b.height }, () => false);
}

export function toWorldX(b: Board, coord: Coord): number {
  return coord.x + getRowOffset(b, coord.y);
}

export function worldToBoardX(b: Board, y: number, worldX: number): number | null {
  if (y < 0 || y >= b.height) return null;
  const offset = getRowOffset(b, y);
  const local = worldX - offset;
  if (!Number.isInteger(local)) return null;
  if (local < 0 || local >= b.width) return null;
  return local;
}

export function coordFromWorld(b: Board, worldX: number, y: number): Coord | null {
  const boardX = worldToBoardX(b, y, worldX);
  return boardX === null ? null : { x: boardX, y };
}

export function atWorld(b: Board, worldX: number, y: number): Cell | undefined {
  const coord = coordFromWorld(b, worldX, y);
  if (!coord) return undefined;
  return at(b, coord.x, coord.y);
}

export function describeRow(b: Board, y: number): string {
  const rank = b.height - y;
  return `rank ${rank}`;
}

function ensureRowArray(b: Board) {
  if (!Array.isArray(b.rowOffsets) || b.rowOffsets.length !== b.height) {
    b.rowOffsets = Array.from({ length: b.height }, () => 0);
  }
}

function ensureColorArray(b: Board) {
  if (!Array.isArray(b.rowColorInvert) || b.rowColorInvert.length !== b.height) {
    b.rowColorInvert = Array.from({ length: b.height }, () => false);
  }
}
