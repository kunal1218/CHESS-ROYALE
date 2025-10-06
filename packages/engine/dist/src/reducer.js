import { shallowCloneBoard } from "./board";
import { applyMoveShallow } from "./legal";
import { validateMove } from "./validate";
export function reduce(prev, a) {
    var _a, _b;
    const next = {
        ...prev,
        board: shallowCloneBoard(prev.board),
        schedule: { ...prev.schedule }
    };
    switch (a.t) {
        case "TOGGLE_FLAG": {
            const cur = next.flags[a.key];
            next.flags[a.key] = a.value ?? !cur;
            break;
        }
        case "SCHEDULE_EVENT": {
            (_a = next.schedule)[_b = a.atMove] ?? (_a[_b] = []);
            next.schedule[a.atMove].push(a.event);
            break;
        }
        case "MOVE": {
            const verdict = validateMove(next.board, a.from, a.to, next.toMove, next.flags);
            if (!verdict.ok) {
                next._lastError = verdict.reason;
                break;
            }
            next.board = applyMoveShallow(next.board, a.from, a.to);
            next.toMove = next.toMove === "w" ? "b" : "w";
            next.moveCount++;
            // TODO: run scheduled earthquake/restore here.
            break;
        }
        case "BOARD_SHIFT_ROW":
        case "BOARD_RESTORE_ROW":
        case "DEBUG_RESET": {
            // stubs for future features
            break;
        }
    }
    next.seq++;
    return next;
}
