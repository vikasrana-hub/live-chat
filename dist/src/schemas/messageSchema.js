"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageSchema = void 0;
const zod_1 = require("zod");
exports.messageSchema = zod_1.z.object({
    content: zod_1.z.string().max(200, "bs kr bhai/uski behn ek hi message m sb kuch bol degi kya")
});
