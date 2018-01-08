const minimist = require('minimist');

export class Options {
    private _args: any;
    private _options: any;

    constructor() {
        this._options = minimist(process.argv.slice(2));
        this._args = this._options["_"] || [];
        delete this._options["_"];
    }

    public getOptions(name?:string) {
        return !name ?  this._options : this._options[name];
    }

    public getCommand(): string {
        return this._args.length > 0 && this._args[0].toLowerCase();
    }

    public GetGlobalArgs(idx:number): string {
        let g = (this._args.length >= idx + 1 && this._args[idx]) || null;
        return g ? Object.assign({}, g) : {};
    }
}