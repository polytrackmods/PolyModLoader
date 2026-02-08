/**
 * 
 *      To compile:
 *          tsc PolyModLoader.ts --target ES2020 --module ES2022
 *  
 */

/**
 * Base class for all polytrack mods. Mods should export an instance of their mod class named `polyMod` in their main file.
 */

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
function isElectron(): boolean {
    // Renderer process (BrowserWindow)
    if (typeof window !== "undefined") {
        const win = window as any;
        if (typeof win.process === "object" && win.process?.type === "renderer") {
            return true;
        }
    }

    // Main process or preload
    const g = globalThis as any;
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
function isAndroidApp(): boolean {
    const win = window as any;

    // 1️⃣ Cordova presence
    if (typeof win.cordova !== "undefined") {
        // Cordova Device plugin check (safe optional chain)
        const platform = win.device?.platform?.toLowerCase?.();
        if (platform === "android") return true;

        // Fallback: user agent heuristic
        if (/android/i.test(navigator.userAgent)) return true;
    }

    // 2️⃣ Fallback: Cordova/Capacitor WebView URL pattern
    const url = document.URL || "";
    if (url.startsWith("file:///android_asset/")) return true;

    // 3️⃣ Future-proof: Capacitor-based apps (optional)
    if ((win.Capacitor?.getPlatform?.() || "").toLowerCase() === "android") return true;

    return false;
}


// General app detection
export function isApp(): boolean {
    return isElectron() || isAndroidApp();
}

// Full update checker
export async function checkForUpdate(): Promise<boolean> {
    const pmlversion = (window as any).pmlversion;
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
        if (!response.ok) throw new Error("Failed to fetch tags");

        const tags = await response.json();

        const parsedTags = tags
            .map((tag: any) => {
                const m = tag.name.match(/^v(\d+)\.(\d+)\.(\d+)-(\d+)$/);
                if (!m) return null;
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
            if (currentGameVersion[i] < newest.gameVersion[i]) return true;
            if (currentGameVersion[i] > newest.gameVersion[i]) return false;
        }

        return currentBuild < newest.build;
    } catch (error) {
        console.error("Error checking for updates:", error);
        return false;
    }
}


export class PolyMod {
    /**
     * The author of the mod.
     * 
     * @type {string}
     */
    get author() {
        return this.modAuthor;
    }
    modAuthor: string | undefined;
    /**
     * The mod ID.
     * 
     * @type {string}
     */
    get id() {
        return this.modID;
    }
    modID: string | undefined;
    /**
     * The mod name.
     * 
     * @type {string}
     */
    get name() {
        return this.modName;
    }
    modName: string | undefined;
    /**
     * The mod version.
     * 
     * @type {string}
     */
    get version() {
        return this.modVersion;
    }
    modVersion: string | undefined;
    /**
     * The the mod's icon file URL.
     * 
     * @type {string}
     */
    get iconSrc() {
        return this.IconSrc;
    }
    IconSrc: string | undefined;
    set iconSrc(src) {
        this.IconSrc = src;
    }
    loaded: boolean = false;
    set setLoaded(status: boolean) {
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
    modBaseUrl: string | undefined;
    set baseUrl(url) {
        this.modBaseUrl = url;
    }
    /**
     * Whether the mod has changed the game physics in some way.
     *  
     * @type {boolean}
     */
    get touchesPhysics() {
        return this.touchingPhysics;
    }
    touchingPhysics: boolean | undefined;
    /**
     * Other mods that this mod depends on.
     */
    get dependencies() {
        return this.modDependencies;
    }
    modDependencies: Array<{ version: string, id: string }> | undefined;
    get descriptionUrl() {
        return this.modDescription;
    }
    modDescription: string | undefined;
    /**
     * Whether the mod is saved as to always fetch latest version (`true`)
     * or to fetch a specific version (`false`, with version defined by {@link PolyMod.version}).
     * 
     * @type {boolean}
     */
    get savedLatest() {
        return this.latestSaved;
    }
    latestSaved: boolean | undefined;
    set savedLatest(latest) {
        this.latestSaved = latest;
    }
    get initialized() {
        return this.modInitialized;
    }
    modInitialized: boolean | undefined;
    set initialized(initState) {
        this.modInitialized = initState;
    }
    polyVersion: Array<string> | undefined;
    assetFolder: string | undefined;
    manifest: { polymod: { name: string, author: string, version: string, id: string, targets: Array<string>, main: string }, dependencies: Array<{ id: string, version: string }> } | undefined;
    applyManifest = (manifest: { polymod: { name: string, author: string, version: string, id: string, targets: Array<string>, main: string }, dependencies: Array<{ id: string, version: string }> }) => {
        const mod = manifest.polymod;
        /** @type {string} */
        this.modName = mod.name;
        /** @type {string} */
        this.modID = mod.id;
        /** @type {string} */
        this.modAuthor = mod.author;
        /** @type {string} */
        this.modVersion = mod.version;

        /** @type {string} */
        this.polyVersion = mod.targets;
        this.assetFolder = "assets";
        // no idea how to type annotate this
        // /** @type {{string: string}[]} */
        this.modDependencies = manifest.dependencies;
    }
    /**
     * Function to run during initialization of mods. Note that this is called *before* polytrack itself is loaded, 
     * but *after* everything has been declared.
     * 
     * @param {PolyModLoader} pmlInstance - The instance of {@link PolyModLoader}.
     */
    init = (pmlInstance: PolyModLoader) => { }
    /**
     * Function to run after all mods and polytrack have been initialized and loaded.
     */
    postInit = () => { }
    /**
     * Function to run before initialization of `simulation_worker.bundle.js`.
     */
    simInit = () => { }
    /**
    * Function to run once game finishses loading
    */
    onGameLoad = () => { }
    /**
    * Function to run just after import, before anything else
    */
    preInit = (pmlInstance: PolyModLoader) => { }
    /**
     * Whether the mod
     */
    offlineMode: boolean = false;
}

/**
 * This class is used in {@link PolyModLoader}'s register mixin functions to set where functions should be injected into the target function.
 */
export enum MixinType {
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

export enum SettingType {
    BOOL = "boolean",
    SLIDER = "slider",
    CUSTOM = "custom"
}


enum Variables {
    SettingsClass = "az",
    SettingEnum = "el",
    KeybindEnum = "gk",
    SettingUIFunction = "fL",
}

export class SoundManager {
    soundClass: any;
    pml: PolyModLoader;
    constructor(pml: PolyModLoader, soundClass: any) {
        this.pml = pml;
        this.soundClass = soundClass;
    }
    registerSound(id: string, url: string) {
        this.soundClass.load(id, url);
    }
    playSound(id: string, gain: number) {
        const e = this.soundClass.getBuffer(id);
        if (null != e && null != this.soundClass.context && null != this.soundClass.destinationSfx) {
            const t = this.soundClass.context.createBufferSource();
            t.buffer = e;
            const n = this.soundClass.context.createGain();
            n.gain.value = gain,
                t.connect(n),
                n.connect(this.soundClass.destinationSfx),
                t.start(0)
        }
    }
    playUIClick() {
        const e = this.soundClass.getBuffer("click");
        if (null != e && null != this.soundClass.context && null != this.soundClass.destinationSfx) {
            const t = this.soundClass.context.createBufferSource();
            t.buffer = e;
            const n = this.soundClass.context.createGain();
            n.gain.value = .0075,
                t.connect(n),
                n.connect(this.soundClass.destinationSfx),
                t.start(0)
        }
    }
    
    registerSoundOverride(id: string, url: string) {
        this.pml.registerClassMixin(`soundClassHere.prototype`, "load", MixinType.INSERT, `ml(this, nl, "f").addResource(),`, `
            null;
            if(e === "${id}") {
                t = ["${url}"];
            }`)
    }
}

export class EditorExtras {
    #editorClass: any;
    pml: PolyModLoader;
    #categoryDefaults: Array<string> = []
    ignoredBlocks: Array<number> = [];
    #simBlocks: Array<string> = [];
    #modelUrls: Array<string> = ["models/blocks.glb", "models/pillar.glb", "models/planes.glb", "models/road.glb", "models/road_wide.glb", "models/signs.glb", "models/wall_track.glb"];
    constructor(pml: PolyModLoader) {
        this.pml = pml;
    }
    construct(editorClass: any) {
        this.#editorClass = editorClass;
    }

    blockNumberFromId(id: string): number {
        return this.pml.getFromPolyTrack(`Sb.${id}`);
    }

    get getSimBlocks() {
        return [...this.#simBlocks];
    }

    get trackEditorClass() {
        return this.#editorClass;
    }

    registerModel(url: string) {
        this.#modelUrls.push(url);
    }

    registerCategory(id: string, defaultId: string) {
        let latestCategory = (Object.keys(this.pml.getFromPolyTrack("RA")).length / 2) + 2
        this.pml.getFromPolyTrack(`RA[RA.${id} = ${latestCategory}]  =  "${id}"`);
        this.#simBlocks.push(`fv[fv.${id} = ${latestCategory}]  =  "${id}"`);
        this.#categoryDefaults.push(`case RA.${id}:n = this.getPart(Sb.${defaultId});break;`)
    }

    registerBlock(id: string, categoryId: string, checksum: string, sceneName: string, modelName: string, overlapSpace: Array<Array<Array<number>>>, extraSettings?: { ignoreOnExport?: boolean, specialSettings?: { type: string, center: Array<number>, size: Array<number> } }) {
        let latestBlock = (Object.keys(this.pml.getFromPolyTrack("Sb")).length / 2) + 2
        this.pml.getFromPolyTrack(`Sb[Sb.${id} = ${latestBlock}]  =  "${id}"`);
        this.pml.getFromPolyTrack(`VA.push(new HA("${checksum}",RA.${categoryId},Sb.${id},[["${sceneName}", "${modelName}"]],FA,${JSON.stringify(overlapSpace)}${extraSettings && extraSettings.specialSettings ? `, { type: DA.${extraSettings.specialSettings.type}, center: ${JSON.stringify(extraSettings.specialSettings.center)}, size: ${JSON.stringify(extraSettings.specialSettings.size)}}` : ""}))`);
        this.pml.getFromPolyTrack(`GA.clear();for (const e of VA) {if (!GA.has(e.id)){ GA.set(e.id, e);}; }`);
        if (extraSettings && extraSettings.ignoreOnExport) {
            this.ignoredBlocks.push(this.blockNumberFromId(id));
            return;
        }
        this.#simBlocks.push(`dd[dd.${id} = ${latestBlock}]  =  "${id}"`);
        this.#simBlocks.push(`xv.push(new yv("${checksum}",fv.${categoryId},dd.${id},[["${sceneName}", "${modelName}"]],vv,${JSON.stringify(overlapSpace)}${extraSettings && extraSettings.specialSettings ? `, { type: qh.${extraSettings.specialSettings.type}, center: ${JSON.stringify(extraSettings.specialSettings.center)}, size: ${JSON.stringify(extraSettings.specialSettings.size)}}` : ""}))`);
        this.#simBlocks.push(`bv.clear();for (const e of xv) {if (!bv.has(e.id)){ bv.set(e.id, e);}; }`);
    }
    init() {
        this.pml.registerClassMixin("eU.prototype",
            "init", MixinType.REPLACEBETWEEN,
            `((a = [`,
            ` ]),`, `((a = ["${this.#modelUrls.join('", "')}"]),`);
        this.pml.registerFuncMixin("sx", MixinType.INSERT, `for (const [r, a] of lx(this, rx, "f")) {`, `if (ActivePolyModLoader.editorExtras.ignoredBlocks.includes(r)) {continue;};`);
        this.pml.registerClassMixin("eU.prototype", "getCategoryMesh", MixinType.INSERT, "n = this.getPart(Sb.SignArrowLeft);", `break;${this.#categoryDefaults.join("")}`);
    }
}

class PolyDB {
    #db: IDBDatabase | undefined;
    cacheMods = true;
    constructor(pml: PolyModLoader) {
        let settingList = JSON.parse(pml.localStorage?.getItem("polytrack_v4_prod_settings") || "[]") as unknown as Array<Array<string>>;

        for (let setting of settingList) {
            if (setting[0] === "pmlCacheMods") {
                console.log(setting[0], setting[1])
                this.cacheMods = setting[1] == "true";
            }

            if (setting[0] === "debugmode") {
                if (setting[1] === "true") {
                    console.log("Debug mode is ON");
                    window.localStorage.setItem("debug", "true");
                } else if (setting[1] === "false") {
                    console.log("Debug mode is OFF");
                    window.localStorage.setItem("debug", "false");
                }
            }

            if (setting[0] === "clearmods") {
                if (setting[1] === "true") {
                    console.log("Clearing polyMods");
                    window.localStorage.removeItem("polyMods");
                    window.localStorage.removeItem("polytrack_v4_prod_settings");
                    location.reload();
                }
            }
        }
    }
    dbUpgrading = false;
    async syncMods(modList: Array<{ base: string, version: string, loaded: boolean }>, pmlModList: Array<PolyMod>) {
        let localDb = await this.#getDb();
        await new Promise((resolve, reject) => {
            try {
                const transaction = localDb.transaction("mods", "readwrite");
                const store = transaction?.objectStore("mods");
                const request = store?.clear();
                if (!request) { return reject(null); };
                request.onsuccess = () => resolve(request?.result || null);
                request.onerror = () => reject(request?.result || null);
            } catch (err) {
                reject(err);
            }
        });
        for (let index = 0; index < modList.length; index++) {
            const modSerialized = modList[index];
            const mod = pmlModList[index];
            try {
                this.saveMod(modSerialized.base, mod.version || "", mod.manifest);
            } catch {
                console.warn("Couldn't save mod to DB:", modSerialized.base);
            }
        }
    }
    async #getDb(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            if (this.#db) {
                return resolve(this.#db);
            }

            const DBOpenRequest = window.indexedDB.open("PMLMods", 1); // always set a version
            DBOpenRequest.onerror = () => {
                console.error("Error initializing database.");
                reject(new Error("DB init failed"));
            };

            DBOpenRequest.onsuccess = () => {
                console.log("Database initialized.");
                this.#db = DBOpenRequest.result;
                resolve(this.#db);
            };

            DBOpenRequest.onupgradeneeded = (event) => {
                console.log("Upgrading...");
                // @ts-ignore
                this.#db = event.target.result as IDBDatabase;

                if (!this.#db) {
                    return reject(new Error("Upgrade DB is null"));
                }

                this.#db.onerror = () => {
                    console.error("Error during DB upgrade.");
                };

                if (!this.#db.objectStoreNames.contains("mods")) {
                    this.#db.createObjectStore("mods", { keyPath: "baseUrl" });
                    console.log("Object store created.");
                }

                // @ts-ignore
                event.target.transaction.oncomplete = () => {
                    console.log("Upgrade finished.");
                    resolve(this.#db!);
                };
            };
        });
    }
    async getMod(baseUrl: string): Promise<{ baseUrl: string, version: string, manifest: { polymod: { name: string, author: string, version: string, id: string, targets: Array<string>, main: string }, dependencies: Array<{ id: string, version: string }> }, codeStr: Blob } | null> {
        let localDb = await this.#getDb();
        return await new Promise((resolve, reject) => {
            if (!localDb) {
                console.error("Database not initialized.");
                return false;
            }
            const transaction = localDb.transaction("mods", "readonly");
            const store = transaction?.objectStore("mods");
            const request = store?.get(baseUrl);
            if (!request) { return null; };
            request.onsuccess = () => resolve(request?.result || null);
            request.onerror = () => reject(null);
        })
    }
    async saveMod(baseUrl: string, version: string, manifest: { polymod: { name: string, author: string, version: string, id: string, targets: Array<string>, main: string }, dependencies: Array<{ id: string, version: string }> } | undefined) {
        const localDb = await this.#getDb();
        if (!localDb) {
            console.error("Database not initialized.");
            return false;
        }

        const response = await fetch(`${baseUrl}/${version}/${manifest?.polymod.main}`);
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

export class PolyModLoader {
    #polyVersion: string;
    #allMods: Array<PolyMod>;
    // @ts-ignore
    polyDb: PolyDB;
    #simWorkerClassMixins: Array<{
        scope: string,
        path: string,
        mixinType: MixinType,
        accessors: Array<string> | string,
        funcString: string,
        func2Sstring: string | null
    }>;
    #simWorkerFuncMixins: Array<{
        path: string,
        mixinType: MixinType,
        accessors: Array<string> | string,
        funcString: string,
        func2Sstring: string | null
    }>;

    #settings: Array<string>
    #settingConstructor: Array<string>
    #defaultSettings: Array<string>
    #latestSetting: number;

    #keybindings: Array<string>
    #defaultBinds: Array<string>
    #bindConstructor: Array<string>
    #latestBinding: number;
    #pmlVersion: string;

    constructor(polyVersion: string, pmlVersion: string) {
        this.#pmlVersion = pmlVersion;
        /** @type {string} */
        this.#polyVersion = polyVersion;
        /** @type {PolyMod[]} */
        this.#allMods = [];

        console.log("[PML] PolyModLoader initialized, version:", pmlVersion);

        // 🔹 Run environment detection + update check
        setTimeout(() => {
            console.log("[PML] Running environment detection...");

            const electron = isElectron();
            const android = isAndroidApp();
            const app = isApp();

            if (electron) console.log("Running Electron app!");
            if (android) console.log("Running Android app!");
            if (!app) console.log("Running in web browser.");

            if (app) {
                console.log("[PML] App environment detected — checking for updates...");
                checkForUpdate()
                    .then((needsUpdate) => {
                        console.log("[PML] Update check complete:", needsUpdate);
                        if (needsUpdate) {
                            alert(
                                "You are playing on an outdated version of PolyModLoader.\n" +
                                "Please update your game by downloading the latest version from:\n" +
                                "https://codeberg.org/polytrackmods/PolyModLoader/releases"
                            );
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
        this.#simWorkerClassMixins = [];
        /** 
         * @type {{
        *      path: string,
        *      mixinType: MixinType,
        *      accessors: string[],
        *      funcString: string,
        *  }}
        */
        this.#simWorkerFuncMixins = [];

        this.#settings = [];
        this.#settingConstructor = [];
        this.#defaultSettings = [];
        this.#latestSetting = 18;

        this.#keybindings = []
        this.#defaultBinds = []
        this.#bindConstructor = []
        this.#latestBinding = 31;
    }
    get polyVersion() {
        return this.#polyVersion; // Why is this even private lmfao
    }
    localStorage: Storage | undefined;
    #polyModUrls: Array<{ base: string, version: string, loaded: boolean }> | undefined;
    initStorage(localStorage: Storage) {
        this.localStorage = localStorage;
        this.polyDb = new PolyDB(this);
        this.#polyModUrls = this.getPolyModsStorage();
    }
    async importMods() {
        // Mod loading UI
        const ui = document.getElementById("ui")!;
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

        const total: number = this.#polyModUrls ? this.#polyModUrls.length : 0;
        const current = {
            num: 0,
            text: undefined,
            url: "",
            version: "",

            totalParts: 0,
            part: 0,
        };

        function updateBar(num: number) {
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
        function startImportMod(url: string, version: string) {
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
            latestP.innerText = `${currPartStr()} Fetching latest mod version from ${current.url}/latest.json`;

            progressDiv.appendChild(latestP);
            // @ts-ignore
            current.text = latestP;
        }
        function finishFetchLatest(version: string) {
            current.version = version;
            // @ts-ignore
            current.text.innerText = `${currPartStr()} Fetched latest mod version: v${current.version}`;
        }
        function startFetchManifest() {
            nextPart();

            const manifestP = document.createElement("p");
            manifestP.style.color = "#ffffff";
            manifestP.style.fontSize = "18px";
            manifestP.style.fontStyle = "italic";
            manifestP.style.fontFamily = "ForcedSquare, Arial, sans-serif";
            manifestP.style.lineHeight = "1";
            manifestP.innerText = `${currPartStr()} Fetching mod manifest from ${current.url}/${current.version}/manifest.json`;

            progressDiv.appendChild(manifestP);
            // @ts-ignore
            current.text = manifestP;
        }
        function startFetchModMain(js: string) {
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
        for (let polyModObject of this.#polyModUrls ? this.#polyModUrls : []) {
            startImportMod(polyModObject.base, polyModObject.version);
            const dbMod = await this.polyDb.getMod(polyModObject.base);
            let latest = false;
            let importFromDB = false;;
            current.totalParts = 2;
            if (polyModObject.version === "latest") {
                current.totalParts = 3;
                startFetchLatest();
                try {
                    const latestFile = await fetch(`${polyModObject.base}/latest.json`).then(r => r.json());
                    polyModObject.version = latestFile[this.#polyVersion];
                    latest = true;
                } catch (err) {
                    errorCurrent();
                    importFromDB = this.polyDb.cacheMods && true;
                    alert(`Couldn't find latest version for ${polyModObject.base}`);
                    console.error("Error in fetching latest version json:", err);
                }
                finishFetchLatest(polyModObject.version);
            }
            if (this.polyDb.cacheMods && dbMod && polyModObject.version === dbMod.version) {
                console.log("Mod version in DB, skipping import")
                importFromDB = true;
            }
            const polyModUrl = `${polyModObject.base}/${polyModObject.version}`;
            startFetchManifest();
            try {
                let manifestFile;
                if (importFromDB && dbMod) {
                    manifestFile = dbMod.manifest
                } else {
                    manifestFile = await fetch(`${polyModUrl}/manifest.json`).then(r => r.json());
                }
                let mod = manifestFile.polymod;
                startFetchModMain(mod.main);
                try {
                    const modImport = await import(importFromDB && dbMod ? URL.createObjectURL(new Blob([dbMod.codeStr], { type: "application/javascript" })) : `${polyModUrl}/${mod.main}`);

                    let newMod: PolyMod = modImport.polyMod;
                    mod.version = polyModObject.version;
                    if (this.getMod(mod.id)) alert(`Duplicate mod detected: ${mod.name}`);
                    newMod.manifest = manifestFile;
                    newMod.offlineMode = importFromDB;
                    newMod.applyManifest(manifestFile);
                    newMod.baseUrl = polyModObject.base;
                    newMod.applyManifest = (nothing: any) => { console.warn("Can't apply manifest after initialization!") }
                    newMod.savedLatest = latest;
                    newMod.iconSrc = `${polyModUrl}/icon.png`;
                    if (polyModObject.loaded) {
                        newMod.setLoaded = true;
                    }
                    this.#allMods.push(newMod);
                } catch (err) {
                    errorCurrent();
                    alert(`Mod ${mod.name} failed to load.`);
                    console.error("Error in loading mod:", err);
                }
            } catch (err) {
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
            this.#polyModUrls = JSON.parse(polyModsStorage);
        } else {
            this.#polyModUrls = [
                {
                    "base": "https://cdn.polymodloader.com/cb/PolyTrackMods/PolyModLoader/pmlcore",
                    "version": "latest",
                    "loaded": true
                }
            ];
            this.localStorage?.setItem("polyMods", JSON.stringify(this.#polyModUrls));
        }
        return this.#polyModUrls;
    }
    serializeMod(mod: PolyMod) {
        return { "base": mod.baseUrl ? mod.baseUrl : "", "version": mod.savedLatest ? "latest" : mod.version ? mod.version : "latest", "loaded": mod.isLoaded || false };
    }
    saveModsToLocalStorage() {
        let savedMods: Array<{ base: string, version: string, loaded: boolean }> = [];
        for (let mod of this.#allMods) {
            const modSerialized = this.serializeMod(mod);
            savedMods.push(modSerialized);
        }
        this.polyDb.syncMods(savedMods, this.#allMods);
        this.#polyModUrls = savedMods;
        this.localStorage?.setItem("polyMods", JSON.stringify(this.#polyModUrls));
    }
    /**
     * Reorder a mod in the internal list to change its priority in mod loading.
     * 
     * @param {PolyMod} mod  - The mod to reorder.
     * @param {number} delta - The amount to reorder it by. Positive numbers decrease priority, negative numbers increase priority.
     */
    reorderMod(mod: PolyMod, delta: number) {
        if (!mod) return;
        if (mod.id === "pmlcore") {
            return;
        }
        const currentIndex = this.#allMods.indexOf(mod);
        if ((currentIndex === 1) || delta > 0) return;
        if (currentIndex === null || currentIndex === undefined) {
            alert("This mod isn't loaded");
            return;
        }
        const temp = this.#allMods[currentIndex + delta];
        this.#allMods[currentIndex + delta] = this.#allMods[currentIndex];
        this.#allMods[currentIndex] = temp;
        this.saveModsToLocalStorage();
    }
    /**
     * Add a mod to the internal mod list. Added mod is given least priority.
     * 
     * @param {{base: string, version: string, loaded: bool}} polyModObject - The mod's JSON representation to add.
     */
    async addMod(polyModObject: { base: string, version: string, loaded: boolean }, autoUpdate: boolean) {
        let latest = false;
        if (polyModObject.version === "latest") {
            try {
                const latestFile = await fetch(`${polyModObject.base}/latest.json`).then(r => r.json());
                polyModObject.version = latestFile[this.#polyVersion];
                if (autoUpdate) {
                    latest = true;
                }
            } catch {
                alert(`Mod with URL ${polyModObject.base} does not have a version which supports PolyTrack v${this.#polyVersion}.`);
            }
        }
        const polyModUrl = `${polyModObject.base}/${polyModObject.version}`;
        try {
            const manifestFile = await fetch(`${polyModUrl}/manifest.json`).then(r => r.json());
            const mod = manifestFile.polymod;
            if (this.getMod(mod.id)) {
                alert("This mod is already present!");
                return;
            }
            if (mod.targets.indexOf(this.#polyVersion) === -1) {
                alert(
                    `Mod target version does not match polytrack version!
                    Note: ${mod.name} version ${polyModObject.version} targets polytrack versions ${mod.targets.join(', ')}, but current polytrack version is ${this.#polyVersion}.`
                );
                return;
            }
            try {
                const modImport = await import(`${polyModUrl}/${mod.main}`);
                let newMod = modImport.polyMod;
                newMod.iconSrc = `${polyModUrl}/icon.png`;
                mod.version = polyModObject.version;
                newMod.applyManifest(manifestFile);
                newMod.manifest = manifestFile;
                newMod.baseUrl = polyModObject.base;
                newMod.applyManifest = (nothing: any) => { console.warn("Can't apply manifest after initialization!") }
                newMod.savedLatest = latest;
                this.#allMods.push(newMod);
                this.saveModsToLocalStorage();
                return this.getMod(newMod.id);
            } catch (err) {
                alert("Something went wrong importing this mod!");
                console.error("Error in importing mod:", err);
                return;
            }
        } catch (err) {
            alert(`Couldn't find mod manifest for "${polyModObject.base}".`);
            console.error("Error in getting mod manifest:", err);
        }
    }
    registerSettingCategory(name: string) {
        this.#settings.push(`AL(this, JR, 'm', mL).call(this, AL(this, eL, 'f').get('${name}')),`);
    }
    registerBindCategory(name: string) {
        this.#keybindings.push(`AL(this, JR, 'm', gL).call(this, AL(this, eL, 'f').get('${name}')),`);
    }
    registerSetting(name: string, id: string, type: SettingType, defaultOption: any, optionsOptional?: Array<{ title: string, value: string }>) {
        this.#latestSetting++
        this.#settingConstructor.push(`${Variables.SettingEnum}[${Variables.SettingEnum}.${id} = ${this.#latestSetting}] = "${id}";`);
        if (type === "boolean") {
            this.#defaultSettings.push(`[${Variables.SettingEnum}.${id}, "${defaultOption ? "true" : "false"}"],`)
            this.#settings.push(`
                AL(this, JR, 'm', vL).call(this, AL(this, eL, 'f').get('${name}'), [
                {
                    title: AL(this, eL, 'f').get('Off'),
                    value: 'false'
                },
                {
                    title: AL(this, eL, 'f').get('On'),
                    value: 'true'
                }
            ], ${Variables.SettingEnum}.${id}),`)
        } else if (type === "slider") {
            this.#defaultSettings.push(`[${Variables.SettingEnum}.${id}, "${defaultOption}"],`)
            this.#settings.push(`
                AL(this, JR, 'm', wL).call(
                this, AL(this, eL, 'f').get('${name}'), 
                ${Variables.SettingEnum}.${id}),`)
        } else if (type === "custom") {
            this.#defaultSettings.push(`[${Variables.SettingEnum}.${id}, "${defaultOption}"],`)
            this.#settings.push(`
                AL(this, JR, 'm', vL).call(this, AL(this, eL, 'f').get('${name}'),
                ${JSON.stringify(optionsOptional)},
                ${Variables.SettingEnum}.${id}
                ),`)
                
        }
    }
    settingClass: any;
    registerKeybind(name: string, id: string, event: string, defaultBind: string, secondBindOptional: string | null, callback: Function) {
        this.#keybindings.push(`AL(this, JR, 'm', yL).call(this, AL(this, eL, 'f').get('${name}'), ${Variables.KeybindEnum}.${id}),`);
        this.#bindConstructor.push(`${Variables.KeybindEnum}[${Variables.KeybindEnum}.${id} = ${this.#latestBinding}] = "${id}";`);
        this.#defaultBinds.push(`[${Variables.KeybindEnum}.${id}, ["${defaultBind}", ${secondBindOptional ? `"${secondBindOptional}"` : "null"}]],`);
        this.#latestBinding++;
        window.addEventListener(event, (e) => {
            if (this.settingClass.checkKeyBinding(e, this.getFromPolyTrack(`${Variables.KeybindEnum}.${id}`))) {
                callback(e)
            }
        });
    }
    #applySettings() {
        this.registerClassMixin(`${Variables.SettingsClass}.prototype`, "defaultSettings", MixinType.INSERT, `() {`, `ActivePolyModLoader.settingClass = this;${this.#settingConstructor.join("")}`)
        this.registerClassMixin(`${Variables.SettingsClass}.prototype`, "defaultSettings", MixinType.INSERT, `return new Map([`, this.#defaultSettings.join(""))
        this.registerFuncMixin(Variables.SettingUIFunction, MixinType.REPLACEBETWEEN, `AL(this, JR, 'm', mL).call(this, AL(this, eL, 'f').get('Controls')),`, `AL(this, JR, 'm', mL).call(this, AL(this, eL, 'f').get('Controls')),`, `${this.#settings.join("")}AL(this, JR, 'm', mL).call(this, AL(this, eL, 'f').get('Controls')),`)
    }

    #applyKeybinds() {
        this.registerClassMixin(`${Variables.SettingsClass}.prototype`, "defaultKeyBindings", MixinType.INSERT, `() {`, `${this.#bindConstructor.join("")};`)
        this.registerClassMixin(`${Variables.SettingsClass}.prototype`, "defaultKeyBindings", MixinType.INSERT, `return new Map([`, this.#defaultBinds.join(""))
        this.registerFuncMixin(Variables.SettingUIFunction, MixinType.INSERT, `get('Toggle spectator camera'), gk.ToggleSpectatorCamera)`,`,${this.#keybindings.join("")}null`);
    }
    getSetting(id: string) {
        return this.getFromPolyTrack(`ActivePolyModLoader.settingClass.getSetting(${Variables.SettingEnum}.${id})`);
    }
    /**
     * Remove a mod from the internal list.
     * 
     * @param {PolyMod} mod - The mod to remove.
     */
    removeMod(mod: PolyMod) {
        if (!mod) return;
        if (mod.id === "pmlcore") {
            return;
        }
        const index = this.#allMods.indexOf(mod);
        if (index > -1) {
            this.#allMods.splice(index, 1);
        }
        this.saveModsToLocalStorage();
    }
    /**
     * Set the loaded state of a mod.
     * 
     * @param {PolyMod} mod   - The mod to set the state of.
     * @param {boolean} state - The state to set. `true` is loaded, `false` is unloaded.
     */
    setModLoaded(mod: PolyMod, state: boolean) {
        if (!mod) return;
        if (mod.id === "pmlcore") {
            return;
        }
        mod.loaded = state;
        this.saveModsToLocalStorage();
    }
    popUpClass: any;
    #preInitPML() {
        this.registerFuncMixin("gN", MixinType.INSERT, `kN(this, JD, 'f').appendChild(t);`, `
            const text = document.createElement("a");
            text.href = "https://polymodloader.com";
            text.target = "_blank";
            text.textContent = "polymodloader.com - " + e.get("Version") + " " + "${this.#pmlVersion}";
            kN(this, JD, 'f').appendChild(text);
        `)
        // register PML settings
        this.registerSettingCategory("PolyModLoader");
        this.registerSetting("Cache mods (requires reload)", "pmlCacheMods", SettingType.BOOL, true);
        this.registerSetting("Debug Mode (Reload TWICE to apply)", "debugmode", SettingType.BOOL, false);
        this.registerSetting("Clear polyMods", "clearmods", SettingType.BOOL, false);
    }
    #prePreInitPML(){
        this.registerGlobalMixin(MixinType.INSERT, `}), xN(this, $D, null, 'f');`, `ActivePolyModLoader.gameLoad();`)
        this.registerGlobalMixin(MixinType.INSERT, `})) : mz(this, cz, null, 'f');`, `
          ActivePolyModLoader.simInitMods();console.log("a");gz(this, hz, 'f').postMessage({
            messageType: 69,
            classMixins: ActivePolyModLoader.simWorkerClassMixins || [],
            funcMixins: ActivePolyModLoader.simWorkerFuncMixins || []
          });`)
    }
    initMods() {
        this.#preInitPML();
        
        let initList: Array<string> = []
        for (let polyMod of this.#allMods) {
            if (polyMod.id && polyMod.isLoaded)
                initList.push(polyMod.id);
        }
        let allModsInit = false;
        if (initList.length === 0) allModsInit = true; // no mods to initialize lol
        while (!allModsInit) {
            let currentMod: PolyMod | undefined = this.getMod(initList[0]);
            if (!currentMod)
                continue;
            console.log(initList[0]);
            let initCheck = true;
            for (let dependency of currentMod.dependencies || []) {
                let curDependency = this.getMod(dependency.id)
                if (!curDependency) {
                    initCheck = false;
                    initList.splice(0, 1);
                    alert(`Mod ${currentMod.name} is missing mod ${dependency.id} ${dependency.version} and will not be initialized.`);
                    console.warn(`Mod ${currentMod.name} is missing mod ${dependency.id} ${dependency.version} and will not be initialized.`);
                    this.setModLoaded(currentMod, false);
                    break;
                }
                if (!curDependency.isLoaded) {
                    initCheck = false;
                    initList.splice(0, 1);
                    alert(`Mod ${currentMod.name} depends on mod ${dependency.id} ${dependency.version} but the dependency isn't loaded. Mod will not be initialized.`);
                    console.warn(`Mod ${currentMod.name} depends on mod ${dependency.id} ${dependency.version} but the dependency isn't loaded. Mod will not be initialized.`);
                    this.setModLoaded(currentMod, false);
                    break;
                }
                if (curDependency.version !== dependency.version) {
                    initCheck = false;
                    initList.splice(0, 1);
                    alert(`Mod ${currentMod.name} needs version ${dependency.version} of ${curDependency.name} but ${curDependency.version} is present.`);
                    console.warn(`Mod ${currentMod.name} needs version ${dependency.version} of ${curDependency.name} but ${curDependency.version} is present.`);
                    this.setModLoaded(currentMod, false);
                    break;
                }
                if (!curDependency.initialized) {
                    initCheck = false;
                    initList.splice(0, 1);
                    initList.push(currentMod.id || "");
                    break;
                }
            }
            if (initCheck) {
                try {
                    currentMod.init(this);
                    currentMod.initialized = true;
                    initList.splice(0, 1);
                } catch (err) {
                    alert(`Mod ${currentMod.name} failed to initialize and will be unloaded.`);
                    console.error("Error in initializing mod:", err);
                    this.setModLoaded(currentMod, false);
                    initList.splice(0, 1);
                }
            }
            if (initList.length === 0)
                allModsInit = true;
        }
        this.#applySettings();
        this.#applyKeybinds();
    }
    postInitMods() {
        for (let polyMod of this.#allMods) {
            if (polyMod.isLoaded) {
                try {
                    polyMod.postInit();
                } catch (err) {
                    alert(`Mod ${polyMod.name} failed to post initialize and will be unloaded.`);
                    console.error("Error in post initializing mod:", err);
                    this.setModLoaded(polyMod, false);
                }
            }
        }
    }
    gameLoadCalled: boolean = false;
    gameLoad() {
        if (!this.gameLoadCalled) {
            this.gameLoadCalled = true;
        } else {
            return;
        }
        for (let polyMod of this.#allMods) {
            if (polyMod.isLoaded) {
                try {
                    polyMod.onGameLoad();
                } catch (err) {
                    alert(`Mod ${polyMod.name} failed on game load and will be unloaded.`);
                    console.error("Error on game load for mod:", err);
                    this.setModLoaded(polyMod, false);
                }
            }
        }
    }
    preInitMods() {
        this.#prePreInitPML();
        for (let polyMod of this.#allMods) {
            if (polyMod.isLoaded) {
                try {
                    polyMod.preInit(this);
                } catch (err) {
                    alert(`Mod ${polyMod.name} failed on pre init and will be unloaded.`);
                    console.error("Error on pre init for mod:", err);
                    this.setModLoaded(polyMod, false);
                }
            }
        }
    }
    simInitMods() {
        for (let polyMod of this.#allMods) {
            if (polyMod.isLoaded) polyMod.simInit();
        }
    }
    /**
     * Access a mod by its mod ID.
     * 
     * @param   {string} id - The ID of the mod to get
     * @returns {PolyMod}   - The requested mod's object.
     */
    getMod(id: string) {
        for (let polyMod of this.#allMods) {
            if (polyMod.id == id) return polyMod;
        }
    }
    /**
     * Get the list of all mods.
     * 
     * @type {PolyMod[]}
     */
    getAllMods() {
        return this.#allMods;
    }
    get simWorkerClassMixins() {
        return [...this.#simWorkerClassMixins];
    }
    get simWorkerFuncMixins() {
        return [...this.#simWorkerFuncMixins];
    }
    getFromPolyTrack = (path: string): any => { }
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
    registerClassMixin = (scope: string, path: string, mixinType: MixinType, accessors: string | Array<string>, func: Function | string, extraOptinonal?: Function | string) => { }
    /**
     * Inject mixin with target function name defined by {@link path}.
     * This only injects functions in `main.bundle.js`.
     * 
     * @param {string} path         - The path of the function which the mixin targets.
     * @param {MixinType} mixinType - The type of injection.
     * @param {string[]} accessors  - A list of strings to evaluate to access private variables.
     * @param {function} func       - The new function to be injected.
     */
    registerFuncMixin = (path: string, mixinType: MixinType, accessors: string | Array<string>, func: Function | string, extraOptinonal?: Function | string) => { }
    registerClassWideMixin = (path: string, mixinType: MixinType, firstToken: string, funcOrSecondToken: string | Function, funcOptional?: Function | string) => { }
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
    registerSimWorkerClassMixin(scope: string, path: string, mixinType: MixinType, accessors: string | Array<string>, func: Function | string, extraOptinonal?: Function | string) {
        this.#simWorkerClassMixins.push({
            scope: scope,
            path: path,
            mixinType: mixinType,
            accessors: accessors,
            funcString: typeof func === "function" ? func.toString() : func,
            func2Sstring: extraOptinonal ? extraOptinonal.toString() : null
        })
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
    registerSimWorkerFuncMixin(path: string, mixinType: MixinType, accessors: string | Array<string>, func: Function | string, extraOptinonal?: Function | string) {
        this.#simWorkerFuncMixins.push({
            path: path,
            mixinType: mixinType,
            accessors: accessors,
            funcString: typeof func === "function" ? func.toString() : func,
            func2Sstring: extraOptinonal ? extraOptinonal.toString() : null
        })
    }
    /**
     * Inject code anywhere in the main bundle
     * 
     * @param {MixinType} mixinType                 - The type of mixin: INSERT, REMOVEBETWEEN or REPLACEBETWEEN
     * @param {string} firstToken                   - The beginning token or for insert
     * @param {string | Function} funcOrSecondToken - The second token, or the function for insertion
     * @param {string | Function} funcOptional      - The function for REPLACEBETWEEN and REMOVEBETWEEN
     */
    registerGlobalMixin(mixinType: MixinType, firstToken: string, funcOrSecondToken: string | Function, funcOptional?: Function | string) {}
}
// @ts-ignore
const ActivePolyModLoader = new PolyModLoader("0.5.2", window.pmlversion);

export { ActivePolyModLoader }
