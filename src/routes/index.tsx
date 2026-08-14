import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/quiz", search: search as Record<string, unknown> });
  },
  head: () => ({
    meta: [
      { title: "Verse — understand the Bible in 7 minutes a day" },
      {
        name: "description",
        content:
          "Take the 2-minute quiz and get a 30-day Bible reading plan matched to your tradition, your pace and what you're going through.",
      },
      { property: "og:title", content: "Verse — understand the Bible in 7 minutes a day" },
      {
        property: "og:description",
        content: "A 30-day Bible plan built around your tradition, your pace and your questions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: "#fcfbf8" }}
    >
      <img
        data-lovable-blank-page-placeholder="REMOVE_THIS"
        src="https://cdn.gpteng.co/blank-app-v1.svg"
        alt="Your app will live here!"
      />
    </div>
  );
}
