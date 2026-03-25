import type { NextConfig } from "next";

/**
 * Security headers applied to every response.
 *
 * References:
 *  - OWASP Secure Headers Project: https://owasp.org/www-project-secure-headers/
 *  - Next.js headers docs: https://nextjs.org/docs/app/api-reference/config/next-config-js/headers
 */
const securityHeaders = [
  // Prevent MIME-type sniffing — browser must respect Content-Type header
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Block clickjacking — don't allow this site to be loaded in an iframe
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // Force HTTPS for 1 year; include subdomains
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  // Limit referrer information sent to external sites
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Disable dangerous browser features not needed by this app
  {
    key: "Permissions-Policy",
    value: [
      "camera=()",           // no camera access
      "microphone=()",       // no microphone (voice search uses Web Speech API,
                             // which is opt-in per browser, not Permissions-Policy)
      "geolocation=()",      // no location
      "interest-cohort=()",  // no FLoC tracking
      "payment=()",          // no payment requests
      "usb=()",              // no USB access
    ].join(", "),
  },
  // Content Security Policy
  // Prevents XSS by declaring which sources the browser may load content from.
  // 'unsafe-inline' is required for Tailwind CSS and Next.js inline styles;
  // 'unsafe-eval' is avoided here — Next.js doesn't need it in production.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Scripts: self + Next.js requires 'unsafe-inline' for its runtime scripts
      "script-src 'self' 'unsafe-inline'",
      // Styles: self + inline styles used by Tailwind / Next.js
      "style-src 'self' 'unsafe-inline'",
      // Images: self + data URIs for base64 images + supabase for avatars
      "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in",
      // Fonts: self only
      "font-src 'self'",
      // API calls this app makes to external services
      "connect-src 'self'" +
        " https://*.supabase.co https://*.supabase.in" +  // Supabase
        " https://api.openai.com" +                       // OpenAI
        " https://google.serper.dev",                     // Serper search API
      // Disallow embedding in frames entirely
      "frame-ancestors 'none'",
      // Block <base> tag hijacking
      "base-uri 'self'",
      // Restrict where forms can be submitted
      "form-action 'self'",
      // Upgrade insecure requests to HTTPS in browsers that support it
      "upgrade-insecure-requests",
    ].join("; "),
  },
  // Stop IE from guessing content types
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
];

const config: NextConfig = {
  reactStrictMode: true,

  typescript: {
    tsconfigPath: "./tsconfig.json",
  },

  // Apply security headers to every route
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  // Disable the X-Powered-By header — don't advertise Next.js version to attackers
  poweredByHeader: false,
};

export default config;
