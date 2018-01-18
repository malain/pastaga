import { ContextManager } from "./ContextManager";
import { IOptions, TestOptions } from "./Options";
import { Utils, IManifest } from "./Utils";
import { CloneManager } from "./CloneManager";
import { Executor } from "./Executor";
import * as Path from 'path';
const inquirer = require('inquirer');
const chalk = require('chalk');

export interface ExecutionContext {
    commandFolder: string;
    currentFolder: string;
    command: string;
    entryPoint?: string;
    dependencies?: string[];
}

export default class Apotek {

    public test(commandName: string, state: any) {
        return this.run(new TestOptions(commandName, state));
    }

    public async run(options: IOptions) {
        let contextManager = new ContextManager(options);
        try {
            if (await contextManager.run())
                return;
        }
        catch (e) {
            console.log(e.message);
        }

        let cm = new CloneManager(options.apotekFolder);
        if (!options.isTestMode && !(options.apotekFolder = cm.clone(contextManager.currentContext["address"], contextManager.currentContext["branch"]))) {
            return;
        }
        console.log('');

        const commands = cm.getCommands();
        if (commands.length > 0) {
            let command = options.getCommand();
            if (!command) {
                // select command
                let res = await inquirer.prompt([{
                    name: "command",
                    type: "list",
                    message: "Select a command",
                    choices: commands.concat({ name: "quit" })
                }]);
                command = res.command;
                if (command === "quit")
                    return;
            }

            let state = contextManager.getState();
            let commandFolder = options.apotekFolder;
            while (command) {
                const cmd = commands.find(c => c.value === command);
                if (!cmd) {
                    console.log("Unknown command " + command);
                    return;
                }

                commandFolder = Path.join(commandFolder, cmd.value);
                let ctx: ExecutionContext = {
                    commandFolder,
                    command: cmd.value,
                    currentFolder: options.currentFolder,
                    entryPoint: cmd.entryPoint,
                    dependencies: cmd.dependencies
                };
                const executor = new Executor(ctx);
                try {
                    if (cmd.state)
                        state = Object.assign(cmd.state, state);
                    command = await executor.execute(state);
                }
                catch (e) {
                    console.log(chalk.red("Error : " + e));
                    break;
                }
            }
        }
    }
}