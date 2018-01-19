import * as shell from 'shelljs';
import * as fs from 'fs';
import * as Path from 'path';
import { Utils, IManifest } from './Utils';
import { IOptions } from './Options';
import { ContextManager } from './ContextManager';
const chalk = require('chalk');

export class CloneManager {

    constructor(private options: IOptions, private contextManager: ContextManager) { }
    
    public clone() {

        if (this.options.isTestMode())
            return true;
        
        const gitUrl: string = this.contextManager.currentContext["address"];
        const branch: string = this.contextManager.currentContext["branch"] || "master";

        if (gitUrl) {
            const folder = this.contextManager.currentContext.name;
            console.log(chalk.gray("Updating templates from " + gitUrl));
            shell.cd(this.options.apotekFolder);
            try {
                if ((<any>shell.exec(`git clone ${gitUrl} ${folder}`, { silent: true })).code > 0) {
                    shell.cd(folder);
                    shell.exec("git pull origin", { silent: true });
                }
                else {
                    shell.cd(folder);
                }

                shell.exec("git checkout " + branch, { silent: true });
                this.options.apotekFolder = Path.join(this.options.apotekFolder, folder);
                return true;
            }
            finally {
                shell.cd(this.options.currentFolder);
            }
        } 
        return false;
    }

    public getCommands() {
        return Utils.getCommands(this.options.apotekFolder);
    }
}