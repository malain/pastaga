const minimist = require('minimist');
import * as Path from 'path';
import * as shell from 'shelljs';
import { Utils } from './Utils';

export interface IOptions {
    getOptions(name?: string): string[]|any;
    getCommand(): string;
    getGlobalArgs(idx: number): string;
    isTestMode(): boolean;
    currentFolder: string;
    pastagaFolder: string;
}

export class TestOptions implements IOptions {
    private _folders: { cwd: string, pastaga: string };

    constructor(private commandName: string, private state: any) {
        const cwd = shell.pwd().toString();
        this._folders = { cwd, pastaga: cwd };
        state.outputFolder = Path.join(this._folders.cwd, ".generated");
    }

    getOptions(name?: string): string[] {
        return !name ?  this.state : this.state[name];
    }
    getCommand(): string {
        return this.commandName;
    }

    getGlobalArgs(idx: number): string {
        throw new Error("Method not implemented.");
    }

    isTestMode() { return true; }

    public get pastagaFolder() {
        return this._folders.pastaga;
    }

    public get currentFolder() {
        return this._folders.cwd;
    }
}

export class Options implements IOptions {
    private _args: any;
    private _options: any;
    private _folders: { cwd: string, pastaga: string };

    constructor() {
        this._folders = Utils.ensuresPastagaFolder();
        this._options = minimist(process.argv.slice(2));
        this._args = this._options["_"] || [];
        delete this._options["_"];
    }

    public get pastagaFolder() {
        return this._folders.pastaga;
    }

    public set pastagaFolder(val:string) {
        this._folders.pastaga=val;
    }

    public get currentFolder() {
        return this._folders.cwd;
    }

    public getOptions(name?:string) {
        return !name ?  this._options : this._options[name];
    }

    public getCommand(): string {
        return this._args.length > 0 && this._args[0].toLowerCase();
    }

    public getGlobalArgs(idx:number): string {
        let g = (this._args.length >= idx + 1 && this._args[idx]) || null;
        return g;
    }

    isTestMode() { return false;}
}