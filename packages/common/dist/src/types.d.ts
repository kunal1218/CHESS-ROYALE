export type Color = "w" | "b";
export type Coord = {
    x: number;
    y: number;
};
export type ScheduledEvent = {
    t: "EARTHQUAKE";
    row?: number;
} | {
    t: "RESTORE_ROW";
    row: number;
};
export type Action = {
    t: "MOVE";
    from: Coord;
    to: Coord;
} | {
    t: "TOGGLE_FLAG";
    key: "earthquakes" | "disco";
    value?: boolean;
} | {
    t: "SCHEDULE_EVENT";
    atMove: number;
    event: ScheduledEvent;
} | {
    t: "BOARD_SHIFT_ROW";
    y: number;
    dx: number;
} | {
    t: "BOARD_RESTORE_ROW";
    y: number;
} | {
    t: "DEBUG_RESET";
};
