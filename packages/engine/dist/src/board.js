export const key = (x, y) => `${x}:${y}`;
export const inBounds = (b, x, y) => x >= 0 && x < b.width && y >= 0 && y < b.height;
export const at = (b, x, y) => inBounds(b, x, y) ? b.cells.get(key(x, y)) : undefined;
export const set = (b, x, y, cell) => b.cells.set(key(x, y), cell);
export function shallowCloneBoard(b) {
    return { width: b.width, height: b.height, cells: new Map(b.cells) };
}
