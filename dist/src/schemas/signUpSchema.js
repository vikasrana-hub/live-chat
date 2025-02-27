"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUpSchema = void 0;
const zod_1 = require("zod");
exports.signUpSchema = zod_1.z.object({
    username: zod_1.z.string().min(2, "username must be contain teo or more character")
        .max(20, "username must be not contains more then 20 characters"),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6, "password must be contains more then 5 charater ").max(20)
});
