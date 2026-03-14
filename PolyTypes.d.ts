export interface ModManifest {
    name: string;
    author: string;
    version: string;
    id: string;
    main: string;
    targets: Array<string>;
    dependencies: Array<{
        id: string;
        version: string;
    }>;
}
export type MixinArgs = {
    type: MixinType.INSERT;
    token: MixinToken;
    func: Function | string;
} | {
    type: MixinType.REPLACEBETWEEN;
    tokenStart: MixinToken;
    tokenEnd: MixinToken;
    func: Function | string;
} | {
    type: MixinType.REMOVEBETWEEN;
    tokenStart: MixinToken;
    tokenEnd: MixinToken;
};
export interface VersionManifest {
    main: string;
    targets: Array<string>;
    dependencies: Array<{
        id: string;
        version: string;
    }>;
}
export interface GlobalManifest {
    name: string;
    author: string;
    id: string;
    latest: {
        [polyVersion: string]: string;
    };
}
export interface PolyDB {
    cacheMods: boolean;
    dbUpgrading: boolean;
    syncMods(modList: Array<{
        base: string;
        version: string;
        loaded: boolean;
    }>, pmlModList: Array<PolyMod>): Promise<void>;
    getMod(baseUrl: string): Promise<{
        baseUrl: string;
        version: string;
        manifest: ModManifest;
        codeStr: Blob;
    } | null>;
    saveMod(baseUrl: string, version: string, manifest: ModManifest | undefined): Promise<unknown>;
}
export interface PolyModLoader {
    polyDb: PolyDB;
    gameLoadCalled: boolean;
    localStorage: Storage | undefined;
    settingClass: any;
    popUpClass: any;
    get polyVersion(): string;
    get pmlVersion(): string;
    initStorage(localStorage: Storage): void;
    importMods(): Promise<void>;
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
    reorderMod(mod: PolyMod, delta: number): void;
    addMod(polyModObject: {
        base: string;
        version: string;
        loaded: boolean;
    }, autoUpdate: boolean): Promise<void | PolyMod>;
    registerSettingCategory(name: string): void;
    registerBindCategory(name: string): void;
    registerSetting(name: string, id: string, type: SettingType, defaultOption: any, optionsOptional?: {
        title: string;
        value: string;
    }[]): void;
    registerKeybind(name: string, id: string, event: string, defaultBind: string, secondBindOptional: string | null, callback: Function): void;
    getSetting(id: string): string;
    removeMod(mod: PolyMod): void;
    setModLoaded(mod: PolyMod, state: boolean): void;
    initMods(): void;
    postInitMods(): void;
    gameLoad(): void;
    preInitMods(): void;
    simInitMods(): void;
    getMod(id: string): PolyMod | void;
    getAllMods(): PolyMod[];
    get simWorkerClassMixins(): {
        scope: string;
        path: string;
        mixinArg: MixinArgs;
    }[];
    get simWorkerFuncMixins(): {
        path: string;
        mixinArg: MixinArgs;
    }[];
    isVanillaCompatible(): boolean;
    getFromPolyTrack(path: string): any;
    getFromPolyTrackGlobal(path: string): any;
    registerClassMixin(scope: string, path: string, mixinArg: MixinArgs): void;
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
    /**
     * Inject mixin under scope {@link scope} with target function name defined by {@link path}.
     * This only injects functions in `simulation_worker.bundle.js`.
     *
     * @param {string} scope        - The scope under which mixin is injected.
     * @param {string} path         - The path under the {@link scope} which the mixin targets.
     * @param {MixinType} mixinType - The type of injection.
     * @param {string[]} accessors  - A list of strings to evaluate to access private variables.
     * @param {function} func       - The new function to be injected.
     */
    registerSimWorkerClassMixin(scope: string, path: string, mixinArg: MixinArgs): void;
    /**
     * Inject mixin with target function name defined by {@link path}.
     * This only injects functions in `simulation_worker.bundle.js`.
     *
     * @param {string} path         - The path of the function which the mixin targets.
     * @param {MixinType} mixinType - The type of injection.
     * @param {string[]} accessors  - A list of strings to evaluate to access private variables.
     * @param {function} func       - The new function to be injected.
     */
    registerSimWorkerFuncMixin(path: string, mixinArg: MixinArgs): void;
    /**
     * Inject code anywhere in the main bundle
     *
     * @param {MixinType} mixinType                 - The type of mixin: INSERT, REMOVEBETWEEN or REPLACEBETWEEN
     * @param {string} firstToken                   - The beginning token or for insert
     * @param {string | Function} funcOrSecondToken - The second token, or the function for insertion
     * @param {string | Function} funcOptional      - The function for REPLACEBETWEEN and REMOVEBETWEEN
     */
    registerGlobalMixin(mixinArg: MixinArgs): void;
    /**
     * Inject code anywhere in a webpack chunk (XXX.bundle.js)
     *
     * @param {MixinType} mixinType                 - The type of mixin: INSERT, REMOVEBETWEEN or REPLACEBETWEEN
     * @param {string} firstToken                   - The beginning token or for insert
     * @param {string | Function} funcOrSecondToken - The second token, or the function for insertion
     * @param {string | Function} funcOptional      - The function for REPLACEBETWEEN and REMOVEBETWEEN
     */
    registerChunkMixin(bundleName: string, mixinArg: MixinArgs): void;
    applyChunkMixin(url: string): string | undefined;
}
/**
 * Base class for all polytrack mods. Mods should export an instance of their mod class named `polyMod` in their main file.
 */
