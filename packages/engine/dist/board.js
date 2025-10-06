// Basic board and cell utilities.
export const key = (x, y) => `${x}:${y}`;
export const inBounds = (b, x, y) => x >= 0 && x < b.width && y >= 0 && y < b.height;
export const at = (b, x, y) => inBounds(b, x, y) ? b.cells.get(key(x, y)) : undefined;
export const set = (b, x, y, cell) => b.cells.set(key(x, y), cell);
export function shallowCloneBoard(b) {
    return {
        width: b.width,
        height: b.height,
        cells: new Map(b.cells),
        rowOffsets: [...b.rowOffsets],
        rowColorInvert: [...b.rowColorInvert]
    };
}
export const getRowOffset = (b, y) => b.rowOffsets[y] ?? 0;
export const setRowOffset = (b, y, offset) => {
    ensureRowArray(b);
    b.rowOffsets[y] = offset;
};
export const getRowInvert = (b, y) => b.rowColorInvert[y] ?? false;
export const setRowInvert = (b, y, invert) => {
    ensureRowArray(b);
    ensureColorArray(b);
    b.rowColorInvert[y] = invert;
};
export function resetRowOffsets(b) {
    b.rowOffsets = Array.from({ length: b.height }, () => 0);
    b.rowColorInvert = Array.from({ length: b.height }, () => false);
}
export function toWorldX(b, coord) {
    return coord.x + getRowOffset(b, coord.y);
}
export function worldToBoardX(b, y, worldX) {
    if (y < 0 || y >= b.height)
        return null;
    const offset = getRowOffset(b, y);
    const local = worldX - offset;
    if (!Number.isInteger(local))
        return null;
    if (local < 0 || local >= b.width)
        return null;
    return local;
}
export function coordFromWorld(b, worldX, y) {
    const boardX = worldToBoardX(b, y, worldX);
    return boardX === null ? null : { x: boardX, y };
}
export function atWorld(b, worldX, y) {
    const coord = coordFromWorld(b, worldX, y);
    if (!coord)
        return undefined;
    return at(b, coord.x, coord.y);
}
export function describeRow(b, y) {
    const rank = b.height - y;
    return `rank ${rank}`;
}
function ensureRowArray(b) {
    if (!Array.isArray(b.rowOffsets) || b.rowOffsets.length !== b.height) {
        b.rowOffsets = Array.from({ length: b.height }, () => 0);
    }
}
function ensureColorArray(b) {
    if (!Array.isArray(b.rowColorInvert) || b.rowColorInvert.length !== b.height) {
        b.rowColorInvert = Array.from({ length: b.height }, () => false);
    }
}
