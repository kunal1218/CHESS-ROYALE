import { at, shallowCloneBoard, key, toWorldX } from "./board.js";
import { colorOf, isKing, isKnight, isPawn, isPrince, isRook, knightId, pawnId, princeId } from "./pieces.js";
import { genPseudo } from "./genmoves.js";
import { isSquareAttacked } from "./attack.js";
export function findKing(b, color) {
    for (let y = 0; y < b.height; y++)
        for (let x = 0; x < b.width; x++) {
            const p = at(b, x, y)?.piece;
            if (p && isKing(p) && colorOf(p) === color)
                return { x, y };
        }
    return { x: -1, y: -1 };
}
function pawnAdvancedAtLeastTwo(b, pos, color) {
    const startRank = color === "w" ? b.height - 2 : 1;
    if (color === "w")
        return pos.y <= startRank - 2;
    return pos.y >= startRank + 2;
}
const restrictedPawnFlags = () => ({ restrictions: { noPromotion: true } });
const cloneFlags = (flags) => flags
    ? {
        restrictions: flags.restrictions ? { ...flags.restrictions } : undefined,
    }
    : undefined;
export function applyMoveShallow(b, from, to, ctx) {
    const nb = shallowCloneBoard(b);
    const fk = `${from.x}:${from.y}`, tk = `${to.x}:${to.y}`;
    const fc = { ...(nb.cells.get(fk) || {}) }, tc = { ...(nb.cells.get(tk) || {}) };
    const fp = fc.piece;
    if (fp) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const fromWorldX = toWorldX(b, from);
        const toWorldXVal = toWorldX(b, to);
        const worldDx = toWorldXVal - fromWorldX;
        if (isPawn(fp) && ctx.enPassant && to.x === ctx.enPassant.x && to.y === ctx.enPassant.y && !tc.piece) {
            const dir = colorOf(fp) === "w" ? +1 : -1;
            const captureKey = key(to.x, to.y + dir);
            const captureCell = { ...(nb.cells.get(captureKey) || {}) };
            delete captureCell.piece;
            delete captureCell.pieceFlags;
            if (Object.keys(captureCell).length)
                nb.cells.set(captureKey, captureCell);
            else
                nb.cells.delete(captureKey);
        }
        const moverColor = colorOf(fp);
        let toPiece = fp;
        let toFlags = cloneFlags(fc.pieceFlags);
        let fromPiece;
        let fromFlags;
        if (isPrince(fp) && Math.abs(worldDx) === 1 && Math.abs(dy) === 1) {
            fromPiece = knightId(moverColor);
            toPiece = pawnId(moverColor);
            fromFlags = undefined;
            toFlags = restrictedPawnFlags();
        }
        if (isKnight(fp)) {
            const targetBefore = at(b, to.x, to.y);
            if (targetBefore?.piece &&
                isPawn(targetBefore.piece) &&
                colorOf(targetBefore.piece) === moverColor &&
                pawnAdvancedAtLeastTwo(b, to, moverColor)) {
                toPiece = princeId(moverColor);
                toFlags = undefined;
            }
        }
        delete fc.piece;
        delete fc.pieceFlags;
        if (fromPiece)
            fc.piece = fromPiece;
        if (fromFlags)
            fc.pieceFlags = cloneFlags(fromFlags);
        if (toPiece)
            tc.piece = toPiece;
        else
            delete tc.piece;
        if (toPiece) {
            if (toFlags)
                tc.pieceFlags = cloneFlags(toFlags);
            else
                delete tc.pieceFlags;
        }
        else {
            delete tc.pieceFlags;
        }
        if (isKing(fp) && Math.abs(dx) === 2) {
            const dir = dx > 0 ? 1 : -1;
            const rookFromX = dir === 1 ? b.width - 1 : 0;
            const rookToX = to.x - dir;
            const rookFromKey = key(rookFromX, from.y);
            const rookToKey = key(rookToX, from.y);
            const rc = { ...(nb.cells.get(rookFromKey) || {}) };
            const rookPiece = rc.piece;
            if (rookPiece && isRook(rookPiece)) {
                const rtc = { ...(nb.cells.get(rookToKey) || {}) };
                rtc.piece = rookPiece;
                if (rc.pieceFlags) {
                    rtc.pieceFlags = cloneFlags(rc.pieceFlags);
                    delete rc.pieceFlags;
                }
                else {
                    delete rtc.pieceFlags;
                }
                delete rc.piece;
                delete rc.pieceFlags;
                nb.cells.set(rookToKey, rtc);
                if (Object.keys(rc).length)
                    nb.cells.set(rookFromKey, rc);
                else
                    nb.cells.delete(rookFromKey);
            }
        }
    }
    nb.cells.set(tk, tc);
    nb.cells.set(fk, fc);
    if (!Object.keys(fc).length)
        nb.cells.delete(fk);
    if (!Object.keys(tc).length)
        nb.cells.delete(tk);
    return nb;
}
export function legalMoves(state, from) {
    const b = state.board;
    const p = at(b, from.x, from.y)?.piece;
    if (!p)
        return [];
    const me = colorOf(p), enemy = me === "w" ? "b" : "w";
    const kingSq = findKing(b, me);
    const out = [];
    const isKingMove = isKing(p);
    for (const to of genPseudo(state, from)) {
        const isCastle = isKingMove && Math.abs(to.x - from.x) === 2;
        if (isCastle) {
            if (isSquareAttacked(b, from, enemy, state.flags))
                continue;
            const step = { x: from.x + (to.x > from.x ? 1 : -1), y: from.y };
            const midBoard = applyMoveShallow(b, from, step, { enPassant: state.enPassant });
            if (isSquareAttacked(midBoard, step, enemy, state.flags))
                continue;
        }
        const nb = applyMoveShallow(b, from, to, { enPassant: state.enPassant });
        const newKing = (from.x === kingSq.x && from.y === kingSq.y) ? to : kingSq;
        if (!isSquareAttacked(nb, newKing, enemy, state.flags))
            out.push(to);
    }
    return out;
}
export const isMoveLegal = (state, from, to) => legalMoves(state, from).some(m => m.x === to.x && m.y === to.y);
export function hasAnyLegalMoves(state, color) {
    const { board } = state;
    for (let y = 0; y < board.height; y++) {
        for (let x = 0; x < board.width; x++) {
            const piece = at(board, x, y)?.piece;
            if (!piece || colorOf(piece) !== color)
                continue;
            if (legalMoves(state, { x, y }).length)
                return true;
        }
    }
    return false;
}
