import React from "react";
import { BoardView } from "./components/Board";
import { socket } from "./sockets";
import { getState, subscribe, dispatch, getPlayerColor, getQueueStatus, requestPlay } from "./store";

export default function App() {
  const [, rerender] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    const unsub = subscribe(rerender);
    return unsub;
  }, []);

  const s = getState();
  const myColor = getPlayerColor();
  const queueStatus = getQueueStatus();
  const recentMessages = React.useMemo(() => s.messages.slice(-5), [s.messages]);
  const resultMessage = React.useMemo(() => {
    if (!s.result) return null;
    if (s.result.method === "stalemate") return "Draw by stalemate";
    const winner = s.result.winner === "w" ? "White" : "Black";
    if (s.result.method === "disconnect") return `${winner} wins by disconnect`;
    return `${winner} wins by checkmate`;
  }, [s.result]);
  const systemFeed = React.useMemo(() => {
    const feed: { text: string; kind: "result" | "info" | "warning" | "danger" }[] = [];
    if (resultMessage) feed.push({ text: resultMessage, kind: "result" });
    for (const msg of recentMessages) feed.push({ text: msg.text, kind: msg.kind });
    return feed;
  }, [recentMessages, resultMessage]);
  const boardColumnRef = React.useRef<HTMLDivElement | null>(null);
  const SHIFT_PADDING = 64;
  const MESSAGE_RESERVE = 120;

  const computeSquareSize = React.useCallback(() => {
    if (typeof window === "undefined") return 100;
    const column = boardColumnRef.current;
    const rect = column?.getBoundingClientRect();
    const widthAllowance = Math.max(
      320,
      (rect?.width ?? window.innerWidth * 0.55) - SHIFT_PADDING * 2 - 24
    );
    const heightAllowance = Math.max(
      320,
      (rect?.height ?? window.innerHeight - 140) - SHIFT_PADDING * 2 - MESSAGE_RESERVE
    );
    const widthSquares = s.board.width + 0.5;
    const heightSquares = s.board.height + 0.5;
    const candidate = Math.min(widthAllowance / widthSquares, heightAllowance / heightSquares);
    return Math.max(72, Math.min(110, Math.floor(candidate)));
  }, [s.board.width, s.board.height]);

  const [squareSize, setSquareSize] = React.useState(() => computeSquareSize());

  React.useLayoutEffect(() => {
    const handle = () => {
      const next = computeSquareSize();
      setSquareSize(prev => (prev !== next ? next : prev));
    };
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, [computeSquareSize]);

  const playLabel = queueStatus === "waiting"
    ? "Waiting for opponent…"
    : queueStatus === "playing"
      ? myColor
        ? `Playing as ${myColor === "w" ? "White" : "Black"}`
        : "Playing"
      : "Play";
  const playDisabled = queueStatus !== "idle";
  const controlsDisabled = queueStatus !== "playing";
  const roleLabel = queueStatus === "waiting"
    ? "In queue…"
    : myColor
      ? myColor === "w" ? "White" : "Black"
      : "Spectating";

  return (
    <div style={{ fontFamily: "Inter, ui-sans-serif, system-ui", minHeight: "100vh", display: "flex", background: "#1d1f23", color: "#f9fafb" }}>
      <aside style={{ width: 200, background: "#191a1e", display: "flex", flexDirection: "column", padding: "20px 16px", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 18 }}>
          <span style={{ color: "#22c55e", fontSize: 24 }}>♞</span>
          <span>Chess.wtf</span>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 18, flexGrow: 1 }}>
          <SidebarButton label="Play" active />
          <SidebarButton label="Puzzles" />
          <SidebarButton label="Learn" />
          <SidebarButton label="Watch" />
          <SidebarButton label="News" />
          <SidebarButton label="Social" />
          <SidebarButton label="More" />
        </nav>
        <div style={{ display: "grid", gap: 10 }}>
          <input
            placeholder="Search"
            style={{
              background: "#111827",
              border: "1px solid #111827",
              borderRadius: 999,
              padding: "8px 12px",
              color: "#f9fafb"
            }}
          />
          <button style={sideCtaStyle}>Sign Up</button>
          <button style={{ ...sideCtaStyle, background: "#4b5563" }}>Log In</button>
        </div>
      </aside>

      <main style={{ flexGrow: 1, display: "flex", padding: "24px 40px", gap: 32 }}>
        <section
          ref={boardColumnRef}
          style={{ flexBasis: "54%", display: "flex", flexDirection: "column", gap: 16, minHeight: "calc(100vh - 120px)" }}
        >
          {(() => {
            const boardAlerts: JSX.Element[] = [];

            const overlayPieces = (
              <div
                style={{
                  position: "absolute",
                  top: 24,
                  left: 24,
                  right: 24,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  pointerEvents: "none",
                  opacity: 0.9
                }}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 24 }}>Opponent</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Rating pending…</div>
                  </div>
                  <div
                    style={{
                      background: "rgba(15, 23, 42, 0.8)",
                      color: "#f9fafb",
                      padding: "6px 14px",
                      borderRadius: 999,
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: 1
                    }}
                  >
                    {myColor ? `Playing as ${myColor === "w" ? "White" : "Black"}` : "Spectating"}
                  </div>
                </div>
                <button
                  onClick={requestPlay}
                  disabled={playDisabled}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 999,
                    background: playDisabled ? "#374151" : "#22c55e",
                    color: "#0b0f16",
                    border: "none",
                    fontWeight: 600,
                    cursor: playDisabled ? "not-allowed" : "pointer",
                    pointerEvents: playDisabled ? "none" : "auto"
                  }}
                >
                  {playLabel}
                </button>
              </div>
            );

            return (
              <div
                style={{
                  position: "relative",
                  flexGrow: 1,
                  background: "#111827",
                  borderRadius: 16,
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "visible",
                  minHeight: Math.max(620, squareSize * 8 + SHIFT_PADDING * 2 + MESSAGE_RESERVE)
                }}
              >
                {overlayPieces}
                <div
                  style={{
                    flexGrow: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "visible"
                  }}
                >
                  <div style={{ padding: SHIFT_PADDING, paddingTop: SHIFT_PADDING + 80, overflow: "visible" }}>
                    <BoardView squareSize={squareSize} />
                  </div>
                </div>
              </div>
            );
          })()}

          <footer style={{ display: "flex", justifyContent: "space-between", fontSize: 13, opacity: 0.7 }}>
            <span><b>Role:</b> {roleLabel}</span>
            <span><b>To move:</b> {s.toMove}</span>
            <span>socket: {socket.connected ? "connected" : "…connecting"}</span>
          </footer>
        </section>

        <section style={{ flexBasis: "18%", display: "flex", flexDirection: "column" }}>
          <div style={{ background: "#111827", borderRadius: 16, padding: 18, display: "flex", flexDirection: "column", height: "100%", gap: 12 }}>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>Game Chat</div>
                <div style={{ fontSize: 11, opacity: 0.6 }}>Bot • GAME ANNOUNCEMENT</div>
              </div>
              <span style={{ fontSize: 12, opacity: 0.5 }}>Beta</span>
            </header>
            <div
              style={{
                flexGrow: 1,
                overflowY: "auto",
                display: "grid",
                gap: 10,
                paddingRight: 4
              }}
            >
              {systemFeed.length ? systemFeed.map((msg, idx) => (
                <div key={`chat-${idx}`} style={{ background: "rgba(30,41,59,0.7)", borderRadius: 12, padding: "10px 12px", border: "1px solid rgba(248,250,252,0.05)" }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, color: "#facc15", marginBottom: 4 }}>GAME ANNOUNCEMENT</div>
                  <div style={{ fontSize: 13, lineHeight: 1.35 }}>{msg.text}</div>
                </div>
              )) : (
                <div style={{ fontSize: 12, opacity: 0.6 }}>No announcements yet.</div>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.4 }}>
              <input
                disabled
                placeholder="Chat disabled — system only"
                style={{
                  flexGrow: 1,
                  background: "rgba(30,41,59,0.6)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: 999,
                  padding: "8px 12px",
                  color: "#f9fafb"
                }}
              />
              <button disabled style={{ padding: "8px 12px", borderRadius: 999, border: "none", background: "#1f2937", color: "#9ca3af" }}>Send</button>
            </div>
          </div>
        </section>

        <section style={{ flexBasis: "22%", display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ background: "#111827", borderRadius: 16, padding: 20, display: "grid", gap: 16 }}>
            <header style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24 }}>🥂</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 22 }}>Play Chess</div>
                <div style={{ fontSize: 12, opacity: 0.6 }}>Pick a vibe. Hit start. Go wild.</div>
              </div>
            </header>
            <ActionCard
              title="Play Online"
              description="Battle a real human with chaotic rules."
            />
            <ActionCard title="Play Bots" description="Challenge our legally distinct AI overlords." />
            <ActionCard title="Play Coach" description="Ask the Prince for questionable advice." />
            <ActionCard title="Play a Friend" description="Invite buddies to the disaster." />
            <ActionCard title="Tournaments" description="Join a quake-and-disco arena." />
            <ActionCard title="Chess Variants" description="Princes, quakes, and vibes galore." />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, opacity: 0.55 }}>
              <span>📜 Game History</span>
              <span>🏆 Leaderboard</span>
            </div>
            <button
              onClick={requestPlay}
              disabled={playDisabled}
              style={{
                padding: "12px 18px",
                borderRadius: 999,
                background: "#fde047",
                color: "#3f3f46",
                border: "none",
                fontWeight: 700,
                cursor: playDisabled ? "not-allowed" : "pointer"
              }}
            >
              Start Game
            </button>
          </div>
        </section>

        <aside style={{ flexBasis: "17%", display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ background: "#111827", borderRadius: 16, padding: 18, minHeight: 280, display: "grid", gap: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Featured Chaos</div>
            <PlaceholderTile label="Daily quake forecast" />
            <PlaceholderTile label="New Prince skins" />
            <PlaceholderTile label="Advertise here (plz)" />
          </div>
          <div style={{ background: "#111827", borderRadius: 16, padding: 18, display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Status</div>
            <div style={{ fontSize: 13, opacity: 0.7 }}>
              Queue: {queueStatus === "idle" ? "idle" : queueStatus}
            </div>
            <button
              onClick={() => dispatch({ t: "TOGGLE_FLAG", key: "disco" })}
              disabled={controlsDisabled}
              style={miniToggleStyle}
            >
              Toggle Disco ({String(s.flags.disco)})
            </button>
            <button
              onClick={() => dispatch({ t: "TOGGLE_FLAG", key: "earthquakes" })}
              disabled={controlsDisabled}
              style={miniToggleStyle}
            >
              Toggle Quakes ({String(s.flags.earthquakes)})
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}

function SidebarButton({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 12,
        background: active ? "rgba(34,197,94,0.16)" : "transparent",
        color: active ? "#f9fafb" : "rgba(249,250,251,0.65)",
        border: "none",
        textAlign: "left",
        fontWeight: active ? 600 : 500,
        cursor: "pointer"
      }}
    >
      <span style={{ fontSize: 18 }}>•</span>
      {label}
    </button>
  );
}

function ActionCard({ title, description }: { title: string; description: string }) {
  return (
    <div style={{
      padding: "14px 16px",
      borderRadius: 12,
      background: "#181b1f",
      border: "1px solid rgba(250,250,250,0.04)",
      display: "grid",
      gap: 4
    }}>
      <div style={{ fontWeight: 600, fontSize: 15 }}>{title}</div>
      <div style={{ fontSize: 12, opacity: 0.7 }}>{description}</div>
    </div>
  );
}

function PlaceholderTile({ label }: { label: string }) {
  return (
    <div style={{
      padding: "12px 14px",
      borderRadius: 12,
      background: "#181b1f",
      fontSize: 13,
      opacity: 0.75
    }}>
      {label}
    </div>
  );
}

const sideCtaStyle: React.CSSProperties = {
  background: "#22c55e",
  color: "#0b0f16",
  border: "none",
  borderRadius: 999,
  padding: "10px 0",
  fontWeight: 600,
  cursor: "pointer"
};

const miniToggleStyle: React.CSSProperties = {
  background: "#1f2937",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#f9fafb",
  borderRadius: 999,
  padding: "8px 12px",
  fontSize: 12,
  cursor: "pointer"
};
