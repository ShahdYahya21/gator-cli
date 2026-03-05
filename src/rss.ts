import { XMLParser } from "fast-xml-parser";
import { getNextFeedToFetch, markFeedFetched } from "./db/queries/feed";

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


// Iterate over its posts/items and print their titles to the console
export async function scrapeFeeds() {
    const feed = await getNextFeedToFetch();
    if (!feed) {
        console.log("No feeds to fetch.");
        return;
    }

    await markFeedFetched(feed.id);

    const rssFeed = await fetchFeed(feed.url);
    console.log(`Fetched ${rssFeed.channel.item.length} items from feed "${feed.name}":`);
    for (const item of rssFeed.channel.item) {
        console.log(`- ${item.title}`);
    }
}