import * as Path from 'path';
import { Utils, IManifest } from './Utils';
import * as shell from 'shelljs';
import { ExecutionContext } from './Apotek';

const inquirer =require('inquirer');
const fs = require('fs');
const ejs = require('ejs');
const unirest = require('unirest');
const chalk = require('chalk');
const glob = require('glob');

export class Executor {
    private state = {};
    private ctx;

     /**
     * Expose chalk package
     */
    public get glob() {
        return glob;
    }

    /**
     * Expose chalk package
     */
    public get chalk() {
        return chalk;
    }

    /**
     * Expose ejs package
     */
    public get ejs() {
        return ejs;
    }

    /**
     * Expose shell package
     */
    public get shell() {
        return shell;
    }

    /**
     * Expose unirest package
     */
    public get rest() {
        return unirest;
    }

    /**
     * Get the current folder 
     */
    public get currentFolder() {
        return this._executionContext.currentFolder;
    }

    /**
     * Current command template folder
     */
    public get commandFolder() {
        return this._executionContext.commandFolder;
    }

    public get entryPoint() {
        return this._executionContext.entryPoint;
    }

    constructor(private _executionContext: ExecutionContext) {
        if (this._executionContext.dependencies) {
            console.log(chalk.blue("Installing command dependencies"));
            this._executionContext.dependencies.forEach(pkg => {
                shell.exec("npm install " + pkg);
            })
        }
    }

    public async execute(state?: any): Promise<string> {
        console.log(chalk.blue("Running command " + this._executionContext.command));
        let ctx:any = await this.createContextAsync("", state);
        let nextCommand = await ctx.exec();
        return nextCommand;
    } 

    public async createContextAsync(folder:string, state) {
        let Context;
        this._executionContext.entryPoint = this._executionContext.entryPoint || "index.js";
        try {
            Context = require(Path.join(this._executionContext.commandFolder, folder, this._executionContext.entryPoint));
        }
        catch (e) {
            if (e.code !== "MODULE_NOT_FOUND")
                throw e;
            throw new Error("Unable to load entrypoint " + this._executionContext.entryPoint);
        }

        let ctx = new Context.default();
        ctx.state = state;
        ctx.context = this;
        await Promise.all([this.getPrompts(ctx)]);
        return ctx;
    }

    public getTemplates(templatesFolder: string) {        
        return Utils.getTemplates(templatesFolder);
    }

    private async getPrompts(ctx) {
        if (!ctx.prompts)
            return;
        
        for (let prompt of ctx.prompts()) {
            if (prompt.then) {
                prompt = await prompt;
            }

            let retry = false;
            do {
                if (!ctx.state[prompt.name] || retry) {
                    let res = await inquirer.prompt([prompt]);
                    ctx.state[prompt.name] = res[prompt.name];
                    retry = false;
                }
                else if (prompt.validate) {
                    let msg = prompt.validate(ctx.state[prompt.name]);
                    if (typeof msg==="string") {
                        console.log(chalk.red(msg));
                        retry = true;
                    }
                }
                else
                    break;    
            }
            while (retry);
        }
    }
}
