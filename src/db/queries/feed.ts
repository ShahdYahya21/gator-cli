import { db } from "..";
import { feeds, feedFollows , users } from "../schema";
import { eq, and, asc } from "drizzle-orm";

//Create a new function to create a feed.
export async function createFeed(name: string, url: string, userId: string) {
  const [feed] = await db.insert(feeds).values({
    name,
    url,
    userId,
  }).returning();

  // Create a feed follow record for the current user
  await createFeedFollow(userId, feed.id);
  return feed;
}


export async function getFeeds() {
  const result = await db.select().from(feeds);
  return result;
}


export async function createFeedFollow(userId: string, feedId: string) {
  // Insert the feed follow
  const [newFollow] = await db
    .insert(feedFollows)
    .values({ userId, feedId })
    .returning();

  // Query the inserted record with joins to get feed name and user name
  const [result] = await db
    .select({
      id: feedFollows.id,
      createdAt: feedFollows.createdAt,
      updatedAt: feedFollows.updatedAt,
      feedName: feeds.name,
      userName: users.name,
    })
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .where(eq(feedFollows.id, newFollow.id));

  return result;
}


export async function getFeedByUrl(url: string) {
  const [result] = await db.select().from(feeds).where(eq(feeds.url, url)).limit(1);
  return result;
}


export async function getFeedFollowsForUser(userId: string) {
  const result = await db
    .select({
      id: feedFollows.id,
      createdAt: feedFollows.createdAt,
      updatedAt: feedFollows.updatedAt,
      feedName: feeds.name,
      userName: users.name,
    })
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .where(eq(feedFollows.userId, userId));

  return result;
}


// function to delete a feed follow record by user and feed url combination.
export async function deleteFeedFollow(userId: string, feedUrl: string) {
    // Find the feed by URL
    const feed = await getFeedByUrl(feedUrl);
    if (!feed) {
        throw new Error(`Feed not found for URL: ${feedUrl}`);
    }

    // Delete the feed follow record
    return await db
        .delete(feedFollows)
        .where(
      and(
          eq(feedFollows.userId, userId),
          eq(feedFollows.feedId, feed.id)
      )
  )
        .execute();

}

// Updates the last_fetched_at column and also updated_at to the current timestamp
export async function markFeedFetched(feedId: string) {
    const now = new Date();
    await db
        .update(feeds)
        .set({
            lastFetchedAt: now,
            updatedAt: now,
        })
        .where(eq(feeds.id, feedId))
        .execute();
}

// Get the feed that was fetched the longest time ago (or never fetched). This will be used by the fetch command to determine which feed to fetch next.
import { sql } from "drizzle-orm";

export async function getNextFeedToFetch() {
  const [feed] = await db
    .select()
    .from(feeds)
    .orderBy(sql`${feeds.lastFetchedAt} ASC NULLS FIRST`)
    .limit(1);

  return feed ?? null;
}