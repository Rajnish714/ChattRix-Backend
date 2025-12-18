
import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import listen from "./sockets/index.js";
import { connectDB } from "./src/config/config.js";
import { setIO } from "./sockets/sockets.js";

const PORT = process.env.PORT || 4000;
const HOST = "0.0.0.0";

const server = http.createServer(app);
console.log("NODE_ENV =", process.env.NODE_ENV);
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : [];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true,
  },
});

setIO(io);

async function start() {
  await connectDB();
  listen(io);

  server.listen(PORT, HOST, () => {
    console.log(`Server running on ${HOST}:${PORT}`);
  });
}

start();

