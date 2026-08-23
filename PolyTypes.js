;
/**
 * Base class for all polytrack mods. Mods should export an instance of their mod class named `polyMod` in their main file.
 */
export class PolyMod {
    constructor() {
        this.loaded = false;
        /**
         * Function to run during initialization of mods. Note that this is called *before* polytrack itself is loaded,
         * but *after* everything has been declared.
         *
         * @param pmlInstance - The instance of {@link PolyModLoader}.
         */
        this.init = async (pmlInstance) => { };
        /**
         * Function to run after all mods and polytrack have been initialized and loaded.
         */
        this.postInit = () => { };
        /**
        * Function to run once game finishses loading.
        */
        this.onGameLoad = () => { };
        /**
        * Function to run just after import, before anything else.
        *
        * @param pmlInstance - The instance of {@link PolyModLoader}.
        */
        this.preInit = (pmlInstance) => { };
        /**
         * Whether the mod
         */
        this.offlineMode = false;
    }
    /**
     * The the mod's icon file URL.
     */
    get iconSrc() {
        return this.IconSrc;
    }
    set iconSrc(src) {
        this.IconSrc = src;
    }
    set setLoaded(status) {
        this.loaded = status;
    }
    /**
     * The mod's loaded state.
     */
    get isLoaded() {
        return this.loaded;
    }
    /**
     * The mod's base URL.
     */
    get baseUrl() {
        return this.modBaseUrl;
    }
    set baseUrl(url) {
        this.modBaseUrl = url;
    }
    /**
     * Whether the mod is saved as to always fetch latest version (`true`)
     * or to fetch a specific version (`false`, with version defined by {@link PolyMod.modVersion}).
     */
    get savedLatest() {
        return this.latestSaved;
    }
    set savedLatest(latest) {
        this.latestSaved = latest;
    }
    get initialized() {
        return this.modInitialized;
    }
    set initialized(initState) {
        this.modInitialized = initState;
    }
}
/**
 * This class is used in {@link PolyModLoader}'s register mixin functions to set where functions should be injected into the target function.
 */
export var MixinType;
(function (MixinType) {
    /**
     * Inject at the start of the target function.
     */
    MixinType[MixinType["HEAD"] = 0] = "HEAD";
    /**
     * Inject at the end of the target function.
     */
    MixinType[MixinType["TAIL"] = 1] = "TAIL";
    /**
     * Override the target function with the new function.
     */
    MixinType[MixinType["OVERRIDE"] = 2] = "OVERRIDE";
    /**
     * Insert code after a given token.
     */
    MixinType[MixinType["INSERT"] = 3] = "INSERT";
    /**
     * Replace code between 2 given tokens. Inclusive.
     */
    MixinType[MixinType["REPLACEBETWEEN"] = 5] = "REPLACEBETWEEN";
    /**
     * Remove code between 2 given tokens. Inclusive.
     */
    MixinType[MixinType["REMOVEBETWEEN"] = 6] = "REMOVEBETWEEN";
    /**
     * Inserts code after a given token, but class wide.
     */
    MixinType[MixinType["CLASSINSERT"] = 8] = "CLASSINSERT";
    /**
     * Replace code between 2 given tokens, but class wide. Inclusive.
     */
    MixinType[MixinType["CLASSREMOVE"] = 4] = "CLASSREMOVE";
    /**
     * Remove code between 2 given tokens, but class wide. Inclusive.
     */
    MixinType[MixinType["CLASSREPLACE"] = 7] = "CLASSREPLACE";
})(MixinType || (MixinType = {}));
/**
 * Selects how a {@link PhysicsMixinArgs} patch interprets and overwrites a
 * constant in the physics WASM binary. All patches are fixed-width and never
 * change the binary's length.
 */
export var PhysicsMixinType;
(function (PhysicsMixinType) {
    /**
     * Overwrite a 32-bit float (`f32.const`, opcode `0x43`) constant.
     * The 4-byte IEEE-754 operand following the opcode is replaced in place.
     */
    PhysicsMixinType[PhysicsMixinType["PATCH_F32"] = 0] = "PATCH_F32";
    /**
     * Overwrite a 32-bit signed integer (`i32.const`, opcode `0x41`) constant.
     * The operand is signed-LEB128 encoded; the new value must encode to the
     * same number of bytes as the original, otherwise the patch is rejected.
     */
    PhysicsMixinType[PhysicsMixinType["PATCH_I32"] = 1] = "PATCH_I32";
})(PhysicsMixinType || (PhysicsMixinType = {}));
export var SettingType;
(function (SettingType) {
    SettingType["BOOL"] = "boolean";
    SettingType["SLIDER"] = "slider";
    SettingType["CUSTOM"] = "custom";
})(SettingType || (SettingType = {}));
