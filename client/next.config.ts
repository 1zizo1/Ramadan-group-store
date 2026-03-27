import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // unoptimized:true,
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      {
        protocol: "https",
        hostname: "reactbd-images-ecommerce.s3.us-east-1.amazonaws.com",
      },{
        protocol: 'https',
        hostname: 'via.placeholder.com', // Added this since you use it as a fallback
      },
    ],
  },
};

export default nextConfig;