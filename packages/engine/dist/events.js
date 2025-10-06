// Event processing logic for scheduled game events.
import { describeRow, getRowOffset, setRowOffset, setRowInvert } from "./board.js";
export function processScheduledEvents(ctx, events) {
    let current = ctx;
    const followUp = [];
    const messages = [];
    for (const event of events) {
        const outcome = dispatchEvent(current, event);
        current = {
            board: outcome.board,
            flags: outcome.flags ?? current.flags
        };
        followUp.push(...outcome.followUp);
        messages.push(...outcome.messages);
    }
    return {
        board: current.board,
        flags: current.flags,
        followUp,
        messages
    };
}
function dispatchEvent(ctx, event) {
    switch (event.t) {
        case "EARTHQUAKE":
            return handleEarthquake(ctx, event);
        case "RESTORE_ROW":
            return handleRestoreRow(ctx, event);
        case "DISCO_START":
            return handleDiscoStart(ctx, event);
        case "DISCO_END":
            return handleDiscoEnd(ctx);
        default: {
            const _never = event;
            return { board: ctx.board, followUp: [], messages: [] };
        }
    }
}
function handleEarthquake(ctx, event) {
    const delta = event.direction === "left" ? -1 : 1;
    setRowOffset(ctx.board, event.row, delta);
    setRowInvert(ctx.board, event.row, true);
    const label = describeRow(ctx.board, event.row);
    const message = {
        text: `Earthquake! ${label} shifts ${event.direction}.`,
        kind: "danger"
    };
    return { board: ctx.board, followUp: [], messages: [message] };
}
function handleRestoreRow(ctx, event) {
    const current = getRowOffset(ctx.board, event.row);
    if (current !== 0)
        setRowOffset(ctx.board, event.row, 0);
    setRowInvert(ctx.board, event.row, false);
    const message = {
        text: `Seismic calm: ${describeRow(ctx.board, event.row)} returns to normal.`,
        kind: "info"
    };
    return { board: ctx.board, followUp: [], messages: [message] };
}
function handleDiscoStart(ctx, _event) {
    const messages = [{
            text: "Disco time! The board lights up and robots dance.",
            kind: "danger"
        }];
    return {
        board: ctx.board,
        flags: { ...ctx.flags, disco: true },
        followUp: [],
        messages
    };
}
function handleDiscoEnd(ctx) {
    const message = {
        text: "Disco fades out. Back to serious chess.",
        kind: "info"
    };
    return {
        board: ctx.board,
        flags: { ...ctx.flags, disco: false },
        followUp: [],
        messages: [message]
    };
}
