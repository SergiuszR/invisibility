/**
 * HTML Transformer using HTMLRewriter
 * 
 * This module provides HTML transformation capabilities using Cloudflare's HTMLRewriter API,
 * which is natively available in the Webflow Cloud (Cloudflare Workers) environment.
 * 
 * For environments where HTMLRewriter is not available (local dev), it falls back to
 * a regex-based approach.
 */

import { config } from "./config";

/**
 * Element handler that removes matched elements from the HTML stream.
 * Used with HTMLRewriter to strip elements matching specified selectors.
 */
class ElementRemover {
    element(element: Element) {
        element.remove();
    }
}

/**
 * Transforms an HTML response by removing elements matching configured selectors.
 * Uses HTMLRewriter for streaming transformation (optimal for edge performance).
 * 
 * @param response - The original Response object containing HTML
 * @returns A new Response with transformed HTML
 */
export async function transformHtml(response: Response): Promise<Response> {
    // Check if HTMLRewriter is available (Cloudflare Workers environment)
    if (typeof HTMLRewriter !== "undefined") {
        return transformWithHtmlRewriter(response);
    }

    // Fallback for local development/testing
    return transformWithRegex(response);
}

/**
 * Transform HTML using Cloudflare's HTMLRewriter (streaming, efficient)
 */
function transformWithHtmlRewriter(response: Response): Response {
    let rewriter = new HTMLRewriter();

    // Add handlers for each selector to remove
    for (const selector of config.selectorsToRemove) {
        rewriter = rewriter.on(selector, new ElementRemover());
    }

    // Transform the response stream
    return rewriter.transform(response);
}

/**
 * Fallback transformation using regex (for local development)
 * Note: This is less robust than HTMLRewriter but works for testing
 */
async function transformWithRegex(response: Response): Promise<Response> {
    const html = await response.text();

    // Create regex patterns for each selector
    // This handles the .w-condition-invisible class specifically
    let transformedHtml = html;

    for (const selector of config.selectorsToRemove) {
        if (selector.startsWith(".")) {
            // Class selector - remove elements with this class
            const className = selector.slice(1);
            // Match elements with this class (simplified pattern)
            const pattern = new RegExp(
                `<([a-z][a-z0-9]*)\\b[^>]*\\bclass\\s*=\\s*["'][^"']*\\b${className}\\b[^"']*["'][^>]*>([\\s\\S]*?)<\\/\\1>`,
                "gi"
            );
            transformedHtml = transformedHtml.replace(pattern, "");

            // Also handle self-closing tags
            const selfClosingPattern = new RegExp(
                `<([a-z][a-z0-9]*)\\b[^>]*\\bclass\\s*=\\s*["'][^"']*\\b${className}\\b[^"']*["'][^>]*\\/>`,
                "gi"
            );
            transformedHtml = transformedHtml.replace(selfClosingPattern, "");
        }
    }

    // Create new response with transformed content
    return new Response(transformedHtml, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
    });
}

/**
 * Check if a content type should be transformed
 */
export function shouldTransform(contentType: string | null): boolean {
    if (!contentType) return false;

    return config.transformableContentTypes.some(type =>
        contentType.toLowerCase().includes(type)
    );
}
