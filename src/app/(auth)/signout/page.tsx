'use client'

import { signOut } from "next-auth/react";

export default function SignOutPage() {
  return (
    <div>
    
      <h1>Welcome to the Dashboard</h1>

      
      
      <button onClick={() => signOut({ callbackUrl: "/sign-in" })} className="bg-red-500 text-white p">Sign Out</button>
    </div>
  );
}
