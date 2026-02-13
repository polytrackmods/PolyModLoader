/**
 *
 *      To compile:
 *          tsc PolyModLoader.ts --target ES2020 --module ES2022
 *
 */
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _PolyDB_instances, _PolyDB_db, _PolyDB_getDb, _PolyModLoader_instances, _PolyModLoader_polyVersion, _PolyModLoader_allMods, _PolyModLoader_simWorkerClassMixins, _PolyModLoader_simWorkerFuncMixins, _PolyModLoader_settings, _PolyModLoader_settingConstructor, _PolyModLoader_defaultSettings, _PolyModLoader_latestSetting, _PolyModLoader_keybindings, _PolyModLoader_defaultBinds, _PolyModLoader_bindConstructor, _PolyModLoader_latestBinding, _PolyModLoader_pmlVersion, _PolyModLoader_polyModUrls, _PolyModLoader_applySettings, _PolyModLoader_applyKeybinds, _PolyModLoader_preInitPML, _PolyModLoader_prePreInitPML;
// @ts-ignore
import _semver from "./lib/semver.js";
const semver = {
    valid: (v) => {
        return _semver.valid(v);
    },
    satisfies: (version, range) => {
        return _semver.satisfies(version, range);
    }
};
const pmlversion = await fetch("https://codeberg.org/api/v1/repos/polytrackmods/PolyModLoader/tags").then(r => r.json()).then(tags => tags[0]?.name ?? "untagged");
// @ts-ignore
Object.defineProperty(window, "pmlversion", {
    get() {
        return pmlversion;
    },
    set(value) {
        console.warn("Attempted to overwrite window.pmlversion with", value, "- ignored.");
    },
    configurable: true,
    enumerable: true
});
// Detect Electron runtime
function isElectron() {
    // Renderer process (BrowserWindow)
    if (typeof window !== "undefined") {
        const win = window;
        if (typeof win.process === "object" && win.process?.type === "renderer") {
            return true;
        }
    }
    // Main process or preload
    const g = globalThis;
    if (g?.process?.versions?.electron) {
        return true;
    }
    // User agent check (nodeIntegration disabled or sandboxed renderer)
    if (typeof navigator === "object" && /electron/i.test(navigator.userAgent)) {
        return true;
    }
    return false;
}
// Detect Cordova Android app
function isAndroidApp() {
    const win = window;
    // 1️⃣ Cordova presence
    if (typeof win.cordova !== "undefined") {
        // Cordova Device plugin check (safe optional chain)
        const platform = win.device?.platform?.toLowerCase?.();
        if (platform === "android")
            return true;
        // Fallback: user agent heuristic
        if (/android/i.test(navigator.userAgent))
            return true;
    }
    // 2️⃣ Fallback: Cordova/Capacitor WebView URL pattern
    const url = document.URL || "";
    if (url.startsWith("file:///android_asset/"))
        return true;
    // 3️⃣ Future-proof: Capacitor-based apps (optional)
    if ((win.Capacitor?.getPlatform?.() || "").toLowerCase() === "android")
        return true;
    return false;
}
// General app detection
export function isApp() {
    return isElectron() || isAndroidApp();
}
// Full update checker
export async function checkForUpdate() {
    const pmlversion = window.pmlversion;
    if (!pmlversion) {
        console.error("pmlversion is missing or empty");
        return true;
    }
    const versionRegex = /^v(\d+)\.(\d+)\.(\d+)-(\d+)$/;
    const match = pmlversion.match(versionRegex);
    if (!match) {
        console.error("Invalid pmlversion format:", pmlversion);
        return true;
    }
    const [, w, x, y, build] = match.map(Number);
    const currentGameVersion = [w, x, y];
    const currentBuild = build;
    console.log("Current game version:", currentGameVersion.join("."));
    console.log("Current build:", currentBuild);
    try {
        const response = await fetch("https://codeberg.org/api/v1/repos/polytrackmods/PolyModLoader/tags");
        if (!response.ok)
            throw new Error("Failed to fetch tags");
        const tags = await response.json();
        const parsedTags = tags
            .map((tag) => {
            const m = tag.name.match(/^v(\d+)\.(\d+)\.(\d+)-(\d+)$/);
            if (!m)
                return null;
            const [, W, X, Y, build] = m.map(Number);
            return { raw: tag.name, gameVersion: [W, X, Y], build };
        })
            .filter(Boolean);
        if (parsedTags.length === 0) {
            console.warn("No valid version tags found.");
            return false;
        }
        // @ts-ignore
        parsedTags.sort((a, b) => {
            for (let i = 0; i < 3; i++) {
                if (a.gameVersion[i] !== b.gameVersion[i])
                    return a.gameVersion[i] - b.gameVersion[i];
            }
            return a.build - b.build;
        });
        const newest = parsedTags[parsedTags.length - 1];
        console.log("Newest available version:", newest.raw);
        for (let i = 0; i < 3; i++) {
            if (currentGameVersion[i] < newest.gameVersion[i])
                return true;
            if (currentGameVersion[i] > newest.gameVersion[i])
                return false;
        }
        return currentBuild < newest.build;
    }
    catch (error) {
        console.error("Error checking for updates:", error);
        return false;
    }
}
;
/**
 * Base class for all polytrack mods. Mods should export an instance of their mod class named `polyMod` in their main file.
 */
