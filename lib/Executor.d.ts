export declare class Executor {
    private _commandFolder;
    private command;
    private _currentFolder;
    private state;
    private ctx;
    /**
     * Expose chalk package
     */
    readonly chalk: any;
    /**
     * Expose ejs package
     */
    readonly ejs: any;
    /**
     * Expose shell package
     */
    readonly shell: any;
    /**
     * Expose unirest package
     */
    readonly rest: any;
    /**
     * Get the current folder
     */
    readonly currentFolder: string;
    /**
     * Current command template folder
     */
    readonly commandFolder: string;
    /**
     * Current command name
     */
    readonly commandName: any;
    constructor(_commandFolder: string, command: any, _currentFolder: string);
    execute(state?: any): Promise<string>;
    createContextAsync(folder: string, state: any): Promise<any>;
    getDirectories(templatesFolder?: string): string[];
    private getPrompts(ctx);
}
