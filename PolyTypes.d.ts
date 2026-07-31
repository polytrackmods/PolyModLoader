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
        optional?: boolean;
    }>;
}
type MixinToken = string | {
    token: string;
    occ: number;
};
type MixinFunc = Function | string;
export type MixinArgs = {
    type: MixinType.INSERT;
    token: MixinToken;
    func: MixinFunc;
} | {
    type: MixinType.REPLACEBETWEEN;
    tokenStart: MixinToken;
    tokenEnd: MixinToken;
    func: MixinFunc;
} | {
    type: MixinType.REMOVEBETWEEN;
    tokenStart: MixinToken;
    tokenEnd: MixinToken;
};
/**
 * Arguments for a physics WASM mixin (a fixed-width constant patch applied to
 * `polytrack_physics.wasm`).
 *
 * `offset` is the byte offset of the constant's **opcode** inside the WASM
 * binary — i.e. the value reported by a disassembler/scan, pointing at the
 * `f32.const` (`0x43`) or `i32.const` (`0x41`) instruction. The operand that
 * follows is overwritten in place.
 *
 * Patches never change the binary's length, so the order in which mixins are
 * registered is irrelevant and offsets never shift relative to each other.
 */
export type PhysicsMixinArgs = {
    type: PhysicsMixinType.PATCH_F32;
    /** Byte offset of the `f32.const` (0x43) opcode to patch. */
    offset: number;
    /** New 32-bit float value. */
    value: number;
} | {
    type: PhysicsMixinType.PATCH_I32;
    /** Byte offset of the `i32.const` (0x41) opcode to patch. */
    offset: number;
    /** New 32-bit signed integer value. Must re-encode to the same LEB128 length. */
    value: number;
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
    rawSemver: any;
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
    loadModsFromLauncher(): Promise<void>;
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
    getMod(id: string): PolyMod | void;
    getAllMods(): PolyMod[];
    isVanillaCompatible(): boolean;
    getFromPolyTrack(path: string): any;
    getFromPolyTrackGlobal(path: string): any;
    /**
     * Inject mixin under scope {@link scope} with target function name defined by {@link path}.
     * This only injects functions in `main.bundle.js`.
     *
     * @param scope    - The scope under which mixin is injected.
     * @param path     - The path under the {@link scope} which the mixin targets.
     * @param mixinArg - The mixin arguments.
     */
    registerClassMixin(scope: string, path: string, mixinArg: MixinArgs): void;
    /**
     * Inject mixin with target function name defined by {@link path}.
     * This only injects functions in `main.bundle.js`.
     *
     * @param path     - The path of the function which the mixin targets.
     * @param mixinArg - The mixin arguments.
     */
    registerFuncMixin(path: string, mixinArg: MixinArgs): void;
    registerClassWideMixin(path: string, mixinArg: MixinArgs): void;
    /**
     * Inject a global mixin to `simulation_worker.bundle.js`.
     */
    registerSimWorkerMixin(mixinArg: MixinArgs): void;
    /**
     * Register a mixin for the lib/polytrack_physics.js file
     */
    registerPhysicsLibMixin(mixinArg: MixinArgs): void;
    /**
     * Register a constant patch for the physics WASM binary (`polytrack_physics.wasm`).
     *
     * Use this to retune simulation constants such as gravity, engine force,
     * brake force, suspension stiffness or mass. Patches are fixed-width
     * overwrites, so they never shift the rest of the binary.
     *
     * Must be called during a mod's `preInit` — the patched binary is built at
     * the start of `initMods`, before `init` runs.
     *
     * @param mixinArg - The patch descriptor (type, offset and value).
     */
    registerPhysicsMixin(mixinArg: PhysicsMixinArgs): void;
    getPhysicsLibURL(): string;
    getPhysicsWasmURL(): string;
    getSimURL(): string;
    /**
     * Inject code anywhere in the main bundle
     *
     * @param mixinArg - The mixin arguments.
     */
    registerGlobalMixin(mixinArg: MixinArgs): void;
    /**
     * Inject code anywhere in a webpack chunk (XXX.bundle.js where XXX is specified by {@link bundleName}).
     *
     * @param bundleName - The bundle name.
     * @param mixinArg   - The mixin arguments.
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
     */
    modAuthor: string;
    /**
     * The mod ID.
     */
    modID: string;
    /**
     * The mod name.
     */
    modName: string;
    /**
     * The mod version.
     */
    modVersion: string;
    /**
     * The the mod's icon file URL.
     */
    get iconSrc(): string | undefined;
    IconSrc: string | undefined;
    set iconSrc(src: string | undefined);
    loaded: boolean;
    set setLoaded(status: boolean);
    /**
     * The mod's loaded state.
     */
    get isLoaded(): boolean;
    modBaseUrl: string | undefined;
    /**
     * The mod's base URL.
     */
    get baseUrl(): string | undefined;
    set baseUrl(url: string | undefined);
    /**
     * Whether the mod has changed the game physics in some way.
     */
    touchingPhysics: boolean | undefined;
    /**
     * Other mods that this mod depends on.
     */
    modDependencies: Array<{
        version: string;
        id: string;
        optional?: boolean;
    }> | undefined;
    /**
     * A string containing the mod's description HTML, or `undefined` to fetch from `{@link PolyMod.baseUrl}/{@link PolyMod.modVersion}/description.html`.
     */
    modDescription: string | undefined;
    latestSaved: boolean | undefined;
    /**
     * Whether the mod is saved as to always fetch latest version (`true`)
     * or to fetch a specific version (`false`, with version defined by {@link PolyMod.modVersion}).
     */
    get savedLatest(): boolean | undefined;
    set savedLatest(latest: boolean | undefined);
    get initialized(): boolean | undefined;
    modInitialized: boolean | undefined;
    set initialized(initState: boolean | undefined);
    polyVersion: Array<string> | undefined;
    assetFolder: string | undefined;
    manifest: ModManifest | undefined;
    /**
     * Function to run during initialization of mods. Note that this is called *before* polytrack itself is loaded,
     * but *after* everything has been declared.
     *
     * @param pmlInstance - The instance of {@link PolyModLoader}.
     */
    init: (pmlInstance: PolyModLoader) => Promise<void>;
    /**
     * Function to run after all mods and polytrack have been initialized and loaded.
     */
    postInit: () => void;
    /**
    * Function to run once game finishses loading.
    */
    onGameLoad: () => void;
    /**
    * Function to run just after import, before anything else.
    *
    * @param pmlInstance - The instance of {@link PolyModLoader}.
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
/**
 * Selects how a {@link PhysicsMixinArgs} patch interprets and overwrites a
 * constant in the physics WASM binary. All patches are fixed-width and never
 * change the binary's length.
 */
export declare enum PhysicsMixinType {
    /**
     * Overwrite a 32-bit float (`f32.const`, opcode `0x43`) constant.
     * The 4-byte IEEE-754 operand following the opcode is replaced in place.
     */
    PATCH_F32 = 0,
    /**
     * Overwrite a 32-bit signed integer (`i32.const`, opcode `0x41`) constant.
     * The operand is signed-LEB128 encoded; the new value must encode to the
     * same number of bytes as the original, otherwise the patch is rejected.
     */
    PATCH_I32 = 1
}
export declare enum SettingType {
    BOOL = "boolean",
    SLIDER = "slider",
    CUSTOM = "custom"
}
export {};
