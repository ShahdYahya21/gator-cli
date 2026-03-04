import { db } from "..";
import { feeds } from "../schema";
import { eq } from "drizzle-orm";


//Create a new function to create a feed.
export async function createFeed(name: string, url: string, userId: string) {
  const feed = await db.insert(feeds).values({
    name,
    url,
    userId,
  });
  return feed;
}

export async function getFeeds() {
  const result = await db.select().from(feeds);
  return result;
}