"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.default = void 0;
exports.middleware = middleware;
const jwt_1 = require("next-auth/jwt");
const server_1 = require("next/server");
var middleware_1 = require("next-auth/middleware");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return __importDefault(middleware_1).default; } });
// This function can be marked `async` if using `await` inside
async function middleware(request) {
    const token = await (0, jwt_1.getToken)({ req: request });
    const url = request.nextUrl;
    if (token &&
        (url.pathname.startsWith('/sign-in') ||
            url.pathname.startsWith('/sign-up'))) {
        return server_1.NextResponse.redirect(new URL('/', request.url));
    }
    if (!token &&
        (url.pathname.startsWith('/home'))) {
        return server_1.NextResponse.redirect(new URL('/home', request.url));
    }
}
// See "Matching Paths" below to learn more
exports.config = {
    matcher: [
        '/sign-in',
        '/sign-up',
        '/verify',
        '/home'
    ]
};
