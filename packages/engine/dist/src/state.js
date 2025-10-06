export function makeBoard(width = 8, height = 8) {
    return { width, height, cells: new Map() };
}
export function initialState() {
    return {
        board: makeBoard(8, 8),
        phase: "game",
        toMove: "w",
        moveCount: 0,
        seq: 0,
        clocks: { w: 5 * 60000, b: 5 * 60000 },
        flags: { earthquakes: false, disco: false },
        schedule: {}
    };
}
