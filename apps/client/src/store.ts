import { initialState, reduce, seedStandardPosition, type GameState, type Cell } from "@pkg/engine";
import type { Action, Color } from "@pkg/common";
import { socket } from "./sockets";

// ---- simple evented store (no external libs) ----
type Listener = () => void;

let state: GameState = initialState();
seedStandardPosition(state.board);
const listeners = new Set<Listener>();
type ClientMeta = { color: Color | null; status: "idle" | "waiting" | "playing" };
let meta: ClientMeta = { color: null, status: "idle" };

export function getState() {
  return state;
}
export function getPlayerColor() {
  return meta.color;
}
export function getQueueStatus() {
  return meta.status;
}
export function subscribe(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
function emit() {
  for (const fn of listeners) fn();
}

type WireState = Omit<GameState, "board"> & {
  board: GameState["board"] & { cells: unknown };
};

// wire socket <-> store
socket.on("snapshot", (payload: { state: WireState; seq: number }) => {
  state = reviveState(payload.state);
  emit();
});

socket.on("delta", (payload: { action: Action; seq: number; state?: WireState }) => {
  if (payload.state) {
    state = reviveState(payload.state);
  } else {
    state = reduce(state, payload.action);
  }
  if (state.seq !== payload.seq) {
    socket.emit("request-snapshot");
    return;
  }
  emit();
});

socket.on("action-error", (payload: { seq: number; reason: string }) => {
  console.warn("server rejected action:", payload.reason);
});

socket.on("client-meta", (payload: ClientMeta) => {
  meta = payload;
  emit();
});

socket.on("queue-error", (payload: { reason: string }) => {
  console.warn("queue error:", payload.reason);
});

// convenience dispatch — send to server
export function dispatch(a: Action) {
  socket.emit("action", a);
}

export function requestPlay() {
  socket.emit("play");
}

function reviveState(raw: WireState): GameState {
  const board = raw.board;
  const revivedCells = new Map<string, Cell>();
  const incoming = (board as unknown as { cells: unknown }).cells;

  if (incoming instanceof Map) {
    for (const [k, cell] of incoming.entries()) revivedCells.set(k, cell as any);
  } else if (Array.isArray(incoming)) {
    for (const [k, cell] of incoming as Array<[string, unknown]>) {
      revivedCells.set(k, cell as any);
    }
  } else if (incoming && typeof incoming === "object") {
    for (const [k, cell] of Object.entries(incoming as Record<string, unknown>)) {
      revivedCells.set(k, cell as any);
    }
  }

  return {
    ...raw,
    board: {
      ...board,
      cells: revivedCells,
      rowOffsets: Array.isArray(board.rowOffsets)
        ? [...board.rowOffsets]
        : Array.from({ length: board.height }, () => 0),
      rowColorInvert: Array.isArray((board as any).rowColorInvert)
        ? [...(board as any).rowColorInvert]
        : Array.from({ length: board.height }, () => false)
    },
    messages: Array.isArray(raw.messages) ? [...raw.messages] : []
  };
}
