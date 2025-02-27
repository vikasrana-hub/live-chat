"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connection = {};
async function dbConnect() {
    if (connection.isConnected) {
        console.log("already connected");
        return;
    }
    try {
        const db = await mongoose_1.default.connect(process.env.MONGODB_URI || '', {});
        connection.isConnected = db.connections[0].readyState;
        console.log("db connected");
    }
    catch (error) {
        console.log(error);
        process.exit(1);
    }
}
exports.default = dbConnect;
