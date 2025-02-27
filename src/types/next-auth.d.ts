// types/next-auth.d.ts

import "next-auth";
import { DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // Add the 'id' property here
      email: string;
     
    };
  }

  interface User extends DefaultUser {
    id: string; // Add 'id' to the User interface as well
  }
}
