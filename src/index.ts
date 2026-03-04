import { CommandsRegistry, registerCommands, runCommand, handlerLogin, handlerRegister,resetHandler,getUsersHandler, aggCommandHandler,addfeedCommandHandler,feedListHandler} from "./command.js"

function main() {
    const cmdReg: CommandsRegistry = {}

    // Register all commands at startup
    registerCommands(cmdReg, "login", handlerLogin)
    registerCommands(cmdReg, "register", handlerRegister)
    registerCommands(cmdReg, "reset", resetHandler)
    registerCommands(cmdReg, "users", getUsersHandler)
    registerCommands(cmdReg, "agg", aggCommandHandler)
    registerCommands(cmdReg, "addfeed", addfeedCommandHandler)
    registerCommands(cmdReg, "feeds", feedListHandler)

    const args = process.argv.slice(2)
    if (args.length < 1) {
        console.error("Not enough arguments")
        process.exit(1)
    }

    const [cmdName, ...cmdArgs] = args

    // Run the command user typed
    runCommand(cmdReg, cmdName, ...cmdArgs)
}

main()