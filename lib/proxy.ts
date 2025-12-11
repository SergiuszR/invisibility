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

    // Construct the path, ensuring we respect the mount path
    // Remove leading slash from pathname if mountPath is present to avoid double slashes if needed, 
    // but usually cleaner to just join them.

    // Logic for "Preview Mode":
    // If the user sets PROXY_TARGET_ROOT=true, we want to fetch the "root" content
    // regardless of where the app is mounted. 
    // Example: Mounted at /preview, User visits /preview/about
    // Next.js sees pathname="/about".
    // We want to fetch origin + "/about". 
    // So we do NOT prepend mountPath.

    let fullPath = pathname;

    // Check if we should enforce root proxying (Preview Mode) logic
    const isPreviewMode = process.env.PROXY_TARGET_ROOT === "true";

    if (!isPreviewMode && config.mountPath) {
        // Standard sub-app mode: Mounted at /post, Content at /post
        // We prepend /post to make sure we fetch the right content.
        fullPath = `${config.mountPath}${pathname}`.replace('//', '/');
    }

    // Default case (or Preview Mode): fullPath passed as-is

    return `${origin}${fullPath}${searchParams}`;
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

    // We typically do NOT want to manually set the Host header when fetching
    // from a Cloudflare Worker to another Cloudflare site, as fetch() will
    // set it correctly based on the target URL. Setting it manually can cause
    // Error 1000 if not careful.
    // if (config.webflowOrigin) {
    //    const originUrl = new URL(config.webflowOrigin);
    //    headers.set("host", originUrl.host);
    // }

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