export class PolyMod {
    constructor() {
        this.loaded = false;
        this.applyManifest = (manifest) => {
            /** @type {string} */
            this.modName = manifest.name;
            /** @type {string} */
            this.modID = manifest.id;
            /** @type {string} */
            this.modAuthor = manifest.author;
            /** @type {string} */
            this.modVersion = semver.valid(manifest.version) ? manifest.version : undefined;
            !this.modVersion && console.warn(`Mod ${manifest.name} has invalid version string: ${manifest.version}`), alert(`Mod ${manifest.name} has invalid version string: ${manifest.version}. This may cause issues with mod loading and compatibility. Please contact the mod author to fix this issue.`);
            /** @type {string} */
            this.polyVersion = manifest.targets;
            this.assetFolder = "assets";
            // no idea how to type annotate this
            // /** @type {{string: string}[]} */
            this.modDependencies = manifest.dependencies;
            for (let dependency of this.modDependencies) {
                if (!semver.valid(dependency.version)) {
                    console.warn(`Mod ${manifest.name} has invalid dependency version string: ${dependency.version} for dependency ${dependency.id}`);
                    alert(`Mod ${manifest.name} has invalid dependency version string: ${dependency.version} for dependency ${dependency.id}. This may cause issues with mod loading and compatibility. Please contact the mod author to fix this issue.`);
                }
            }
        };
        /**
         * Function to run during initialization of mods. Note that this is called *before* polytrack itself is loaded,
         * but *after* everything has been declared.
         *
         * @param {PolyModLoader} pmlInstance - The instance of {@link PolyModLoader}.
         */
        this.init = (pmlInstance) => { };
        /**
         * Function to run after all mods and polytrack have been initialized and loaded.
         */
        this.postInit = () => { };
        /**
         * Function to run before initialization of `simulation_worker.bundle.js`.
         */
        this.simInit = () => { };
        /**
        * Function to run once game finishses loading
        */
        this.onGameLoad = () => { };
        /**
        * Function to run just after import, before anything else
        */
        this.preInit = (pmlInstance) => { };
        /**
         * Whether the mod
         */
        this.offlineMode = false;
    }
    /**
     * The the mod's icon file URL.
     *
     * @type {string}
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
     *
     * @type {boolean}
     */
    get isLoaded() {
        return this.loaded;
    }
    /**
     * The mod's base URL.
     *
     * @type {string}
     */
    get baseUrl() {
        return this.modBaseUrl;
    }
    set baseUrl(url) {
        this.modBaseUrl = url;
    }
    /**
     * Whether the mod is saved as to always fetch latest version (`true`)
     * or to fetch a specific version (`false`, with version defined by {@link PolyMod.version}).
     *
     * @type {boolean}
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
export var SettingType;
(function (SettingType) {
    SettingType["BOOL"] = "boolean";
    SettingType["SLIDER"] = "slider";
    SettingType["CUSTOM"] = "custom";
})(SettingType || (SettingType = {}));
var Variables;
(function (Variables) {
    Variables["SettingsClass"] = "Hu";
    Variables["SettingEnum"] = "P.A";
    Variables["KeybindEnum"] = "me.A";
    Variables["SettingUIFunction"] = "Qs";
})(Variables || (Variables = {}));
class PolyDB {
    constructor(pml) {
        _PolyDB_instances.add(this);
        _PolyDB_db.set(this, void 0);
        this.cacheMods = true;
        this.dbUpgrading = false;
        let settingList = JSON.parse(pml.localStorage?.getItem("polytrack_v5_prod_settings") || "[]");
        for (let setting of settingList) {
            if (setting[0] === "pmlCacheMods") {
                console.log(setting[0], setting[1]);
                this.cacheMods = setting[1] == "true";
            }
            if (setting[0] === "debugmode") {
                if (setting[1] === "true") {
                    console.log("Debug mode is ON");
                    window.localStorage.setItem("debug", "true");
                }
                else if (setting[1] === "false") {
                    console.log("Debug mode is OFF");
                    window.localStorage.setItem("debug", "false");
                }
            }
            if (setting[0] === "clearmods") {
                if (setting[1] === "true") {
                    console.log("Clearing polyMods");
                    window.localStorage.removeItem("polyMods");
                    window.localStorage.removeItem("polytrack_v5_prod_settings");
                    location.reload();
                }
            }
        }
    }
    async syncMods(modList, pmlModList) {
        let localDb = await __classPrivateFieldGet(this, _PolyDB_instances, "m", _PolyDB_getDb).call(this);
        await new Promise((resolve, reject) => {
            try {
                const transaction = localDb.transaction("mods", "readwrite");
                const store = transaction?.objectStore("mods");
                const request = store?.clear();
                if (!request) {
                    return reject(null);
                }
                ;
                request.onsuccess = () => resolve(request?.result || null);
                request.onerror = () => reject(request?.result || null);
            }
            catch (err) {
                reject(err);
            }
        });
        for (let index = 0; index < modList.length; index++) {
            const modSerialized = modList[index];
            const mod = pmlModList[index];
            try {
                this.saveMod(modSerialized.base, mod.modVersion || "", mod.manifest);
            }
            catch {
                console.warn("Couldn't save mod to DB:", modSerialized.base);
            }
        }
    }
    async getMod(baseUrl) {
        let localDb = await __classPrivateFieldGet(this, _PolyDB_instances, "m", _PolyDB_getDb).call(this);
        return await new Promise((resolve, reject) => {
            if (!localDb) {
                console.error("Database not initialized.");
                return false;
            }
            const transaction = localDb.transaction("mods", "readonly");
            const store = transaction?.objectStore("mods");
            const request = store?.get(baseUrl);
            if (!request) {
                return null;
            }
            ;
            request.onsuccess = () => resolve(request?.result || null);
            request.onerror = () => reject(null);
        });
    }
    async saveMod(baseUrl, version, manifest) {
        const localDb = await __classPrivateFieldGet(this, _PolyDB_instances, "m", _PolyDB_getDb).call(this);
        if (!localDb) {
            console.error("Database not initialized.");
            return false;
        }
        const response = await fetch(`${baseUrl}/${version}/${manifest?.main}`);
        const codeStr = await response.text();
        return new Promise((resolve, reject) => {
            const tx = localDb.transaction("mods", "readwrite");
            const store = tx.objectStore("mods");
            const request = store.put({ baseUrl, version, manifest, codeStr });
            request.onsuccess = () => {
                resolve(true);
            };
            request.onerror = () => {
                console.error("Error saving mod:", request.error);
                reject(request.error);
            };
        });
    }
}
_PolyDB_db = new WeakMap(), _PolyDB_instances = new WeakSet(), _PolyDB_getDb = async function _PolyDB_getDb() {
    return new Promise((resolve, reject) => {
        if (__classPrivateFieldGet(this, _PolyDB_db, "f")) {
            return resolve(__classPrivateFieldGet(this, _PolyDB_db, "f"));
        }
        const DBOpenRequest = window.indexedDB.open("PMLMods", 1); // always set a version
        DBOpenRequest.onerror = () => {
            console.error("Error initializing database.");
            reject(new Error("DB init failed"));
        };
        DBOpenRequest.onsuccess = () => {
            console.log("Database initialized.");
            __classPrivateFieldSet(this, _PolyDB_db, DBOpenRequest.result, "f");
            resolve(__classPrivateFieldGet(this, _PolyDB_db, "f"));
        };
        DBOpenRequest.onupgradeneeded = (event) => {
            console.log("Upgrading...");
            // @ts-ignore
            __classPrivateFieldSet(this, _PolyDB_db, event.target.result, "f");
            if (!__classPrivateFieldGet(this, _PolyDB_db, "f")) {
                return reject(new Error("Upgrade DB is null"));
            }
            __classPrivateFieldGet(this, _PolyDB_db, "f").onerror = () => {
                console.error("Error during DB upgrade.");
            };
            if (!__classPrivateFieldGet(this, _PolyDB_db, "f").objectStoreNames.contains("mods")) {
                __classPrivateFieldGet(this, _PolyDB_db, "f").createObjectStore("mods", { keyPath: "baseUrl" });
                console.log("Object store created.");
            }
            // @ts-ignore
            event.target.transaction.oncomplete = () => {
                console.log("Upgrade finished.");
                resolve(__classPrivateFieldGet(this, _PolyDB_db, "f"));
            };
        };
    });
};
export class PolyModLoader {
    constructor(polyVersion, pmlVersion) {
        _PolyModLoader_instances.add(this);
        _PolyModLoader_polyVersion.set(this, void 0);
        _PolyModLoader_allMods.set(this, void 0);
        _PolyModLoader_simWorkerClassMixins.set(this, void 0);
        _PolyModLoader_simWorkerFuncMixins.set(this, void 0);
        _PolyModLoader_settings.set(this, void 0);
        _PolyModLoader_settingConstructor.set(this, void 0);
        _PolyModLoader_defaultSettings.set(this, void 0);
        _PolyModLoader_latestSetting.set(this, void 0);
        _PolyModLoader_keybindings.set(this, void 0);
        _PolyModLoader_defaultBinds.set(this, void 0);
        _PolyModLoader_bindConstructor.set(this, void 0);
        _PolyModLoader_latestBinding.set(this, void 0);
        _PolyModLoader_pmlVersion.set(this, void 0);
        _PolyModLoader_polyModUrls.set(this, void 0);
        this.gameLoadCalled = false;
        this.getFromPolyTrack = (path) => { };
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
        this.registerClassMixin = (scope, path, mixinType, accessors, func, extraOptinonal) => { };
        /**
         * Inject mixin with target function name defined by {@link path}.
         * This only injects functions in `main.bundle.js`.
         *
         * @param {string} path         - The path of the function which the mixin targets.
         * @param {MixinType} mixinType - The type of injection.
         * @param {string[]} accessors  - A list of strings to evaluate to access private variables.
         * @param {function} func       - The new function to be injected.
         */
        this.registerFuncMixin = (path, mixinType, accessors, func, extraOptinonal) => { };
        this.registerClassWideMixin = (path, mixinType, firstToken, funcOrSecondToken, funcOptional) => { };
        __classPrivateFieldSet(this, _PolyModLoader_pmlVersion, pmlVersion, "f");
        /** @type {string} */
        __classPrivateFieldSet(this, _PolyModLoader_polyVersion, polyVersion, "f");
        /** @type {PolyMod[]} */
        __classPrivateFieldSet(this, _PolyModLoader_allMods, [], "f");
        console.log("[PML] PolyModLoader initialized, version:", pmlVersion);
        // 🔹 Run environment detection + update check
        setTimeout(() => {
            console.log("[PML] Running environment detection...");
            const electron = isElectron();
            const android = isAndroidApp();
            const app = isApp();
            if (electron)
                console.log("Running Electron app!");
            if (android)
                console.log("Running Android app!");
            if (!app)
                console.log("Running in web browser.");
            if (app) {
                console.log("[PML] App environment detected — checking for updates...");
                checkForUpdate()
                    .then((needsUpdate) => {
                    console.log("[PML] Update check complete:", needsUpdate);
                    if (needsUpdate) {
                        alert("You are playing on an outdated version of PolyModLoader.\n" +
                            "Please update your game by downloading the latest version from:\n" +
                            "https://codeberg.org/polytrackmods/PolyModLoader/releases");
                    }
                })
                    .catch((err) => {
                    console.error("[PML] Update check failed:", err);
                });
            }
        }, 0);
        /**
         * @type {{
         *      scope: string,
         *      path: string,
         *      mixinType: MixinType,
         *      accessors: string[],
         *      funcString: string,
         *  }}
         */
        __classPrivateFieldSet(this, _PolyModLoader_simWorkerClassMixins, [], "f");
        /**
         * @type {{
        *      path: string,
        *      mixinType: MixinType,
        *      accessors: string[],
        *      funcString: string,
        *  }}
        */
        __classPrivateFieldSet(this, _PolyModLoader_simWorkerFuncMixins, [], "f");
        __classPrivateFieldSet(this, _PolyModLoader_settings, [], "f");
        __classPrivateFieldSet(this, _PolyModLoader_settingConstructor, [], "f");
        __classPrivateFieldSet(this, _PolyModLoader_defaultSettings, [], "f");
        __classPrivateFieldSet(this, _PolyModLoader_latestSetting, 23, "f");
        __classPrivateFieldSet(this, _PolyModLoader_keybindings, [], "f");
        __classPrivateFieldSet(this, _PolyModLoader_defaultBinds, [], "f");
        __classPrivateFieldSet(this, _PolyModLoader_bindConstructor, [], "f");
        __classPrivateFieldSet(this, _PolyModLoader_latestBinding, 32, "f");
    }
    get polyVersion() {
        return __classPrivateFieldGet(this, _PolyModLoader_polyVersion, "f"); // Why is this even private lmfao
    }
    initStorage(localStorage) {
        this.localStorage = localStorage;
        this.polyDb = new PolyDB(this);
        __classPrivateFieldSet(this, _PolyModLoader_polyModUrls, this.getPolyModsStorage(), "f");
    }
    async importMods() {
        // Mod loading UI
        const ui = document.getElementById("ui");
        const loadingDiv = document.createElement("div");
        loadingDiv.style.display = "flex";
        loadingDiv.style.flexDirection = "column";
        loadingDiv.style.position = "absolute";
        loadingDiv.style.left = "0";
        loadingDiv.style.top = "0";
        loadingDiv.style.width = "100%";
        loadingDiv.style.height = "100%";
        loadingDiv.style.textAlign = "center";
        loadingDiv.style.backgroundColor = "#192042";
        loadingDiv.style.transition = "background-color 1s ease-out";
        loadingDiv.style.overflow = "hidden";
        loadingDiv.innerHTML = `<img src="https://cdn.polymodloader.com/cb/PolyTrackMods/PolyModLoader/0.5.0/images/pmllogo.svg" style="width: calc(100vw * (1000 / 1300)); height: 200px; margin: 30px auto 0 auto" />`;
        const loadingUI = document.createElement("div");
        loadingUI.style.margin = "20px 0 0 0";
        loadingUI.style.padding = "0";
        const loadingText = document.createElement("p");
        loadingText.innerText = "[PML] Loading Mods...";
        loadingText.style.margin = "5px";
        loadingText.style.padding = "0";
        loadingText.style.color = "#ffffff";
        loadingText.style.fontSize = "32px";
        loadingText.style.fontStyle = "italic";
        loadingText.style.fontFamily = "ForcedSquare, Arial, sans-serif";
        loadingText.style.lineHeight = "1";
        const loadingBarOuter = document.createElement("div");
        loadingBarOuter.style.margin = "0 auto";
        loadingBarOuter.style.padding = "0";
        loadingBarOuter.style.width = "600px";
        loadingBarOuter.style.height = "50px";
        loadingBarOuter.style.backgroundColor = "#28346a";
        loadingBarOuter.style.clipPath = "polygon(9px 0, 100% 0, calc(100% - 9px) 100%, 0 100%)";
        loadingBarOuter.style.overflow = "hidden";
        const loadingBarInner = document.createElement("div");
        loadingBarInner.style.margin = "15px 20px";
        loadingBarInner.style.padding = "0";
        loadingBarInner.style.width = "560px";
        loadingBarInner.style.height = "20px";
        loadingBarInner.style.clipPath = "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)";
        loadingBarInner.style.backgroundColor = "#222244";
        loadingBarInner.style.boxShadow = "inset 0 0 6px #000000";
        const loadingBarFill = document.createElement("div");
        loadingBarFill.style.margin = "0";
        loadingBarFill.style.padding = "0";
        loadingBarFill.style.width = "0";
        loadingBarFill.style.height = "100%";
        loadingBarFill.style.clipPath = "polygon(2px 0, 100% 0, calc(100% - 2px) 100%, 0 100%)";
        loadingBarFill.style.backgroundColor = "#ffffff";
        loadingBarFill.style.boxShadow = "inset 0 0 6px #000000";
        loadingBarFill.style.transition = "width 0.1s ease-in-out";
        const progressDiv = document.createElement("div");
        progressDiv.style.textAlign = "left";
        progressDiv.style.width = "1000px";
        progressDiv.style.margin = "50px auto";
        loadingBarOuter.appendChild(loadingBarInner);
        loadingBarInner.appendChild(loadingBarFill);
        loadingUI.appendChild(loadingText);
        loadingUI.appendChild(loadingBarOuter);
        loadingUI.appendChild(progressDiv);
        loadingDiv.appendChild(loadingUI);
        ui.appendChild(loadingDiv);
        const total = __classPrivateFieldGet(this, _PolyModLoader_polyModUrls, "f") ? __classPrivateFieldGet(this, _PolyModLoader_polyModUrls, "f").length : 0;
        const current = {
            num: 0,
            text: undefined,
            url: "",
            version: "",
            totalParts: 0,
            part: 0,
        };
        function updateBar(num) {
            current.num = num;
            loadingBarFill.style.width = `${(current.num / total) * 100}%`;
        }
        function nextPart() {
            updateBar(current.num + current.part / current.totalParts);
            current.part += 1;
        }
        function currPartStr() {
            return `[${current.part}/${current.totalParts}]`;
        }
        function startImportMod(url, version) {
            current.url = url;
            current.version = version;
            progressDiv.innerHTML = "";
            const modP = document.createElement("p");
            modP.innerText = "[PML] Loading Mods...";
            modP.style.color = "#ffffff";
            modP.style.fontSize = "18px";
            modP.style.fontStyle = "italic";
            modP.style.fontFamily = "ForcedSquare, Arial, sans-serif";
            modP.style.lineHeight = "1";
            modP.innerText = `Importing mod from URL: ${current.url} @ version ${current.version}`;
            progressDiv.appendChild(modP);
            // @ts-ignore
            current.text = modP;
        }
        function startFetchLatest() {
            nextPart();
            const latestP = document.createElement("p");
            latestP.style.color = "#ffffff";
            latestP.style.fontSize = "18px";
            latestP.style.fontStyle = "italic";
            latestP.style.fontFamily = "ForcedSquare, Arial, sans-serif";
            latestP.style.lineHeight = "1";
            latestP.innerText = `${currPartStr()} Fetching global manifest from ${current.url}/manifest.json`;
            progressDiv.appendChild(latestP);
            // @ts-ignore
            current.text = latestP;
        }
        function finishFetchLatest(version) {
            current.version = version;
            // @ts-ignore
            current.text.innerText = `${currPartStr()} Fetched global manifest for mod: ${current.url} @ version ${current.version}`;
        }
        function startFetchManifest() {
            nextPart();
            const manifestP = document.createElement("p");
            manifestP.style.color = "#ffffff";
            manifestP.style.fontSize = "18px";
            manifestP.style.fontStyle = "italic";
            manifestP.style.fontFamily = "ForcedSquare, Arial, sans-serif";
            manifestP.style.lineHeight = "1";
            manifestP.innerText = `${currPartStr()} Fetching mod version manifest from ${current.url}/${current.version}/version.json`;
            progressDiv.appendChild(manifestP);
            // @ts-ignore
            current.text = manifestP;
        }
        function startFetchModMain(js) {
            nextPart();
            const mainP = document.createElement("p");
            mainP.style.color = "#ffffff";
            mainP.style.fontSize = "18px";
            mainP.style.fontStyle = "italic";
            mainP.style.fontFamily = "ForcedSquare, Arial, sans-serif";
            mainP.style.lineHeight = "1";
            mainP.innerText = `${currPartStr()} Fetching mod js from ${current.url}/${current.version}/${js}`;
            progressDiv.appendChild(mainP);
            // @ts-ignore
            current.text = mainP;
        }
        function errorCurrent() {
            // @ts-ignore
            current.text.style.color = "red";
        }
        function finishImportMod() {
            current.totalParts = 0;
            current.part = 0;
            updateBar(Math.floor(current.num) + 1);
        }
        // Actual mod importing
        for (let polyModObject of __classPrivateFieldGet(this, _PolyModLoader_polyModUrls, "f") ? __classPrivateFieldGet(this, _PolyModLoader_polyModUrls, "f") : []) {
            startImportMod(polyModObject.base, polyModObject.version);
            const dbMod = await this.polyDb.getMod(polyModObject.base);
            let latest = false;
            let importFromDB = false;
            current.totalParts = 2;
            let mainManifestFile;
            try {
                startFetchLatest();
                mainManifestFile = await fetch(`${polyModObject.base}/manifest.json`).then(r => r.json());
                if (polyModObject.version === "latest") {
                    current.totalParts = 3;
                    polyModObject.version = mainManifestFile["latest"][__classPrivateFieldGet(this, _PolyModLoader_polyVersion, "f")];
                    latest = true;
                }
            }
            catch (err) {
                errorCurrent();
                importFromDB = this.polyDb.cacheMods && true;
                alert(`Couldn't find global manifest for ${polyModObject.base}`);
                console.error("Error in fetching global manifest json:", err);
                if (!dbMod)
                    return alert(`Mod with URL ${polyModObject.base} failed to load and isn't in the cache.`);
                mainManifestFile = { ...dbMod.manifest, latest: { [__classPrivateFieldGet(this, _PolyModLoader_polyVersion, "f")]: dbMod.version } };
            }
            finishFetchLatest(polyModObject.version);
            if (this.polyDb.cacheMods && dbMod && polyModObject.version === dbMod.version) {
                console.log("Mod version in DB, skipping import");
                importFromDB = true;
            }
            const polyModUrl = `${polyModObject.base}/${polyModObject.version}`;
            startFetchManifest();
            try {
                let manifestFile;
                if (importFromDB && dbMod) {
                    manifestFile = dbMod.manifest;
                }
                else {
                    let versionFile = await fetch(`${polyModUrl}/version.json`).then(r => r.json());
                    manifestFile = {
                        name: mainManifestFile.name,
                        author: mainManifestFile.author,
                        id: mainManifestFile.id,
                        version: polyModObject.version,
                        ...versionFile
                    };
                }
                startFetchModMain(manifestFile.main);
                try {
                    const modImport = await import(importFromDB && dbMod ? URL.createObjectURL(new Blob([dbMod.codeStr], { type: "application/javascript" })) : `${polyModUrl}/${manifestFile.main}`);
                    let newMod = modImport.polyMod;
                    if (this.getMod(manifestFile.id))
                        alert(`Duplicate mod detected: ${manifestFile.name}`);
                    newMod.manifest = manifestFile;
                    newMod.offlineMode = importFromDB;
                    newMod.applyManifest(manifestFile);
                    newMod.baseUrl = polyModObject.base;
                    newMod.applyManifest = (nothing) => { console.warn("Can't apply manifest after initialization!"); };
                    newMod.savedLatest = latest;
                    newMod.iconSrc = `${polyModUrl}/icon.png`;
                    if (polyModObject.loaded) {
                        newMod.setLoaded = true;
                    }
                    __classPrivateFieldGet(this, _PolyModLoader_allMods, "f").push(newMod);
                }
                catch (err) {
                    errorCurrent();
                    alert(`Mod ${manifestFile.name} failed to load.`);
                    console.error("Error in loading mod:", err);
                }
            }
            catch (err) {
                errorCurrent();
                alert(`Couldn't load mod with URL ${polyModUrl}.`);
                console.error("Error in loading mod URL:", err);
            }
            finishImportMod();
        }
        loadingDiv.remove();
        this.saveModsToLocalStorage(); // Really just to initiate DB sync
    }
    getPolyModsStorage() {
        const polyModsStorage = this.localStorage?.getItem("polyMods");
        if (polyModsStorage) {
            __classPrivateFieldSet(this, _PolyModLoader_polyModUrls, JSON.parse(polyModsStorage), "f");
        }
        else {
            __classPrivateFieldSet(this, _PolyModLoader_polyModUrls, [
                {
                    "base": "https://cdn.polymodloader.com/cb/PolyTrackMods/PolyModLoader/pmlcore",
                    "version": "latest",
                    "loaded": true
                }
            ], "f");
            this.localStorage?.setItem("polyMods", JSON.stringify(__classPrivateFieldGet(this, _PolyModLoader_polyModUrls, "f")));
        }
        return __classPrivateFieldGet(this, _PolyModLoader_polyModUrls, "f");
    }
    serializeMod(mod) {
        return { "base": mod.baseUrl ? mod.baseUrl : "", "version": mod.savedLatest ? "latest" : mod.modVersion ? mod.modVersion : "latest", "loaded": mod.isLoaded || false };
    }
    saveModsToLocalStorage() {
        let savedMods = [];
        for (let mod of __classPrivateFieldGet(this, _PolyModLoader_allMods, "f")) {
            const modSerialized = this.serializeMod(mod);
            savedMods.push(modSerialized);
        }
        this.polyDb.syncMods(savedMods, __classPrivateFieldGet(this, _PolyModLoader_allMods, "f"));
        __classPrivateFieldSet(this, _PolyModLoader_polyModUrls, savedMods, "f");
        this.localStorage?.setItem("polyMods", JSON.stringify(__classPrivateFieldGet(this, _PolyModLoader_polyModUrls, "f")));
    }
    /**
     * Reorder a mod in the internal list to change its priority in mod loading.
     *
     * @param {PolyMod} mod  - The mod to reorder.
     * @param {number} delta - The amount to reorder it by. Positive numbers decrease priority, negative numbers increase priority.
     */
    reorderMod(mod, delta) {
        if (!mod)
            return;
        if (mod.modID === "pmlcore") {
            return;
        }
        const currentIndex = __classPrivateFieldGet(this, _PolyModLoader_allMods, "f").indexOf(mod);
        if ((currentIndex === 0) && delta > 0)
            return;
        if (!currentIndex || currentIndex === -1) {
            alert("This mod isn't loaded");
            return;
        }
        const temp = __classPrivateFieldGet(this, _PolyModLoader_allMods, "f")[currentIndex + delta];
        __classPrivateFieldGet(this, _PolyModLoader_allMods, "f")[currentIndex + delta] = __classPrivateFieldGet(this, _PolyModLoader_allMods, "f")[currentIndex];
        __classPrivateFieldGet(this, _PolyModLoader_allMods, "f")[currentIndex] = temp;
        this.saveModsToLocalStorage();
    }
    /**
     * Add a mod to the internal mod list. Added mod is given least priority.
     *
     * @param {{base: string, version: string, loaded: bool}} polyModObject - The mod's JSON representation to add.
     */
    async addMod(polyModObject, autoUpdate) {
        try {
            const manifestFile = await fetch(`${polyModObject.base}/manifest.json`).then(r => r.json());
            let latest = false;
            if (polyModObject.version === "latest") {
                polyModObject.version = manifestFile["latest"][__classPrivateFieldGet(this, _PolyModLoader_polyVersion, "f")];
                if (autoUpdate) {
                    latest = true;
                }
                if (polyModObject.version === "latest" || !polyModObject.version)
                    alert(`Mod with URL ${polyModObject.base} does not have a version which supports PolyTrack v${__classPrivateFieldGet(this, _PolyModLoader_polyVersion, "f")}.`);
            }
            const polyModUrl = `${polyModObject.base}/${polyModObject.version}`;
            const versionFile = await fetch(`${polyModUrl}/version.json`).then(r => r.json());
            const mod = { ...manifestFile, ...versionFile, version: polyModObject.version };
            if (this.getMod(mod.id)) {
                alert("This mod is already present!");
                return;
            }
            if (mod.targets.indexOf(__classPrivateFieldGet(this, _PolyModLoader_polyVersion, "f")) === -1) {
                alert(`Mod target version does not match polytrack version!
                    Note: ${mod.name} version ${polyModObject.version} targets polytrack versions ${mod.targets.join(', ')}, but current polytrack version is ${__classPrivateFieldGet(this, _PolyModLoader_polyVersion, "f")}.`);
                return;
            }
            try {
                const modImport = await import(`${polyModUrl}/${mod.main}`);
                let newMod = modImport.polyMod;
                newMod.iconSrc = `${polyModUrl}/icon.png`;
                mod.version = polyModObject.version;
                newMod.applyManifest(mod);
                newMod.manifest = manifestFile;
                newMod.baseUrl = polyModObject.base;
                newMod.applyManifest = (nothing) => { console.warn("Can't apply manifest after initialization!"); };
                newMod.savedLatest = latest;
                __classPrivateFieldGet(this, _PolyModLoader_allMods, "f").push(newMod);
                this.saveModsToLocalStorage();
                return this.getMod(newMod.id);
            }
            catch (err) {
                alert("Something went wrong importing this mod!");
                console.error("Error in importing mod:", err);
                return;
            }
        }
        catch (err) {
            alert(`Couldn't find mod manifest or version json for "${polyModObject.base}".`);
            console.error("Error in getting mod manifest:", err);
        }
    }
    registerSettingCategory(name) {
        __classPrivateFieldGet(this, _PolyModLoader_settings, "f").push(`(0, R.gn)(this, _s, "m", Js).call(this, Ms.getFromLanguage((0, R.gn)(this, Os, "f"), "${name}")),`);
    }
    registerBindCategory(name) {
        __classPrivateFieldGet(this, _PolyModLoader_keybindings, "f").push(`(0, R.gn)(this, _s, "m", Xs).call(this, Ms.getFromLanguage((0, R.gn)(this, Os, "f"), "${name}")),`);
    }
    registerSetting(name, id, type, defaultOption, optionsOptional) {
        var _a;
        __classPrivateFieldSet(this, _PolyModLoader_latestSetting, (_a = __classPrivateFieldGet(this, _PolyModLoader_latestSetting, "f"), _a++, _a), "f");
        __classPrivateFieldGet(this, _PolyModLoader_settingConstructor, "f").push(`${Variables.SettingEnum}[${Variables.SettingEnum}.${id} = ${__classPrivateFieldGet(this, _PolyModLoader_latestSetting, "f")}] = "${id}";`);
        if (type === "boolean") {
            console.log(`[${Variables.SettingEnum}.${id}, '${defaultOption === true ? "true" : "false"}'],`);
            __classPrivateFieldGet(this, _PolyModLoader_defaultSettings, "f").push(`[${Variables.SettingEnum}.${id}, "${defaultOption === true ? "true" : "false"}"],`);
            __classPrivateFieldGet(this, _PolyModLoader_settings, "f").push(`(0, R.gn)(this, _s, "m", Ys).call(this, Ms.getFromLanguage((0, R.gn)(this, Os, "f"), "${name}"), [{
                title: Ms.getFromLanguage((0, R.gn)(this, Os, "f"), "Off"),
                value: "false"
            }, {
                title: Ms.getFromLanguage((0, R.gn)(this, Os, "f"), "On"),
                value: "true"
            }], ${Variables.SettingEnum}.${id}),`);
        }
        else if (type === "slider") {
            __classPrivateFieldGet(this, _PolyModLoader_defaultSettings, "f").push(`[${Variables.SettingEnum}.${id}, "${defaultOption}"],`);
            __classPrivateFieldGet(this, _PolyModLoader_settings, "f").push(`(0, R.gn)(this, _s, "m", Zs).call(this, Ms.getFromLanguage((0, R.gn)(this, Os, "f"), "${name}"), ${Variables.SettingEnum}.${id}),`);
        }
        else if (type === "custom") {
            __classPrivateFieldGet(this, _PolyModLoader_defaultSettings, "f").push(`[${Variables.SettingEnum}.${id}, "${defaultOption}"],`);
            __classPrivateFieldGet(this, _PolyModLoader_settings, "f").push(`
                (0, R.gn)(this, _s, "m", Ys).call(this, Ms.getFromLanguage((0, R.gn)(this, Os, "f"), "Render scale"),
                ${JSON.stringify(optionsOptional)},
                ${Variables.SettingEnum}.${id}
                ),`);
        }
    }
    registerKeybind(name, id, event, defaultBind, secondBindOptional, callback) {
        var _a;
        __classPrivateFieldGet(this, _PolyModLoader_keybindings, "f").push(`(0, R.gn)(this, _s, "m", $s).call(this, Ms.getFromLanguage((0, R.gn)(this, Os, "f"), "${name}"), ${Variables.KeybindEnum}.${id}),`);
        __classPrivateFieldGet(this, _PolyModLoader_bindConstructor, "f").push(`${Variables.KeybindEnum}[${Variables.KeybindEnum}.${id} = ${__classPrivateFieldGet(this, _PolyModLoader_latestBinding, "f")}] = "${id}";`);
        __classPrivateFieldGet(this, _PolyModLoader_defaultBinds, "f").push(`[${Variables.KeybindEnum}.${id}, ["${defaultBind}", ${secondBindOptional ? `"${secondBindOptional}"` : "null"}]],`);
        __classPrivateFieldSet(this, _PolyModLoader_latestBinding, (_a = __classPrivateFieldGet(this, _PolyModLoader_latestBinding, "f"), _a++, _a), "f");
        window.addEventListener(event, (e) => {
            if (this.settingClass.checkKeyBinding(e, this.getFromPolyTrack(`${Variables.KeybindEnum}.${id}`))) {
                callback(e);
            }
        });
    }
    getSetting(id) {
        return this.getFromPolyTrack(`ActivePolyModLoader.settingClass.getSetting(${Variables.SettingEnum}.${id})`);
    }
    /**
     * Remove a mod from the internal list.
     *
     * @param {PolyMod} mod - The mod to remove.
     */
    removeMod(mod) {
        if (!mod)
            return;
        if (mod.modID === "pmlcore") {
            return;
        }
        const index = __classPrivateFieldGet(this, _PolyModLoader_allMods, "f").indexOf(mod);
        if (index > -1) {
            __classPrivateFieldGet(this, _PolyModLoader_allMods, "f").splice(index, 1);
        }
        this.saveModsToLocalStorage();
    }
    /**
     * Set the loaded state of a mod.
     *
     * @param {PolyMod} mod   - The mod to set the state of.
     * @param {boolean} state - The state to set. `true` is loaded, `false` is unloaded.
     */
    setModLoaded(mod, state) {
        if (!mod)
            return;
        if (mod.modID === "pmlcore") {
            return;
        }
        mod.loaded = state;
        this.saveModsToLocalStorage();
    }
    initMods() {
        __classPrivateFieldGet(this, _PolyModLoader_instances, "m", _PolyModLoader_preInitPML).call(this);
        let initList = [];
        for (let polyMod of __classPrivateFieldGet(this, _PolyModLoader_allMods, "f")) {
            if (polyMod.modID && polyMod.isLoaded)
                initList.push(polyMod.modID);
        }
        let allModsInit = false;
        if (initList.length === 0)
            allModsInit = true; // no mods to initialize lol
        while (!allModsInit) {
            let currentMod = this.getMod(initList[0]);
            if (!currentMod)
                continue;
            console.log(initList[0]);
            let initCheck = true;
            for (let dependency of currentMod.modDependencies || []) {
                let curDependency = this.getMod(dependency.id);
                if (!curDependency) {
                    initCheck = false;
                    initList.splice(0, 1);
                    alert(`Mod ${currentMod.modName} is missing mod ${dependency.id} ${dependency.version} and will not be initialized.`);
                    console.warn(`Mod ${currentMod.modName} is missing mod ${dependency.id} ${dependency.version} and will not be initialized.`);
                    this.setModLoaded(currentMod, false);
                    break;
                }
                if (!curDependency.isLoaded) {
                    initCheck = false;
                    initList.splice(0, 1);
                    alert(`Mod ${currentMod.modName} depends on mod ${dependency.id} ${dependency.version} but the dependency isn't loaded. Mod will not be initialized.`);
                    console.warn(`Mod ${currentMod.modName} depends on mod ${dependency.id} ${dependency.version} but the dependency isn't loaded. Mod will not be initialized.`);
                    this.setModLoaded(currentMod, false);
                    break;
                }
                if (!semver.satisfies(curDependency.modVersion || "0.0.0", dependency.version)) {
                    initCheck = false;
                    initList.splice(0, 1);
                    alert(`Mod ${currentMod.modName} needs version ${dependency.version} of ${curDependency.modName} but ${curDependency.modVersion} is present.`);
                    console.warn(`Mod ${currentMod.modName} needs version ${dependency.version} of ${curDependency.modName} but ${curDependency.modVersion} is present.`);
                    this.setModLoaded(currentMod, false);
                    break;
                }
                if (!curDependency.initialized) {
                    initCheck = false;
                    initList.splice(0, 1);
                    initList.push(currentMod.modID || "");
                    break;
                }
            }
            if (initCheck) {
                try {
                    currentMod.init(this);
                    currentMod.initialized = true;
                    initList.splice(0, 1);
                }
                catch (err) {
                    alert(`Mod ${currentMod.modName} failed to initialize and will be unloaded.`);
                    console.error("Error in initializing mod:", err);
                    this.setModLoaded(currentMod, false);
                    initList.splice(0, 1);
                }
            }
            if (initList.length === 0)
                allModsInit = true;
        }
        __classPrivateFieldGet(this, _PolyModLoader_instances, "m", _PolyModLoader_applySettings).call(this);
        __classPrivateFieldGet(this, _PolyModLoader_instances, "m", _PolyModLoader_applyKeybinds).call(this);
    }
    postInitMods() {
        for (let polyMod of __classPrivateFieldGet(this, _PolyModLoader_allMods, "f")) {
            if (polyMod.isLoaded) {
                try {
                    polyMod.postInit();
                }
                catch (err) {
                    alert(`Mod ${polyMod.modName} failed to post initialize and will be unloaded.`);
                    console.error("Error in post initializing mod:", err);
                    this.setModLoaded(polyMod, false);
                }
            }
        }
    }
    gameLoad() {
        if (!this.gameLoadCalled) {
            this.gameLoadCalled = true;
        }
        else {
            return;
        }
        for (let polyMod of __classPrivateFieldGet(this, _PolyModLoader_allMods, "f")) {
            if (polyMod.isLoaded) {
                try {
                    polyMod.onGameLoad();
                }
                catch (err) {
                    alert(`Mod ${polyMod.modName} failed on game load and will be unloaded.`);
                    console.error("Error on game load for mod:", err);
                    this.setModLoaded(polyMod, false);
                }
            }
        }
    }
    preInitMods() {
        __classPrivateFieldGet(this, _PolyModLoader_instances, "m", _PolyModLoader_prePreInitPML).call(this);
        for (let polyMod of __classPrivateFieldGet(this, _PolyModLoader_allMods, "f")) {
            if (polyMod.isLoaded) {
                try {
                    polyMod.preInit(this);
                }
                catch (err) {
                    alert(`Mod ${polyMod.modName} failed on pre init and will be unloaded.`);
                    console.error("Error on pre init for mod:", err);
                    this.setModLoaded(polyMod, false);
                }
            }
        }
    }
    simInitMods() {
        for (let polyMod of __classPrivateFieldGet(this, _PolyModLoader_allMods, "f")) {
            if (polyMod.isLoaded)
                polyMod.simInit();
        }
    }
    /**
     * Access a mod by its mod ID.
     *
     * @param   {string} id - The ID of the mod to get
     * @returns {PolyMod}   - The requested mod's object.
     */
    getMod(id) {
        for (let polyMod of __classPrivateFieldGet(this, _PolyModLoader_allMods, "f")) {
            if (polyMod.modID == id)
                return polyMod;
        }
    }
    /**
     * Get the list of all mods.
     *
     * @type {PolyMod[]}
     */
    getAllMods() {
        return __classPrivateFieldGet(this, _PolyModLoader_allMods, "f");
    }
    get simWorkerClassMixins() {
        return [...__classPrivateFieldGet(this, _PolyModLoader_simWorkerClassMixins, "f")];
    }
    get simWorkerFuncMixins() {
        return [...__classPrivateFieldGet(this, _PolyModLoader_simWorkerFuncMixins, "f")];
    }
    get pmlVersion() {
        return __classPrivateFieldGet(this, _PolyModLoader_pmlVersion, "f");
    }
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
    registerSimWorkerClassMixin(scope, path, mixinType, accessors, func, extraOptinonal) {
        __classPrivateFieldGet(this, _PolyModLoader_simWorkerClassMixins, "f").push({
            scope: scope,
            path: path,
            mixinType: mixinType,
            accessors: accessors,
            funcString: typeof func === "function" ? func.toString() : func,
            func2Sstring: extraOptinonal ? extraOptinonal.toString() : null
        });
    }
    /**
     * Inject mixin with target function name defined by {@link path}.
     * This only injects functions in `simulation_worker.bundle.js`.
     *
     * @param {string} path         - The path of the function which the mixin targets.
     * @param {MixinType} mixinType - The type of injection.
     * @param {string[]} accessors  - A list of strings to evaluate to access private variables.
     * @param {function} func       - The new function to be injected.
     */
    registerSimWorkerFuncMixin(path, mixinType, accessors, func, extraOptinonal) {
        __classPrivateFieldGet(this, _PolyModLoader_simWorkerFuncMixins, "f").push({
            path: path,
            mixinType: mixinType,
            accessors: accessors,
            funcString: typeof func === "function" ? func.toString() : func,
            func2Sstring: extraOptinonal ? extraOptinonal.toString() : null
        });
    }
    /**
     * Inject code anywhere in the main bundle
     *
     * @param {MixinType} mixinType                 - The type of mixin: INSERT, REMOVEBETWEEN or REPLACEBETWEEN
     * @param {string} firstToken                   - The beginning token or for insert
     * @param {string | Function} funcOrSecondToken - The second token, or the function for insertion
     * @param {string | Function} funcOptional      - The function for REPLACEBETWEEN and REMOVEBETWEEN
     */
    registerGlobalMixin(mixinType, firstToken, funcOrSecondToken, funcOptional) { }
}
_PolyModLoader_polyVersion = new WeakMap(), _PolyModLoader_allMods = new WeakMap(), _PolyModLoader_simWorkerClassMixins = new WeakMap(), _PolyModLoader_simWorkerFuncMixins = new WeakMap(), _PolyModLoader_settings = new WeakMap(), _PolyModLoader_settingConstructor = new WeakMap(), _PolyModLoader_defaultSettings = new WeakMap(), _PolyModLoader_latestSetting = new WeakMap(), _PolyModLoader_keybindings = new WeakMap(), _PolyModLoader_defaultBinds = new WeakMap(), _PolyModLoader_bindConstructor = new WeakMap(), _PolyModLoader_latestBinding = new WeakMap(), _PolyModLoader_pmlVersion = new WeakMap(), _PolyModLoader_polyModUrls = new WeakMap(), _PolyModLoader_instances = new WeakSet(), _PolyModLoader_applySettings = function _PolyModLoader_applySettings() {
    this.getFromPolyTrack(`${__classPrivateFieldGet(this, _PolyModLoader_settingConstructor, "f").join("")}`);
    this.registerClassMixin(`${Variables.SettingsClass}.prototype`, "defaultSettings", MixinType.INSERT, `() {`, `ActivePolyModLoader.settingClass = this;`);
    console.log(__classPrivateFieldGet(this, _PolyModLoader_defaultSettings, "f").join(""));
    this.registerClassMixin(`${Variables.SettingsClass}.prototype`, "defaultSettings", MixinType.INSERT, `return new Map([`, __classPrivateFieldGet(this, _PolyModLoader_defaultSettings, "f").join(""));
    this.registerFuncMixin(Variables.SettingUIFunction, MixinType.REPLACEBETWEEN, `(0, R.gn)(this, _s, "m", Js).call(this, Ms.getFromLanguage((0, R.gn)(this, Os, "f"), "Controls")),`, `(0, R.gn)(this, _s, "m", Js).call(this, Ms.getFromLanguage((0, R.gn)(this, Os, "f"), "Controls")),`, `${__classPrivateFieldGet(this, _PolyModLoader_settings, "f").join("")}(0, R.gn)(this, _s, "m", Js).call(this, Ms.getFromLanguage((0, R.gn)(this, Os, "f"), "Controls")),`);
}, _PolyModLoader_applyKeybinds = function _PolyModLoader_applyKeybinds() {
    this.registerClassMixin(`${Variables.SettingsClass}.prototype`, "defaultKeyBindings", MixinType.INSERT, `() {`, `${__classPrivateFieldGet(this, _PolyModLoader_bindConstructor, "f").join("")};`);
    this.registerClassMixin(`${Variables.SettingsClass}.prototype`, "defaultKeyBindings", MixinType.INSERT, `return new Map([`, __classPrivateFieldGet(this, _PolyModLoader_defaultBinds, "f").join(""));
    this.registerFuncMixin(Variables.SettingUIFunction, MixinType.INSERT, `"Toggle spectator camera"), me.A.ToggleSpectatorCamera)`, `,${__classPrivateFieldGet(this, _PolyModLoader_keybindings, "f").join("")}null`);
}, _PolyModLoader_preInitPML = function _PolyModLoader_preInitPML() {
    this.registerFuncMixin("nh", MixinType.INSERT, `(0, R.gn)(this, Dc, "f").appendChild(t);`, `
            const text = document.createElement("a");
            text.href = "https://polymodloader.com";
            text.target = "_blank";
            text.textContent = "polymodloader.com - " + e.get("Version") + " " + "${__classPrivateFieldGet(this, _PolyModLoader_pmlVersion, "f")}";
            (0, R.gn)(this, Dc, "f").appendChild(text);
        `);
    // register PML settings
    this.registerSettingCategory("PolyModLoader");
    this.registerSetting("Cache mods (requires reload)", "pmlCacheMods", SettingType.BOOL, true);
    this.registerSetting("Debug Mode (Reload TWICE to apply)", "debugmode", SettingType.BOOL, false);
    this.registerSetting("Clear polyMods", "clearmods", SettingType.BOOL, false);
}, _PolyModLoader_prePreInitPML = function _PolyModLoader_prePreInitPML() {
    this.registerGlobalMixin(MixinType.INSERT, `})), (0, R.GG)(this, Bc, null, "f")`, `;ActivePolyModLoader.gameLoad();`);
    this.registerGlobalMixin(MixinType.INSERT, `}))) : (0, r.GG)(this, c, null, "f")`, `;
          ActivePolyModLoader.simInitMods();console.log("a");(0, r.gn)(this, h, "f").postMessage({
            messageType: 69,
            classMixins: ActivePolyModLoader.simWorkerClassMixins || [],
            funcMixins: ActivePolyModLoader.simWorkerFuncMixins || []
          });`);
};
// @ts-ignore
const ActivePolyModLoader = new PolyModLoader("0.6.0-beta1", window.pmlversion);
export { ActivePolyModLoader };
