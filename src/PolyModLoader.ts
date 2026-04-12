
// @ts-ignore
import _semver, { tokens } from "./lib/semver.js";
import { PolyMod, PolyModLoader, MixinType, SettingType, ModManifest, GlobalManifest, VersionManifest, PolyDB, MixinArgs } from "./PolyTypes.js";

const semver = {
  valid: (v: string) => {
    return _semver.valid(v) as string | null;
  },
  satisfies: (version: string, range: string) => {
    return _semver.satisfies(version, range) as boolean;
  }
}

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

enum Variables {
  SettingsClass = "Iu",
  SettingEnum = "R.A",
  KeybindEnum = "ge.A",
  SettingUIFunction = "Ns",
}

class PolyDBImpl implements PolyDB {
  #db: IDBDatabase | undefined;
  cacheMods: boolean = true;
  constructor(pml: PolyModLoader) {
    let settingList = JSON.parse(pml.localStorage?.getItem("polytrack_v5_prod_settings") || "[]") as unknown as Array<Array<string>>;

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
          window.localStorage.removeItem("polytrack_v5_beta_settings");
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
        this.saveMod(modSerialized.base, mod.modVersion || "", mod.manifest);
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
  async getMod(baseUrl: string): Promise<{ baseUrl: string, version: string, manifest: ModManifest, codeStr: Blob } | null> {
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
  async saveMod(baseUrl: string, version: string, manifest: ModManifest | undefined) {
    const localDb = await this.#getDb();
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

/**
 * Find the nth occurrence of a substring in a string
 * @param str string to search in
 * @param subStr string to search for
 * @param n nth occurrence of the string to find
 * @returns 
 */
function findNthOccurrence(str: string, subStr: string, n: number): number {
  let count = 0;
  let startIndex = 0;
  let index;

  while (count < n && (index = str.indexOf(subStr, startIndex)) !== -1) {
    count++;
    if (count === n) {
      return index;
    }
    // Start the next search from the position immediately after the current match
    startIndex = index + subStr.length;
  }

  // If the nth occurrence is not found, return -1
  return -1;
}

class PolyModLoaderImpl implements PolyModLoader {
  #polyVersion: string;
  #allMods: Array<PolyMod>;
  // @ts-ignore
  polyDb: PolyDB;

  #simWorkerMixins: {
    mixinArg: MixinArgs
  }[];
  #physicsMixins: {
    mixinArg: MixinArgs
  }[];
  #chunkMixins: {
    chunk: string,
    mixinArg: MixinArgs
  }[];

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
              // Create dialog
              /*               const dialog = document.createElement('dialog');
              
                            const message = document.createElement('p');
                            message.textContent = "You are playing on an outdated version of PolyModLoader.\n" + "Click \"ignore update\" to stay on this version or \"update\" to automatically update PML.";
              
                            const btnCancel = document.createElement('button');
                            btnCancel.textContent = 'update';
              
                            const btnConfirm = document.createElement('button');
                            btnConfirm.textContent = 'ignore update';
              
                            dialog.appendChild(message);
                            dialog.appendChild(btnCancel);
                            dialog.appendChild(btnConfirm);
                            document.body.appendChild(dialog);
              
                            // Callbacks
                            btnConfirm.addEventListener('click', async () => {
                              dialog.close();
                              try {
                                const res = await fetch('https://example.com/api', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ confirmed: true }),
                                });
                                const data = await res.json();
                                console.log(data);
                              } catch (err) {
                                console.error('Request failed:', err);
                              }
                            });
              
                            btnCancel.addEventListener('click', () => {
                              dialog.close();
                              console.log('cancelled');
                            });
              
                            dialog.showModal(); */
            }
          })
          .catch((err) => {
            console.error("[PML] Update check failed:", err);
          });
      }
    }, 0);


    this.#simWorkerMixins = [];
    this.#physicsMixins = [];
    this.#chunkMixins = [];

    this.#settings = [];
    this.#settingConstructor = [];
    this.#defaultSettings = [];
    this.#latestSetting = 23;

    this.#keybindings = []
    this.#defaultBinds = []
    this.#bindConstructor = []
    this.#latestBinding = 32;
  }
  get polyVersion(): string {
    return this.#polyVersion; // Why is this even private lmfao
  }
  localStorage: Storage | undefined;
  #polyModUrls: Array<{ base: string, version: string, loaded: boolean }> | undefined;
  initStorage(localStorage: Storage) {
    this.localStorage = localStorage;
    this.polyDb = new PolyDBImpl(this);
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
      latestP.innerText = `${currPartStr()} Fetching global manifest from ${current.url}/manifest.json`;

      progressDiv.appendChild(latestP);
      // @ts-ignore
      current.text = latestP;
    }
    function finishFetchLatest(version: string) {
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
    for (let polyModObject of this.#polyModUrls ?? []) {
      startImportMod(polyModObject.base, polyModObject.version);
      const dbMod = await this.polyDb.getMod(polyModObject.base);
      let latest = false;
      let importFromDB = false;
      current.totalParts = 2;
      let mainManifestFile: GlobalManifest;
      try {
        startFetchLatest();
        mainManifestFile = await fetch(`${polyModObject.base}/manifest.json`).then(r => r.json());
        if (polyModObject.version === "latest") {
          current.totalParts = 3;
          polyModObject.version = mainManifestFile["latest"][this.#polyVersion];
          latest = true;
        }
      } catch (err) {
        errorCurrent();
        importFromDB = this.polyDb.cacheMods && true;
        alert(`Couldn't find global manifest for ${polyModObject.base}`);
        console.error("Error in fetching global manifest json:", err);
        if (!dbMod)
          return alert(`Mod with URL ${polyModObject.base} failed to load and isn't in the cache.`);
        mainManifestFile = { ...dbMod.manifest, latest: { [this.#polyVersion]: dbMod.version } };
      }
      finishFetchLatest(polyModObject.version);
      if (this.polyDb.cacheMods && dbMod && polyModObject.version === dbMod.version) {
        console.log("Mod version in DB, skipping import")
        importFromDB = true;
      }
      const polyModUrl = `${polyModObject.base}/${polyModObject.version}`;
      startFetchManifest();
      try {
        let manifestFile: ModManifest;
        if (importFromDB && dbMod) {
          manifestFile = dbMod.manifest;
        } else {
          let versionFile: VersionManifest = await fetch(`${polyModUrl}/version.json`).then(r => r.json());
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

          let newMod: PolyMod = modImport.polyMod;
          if (this.getMod(manifestFile.id)) alert(`Duplicate mod detected: ${manifestFile.name}`);
          if (!this.#applyManifestToMod(newMod, manifestFile)) continue;
          newMod.manifest = manifestFile;
          newMod.offlineMode = importFromDB;
          newMod.baseUrl = polyModObject.base;
          newMod.savedLatest = latest;
          newMod.iconSrc = `${polyModUrl}/icon.png`;
          if (polyModObject.loaded) {
            newMod.setLoaded = true;
          }
          this.#allMods.push(newMod);
        } catch (err) {
          errorCurrent();
          alert(`Mod ${manifestFile.name} failed to load.`);
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

  async loadModsFromLauncher() {
    // @ts-ignore
    const port = typeof window.electron !== "undefined"
      // @ts-ignore
      ? window.electron?.getHelperPort()
      : null;

    if (!port) return;

    const res = await fetch(`http://localhost:${port}/mods`);
    const modUrls: string[] = await res.json();

    for (const url of modUrls) {
      await this.addMod({ base: url, version: "latest", loaded: true }, false);
    }
  }
  #applyManifestToMod = (mod: PolyMod, manifest: ModManifest) => {
    mod.modName = manifest.name;
    mod.modID = manifest.id;
    mod.modAuthor = manifest.author;

    const version = semver.valid(manifest.version);
    if (version === undefined || version === null) {
      console.warn(`Mod ${manifest.name} has invalid version string: ${manifest.version}`);
      alert(`Mod ${manifest.name} has invalid version string: ${manifest.version}. This mod will not be imported. Please contact the mod author to fix this issue.`);
      return false;
    }
    mod.modVersion = version;

    mod.polyVersion = manifest.targets;
    mod.assetFolder = "assets";
    mod.modDependencies = manifest.dependencies;
    for (let dependency of mod.modDependencies) {
      if (!semver.valid(dependency.version)) {
        console.warn(`Mod ${manifest.name} has invalid dependency version string: ${dependency.version} for dependency ${dependency.id}`);
        alert(`Mod ${manifest.name} has invalid dependency version string: ${dependency.version} for dependency ${dependency.id}. This may cause issues with mod loading and compatibility. Please contact the mod author to fix this issue.`);
      }
    }

    return true;
  }
  getPolyModsStorage(): { base: string; version: string; loaded: boolean; }[] | undefined {
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
  serializeMod(mod: PolyMod): { base: string; version: string; loaded: boolean; } {
    return { "base": mod.baseUrl ? mod.baseUrl : "", "version": mod.savedLatest ? "latest" : mod.modVersion ? mod.modVersion : "latest", "loaded": mod.isLoaded || false };
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
    if (mod.modID === "pmlcore") {
      return;
    }
    const currentIndex = this.#allMods.indexOf(mod);
    if ((currentIndex === 0) && delta > 0) return;
    if (!currentIndex || currentIndex === -1) {
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
    try {
      const manifestFile: GlobalManifest = await fetch(`${polyModObject.base}/manifest.json`).then(r => r.json());
      let latest = false;
      if (polyModObject.version === "latest") {
        polyModObject.version = manifestFile["latest"][this.#polyVersion];
        if (autoUpdate) {
          latest = true;
        }
        if (polyModObject.version === "latest" || !polyModObject.version)
          alert(`Mod with URL ${polyModObject.base} does not have a version which supports PolyTrack v${this.#polyVersion}.`);
      }
      const polyModUrl = `${polyModObject.base}/${polyModObject.version}`;
      const versionFile: VersionManifest = await fetch(`${polyModUrl}/version.json`).then(r => r.json());


      const mod: ModManifest = { ...manifestFile, ...versionFile, version: polyModObject.version };
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
        let newMod: PolyMod = modImport.polyMod;
        newMod.iconSrc = `${polyModUrl}/icon.png`;
        mod.version = polyModObject.version;
        this.#applyManifestToMod(newMod, mod);
        newMod.manifest = mod;
        newMod.baseUrl = polyModObject.base;
        newMod.loaded = polyModObject.loaded;
        newMod.savedLatest = latest;
        this.#allMods.push(newMod);
        console.log(mod);
        this.saveModsToLocalStorage();
        return this.getMod(newMod.modID as string);
      } catch (err) {
        alert("Something went wrong importing this mod!");
        console.error("Error in importing mod:", err);
        return;
      }
    } catch (err) {
      alert(`Couldn't find mod manifest or version json for "${polyModObject.base}".`);
      console.error("Error in getting mod manifest:", err);
    }
  }
  registerSettingCategory(name: string) {
    this.#settings.push(`(0, C.gn)(this, ms, "m", Ds).call(
              this,
              gs.getFromLanguage((0, C.gn)(this, Cs, "f"), "${name}"),
            ),`);
  }
  registerBindCategory(name: string) {
    this.#keybindings.push(`(0, C.gn)(this, ms, "m", Bs).call(
              this,
              gs.getFromLanguage((0, C.gn)(this, Cs, "f"), "${name}"),
            ),`);
  }
  registerSetting(name: string, id: string, type: SettingType, defaultOption: any, optionsOptional?: Array<{ title: string, value: string }>) {
    this.#latestSetting++
    this.#settingConstructor.push(`${Variables.SettingEnum}[${Variables.SettingEnum}.${id} = ${this.#latestSetting}] = "${id}";`);
    if (type === "boolean") {
      this.#defaultSettings.push(`[${Variables.SettingEnum}.${id}, "${defaultOption === true ? "true" : "false"}"],`)
      this.#settings.push(`(0, C.gn)(this, ms, "m", Gs).call(
              this,
              gs.getFromLanguage((0, C.gn)(this, Cs, "f"), "${name}"),
              [
                {
                  title: gs.getFromLanguage((0, C.gn)(this, Cs, "f"), "Off"),
                  value: "false",
                },
                {
                  title: gs.getFromLanguage((0, C.gn)(this, Cs, "f"), "On"),
                  value: "true",
                },
              ],
              ${Variables.SettingEnum}.${id},
            ),`)
    } else if (type === "slider") {
      this.#defaultSettings.push(`[${Variables.SettingEnum}.${id}, "${defaultOption}"],`)
      this.#settings.push(`(0, C.gn)(this, ms, "m", Fs).call(
              this,
              gs.getFromLanguage((0, C.gn)(this, Cs, "f"), "${name}"),
              ${Variables.SettingEnum}.${id},
            ),`)
    } else if (type === "custom") {
      this.#defaultSettings.push(`[${Variables.SettingEnum}.${id}, "${defaultOption}"],`)
      this.#settings.push(`(0, C.gn)(this, ms, "m", Gs).call(
              this,
              gs.getFromLanguage((0, C.gn)(this, Cs, "f"), "${name}"),
              ${JSON.stringify(optionsOptional)},
              ${Variables.SettingEnum}.${id},
            ),`)
    }
  }
  settingClass: any;
  registerKeybind(name: string, id: string, event: string, defaultBind: string, secondBindOptional: string | null, callback: Function) {
    this.#latestBinding++;
    this.#keybindings.push(`(0, C.gn)(this, ms, "m", Os).call(
              this,
              gs.getFromLanguage(
                (0, C.gn)(this, Cs, "f"),
                "${name}",
              ),
              ${Variables.KeybindEnum}.${id},
            ),`)
    this.#bindConstructor.push(`${Variables.KeybindEnum}[${Variables.KeybindEnum}.${id} = ${this.#latestBinding}] = "${id}";`);
    this.#defaultBinds.push(`[${Variables.KeybindEnum}.${id}, ["${defaultBind}", ${secondBindOptional ? `"${secondBindOptional}"` : "null"}]],`);
    window.addEventListener(event, (e) => {
      if (this.settingClass.checkKeyBinding(e, this.getFromPolyTrack(`${Variables.KeybindEnum}.${id}`))) {
        callback(e)
      }
    });
  }
  #applySettings() {
    this.getFromPolyTrack(`${this.#settingConstructor.join("")}`)
    this.registerClassMixin(`${Variables.SettingsClass}.prototype`, "defaultSettings",
      {
        type: MixinType.INSERT,
        token: `() {`,
        func: `ActivePolyModLoader.settingClass = this;`
      });
    console.log(this.#defaultSettings.join(""))
    this.registerClassMixin(`${Variables.SettingsClass}.prototype`, "defaultSettings", { type: MixinType.INSERT, token: `return new Map([`, func: this.#defaultSettings.join("") })
    this.registerFuncMixin(Variables.SettingUIFunction, {
      type: MixinType.INSERT,
      token: { token: `),`, occ: 179 },
      func: `${this.#settings.join("")}`
    })
  }

  #applyKeybinds() {
    this.registerClassMixin(`${Variables.SettingsClass}.prototype`, "defaultKeyBindings", { type: MixinType.INSERT, token: `() {`, func: `${this.#bindConstructor.join("")};` })
    this.registerClassMixin(`${Variables.SettingsClass}.prototype`, "defaultKeyBindings", { type: MixinType.INSERT, token: `return new Map([`, func: this.#defaultBinds.join("") })
    this.registerFuncMixin(Variables.SettingUIFunction, { type: MixinType.REPLACEBETWEEN, tokenStart: `));`, tokenEnd: `));`, func: `),${this.#keybindings.join("")}null);` });
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
    if (mod.modID === "pmlcore") {
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
    if (mod.modID === "pmlcore") {
      return;
    }
    mod.loaded = state;
    this.saveModsToLocalStorage();
  }
  popUpClass: any;
  #preInitPML() {
    this.registerFuncMixin("Kc", {
      type: MixinType.INSERT, token: `(0, C.gn)(this, Mc, "f").appendChild(n));`, func: `
            const text = document.createElement("a");
            text.href = "https://polymodloader.com";
            text.target = "_blank";
            text.textContent = "polymodloader.com - " + e.get("Version") + " " + "${this.#pmlVersion}";
            (0, C.gn)(this, Mc, "f").appendChild(text);
        `})
    this.registerClassMixin("Dl.prototype", "joinInvite", { type: MixinType.REPLACEBETWEEN, tokenStart: `mods: [],`, tokenEnd: `mods: [],`, func: `mods: ActivePolyModLoader.getAllMods().filter(m => m.isLoaded).map(m => \`\${m.modID}:\${m.modVersion}\`),` })
    this.registerClassMixin("Dl.prototype", "joinInvite", { type: MixinType.REPLACEBETWEEN, tokenStart: `isModsVanillaCompatible: !0,`, tokenEnd: `isModsVanillaCompatible: !0,`, func: `isModsVanillaCompatible: ActivePolyModLoader.isVanillaCompatible(),` })

    this.registerClassMixin("Fn.prototype", "createInvite", { type: MixinType.REPLACEBETWEEN, tokenStart: `mods: [],`, tokenEnd: `mods: [],`, func: `mods: ActivePolyModLoader.getAllMods().filter(m => m.isLoaded).map(m => \`\${m.modID}:\${m.modVersion}\`),` })
    this.registerClassMixin("Fn.prototype", "createInvite", { type: MixinType.REPLACEBETWEEN, tokenStart: `isModsVanillaCompatible: !0,`, tokenEnd: `isModsVanillaCompatible: !0,`, func: `isModsVanillaCompatible: ActivePolyModLoader.isVanillaCompatible(),` })

    // register PML settings
    this.registerSettingCategory("PolyModLoader");
    this.registerSetting("Cache mods (requires reload)", "pmlCacheMods", SettingType.BOOL, true);
    this.registerSetting("Debug Mode (Reload TWICE to apply)", "debugmode", SettingType.BOOL, false);
    this.registerSetting("Clear polyMods", "clearmods", SettingType.BOOL, false);
    this.registerSimWorkerMixin({type: MixinType.INSERT, token: `case Ki.TestDeterminism: {`, func: `console.log("SIM WORKER TESTING DETERMINISM");console.log(t);`})
    this.registerSimWorkerMixin({
      type: MixinType.REPLACEBETWEEN,
      tokenStart: `"lib/polytrack_physics.js"`,
      tokenEnd: `"lib/polytrack_physics.js"`,
      func: `"${this.getPhysicsLibURL()}"`
    })
  }
  #prePreInitPML() {
    // mixin stuff in here now
    this.registerGlobalMixin({
      type: MixinType.INSERT,
      token: `(f.insertStyleElement = h()));`,
      func: `ActivePolyModLoader.getFromPolyTrack = (path) => {
                  return eval(path);
                };`
    });
    this.registerGlobalMixin({
      type: MixinType.REPLACEBETWEEN,
      tokenStart: `((_.ppV.enabled = !1),`,
      tokenEnd: { token: `})());`, occ: 2 },
      func: `(_.ppV.enabled = !1);
        let polyInitFunction = (async function () {
          await (async function () {
            const e = Uint8Array.from(
                atob(
                  "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",
                ),
                (e) => e.charCodeAt(0),
              ),
              t = await WebAssembly.compile(e),
              n = (await WebAssembly.instantiate(t)).exports;
            Math = {
              E: U,
              LN10: z,
              LN2: N,
              LOG2E: D,
              LOG10E: B,
              PI: G,
              SQRT1_2: F,
              SQRT2: O,
              abs: Math.abs,
              acos: n.acos,
              asin: n.asin,
              atan: n.atan,
              atan2: n.atan2,
              ceil: Math.ceil,
              cos: H,
              exp: n.exp,
              floor: Math.floor,
              log: n.log,
              max: Math.max,
              min: Math.min,
              pow: n.pow,
              random: Math.random,
              round: Math.round,
              sin: V,
              sqrt: n.sqrt,
              tan: n.tan,
              clz32: Math.clz32,
              imul: Math.imul,
              sign: Math.sign,
              log10: n.log10,
              log2: n.log2,
              log1p: Math.log1p,
              expm1: Math.expm1,
              cosh: Math.cosh,
              sinh: Math.sinh,
              tanh: Math.tanh,
              acosh: Math.acosh,
              asinh: Math.asinh,
              atanh: Math.atanh,
              hypot: Math.hypot,
              trunc: Math.trunc,
              cbrt: Math.cbrt,
              fround: Math.fround,
              [Symbol.toStringTag]: "Math",
            };
          })();
          const e = new cu();
          (await e.initialize(), e.migrate());
          const t = new Nh(),
            n = new Bf(e, t),
            r = new Iu(e);
          (t.addResource(),
            P.n_().then(() => {
              t.loadedResource();
            }),
            t.addCompleteListener(() => {
              if ((S.cleanUpRecords(), P.R_(), window.electron)) {
                const e = window.electron.getArgv(),
                  t = "-verifier_token=",
                  n = e.find((e) => e.startsWith(t));
                if (null != n) {
                  const e = n.substring(t.length);
                  K(e);
                }
              }
            }));
          const a = i(7780);
          for (const e of a.keys()) t.preloadImage("images/" + e.substring(2));
          const s = new bu(),
            o = new kd(s),
            l = new I(t, r);
          (l.load("music", ["audio/music.ogg", "audio/music.mp3"]),
            l.load("click", ["audio/click.ogg", "audio/click.mp3"]),
            l.load("engine", ["audio/engine.ogg", "audio/engine.mp3"]),
            l.load("suspension", [
              "audio/suspension.ogg",
              "audio/suspension.mp3",
            ]),
            l.load("tires", ["audio/tires.ogg", "audio/tires.mp3"]),
            l.load("collision", ["audio/collision.ogg", "audio/collision.mp3"]),
            l.load("skidding", ["audio/skidding.ogg", "audio/skidding.mp3"]),
            l.load("editor_edit", [
              "audio/editor_edit.ogg",
              "audio/editor_edit.mp3",
            ]),
            l.load("checkpoint", [
              "audio/checkpoint.ogg",
              "audio/checkpoint.mp3",
            ]),
            l.load("record", ["audio/record.ogg", "audio/record.mp3"]),
            l.load("position_tick", [
              "audio/position_tick.ogg",
              "audio/position_tick.mp3",
            ]),
            Kh.A.initResources(t));
          const c = document.getElementById("screen");
          if (!(c instanceof HTMLCanvasElement))
            throw new Error("Screen is not a canvas element");
          const h = new At.A(c, r),
            d = new vd(),
            u = d.init(h, t),
            p = new Lu.A(!0, d, t),
            f = new Lu.A(!1, d, t),
            g = p.testDeterminism();
          (t.addResource(),
            t.addResource(),
            t.addResource(),
            L.A.initResources().then((e) => {
              (t.loadedResource(),
                u.then((n) => {
                  (t.loadedResource(),
                    g.then((i) => {
                      ((x.determinismState = i
                        ? n && e
                          ? Js.Ok
                          : Js.AssetsFailed
                        : Js.TestFailed),
                        t.loadedResource());
                    }));
                }));
            }));
          const m = new Cd(h, r, t),
            A = new ns.A(h),
            v = new gi.A(h, r, d),
            y = new sd(t, e),
            b = new gs(r.getSetting(R.A.Language)),
            w = new su.A(e),
            x = new Tu();
          w.syncUserProfile(x);
          const S = new qh(e, y, x, w),
            k = new te(),
            E = new Ph(l),
            T = new Lf(),
            M = (i, a) => {
              o.trigger(() => {
                (P.bQ(),
                  P.pS(),
                  Q.dispose(),
                  (Q = new gh(
                    p,
                    v,
                    A,
                    m,
                    y,
                    b,
                    E,
                    w,
                    S,
                    h,
                    l,
                    e,
                    n,
                    r,
                    x,
                    t,
                    i,
                    a,
                    _,
                    C,
                    W,
                    j,
                    K,
                    q,
                  )),
                  P.PM());
              });
            },
            _ = () => {
              o.trigger(async () => {
                (P.bQ(), P.pS());
                try {
                  const { default: t } = await i.e(280).then(i.bind(i, 3280));
                  (await t.initResources(),
                    Q.dispose(),
                    (Q = new t(b, v, A, m, h, l, w, r, x, E, e, () => {
                      M(!1, null);
                    })),
                    P.PM());
                } catch (i) {
                  console.error("Failed to load customization state: ", i);
                  const a =
                    b.get("Failed to load garage.") +
                    "\\n\\n" +
                    b.get("Check your internet connection and try again.");
                  (Q.dispose(),
                    (Q = new gh(
                      p,
                      v,
                      A,
                      m,
                      y,
                      b,
                      E,
                      w,
                      S,
                      h,
                      l,
                      e,
                      n,
                      r,
                      x,
                      t,
                      !1,
                      a,
                      _,
                      C,
                      W,
                      j,
                      K,
                      q,
                    )),
                    P.PM());
                }
              });
            },
            C = () => {
              o.trigger(async () => {
                try {
                  await P.RN("start-editor");
                } finally {
                  P.pS();
                  try {
                    const { default: a } = await i.e(124).then(i.bind(i, 4124));
                    (await a.initResources(), Q.dispose());
                    const c = (Q = new a(
                      v,
                      d,
                      e,
                      A,
                      m,
                      b,
                      l,
                      h,
                      r,
                      o,
                      w,
                      S,
                      y,
                      E,
                      T,
                      () => {
                        (P.bQ(),
                          P.pS(),
                          Q.dispose(),
                          (Q = new gh(
                            p,
                            v,
                            A,
                            m,
                            y,
                            b,
                            E,
                            w,
                            S,
                            h,
                            l,
                            e,
                            n,
                            r,
                            x,
                            t,
                            !1,
                            null,
                            _,
                            C,
                            W,
                            j,
                            K,
                            q,
                          )),
                          P.PM());
                      },
                      (t, n, i) => {
                        const a = (Q = new ts(
                          p,
                          f,
                          v,
                          A,
                          m,
                          b,
                          h,
                          l,
                          w,
                          S,
                          e,
                          r,
                          s,
                          E,
                          T,
                          y,
                          t,
                          n,
                          "custom",
                          [],
                          null,
                          null,
                          !1,
                          () => {
                            throw new Error(
                              "Multiplayer connection lost should never be called from the editor",
                            );
                          },
                          () => {
                            (P.tU(), a.dispose(!1), (Q = c), i());
                          },
                          null,
                          null,
                          () => {
                            throw new Error(
                              "Multiplayer new session should never be called from the editor",
                            );
                          },
                        ));
                      },
                    ));
                    (P.PM(), P.tU());
                  } catch (i) {
                    console.error("Failed to load editor state: ", i);
                    const a =
                      b.get("Failed to load editor.") +
                      "\\n\\n" +
                      b.get("Check your internet connection and try again.");
                    (Q.dispose(),
                      (Q = new gh(
                        p,
                        v,
                        A,
                        m,
                        y,
                        b,
                        E,
                        w,
                        S,
                        h,
                        l,
                        e,
                        n,
                        r,
                        x,
                        t,
                        !1,
                        a,
                        _,
                        C,
                        W,
                        j,
                        K,
                        q,
                      )),
                      P.PM());
                  }
                }
              });
            },
            W = (t, n, i, a, c) => {
              o.trigger(() =>
                P.RN("start-game").finally(() => {
                  let o, d;
                  (P.pS(),
                    Q instanceof ts &&
                    null != c &&
                    Q.multiplayerConnection == c.multiplayerConnection
                      ? Q.dispose(!0, !1)
                      : Q.dispose(),
                    (o =
                      "official" == i && null == c
                        ? y.getNextOfficialTrack(n)
                        : null),
                    (d =
                      null != o
                        ? () => {
                            let e;
                            const t = S.getRecord(w.profileSlot, o.id);
                            if (null != t) {
                              const n = w.getCurrentUserProfile();
                              e = [
                                {
                                  recording: t.recording,
                                  carStyle: n.carStyle,
                                  nickname: n.nickname,
                                  time: t.time,
                                  isSelf: !0,
                                },
                              ];
                            } else e = [];
                            W(
                              o.trackMetadata,
                              o.trackData,
                              o.trackCategory,
                              e,
                              null,
                            );
                          }
                        : null));
                  const u = "official" == i || "community" == i,
                    g = w.profileSlot,
                    k = S.getRecord(g, n.getId());
                  let _;
                  ((_ =
                    null != k
                      ? {
                          time: k.time,
                          position: x
                            .getLeaderboardUserEntry(
                              w.getCurrentUserProfile().tokenHash,
                              n.getId(),
                              u,
                            )
                            .then((e) =>
                              null != e && e.id == k.uploadId
                                ? e.position
                                : null,
                            )
                            .catch((e) => (console.warn(e), null)),
                          recording: k.recording,
                        }
                      : null),
                    (Q = new ts(
                      p,
                      f,
                      v,
                      A,
                      m,
                      b,
                      h,
                      l,
                      w,
                      S,
                      e,
                      r,
                      s,
                      E,
                      T,
                      y,
                      t,
                      n,
                      i,
                      a,
                      _,
                      c,
                      !0,
                      (e) => {
                        let t;
                        switch (e) {
                          case "kicked":
                            t = b.get("You were kicked from the game");
                            break;
                          case "disconnected":
                            t = b.get("Lost connection to server");
                        }
                        M(!1, t);
                      },
                      () => {
                        M(null == c, null);
                      },
                      j,
                      d,
                      (e, t, n, i) => {
                        if (null == c)
                          throw new Error(
                            "Tried to start new multiplayer session without a multiplayer connection",
                          );
                        W(n, i, "custom", [], {
                          multiplayerConnection: c.multiplayerConnection,
                          sessionId: e,
                          gameMode: t,
                        });
                      },
                    )),
                    P.PM());
                }),
              );
            },
            j = (e, t, n, i) => {
              o.trigger(() => {
                (P.pS(),
                  Q.dispose(),
                  (Q = new Rf(
                    f,
                    v,
                    e,
                    t,
                    n,
                    A,
                    m,
                    h,
                    l,
                    b,
                    r,
                    i,
                    (e, t, n, i) => {
                      W(e, t, n, i, null);
                    },
                  )),
                  P.PM(),
                  P.tU());
              });
            },
            K = (a) => {
              o.trigger(async () => {
                P.pS();
                try {
                  const { default: e } = await i.e(142).then(i.bind(i, 5142));
                  (Q.dispose(),
                    (Q = new e(l, h, x, w, y, d, t, a, () => {
                      M(!1, null);
                    })),
                    P.PM(),
                    P.tU());
                } catch (i) {
                  (console.error("Failed to load verifier state: ", i),
                    Q.dispose(),
                    (Q = new gh(
                      p,
                      v,
                      A,
                      m,
                      y,
                      b,
                      E,
                      w,
                      S,
                      h,
                      l,
                      e,
                      n,
                      r,
                      x,
                      t,
                      !1,
                      null,
                      _,
                      C,
                      W,
                      j,
                      K,
                      q,
                    )),
                    P.PM());
                }
              });
            },
            q = (a) => {
              o.trigger(async () => {
                P.pS();
                try {
                  const { default: e } = await i.e(982).then(i.bind(i, 9982));
                  (Q.dispose(),
                    (Q = new e(l, h, E, y, x, a, () => {
                      M(!1, null);
                    })),
                    P.PM(),
                    P.tU());
                } catch (i) {
                  (console.error("Failed to load admin state: ", i),
                    Q.dispose(),
                    (Q = new gh(
                      p,
                      v,
                      A,
                      m,
                      y,
                      b,
                      E,
                      w,
                      S,
                      h,
                      l,
                      e,
                      n,
                      r,
                      x,
                      t,
                      !1,
                      null,
                      _,
                      C,
                      W,
                      j,
                      K,
                      q,
                    )),
                    P.PM());
                }
              });
            };
          let Q = new gh(
              p,
              v,
              A,
              m,
              y,
              b,
              E,
              w,
              S,
              h,
              l,
              e,
              n,
              r,
              x,
              t,
              !1,
              null,
              _,
              C,
              W,
              j,
              K,
              q,
            ),
            J = 0;
          (h.setAnimationLoop(function (e) {
            const t = Math.max(e - J, 0) / 1e3;
            ((J = e), Q.update(t), k.update(t));
          }),
            window.addEventListener("keyup", (e) => {
              r.checkKeyBinding(e, ge.A.ToggleFpsCounter) && k.toggle();
            }));
            ActivePolyModLoader.postInitMods();
        });ActivePolyModLoader.initMods();polyInitFunction();`})

    this.registerGlobalMixin({ type: MixinType.INSERT, token: `(0, C.GG)(this, Ic, null, "f"));`, func: `;ActivePolyModLoader.gameLoad();` })
    this.registerGlobalMixin({
      type: MixinType.INSERT, token: `(i.l = (t, n, r, a) => {`, func: `
      let newUrl = ActivePolyModLoader.applyChunkMixin(t);
      if(newUrl) {
        console.log("chunk mixin:", newUrl);
        return i.l(newUrl, n, r, a);
      };
      `})
    this.registerGlobalMixin({
        type: MixinType.REPLACEBETWEEN,
        tokenStart: `"simulation_worker.bundle.js"`,
        tokenEnd: `"simulation_worker.bundle.js"`,
        func: `ActivePolyModLoader.getSimURL()`
      })
    this.registerPhysicsLibMixin({
      type: MixinType.REPLACEBETWEEN,
      tokenStart: `"polytrack_physics.wasm"`,
      tokenEnd: `"polytrack_physics.wasm"`,
      func: `"${this.getPhysicsWasmURL()}"`
    });
    this.registerChunkMixin("124.bundle.js", {
      type: MixinType.INSERT,
      token: `enable() {`,
      func: `console.log("hi");`
    })
  }
  initMods() {
    this.#preInitPML();

    let initList: Array<string> = []
    for (let polyMod of this.#allMods) {
      if (polyMod.modID && polyMod.isLoaded)
        initList.push(polyMod.modID);
    }
    let allModsInit = false;
    if (initList.length === 0) allModsInit = true; // no mods to initialize lol
    while (!allModsInit) {
      let currentMod: PolyMod | undefined = this.getMod(initList[0]);
      if (!currentMod)
        continue;
      console.log(initList[0]);
      let initCheck = true;
      for (let dependency of currentMod.modDependencies || []) {
        let curDependency = this.getMod(dependency.id)
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
        } catch (err) {
          alert(`Mod ${currentMod.modName} failed to initialize and will be unloaded.`);
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
          alert(`Mod ${polyMod.modName} failed to post initialize and will be unloaded.`);
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
          alert(`Mod ${polyMod.modName} failed on game load and will be unloaded.`);
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
          alert(`Mod ${polyMod.modName} failed on pre init and will be unloaded.`);
          console.error("Error on pre init for mod:", err);
          this.setModLoaded(polyMod, false);
        }
      }
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
      if (polyMod.modID == id) return polyMod;
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
  get simWorkerMixins() {
    return [...this.#simWorkerMixins];
  }
  get pmlVersion() {
    return this.#pmlVersion;
  }
  isVanillaCompatible(): boolean {
    for (let polyMod of this.#allMods) {
      if (polyMod.isLoaded && polyMod.touchingPhysics === true) {
        return false;
      }
    }
    return true;
  }
  getFromPolyTrack = (path: string): any => { }
  getFromPolyTrackGlobal = (path: string): any => { }
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
  registerClassMixin(scope: string, path: string, mixinArg: MixinArgs) {
    let originalFunc = this.getFromPolyTrack(scope)[path];

    const mixinType = mixinArg.type;
    let token;
    let tokenStart;
    let tokenEnd;
    let func;

    switch (mixinType) {
      case MixinType.INSERT:
        token = mixinArg.token;
        func = mixinArg.func;

        const funcStr = originalFunc.toString();
        const tokenIndex = typeof token === 'string' ? funcStr.indexOf(token) : findNthOccurrence(funcStr, token.token, token.occ);
        if (tokenIndex === -1) {
          throw new Error(
            `Token "${token}" not found in function "${path}".`
          );
        }

        let injectedCode =
          typeof func == "function"
            ? func
              .toString()
              .replace(/^.*?{([\s\S]*)}$/, "$1")
              .trim()
            : func;

        let newFuncStr =
          funcStr.slice(0, tokenIndex + (typeof token === 'string' ? token.length : token.token.length)) +
          injectedCode +
          funcStr.slice(tokenIndex + (typeof token === 'string' ? token.length : token.token.length));

        const match1 = newFuncStr.match(
          /^\s*(async\s+)?([\w$]+)\s*\(([^)]*)\)\s*{([\s\S]*)}$/
        );
        if (!match1) {
          console.error("No match found in function!")
        }
        else if (match1[1] === "async ") {
          this.getFromPolyTrack(`eval("${scope}")["${path}"] = (async function(${match1[3]}) {${match1[4]}});`);
        } else {
          const args1 = match1[3].trim();
          const body1 = match1[4].trim();
          this.getFromPolyTrack(`eval("${scope}")["${path}"] = (function(${args1}) {${body1}});;`);
        }
        break;
      case MixinType.REMOVEBETWEEN:
        tokenStart = mixinArg.tokenStart;
        tokenEnd = mixinArg.tokenEnd;

        const funcStr2 = originalFunc.toString();
        const firstTokenIndex = typeof tokenStart === 'string' ? funcStr2.indexOf(tokenStart) : findNthOccurrence(funcStr2, tokenStart.token, tokenStart.occ);
        const secondTokenIndex = typeof tokenEnd === 'string' ? funcStr2.indexOf(tokenEnd) : findNthOccurrence(funcStr2, tokenEnd.token, tokenEnd.occ);
        if (firstTokenIndex === -1) {
          throw new Error(
            `Token "${tokenStart}" not found in function "${path}".`
          );
        }
        if (secondTokenIndex === -1) {
          throw new Error(
            `Token "${tokenEnd}" not found in function "${path}".`
          );
        }

        let newFuncStr2 = funcStr2
          .split(
            funcStr2.substring(
              firstTokenIndex,
              secondTokenIndex + (typeof tokenEnd === 'string' ? tokenEnd.length : tokenEnd.token.length)
            )
          )
          .join("");
        const match2 = newFuncStr2.match(
          /^\s*(async\s+)?([\w$]+)\s*\(([^)]*)\)\s*{([\s\S]*)}$/
        );

        if (match2[1] === "async ") {
          this.getFromPolyTrack(`eval("${scope}")["${path}"] = (async function(${match2[3]}) {${match2[4]}})`);
        } else {
          const args2 = match2[3].trim();
          const body2 = match2[4].trim();
          this.getFromPolyTrack(`eval("${scope}")["${path}"] = (function(${args2}) {${body2}})`);
        }
        break;
      case MixinType.REPLACEBETWEEN:
        tokenStart = mixinArg.tokenStart;
        tokenEnd = mixinArg.tokenEnd;
        func = mixinArg.func;

        const funcStr3 = originalFunc.toString();
        const firstTokenIndex1 = typeof tokenStart === 'string' ? funcStr3.indexOf(tokenStart) : findNthOccurrence(funcStr3, tokenStart.token, tokenStart.occ);
        const secondTokenIndex1 = typeof tokenEnd === 'string' ? funcStr3.indexOf(tokenEnd) : findNthOccurrence(funcStr3, tokenEnd.token, tokenEnd.occ);
        if (firstTokenIndex1 === -1) {
          throw new Error(
            `Token "${tokenStart}" not found in function "${path}".`
          );
        }
        if (secondTokenIndex1 === -1) {
          throw new Error(
            `Token "${tokenEnd}" not found in function "${path}".`
          );
        }
        let injectedCode2 =
          typeof func == "function"
            ? func
              .toString()
              .replace(/^.*?{([\s\S]*)}$/, "$1")
              .trim()
            : func;

        let newFuncStr3 = funcStr3
          .split(
            funcStr3.substring(
              firstTokenIndex1,
              secondTokenIndex1 + (typeof tokenEnd === 'string' ? tokenEnd.length : tokenEnd.token.length)
            )
          )
          .join(injectedCode2);

        const match = newFuncStr3.match(
          /^\s*(async\s+)?([\w$]+)\s*\(([^)]*)\)\s*{([\s\S]*)}$/
        );
        if (match[1] === "async ") {
          this.getFromPolyTrack(`eval("${scope}")["${path}"] = (async function(${match[3]}) {${match[4]}})`);
        } else {
          const args = match[3].trim();
          const body = match[4].trim();
          this.getFromPolyTrack(`eval("${scope}")["${path}"] = (function(${args}) {${body}})`);
        }
        break;
    }
  };
  /**
   * Inject mixin with target function name defined by {@link path}.
   * This only injects functions in `main.bundle.js`.
   * 
   * @param {string} path         - The path of the function which the mixin targets.
   * @param {MixinType} mixinType - The type of injection.
   * @param {string[]} accessors  - A list of strings to evaluate to access private variables.
   * @param {function} func       - The new function to be injected.
   */
  registerFuncMixin(path: string, mixinArg: MixinArgs) {
    var originalFunc = this.getFromPolyTrack(path);

    const mixinType = mixinArg.type;
    let token;
    let tokenStart;
    let tokenEnd;
    let func;

    switch (mixinType) {
      case MixinType.INSERT:
        ({ token, func } = mixinArg);

        const funcStr = originalFunc.toString();

        const tokenIndex = typeof token === 'string' ? funcStr.indexOf(token) : findNthOccurrence(funcStr, token.token, token.occ);
        if (tokenIndex === -1) {
          console.log(tokenIndex);
          throw new Error(
            `Token "${token}" not found in function "${path}".`
          );
        }

        const injectedCode =
          typeof func === "function"
            ? func
              .toString()
              .replace(/^.*?{([\\s\\S]*)}$/, "$1")
              .trim()
            : func;

        const newFuncStr =
          funcStr.slice(0, tokenIndex + (typeof token === 'string' ? token.length : token.token.length)) +
          injectedCode +
          funcStr.slice(tokenIndex + (typeof token === 'string' ? token.length : token.token.length));

        this.getFromPolyTrack(`${path} = (${newFuncStr});`);
        break;
      case MixinType.REMOVEBETWEEN:
        ({ tokenStart, tokenEnd } = mixinArg);

        const funcStr2 = originalFunc.toString();
        const firstTokenIndex = typeof tokenStart === 'string' ? funcStr2.indexOf(tokenStart) : findNthOccurrence(funcStr2, tokenStart.token, tokenStart.occ);
        const secondTokenIndex = typeof tokenEnd === 'string' ? funcStr2.indexOf(tokenEnd) : findNthOccurrence(funcStr2, tokenEnd.token, tokenEnd.occ);;
        if (firstTokenIndex === -1) {
          throw new Error(
            `Token "${tokenStart}" not found in function "${path}".`
          );
        }
        if (secondTokenIndex === -1) {
          throw new Error(
            `Token "${tokenEnd}" not found in function "${path}".`
          );
        }

        let newFuncStr2 = funcStr2
          .split(
            funcStr2.substring(
              firstTokenIndex,
              secondTokenIndex + (typeof tokenEnd === 'string' ? tokenEnd.length : tokenEnd.token.length)
            )
          )
          .join("");
        this.getFromPolyTrack(`${path} = (${newFuncStr2});`);
        break;
      case MixinType.REPLACEBETWEEN:
        ({ tokenStart, tokenEnd, func } = mixinArg);

        const funcStr3 = originalFunc.toString();

        const firstTokenIndex1 = typeof tokenStart === 'string' ? funcStr3.indexOf(tokenStart) : findNthOccurrence(funcStr3, tokenStart.token, tokenStart.occ);
        const secondTokenIndex1 = typeof tokenEnd === 'string' ? funcStr3.indexOf(tokenEnd) : findNthOccurrence(funcStr3, tokenEnd.token, tokenEnd.occ);
        if (firstTokenIndex1 === -1) {
          throw new Error(
            `Token "${tokenStart}" not found in function "${path}".`
          );
        }
        if (secondTokenIndex1 === -1) {
          throw new Error(
            `Token "${tokenEnd}" not found in function "${path}".`
          );
        }
        let injectedCode2 = null;
        if (typeof func === "function") {
          injectedCode2 = func.toString();
          injectedCode2 = injectedCode2
            .replace(/^.*?{([\\s\\S]*)}$/, "$1")
            .trim();
        } else {
          injectedCode2 = func;
        }

        let newFuncStr3 = funcStr3
          .split(
            funcStr3.substring(
              firstTokenIndex1,
              secondTokenIndex1 + (typeof tokenEnd === 'string' ? tokenEnd.length : tokenEnd.token.length)
            )
          )
          .join(injectedCode2);
        this.getFromPolyTrack(`${path} = (${newFuncStr3});`);
        break;
    }
  };
  registerClassWideMixin(path: string, mixinArg: MixinArgs) {
    let originalClassStr = this.getFromPolyTrack(path).toString();
    let newClassStr = originalClassStr;

    const mixinType = mixinArg.type;
    let token;
    let tokenStart;
    let tokenEnd;
    let func;

    switch (mixinType) {
      case MixinType.INSERT:
        token = mixinArg.token;
        func = mixinArg.func;
        const tokenIndex = typeof token === 'string' ? originalClassStr.indexOf(token) : findNthOccurrence(originalClassStr, token.token, token.occ);
        if (tokenIndex === -1) {
          throw new Error(
            `Token "${token}" not found in class "${path}".`
          );
        }

        const injectedCode = func
          .toString()
          .replace(/^.*?{([\s\S]*)}$/, "$1")
          .trim();

        newClassStr.slice(0, tokenIndex + (typeof token === 'string' ? token.length : token.token.length)) +
          injectedCode +
          newClassStr.slice(tokenIndex + (typeof token === 'string' ? token.length : token.token.length));
        break;
      case MixinType.REMOVEBETWEEN:
        tokenStart = mixinArg.tokenStart;
        tokenEnd = mixinArg.tokenEnd;

        const firstTokenIndex = typeof tokenStart === 'string' ? originalClassStr.indexOf(tokenStart) : findNthOccurrence(originalClassStr, tokenStart.token, tokenStart.occ);
        const secondTokenIndex = typeof tokenEnd === 'string' ? originalClassStr.indexOf(tokenEnd) : findNthOccurrence(originalClassStr, tokenEnd.token, tokenEnd.occ);
        if (firstTokenIndex === -1) {
          throw new Error(
            `Token "${tokenStart}" not found in function "${path}".`
          );
        }
        if (secondTokenIndex === -1) {
          throw new Error(
            `Token "${tokenEnd}" not found in function "${path}".`
          );
        }

        newClassStr = originalClassStr
          .split(
            originalClassStr.substring(
              firstTokenIndex,
              secondTokenIndex + (typeof tokenEnd === 'string' ? tokenEnd.length : tokenEnd.token.length)
            )
          )
          .join("");
        break;
      case MixinType.REPLACEBETWEEN:
        tokenStart = mixinArg.tokenStart;
        tokenEnd = mixinArg.tokenEnd;
        func = mixinArg.func;

        const firstTokenIndex1 = typeof tokenStart === 'string' ? originalClassStr.indexOf(tokenStart) : findNthOccurrence(originalClassStr, tokenStart.token, tokenStart.occ);
        const secondTokenIndex1 = typeof tokenEnd === 'string' ? originalClassStr.indexOf(tokenEnd) : findNthOccurrence(originalClassStr, tokenEnd.token, tokenEnd.occ);
        if (firstTokenIndex1 === -1) {
          throw new Error(
            `Token "${tokenStart}" not found in function "${path}".`
          );
        }
        if (secondTokenIndex1 === -1) {
          throw new Error(
            `Token "${tokenEnd}" not found in function "${path}".`
          );
        }
        let injectedCode2 = null;
        if (typeof func === "function") {
          injectedCode2 = func.toString();
          injectedCode2 = injectedCode2
            .replace(/^.*?{([\s\S]*)}$/, "$1")
            .trim();
        } else {
          injectedCode2 = func;
        }
        newClassStr = originalClassStr
          .split(
            originalClassStr.substring(
              firstTokenIndex1,
              secondTokenIndex1 + (typeof tokenEnd === 'string' ? tokenEnd.length : tokenEnd.token.length)
            )
          )
          .join(injectedCode2);
    }
    this.getFromPolyTrack(`${path} = ${newClassStr}`);
  }

  registerPhysicsLibMixin(mixinArg: MixinArgs): void {
    this.#physicsMixins.push({mixinArg})
  }

  registerSimWorkerMixin(mixinArg: MixinArgs) {
    this.#simWorkerMixins.push({ mixinArg })
  }

  getPhysicsLibURL(): string {
    const mixins = this.#physicsMixins
    let originalPhysicsString: string | undefined;
    let req = new XMLHttpRequest();
    req.open("GET", "lib/polytrack_physics.js", false);
    req.send();
    originalPhysicsString = req.responseText
    for (let mixin of mixins) {
      const mixinArg = mixin.mixinArg;

      const mixinType = mixinArg.type;
      let token;
      let tokenStart;
      let tokenEnd;
      let func;

      switch (mixinType) {
        case MixinType.INSERT:
          ({ token, func } = mixinArg);
          if(!originalPhysicsString) {
            console.error("Error fetching physics lib file.")
            return "lib/polytrack_physics.js";
          }
          const funcStr:string = originalPhysicsString;

          const tokenIndex = typeof token === 'string' ? funcStr.indexOf(token) : findNthOccurrence(funcStr, token.token, token.occ);
          if (tokenIndex === -1) {
            console.log(tokenIndex);
            throw new Error(
              `Token "${token}" not found in physics lib file.`
            );
          }

          const injectedCode =
            typeof func === "function"
              ? func
                .toString()
                .replace(/^.*?{([\s\S]*)}$/, "$1")
                .trim()
              : func;

          const newFuncStr =
            funcStr.slice(0, tokenIndex + (typeof token === 'string' ? token.length : token.token.length)) +
            injectedCode +
            funcStr.slice(tokenIndex + (typeof token === 'string' ? token.length : token.token.length));

          originalPhysicsString = newFuncStr;
          break;
        case MixinType.REMOVEBETWEEN:
          ({ tokenStart, tokenEnd } = mixinArg);

          if(!originalPhysicsString) {
            console.error("Error fetching simulation worker.")
            return "lib/polytrack_physics.js";
          }
          const funcStr2: string = originalPhysicsString;
          const firstTokenIndex = typeof tokenStart === 'string' ? funcStr2.indexOf(tokenStart) : findNthOccurrence(funcStr2, tokenStart.token, tokenStart.occ);
          const secondTokenIndex = typeof tokenEnd === 'string' ? funcStr2.indexOf(tokenEnd) : findNthOccurrence(funcStr2, tokenEnd.token, tokenEnd.occ);

          if (firstTokenIndex === -1) {
            throw new Error(
              `Token "${tokenStart}" not found in physics lib file.`
            );
          }
          if (secondTokenIndex === -1) {
            throw new Error(
              `Token "${tokenEnd}" not found in physics lib file.`
            );
          }

          let newFuncStr2 = funcStr2
            .split(
              funcStr2.substring(
                firstTokenIndex,
                secondTokenIndex + (typeof tokenEnd === 'string' ? tokenEnd.length : tokenEnd.token.length)
              )
            )
            .join("");
          originalPhysicsString = newFuncStr2;
          break;
        case MixinType.REPLACEBETWEEN:
          ({ tokenStart, tokenEnd, func } = mixinArg);

          if(!originalPhysicsString) {
            console.error("Error fetching physics lib file.")
            return "lib/polytrack_physics.js";
          }
          const funcStr3:string = originalPhysicsString;

          const firstTokenIndex1 = typeof tokenStart === 'string' ? funcStr3.indexOf(tokenStart) : findNthOccurrence(funcStr3, tokenStart.token, tokenStart.occ);
          const secondTokenIndex1 = typeof tokenEnd === 'string' ? funcStr3.indexOf(tokenEnd) : findNthOccurrence(funcStr3, tokenEnd.token, tokenEnd.occ);

          if (firstTokenIndex1 === -1) {
            throw new Error(
              `Token "${tokenStart}" not found in physics lib file.`
            );
          }
          if (secondTokenIndex1 === -1) {
            throw new Error(
              `Token "${tokenEnd}" not found in physics lib file.`
            );
          }
          let injectedCode2 = null;
          if (typeof func === "function") {
            injectedCode2 = func.toString();
            injectedCode2 = injectedCode2
              .replace(/^.*?{([\s\S]*)}$/, "$1")
              .trim();
          } else {
            injectedCode2 = func;
          }

          let newFuncStr3 = funcStr3
            .split(
              funcStr3.substring(
                firstTokenIndex1,
                secondTokenIndex1 + (typeof tokenEnd === 'string' ? tokenEnd.length : tokenEnd.token.length)
              )
            )
            .join(injectedCode2);
          originalPhysicsString = newFuncStr3;
          break;
      }
    }
    if (!originalPhysicsString) return "lib/polytrack_physics.js";
    return URL.createObjectURL(new Blob([originalPhysicsString]));
  }

getPhysicsWasmURL(): string {
  const req = new XMLHttpRequest();
  req.overrideMimeType("text/plain; charset=x-user-defined");
  req.open("GET", "polytrack_physics.wasm", false);
  req.send();

  if (!req.response) return "polytrack_physics.wasm";

  const raw = req.response as string;
  const wasmData = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    wasmData[i] = raw.charCodeAt(i) & 0xff; // mask to get raw byte value
  }

  console.log(`WASM state: ${WebAssembly.validate(wasmData)}`);

  return URL.createObjectURL(new Blob([wasmData], { type: "application/wasm" }));
}

  getSimURL(): string {
    const mixins = this.#simWorkerMixins
    let originalSimString: string | undefined;
    let req = new XMLHttpRequest();
    req.open("GET", "simulation_worker.bundle.js", false);
    req.send();
    originalSimString = req.responseText
    for (let mixin of mixins) {
      const mixinArg = mixin.mixinArg;

      const mixinType = mixinArg.type;
      let token;
      let tokenStart;
      let tokenEnd;
      let func;

      switch (mixinType) {
        case MixinType.INSERT:
          ({ token, func } = mixinArg);
          if(!originalSimString) {
            console.error("Error fetching simulation worker.")
            return "simulation_worker.bundle.js";
          }
          const funcStr:string = originalSimString;

          const tokenIndex = typeof token === 'string' ? funcStr.indexOf(token) : findNthOccurrence(funcStr, token.token, token.occ);
          if (tokenIndex === -1) {
            console.log(tokenIndex);
            throw new Error(
              `Token "${token}" not found in simulation bundle.`
            );
          }

          const injectedCode =
            typeof func === "function"
              ? func
                .toString()
                .replace(/^.*?{([\s\S]*)}$/, "$1")
                .trim()
              : func;

          const newFuncStr =
            funcStr.slice(0, tokenIndex + (typeof token === 'string' ? token.length : token.token.length)) +
            injectedCode +
            funcStr.slice(tokenIndex + (typeof token === 'string' ? token.length : token.token.length));

          originalSimString = newFuncStr;
          break;
        case MixinType.REMOVEBETWEEN:
          ({ tokenStart, tokenEnd } = mixinArg);

          if(!originalSimString) {
            console.error("Error fetching simulation worker.")
            return "simulation_worker.bundle.js";
          }
          const funcStr2: string = originalSimString;
          const firstTokenIndex = typeof tokenStart === 'string' ? funcStr2.indexOf(tokenStart) : findNthOccurrence(funcStr2, tokenStart.token, tokenStart.occ);
          const secondTokenIndex = typeof tokenEnd === 'string' ? funcStr2.indexOf(tokenEnd) : findNthOccurrence(funcStr2, tokenEnd.token, tokenEnd.occ);

          if (firstTokenIndex === -1) {
            throw new Error(
              `Token "${tokenStart}" not found in simulation bundle.`
            );
          }
          if (secondTokenIndex === -1) {
            throw new Error(
              `Token "${tokenEnd}" not found in simulation bundle.`
            );
          }

          let newFuncStr2 = funcStr2
            .split(
              funcStr2.substring(
                firstTokenIndex,
                secondTokenIndex + (typeof tokenEnd === 'string' ? tokenEnd.length : tokenEnd.token.length)
              )
            )
            .join("");
          originalSimString = newFuncStr2;
          break;
        case MixinType.REPLACEBETWEEN:
          ({ tokenStart, tokenEnd, func } = mixinArg);

          if(!originalSimString) {
            console.error("Error fetching simulation worker.")
            return "simulation_worker.bundle.js";
          }
          const funcStr3:string = originalSimString;

          const firstTokenIndex1 = typeof tokenStart === 'string' ? funcStr3.indexOf(tokenStart) : findNthOccurrence(funcStr3, tokenStart.token, tokenStart.occ);
          const secondTokenIndex1 = typeof tokenEnd === 'string' ? funcStr3.indexOf(tokenEnd) : findNthOccurrence(funcStr3, tokenEnd.token, tokenEnd.occ);

          if (firstTokenIndex1 === -1) {
            throw new Error(
              `Token "${tokenStart}" not found in simulation bundle.`
            );
          }
          if (secondTokenIndex1 === -1) {
            throw new Error(
              `Token "${tokenEnd}" not found in simulation bundle.`
            );
          }
          let injectedCode2 = null;
          if (typeof func === "function") {
            injectedCode2 = func.toString();
            injectedCode2 = injectedCode2
              .replace(/^.*?{([\s\S]*)}$/, "$1")
              .trim();
          } else {
            injectedCode2 = func;
          }

          let newFuncStr3 = funcStr3
            .split(
              funcStr3.substring(
                firstTokenIndex1,
                secondTokenIndex1 + (typeof tokenEnd === 'string' ? tokenEnd.length : tokenEnd.token.length)
              )
            )
            .join(injectedCode2);
          originalSimString = newFuncStr3;
          break;
      }
    }
    if (!originalSimString) return "simulation_worker.bundle.js";
    return URL.createObjectURL(new Blob([originalSimString]));
  }

  registerGlobalMixin(mixinArg: MixinArgs): void {
    let path = "globalFunc";
    var originalFunc: Function = this.getFromPolyTrackGlobal(path);


    const mixinType = mixinArg.type;
    let token;
    let tokenStart;
    let tokenEnd;
    let func;

    switch (mixinType) {
      case MixinType.INSERT:
        ({ token, func } = mixinArg);
        const funcStr = originalFunc.toString();

        const tokenIndex = typeof token === 'string' ? funcStr.indexOf(token) : findNthOccurrence(funcStr, token.token, token.occ);
        if (tokenIndex === -1) {
          console.log(tokenIndex);
          throw new Error(
            `Token "${token}" not found in function "${path}".`
          );
        }

        const injectedCode =
          typeof func === "function"
            ? func
              .toString()
              .replace(/^.*?{([\s\S]*)}$/, "$1")
              .trim()
            : func;

        const newFuncStr =
          funcStr.slice(0, tokenIndex + (typeof token === 'string' ? token.length : token.token.length)) +
          injectedCode +
          funcStr.slice(tokenIndex + (typeof token === 'string' ? token.length : token.token.length));

        this.newFunc = this.getFromPolyTrackGlobal(`(${newFuncStr})`);
        break;
      case MixinType.REMOVEBETWEEN:
        ({ tokenStart, tokenEnd } = mixinArg);

        const funcStr2 = originalFunc.toString();
        const firstTokenIndex = typeof tokenStart === 'string' ? funcStr2.indexOf(tokenStart) : findNthOccurrence(funcStr2, tokenStart.token, tokenStart.occ);
        const secondTokenIndex = typeof tokenEnd === 'string' ? funcStr2.indexOf(tokenEnd) : findNthOccurrence(funcStr2, tokenEnd.token, tokenEnd.occ);

        if (firstTokenIndex === -1) {
          throw new Error(
            `Token "${tokenStart}" not found in function "${path}".`
          );
        }
        if (secondTokenIndex === -1) {
          throw new Error(
            `Token "${tokenEnd}" not found in function "${path}".`
          );
        }

        let newFuncStr2 = funcStr2
          .split(
            funcStr2.substring(
              firstTokenIndex,
              secondTokenIndex + (typeof tokenEnd === 'string' ? tokenEnd.length : tokenEnd.token.length)
            )
          )
          .join("");
        this.newFunc = this.getFromPolyTrackGlobal(`(${newFuncStr2})`);
        break;
      case MixinType.REPLACEBETWEEN:
        ({ tokenStart, tokenEnd, func } = mixinArg);

        const funcStr3 = originalFunc.toString();

        const firstTokenIndex1 = typeof tokenStart === 'string' ? funcStr3.indexOf(tokenStart) : findNthOccurrence(funcStr3, tokenStart.token, tokenStart.occ);
        const secondTokenIndex1 = typeof tokenEnd === 'string' ? funcStr3.indexOf(tokenEnd) : findNthOccurrence(funcStr3, tokenEnd.token, tokenEnd.occ);

        if (firstTokenIndex1 === -1) {
          throw new Error(
            `Token "${tokenStart}" not found in function "${path}".`
          );
        }
        if (secondTokenIndex1 === -1) {
          throw new Error(
            `Token "${tokenEnd}" not found in function "${path}".`
          );
        }
        let injectedCode2 = null;
        if (typeof func === "function") {
          injectedCode2 = func.toString();
          injectedCode2 = injectedCode2
            .replace(/^.*?{([\s\S]*)}$/, "$1")
            .trim();
        } else {
          injectedCode2 = func;
        }

        let newFuncStr3 = funcStr3
          .split(
            funcStr3.substring(
              firstTokenIndex1,
              secondTokenIndex1 + (typeof tokenEnd === 'string' ? tokenEnd.length : tokenEnd.token.length)
            )
          )
          .join(injectedCode2);
        this.newFunc = this.getFromPolyTrackGlobal(`(${newFuncStr3})`);
        break;
    }
    this.getFromPolyTrackGlobal(`${path} = ActivePolyModLoader.newFunc;`);
  };
  registerChunkMixin(bundleName: string, mixinArg: MixinArgs) {
    this.#chunkMixins.push({ chunk: bundleName, mixinArg })
  }
  applyChunkMixin(url: string): string | undefined {
    const mixins = this.#chunkMixins.filter(e => url.includes(e.chunk));
    let originalChunkString: string | undefined;
    for (let mixin of mixins) {
      if (url.indexOf(mixin.chunk) === -1) continue;
      const mixinArg = mixin.mixinArg;

      let req = new XMLHttpRequest();
      req.open("GET", url, false);
      req.send();
      originalChunkString = req.responseText

      const mixinType = mixinArg.type;
      let token;
      let tokenStart;
      let tokenEnd;
      let func;

      switch (mixinType) {
        case MixinType.INSERT:
          ({ token, func } = mixinArg);
          const funcStr = originalChunkString;

          const tokenIndex = typeof token === 'string' ? funcStr.indexOf(token) : findNthOccurrence(funcStr, token.token, token.occ);
          if (tokenIndex === -1) {
            console.log(tokenIndex);
            throw new Error(
              `Token "${token}" not found in bundle "${url}".`
            );
          }

          const injectedCode =
            typeof func === "function"
              ? func
                .toString()
                .replace(/^.*?{([\s\S]*)}$/, "$1")
                .trim()
              : func;

          const newFuncStr =
            funcStr.slice(0, tokenIndex + (typeof token === 'string' ? token.length : token.token.length)) +
            injectedCode +
            funcStr.slice(tokenIndex + (typeof token === 'string' ? token.length : token.token.length));

          originalChunkString = newFuncStr;
          break;
        case MixinType.REMOVEBETWEEN:
          ({ tokenStart, tokenEnd } = mixinArg);

          const funcStr2 = originalChunkString;
          const firstTokenIndex = typeof tokenStart === 'string' ? funcStr2.indexOf(tokenStart) : findNthOccurrence(funcStr2, tokenStart.token, tokenStart.occ);
          const secondTokenIndex = typeof tokenEnd === 'string' ? funcStr2.indexOf(tokenEnd) : findNthOccurrence(funcStr2, tokenEnd.token, tokenEnd.occ);

          if (firstTokenIndex === -1) {
            throw new Error(
              `Token "${tokenStart}" not found in bundle "${url}".`
            );
          }
          if (secondTokenIndex === -1) {
            throw new Error(
              `Token "${tokenEnd}" not found in bundle "${url}".`
            );
          }

          let newFuncStr2 = funcStr2
            .split(
              funcStr2.substring(
                firstTokenIndex,
                secondTokenIndex + (typeof tokenEnd === 'string' ? tokenEnd.length : tokenEnd.token.length)
              )
            )
            .join("");
          originalChunkString = newFuncStr2;
          break;
        case MixinType.REPLACEBETWEEN:
          ({ tokenStart, tokenEnd, func } = mixinArg);

          const funcStr3 = originalChunkString;

          const firstTokenIndex1 = typeof tokenStart === 'string' ? funcStr3.indexOf(tokenStart) : findNthOccurrence(funcStr3, tokenStart.token, tokenStart.occ);
          const secondTokenIndex1 = typeof tokenEnd === 'string' ? funcStr3.indexOf(tokenEnd) : findNthOccurrence(funcStr3, tokenEnd.token, tokenEnd.occ);

          if (firstTokenIndex1 === -1) {
            throw new Error(
              `Token "${tokenStart}" not found in bundle "${url}".`
            );
          }
          if (secondTokenIndex1 === -1) {
            throw new Error(
              `Token "${tokenEnd}" not found in bundle "${url}".`
            );
          }
          let injectedCode2 = null;
          if (typeof func === "function") {
            injectedCode2 = func.toString();
            injectedCode2 = injectedCode2
              .replace(/^.*?{([\s\S]*)}$/, "$1")
              .trim();
          } else {
            injectedCode2 = func;
          }

          let newFuncStr3 = funcStr3
            .split(
              funcStr3.substring(
                firstTokenIndex1,
                secondTokenIndex1 + (typeof tokenEnd === 'string' ? tokenEnd.length : tokenEnd.token.length)
              )
            )
            .join(injectedCode2);
          originalChunkString = newFuncStr3;
          break;
      }
    }
    if (!originalChunkString) return;
    return URL.createObjectURL(new Blob([originalChunkString]));
  }
}
// @ts-ignore
const ActivePolyModLoader = new PolyModLoaderImpl("0.6.0", window.pmlversion);

// @ts-ignore
window.polytrackModConfiguration = {
  modName: "PolyModLoader",
  author: "The PolyModLoader Team"
}


export { ActivePolyModLoader }
