import { at } from "./board";
import { colorOf } from "./pieces";
import { isMoveLegal } from "./legal";
export function validateMove(b, from, to, toMove, flags) {
    const src = at(b, from.x, from.y);
    if (!src?.piece)
        return { ok: false, reason: "empty from" };
    if (colorOf(src.piece) !== toMove)
        return { ok: false, reason: "not your turn" };
    if (!isMoveLegal(b, from, to, flags))
        return { ok: false, reason: "illegal move" };
    return { ok: true };
}
