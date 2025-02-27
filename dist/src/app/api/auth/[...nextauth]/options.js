"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authOptions = void 0;
const dbConnect_1 = __importDefault(require("@/lib/dbConnect"));
const credentials_1 = __importDefault(require("next-auth/providers/credentials"));
const User_1 = __importDefault(require("@/model/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
exports.authOptions = {
    providers: [
        (0, credentials_1.default)({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                await (0, dbConnect_1.default)();
                try {
                    const user = await User_1.default.findOne({
                        $or: [
                            { email: credentials.email }
                        ]
                    });
                    console.log('User found:', user);
                    if (!user) {
                        console.error('no user found');
                        throw new Error('no user found with this email');
                    }
                    if (!user.isVerified) {
                        throw new Error('please verify your account');
                    }
                    const ispasswordcorrect = await bcryptjs_1.default.compare(credentials.password, user.password);
                    if (ispasswordcorrect) {
                        return user;
                    }
                    else {
                        throw new Error('please enter correct password');
                    }
                }
                catch (err) {
                    console.error("Authorization:", err);
                    throw new Error(err.message);
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.email = token.email;
            }
            return session;
        }
    },
    pages: {
        signIn: '/sign-in'
    },
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET,
};
