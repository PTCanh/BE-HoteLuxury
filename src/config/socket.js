import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const connectedPartners = new Map(); // or use a DB/cache

export function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000", // Set this properly in production
    },
  });

  // Middleware to extract and verify JWT from `auth.Authorization`
  io.use((socket, next) => {
    const authHeader = socket.handshake.auth?.Authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new Error("Authentication error"));
    }

    const token = authHeader.split(" ")[1];

    try {
      const payload = jwt.verify(token, process.env.ACCESS_TOKEN);
      socket.user = payload; // attach user info to socket
      next();
    } catch (err) {
      console.error("JWT Error:", err.message);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const partnerId = socket.user.id; // from token
    connectedPartners.set(partnerId, socket.id);

    console.log(`✅ Partner ${partnerId} connected with socket ${socket.id}`);

    socket.on("disconnect", () => {
      connectedPartners.delete(partnerId);
      console.log(`❌ Partner ${partnerId} disconnected`);
    });
  });

  return { io, connectedPartners };
}
