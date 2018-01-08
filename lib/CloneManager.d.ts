export declare class CloneManager {
    private apotekFolder;
    constructor(apotekFolder: string);
    clone(gitUrl: string, branch?: string): string;
    getCommands(): IterableIterator<any>;
}
