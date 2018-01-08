import * as shell from 'shelljs';
import * as fs from 'fs';
import * as Path from 'path';
import { Utils } from './Utils';

export class CloneManager {

    constructor(private apotekFolder: string) { }
    
    public clone(gitUrl: string, branch: string = "master") {
        if (gitUrl) {
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
               
                const manifestFile = Path.join(fullName, "manifest.json");
                if (fs.existsSync(manifestFile)) {
                    let manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
                    manifest.name = manifest.name || name;
                    yield manifest;
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