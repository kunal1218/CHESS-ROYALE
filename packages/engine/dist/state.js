export function makeBoard(width = 8, height = 8) {
    const board = {
        width,
        height,
        cells: new Map(),
        rowOffsets: Array.from({ length: height }, () => 0),
        rowColorInvert: Array.from({ length: height }, () => false)
    };
    return board;
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
        schedule: {},
        castling: {
            w: { kingSide: true, queenSide: true },
            b: { kingSide: true, queenSide: true }
        },
        enPassant: null,
        result: null,
        messages: []
    };
}
