import { sanityFetch } from "@/sanity/lib/fetch";
import { postSlugsQuery } from "@/sanity/lib/queries";
import type { MetadataRoute } from "next";
import { unstable_noStore } from "next/cache";

async function getBlogPosts() {
  // Always return empty array to bypass Sanity
  return [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // to try fix caching issue: https://github.com/vercel/next.js/discussions/56708#discussioncomment-10127496
  unstable_noStore();

  const blogPosts = await getBlogPosts();

  const staticUrls = [
    {
      url: "https://www.getinboxzero.com/",
      priority: 1,
    },
    {
      url: "https://www.getinboxzero.com/bulk-email-unsubscriber",
    },
    {
      url: "https://www.getinboxzero.com/ai-automation",
    },
    {
      url: "https://www.getinboxzero.com/email-analytics",
    },
    {
      url: "https://www.getinboxzero.com/block-cold-emails",
    },
    {
      url: "https://www.getinboxzero.com/privacy",
    },
    {
      url: "https://www.getinboxzero.com/terms",
    },
    {
      url: "https://www.getinboxzero.com/blog",
      changeFrequency: "daily" as const,
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: "https://www.getinboxzero.com/blog/post/how-my-open-source-saas-hit-first-on-product-hunt",
    },
    {
      url: "https://www.getinboxzero.com/blog/post/why-build-an-open-source-saas",
    },
    {
      url: "https://www.getinboxzero.com/blog/post/alternatives-to-skiff-mail",
    },
    {
      url: "https://www.getinboxzero.com/blog/post/best-email-unsubscribe-app",
    },
    {
      url: "https://www.getinboxzero.com/blog/post/bulk-unsubscribe-from-emails",
    },
    {
      url: "https://www.getinboxzero.com/blog/post/escape-email-trap-unsubscribe-for-good",
    },
    {
      url: "https://docs.getinboxzero.com/",
    },
    {
      url: "https://docs.getinboxzero.com/introduction",
    },
    {
      url: "https://docs.getinboxzero.com/essentials/email-ai-automation",
    },
    {
      url: "https://docs.getinboxzero.com/essentials/bulk-email-unsubscriber",
    },
    {
      url: "https://docs.getinboxzero.com/essentials/cold-email-blocker",
    },
  ];

  return [...staticUrls, ...blogPosts];
}
