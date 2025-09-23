import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    
    config.externals = config.externals || [];
    config.externals.push("pino-pretty", "lokijs", "encoding");

    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        "async-storage": false,
        "@react-native-async-storage/async-storage": false,
      };
    }

    return config;
  },
  eslint: {
    
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
