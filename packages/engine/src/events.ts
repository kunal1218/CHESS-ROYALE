// Event processing logic for scheduled game events.

import type { MessageKind, ScheduledEvent } from "@pkg/common";
import type { Board } from "./board.js";
import type { GameFlags } from "./state.js";
import {
  describeRow,
  getRowOffset,
  setRowOffset,
  setRowInvert
} from "./board.js";

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

export function processScheduledEvents(
  ctx: EventContext,
  events: ScheduledEvent[]
): EventProcessingResult {
  let current = ctx;
  const followUp: ScheduledEvent[] = [];
  const messages: EventMessage[] = [];

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

interface EventHandlerResult {
  board: Board;
  flags?: GameFlags;
  followUp: ScheduledEvent[];
  messages: EventMessage[];
}

function dispatchEvent(ctx: EventContext, event: ScheduledEvent): EventHandlerResult {
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
      const _never: never = event;
      return { board: ctx.board, followUp: [], messages: [] };
    }
  }
}

export interface EventMessage {
  text: string;
  kind: MessageKind;
}

type EarthquakeEvent = Extract<ScheduledEvent, { t: "EARTHQUAKE" }>;
type RestoreRowEvent = Extract<ScheduledEvent, { t: "RESTORE_ROW" }>;
type DiscoStartEvent = Extract<ScheduledEvent, { t: "DISCO_START" }>;

function handleEarthquake(ctx: EventContext, event: EarthquakeEvent): EventHandlerResult {
  const delta = event.direction === "left" ? -1 : 1;
  setRowOffset(ctx.board, event.row, delta);
  setRowInvert(ctx.board, event.row, true);
  const label = describeRow(ctx.board, event.row);
  const message: EventMessage = {
    text: `Earthquake! ${label} shifts ${event.direction}.`,
    kind: "danger"
  };
  return { board: ctx.board, followUp: [], messages: [message] };
}

function handleRestoreRow(ctx: EventContext, event: RestoreRowEvent): EventHandlerResult {
  const current = getRowOffset(ctx.board, event.row);
  if (current !== 0) setRowOffset(ctx.board, event.row, 0);
  setRowInvert(ctx.board, event.row, false);
  const message: EventMessage = {
    text: `Seismic calm: ${describeRow(ctx.board, event.row)} returns to normal.`,
    kind: "info"
  };
  return { board: ctx.board, followUp: [], messages: [message] };
}

function handleDiscoStart(ctx: EventContext, _event: DiscoStartEvent): EventHandlerResult {
  const messages: EventMessage[] = [{
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

function handleDiscoEnd(ctx: EventContext): EventHandlerResult {
  const message: EventMessage = {
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
