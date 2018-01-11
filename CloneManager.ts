import * as shell from 'shelljs';
import * as fs from 'fs';
import * as Path from 'path';
import { Utils, IManifest } from './Utils';
const chalk = require('chalk');

export class CloneManager {

    constructor(private apotekFolder: string) { }
    
    public clone(gitUrl: string, branch: string = "master") {
        if (gitUrl) {
            console.log(chalk.gray("Updating templates from " + gitUrl));
            shell.cd(this.apotekFolder);
            try {
                if ((<any>shell.exec(`git clone ${gitUrl} templates`, { silent: true })).code > 0) {
                    shell.cd("templates");
                    shell.exec("git pull origin", { silent: true });
                }
                else {
                    shell.cd("templates");
                }

                shell.exec("git checkout " + branch, { silent: true });
                this.apotekFolder = Path.join(this.apotekFolder, "templates");
                return this.apotekFolder;
            }
            finally {
                shell.cd("-");
            }
        } 
        return null;
    }

    public getCommands() {
        return Utils.getCommands(this.apotekFolder);
    }
}