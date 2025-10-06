// Checks whether a square is being targeted by any piece of the given color.
import { at, coordFromWorld, toWorldX } from "./board.js";
import { DIRS, isBishop, isKing, isKnight, isPawn, isPrince, isQueen, isRook, colorOf } from "./pieces.js";
import { firstBlockerOnRay } from "./rays.js";
export function isSquareAttacked(b, sq, by, flags) {
    if (flags.disco)
        return isSquareAttackedDisco(b, sq, by);
    const targetWorldX = toWorldX(b, sq);
    for (const [dx, dy] of DIRS.knight) {
        const origin = coordFromWorld(b, targetWorldX - dx, sq.y - dy);
        if (!origin)
            continue;
        const p = at(b, origin.x, origin.y)?.piece;
        if (p && colorOf(p) === by && (isKnight(p) || isPrince(p)))
            return true;
    }
    for (const [dx, dy] of DIRS.rook) {
        const hit = firstBlockerOnRay(b, sq.x, sq.y, dx, dy);
        if (hit) {
            const p = hit.cell.piece;
            if (colorOf(p) === by && (isRook(p) || isQueen(p)))
                return true;
        }
    }
    for (const [dx, dy] of DIRS.bishop) {
        const hit = firstBlockerOnRay(b, sq.x, sq.y, dx, dy);
        if (hit) {
            const p = hit.cell.piece;
            if (colorOf(p) === by && (isBishop(p) || isQueen(p)))
                return true;
        }
    }
    for (let dx = -1; dx <= 1; dx++)
        for (let dy = -1; dy <= 1; dy++)
            if (dx || dy) {
                const origin = coordFromWorld(b, targetWorldX - dx, sq.y - dy);
                if (!origin)
                    continue;
                const p = at(b, origin.x, origin.y)?.piece;
                if (p && colorOf(p) === by && isKing(p))
                    return true;
            }
    const forward = by === "w" ? -1 : +1;
    for (const dx of [-1, +1]) {
        const origin = coordFromWorld(b, targetWorldX - dx, sq.y - forward);
        if (!origin)
            continue;
        const p = at(b, origin.x, origin.y)?.piece;
        if (p && colorOf(p) === by && (isPawn(p) || isPrince(p)))
            return true;
    }
    return false;
}
function isSquareAttackedDisco(b, sq, by) {
    const targetWorldX = toWorldX(b, sq);
    // King moves like queen in disco mode.
    for (const [dx, dy] of DIRS.rook) {
        const hit = firstBlockerOnRay(b, sq.x, sq.y, dx, dy);
        if (hit) {
            const piece = hit.cell.piece;
            if (piece && colorOf(piece) === by && isKing(piece))
                return true;
        }
    }
    for (const [dx, dy] of DIRS.bishop) {
        const hit = firstBlockerOnRay(b, sq.x, sq.y, dx, dy);
        if (hit) {
            const piece = hit.cell.piece;
            if (piece && colorOf(piece) === by && isKing(piece))
                return true;
        }
    }
    // Queen moves like king.
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (!dx && !dy)
                continue;
            const origin = coordFromWorld(b, targetWorldX - dx, sq.y - dy);
            if (!origin)
                continue;
            const piece = at(b, origin.x, origin.y)?.piece;
            if (piece && colorOf(piece) === by && isQueen(piece))
                return true;
        }
    }
    // Pawns capture forward (same file).
    const forward = by === "w" ? -1 : +1;
    const origin = coordFromWorld(b, targetWorldX, sq.y - forward);
    if (origin) {
        const piece = at(b, origin.x, origin.y)?.piece;
        if (piece && colorOf(piece) === by && isPawn(piece))
            return true;
    }
    return false;
}