export declare class PolyMod {
    /**
     * The author of the mod.
     *
     * @type {string}
     */
    modAuthor: string | undefined;
    /**
     * The mod ID.
     *
     * @type {string}
     */
    modID: string | undefined;
    /**
     * The mod name.
     *
     * @type {string}
     */
    modName: string | undefined;
    /**
     * The mod version.
     *
     * @type {string}
     */
    modVersion: string | undefined;
    /**
     * The the mod's icon file URL.
     *
     * @type {string}
     */
    get iconSrc(): string;
    IconSrc: string | undefined;
    set iconSrc(src: string);
    loaded: boolean;
    set setLoaded(status: boolean);
    /**
     * The mod's loaded state.
     *
     * @type {boolean}
     */
    get isLoaded(): boolean;
    /**
     * The mod's base URL.
     *
     * @type {string}
     */
    get baseUrl(): string;
    modBaseUrl: string | undefined;
    set baseUrl(url: string);
    /**
     * Whether the mod has changed the game physics in some way.
     *
     * @type {boolean}
     */
    touchingPhysics: boolean | undefined;
    /**
     * Other mods that this mod depends on.
     */
    modDependencies: Array<{
        version: string;
        id: string;
    }> | undefined;
    /**
     * Link to an optional description.html
     */
    modDescription: string | undefined;
    /**
     * Whether the mod is saved as to always fetch latest version (`true`)
     * or to fetch a specific version (`false`, with version defined by {@link PolyMod.version}).
     *
     * @type {boolean}
     */
    get savedLatest(): boolean;
    latestSaved: boolean | undefined;
    set savedLatest(latest: boolean);
    get initialized(): boolean;
    modInitialized: boolean | undefined;
    set initialized(initState: boolean);
    polyVersion: Array<string> | undefined;
    assetFolder: string | undefined;
    manifest: ModManifest | undefined;
    /**
     * Function to run during initialization of mods. Note that this is called *before* polytrack itself is loaded,
     * but *after* everything has been declared.
     *
     * @param {PolyModLoader} pmlInstance - The instance of {@link PolyModLoader}.
     */
    init: (pmlInstance: PolyModLoader) => void;
    /**
     * Function to run after all mods and polytrack have been initialized and loaded.
     */
    postInit: () => void;
    /**
     * Function to run before initialization of `simulation_worker.bundle.js`.
     */
    simInit: () => void;
    /**
    * Function to run once game finishses loading
    */
    onGameLoad: () => void;
    /**
    * Function to run just after import, before anything else
    */
    preInit: (pmlInstance: PolyModLoader) => void;
    /**
     * Whether the mod
     */
    offlineMode: boolean;
}
/**
 * This class is used in {@link PolyModLoader}'s register mixin functions to set where functions should be injected into the target function.
 */
export declare enum MixinType {
    /**
     * Inject at the start of the target function.
     */
    HEAD = 0,
    /**
     * Inject at the end of the target function.
     */
    TAIL = 1,
    /**
     * Override the target function with the new function.
     */
    OVERRIDE = 2,
    /**
     * Insert code after a given token.
     */
    INSERT = 3,
    /**
     * Replace code between 2 given tokens. Inclusive.
     */
    REPLACEBETWEEN = 5,
    /**
     * Remove code between 2 given tokens. Inclusive.
     */
    REMOVEBETWEEN = 6,
    /**
     * Inserts code after a given token, but class wide.
     */
    CLASSINSERT = 8,
    /**
     * Replace code between 2 given tokens, but class wide. Inclusive.
     */
    CLASSREMOVE = 4,
    /**
     * Remove code between 2 given tokens, but class wide. Inclusive.
     */
    CLASSREPLACE = 7
}
export declare enum SettingType {
    BOOL = "boolean",
    SLIDER = "slider",
    CUSTOM = "custom"
}
export type MixinToken = string | {
    token: string;
    occ: number;
};
