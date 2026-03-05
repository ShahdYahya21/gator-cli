import { db } from "..";
import { posts } from "../schema";
import { eq ,sql} from "drizzle-orm";
import { feeds, feedFollows } from "../schema";



export async function createPost(title : string, url: string, description: string , publishedAt: Date, feedId: string) {
    const [result] = await db.insert(posts).values({
        title,
        url,
        description,
        publishedAt,
        feedId
    }).onConflictDoNothing({ target: posts.url }).returning();

    return result;
}




export async function getPostsForUser(userId: string, limit: number = 2) {
    const result = await db
        .select({
            id: posts.id,
            title: posts.title,
            url: posts.url,
            description: posts.description,
            publishedAt: posts.publishedAt,
            feedId: posts.feedId
        })
        .from(posts)
        .innerJoin(feeds, eq(posts.feedId, feeds.id))
        .innerJoin(feedFollows, eq(feedFollows.feedId, feeds.id))
        .where(eq(feedFollows.userId, userId))
        .orderBy(sql`${posts.publishedAt} DESC`)
        .limit(limit);

    return result;
}