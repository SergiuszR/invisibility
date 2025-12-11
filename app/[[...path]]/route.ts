/**
 * Catch-All Route Handler
 * 
 * This route handles ALL requests to the app and proxies them to the Webflow origin.
 * HTML responses are transformed to remove .w-condition-invisible elements.
 * All other responses (CSS, JS, images, etc.) are passed through unchanged.
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchFromOrigin, buildResponseHeaders } from "@/lib/proxy";
import { transformHtml, shouldTransform } from "@/lib/transformer";

// Force Edge Runtime for HTMLRewriter support
// export const runtime = "edge";

// Next.js 15 uses async params
type RouteContext = {
    params: Promise<{ path?: string[] }>;
};

// Handle all HTTP methods
export async function GET(request: NextRequest, context: RouteContext) {
    const { path } = await context.params;
    return handleRequest(request, path);
}

export async function POST(request: NextRequest, context: RouteContext) {
    const { path } = await context.params;
    return handleRequest(request, path);
}

export async function PUT(request: NextRequest, context: RouteContext) {
    const { path } = await context.params;
    return handleRequest(request, path);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    const { path } = await context.params;
    return handleRequest(request, path);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
    const { path } = await context.params;
    return handleRequest(request, path);
}

export async function HEAD(request: NextRequest, context: RouteContext) {
    const { path } = await context.params;
    return handleRequest(request, path);
}

export async function OPTIONS(request: NextRequest, context: RouteContext) {
    const { path } = await context.params;
    return handleRequest(request, path);
}

/**
 * Main request handler - fetches from origin and transforms HTML if needed
 */
async function handleRequest(
    request: NextRequest,
    pathSegments?: string[]
): Promise<Response> {
    // Build the pathname from segments
    const pathname = pathSegments ? `/${pathSegments.join("/")}` : "/";

    try {
        // Fetch from Webflow origin
        const originResponse = await fetchFromOrigin(request, pathname);

        // Get content type to determine if transformation is needed
        const contentType = originResponse.headers.get("content-type");

        // Build clean response headers
        const responseHeaders = buildResponseHeaders(originResponse.headers);

        // Check if this is HTML that should be transformed
        if (shouldTransform(contentType)) {
            // Transform HTML to remove invisible elements
            const transformedResponse = await transformHtml(originResponse);

            // Return transformed response with updated headers
            return new Response(transformedResponse.body, {
                status: originResponse.status,
                statusText: originResponse.statusText,
                headers: responseHeaders,
            });
        }

        // Pass through non-HTML responses unchanged
        return new Response(originResponse.body, {
            status: originResponse.status,
            statusText: originResponse.statusText,
            headers: responseHeaders,
        });

    } catch (error) {
        console.error("Proxy error:", error);

        // Return a meaningful error response
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        return NextResponse.json(
            {
                error: "Proxy Error",
                message: errorMessage,
                hint: "Make sure WEBFLOW_ORIGIN environment variable is set correctly",
            },
            { status: 502 }
        );
    }
}
