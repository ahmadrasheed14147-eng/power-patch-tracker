export const meta = (title: string, description: string) => ({
  meta: [
    { title: `${title} | Power-Track` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} | Power-Track` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ],
});
