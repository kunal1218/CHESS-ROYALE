import React from "react";

export type DiscoTiming = { duration: number; delay: number };

type Props = {
  x: number;
  y: number;
  selected: boolean;
  onClick: () => void;
  children?: React.ReactNode;
  invert?: boolean;
  disco?: boolean;
  discoTiming?: DiscoTiming | null;
};

const BASE_LIGHT = "#efeeda";
const BASE_DARK = "#6b8e23";
export const DISCO_LIGHT = "#f9a8d4";
export const DISCO_LIGHT_DIM = "rgba(249, 168, 212, 0.55)";
export const DISCO_DARK = "#7c3aed";
export const DISCO_DARK_DIM = "rgba(124, 58, 237, 0.82)";

export function Square({
  x,
  y,
  selected,
  onClick,
  invert = false,
  disco = false,
  discoTiming = null,
  children
}: Props) {
  const isDark = (x + y) % 2 === 1;
  const dark = invert ? !isDark : isDark;
  const background = dark
    ? disco ? DISCO_DARK : BASE_DARK
    : disco ? DISCO_LIGHT : BASE_LIGHT;
  const animation = disco && discoTiming
    ? `${dark ? "disco-fade-dark" : "disco-fade-light"} ${discoTiming.duration}s ease-in-out infinite alternate`
    : undefined;
  const animationDelay = disco && discoTiming ? `${discoTiming.delay}s` : undefined;
  return (
    <div
      onClick={onClick}
      style={{
        width: "var(--sq, 64px)",
        height: "var(--sq, 64px)",
        display: "grid",
        placeItems: "center",
        userSelect: "none",
        background,
        border: selected ? "3px solid #f59e0b" : "1px solid transparent",
        boxSizing: "border-box",
        fontSize: "calc(var(--sq, 64px) * 0.6)",
        lineHeight: 1,
        animation,
        animationDelay
      }}
    >
      {children}
    </div>
  );
}
