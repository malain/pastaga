import * as fs from 'fs';
import * as Path from 'path';
import { Options } from './Options';
const chalk = require('chalk');
const inquirer =require('inquirer');

// options:
//   context name [--set key=value] [--address address]
//   -context|ctx=<name>
export class ContextManager     
{
    private _currentContext: any;
    private _configSettings:any;

    constructor(private options: Options, private apotekFolder:string) {
    }

    public async run() {        
        const settingsFile = Path.join(this.apotekFolder, "settings.json");
        if (fs.existsSync(settingsFile)) {
            this._configSettings = JSON.parse(fs.readFileSync(settingsFile, "utf8"));
        }
        else {
            this._configSettings = { defaultContext: "default", default: { address: "https://github.com/vulcainjs/vulcain-code-generation-templates.git", branch: "gentool" } };
        }

        if (this.options.getCommand() !== "context") {
            let currentContextName = this.options["--context"] || this.options["--ctx"];
            if (currentContextName === true) {
                throw new Error("Invalid context. You must provide a context name.");  
            }
            
            if (!currentContextName)
                currentContextName = this._configSettings.defaultContext;
            
            this._currentContext = (this._configSettings && this._configSettings[currentContextName]); 
            if(!this._currentContext)
                throw new Error("Invalid context. You must provide a valid context name.");  
            console.log(chalk.bold(`Using '${currentContextName}' context.`));
            return;
        }
        
        let currentContextName = this.options.GetGlobalArgs(1);
        if (!currentContextName) {
            let choices = Object.keys(this._configSettings).filter(k => typeof this._configSettings[k] === "object").map(k => ({ name: k }));
            if(choices.length > 0)
                currentContextName = await inquirer.prompt([{ name: "context", type: "list", default: this._configSettings.defaultContext, choices }]);
        }
          
        if (!currentContextName) {            
            throw new Error("Invalid command context. You must provide a context name.");
        }

        let saveConfigs = false;
        this._currentContext = (this._configSettings && this._configSettings[currentContextName]);
        if (!this._currentContext) {
            this._currentContext = { name: currentContextName };
            this._configSettings[currentContextName] = this._currentContext;
            saveConfigs = true;
        }
        
        if (this._configSettings.defaultContext !== currentContextName) {
            saveConfigs = true;
            this._configSettings.defaultContext = currentContextName;
        }

        saveConfigs = this.processOption("address") || saveConfigs;    
        saveConfigs = this.processOption("branch") || saveConfigs;    

        saveConfigs = this.processSet() || saveConfigs;
        saveConfigs = this.processUnset() || saveConfigs;
        
        if (saveConfigs) {
            fs.writeFileSync(settingsFile, JSON.stringify(this._configSettings));
            console.log(chalk.yellow("Configuration updated."))
        }
        return true;
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
                    this._currentContext[parts[0]] = parts[1];
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
        let addr = this.options.getOptions(name);
        if (addr !== this._currentContext[name]) {
            this._currentContext[name] = this.options.getOptions(name);
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
}