import React from "react";
import { getState, subscribe, dispatch, getPlayerColor } from "../store";
import { type Coord, type PromotionChoice, type Action } from "@pkg/common";
import { at, colorOf, isKnight, isPawn } from "@pkg/engine";
import { Square, DISCO_DARK, DISCO_DARK_DIM, DISCO_LIGHT, DISCO_LIGHT_DIM, type DiscoTiming } from "./Square";

// very tiny piece->glyph mapper (Unicode)
const GLYPH: Record<string, string> = {
  WP: "♙", WN: "♘", WX: "♘♙", WB: "♗", WR: "♖", WQ: "♕", WK: "♔",
  BP: "♟", BN: "♞", BX: "♞♟", BB: "♝", BR: "♜", BQ: "♛", BK: "♚",
};

interface BoardProps {
  squareSize?: number;
}

export function BoardView({ squareSize = 64 }: BoardProps) {
  const [, rerender] = React.useReducer((x) => x + 1, 0);
  const [sel, setSel] = React.useState<Coord | null>(null);

  React.useEffect(() => {
    const unsub = subscribe(rerender);
    return unsub;
  }, []);

  const s = getState();
  const b = s.board;
  const myColor = getPlayerColor();
  const gameOver = !!s.result;
  const myTurn = !!myColor && myColor === s.toMove && !gameOver;

  React.useEffect(() => {
    if (!myTurn) setSel(null);
  }, [myTurn]);

  function onSquareClick(x: number, y: number) {
    if (!myColor || gameOver) return;
    const cell = at(b, x, y);
    const pieceColor = cell?.piece ? colorOf(cell.piece) : null;
    const srcCell = sel ? at(b, sel.x, sel.y) : null;
    const srcPiece = srcCell?.piece ?? null;

    if (!sel) {
      if (pieceColor && pieceColor === myColor && myTurn) setSel({ x, y });
      return;
    }

    if (pieceColor && pieceColor === myColor) {
      if (
        myTurn &&
        srcPiece &&
        isKnight(srcPiece) &&
        cell?.piece &&
        isPawn(cell.piece) &&
        pawnAdvancedAtLeastTwo(b.height, y, pieceColor)
      ) {
        sendMove(sel, { x, y });
        setSel(null);
        return;
      }
      if (pieceColor === s.toMove && myTurn) setSel({ x, y });
      return;
    }
    // 2nd click: attempt move
    if (sel.x === x && sel.y === y) {
      setSel(null);
      return;
    }
    if (!myTurn) {
      setSel(null);
      return;
    }
    const promotion = computePromotion(srcPiece, srcCell?.pieceFlags, y, b.height);
    sendMove(sel, { x, y }, promotion);
    setSel(null);
  }

  const discoActive = s.flags.disco;

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const styleId = "disco-style";
    let style = document.getElementById(styleId) as HTMLStyleElement | null;
    const content = `@keyframes disco-bounce {0% { transform: translateY(0); } 100% { transform: translateY(-12px); }}
@keyframes disco-fade-light {0% { background-color: ${DISCO_LIGHT}; } 50% { background-color: ${DISCO_LIGHT_DIM}; } 100% { background-color: ${DISCO_LIGHT}; }}
@keyframes disco-fade-dark {0% { background-color: ${DISCO_DARK}; } 50% { background-color: ${DISCO_DARK_DIM}; } 100% { background-color: ${DISCO_DARK}; }}`;
    if (!style) {
      style = document.createElement("style");
      style.id = styleId;
      style.textContent = content;
      document.head.appendChild(style);
    } else if (style.textContent !== content) {
      style.textContent = content;
    }
  }, []);

  function renderPieceGlyph(p?: string) {
    if (!p) return undefined;
    const glyph = GLYPH[p] ?? "•";
    const tint = p.startsWith("W") ? "#f9fafb" : "#111827";
    const baseStyle: React.CSSProperties = {
      color: tint,
      textShadow: "0 1px 2px rgba(0,0,0,0.35)"
    };
    if (!discoActive || isDiscoMover(p)) {
      return <span style={baseStyle}>{glyph}</span>;
    }
    return (
      <span
        style={{
          ...baseStyle,
          display: "inline-block",
          animation: "disco-bounce 0.35s ease-in-out infinite alternate"
        }}
      >
        {glyph}
      </span>
    );
  }

  return (
    <div style={{ "--sq": `${squareSize}px` } as React.CSSProperties}>
      <div style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative" }}>
        {Array.from({ length: b.height }).map((_, y) => {
          const rowOffset = b.rowOffsets?.[y] ?? 0;
          const rowInvert = b.rowColorInvert?.[y] ?? false;
          const translate = rowOffset
            ? `translateX(calc(var(--sq, 64px) * ${rowOffset}))`
            : undefined;
          return (
            <div
              key={`row-${y}`}
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${b.width}, var(--sq, 64px))`,
                gap: 0,
                transform: translate,
                transition: "transform 0.3s ease"
              }}
            >
              {Array.from({ length: b.width }).map((_, x) => {
                const cell = at(b, x, y);
                const p = cell?.piece;
                const selected = !!sel && sel.x === x && sel.y === y;
                const discoTiming = discoActive ? computeDiscoTiming(x, y) : null;
                return (
                  <Square
                    key={`${x}:${y}`}
                    x={x}
                    y={y}
                    selected={selected}
                    onClick={() => onSquareClick(x, y)}
                    invert={rowInvert}
                    disco={discoActive}
                    discoTiming={discoTiming}
                  >
                    {renderPieceGlyph(p)}
                  </Square>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function sendMove(from: Coord, to: Coord, promotion?: PromotionChoice) {
  const action: Action = promotion
    ? { t: "MOVE", from, to, promotion }
    : { t: "MOVE", from, to };
  dispatch(action);
}

function isDiscoMover(piece: string): boolean {
  const suffix = piece.slice(-1);
  return suffix === "P" || suffix === "K" || suffix === "Q";
}

function computeDiscoTiming(x: number, y: number): DiscoTiming {
  const norm = pseudoRandom(x + 1, y + 1);
  const normDelay = pseudoRandom(x + 11, y + 7);
  const duration = 2.6 + norm * 2.2; // 2.6s to 4.8s
  const delay = normDelay * 1.5;
  return { duration, delay };
}

function pseudoRandom(x: number, y: number): number {
  const v = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

function computePromotion(
  piece: string | null,
  flags: { restrictions?: { noPromotion?: boolean } } | undefined,
  targetY: number,
  boardHeight: number
): PromotionChoice | undefined {
  if (!piece || !isPawn(piece)) return undefined;
  if (flags?.restrictions?.noPromotion) return undefined;
  const color = colorOf(piece);
  const wantsPromotion =
    (color === "w" && targetY === 0) ||
    (color === "b" && targetY === boardHeight - 1);
  if (!wantsPromotion) return undefined;
  return requestPromotionChoice();
}

function requestPromotionChoice(defaultChoice: PromotionChoice = "Q"): PromotionChoice {
  const allowed: PromotionChoice[] = ["Q", "R", "B", "N"];
  if (typeof window === "undefined") return defaultChoice;
  const raw = window.prompt("Promote to (Q, R, B, N)?", defaultChoice) ?? "";
  const choice = raw.trim().toUpperCase();
  return (allowed.includes(choice as PromotionChoice) ? (choice as PromotionChoice) : defaultChoice);
}

function pawnAdvancedAtLeastTwo(boardHeight: number, y: number, color: "w" | "b"): boolean {
  const startRank = color === "w" ? boardHeight - 2 : 1;
  if (color === "w") return y <= startRank - 2;
  return y >= startRank + 2;
}
