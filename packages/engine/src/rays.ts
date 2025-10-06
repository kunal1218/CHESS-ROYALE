import { at, Board, toWorldX, worldToBoardX } from "./board.js";
export function firstBlockerOnRay(b: Board, x: number, y: number, dx: number, dy: number) {
  let worldX = toWorldX(b, { x, y }) + dx;
  let ny = y + dy;
  while (ny >= 0 && ny < b.height) {
    const boardX = worldToBoardX(b, ny, worldX);
    if (boardX === null) break;
    const cell = at(b, boardX, ny);
    if (cell?.piece) return { x: boardX, y: ny, cell };
    worldX += dx;
    ny += dy;
  }
  return null;
}
export function walkRayUntilBlock(b: Board, x: number, y: number, dx: number, dy: number) {
  const out: { x: number; y: number }[] = [];
  let worldX = toWorldX(b, { x, y }) + dx;
  let ny = y + dy;
  while (ny >= 0 && ny < b.height) {
    const boardX = worldToBoardX(b, ny, worldX);
    if (boardX === null) break;
    out.push({ x: boardX, y: ny });
    const cell = at(b, boardX, ny);
    if (cell?.piece) break;
    worldX += dx;
    ny += dy;
  }
  return out;
}
