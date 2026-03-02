import { readConfig, setUser } from "./config.js"

type CommandHandler = (cmdName: string, ...args: string[]) => void;


export function handlerLogin(cmdName: string, ...args: string[]): void {
    if (args.length !== 1) {
        console.error("user name is required for login command")
        process.exit(1)
    }
    const username = args[0]
    setUser(username)
    console.log(`The user with username ${username} has been set.`)

}

export type CommandsRegistry = Record<string, CommandHandler>;

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler){
    registry[cmdName] = handler
}

export function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]){
    const handler = registry[cmdName]
    if (!handler) {
        throw new Error(`Unknown command: ${cmdName}`)
    }
    handler(cmdName, ...args)

}