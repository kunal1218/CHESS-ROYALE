import { Board, Coord } from "./board";
import type { Color } from "./board";
export declare function isSquareAttacked(b: Board, sq: Coord, by: Color, flags: {
    disco: boolean;
}): boolean;
