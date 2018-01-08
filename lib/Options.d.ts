export declare class Options {
    private _args;
    private _options;
    constructor();
    getOptions(name?: string): any;
    getCommand(): string;
    GetGlobalArgs(idx: number): string;
}
