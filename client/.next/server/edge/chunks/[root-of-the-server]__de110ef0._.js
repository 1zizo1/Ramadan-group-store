(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["chunks/[root-of-the-server]__de110ef0._.js", {

"[externals]/node:buffer [external] (node:buffer, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}}),
"[project]/middleware.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "config": ()=>config,
    "middleware": ()=>middleware
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/spec-extension/response.js [middleware-edge] (ecmascript)");
;
async function middleware(request) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get("auth_token")?.value;
    // Log token presence for debugging
    console.log("Middleware: Token found:", !!token, {
        pathname
    });
    // Verify token using /api/auth/profile
    const verifyToken = async (token)=>{
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(()=>controller.abort(), 5000); // 5 second timeout
            const response = await fetch(`${("TURBOPACK compile-time value", "http://localhost:8000/api")}/auth/profile`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                credentials: "include",
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            console.log("Middleware: Profile response status:", response.status);
            return response.ok;
        } catch (error) {
            console.error("Middleware: Token verification failed:", error);
            // If it's a network error or timeout, assume token is valid to prevent unnecessary redirects
            if (error instanceof Error && (error.name === "AbortError" || error.message.includes("fetch"))) {
                console.log("Middleware: Network error, allowing access with existing token");
                return true; // Allow access if there's a network issue
            }
            return false;
        }
    };
    // For success page, allow access if token exists (bypass verification to prevent Stripe redirect issues)
    if (pathname === "/success") {
        if (!token) {
            const signInUrl = new URL("/auth/signin", request.url);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(signInUrl);
        }
        // Always allow access to success page if token exists to prevent Stripe redirect issues
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    const isAuthenticated = token ? await verifyToken(token) : false;
    console.log("Middleware: isAuthenticated:", isAuthenticated);
    // Protect /user routes
    if (pathname.startsWith("/user")) {
        if (!isAuthenticated) {
            console.log("Middleware: Redirecting unauthenticated user to /auth/signin");
            const signInUrl = new URL("/auth/signin", request.url);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(signInUrl);
        }
    }
    // Restrict /auth routes for authenticated users
    if (pathname.startsWith("/auth")) {
        if (isAuthenticated) {
            console.log("Middleware: Redirecting authenticated user to /user");
            const userUrl = new URL("/user/profile", request.url);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(userUrl);
        }
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    matcher: [
        "/user/:path*",
        "/auth/:path*",
        "/success"
    ]
};
}),
}]);

//# sourceMappingURL=%5Broot-of-the-server%5D__de110ef0._.js.map