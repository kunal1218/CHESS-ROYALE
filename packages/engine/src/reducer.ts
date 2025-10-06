import type { Action, PromotionChoice } from "@pkg/common";
import type { GameState } from "./state.js";
import { at, shallowCloneBoard, key, describeRow } from "./board.js";
import type { Board, Coord, Color } from "./board.js";
import { applyMoveShallow, findKing, hasAnyLegalMoves } from "./legal.js";
import { validateMove } from "./validate.js";
import { processScheduledEvents } from "./events.js";
import { colorOf, isKing, isPawn, isRook, bishopId, knightId, queenId, rookId } from "./pieces.js";
import { isSquareAttacked } from "./attack.js";

export function reduce(prev: GameState, a: Action): GameState {
  const next: GameState = {
    ...prev,
    board: shallowCloneBoard(prev.board),
    flags: { ...prev.flags },
    schedule: { ...prev.schedule },
    castling: {
      w: { ...prev.castling.w },
      b: { ...prev.castling.b }
    },
    enPassant: prev.enPassant,
    messages: [...prev.messages]
  };
  let changed = false;

  switch (a.t) {
    case "TOGGLE_FLAG": {
      const cur = prev.flags[a.key];
      const desired = a.value ?? !cur;
      if (a.key === "earthquakes") {
        if (desired !== cur) {
          next.flags.earthquakes = desired;
          changed = true;
          if (desired) scheduleEarthquake(next, prev);
        }
        break;
      }
      if (a.key === "disco") {
        if (desired && !cur) {
          scheduleDisco(next, prev);
          changed = true;
        } else if (!desired && cur) {
          next.flags.disco = false;
          appendMessage(next, "Disco manually stopped.", "info");
          changed = true;
        }
        break;
      }
      break;
    }
    case "SCHEDULE_EVENT": {
      const existing = next.schedule[a.atMove] ?? [];
      next.schedule[a.atMove] = [...existing, a.event];
      changed = true;
      break;
    }
    case "MOVE": {
      if (prev.result) {
        (next as any)._lastError = "game complete";
        break;
      }
      const verdict = validateMove(prev, a.from, a.to);
      if (!verdict.ok) {
        (next as any)._lastError = verdict.reason;
        break;
      }
      const movingPiece = at(prev.board, a.from.x, a.from.y)?.piece!;
      const moverColor = colorOf(movingPiece);
      next.board = applyMoveShallow(prev.board, a.from, a.to, { enPassant: prev.enPassant });
      next.toMove = moverColor === "w" ? "b" : "w";
      next.moveCount++;
      next.enPassant = null;

      if (isPawn(movingPiece) && Math.abs(a.to.y - a.from.y) === 2) {
        next.enPassant = { x: a.from.x, y: (a.from.y + a.to.y) / 2 };
      }

      const castlingForMover = next.castling[moverColor];
      if (isKing(movingPiece)) {
        castlingForMover.kingSide = false;
        castlingForMover.queenSide = false;
      }
      if (isRook(movingPiece)) {
        const startRank = moverColor === "w" ? prev.board.height - 1 : 0;
        if (a.from.y === startRank) {
          if (a.from.x === 0) castlingForMover.queenSide = false;
          if (a.from.x === prev.board.width - 1) castlingForMover.kingSide = false;
        }
      }

      const captured = at(prev.board, a.to.x, a.to.y)?.piece;
      if (captured && isRook(captured)) {
        const capturedColor = colorOf(captured);
        const enemyRights = next.castling[capturedColor];
        const enemyStartRank = capturedColor === "w" ? prev.board.height - 1 : 0;
        if (a.to.y === enemyStartRank) {
          if (a.to.x === 0) enemyRights.queenSide = false;
          if (a.to.x === prev.board.width - 1) enemyRights.kingSide = false;
        }
      }

      if (isPawn(movingPiece) && prev.enPassant && a.to.x === prev.enPassant.x && a.to.y === prev.enPassant.y) {
        // en passant capture removes pawn already; nothing more to update
      }

      maybePromote(next.board, a.to, moverColor, a.promotion);

      const pending = next.schedule[next.moveCount];
      if (pending?.length) {
        const { board, flags, followUp, messages: eventMessages } = processScheduledEvents(
          { board: next.board, flags: next.flags },
          pending
        );
        next.board = board;
        next.flags = flags;
        delete next.schedule[next.moveCount];
        if (eventMessages.length) {
          for (const msg of eventMessages) {
            appendMessage(next, msg.text, msg.kind);
          }
        }
        if (followUp.length) {
          const targetMove = next.moveCount + 1; // TODO: allow events to control rescheduling.
          next.schedule[targetMove] ??= [];
          next.schedule[targetMove].push(...followUp);
        }
      }

      const enemy = next.toMove;
      const enemyKing = findKing(next.board, enemy);
      const inCheck = isSquareAttacked(next.board, enemyKing, moverColor, next.flags);
      const enemyHasMoves = hasAnyLegalMoves(next, enemy);
      if (!enemyHasMoves) {
        next.phase = "complete";
        next.result = inCheck
          ? { winner: moverColor, method: "checkmate" }
          : { winner: null, method: "stalemate" };
      }

      changed = true;
      break;
    }
    case "BOARD_SHIFT_ROW":
    case "BOARD_RESTORE_ROW":
    case "DEBUG_RESET": {
      // stubs for future features
      break;
    }
  }

  if (!changed) {
    next.seq = prev.seq;
    return next;
  }

  next.seq = prev.seq + 1;
  pruneExpiredMessages(next);
  return next;
}

