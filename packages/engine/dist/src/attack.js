import { at } from "./board";
import { DIRS, isBishop, isKing, isKnight, isPawn, isQueen, isRook, colorOf } from "./pieces";
import { firstBlockerOnRay } from "./rays";
export function isSquareAttacked(b, sq, by, flags) {
    for (const [dx, dy] of DIRS.knight) {
        const c = at(b, sq.x + dx, sq.y + dy);
        const p = c?.piece;
        if (p && colorOf(p) === by && isKnight(p))
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
                const c = at(b, sq.x + dx, sq.y + dy);
                const p = c?.piece;
                if (p && colorOf(p) === by && isKing(p))
                    return true;
            }
    const dir = flags.disco ? +1 : -1;
    for (const dx of [-1, +1]) {
        const c = at(b, sq.x + dx, sq.y + dir);
        const p = c?.piece;
        if (p && colorOf(p) === by && isPawn(p))
            return true;
    }
    return false;
}
