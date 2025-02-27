import { z } from "zod";


export const messageSchema = z.object({
    content:z.string().max(200,"bs kr bhai/uski behn ek hi message m sb kuch bol degi kya")
    
})