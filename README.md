# Webflow Visibility Cleaner

A minimal, production-ready **Webflow Cloud** app that acts as a reverse proxy to remove `.w-condition-invisible` elements from your Webflow site's HTML before serving it to users.

## What It Does

When Webflow uses conditional visibility on CMS items, elements that don't meet conditions are sometimes hidden with the `.w-condition-invisible` class (using `display: none`) rather than being removed from the DOM. This can:

- Increase page size unnecessarily
- Impact performance (hidden content still loads)
- Cause SEO issues (hidden content may be indexed)

This app intercepts all HTML responses from your Webflow site and **completely removes** these invisible elements from the DOM using Cloudflare's streaming `HTMLRewriter` API.

## Architecture

```
User Request → Webflow Cloud → This Next.js App (Edge)
    → Fetches from Webflow Origin
    → HTMLRewriter strips .w-condition-invisible elements
    → Clean HTML served to user
```

## Features

- ✅ **Edge Runtime** - Runs on Cloudflare Workers via Webflow Cloud for maximum performance
- ✅ **Streaming Transformation** - Uses `HTMLRewriter` for efficient, memory-friendly HTML processing
- ✅ **Zero Latency Impact** - Transforms HTML as it streams, no buffering
- ✅ **Universal** - Works with any Webflow project  
- ✅ **Pass-through for Assets** - CSS, JS, images, fonts pass through unchanged
- ✅ **Configurable** - Easy to customize which selectors to remove

## Setup

### Prerequisites

- Node.js 20.0.0 or higher
- A Webflow site
- Webflow Cloud access

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env.local` file:

```bash
# Your Webflow site's origin URL
WEBFLOW_ORIGIN=https://your-site.webflow.io
```

### 3. Local Development

```bash
npm run dev
```

Note: Local development uses a regex fallback since `HTMLRewriter` is only available in Cloudflare's edge environment.

### 4. Deploy to Webflow Cloud

1. Push this repository to GitHub
2. In Webflow, go to your site's **Settings → Webflow Cloud**
3. Connect your GitHub repository
4. Set the **Mount Path** to `/` (root) to proxy the entire site
5. Add the `WEBFLOW_ORIGIN` environment variable in Webflow Cloud settings
6. Deploy!

## Configuration

Edit `lib/config.ts` to customize behavior:

```typescript
export const config = {
  // Your Webflow site URL
  webflowOrigin: process.env.WEBFLOW_ORIGIN || "",

  // CSS selectors to remove from HTML
  selectorsToRemove: [
    ".w-condition-invisible",
    // Add more selectors as needed
  ],

  // Content types to transform
  transformableContentTypes: [
    "text/html",
  ],
};
```

## How It Works

1. **Catch-All Route** (`app/[[...path]]/route.ts`) - Catches all incoming requests
2. **Proxy Logic** (`lib/proxy.ts`) - Fetches content from your Webflow origin
3. **HTML Transformation** (`lib/transformer.ts`) - Uses `HTMLRewriter` to remove elements matching configured selectors
4. **Response** - Returns the cleaned HTML to the user

## Performance

The `HTMLRewriter` API processes HTML as a stream, meaning:
- No need to buffer the entire response
- Minimal memory usage
- Near-zero latency added to requests
- Processes at the edge, close to users

## Troubleshooting

### "WEBFLOW_ORIGIN environment variable is not set"

Make sure to set the `WEBFLOW_ORIGIN` environment variable either in:
- `.env.local` for local development
- Webflow Cloud project settings for production

### Elements not being removed

1. Check that the selectors in `lib/config.ts` match your elements
2. Verify the elements have the exact class name (case-sensitive)
3. Check browser DevTools to confirm the class exists on the source site

## License

MIT
