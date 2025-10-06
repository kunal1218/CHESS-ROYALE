import { at } from "./board.js";
import { colorOf } from "./pieces.js";
import { isMoveLegal } from "./legal.js";
export function validateMove(state, from, to) {
    const src = at(state.board, from.x, from.y);
    if (!src?.piece)
        return { ok: false, reason: "empty from" };
    if (colorOf(src.piece) !== state.toMove)
        return { ok: false, reason: "not your turn" };
    if (!isMoveLegal(state, from, to))
        return { ok: false, reason: "illegal move" };
    return { ok: true };
}
