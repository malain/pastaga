import * as shell from 'shelljs';
import * as fs from 'fs';
import * as Path from 'path';
import { Utils } from './Utils';
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

    public *getCommands() {
        for (let name of Utils.getDirectories(this.apotekFolder)) {
            try {
                const fullName = Path.join(this.apotekFolder, name);
               
                // Manifest can be an object or an array
                const manifestFile = Path.join(fullName, "manifest.json");
                if (fs.existsSync(manifestFile)) {
                    let manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
                    if (Array.isArray(manifest)) {
                        for (let m of manifest) {
                            m.name = m.name || name;
                            m.value = m.description;
                            yield m;
                        }
                    }
                    else {
                        // {name:string, value?:string, entryPoint?: contextfile, state?: any}
                        manifest.name = manifest.name || name;
                        manifest.value = manifest.description;
                        yield manifest;
                    }    
                }
                else {
                    yield { name };
                }
            }
            catch (e) {
                console.log(e.message);
                // ignore
            }
        }
    }
}