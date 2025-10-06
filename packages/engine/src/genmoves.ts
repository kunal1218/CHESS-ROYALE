// Generates pseudo-legal moves for a piece on a given square.
import { at, Board, Coord, coordFromWorld, toWorldX, inBounds } from "./board.js";
import { DIRS, isBishop, isKing, isKnight, isPawn, isPrince, isQueen, isRook, colorOf } from "./pieces.js";
import { walkRayUntilBlock } from "./rays.js";
import type { GameState } from "./state.js";

export function genPseudo(state: GameState, from: Coord): Coord[] {
  const b = state.board;
  const flags = state.flags;
  const c = at(b, from.x, from.y); const p = c?.piece; if (!p) return [];
  const me = colorOf(p); const theirs = me === "w" ? "b" : "w";
  const out: Coord[] = [];
  const baseWorldX = toWorldX(b, from);

  if (flags.disco) {
    if (isPawn(p)) {
      const forwardDir = me === "w" ? -1 : +1;
      for (const dx of [-1, +1]) {
        const target = coordFromWorld(b, baseWorldX + dx, from.y + forwardDir);
        if (!target) continue;
        const cell = at(b, target.x, target.y);
        if (!cell?.piece) out.push(target);
      }
      const forward = coordFromWorld(b, baseWorldX, from.y + forwardDir);
      if (forward) {
        const cell = at(b, forward.x, forward.y);
        if (cell?.piece && colorOf(cell.piece) === theirs) out.push(forward);
      }
      return out;
    }
    if (isQueen(p)) {
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
        if (!dx && !dy) continue;
        const target = coordFromWorld(b, baseWorldX + dx, from.y + dy);
        if (!target) continue;
        const cell = at(b, target.x, target.y);
        if (!cell?.piece || colorOf(cell.piece) === theirs) out.push(target);
      }
      return out;
    }
    if (isKing(p)) {
      pushRay(out, b, from, DIRS.rook, me);
      pushRay(out, b, from, DIRS.bishop, me);
      return out;
    }
    return out;
  }

  if (isRook(p)   || isQueen(p)) pushRay(out, b, from, DIRS.rook,   me);
  if (isBishop(p) || isQueen(p)) pushRay(out, b, from, DIRS.bishop, me);
  if (isKnight(p) || isPrince(p)) {
    for (const [dx, dy] of DIRS.knight) {
      const target = coordFromWorld(b, baseWorldX + dx, from.y + dy);
      if (!target) continue;
      const t = at(b, target.x, target.y);
      if (!t?.piece || colorOf(t.piece) === theirs) out.push(target);
      else if (isKnight(p) && isPrinceMergeTarget(b, target.x, target.y, me)) {
        out.push(target);
      }
    }
  }
  if (isPrince(p)) {
    const diagDirs: readonly [number, number][] = [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ];
    for (const [dx, dy] of diagDirs) {
      const target = coordFromWorld(b, baseWorldX + dx, from.y + dy);
      if (!target) continue;
      const cell = at(b, target.x, target.y);
      if (!cell?.piece) {
        out.push(target);
      } else if (colorOf(cell.piece) === theirs) {
        out.push(target);
      }
    }
  }
  if (isKing(p)) {
    for (let dx=-1; dx<=1; dx++) for (let dy=-1; dy<=1; dy++) if (dx||dy) {
      const target = coordFromWorld(b, baseWorldX + dx, from.y + dy);
      if (!target) continue;
      const t = at(b, target.x, target.y);
      if (!t?.piece || colorOf(t.piece) === theirs) out.push(target);
    }
    const rights = state.castling[me];
    if (rights?.kingSide) maybePushCastle(out, b, from, me, +1);
    if (rights?.queenSide) maybePushCastle(out, b, from, me, -1);
  }
  if (isPawn(p)) {
    const forwardDir = me === "w" ? -1 : +1;
    const oneStep = coordFromWorld(b, baseWorldX, from.y + forwardDir);
    if (oneStep) {
      const oneStepCell = at(b, oneStep.x, oneStep.y);
      if (!oneStepCell?.piece) {
        out.push(oneStep);
        const startRank = me === "w" ? b.height - 2 : 1;
        if (from.y === startRank) {
          const twoStep = coordFromWorld(b, toWorldX(b, oneStep), oneStep.y + forwardDir);
          if (twoStep) {
            const twoStepCell = at(b, twoStep.x, twoStep.y);
            if (!twoStepCell?.piece) out.push(twoStep);
          }
        }
      }
    }
    for (const dx of [-1, +1]) {
      const target = coordFromWorld(b, baseWorldX + dx, from.y + forwardDir);
      if (!target) continue;
      const targetCell = at(b, target.x, target.y);
      if (targetCell?.piece && colorOf(targetCell.piece) === theirs) out.push(target);
    }
    const ep = state.enPassant;
    if (ep) {
      for (const dx of [-1, +1]) {
        const target = coordFromWorld(b, baseWorldX + dx, from.y + forwardDir);
        if (!target || target.x !== ep.x || target.y !== ep.y) continue;
        const adj = coordFromWorld(b, baseWorldX + dx, from.y);
        if (!adj) continue;
        const adjCell = at(b, adj.x, adj.y);
        if (adjCell?.piece && colorOf(adjCell.piece) === theirs && isPawn(adjCell.piece)) {
          out.push(target);
        }
      }
    }
  }
  return out;
}

function pushRay(out: Coord[], b: Board, from: Coord,
  dirs: readonly (readonly [number, number])[], me: "w"|"b") {
  const theirs = me === "w" ? "b" : "w";
  for (const [dx, dy] of dirs) {
    for (const sq of walkRayUntilBlock(b, from.x, from.y, dx, dy)) {
      const t = at(b, sq.x, sq.y);
      if (!t?.piece) out.push(sq);
      else { if (colorOf(t.piece) === theirs) out.push(sq); break; }
    }
  }
}

function maybePushCastle(out: Coord[], b: Board, from: Coord, color: "w"|"b", dir: 1 | -1) {
  const step2 = from.x + dir * 2;
  if (!inBounds(b, step2, from.y)) return;
  const rookX = dir === 1 ? b.width - 1 : 0;
  for (let x = from.x + dir; x !== rookX; x += dir) {
    if (!inBounds(b, x, from.y)) return;
    const cell = at(b, x, from.y);
    if (cell?.piece) return;
  }
  const rookCell = at(b, rookX, from.y);
  if (!rookCell?.piece || !isRook(rookCell.piece) || colorOf(rookCell.piece) !== color) return;
  out.push({ x: step2, y: from.y });
}

function isPrinceMergeTarget(b: Board, x: number, y: number, color: "w" | "b"): boolean {
  const cell = at(b, x, y);
  if (!cell?.piece || colorOf(cell.piece) !== color) return false;
  if (!isPawn(cell.piece)) return false;
  const startRank = color === "w" ? b.height - 2 : 1;
  if (color === "w") return y <= startRank - 2;
  return y >= startRank + 2;
}
