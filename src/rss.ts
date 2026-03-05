import { XMLParser } from "fast-xml-parser";
import { getNextFeedToFetch, markFeedFetched } from "./db/queries/feed";
import { createPost } from "./db/queries/post";

type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
  const response = await fetch(feedURL, {
    headers: { "User-Agent": "gator" },
  });

  const xml = await response.text();
  const parser = new XMLParser();
  const result = parser.parse(xml);

  const channel = result.rss?.channel;
  if (!channel) throw new Error("Invalid RSS feed format");

  const { title, link, description } = channel;
  if (!title || !link || !description) throw new Error("Missing required channel fields");

  const rawItems = Array.isArray(channel.item) ? channel.item : channel.item ? [channel.item] : [];
  const items: RSSItem[] = rawItems
    .map((item: any) => {
      const { title, link, description, pubDate } = item;
      if (!title || !link || !description || !pubDate) return null;
      return { title, link, description, pubDate };
    })
    .filter(Boolean) as RSSItem[];

  return { channel: { title, link, description, item: items } };
}



// Main function to scrape feeds and save posts to the database
export async function scrapeFeeds() {
  const feed = await getNextFeedToFetch();
  if (!feed) {
    console.log("No feeds to fetch.");
    return;
  }

  console.log(`Fetching feed "${feed.name}" (${feed.url})...`);

  // Mark feed as fetched immediately
  await markFeedFetched(feed.id);

  // Fetch the RSS feed
  const rssFeed = await fetchFeed(feed.url);

  if (!rssFeed?.channel?.item || rssFeed.channel.item.length === 0) {
    console.log(`No items found in feed "${feed.name}".`);
    return;
  }

  for (const item of rssFeed.channel.item) {
    // Parse the published date safely
    let publishedAt: Date = new Date();
    if (item.pubDate) {
      const date = new Date(item.pubDate);
      if (!isNaN(date.getTime())) {
        publishedAt = date;
      } else {
        publishedAt = new Date(); // fallback to now if invalid
      }
    }

    try {
      // Call your createPost function with individual arguments
      await createPost(
        item.title,
        item.link,
        item.description || "",
        publishedAt,
        feed.id
      );

      console.log(`Saved post: "${item.title}"`);
    } catch (err) {
      console.error(`Failed to save post "${item.title}":`, err);
    }
  }
}