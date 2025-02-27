"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const next_1 = __importDefault(require("next"));
const socket_io_1 = require("socket.io");
const url_1 = require("url");
const dev = process.env.NODE_ENV !== "production";
const app = (0, next_1.default)({ dev });
const handle = app.getRequestHandler();
const PORT = parseInt(process.env.PORT || "3000", 10);
app.prepare().then(() => {
    // Create an HTTP server
    const server = (0, http_1.createServer)((req, res) => {
        const parsedUrl = (0, url_1.parse)(req.url || "", true);
        handle(req, res, parsedUrl);
    });
    // Initialize Socket.IO
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "*",
        },
    });
    // Array to keep track of waiting users
    const waitingUsers = [];
    // Socket.IO connection event
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);
        // When a user joins
        socket.on("join", () => {
            waitingUsers.push(socket.id);
            if (waitingUsers.length >= 2) {
                const user1 = waitingUsers.shift();
                const user2 = waitingUsers.shift();
                if (user1 && user2) {
                    io.to(user1).emit("paired", user2);
                    io.to(user2).emit("paired", user1);
                }
            }
        });
        // Handle WebRTC signaling
        socket.on("signal", (data) => {
            io.to(data.to).emit("signal", { from: socket.id, signal: data.signal });
        });
        // Handle user disconnection
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
    // Start the server
    server.listen(PORT, () => {
        console.log(`Server listening on http://localhost:${PORT}`);
    });
});
