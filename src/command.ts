import { readConfig, setUser } from "./config.js"
import { createUser, getUserByName, deleteAllUsers, getUsers, getUserById } from "./db/queries/user.js"; 
import { createFeed , getFeeds , getFeedByUrl , createFeedFollow, getFeedFollowsForUser, deleteFeedFollow } from "./db/queries/feed.js";
import { db } from "./db/index.js";
import { fetchFeed } from "./rss.js"
import { feeds, users } from "./db/schema";

type CommandHandler = (cmdName: string, ...args: string[]) => void;

type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;

type middlewareLoggedIn = (handler: UserCommandHandler) => CommandHandler;

export const middlewareLoggedIn: middlewareLoggedIn = (handler) => {
    return async (cmdName: string, ...args: string[]) => {
        const username = readConfig().currentUserName;
        if (!username) {
            console.error("No user logged in. Please login first.");
            process.exit(1);
        }

        const user = await getUserByName(username);
        if (!user) {
            console.error(`Logged-in user "${username}" not found in database.`);
            process.exit(1);
        }

        return handler(cmdName, user, ...args);
    };
};



export type Feed = typeof feeds.$inferSelect;
export type User = typeof users.$inferSelect;

//Just updates the current user in your app’s config.
export async function handlerLogin(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length !== 1) {
        console.error("user name is required for login command")
        process.exit(1)
    }
    const username = args[0]
    const existingUser = await getUserByName(username);
    if (!existingUser) {
        console.error(`User "${username}" does not exist!`);
        process.exit(1);
    }
    setUser(username)
    console.log(`The user with username ${username} has been set.`)
    await db.$client.end()

}

export type CommandsRegistry = Record<string, CommandHandler>;


export function registerCommands(registry: CommandsRegistry, cmdName: string, handler: CommandHandler){
    registry[cmdName] = handler
}

export function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]){
    const handler = registry[cmdName]
    if (!handler) {
        throw new Error(`Unknown command: ${cmdName}`)
    }
    handler(cmdName, ...args)

}

// This command should create a new user in the database and set it as the current user in the config. It should also print a confirmation message and some debug info about the new user.
export async function handlerRegister(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length !== 1) {
        console.error("A username is required to register");
        process.exit(1);
    }

    const username = args[0];

    const existingUser = await getUserByName(username);
    if (existingUser) {
        console.error(`User "${username}" already exists!`);
        process.exit(1);
    }

    // Create the new user
    const newUser = await createUser(username);

    // Set the current user in the config
    setUser(username);

    // Print confirmation and debug info
    console.log(`User "${username}" has been created!`);
    console.log("New user data:", newUser);
    await db.$client.end(); 

}

// reset the dataset (delete all users)
export async function resetHandler(): Promise<void> {
  try {
    await deleteAllUsers();
    console.log("All users have been deleted.");
    await db.$client.end(); 
  } catch (err) {
    console.error("Failed to reset users.");
    console.error(err);
    process.exit(1);
  }
}

// get all users and mention the logged in user
export async function getUsersHandler(): Promise<void> {
  try {
    const users = await getUsers();
    const currentUser = readConfig().currentUserName;

    for (const user of users) {
      if (user.name === currentUser) {
        console.log(`* ${user.name} (current)`);
      } else {
        console.log(`* ${user.name}`);
      }
    }

  } catch (err) {
    console.error("Failed to get users.");
    console.error(err);
    process.exit(1);
  }
   await db.$client.end(); 
}

// this command fetch rss from the url "https://www.wagslane.dev/index.xml" and print the title, link, description, and publication date of each item in the feed. 
export async function aggCommandHandler(): Promise<void> {
    const feedurl = 'https://www.wagslane.dev/index.xml';
    const feed = await fetchFeed(feedurl)
    console.log("Feed title:", feed.channel.title);
    console.log("Feed link:", feed.channel.link);
    console.log("Feed description:", feed.channel.description);
    console.log("Items:");
    for (const item of feed.channel.item) {
        console.log("- Title:", item.title);
        console.log("  Link:", item.link);
        console.log("  Description:", item.description);
        console.log("  Publication Date:", item.pubDate);
    }

}



export async function addfeedCommandHandler(cmdName: string,user : User, ...args: string[]): Promise<void> {
    if (args.length !== 2) {
        console.error("addfeed command requires exactly 2 arguments: name and url");
        process.exit(1);
    }
    const [name, url] = args;
    console.log(`Adding feed with name "${name}" and url "${url}"`);
   if (!user.id) {
       console.error("User ID is not set.");
       process.exit(1);
   }

   const feed = await createFeed(name, url, user.id);
   console.log("Feed created:", feed);
   await db.$client.end();
}


export function printFeed(feed: Feed, user: User) {
  console.log("Feed:");
  console.log(`  Name: ${feed.name}`);
  console.log(`  URL: ${feed.url}`);
  console.log(`  Created at: ${feed.createdAt}`);
  console.log(`  Updated at: ${feed.updatedAt}`);
  console.log("Added by user:");
  console.log(`  Name: ${user.name}`);
  console.log(`  ID: ${user.id}`);
  console.log("-----");
}


export async function feedListHandler() {
  try {
    const feeds = await getFeeds();
    for (const feed of feeds) {
      const user = await getUserById(feed.userId);
      printFeed(feed, user);
    }
  } catch (err) {
    console.error("Failed to list feeds.");
    console.error(err);
    process.exit(1);
  }
    await db.$client.end();

}




export async function followCommandHandler(cmdName: string,user : User, ...args: string[]): Promise<void> {
    if (args.length !== 1) {
        console.error("follow command requires exactly 1 argument: feed url");
        process.exit(1);
    }       
    const [url] = args;
    console.log(`Following feed with url "${url}"`);
    if (!user.id) {
        console.error("User ID is not set.");
        process.exit(1);
    }

   const feed = await getFeedByUrl(url);
   if (!feed) {
       console.error(`Feed not found for URL: ${url}`);
       process.exit(1);
   }

   const result = await createFeedFollow(user.id, feed.id);
   console.log(`User "${user.name}" is now following feed "${feed.name}".`);
   await db.$client.end();
}



export async function followingCommandHandler(cmdName: string,user : User): Promise<void> {
  if (!user.id) {
    console.error("User ID is not set.");
    process.exit(1);
  }

  const follows = await getFeedFollowsForUser(user.id);
  if (follows.length === 0) {
    console.log(`User "${user.name}" is not following any feeds.`);
  } else {
    console.log(`User "${user.name}" is following the following feeds:`);
    for (const follow of follows) {
      console.log(`- ${follow.feedName}`);
    }
  }
  await db.$client.end();
}


export async function unfollowCommandHandler(cmdName: string, user: User, ...args: string[]): Promise<void> {
  if (args.length !== 1) {
    console.error("unfollow command requires exactly 1 argument: feed url");
    process.exit(1);
  }
  const [url] = args;
  console.log(`Unfollowing feed with url "${url}"`);
  if (!user.id) {
    console.error("User ID is not set.");
    process.exit(1);
  }

  const result = await deleteFeedFollow(user.id, url);
  if (result) {
    console.log(`Successfully unfollowed feed with url "${url}"`);
  } else {
    console.error(`Failed to unfollow feed with url "${url}"`);
  }
  await db.$client.end();
}
