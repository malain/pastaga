import * as fs from 'fs';
import * as Path from 'path';
import { IOptions } from './Options';
import * as shell from 'shelljs';
const chalk = require('chalk');
const inquirer =require('inquirer');

// options:
//   context name [--set key=value] [--address address]
//   -context|ctx=<name>
export class ContextManager     
{
    private _currentContext: any;
    private _configSettings: any;

    constructor(private options: IOptions) {
    }

    public async run() {
        if (this.options.getCommand() === "help") {
            this.displayHelp();
            return true;
        }
        
        let flag = true;
        let currentContextName;
        let saveConfigs = false;
        const settingsFile = Path.join(this.options.pastagaFolder, "settings.json");
        if (fs.existsSync(settingsFile)) {
            this._configSettings = JSON.parse(fs.readFileSync(settingsFile, "utf8"));
        }
        else {
            saveConfigs = true;
            this._configSettings = { defaultContext: "default", default: { name: "default", address: "https://github.com/vulcainjs/vulcain-code-generation-templates.git" } };
        }

        // Force a context on a command
        if (this.options.getCommand() !== "context") {
            currentContextName = this.options.getOptions("context");
           
            if (!currentContextName)
                currentContextName = this._configSettings.defaultContext;
            
            this._currentContext = (this._configSettings && this._configSettings[currentContextName]);
            if (!this._currentContext)
                throw new Error("Invalid context. You must provide a valid context name.");
            console.log(chalk.bold(`Using '${currentContextName}' context.`));
            flag = false;
        }
        else {
            // Context commands
            currentContextName = this.options.getGlobalArgs(1);
            if (!currentContextName) {
                let choices = Object.keys(this._configSettings)
                    .filter(k => typeof this._configSettings[k] === "object")
                    .map(k => ({ name: k }));
                if (choices.length > 0) {
                    let res = await inquirer.prompt([{ name: "context", type: "list", message: "Select a context", default: this._configSettings.defaultContext, choices }]);
                    currentContextName = res.context;
                }
            }
          
            if (!currentContextName) {
                throw new Error("Invalid command context. You must provide a context name.");
            }

            this._currentContext = (this._configSettings && this._configSettings[currentContextName]);

            let rm = this.options.getOptions("remove");
            if (rm) {
                if (!this._currentContext) {
                    console.log(chalk.red("Unknown context"));
                    return true;
                }
            
                if (currentContextName === "default") {
                    console.log(chalk.red("You can not remove default context"));
                    return true;
                }

                let res = await inquirer.prompt([{ name: "ok", message: "Remove context " + currentContextName, type: "confirm" }]);
                if (!res.ok)
                    return true;
            
                saveConfigs = true;
                shell.rm("-rf", Path.join(this.options.pastagaFolder, currentContextName));
            
                this._configSettings[currentContextName] = undefined;
                currentContextName = this._configSettings.defaultContext = "default";
                this._currentContext = (this._configSettings && this._configSettings[currentContextName]);

                console.log("'" + chalk.yellow(currentContextName) + "' context removed. Switching to '" + chalk.yellow("default") + "' context.");
            }
            else {
                if (!this._currentContext) {
                    this._currentContext = { name: currentContextName };
                    this._configSettings[currentContextName] = this._currentContext;
                    saveConfigs = true;
                }
            
                if (this._configSettings.defaultContext !== currentContextName) {
                    saveConfigs = true;
                    this._configSettings.defaultContext = currentContextName;
                }

                if (this.processOption("address")) {
                    saveConfigs = true;
                    console.log(chalk.cyan("SECURITY WARNING: You have added a new repository reference to use with Pastaga."));
                    console.log(chalk.cyan("SECURITY WARNING: Ensure this repository is safe and it not run malicious code."));
                    console.log(chalk.cyan("SECURITY WARNING: Pay attention that this repository will be refreshed every time you use it."));
                    console.log(chalk.cyan("SECURITY WARNING: In doubt, do not use this repository with Pastaga or use it has your own risk."));
                    console.log("");
                }

                saveConfigs = this.processOption("branch") || saveConfigs;
                saveConfigs = this.processSet() || saveConfigs;
                saveConfigs = this.processUnset() || saveConfigs;
            }
        
            if (this._currentContext) {
                console.log("------");
                Object.keys(this._currentContext).forEach(k => {
                    console.log(chalk.bold(k) + ": " + chalk.green(this._currentContext[k]));
                });
                console.log("------");
            }
            console.log("");
        }
    
        if (saveConfigs) {
            fs.writeFileSync(settingsFile, JSON.stringify(this._configSettings));
         //   this._currentContext && console.log(chalk.yellow(`Configuration ${currentContextName} updated.`))
        }
        return flag;
    }

    private processSet(): boolean {
        let values: string[] = this.options.getOptions("set");
        if (values) {
            if (!Array.isArray(values))
                values = [values];
            for (let val of values) {
                let parts = val.split('=');
                if (parts.length === 2) {
                    this._currentContext["globals"] = this._currentContext["globals"] || {};
                    let val = parts[1];
                    if (val && val.length > 1) {
                        if (val[0] === '"' || val[0] === "'")
                            val = val.substr(1);
                        if (val[val.length - 1] === '"' || val[val.length - 1] === "'")
                            val = val.substr(0, val.length - 1);
                        this._currentContext[parts[0]] = val;
                    }
                }
            }
            return true;
        }
        return false;
    }

    private processUnset(): boolean {
        let values: string[] = this.options.getOptions("unset");
        if (values && this._currentContext["globals"]) {
            if (!Array.isArray(values))
                values = [values];
            for (let val of values) {
                this._currentContext["globals"][val] = undefined;
            }
            return true;
        }
        return false;
    }

    private processOption(name: string): boolean {
        let val = this.options.getOptions(name);
        if (val != null && val !== this._currentContext[name]) {
            this._currentContext[name] = val;
            return true;
        }
        return false;
    }

    public getState(): any {
        return Object.assign( {}, this._currentContext["globals"], this.options.getOptions());
    }

    public get currentContext() {
        return Object.assign({}, this._currentContext);
    }

    private displayHelp() {
        console.log("pastaga context <context> [--address <url>] [--branch <branch>] [--set <key=value>] [--unset <value>]");
        console.log("pastaga [--context <context>] [command] [options]");
        console.log("");
    }
}