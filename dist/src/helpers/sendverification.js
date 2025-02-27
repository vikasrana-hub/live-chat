"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resend = void 0;
exports.POST = POST;
const react_1 = __importDefault(require("react"));
const resend_1 = require("resend");
const verificationemails_1 = require("../../emails/verificationemails");
exports.resend = new resend_1.Resend(process.env.RESEND_API);
async function POST(request) {
    try {
        // Parse the incoming request body
        const { email, username, verifyCode } = await request.json();
        // Validate input
        if (!email || !username || !verifyCode) {
            return new Response(JSON.stringify({ error: 'Missing required fields: email, username, or verifyCode' }), { status: 400 });
        }
        // Send email using Resend
        const { data, error } = await exports.resend.emails.send({
            from: 'Vidlive <onboarding@resend.dev>',
            to: [email],
            subject: 'Vidlive | OTP Verification',
            react: react_1.default.createElement(verificationemails_1.VerificationEmail, {
                email: email,
                username: username,
                verifyCode: verifyCode,
            }),
        });
        if (error) {
            console.error('Error sending email:', error);
            return new Response(JSON.stringify({ error }), { status: 500 });
        }
        return new Response(JSON.stringify({ success: true, data }), { status: 200 });
    }
    catch (error) {
        console.error('Unhandled error:', error);
        return new Response(JSON.stringify({ error: error || 'Internal Server Error' }), {
            status: 500,
        });
    }
}
