/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    mdxRs: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

const withMDX = require('@next/mdx')();
module.exports = withMDX(nextConfig);
