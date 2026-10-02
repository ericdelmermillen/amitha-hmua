/** @type {import('next').NextConfig} */

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "amitha-hmua-images.s3.ca-central-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  env: {
    EMAIL: process.env.EMAIL,
    PASSWORD: process.env.PASSWORD,
    COMPANY_NAME: process.env.COMPANY_NAME,

    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_ACCESS_TOKEN_EXPIRATION_INTERVAL: process.env.JWT_ACCESS_TOKEN_EXPIRATION_INTERVAL,
    JWT_REFRESH_TOKEN_EXPIRATION_INTERVAL: process.env.JWT_REFRESH_TOKEN_EXPIRATION_INTERVAL,

    REGION: process.env.REGION,
    BUCKET_NAME: process.env.BUCKET_NAME,
    ACCESS_KEY_ID: process.env.ACCESS_KEY_ID,
    SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY,
    BUCKET_BASE_URL: process.env.BUCKET_BASE_URL,
    BUCKET_PATH: process.env.BUCKET_PATH,
    BIO_DIRNAME: process.env.BIO_DIRNAME,
    SHOOTS_DIRNAME: process.env.SHOOTS_DIRNAME,

    DB_PORT: process.env.DB_PORT,
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    DB_CONNECTION_LIMIT: process.env.DB_CONNECTION_LIMIT,
    DB_QUEUE_LIMIT: process.env.DB_QUEUE_LIMIT,
  },
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;