/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Edge Runtime for optimal performance on Webflow Cloud (Cloudflare Workers)
  experimental: {
    // If you need to allow external origins for proxying, add:
    // externalMiddlewareOrigins: ['*'],
  },
  
  // Image configuration
  images: {
    unoptimized: true,
    // If you need to use remote images, consider adding domains:
    // domains: ['your-domain.webflow.io'],
  },

  // Skip trailing slash normalization to match Webflow behavior
  skipTrailingSlashRedirect: true,
  
  // Disable x-powered-by header for cleaner responses
  poweredByHeader: false,
};

module.exports = nextConfig;
