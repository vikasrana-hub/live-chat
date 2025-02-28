import dbConnect from "@/lib/dbConnect";
import CredentialsProvider from "next-auth/providers/credentials";
import UserModel, { User } from "@/model/User"; // Assuming IUser is the type for UserModel
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";


export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(
  credentials: Record<"email" | "password", string> | undefined
): Promise<User | null> {
  if (!credentials) {
    throw new Error("Missing credentials"); // Handle case where credentials are undefined
  }

  const { email, password } = credentials;
  await dbConnect();

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      throw new Error("No user found with this email");
    }
    if (!user.isVerified) {
      throw new Error("Please verify your account");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new Error("Incorrect password");
    }

    return user;
  } catch (err) {
    console.error("Authorization Error:", err);
    throw new Error(err instanceof Error ? err.message : "Authorization failed");
  }
}

        })
    ],
    callbacks: {
        async jwt({ token, user }: { token: JWT; user?: User }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
            }
            return token;
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
            }
            return session;
        }
    },
    pages: {
        signIn: "/sign-in"
    },
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET
};
