export type Color = "w" | "b";
export type Coord = {
    x: number;
    y: number;
};
export type ScheduledEvent = {
    t: "EARTHQUAKE";
    row: number;
    direction: "left" | "right";
    duration: number;
} | {
    t: "RESTORE_ROW";
    row: number;
} | {
    t: "DISCO_START";
    duration: number;
} | {
    t: "DISCO_END";
};
export type PromotionChoice = "Q" | "R" | "B" | "N";
export type MessageKind = "info" | "warning" | "danger";
export interface GameMessage {
    id: number;
    text: string;
    kind: MessageKind;
}
export type Action = {
    t: "MOVE";
    from: Coord;
    to: Coord;
    promotion?: PromotionChoice;
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
//# sourceMappingURL=types.d.ts.map