import { io, Socket } from "socket.io-client";
import * as SecureStore from "expo-secure-store";

let socket: Socket | null = null;

const notificationListeners = new Set<(count: number) => void>();

function decodeUserId(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    const padded = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(padded);
    return JSON.parse(json).userId || null;
  } catch {
    return null;
  }
}

export function onNotificationNew(cb: (count: number) => void): () => void {
  notificationListeners.add(cb);
  return () => {
    notificationListeners.delete(cb);
  };
}

export async function connectSocket(): Promise<Socket | null> {
  if (socket?.connected) {
    return socket;
  }

  const token = await SecureStore.getItemAsync("auth-token");
  if (!token) {
    return null;
  }

  const userId = decodeUserId(token);

  socket = io(process.env.EXPO_PUBLIC_SOCKET_URL, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    if (userId) {
      socket?.emit("join:user", userId);
    }
  });

  socket.on("notification:new", (payload: { count?: number }) => {
    const count = Number(payload?.count) || 0;
    notificationListeners.forEach((cb) => cb(count));
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}

export type ChatMessagePayload = {
  _id: string;
  room: string;
  from: string | null;
  text: string;
  isAgent: boolean;
  createdAt: string;
};

export function onChatNew(cb: (payload: ChatMessagePayload) => void): () => void {
  const s = getSocket();
  if (!s) return () => {};
  s.on("chat:new", cb as any);
  return () => s.off("chat:new", cb as any);
}

export async function emitChatSend(room: string, text: string): Promise<void> {
  const s = getSocket() ?? (await connectSocket());
  if (!s) return;
  s.emit("chat:send", { room, text });
}
