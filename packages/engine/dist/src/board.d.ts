export type Coord = {
    x: number;
    y: number;
};
export type Color = "w" | "b";
export type PieceId = string;
export interface Cell {
    piece?: PieceId;
    terrain?: "normal" | "shop" | "blocked";
}
export interface Board {
    width: number;
    height: number;
    cells: Map<string, Cell>;
}
export declare const key: (x: number, y: number) => string;
export declare const inBounds: (b: Board, x: number, y: number) => boolean;
export declare const at: (b: Board, x: number, y: number) => Cell | undefined;
export declare const set: (b: Board, x: number, y: number, cell: Cell) => Map<string, Cell>;
export declare function shallowCloneBoard(b: Board): Board;
