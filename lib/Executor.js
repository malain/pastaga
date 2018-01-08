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
const Path = require("path");
const Utils_1 = require("./Utils");
const shell = require("shelljs");
const inquirer = require('inquirer');
const fs = require('fs');
const ejs = require('ejs');
const unirest = require('unirest');
const chalk = require('chalk');
class Executor {
    constructor(_commandFolder, command, _currentFolder) {
        this._commandFolder = _commandFolder;
        this.command = command;
        this._currentFolder = _currentFolder;
        this.state = {};
        this._commandFolder = Path.join(this._commandFolder, command.name);
    }
    /**
     * Expose chalk package
     */
    get chalk() {
        return chalk;
    }
    /**
     * Expose ejs package
     */
    get ejs() {
        return ejs;
    }
    /**
     * Expose shell package
     */
    get shell() {
        return shell;
    }
    /**
     * Expose unirest package
     */
    get rest() {
        return unirest;
    }
    /**
     * Get the current folder
     */
    get currentFolder() {
        return this._currentFolder;
    }
    /**
     * Current command template folder
     */
    get commandFolder() {
        return this._commandFolder;
    }
    /**
     * Current command name
     */
    get commandName() {
        return this.command.name;
    }
    execute(state) {
        return __awaiter(this, void 0, void 0, function* () {
            let ctx = yield this.createContextAsync("", state);
            let nextCommand = yield ctx.exec();
            return nextCommand;
        });
    }
    createContextAsync(folder, state) {
        return __awaiter(this, void 0, void 0, function* () {
            let Context = require(Path.join(this._commandFolder, folder, 'context')).Context;
            let ctx = new Context();
            ctx.state = Object.assign({}, state);
            ctx.context = this;
            yield Promise.all([this.getPrompts(ctx)]);
            return ctx;
        });
    }
    getDirectories(templatesFolder = ".") {
        return Utils_1.Utils.getDirectories(templatesFolder);
    }
    getPrompts(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ctx.prompts)
                return;
            for (let prompt of ctx.prompts()) {
                if (prompt.then) {
                    prompt = yield prompt;
                }
                let retry = false;
                do {
                    if (!ctx.state[prompt.name] || retry) {
                        let res = yield inquirer.prompt([prompt]);
                        ctx.state[prompt.name] = res[prompt.name];
                        retry = false;
                    }
                    else if (prompt.validate) {
                        let msg = prompt.validate(ctx.state[prompt.name]);
                        if (typeof msg === "string") {
                            console.log(chalk.red(msg));
                            retry = true;
                        }
                    }
                    else
                        break;
                } while (retry);
            }
        });
    }
}
exports.Executor = Executor;
//# sourceMappingURL=Executor.js.map