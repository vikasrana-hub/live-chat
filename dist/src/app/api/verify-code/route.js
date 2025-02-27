"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const dbConnect_1 = __importDefault(require("@/lib/dbConnect"));
const User_1 = __importDefault(require("@/model/User"));
async function POST(request) {
    await (0, dbConnect_1.default)(); // Ensure database connection
    try {
        // Parse request body
        const { username, code } = await request.json();
        // Validate request inputs
        if (!code) {
            return new Response(JSON.stringify({
                success: false,
                message: "code are required.",
            }), { status: 400 });
        }
        // Find user by username
        const user = await User_1.default.findOne({ username });
        // Check if user exists
        if (!user) {
            return new Response(JSON.stringify({
                success: false,
                message: "User not found.",
            }), { status: 404 });
        }
        // Check if the code matches
        const isCodeValid = user.verifyCode === code;
        if (isCodeValid) {
            // Update user as verified
            user.isVerified = true;
            await user.save(); // Ensure the save method is invoked
            return new Response(JSON.stringify({
                success: true,
                message: "User verified successfully.",
            }), { status: 200 });
        }
        else {
            // Incorrect verification code
            return new Response(JSON.stringify({
                success: false,
                message: "Incorrect code. Please try again.",
            }), { status: 400 });
        }
    }
    catch (error) {
        console.error("Error verifying user:", error);
        // Internal server error
        return new Response(JSON.stringify({
            success: false,
            message: "An error occurred while verifying the user.",
        }), { status: 500 });
    }
}
