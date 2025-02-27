import { z } from "zod";






export const signUpSchema = z.object({
    username : z.string().min(2,"username must be contain teo or more character")
    .max(20,"username must be not contains more then 20 characters"),
    email:z.string().email(),
    password:z.string().min(6,"password must be contains more then 5 charater ").max(20)
})