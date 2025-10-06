import type { MessageKind, ScheduledEvent } from "@pkg/common";
import type { Board } from "./board.js";
import type { GameFlags } from "./state.js";
export interface EventContext {
    board: Board;
    flags: GameFlags;
}
export interface EventProcessingResult {
    board: Board;
    flags: GameFlags;
    followUp: ScheduledEvent[];
    messages: EventMessage[];
}
export declare function processScheduledEvents(ctx: EventContext, events: ScheduledEvent[]): EventProcessingResult;
export interface EventMessage {
    text: string;
    kind: MessageKind;
}
//# sourceMappingURL=events.d.ts.map