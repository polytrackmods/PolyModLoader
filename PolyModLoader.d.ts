import { PolyMod, PolyModLoader, SettingType, PolyDB, MixinArgs } from "./PolyTypes.js";
export declare function isApp(): boolean;
export declare function checkForUpdate(): Promise<boolean>;
declare class PolyModLoaderImpl implements PolyModLoader {
    #private;
    polyDb: PolyDB;
    constructor(polyVersion: string, pmlVersion: string);
    get polyVersion(): string;
    localStorage: Storage | undefined;
    initStorage(localStorage: Storage): void;
    importMods(): Promise<void>;
    loadModsFromLauncher(): Promise<void>;
    getPolyModsStorage(): {
        base: string;
        version: string;
        loaded: boolean;
    }[] | undefined;
    serializeMod(mod: PolyMod): {
        base: string;
        version: string;
        loaded: boolean;
    };
    saveModsToLocalStorage(): void;
    /**
     * Reorder a mod in the internal list to change its priority in mod loading.
     *
     * @param {PolyMod} mod  - The mod to reorder.
     * @param {number} delta - The amount to reorder it by. Positive numbers decrease priority, negative numbers increase priority.
     */
    reorderMod(mod: PolyMod, delta: number): void;
    /**
     * Add a mod to the internal mod list. Added mod is given least priority.
     *
     * @param {{base: string, version: string, loaded: bool}} polyModObject - The mod's JSON representation to add.
     */
    addMod(polyModObject: {
        base: string;
        version: string;
        loaded: boolean;
    }, autoUpdate: boolean): Promise<PolyMod>;
    registerSettingCategory(name: string): void;
    registerBindCategory(name: string): void;
    registerSetting(name: string, id: string, type: SettingType, defaultOption: any, optionsOptional?: Array<{
        title: string;
        value: string;
    }>): void;
    settingClass: any;
    registerKeybind(name: string, id: string, event: string, defaultBind: string, secondBindOptional: string | null, callback: Function): void;
    getSetting(id: string): any;
    /**
     * Remove a mod from the internal list.
     *
     * @param {PolyMod} mod - The mod to remove.
     */
    removeMod(mod: PolyMod): void;
    /**
     * Set the loaded state of a mod.
     *
     * @param {PolyMod} mod   - The mod to set the state of.
     * @param {boolean} state - The state to set. `true` is loaded, `false` is unloaded.
     */
    setModLoaded(mod: PolyMod, state: boolean): void;
    popUpClass: any;
    initMods(): void;
    postInitMods(): void;
    gameLoadCalled: boolean;
    gameLoad(): void;
    preInitMods(): void;
    /**
     * Access a mod by its mod ID.
     *
     * @param   {string} id - The ID of the mod to get
     * @returns {PolyMod}   - The requested mod's object.
     */
    getMod(id: string): PolyMod;
    /**
     * Get the list of all mods.
     *
     * @type {PolyMod[]}
     */
    getAllMods(): PolyMod[];
    get simWorkerMixins(): {
        mixinArg: MixinArgs;
    }[];
    get pmlVersion(): string;
    isVanillaCompatible(): boolean;
    getFromPolyTrack: (path: string) => any;
    getFromPolyTrackGlobal: (path: string) => any;
    /**
     * USED FOR MIXINS, DONT TOUCH
     */
    newFunc: any;
    /**
     * Inject mixin under scope {@link scope} with target function name defined by {@link path}.
     * This only injects functions in `main.bundle.js`.
     *
     * @param {string} scope        - The scope under which mixin is injected.
     * @param {string} path         - The path under the {@link scope} which the mixin targets.
     * @param {MixinType} mixinType - The type of injection.
     * @param {string[]} accessors  - A list of strings to evaluate to access private variables.
     * @param {function} func       - The new function to be injected.
     */
    registerClassMixin(scope: string, path: string, mixinArg: MixinArgs): void;
    /**
     * Inject mixin with target function name defined by {@link path}.
     * This only injects functions in `main.bundle.js`.
     *
     * @param {string} path         - The path of the function which the mixin targets.
     * @param {MixinType} mixinType - The type of injection.
     * @param {string[]} accessors  - A list of strings to evaluate to access private variables.
     * @param {function} func       - The new function to be injected.
     */
    registerFuncMixin(path: string, mixinArg: MixinArgs): void;
    registerClassWideMixin(path: string, mixinArg: MixinArgs): void;
    registerPhysicsLibMixin(mixinArg: MixinArgs): void;
    registerSimWorkerMixin(mixinArg: MixinArgs): void;
    getPhysicsLibURL(): string;
    getPhysicsWasmURL(): string;
    getSimURL(): string;
    registerGlobalMixin(mixinArg: MixinArgs): void;
    registerChunkMixin(bundleName: string, mixinArg: MixinArgs): void;
    applyChunkMixin(url: string): string | undefined;
}
declare const ActivePolyModLoader: PolyModLoaderImpl;
export { ActivePolyModLoader };
