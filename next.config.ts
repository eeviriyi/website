import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import { withContentCollections } from "@content-collections/next";

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  transpilePackages: ['next-mdx-remote'],
};


const withNextIntl = createNextIntlPlugin("./src/lib/core/i18n/request.ts");

export default withContentCollections(withNextIntl(nextConfig));
