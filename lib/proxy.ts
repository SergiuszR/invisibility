/**
 * Proxy Utilities
 * 
 * Functions for handling the reverse proxy logic - fetching from Webflow origin,
 * forwarding headers, and managing the response pipeline.
 */

import { config } from "./config";

/**
 * Build the target URL for the Webflow origin
 */
export function buildTargetUrl(request: Request, pathname: string): string {
    const origin = config.webflowOrigin;

    if (!origin) {
        throw new Error(
            "WEBFLOW_ORIGIN environment variable is not set. " +
            "Please set it to your Webflow site URL (e.g., https://your-site.webflow.io)"
        );
    }

    // Get the URL object from request to extract search params
    const url = new URL(request.url);
    const searchParams = url.search;

    return `${origin}${pathname}${searchParams}`;
}

/**
 * Build headers to forward to the Webflow origin
 */
export function buildForwardHeaders(request: Request): Headers {
    const headers = new Headers();

    for (const headerName of config.forwardHeaders) {
        const value = request.headers.get(headerName);
        if (value) {
            headers.set(headerName, value);
        }
    }

    // Always set host to the origin's host
    if (config.webflowOrigin) {
        const originUrl = new URL(config.webflowOrigin);
        headers.set("host", originUrl.host);
    }

    return headers;
}

/**
 * Build response headers, excluding problematic ones
 */
export function buildResponseHeaders(originalHeaders: Headers): Headers {
    const headers = new Headers();

    originalHeaders.forEach((value, key) => {
        const lowerKey = key.toLowerCase();
        if (!config.excludeResponseHeaders.includes(lowerKey)) {
            headers.set(key, value);
        }
    });

    // Add a header to indicate the response was processed
    headers.set("x-visibility-cleaner", "1.0.0");

    return headers;
}

/**
 * Fetch content from the Webflow origin
 */
export async function fetchFromOrigin(
    request: Request,
    pathname: string
): Promise<Response> {
    const targetUrl = buildTargetUrl(request, pathname);
    const headers = buildForwardHeaders(request);

    try {
        const response = await fetch(targetUrl, {
            method: request.method,
            headers,
            // Don't follow redirects - let the client handle them
            redirect: "manual",
        });

        return response;
    } catch (error) {
        console.error("Failed to fetch from origin:", error);
        throw error;
    }
}
