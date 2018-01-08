"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const Path = require("path");
const chalk = require('chalk');
// options:
//   context name [--set key=value] [--address address]
//   -context|ctx=<name>
class ContextManager {
    constructor(options, apotekFolder) {
        this.options = options;
        this.apotekFolder = apotekFolder;
    }
    run() {
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
            console.log(chalk.bold(`Using '${currentContextName}' context.`));
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
        let values = this.options.getOptions("set");
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
            console.log(chalk.yellow("Configuration updated."));
        }
        return true;
    }
    processOption(name) {
        let addr = this.options.getOptions(name);
        if (addr !== this._currentContext[name]) {
            this._currentContext[name] = this.options.getOptions(name);
            return true;
        }
        return false;
    }
    getState() {
        return Object.assign({}, this._currentContext["globals"], this.options.getOptions());
    }
    get currentContext() {
        return Object.assign({}, this._currentContext);
    }
}
exports.ContextManager = ContextManager;
//# sourceMappingURL=ContextManager.js.map