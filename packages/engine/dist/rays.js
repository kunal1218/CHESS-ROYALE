import { at, toWorldX, worldToBoardX } from "./board.js";
export function firstBlockerOnRay(b, x, y, dx, dy) {
    let worldX = toWorldX(b, { x, y }) + dx;
    let ny = y + dy;
    while (ny >= 0 && ny < b.height) {
        const boardX = worldToBoardX(b, ny, worldX);
        if (boardX === null)
            break;
        const cell = at(b, boardX, ny);
        if (cell?.piece)
            return { x: boardX, y: ny, cell };
        worldX += dx;
        ny += dy;
    }
    return null;
}
export function walkRayUntilBlock(b, x, y, dx, dy) {
    const out = [];
    let worldX = toWorldX(b, { x, y }) + dx;
    let ny = y + dy;
    while (ny >= 0 && ny < b.height) {
        const boardX = worldToBoardX(b, ny, worldX);
        if (boardX === null)
            break;
        out.push({ x: boardX, y: ny });
        const cell = at(b, boardX, ny);
        if (cell?.piece)
            break;
        worldX += dx;
        ny += dy;
    }
    return out;
}
