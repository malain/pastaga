"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minimist = require('minimist');
class Options {
    constructor() {
        this._options = minimist(process.argv.slice(2));
        this._args = this._options["_"] || [];
        delete this._options["_"];
    }
    getOptions(name) {
        return !name ? this._options : this._options[name];
    }
    getCommand() {
        return this._args.length > 0 && this._args[0].toLowerCase();
    }
    GetGlobalArgs(idx) {
        let g = (this._args.length >= idx + 1 && this._args[idx]) || null;
        return g ? Object.assign({}, g) : {};
    }
}
exports.Options = Options;
//# sourceMappingURL=Options.js.map