import { readConfig, setUser } from "./config.js"
import { createUser, getUserByName, deleteAllUsers, getUsers } from "./db/queries/user.js"; 
import { db } from "./db/index.js";

type CommandHandler = (cmdName: string, ...args: string[]) => void;

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
export async function resetHandler(cmdName: string, ...args: string[]): Promise<void> {
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
export async function getUsersHandler(cmdName: string, ...args: string[]): Promise<void> {
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





