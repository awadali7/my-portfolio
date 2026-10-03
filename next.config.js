// In development the backend serves uploaded blog images over plain http on
// localhost. Production builds only ever load https images.
const devImageHosts =
  process.env.NODE_ENV === 'production'
    ? []
    : [
        { protocol: 'http', hostname: 'localhost' },
        { protocol: 'http', hostname: '127.0.0.1' },
      ];

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      ...devImageHosts,
    ],
  },
};

module.exports = nextConfig;
