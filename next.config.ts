import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @google/generative-ai 는 서버 사이드에서 동작하므로 번들 최적화 제외
  serverExternalPackages: ["@google/generative-ai"],
};

export default nextConfig;

