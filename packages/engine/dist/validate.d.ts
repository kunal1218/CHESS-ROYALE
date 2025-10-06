import { Coord } from "./board.js";
import type { GameState } from "./state.js";
export declare function validateMove(state: GameState, from: Coord, to: Coord): {
    ok: true;
} | {
    ok: false;
    reason: string;
};
//# sourceMappingURL=validate.d.ts.map