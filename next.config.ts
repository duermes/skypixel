import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "trek.nasa.gov",
        pathname: "/tiles/**",
      },
    ],
  },
};

export default nextConfig;
