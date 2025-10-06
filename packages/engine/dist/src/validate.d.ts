import { Board, Coord } from "./board";
export declare function validateMove(b: Board, from: Coord, to: Coord, toMove: "w" | "b", flags: {
    disco: boolean;
}): {
    ok: true;
} | {
    ok: false;
    reason: string;
};
