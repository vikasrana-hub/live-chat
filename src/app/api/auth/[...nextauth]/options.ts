import dbConnect from "@/lib/dbConnect";
import CredentialsProvider from "next-auth/providers/credentials";

import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";


export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }

            },
            async authorize(credentials:any):Promise<any>{
                await dbConnect()

                
                try {
                
                    const user =await UserModel.findOne({
                        $or:[
                            
                            {email: credentials.email}
                            
                        ]

                    });


                    console.log('User found:', user);
                    if (!user) {
                        console.error('no user found')
                        throw new Error('no user found with this email')
                        
                    }
                    if(!user.isVerified){
                        throw new Error('please verify your account')
                    }
                    const ispasswordcorrect = await bcrypt.compare(credentials.password,user.password)

                    if (ispasswordcorrect) {
                        return user

                        
                    }else{
                        throw new Error('please enter correct password')
                    }
                    
                } catch (err:any) {

                    console.error("Authorization:",err);
                    
                    throw new Error(err.message);
                }

            }
        
        })
    ],
    callbacks:{
        async jwt({token,user}) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
            }
            return token;
            
        },
        async session({session,token}){if(session.user){
            session.user.id = token.id as string ;
            session.user.email = token.email as string;}
            return session;
    }
    },
    pages:{
        signIn:'/sign-in'
    },
    session:{
        strategy:"jwt"
    },
    secret:process.env.NEXTAUTH_SECRET,

}
