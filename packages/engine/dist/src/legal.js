import { at, shallowCloneBoard } from "./board";
import { colorOf, isKing } from "./pieces";
import { genPseudo } from "./genmoves";
import { isSquareAttacked } from "./attack";
export function findKing(b, color) {
    for (let y = 0; y < b.height; y++)
        for (let x = 0; x < b.width; x++) {
            const p = at(b, x, y)?.piece;
            if (p && isKing(p) && colorOf(p) === color)
                return { x, y };
        }
    return { x: -1, y: -1 };
}
export function applyMoveShallow(b, from, to) {
    const nb = shallowCloneBoard(b);
    const fk = `${from.x}:${from.y}`, tk = `${to.x}:${to.y}`;
    const fc = { ...(nb.cells.get(fk) || {}) }, tc = { ...(nb.cells.get(tk) || {}) };
    const fp = fc.piece;
    if (fp) {
        tc.piece = fp;
        delete fc.piece;
    }
    nb.cells.set(tk, tc);
    nb.cells.set(fk, fc);
    return nb;
}
export function legalMoves(b, from, flags) {
    const p = at(b, from.x, from.y)?.piece;
    if (!p)
        return [];
    const me = colorOf(p), enemy = me === "w" ? "b" : "w";
    const kingSq = findKing(b, me);
    const out = [];
    for (const to of genPseudo(b, from, flags)) {
        const nb = applyMoveShallow(b, from, to);
        const newKing = (from.x === kingSq.x && from.y === kingSq.y) ? to : kingSq;
        if (!isSquareAttacked(nb, newKing, enemy, flags))
            out.push(to);
    }
    return out;
}
export const isMoveLegal = (b, from, to, flags) => legalMoves(b, from, flags).some(m => m.x === to.x && m.y === to.y);
