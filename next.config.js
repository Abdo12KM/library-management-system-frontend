/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost", "library-management-system-3ilo.onrender.com"],
  },
  // Environment variables starting with NEXT_PUBLIC_ are automatically available to the browser
  // No need to explicitly define them in env config
};

module.exports = nextConfig;
