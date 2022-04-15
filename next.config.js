/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.plugins.push(
      new webpack.EnvironmentPlugin({
        NODE_ENV: undefined,
        MSW: false,
      })
    );
    return config;
  },
};

module.exports = nextConfig;
