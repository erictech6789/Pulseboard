/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  // The floating dev badge is noise in a screen recording.
  devIndicators: false,
}

export default nextConfig
