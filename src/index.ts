import { readConfig, setUser } from "./config.js"
import { CommandsRegistry,registerCommand,runCommand , handlerLogin } from "./command.js"
import { run } from "node:test"
function main() {
    const cmdReg: CommandsRegistry = {}
    const args = process.argv.slice(2)
    if (args.length < 1) {
    console.error("Not enough arguments");
    process.exit(1);
    }

    const [cmdName, ...cmdArgs] = args

    registerCommand(cmdReg, cmdName, handlerLogin)
    runCommand(cmdReg, cmdName, ...cmdArgs)
}

main();

