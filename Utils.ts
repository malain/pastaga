import * as shell from 'shelljs';
import * as fs from 'fs';
import * as Path from 'path';

export class Utils {
    public static ensuresApotekFolder() {
        const cwd = shell.pwd().toString();
        let apotek: string;
        let silentState = shell.config.silent;
        shell.config.silent = true;
        try {
            shell.cd("~/.apotek");
            if (shell.error()) {
                shell.mkdir("~/.apotek");
                shell.cd("~/.apotek");
            }
            apotek = shell.pwd().toString();
        }
        finally {
            shell.config.silent = silentState;
            shell.cd(cwd);
        }

        return { cwd, apotek };
    }

    static getDirectories(templatesFolder: string=".", level=1) {
        return Array.from(Utils.getDirectoriesInternal(templatesFolder, null, level, 1));
    }

    static *getDirectoriesInternal(templatesFolder: string, templateName:string, maxLevel:number, level: number): IterableIterator<string> {
        let names = fs.readdirSync(templatesFolder);
        for (let name of names) {
            try {
                if (name[0] === "." || name[0] === "$")
                    continue;

                const fullName = Path.join(templatesFolder, name);
                const stat = fs.statSync(fullName);
                if (!stat.isDirectory())
                    continue;          
                
                let tn = templateName ? templateName + Path.sep + name : name;
                if (level < maxLevel) {
                    let hasDirectories = false;           
                    for (let dir of Utils.getDirectoriesInternal(fullName, tn, maxLevel, level + 1)) {
                        hasDirectories = true;
                        yield tn + Path.sep + dir;
                    }
                }
                yield tn;
            }
            catch (e) {
                console.log(e.message);
                // ignore
            }
        }
    }
}