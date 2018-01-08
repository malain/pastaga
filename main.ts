import { ContextManager } from "./ContextManager";
import { Options } from "./Options";
import { Utils } from "./Utils";
import { CloneManager } from "./CloneManager";
import { Executor } from "./Executor";
const inquirer =require('inquirer');

export class Main {

    public async run(options: Options) {
        let folders = Utils.ensuresApotekFolder();

        let contextManager = new ContextManager(options, folders.apotek);
        try {
            if (contextManager.run())
                return;
        }
        catch (e) {
            console.log(e.message);
        }
        
        let cm = new CloneManager(folders.apotek);
        if (!(folders.apotek = cm.clone(contextManager.currentContext["address"], contextManager.currentContext["branch"]))) { 
            return;
        }

        const commands = Array.from(cm.getCommands());
        if (commands.length > 0) {
            let command = options.getCommand();
            if (!command) {
                // select command
                let res = await inquirer.prompt([{ name: "command", type:"list", message: "Select a command", choices: commands.concat("quit")}]);
                command = res.command;
                if (command === "quit")
                    return;    
            }

            let state = contextManager.getState();
            while (command) {
                const cmd = commands.find(c => c.name === command);
                if ( !cmd ) {
                    console.log("Unknown command " + command);
                    return;
                }

                const executor = new Executor(folders.apotek, cmd, folders.cwd);
                try {
                    command = await executor.execute(state);
                }
                catch (e) {
                    console.log(e);
                    break;
                }
            }    
        }        
    }
}