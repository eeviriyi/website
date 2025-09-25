import type { NextConfig } from "next";
import createMDX from '@next/mdx'
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
})


const withNextIntl = createNextIntlPlugin();

export default withMDX(withNextIntl(nextConfig));
