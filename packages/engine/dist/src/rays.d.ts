import { Board } from "./board";
export declare function firstBlockerOnRay(b: Board, x: number, y: number, dx: number, dy: number): {
    x: number;
    y: number;
    cell: import("./board").Cell;
} | null;
export declare function walkRayUntilBlock(b: Board, x: number, y: number, dx: number, dy: number): {
    x: number;
    y: number;
}[];
