export type Coord = {
    x: number;
    y: number;
};
export type Color = "w" | "b";
export type PieceId = string;
export interface PieceRestrictions {
    noPromotion?: boolean;
}
export interface PieceFlags {
    restrictions?: PieceRestrictions;
}
export interface Cell {
    piece?: PieceId;
    pieceFlags?: PieceFlags;
    terrain?: "normal" | "shop" | "blocked";
}
export interface Board {
    width: number;
    height: number;
    cells: Map<string, Cell>;
    rowOffsets: number[];
    rowColorInvert: boolean[];
}
export declare const key: (x: number, y: number) => string;
export declare const inBounds: (b: Board, x: number, y: number) => boolean;
export declare const at: (b: Board, x: number, y: number) => Cell | undefined;
export declare const set: (b: Board, x: number, y: number, cell: Cell) => Map<string, Cell>;
export declare function shallowCloneBoard(b: Board): Board;
export declare const getRowOffset: (b: Board, y: number) => number;
export declare const setRowOffset: (b: Board, y: number, offset: number) => void;
export declare const getRowInvert: (b: Board, y: number) => boolean;
export declare const setRowInvert: (b: Board, y: number, invert: boolean) => void;
export declare function resetRowOffsets(b: Board): void;
export declare function toWorldX(b: Board, coord: Coord): number;
export declare function worldToBoardX(b: Board, y: number, worldX: number): number | null;
export declare function coordFromWorld(b: Board, worldX: number, y: number): Coord | null;
export declare function atWorld(b: Board, worldX: number, y: number): Cell | undefined;
export declare function describeRow(b: Board, y: number): string;
//# sourceMappingURL=board.d.ts.map