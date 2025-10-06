import { Server, type Socket } from "socket.io";
import { initialState, reduce, seedStandardPosition, type GameState, type GameResult } from "@pkg/engine";
import type { Action, Color } from "@pkg/common";

const io = new Server(3001, { cors: { origin: "*" } });
console.log("Server listening on :3001");

type PlayerColor = Color;
type PlayerStatus = "idle" | "waiting" | "playing";
interface PlayerMeta { color: PlayerColor | null; status: PlayerStatus; }

interface Match {
  state: GameState;
  players: { w: Socket | null; b: Socket | null };
}

let match = createFreshMatch();
const waiting: Socket[] = [];
const metas = new Map<string, PlayerMeta>();

io.on("connection", (socket) => {
  console.log("client", socket.id, "connected");
  metas.set(socket.id, { color: null, status: "idle" });
  sendSnapshot(socket);
  emitMeta(socket);

  socket.on("play", () => joinQueue(socket));

  socket.on("action", (a: Action) => {
    console.log(`[server] ${socket.id} -> action`, a);
    handleAction(socket, a);
  });

  socket.on("request-snapshot", () => sendSnapshot(socket));

  socket.on("disconnect", () => {
    console.log("client", socket.id, "disconnected");
    handleDisconnect(socket);
    metas.delete(socket.id);
  });
});

function createFreshMatch(): Match {
  const state = initialState();
  seedStandardPosition(state.board);
  return { state, players: { w: null, b: null } };
}

function sendSnapshot(target: Socket | typeof io = io) {
  const payload = { state: serializeState(match.state), seq: match.state.seq };
  (target as any).emit("snapshot", payload);
}

function emitMeta(socket: Socket) {
  const meta = metas.get(socket.id);
  if (!meta) return;
  socket.emit("client-meta", meta);
}

function updateMeta(socket: Socket, updates: Partial<PlayerMeta>) {
  const meta = metas.get(socket.id);
  if (!meta) return;
  Object.assign(meta, updates);
  emitMeta(socket);
}

function joinQueue(socket: Socket) {
  const meta = metas.get(socket.id);
  if (!meta) return;

  if (meta.status === "waiting") return;
  if (meta.status === "playing" && !match.state.result) {
    socket.emit("queue-error", { reason: "game in progress" });
    return;
  }

  // If the player was previously in a match, clear their assignment.
  if (meta.color) {
    releasePlayer(meta.color);
  }

  if (!waiting.includes(socket)) {
    waiting.push(socket);
  }
  updateMeta(socket, { status: "waiting", color: null });
  maybeStartNextMatch();
}

function startMatch(socketA: Socket, socketB: Socket) {
  const colors: PlayerColor[] = Math.random() < 0.5 ? ["w", "b"] : ["b", "w"];
  // reset match state
  match = createFreshMatch();
  assignPlayer(socketA, colors[0]!);
  assignPlayer(socketB, colors[1]!);
  sendSnapshot(io);
}

function maybeStartNextMatch() {
  if (matchInProgress()) return;
  if (waiting.length >= 2) {
    const socketA = waiting.shift()!;
    const socketB = waiting.shift()!;
    startMatch(socketA, socketB);
  }
}

function matchInProgress() {
  return !match.state.result && (match.players.w !== null || match.players.b !== null);
}

function assignPlayer(socket: Socket, color: PlayerColor) {
  match.players[color] = socket;
  updateMeta(socket, { color, status: "playing" });
}

function releasePlayer(color: PlayerColor) {
  const current = match.players[color];
  if (!current) return;
  match.players[color] = null;
  updateMeta(current, { color: null, status: "idle" });
}

function handleAction(socket: Socket, action: Action) {
  const meta = metas.get(socket.id);
  if (!meta) return;
  if (!meta.color) {
    socket.emit("action-error", { seq: match.state.seq, reason: "not in match" });
    return;
  }
  if (meta.color !== match.state.toMove) {
    socket.emit("action-error", { seq: match.state.seq, reason: "not your turn" });
    return;
  }

  const next = reduce(match.state, action);
  const error = (next as any)._lastError as string | undefined;
  if (error) {
    console.warn(`[server] action rejected (${socket.id}):`, error);
    socket.emit("action-error", { seq: match.state.seq, reason: error });
    return;
  }

  const prevSeq = match.state.seq;
  match.state = next;
  if (match.state.seq !== prevSeq) {
    console.log(`[server] applied action -> seq ${match.state.seq}`);
    io.emit("delta", { action, seq: match.state.seq, state: serializeState(match.state) });
    if (match.state.result) {
      concludeMatch(match.state.result);
    }
  } else {
    console.log("[server] action produced no change");
  }
}

function concludeMatch(result: GameResult) {
  console.log(`[server] match complete via ${result.method}`);
  ([("w" as PlayerColor), ("b" as PlayerColor)]).forEach((color) => releasePlayer(color));
  maybeStartNextMatch();
}

function handleDisconnect(socket: Socket) {
  const queueIndex = waiting.findIndex((s) => s.id === socket.id);
  if (queueIndex >= 0) waiting.splice(queueIndex, 1);
  const meta = metas.get(socket.id);
  if (!meta) return;
  if (meta.color) {
    const color = meta.color;
    releasePlayer(color);
    const opponentColor: PlayerColor = color === "w" ? "b" : "w";
    const opponent = match.players[opponentColor];
    if (opponent && !match.state.result) {
      match.state = {
        ...match.state,
        seq: match.state.seq + 1,
        phase: "complete",
        result: { winner: opponentColor, method: "disconnect" }
      };
      concludeMatch(match.state.result!);
      sendSnapshot(io);
    }
  }
  maybeStartNextMatch();
}

function serializeState(gs: GameState) {
  return {
    ...gs,
    board: {
      ...gs.board,
      cells: Object.fromEntries(gs.board.cells.entries())
    }
  };
}
