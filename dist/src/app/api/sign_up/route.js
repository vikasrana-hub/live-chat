"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const sendverification_1 = require("@/helpers/sendverification");
const dbConnect_1 = __importDefault(require("@/lib/dbConnect"));
const User_1 = __importDefault(require("@/model/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const server_1 = require("next/server"); // Import NextResponse
const react_1 = __importDefault(require("react"));
const verificationemails_1 = require("../../../../emails/verificationemails");
async function POST(request) {
    try {
        // Connect to the database
        await (0, dbConnect_1.default)();
        // Get data from request
        const { username, password, email } = await request.json();
        // Check if the username is already verified
        const existingUserVerifiedByUsername = await User_1.default.findOne({
            username,
            isVerified: true,
        });
        if (existingUserVerifiedByUsername) {
            return server_1.NextResponse.json({
                success: false,
                message: "Username already verified",
            }, { status: 400 });
        }
        // Check if the email already exists
        const existsingUserbyEmail = await User_1.default.findOne({ email });
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        if (existsingUserbyEmail) {
            if (existsingUserbyEmail.isVerified) {
                return server_1.NextResponse.json({
                    success: false,
                    message: "User already exists",
                }, { status: 400 });
            }
        }
        else {
            // Hash password and create a new user
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            const newUser = new User_1.default({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                isVerified: false,
            });
            await newUser.save();
        }
        try {
            await sendverification_1.resend.emails.send({
                from: 'Vidlive <onboarding@resend.dev>',
                to: [email],
                subject: 'Vidlive | OTP Verification',
                react: react_1.default.createElement(verificationemails_1.VerificationEmail, {
                    email: email,
                    username: username,
                    verifyCode: verifyCode,
                }),
            });
        }
        catch (emailError) {
            console.error("Error sending verification email:", emailError);
            return server_1.NextResponse.json({
                success: false,
                message: "User registered, but email not sent. Please try again.",
            }, { status: 500 });
        }
        // Return success response
        return server_1.NextResponse.json({
            success: true,
            message: "User registered successfully. Please check your email for verification.",
        });
    }
    catch (error) {
        console.error('Error registering user:', error);
        return server_1.NextResponse.json({
            success: false,
            message: "Error registering user, please try again later.",
        }, { status: 500 });
    }
}
