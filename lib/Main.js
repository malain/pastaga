"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ContextManager_1 = require("./ContextManager");
const Utils_1 = require("./Utils");
const CloneManager_1 = require("./CloneManager");
const Executor_1 = require("./Executor");
const inquirer = require('inquirer');
class Main {
    run(options) {
        return __awaiter(this, void 0, void 0, function* () {
            let folders = Utils_1.Utils.ensuresApotekFolder();
            let contextManager = new ContextManager_1.ContextManager(options, folders.apotek);
            try {
                if (contextManager.run())
                    return;
            }
            catch (e) {
                console.log(e.message);
            }
            let cm = new CloneManager_1.CloneManager(folders.apotek);
            if (!(folders.apotek = cm.clone(contextManager.currentContext["address"], contextManager.currentContext["branch"]))) {
                return;
            }
            console.log('');
            const commands = Array.from(cm.getCommands());
            if (commands.length > 0) {
                let command = options.getCommand();
                if (!command) {
                    // select command
                    let res = yield inquirer.prompt([{ name: "command", type: "list", message: "Select a command", choices: commands.concat("quit") }]);
                    command = res.command;
                    if (command === "quit")
                        return;
                }
                let state = contextManager.getState();
                while (command) {
                    const cmd = commands.find(c => c.name === command);
                    if (!cmd) {
                        console.log("Unknown command " + command);
                        return;
                    }
                    const executor = new Executor_1.Executor(folders.apotek, cmd, folders.cwd);
                    try {
                        command = yield executor.execute(state);
                    }
                    catch (e) {
                        console.log(e);
                        break;
                    }
                }
            }
        });
    }
}
exports.Main = Main;
//# sourceMappingURL=Main.js.map