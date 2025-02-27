
import React from "react";

import { Resend } from "resend";
import { VerificationEmail } from "../../emails/verificationemails";



export const resend = new Resend(process.env.RESEND_API)


export async function POST(request: Request) {
    try {
        // Parse the incoming request body
        const { email, username, verifyCode } = await request.json();

        // Validate input
        if (!email || !username || !verifyCode) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields: email, username, or verifyCode' }),
                { status: 400 }
            );
        }

        // Send email using Resend

        const { data, error } = await resend.emails.send({
            from: 'Vidlive <onboarding@resend.dev>',
            to: [email],
            subject: 'Vidlive | OTP Verification',
            react: React.createElement(VerificationEmail, {
                email: email,
                username: username,
                verifyCode:verifyCode,
            }),
        });

    if (error) {
        console.error('Error sending email:', error);
        return new Response(JSON.stringify({ error }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
} catch (error) {
    console.error('Unhandled error:', error);
    return new Response(JSON.stringify({ error: error|| 'Internal Server Error' }), {
        status: 500,
    });
}
}
