import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "amitha-hmua-images.s3.ca-central-1.amazonaws.com",
        // probably need to restrict the pathname to bioimages and shoots to matdh AWS dirname
				pathname: "/**",
			},
		],
	},
};

export default nextConfig;
