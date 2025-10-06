import { key, resetRowOffsets } from "./board.js";
export function seedStandardPosition(board) {
    board.width = Math.max(board.width, 8);
    board.height = Math.max(board.height, 8);
    board.cells.clear();
    resetRowOffsets(board);
    const placements = [];
    const whiteBack = ["WR", "WN", "WB", "WQ", "WK", "WB", "WN", "WR"];
    const blackBack = ["BR", "BN", "BB", "BQ", "BK", "BB", "BN", "BR"];
    for (let x = 0; x < 8; x++) {
        placements.push({ x, y: 7, piece: whiteBack[x] });
        placements.push({ x, y: 6, piece: "WP" });
        placements.push({ x, y: 1, piece: "BP" });
        placements.push({ x, y: 0, piece: blackBack[x] });
    }
    for (const { x, y, piece } of placements) {
        board.cells.set(key(x, y), { piece });
    }
}
