import { createServer } from "http";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { parse } from "url";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });

const handle = app.getRequestHandler();

const PORT = parseInt(process.env.PORT || "3000", 10);

app.prepare().then(() => {
    // Create an HTTP server
    const server = createServer((req, res) => {
        const parsedUrl = parse(req.url || "", true);
        handle(req, res, parsedUrl);
    });

    // Initialize Socket.IO
    const io = new SocketIOServer(server, {
        cors: {
            origin: "*",
        },
    });

    // Array to keep track of waiting users
    const waitingUsers: string[] = [];

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
        socket.on("signal", (data: { to: string; signal: any }) => {
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
