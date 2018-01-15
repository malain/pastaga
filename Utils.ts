import * as shell from 'shelljs';
import * as fs from 'fs';
import * as Path from 'path';

export interface IManifest {
    name: string;
    value?: string;
    entryPoint?: string;
    state?: any
    description?: string;
    dependencies?: string[];
}

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

    private static makeTemplateName(base: string, name: string) {
        return (base ? base + "/" : "") + name;
    }

    static getCommands(commandFolder: string): IManifest[] {
        return Array.from(Utils.getTemplatesInternal(commandFolder, false));
    }
    
    static getTemplates(templatesFolder: string): IManifest[] {
        return Array.from(Utils.getTemplatesInternal(templatesFolder, true));
    }
    
    private static *getTemplatesInternal(templatesFolder: string, recurse=true, templateName = ""): IterableIterator<IManifest> {
        for (let name of Utils.getDirectories(templatesFolder)) {
            try {
                const fullName = Path.join(templatesFolder, name);
                
                // If there is a manifest, take it and stop prospection
                // Manifest can be an object or an array
                const manifestFile = Path.join(fullName, "manifest.json");
                if (fs.existsSync(manifestFile)) {
                    let manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
                    if (Array.isArray(manifest)) {
                        for (let m of manifest) {
                            m.value = Utils.makeTemplateName(templateName, name);
                            m.name = Utils.makeTemplateName(templateName, m.name || name) + (m.description ? " - " + m.description : "");
                            yield m;
                        }
                    }
                    else {                      
                        manifest.value = Utils.makeTemplateName(templateName, name);
                        manifest.name = Utils.makeTemplateName(templateName, manifest.name || name) + (manifest.description ? " - " + manifest.description : "");
                        yield manifest;
                    }
                }
                else {
                    let hasDirectories = false;
                    if (recurse) {
                        // Try to see if there are sub directories
                        for (let folder of Utils.getDirectories(fullName)) {
                            hasDirectories = true;
                            for (let mf of Utils.getTemplatesInternal(Path.join(fullName, folder), true, Utils.makeTemplateName(templateName, folder))) {
                                yield mf
                            }
                        }
                    }
                    
                    // else stop here
                    if( !hasDirectories)
                        yield { name: Utils.makeTemplateName(templateName, name) };
                }
            }
            catch (e) {
                console.log(e.message);
                // ignore
            }
        }
    }

    private static *getDirectories(templatesFolder: string): IterableIterator<string> {
        let names = fs.readdirSync(templatesFolder);
        for (let name of names) {
            try {
                if (name[0] === "." || name[0] === "$")
                    continue;

                const fullName = Path.join(templatesFolder, name);
                const stat = fs.statSync(fullName);
                if (!stat.isDirectory())
                    continue;          
                yield name;
            }
            catch (e) {
                console.log(e.message);
                // ignore
            }
        }
    }
}