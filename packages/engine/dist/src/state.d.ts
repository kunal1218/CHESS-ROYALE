import type { Color, ScheduledEvent } from "@pkg/common";
import type { Board } from "./board";
export type Phase = "lobby" | "draft" | "game" | "complete";
export interface GameState {
    board: Board;
    phase: Phase;
    toMove: Color;
    moveCount: number;
    seq: number;
    clocks: {
        w: number;
        b: number;
    };
    flags: {
        earthquakes: boolean;
        disco: boolean;
    };
    schedule: Record<number, ScheduledEvent[]>;
}
export declare function makeBoard(width?: number, height?: number): Board;
export declare function initialState(): GameState;
