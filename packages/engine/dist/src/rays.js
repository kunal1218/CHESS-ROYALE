import { at, inBounds } from "./board";
export function firstBlockerOnRay(b, x, y, dx, dy) {
    let nx = x + dx, ny = y + dy;
    while (inBounds(b, nx, ny)) {
        const cell = at(b, nx, ny);
        if (cell?.piece)
            return { x: nx, y: ny, cell };
        nx += dx;
        ny += dy;
    }
    return null;
}
export function walkRayUntilBlock(b, x, y, dx, dy) {
    const out = [];
    let nx = x + dx, ny = y + dy;
    while (inBounds(b, nx, ny)) {
        out.push({ x: nx, y: ny });
        const cell = at(b, nx, ny);
        if (cell?.piece)
            break;
        nx += dx;
        ny += dy;
    }
    return out;
}
