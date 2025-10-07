import { io } from "socket.io-client";

// Read from Vite env; fall back to localhost only in dev
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ??
  (import.meta.env.DEV ? "http://localhost:3001" : undefined);

if (!SOCKET_URL) {
  // Optional: helpful error if you forgot to set it in Vercel
  console.error("VITE_SOCKET_URL is not set for production build.");
}

export const socket = io(SOCKET_URL!, {
  // keep both to survive proxies/CDNs
  transports: ["websocket", "polling"],
  withCredentials: false,
});
