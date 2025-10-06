import { at } from "./board";
import { DIRS, isBishop, isKing, isKnight, isPawn, isQueen, isRook, colorOf } from "./pieces";
import { walkRayUntilBlock } from "./rays";
export function genPseudo(b, from, flags) {
    const c = at(b, from.x, from.y);
    const p = c?.piece;
    if (!p)
        return [];
    const me = colorOf(p);
    const theirs = me === "w" ? "b" : "w";
    const out = [];
    if (isRook(p) || isQueen(p))
        pushRay(out, b, from, DIRS.rook, me);
    if (isBishop(p) || isQueen(p))
        pushRay(out, b, from, DIRS.bishop, me);
    if (isKnight(p)) {
        for (const [dx, dy] of DIRS.knight) {
            const nx = from.x + dx, ny = from.y + dy;
            const t = at(b, nx, ny);
            if (!t)
                continue;
            if (!t.piece || colorOf(t.piece) === theirs)
                out.push({ x: nx, y: ny });
        }
    }
    if (isKing(p)) {
        for (let dx = -1; dx <= 1; dx++)
            for (let dy = -1; dy <= 1; dy++)
                if (dx || dy) {
                    const nx = from.x + dx, ny = from.y + dy;
                    const t = at(b, nx, ny);
                    if (!t)
                        continue;
                    if (!t.piece || colorOf(t.piece) === theirs)
                        out.push({ x: nx, y: ny });
                }
    }
    if (isPawn(p)) {
        const dir = (me === "w" ? -1 : +1) * (flags.disco ? -1 : 1);
        const f1 = at(b, from.x, from.y + dir);
        if (f1 && !f1.piece)
            out.push({ x: from.x, y: from.y + dir });
        for (const dx of [-1, +1]) {
            const t = at(b, from.x + dx, from.y + dir);
            if (t?.piece && colorOf(t.piece) !== me)
                out.push({ x: from.x + dx, y: from.y + dir });
        }
    }
    return out;
}
function pushRay(out, b, from, dirs, me) {
    const theirs = me === "w" ? "b" : "w";
    for (const [dx, dy] of dirs) {
        for (const sq of walkRayUntilBlock(b, from.x, from.y, dx, dy)) {
            const t = at(b, sq.x, sq.y);
            if (!t.piece)
                out.push(sq);
            else {
                if (t && t.piece && colorOf(t.piece) === theirs)
                    out.push(sq);
                break;
            }
        }
    }
}
