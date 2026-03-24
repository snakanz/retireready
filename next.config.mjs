/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Cloudflare Pages via @cloudflare/next-on-pages
  // See: https://github.com/cloudflare/next-on-pages
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['stripe'],
  },
}

export default nextConfig
