"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shell = require("shelljs");
const fs = require("fs");
const Path = require("path");
const Utils_1 = require("./Utils");
const chalk = require('chalk');
class CloneManager {
    constructor(apotekFolder) {
        this.apotekFolder = apotekFolder;
    }
    clone(gitUrl, branch = "master") {
        if (gitUrl) {
            console.log(chalk.gray("Updating templates from " + gitUrl));
            shell.cd(this.apotekFolder);
            try {
                if (shell.exec(`git clone ${gitUrl} templates`, { silent: true }).code > 0) {
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
    *getCommands() {
        for (let name of Utils_1.Utils.getDirectories(this.apotekFolder)) {
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
exports.CloneManager = CloneManager;
//# sourceMappingURL=CloneManager.js.map