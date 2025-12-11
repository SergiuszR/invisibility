/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Edge Runtime for optimal performance on Webflow Cloud (Cloudflare Workers)
  experimental: {
    // Allow all external origins for proxying
  },
  
  // Disable image optimization to pass through Webflow images as-is
  images: {
    unoptimized: true,
  },

  // Skip trailing slash normalization to match Webflow behavior
  skipTrailingSlashRedirect: true,
  
  // Disable x-powered-by header for cleaner responses
  poweredByHeader: false,
};

module.exports = nextConfig;
