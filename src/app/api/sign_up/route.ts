import { resend } from "@/helpers/sendverification";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { NextResponse } from 'next/server'; // Import NextResponse
import React from "react";
import { VerificationEmail } from "../../../../emails/verificationemails";

export async function POST(request: Request) {
    try {
        // Connect to the database
        await dbConnect();
        
        // Get data from request
        const { username, password, email } = await request.json();

        // Check if the username is already verified
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true,
        });

        if (existingUserVerifiedByUsername) {
            return NextResponse.json({
                success: false,
                message: "Username already verified",
            }, { status: 400 });
        }

        // Check if the email already exists
        const existsingUserbyEmail = await UserModel.findOne({ email });
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        if (existsingUserbyEmail) {
            if (existsingUserbyEmail.isVerified) {
                return NextResponse.json({
                    success: false,
                    message: "User already exists",
                }, { status: 400 });

            
            }
        } else {
            // Hash password and create a new user
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                isVerified: false,
            });
            await newUser.save();
        }
        
        
        try {  await resend.emails.send({  // Use .send method of the resend instance
            from: 'Vidlive <onboarding@resend.dev>',
            to: [email],
            subject: 'Vidlive | OTP Verification',
            react: React.createElement(VerificationEmail, {
                email: email,
                username: username,
                verifyCode: verifyCode,
            }),});}
        catch (emailError) {
            console.error("Error sending verification email:", emailError);
            return NextResponse.json({
                success: false,
                message: "User registered, but email not sent. Please try again.",
            }, { status: 500 });
        }
        
        // Return success response
        return NextResponse.json({
            success: true,
            message: "User registered successfully. Please check your email for verification.",
        });

    } catch (error) {
        console.error('Error registering user:', error);
        return NextResponse.json({
            success: false,
            message: "Error registering user, please try again later.",
        }, { status: 500 });
    }
}