function maybePromote(board: Board, to: Coord, moverColor: Color, choice: PromotionChoice | undefined) {
  const cell = at(board, to.x, to.y);
  if (!cell?.piece || !isPawn(cell.piece)) return;
  if (cell.pieceFlags?.restrictions?.noPromotion) return;
  if (!isPromotionRank(board, to, moverColor)) return;
  const promotion = normalizePromotion(choice);
  cell.piece = promotionId(moverColor, promotion);
  delete cell.pieceFlags;
  board.cells.set(key(to.x, to.y), cell);
}

function isPromotionRank(board: Board, square: Coord, color: Color): boolean {
  return color === "w" ? square.y === 0 : square.y === board.height - 1;
}

function normalizePromotion(choice: PromotionChoice | undefined): PromotionChoice {
  switch (choice) {
    case "N":
    case "B":
    case "R":
    case "Q":
      return choice;
    default:
      return "Q";
  }
}

function promotionId(color: Color, choice: PromotionChoice): string {
  switch (choice) {
    case "N": return knightId(color);
    case "B": return bishopId(color);
    case "R": return rookId(color);
    case "Q":
    default:
      return queenId(color);
  }
}

function scheduleEarthquake(next: GameState, prev: GameState) {
  const board = next.board;
  if (board.height <= 0) return;
  const candidates = determineQuakeRows(board.height);
  if (!candidates.length) return;
  const row = randomChoice(candidates);
  const direction: "left" | "right" = Math.random() < 0.5 ? "left" : "right";
  const quakeDelay = 3;
  const duration = 5;
  const quakeMove = prev.moveCount + quakeDelay;
  const quakeEvent = { t: "EARTHQUAKE" as const, row, direction, duration };
  const existingQuakes = next.schedule[quakeMove];
  next.schedule[quakeMove] = existingQuakes ? [...existingQuakes, quakeEvent] : [quakeEvent];

  const restoreMove = quakeMove + duration;
  const restoreEvent = { t: "RESTORE_ROW" as const, row };
  const existingRestore = next.schedule[restoreMove];
  next.schedule[restoreMove] = existingRestore ? [...existingRestore, restoreEvent] : [restoreEvent];

  const label = describeRow(board, row);
  appendMessage(next, `Earthquake warning: ${label} will shake in ${quakeDelay} moves.`, "warning");
}

function scheduleDisco(next: GameState, prev: GameState) {
  const delay = 3;
  const duration = 5;
  const startMove = prev.moveCount + delay;
  const startEvent = { t: "DISCO_START" as const, duration };
  const existing = next.schedule[startMove];
  next.schedule[startMove] = existing ? [...existing, startEvent] : [startEvent];

  const endMove = startMove + duration;
  const endEvent = { t: "DISCO_END" as const };
  const existingEnd = next.schedule[endMove];
  next.schedule[endMove] = existingEnd ? [...existingEnd, endEvent] : [endEvent];

  appendMessage(next, `Disco warning: the board will groove in ${delay} moves!`, "warning");
}

function appendMessage(state: GameState, text: string, kind: "info" | "warning" | "danger") {
  const idBase = state.seq * 100 + state.messages.length + 1;
  state.messages.push({ id: idBase, text, kind });
  const maxMessages = 8;
  if (state.messages.length > maxMessages) {
    state.messages.splice(0, state.messages.length - maxMessages);
  }
}

function pruneExpiredMessages(state: GameState) {
  state.messages = state.messages.filter(msg => {
    if (msg.kind === "warning" && state.flags.disco) return false;
    if (msg.kind === "danger" && !state.flags.disco) return false;
    return true;
  });
}

function determineQuakeRows(height: number): number[] {
  if (height <= 0) return [];
  const middleStart = Math.max(0, Math.floor(height / 2) - 2);
  const rows: number[] = [];
  for (let d = 0; d < 4; d++) {
    const y = middleStart + d;
    if (y >= 0 && y < height) rows.push(y);
  }
  if (!rows.length) {
    for (let y = 0; y < height; y++) rows.push(y);
  }
  return rows;
}

function randomChoice<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}
