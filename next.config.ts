// next.config.js
const { nextui } = require('@nextui-org/react');

/** @type {import('next').NextConfig} */
const nextConfig = nextui({
  reactStrictMode: true,
  // …any other next.js settings
});

module.exports = nextConfig;
