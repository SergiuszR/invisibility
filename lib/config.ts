/**
 * Webflow Visibility Cleaner - Configuration
 * 
 * This configuration is read at runtime to determine which Webflow site to proxy
 * and which elements to remove from the HTML.
 */

export const config = {
    /**
     * The origin URL of your Webflow site.
     * This is where the proxy will fetch content from.
     * 
     * Examples:
     * - "https://your-site.webflow.io" (staging)
     * - "https://www.your-domain.com" (if you have a custom domain on Webflow)
     * 
     * Set via WEBFLOW_ORIGIN environment variable, or defaults to webflow.io subdomain
     */
    webflowOrigin: process.env.WEBFLOW_ORIGIN || "",

    /**
     * The mount path of the application (e.g. "/post").
     * Used to prepend to the path when fetching from the origin.
     */
    mountPath: process.env.COSMIC_MOUNT_PATH || process.env.MOUNT_PATH || "",

    /**
     * CSS selectors for elements to remove from the HTML.
     * These elements will be completely stripped from the response.
     */
    selectorsToRemove: [
        ".w-condition-invisible",
    ],

    /**
     * Content types that should be transformed (HTML parsing).
     * Other content types will be passed through unchanged.
     */
    transformableContentTypes: [
        "text/html",
    ],

    /**
     * Headers to forward from the original request to Webflow.
     */
    forwardHeaders: [
        "accept",
        "accept-language",
        "accept-encoding",
        "user-agent",
        "cookie",
        "cache-control",
    ],

    /**
     * Headers to exclude from the Webflow response.
     * These headers are managed by the proxy/CDN.
     */
    excludeResponseHeaders: [
        "content-encoding",
        "content-length",
        "transfer-encoding",
        "connection",
    ],
};
