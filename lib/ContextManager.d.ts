import { Options } from './Options';
export declare class ContextManager {
    private options;
    private apotekFolder;
    private _currentContext;
    private _configSettings;
    constructor(options: Options, apotekFolder: string);
    run(): boolean;
    private processOption(name);
    getState(): any;
    readonly currentContext: any;
}
