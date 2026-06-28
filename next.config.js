/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static, image-folder based site — no remote image optimization needed.
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
