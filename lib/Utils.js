"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shell = require("shelljs");
const fs = require("fs");
const Path = require("path");
class Utils {
    static ensuresApotekFolder() {
        const cwd = shell.pwd().toString();
        let apotek;
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
    static getDirectories(templatesFolder = ".") {
        let list = new Array();
        let names = fs.readdirSync(templatesFolder);
        for (let name of names) {
            try {
                if (name[0] === ".")
                    continue;
                const fullName = Path.join(templatesFolder, name);
                const stat = fs.statSync(fullName);
                if (!stat.isDirectory())
                    continue;
                list.push(name);
            }
            catch (e) {
                console.log(e.message);
                // ignore
            }
        }
        return list;
    }
}
exports.Utils = Utils;
//# sourceMappingURL=Utils.js.map