import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    //crossOrigin: 'anonymous',
    "baseUrl": ".",
    "paths": {
        "@/*": ["./src/*"]
    },
        async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://127.0.0.1:8080/api/:path*',
            },
        ];
    },
};

export default nextConfig;
