import * as fs from 'fs';
import * as Path from 'path';
import { Options } from './Options';

// options:
//   context name [--set key=value] [--address address]
//   -context|ctx=<name>
export class ContextManager     
{
    private _currentContext: any;
    private _configSettings:any;

    constructor(private options: Options, private apotekFolder:string) {
    }

    public run() {        
        const settingsFile = Path.join(this.apotekFolder, "settings.json");
        if (fs.existsSync(settingsFile)) {
            this._configSettings = JSON.parse(fs.readFileSync(settingsFile, "utf8"));
        }
        else {
            this._configSettings = { defaultContext: "default", default: { address: "https://github.com/vulcainjs/vulcain-code-generation-templates.git", branch: "gentool" } };
        }

        if (this.options.getCommand() !== "context") {
            let currentContextName = this.options["--context"] || this.options["--ctx"] || this._configSettings.defaultContext;
            this._currentContext = (this._configSettings && this._configSettings[currentContextName]) || { name: currentContextName };                      
            return;
        }
        
        let currentContextName = this.options.GetGlobalArgs(1);
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

            saveConfigs = true;
        }
        
        if (saveConfigs) {
            fs.writeFileSync(settingsFile, JSON.stringify(this._configSettings));
        }
        return true;
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