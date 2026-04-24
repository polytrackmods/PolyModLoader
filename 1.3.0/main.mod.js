import {
  PolyMod,
  MixinType,
} from "https://cdn.polymodloader.com/cb/polytrackmods/PolyModLoader/0.6.0/PolyTypes.js";


class PolyLibrary {
    soundInst;
    apml;
    initMod = function() {
        const uistyle = document.createElement("style");
        uistyle.textContent = `
        .mod-library {
            position: absolute;
            top: 0;
            left: 0;
            background-color: #28346a;
            width: 200px;
            height: 100px;
            align-content: center;
            text-align: center;
            pointer-events: auto;
            z-index: 1;
        }
        
        .library-open-button {
            cursor: pointer;
            background: #112052;
            color: white;
            border: none;
            height: 40px;
            width: 180px;
            margin: 10px;
            clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
        }
        .library-open-text {
            color: white;
            font-size: 25px;
            margin: 0;
            padding: 0;
        }
        .library-div {
            color: white;
            height: 100%;
            width: 1000px;
            position: absolute;
            left: calc(50% - 1000px / 2);
            background: #28346a;
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
        }
        .top-text {
            margin: 10px 10px 0 10px;
            padding: 0;
            font-weight: normal;
            font-size: 50px;
            text-align: center;
            color: white;
        }
        .tag-div {
            background: #212b58;
            width: 960px;
            height: 50px;
            white-space: nowrap;
            position: relative;
            overflow-x: scroll;
            overflow-y: hidden;
            scrollbar-width: none;
            color: white;
            align-items: center;
            padding: 20px;
            gap: 30px;
            display: flex;
            flex-direction: row;
            pointer-events: auto;
        }
        .library-back-button {
            margin: 10px;
            padding: 10px 20px;
            float: left;
        }
        .library-refr-button {
            margin: 10px;
            padding: 10px 20px;
            float: right;
        }
        .library-list {
            margin: 0;
            padding: 0;
            flex: 1;
            background-color: #212b58;
            overflow-x: hidden;
            overflow-y: scroll;
            pointer-events: auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            color: white;
            text-align: center;
        }
        button.tag-box {
            height: 100%;
            width: 100px;
            clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
            display: flex;
            align-items: center;
            background: #112052;
            justify-content: center;
            padding: 0 80px;
        }
        .mini-tag {
            padding: 0 20px;
            height: 20px;
            width: 50px;
            clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
            display: flex;
            align-items: center;
            background: #28346a;
            justify-content: center;
            margin: 10px 0px 20px 20px;
            font-size: 20px;
        }
        .library-entry {
            display: flex;
            height: 180px;
            width: 925px;
            background: #112052;
            flex-shrink: 0;
            color: white;
            align-items: center;
        }
        .library-text-holder {
            padding: 20px;
            text-align: left;
            margin-bottom: auto;
            align-items: end;
        }
        button.tag-box.select-tag {
            background: #334b77;
        }
        .mod-top {
            color: white;
            display: flex;
            gap: 20px;
            padding: 30px
        }
        .library-add-button {
            height: 60px;
            margin-left: auto;
            width: 175px;
        }
        .tab-div {
            background: #212b58;
            height: 100px;
            width: 100%;
            display: flex;
            flex-direction: row;
            gap: 150px;
            justify-content: center;
            font-size: 30px;
            align-items: center;
        }
        .und-select {
            text-decoration: underline;
        }
        .tab-hidden {
            display: none !important;
        }
        .changelog-list {
            flex: 1;
            display: flex;
            flex-direction: column-reverse;
            align-items: center;
            padding: 20px;
            gap: 40px;
            overflow-y: scroll;
            pointer-events: auto;
        }
        .changelog-entry {
            background: #212b58;
            width: 100%;
            display: flex;
            flex-direction: column;
        }
        .versions-list {
            overflow-y: scroll;
            pointer-events: auto;
            display: flex;
            flex-direction: column;
            gap: 20px;
            padding: 20px;
            flex: 1;
        }
        .versions-entry {
            background: #212b58;
            width: 100%;
            display: flex;
            flex-direction: row;
        }
        .desc-box {
            font-size: 20px;
            margin-left: auto;
            width: 280px;
            overflow: hidden;
            height: 120px;
        }
        .desc-text {
            margin: 0;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        `;
        
        document.head.appendChild(uistyle);

        this.tagButtons = [];
        this.iconMap;
    }
    menuUI = function() {
        const uiDiv = document.getElementById("ui");
        if (!uiDiv) return;
        
        const baseDiv = document.createElement("div");
        baseDiv.className = "mod-library";
        baseDiv.id = "poly-library"
        
        uiDiv.appendChild(baseDiv);
        
        const libraryOpenText = document.createElement("p");
        libraryOpenText.className = "library-open-text";
        libraryOpenText.textContent = "Mod Library";
        
        baseDiv.appendChild(libraryOpenText);
            
        const libraryOpenButton = document.createElement("button");
        libraryOpenButton.className = "library-open-button button"
        libraryOpenButton.textContent = "Open";  
        libraryOpenButton.onclick = () => {
            document.getElementsByClassName("track-info-ui")[0].remove();
            this.libraryUI(uiDiv)
            baseDiv.remove();
        };
        
        baseDiv.appendChild(libraryOpenButton);
    }
    libraryUI = async function(uiDiv) {
        this.fullModList = await this.getModList();
        
        const baseDiv = document.createElement("div");
        baseDiv.className = "library-div";
        baseDiv.id = "library-div";

        uiDiv.appendChild(baseDiv);

        const topText = document.createElement("h2");
        topText.textContent = "Mod Library";
        topText.className = "top-text";

        baseDiv.appendChild(topText);

        this.tagDiv = document.createElement("div");
        this.tagDiv.className = "tag-div";
        this.tagDiv.addEventListener('wheel', (e) => {
            if (e.deltaY !== 0) {
                e.preventDefault();
                this.tagDiv.scrollLeft += e.deltaY;
            }
        }, { passive: false });

        baseDiv.appendChild(this.tagDiv);

        this.listDiv = document.createElement("div");
        this.listDiv.className = "library-list"

        baseDiv.appendChild(this.listDiv);

        const bottomDiv = document.createElement("div");
        bottomDiv.className = "bottom-bar";
        bottomDiv.style.marginTop = "auto";
        bottomDiv.style.padding = "10px";

        baseDiv.appendChild(bottomDiv)
        
        const backButton = document.createElement("button");
        backButton.className =  "library-back-button button";
        backButton.innerHTML = `<img src="images/back.svg"> Back`;
        backButton.onclick = () => {
            baseDiv.remove();
            this.apml.getMod("pmlcore").createModScreen(this.soundInst);
            this.menuUI();
        };

        bottomDiv.appendChild(backButton);

        const refreshButton = document.createElement("button");
        refreshButton.className =  "library-refr-button button";
        refreshButton.innerHTML = `<img src="images/redo.svg"> Refresh`;
        refreshButton.onclick = async () => {
            this.listDiv.innerHTML = '';
            this.tagDiv.innerHTML = ''

            this.loader = document.createElement("p");
            this.loader.textContent = "Loading Library...";
            this.loader.id = "library-load";
    
            this.listDiv.appendChild(this.loader);

            this.getModInfo(this.fullModList, true);
        };

        bottomDiv.appendChild(refreshButton);

        this.loader = document.createElement("p");
        this.loader.textContent = "Loading Library...";
        this.loader.id = "library-load";

        this.listDiv.appendChild(this.loader);

        this.getModInfo(this.fullModList);
    };
    createTagBar = function(tagList) {
        this.loader.remove(this.loader);
        
        const allTagBox = document.createElement("button");
        allTagBox.textContent = "All";
        allTagBox.className = "tag-box button select-tag";
        allTagBox.id = "all"
        allTagBox.onclick = () => {
            allTagBox.classList.add("select-tag");
            for (const child of this.listDiv.children) {
                child.style.display = "flex";
            };
            this.tagButtons.forEach((button) => {
                button.id === "all" ? button.classList.add("select-tag") : button.classList.remove("select-tag");
            })
        };

        this.tagButtons.push(allTagBox);
        
        this.tagDiv.appendChild(allTagBox);
        
        for (const tag of tagList) {
            const tagBox = document.createElement("button");
            tagBox.textContent = tag;
            tagBox.className = "tag-box button";
            tagBox.id = tag;
            tagBox.onclick = () => {
                this.tagVisibility(tag, tagList);
            };

            this.tagDiv.appendChild(tagBox);

            this.tagButtons.push(tagBox);
        }
    };
    tagVisibility = function(curtag, allTags) {
       
        const index = allTags.indexOf(curtag);
        if (index === -1) return;
        const otherTags = allTags.slice(); 
        otherTags.splice(index, 1);
        otherTags.forEach((tag) => {
            const tagEntries = document.getElementsByClassName(tag);
            for (const element of tagEntries) {
                element.style.display = "none";
            };
        });

        const showtag = document.getElementsByClassName(curtag);
        for (const element of showtag) {
            element.style.display = "flex";
        };

        this.tagButtons.forEach((button) => {
            button.id === curtag ? button.classList.add("select-tag") : button.classList.remove("select-tag");
        })

    };
    createModEntry = function(modId, modName, modInfo, modLatest, icons) {
        const modAuthor = modInfo.author;
        let modIcon = icons[modId];
        const modVersions = modLatest.mods[modId].latest;
        const tags = modLatest.mods[modId].tags;
        const shortDesc = modLatest.mods[modId].shortDesc;

        const entry = document.createElement("button");
        if (!(this.gameVersion in modVersions)) {
            entry.style.opacity = "0.5";
            entry.disabled = true;
            entry.style.cursor = "not-allowed"
        }
        entry.className = `library-entry button ${tags.join(" ")}`;
        entry.onclick = () => {
            document.getElementById("library-div").style.display = "none";
            this.createModUI(modId, modLatest.mods[modId], modIcon, modName, modAuthor, tags);
        };

        this.listDiv.appendChild(entry)

        if (modIcon instanceof Node) {
            entry.appendChild(modIcon);
        } else {
            modIcon = document.createElement("img");
            modIcon.src = "./images/empty.svg";
            modIcon.style.height = "150px";

            entry.appendChild(modIcon);
        }

        const bigDiv = document.createElement("div");
        bigDiv.className = "content-div";
        bigDiv.style.textAlign = "left";

        entry.appendChild(bigDiv)

        const descDiv = document.createElement("div");
        descDiv.className = "desc-box";

        const descText = document.createElement("p");
        descText.className = "desc-text";
        descText.textContent = shortDesc;

        descDiv.appendChild(descText);

        entry.appendChild(descDiv);

        const textDiv = document.createElement("div");
        textDiv.className = "library-text-holder";

        bigDiv.appendChild(textDiv)

        const modNameLib = document.createElement("h2");
        modNameLib.textContent = modName;
        modNameLib.style.fontSize = "40px";
        modNameLib.style.margin = "0";
        modNameLib.style.textDecoration = "underline";
        modNameLib.style.fontStyle = "normal";

        textDiv.appendChild(modNameLib);

        const modAuthorLib = document.createElement("p");
        modAuthorLib.textContent = `By: ${modAuthor}`;
        modAuthorLib.style.fontSize = "20px";
        modAuthorLib.style.margin = "0";

        textDiv.appendChild(modAuthorLib);

        const versionsDiv = document.createElement("p");
        versionsDiv.textContent = Object.keys(modVersions).join(", ");
        versionsDiv.style.margin = "0";
        versionsDiv.style.padding = "20px 0px 0 30px";
        versionsDiv.style.fontSize = "20px";

        bigDiv.appendChild(versionsDiv);

        const modTags = document.createElement("div");
        modTags.style.display = "flex";
        modTags.style.flexDirection = "row";
        tags.forEach((tag) => {
            const tagBox = document.createElement("div");
            tagBox.textContent = tag;
            tagBox.className = "mini-tag";

            modTags.appendChild(tagBox);
        });

        bigDiv.appendChild(modTags);
    };
    createModUI = async function(modId, thisMod, icon, name, author, tags) {
        const baseDiv = document.createElement("div");
        baseDiv.className = "library-div";
        baseDiv.id = "mod-div";


        const topDiv = document.createElement("div");
        topDiv.className = "mod-top";

        baseDiv.appendChild(topDiv);

        topDiv.appendChild(icon.cloneNode(true));

        const textDiv = document.createElement("div");
        textDiv.className = "library-text-holder";

        topDiv.appendChild(textDiv)

        const modNameLib = document.createElement("h2");
        modNameLib.textContent = name;
        modNameLib.style.fontSize = "40px";
        modNameLib.style.margin = "0";
        modNameLib.style.textDecoration = "underline";
        modNameLib.style.fontStyle = "normal";
        modNameLib.style.whiteSpace = "nowrap";
        modNameLib.style.overflow = "hidden";
        modNameLib.style.textOverflow = "ellipsis";
        


        textDiv.appendChild(modNameLib);

        const modAuthorLib = document.createElement("p");
        modAuthorLib.textContent = `By: ${author}`;
        modAuthorLib.style.fontSize = "20px";
        modAuthorLib.style.margin = "0";

        textDiv.appendChild(modAuthorLib);

        const addButton = document.createElement("button");
        addButton.className =  "library-add-button button";
        addButton.style.marginLeft = "auto";
        addButton.innerHTML = `<img src="images/apply.svg"> Add`;
        addButton.onclick = async () => {await this.getDependencies(modId, thisMod.baseUrl, thisMod.latest[this.apml.polyVersion], true)};

        topDiv.appendChild(addButton);

        for (let polyMod of this.apml.getAllMods()) {
            console.log(polyMod);
        }
        
        if (this.apml.getMod(modId)) {
            addButton.disabled = true;
            addButton.style.cursor = "not-allowed"
        };

        const desc = document.createElement("div");
        desc.innerHTML = "Loading Description..."
        desc.style.flex = "1";
        desc.style.background = "#212b58";
        desc.style.marginTop = "40px";
        desc.style.overflowY = "scroll";
        desc.style.pointerEvents = "auto";
        desc.style.padding = "20px"

        this.changelog = document.createElement("div");
        this.changelog.className = "changelog-list tab-hidden";


        this.vers = document.createElement("div");
        this.vers.className = "versions-list tab-hidden"

        const tabsDiv = document.createElement("div");
        tabsDiv.className = "tab-div";

        baseDiv.appendChild(tabsDiv);

        const tab1 = document.createElement("button");
        tab1.style.background = "none";
        tab1.className = "button und-select";
        tab1.textContent = "Overview";
        tab1.onclick = () => {
            this.switchTab(tab1);
            desc.classList.remove("tab-hidden");
            this.changelog?.classList.add("tab-hidden");
            this.vers?.classList.add("tab-hidden");
        };

        const tab2 = document.createElement("button");
        tab2.style.background = "none";
        tab2.className = "button";
        tab2.textContent = "Changelog";
        tab2.onclick = () => {
            this.switchTab(tab2);
            if (!this.changelog.classList.contains("created")) {this.createChangelog(thisMod)};
            desc.classList.add("tab-hidden");
            this.changelog.classList.remove("tab-hidden");
            this.vers.classList.add("tab-hidden");
        };

        const tab3 = document.createElement("button");
        tab3.style.background = "none";
        tab3.className = "button";
        tab3.textContent = "Versions";
        tab3.onclick = () => {
            this.switchTab(tab3);
            if (!this.vers.classList.contains("created")) {this.createVersions(thisMod, modId)};
            desc.classList.add("tab-hidden");
            this.changelog?.classList.add("tab-hidden");
            this.vers?.classList.remove("tab-hidden");
        };

        tabsDiv.appendChild(tab1);
        tabsDiv.appendChild(tab2);
        tabsDiv.appendChild(tab3);

        baseDiv.appendChild(desc);
        baseDiv.appendChild(this.changelog);
        baseDiv.appendChild(this.vers);

        const bottomDiv = document.createElement("div");
        bottomDiv.className = "bottom-bar";
        bottomDiv.style.padding = "10px";
        bottomDiv.style.marginTop = "auto";

        baseDiv.appendChild(bottomDiv)
        
        const backButton = document.createElement("button");
        backButton.className =  "library-back-button button";
        backButton.innerHTML = `<img src="images/back.svg"> Back`;
        backButton.onclick = () => {
            baseDiv.remove();
            document.getElementById("library-div").style.display = "flex";
        };

        bottomDiv.appendChild(backButton);


        document.getElementById("ui").appendChild(baseDiv);

        const html = await this.getDescription(modId, thisMod);

        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        
        const styleTags = tempDiv.querySelectorAll("style");
        
        styleTags.forEach(styleTag => {
          styleTag.textContent = styleTag.textContent.replace(/font-family\s*:\s*[^;]+;?/gi, '');
        });
        
        desc.innerHTML = tempDiv.innerHTML;

    };
    confirmPopup = function(boxText, callbackCancel, callbackConfirm) {

        const dialog = document.createElement("DIALOG");
        dialog.className = "message-box confirm";

        const div = document.createElement("div");

        dialog.appendChild(div);

        const text = document.createElement("p");
        text.textContent = boxText;

        const cancel = document.createElement("button");
        cancel.className = "button";
        cancel.appendChild(document.createTextNode("Cancel"));
        cancel.addEventListener("click", async () => {
            dialog.remove();
            callbackCancel();
        });

        const confirm = document.createElement("button");
        confirm.className = "button";
        confirm.appendChild(document.createTextNode("Confirm"));
        confirm.addEventListener("click", async () => {
            dialog.remove();
            callbackConfirm();
        });
        
        div.appendChild(text);
        div.appendChild(cancel);
        div.appendChild(confirm);

        document.body.appendChild(dialog);
        dialog.show();
    }
    infoPopup = function(boxText="") {
        if (this.infoDialog) {
            this.infoDialog.remove();
            this.infoDialog = null;
            return;
        }

        this.infoDialog = document.createElement("DIALOG");
        this.infoDialog.className = "message-box confirm";

        const div = document.createElement("div");

        this.infoDialog.appendChild(div);

        const text = document.createElement("p");
        text.textContent = boxText;

        document.body.appendChild(this.infoDialog);
        this.infoDialog.show();
    }
    switchTab = function(tab) {
        document.getElementsByClassName("und-select")[0].classList.remove("und-select");
        tab.classList.add("und-select");
    };
    getIcons = function(mods) {
        if (this.iconMap) return this.iconMap;
        const polyVersion = this.gameVersion;
        this.iconMap = {};
    
        for (const [modId, modInfo] of Object.entries(mods)) {
            const latest = modInfo.latest;
            if (!latest) {
                console.warn(`No latest info for mod ${modId}`);
                continue;
            }
            let version = latest[polyVersion];
            if (!version) {
                console.warn(`No version found for polyVersion ${polyVersion} in mod ${modId}`);
                version = latest[Object.keys(latest)[Object.keys(latest).length - 1]];
            }
    
           
            const baseUrl = modInfo.baseUrl;
            const iconUrl = `${baseUrl}/${version}/icon.png`;
    
    
            const img = document.createElement("img");
            img.src = iconUrl;
            img.style.height = "150px";
    
            this.iconMap[modId] = img;
        }
    
        return this.iconMap;
    };
    getDependencies = async function(modId, modurl, modversion, autoUpd=false) {
        
        try {
            const resp = await fetch(modurl + "/" + modversion + "/version.json");
            if (!resp.ok) throw new Error(`Failed to fetch version manifest for ${mod.url}`);
            
            const data = await resp.json();
            
            if (Array.isArray(data.dependencies) && !(data.dependencies.length === 0)) {
                const confirm = async () => {
                    
                    document.getElementById("mod-div").remove();
                    document.getElementById("library-div").remove();

                    
                    data.dependencies.forEach(async (dep) => {
                        if (!this.apml.getMod(dep.id)) {
                            if (this.fullModList[dep.id]) {
                                await this.addMod(this.fullModList[dep.id].url, dep.version, autoUpd, modId);        
                            }
                        }
                        
                    });

                    await this.addMod(modurl, modversion, autoUpd, modId); 
                }

                const importing = [];
                const missing = [];
                
                importing.push(modId + "v" + modversion);
                
                for (const dep of data.dependencies) {
                    if (this.fullModList[dep.id]) {
                        importing.push(dep.id + "v" + dep.version);
                    } else {
                        missing.push(dep.id + "v" + dep.version);
                    }
                }
                
                let message = "";
                
                if (importing.length) {
                    message += `IMPORTING MODS:\n${importing.map(id => `- ${id}`).join("\n")}`;
                }
                
                if (missing.length) {
                    message += `\n\nMISSING MODS:\n${missing.map(id => `- ${id}`).join("\n")}`;
                }

                
                this.confirmPopup(message, () => {}, confirm)
            } else {
                document.getElementById("mod-div").remove();
                document.getElementById("library-div").remove();
                await this.addMod(modurl, modversion, autoUpd, modId);
            }
            
        } catch (error) {
            console.error("Fetch Error:", error.message);
        }  
    }
    getModHash = async function(url, version) {
        const response = await fetch(`${url}/${version}/main.mod.js`);

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`);
        }

        const buffer = await response.arrayBuffer();

        const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);

        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        return hashHex;
    }
    verifyModHash = async function(url, version, modId) {
        let result = false;

        const scriptHash = await this.getModHash(url, version);

        const response = await fetch("https://raw.githubusercontent.com/polytrackmods/PolyLibrary/refs/heads/main/mod_hashes.json");
        if (!response.ok) {
            console.warn(`Failed to fetch hash JSON`);
        };
        
        const data = await response.json();
        
        const serverHash = data[modId]?.[version];
        
        if (!serverHash) {
            console.warn(`Hash not found for ${modId} ${version}`);
        }
        
        if (serverHash === scriptHash) {
            result = true;
        }

        if (!result) {
            const userConfirm = await new Promise((resolve) => {
                this.confirmPopup(
                    "This mod has not been verified as safe yet. Are you sure you want to import it?",
                    () => resolve(false),
                    () => resolve(true)
                );
            });

            return userConfirm;
        } else {
            return true;
        };
        
    }
    addMod = async function(modurl, modversion, autoUpd, modId) {

        if (modversion === "latest") {
            console.warn("Requested to add mod version latest, which is not supported in the current PolyLibrary system.");
            return;
        };

        // Inadequate verification 
        // if (!await this.verifyModHash(modurl, modversion, modId)) {
        //     this.apml.getMod("pmlcore").createModScreen(this.soundInst);
        //     this.menuUI();
        //     return;
        // };

        if (modurl.endsWith('/')) {
            modurl = modurl.slice(0, -1);
        }
        
        this.apml.addMod({ base: modurl, version: modversion, loaded: true }, autoUpd)
        .then(mod => {
            this.apml.setModLoaded(mod, true);
            this.apml.getMod("pmlcore").createModScreen(this.soundInst);
            this.menuUI();
        })
        .catch(err => {
            console.error(`Failed to import ${modurl}:`, err);
        });
    };
    timeAgo = function(dateStr, modifierStr) {
        const now = new Date();
        const then = new Date(dateStr);
        const seconds = Math.floor((now - then) / 1000);
        const modifier = new String(modifierStr);
    
        const intervals = [
            { label: 'year',   seconds: 31536000 },
            { label: 'month',  seconds: 2592000 },
            { label: 'day',    seconds: 86400 },
            { label: 'hour',   seconds: 3600 },
            { label: 'minute', seconds: 60 }
        ];
    
        for (const i of intervals) {
            const count = Math.floor(seconds / i.seconds);
            if (count >= 1) {
                return `Modified ${count} ${i.label}${count !== 1 ? 's' : ''} ago by ${modifier}`;
            }
        }
    
        return 'Modified just now';
    }
    getHighestVersion = function(latest) {
        const versions = Object.values(latest);
        
        function compareVersions(a, b) {
        const aParts = a.split('.').map(Number);
        const bParts = b.split('.').map(Number);
        const len = Math.max(aParts.length, bParts.length);
        
        for (let i = 0; i < len; i++) {
            const aNum = aParts[i] || 0;
            const bNum = bParts[i] || 0;
            if (aNum > bNum) return 1;
            if (aNum < bNum) return -1;
        }
            return 0; // equal
        }
        
        return versions.reduce((maxVer, curVer) => {
            return compareVersions(curVer, maxVer) > 0 ? curVer : maxVer;
        }, "0.0.0");
    }
    fetchURLS = async function(mods) {
        const entries = Object.entries(mods);
        
        const results = await Promise.all(
            entries.map(async ([modId, mod]) => {
                let description = "No Description Found";
                let latest = null;
                let dependencies = [];
                
                try {
                    const latestResp = await fetch(mod.url + "/manifest.json");
                    if (!latestResp.ok) throw new Error(`Failed to fetch ${mod.url}/manifest.json`);
                    const globalManifest = await latestResp.json();
                    latest = globalManifest["latest"];
                } catch (error) {
                    console.error("Fetch Error:", error.message);
                }
                
                try {
                    const polyResp = await fetch(mod.url + "/polylib.json");
                    if (!polyResp.ok) throw new Error(`Failed to fetch ${mod.url}/polylib.json`);
                    const descjson = await polyResp.json();
                    description = descjson.shortdesc ?? description;
                } catch (error) {
                    console.log("Couldn't find polylibrary file in mod:" + mod.name);
                }
                
                return [modId, {
                    latest,
                    shortDesc: description,
                    baseUrl: mod.url,
                    tags: mod.tags || []
                }];
            })
        );
        
        const modsMap = {};
        for (const [modId, modData] of results) {
            modsMap[modId] = modData;
        }
        
        const cache = {
            lastUpdate: new Date().toISOString(),
            mods: modsMap
        };
        
        localStorage.setItem("polylibrary_list_cache", JSON.stringify(cache));
        return cache;
    };

    
    getModList = async function() {
        const modlistUrl = "http://localhost:8000/modlist.json";
        
        const modlistResponse = await fetch(modlistUrl);
        if (!modlistResponse.ok) throw new Error("Failed to fetch modlist.json");
        
        const mods = await modlistResponse.json();
    
        return mods;
    }
    getModInfo = async function(mods, refresh=false) {
        let modLatest;
        
        const cacheStr = localStorage.getItem("polylibrary_list_cache");
        
        if (cacheStr && !refresh) {
            const cache = JSON.parse(cacheStr);
            const lastUpdate = new Date(cache.lastUpdate);
            const now = new Date();
            
            const diffMs = now - lastUpdate;
            const oneHourMs = 1000 * 60 * 60;
            
            if (diffMs >= oneHourMs) {
                modLatest = await this.fetchURLS(mods)
            } else {
                modLatest = cache;
          }
        } else {
            modLatest = await this.fetchURLS(mods)
        }
    
        const icons = this.getIcons(modLatest.mods);
    
        const tagSet = new Set();
        Object.values(modLatest.mods).forEach(mod => {
            if (Array.isArray(mod.tags)) {
                mod.tags.forEach(tag => tagSet.add(tag));
            }
        });
    
        let allTags = Array.from(tagSet).sort((a, b) => {
            if (a === "Other") return 1;
            if (b === "Other") return -1;
            return a.localeCompare(b);
        });
    
        this.createTagBar(Array.from(allTags));
        
        Object.entries(mods).forEach(([modId, modInfo]) => {
            this.createModEntry(modId, modInfo.name, modInfo, modLatest, icons);
        });
    };
    createChangelog = async function(thisMod) {
        const url = `${thisMod.baseUrl}/polylib.json`
    
        const loader = document.createElement("p");
        loader.textContent = "Loading Changelogs...";
    
        this.changelog.appendChild(loader);
        this.changelog.scrollTop = "0";
        
        fetch(url)
          .then((res) => {
            if (!res.ok) {throw new Error("Network response was not ok");loader.textContent = "No Changelog Files Found"}
            return res.json();
          })
          .then((data) => {
              
            Object.keys(data.changelogs).forEach(version => {
                const versiondiv = document.createElement("div");
                versiondiv.className = `changelog-entry ${version}`;
                this.changelog.appendChild(versiondiv);
    
                const versionText = document.createElement("p");
                versionText.textContent = `Version: ${version}`;
                versionText.style.padding = "20px 20px 0 20px";
                versionText.style.fontSize = "40px";
                versionText.style.margin = "0";
                
                const logText = document.createElement("p")
                logText.innerHTML = `<ul>${data.changelogs[version].map(item => `<li>${item}</li>`).join("")}</ul>`;
                logText.style.padding = "0 20px 20px 20px";
                logText.style.fontSize = "20px";
                logText.style.margin = "0";
    
                loader.remove();
    
                versiondiv.appendChild(versionText);
                versiondiv.appendChild(logText);
            });
          })
          .catch((err) => {
            loader.textContent = "No Changelog Files Found";
            console.error("Fetch error:", err);
          });
    
        this.changelog.classList.add("created");
    };
    getDescription = async function(modId, thisMod) {
        const version = this.getHighestVersion(thisMod.latest);
        const url = `${thisMod.baseUrl}/${version}/description.html`;
        
        try {
            const res = await fetch(url);
            
            if (res.status !== 200) {
                return "No Description";
            }
            
            const html = await res.text();
            
            
            return html;
            
        } catch (err) {
            console.error("Failed to fetch description:", err);
            return "No Description";
        }
    };
    createVersions = async function (thisMod, modId) {
        this.vers.classList.add("created");
    
        const loader = document.createElement("p");
        loader.textContent = "Loading Version History...";
        this.vers.appendChild(loader);
    
        try {
            const res = await fetch(thisMod.baseUrl);
            if (!res.ok) {
                loader.textContent = "No Versions Found";
                return;
            }
    
            const data = await res.json();
    
            const versionFolders = data
                .filter(item => item.type === "dir")
                .filter(item => /^\d+(\.\d+)*$/.test(item.name))
                .sort((a, b) => {
                    const aParts = a.name.split('.').map(Number);
                    const bParts = b.name.split('.').map(Number);
                    const len = Math.max(aParts.length, bParts.length);
                    for (let i = 0; i < len; i++) {
                        const aVal = aParts[i] ?? 0;
                        const bVal = bParts[i] ?? 0;
                        if (aVal !== bVal) return bVal - aVal;
                    }
                    return 0;
                });
    
            const fragment = document.createDocumentFragment();
    
            const tasks = versionFolders.map(async (e) => {
                const versionName = e.name;
                const lastModified = e.last_modified;
                const modifiedBy = e.last_modified_by || "Unknown";
                const manifestUrl = `${thisMod.baseUrl}/${versionName}/version.json`;
    
                try {
                    const res = await fetch(manifestUrl);
                    if (!res.ok) return null;
    
                    const data = await res.json();
    
                    const versiondiv = document.createElement("div");
                    versiondiv.className = `versions-entry ${versionName}`;
    
                    const versionText = document.createElement("p");
                    versionText.textContent = `Version: ${versionName}`;
                    versionText.style.padding = "20px";
                    versionText.style.fontSize = "40px";
                    versionText.style.margin = "0";
                    versionText.style.width = "300px";
    
                    const supportedPolyVersions = document.createElement("p");
                    supportedPolyVersions.style.marginLeft = "50px";
                    supportedPolyVersions.style.width = "100px";
                    supportedPolyVersions.innerHTML = data.polymod.targets.join("<br>");
    
                    const timeStamp = document.createElement("p");
                    timeStamp.style.marginLeft = "100px";
                    timeStamp.textContent = this.timeAgo(lastModified, modifiedBy);
    
                    const addButton = document.createElement("button");
                    addButton.className = "library-add-button button";
                    addButton.innerHTML = `<img src="images/apply.svg"> Add`;
                    addButton.onclick = async () => await this.getDependencies(modId, thisMod.baseUrl, versionName);
                    addButton.style.margin = "20px 20px 20px auto";
                    addButton.style.height = "40px";
                    addButton.style.width = "130px";
                    addButton.style.fontSize = "25px";
    
                    if (this.apml.getMod(modId)) {
                        addButton.disabled = true;
                        addButton.style.cursor = "not-allowed";
                    }
    
                    if (
                        !data.polymod.targets.includes(this.gameVersion) ||
                        data.polymod?.locked === true
                    ) {
                        addButton.disabled = true;
                        versiondiv.style.opacity = "0.5";
                        versiondiv.style.background = "black";
                        addButton.style.background = "black";
                        addButton.style.cursor = "not-allowed";
                    }
    
                    versiondiv.appendChild(versionText);
                    versiondiv.appendChild(supportedPolyVersions);
                    versiondiv.appendChild(timeStamp);
                    versiondiv.appendChild(addButton);
    
                    return versiondiv;
                } catch (err) {
                    console.error("Failed to fetch manifest:", err);
                    return null;
                }
            });
    
            const versionDivs = await Promise.all(tasks);
    
            loader.remove();
    
            for (const div of versionDivs) {
                if (div) fragment.appendChild(div);
            }
    
            this.vers.appendChild(fragment);
    
        } catch (err) {
            console.error("Failed to fetch changelog:", err);
        }
    };
    createMutation = function() {
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    const wasHidden = mutation.oldValue?.includes("hidden");
                    const isNowVisible = !target.classList.contains("hidden");
                    if (wasHidden && isNowVisible) {
                        document.getElementById("poly-library")?.remove();
                        observer.disconnect();
                    }
                }
            }
        });

        const targetElement = document.getElementsByClassName("main-buttons-container")[0];
        observer.observe(targetElement, { attributes: true, attributeFilter: ['class'], attributeOldValue: true });
    }
}


class PMLCoreMod extends PolyMod {
  openDescription = function (n, mod) {
    let menuDiv = document.getElementById("ui").children[0];
    let trackInfoDiv = document.createElement("div");
    trackInfoDiv.style = `    interpolate-size: allow-keywords;
        --text-color: #fff;
        --text-disabled-color: #5d6a7c;
        --surface-color: #28346a;
        --surface-secondary-color: #212b58;
        --surface-tertiary-color: #192042;
        --surface-transparent-color: rgba(40, 52, 106, 0.5);
        --button-color: #112052;
        --button-hover-color: #334b77;
        --button-active-color: #151f41;
        --button-disabled-color: #313d53;
        scrollbar-color: #7272c2 #223;
        pointer-events: none;
        -webkit-tap-highlight-color: transparent;
        user-select: none;
        text-align: center;
        font-style: italic;
        font-family: ForcedSquare, Arial, sans-serif;
        line-height: 1;
        position: absolute;
        left: calc(50% - 1050px / 2);
        top: 0;
        z-index: 2;
        display: flex;
        margin: 0;
        padding: 0;
        width: 1000px;
        height: 100%;`;
    let containerDiv = document.createElement("div");
    containerDiv.style = `    interpolate-size: allow-keywords;
        --text-color: #fff;
        --text-disabled-color: #5d6a7c;
        --surface-color: #28346a;
        --surface-secondary-color: #212b58;
        --surface-tertiary-color: #192042;
        --surface-transparent-color: rgba(40, 52, 106, 0.5);
        --button-color: #112052;
        --button-hover-color: #334b77;
        --button-active-color: #151f41;
        --button-disabled-color: #313d53;
        scrollbar-color: #7272c2 #223;
        -webkit-tap-highlight-color: transparent;
        user-select: none;
        text-align: left;
        font-style: italic;
        font-family: ForcedSquare, Arial, sans-serif;
        line-height: 1;
        margin: 0;
        padding: 0;
        flex-grow: 1;
        background-color: var(--surface-secondary-color);
        overflow-x: hidden;
        overflow-y: scroll;
        pointer-events: auto;`;
    let goBackButton = document.createElement("button");
    goBackButton.style = "float: left;";
    goBackButton.className = "button left";
    goBackButton.innerHTML = `<img class="button-icon" src="images/back.svg"> Back`;
    goBackButton.addEventListener("click", () => {
      n.playUIClick();
      trackInfoDiv.remove();
      this.createModScreen(n);
    });
    containerDiv.appendChild(goBackButton);
    let infoDiv = document.createElement("div");
    infoDiv.innerHTML = `<h2> Loading... </h2>`;
    mod.modDescription
      ? (infoDiv.innerHTML = mod.modDescription)
      : fetch(`${mod.baseUrl}/${mod.modVersion}/description.html`)
      .then((res) => {
        if (res.status !== 200) {
          trackInfoDiv.remove();
          this.createModScreen(n);
          alert("This mod doesn't have a description file.");
          return;
        } else {
          return res.text();
        }
      })
      .then((response) => {
        infoDiv.innerHTML = response;
      });
    containerDiv.appendChild(infoDiv);
    trackInfoDiv.appendChild(containerDiv);
    menuDiv.appendChild(trackInfoDiv);
  };

  promptUserForNewMod = (n) => {
    let menuDiv = document.getElementById("ui").children[0];

    let promptDiv = document.createElement("div");
    promptDiv.style = `    interpolate-size: allow-keywords;
    --text-color: #fff;
    --text-disabled-color: #5d6a7c;
    --surface-color: #28346a;
    --surface-secondary-color: #212b58;
    --surface-tertiary-color: #192042;
    --surface-transparent-color: rgba(40, 52, 106, 0.5);
    --button-color: #112052;
    --button-hover-color: #334b77;
    --button-active-color: #151f41;
    --button-disabled-color: #313d53;
    --safe-area-left-unscaled: env(safe-area-inset-left, 0px);
    --safe-area-right-unscaled: env(safe-area-inset-right, 0px);
    --safe-area-top-unscaled: env(safe-area-inset-top, 0px);
    --safe-area-bottom-unscaled: env(safe-area-inset-bottom, 0px);
    --safe-area-left: calc(var(--safe-area-left-unscaled) / var(--ui-scale-factor));
    --safe-area-right: calc(var(--safe-area-right-unscaled) / var(--ui-scale-factor));
    --safe-area-horizontal: max(var(--safe-area-left), var(--safe-area-right));
    --safe-area-top: calc(var(--safe-area-top-unscaled) / var(--ui-scale-factor));
    --safe-area-bottom: calc(var(--safe-area-bottom-unscaled) / var(--ui-scale-factor));
    --safe-area-vertical: max(var(--safe-area-top), var(--safe-area-bottom));
    --ui-scale-factor: 0.9904347826086957;
    scrollbar-color: #7272c2 #223;
    pointer-events: none;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    text-align: center;
    font-style: normal;
    font-family: ForcedSquare, Arial, sans-serif;
    line-height: 1;
    position: absolute;
    left: calc(50% - 500px / 2);
    top: 40%;
    z-index: 2;
    margin: 0;
    padding: 16px;
    width: 500px;
    box-sizing: border-box;
    background-color: var(--surface-color);`

    let modUrlHead = document.createElement("h1");
    modUrlHead.innerText = "Mod URL";
    modUrlHead.style = `    interpolate-size: allow-keywords;
    --text-color: #fff;
    --text-disabled-color: #5d6a7c;
    --surface-color: #28346a;
    --surface-secondary-color: #212b58;
    --surface-tertiary-color: #192042;
    --surface-transparent-color: rgba(40, 52, 106, 0.5);
    --button-color: #112052;
    --button-hover-color: #334b77;
    --button-active-color: #151f41;
    --button-disabled-color: #313d53;
    --safe-area-left-unscaled: env(safe-area-inset-left, 0px);
    --safe-area-right-unscaled: env(safe-area-inset-right, 0px);
    --safe-area-top-unscaled: env(safe-area-inset-top, 0px);
    --safe-area-bottom-unscaled: env(safe-area-inset-bottom, 0px);
    --safe-area-left: calc(var(--safe-area-left-unscaled) / var(--ui-scale-factor));
    --safe-area-right: calc(var(--safe-area-right-unscaled) / var(--ui-scale-factor));
    --safe-area-horizontal: max(var(--safe-area-left), var(--safe-area-right));
    --safe-area-top: calc(var(--safe-area-top-unscaled) / var(--ui-scale-factor));
    --safe-area-bottom: calc(var(--safe-area-bottom-unscaled) / var(--ui-scale-factor));
    --safe-area-vertical: max(var(--safe-area-top), var(--safe-area-bottom));
    --ui-scale-factor: 0.9904347826086957;
    scrollbar-color: #7272c2 #223;
    pointer-events: none;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    text-align: center;
    font-style: normal;
    font-family: ForcedSquare, Arial, sans-serif;
    line-height: 1;
    margin: 0 4px 0 4px;
    padding: 0;
    font-size: 35px;
    font-weight: normal;
    color: var(--text-color);
    float: left;`;
    promptDiv.appendChild(modUrlHead);

    let urlInput = document.createElement("input");
    urlInput.type = "text";
    urlInput.style = `    interpolate-size: allow-keywords;
    --text-color: #fff;
    --text-disabled-color: #5d6a7c;
    --surface-color: #28346a;
    --surface-secondary-color: #212b58;
    --surface-tertiary-color: #192042;
    --surface-transparent-color: rgba(40, 52, 106, 0.5);
    --button-color: #112052;
    --button-hover-color: #334b77;
    --button-active-color: #151f41;
    --button-disabled-color: #313d53;
    --safe-area-left-unscaled: env(safe-area-inset-left, 0px);
    --safe-area-right-unscaled: env(safe-area-inset-right, 0px);
    --safe-area-top-unscaled: env(safe-area-inset-top, 0px);
    --safe-area-bottom-unscaled: env(safe-area-inset-bottom, 0px);
    --safe-area-left: calc(var(--safe-area-left-unscaled) / var(--ui-scale-factor));
    --safe-area-right: calc(var(--safe-area-right-unscaled) / var(--ui-scale-factor));
    --safe-area-horizontal: max(var(--safe-area-left), var(--safe-area-right));
    --safe-area-top: calc(var(--safe-area-top-unscaled) / var(--ui-scale-factor));
    --safe-area-bottom: calc(var(--safe-area-bottom-unscaled) / var(--ui-scale-factor));
    --safe-area-vertical: max(var(--safe-area-top), var(--safe-area-bottom));
    --ui-scale-factor: 0.9904347826086957;
    scrollbar-color: #7272c2 #223;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    font-style: normal;
    font-family: ForcedSquare, Arial, sans-serif;
    line-height: 1;
    clip-path: polygon(0 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
    text-indent: 6px;
    color: var(--text-color);
    background-color: var(--surface-tertiary-color);
    border: none;
    pointer-events: auto;
    display: block;
    margin: 0;
    padding: 0.25em;
    box-sizing: border-box;
    width: 100%;
    font-size: 36px;
    font-weight: normal;`
    promptDiv.appendChild(urlInput);

    let modVersionHead = document.createElement("h1");
    modVersionHead.innerText = "Mod Version";
    modVersionHead.style = `    interpolate-size: allow-keywords;
    --text-color: #fff;
    --text-disabled-color: #5d6a7c;
    --surface-color: #28346a;
    --surface-secondary-color: #212b58;
    --surface-tertiary-color: #192042;
    --surface-transparent-color: rgba(40, 52, 106, 0.5);
    --button-color: #112052;
    --button-hover-color: #334b77;
    --button-active-color: #151f41;
    --button-disabled-color: #313d53;
    --safe-area-left-unscaled: env(safe-area-inset-left, 0px);
    --safe-area-right-unscaled: env(safe-area-inset-right, 0px);
    --safe-area-top-unscaled: env(safe-area-inset-top, 0px);
    --safe-area-bottom-unscaled: env(safe-area-inset-bottom, 0px);
    --safe-area-left: calc(var(--safe-area-left-unscaled) / var(--ui-scale-factor));
    --safe-area-right: calc(var(--safe-area-right-unscaled) / var(--ui-scale-factor));
    --safe-area-horizontal: max(var(--safe-area-left), var(--safe-area-right));
    --safe-area-top: calc(var(--safe-area-top-unscaled) / var(--ui-scale-factor));
    --safe-area-bottom: calc(var(--safe-area-bottom-unscaled) / var(--ui-scale-factor));
    --safe-area-vertical: max(var(--safe-area-top), var(--safe-area-bottom));
    --ui-scale-factor: 0.9904347826086957;
    scrollbar-color: #7272c2 #223;
    pointer-events: none;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    text-align: center;
    font-style: normal;
    font-family: ForcedSquare, Arial, sans-serif;
    line-height: 1;
    margin: 0 4px 0 4px;
    padding: 0;
    font-size: 35px;
    font-weight: normal;
    color: var(--text-color);
    float: left;`;
    promptDiv.appendChild(modVersionHead);

    let versionInput = document.createElement("input");
    versionInput.type = "text";
    versionInput.style = `    interpolate-size: allow-keywords;
    --text-color: #fff;
    --text-disabled-color: #5d6a7c;
    --surface-color: #28346a;
    --surface-secondary-color: #212b58;
    --surface-tertiary-color: #192042;
    --surface-transparent-color: rgba(40, 52, 106, 0.5);
    --button-color: #112052;
    --button-hover-color: #334b77;
    --button-active-color: #151f41;
    --button-disabled-color: #313d53;
    --safe-area-left-unscaled: env(safe-area-inset-left, 0px);
    --safe-area-right-unscaled: env(safe-area-inset-right, 0px);
    --safe-area-top-unscaled: env(safe-area-inset-top, 0px);
    --safe-area-bottom-unscaled: env(safe-area-inset-bottom, 0px);
    --safe-area-left: calc(var(--safe-area-left-unscaled) / var(--ui-scale-factor));
    --safe-area-right: calc(var(--safe-area-right-unscaled) / var(--ui-scale-factor));
    --safe-area-horizontal: max(var(--safe-area-left), var(--safe-area-right));
    --safe-area-top: calc(var(--safe-area-top-unscaled) / var(--ui-scale-factor));
    --safe-area-bottom: calc(var(--safe-area-bottom-unscaled) / var(--ui-scale-factor));
    --safe-area-vertical: max(var(--safe-area-top), var(--safe-area-bottom));
    --ui-scale-factor: 0.9904347826086957;
    scrollbar-color: #7272c2 #223;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    font-style: normal;
    font-family: ForcedSquare, Arial, sans-serif;
    line-height: 1;
    clip-path: polygon(0 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
    text-indent: 6px;
    color: var(--text-color);
    background-color: var(--surface-tertiary-color);
    border: none;
    pointer-events: auto;
    display: block;
    margin: 0;
    padding: 0.25em;
    box-sizing: border-box;
    width: 100%;
    font-size: 36px;
    font-weight: normal;`
    versionInput.placeholder = "latest";
    promptDiv.appendChild(versionInput);

    let autoUpdateDiv = document.createElement("div");
    autoUpdateDiv.style = `    interpolate-size: allow-keywords;
        --text-color: #fff;
        --text-disabled-color: #5d6a7c;
        --surface-color: #28346a;
        --surface-secondary-color: #212b58;
        --surface-tertiary-color: #192042;
        --surface-transparent-color: rgba(40, 52, 106, 0.5);
        --button-color: #112052;
        --button-hover-color: #334b77;
        --button-active-color: #151f41;
        --button-disabled-color: #313d53;
        scrollbar-color: #7272c2 #223;
        -webkit-tap-highlight-color: transparent;
        user-select: none;
        text-align: left;
        pointer-events: auto;
        font-style: italic;
        font-family: ForcedSquare, Arial, sans-serif;
        line-height: 1;
        margin: 10px;
        display: flex;`;
    autoUpdateDiv.innerHTML = `<p style="    interpolate-size: allow-keywords;
        --text-color: #fff;
        --text-disabled-color: #5d6a7c;
        --surface-color: #28346a;
        --surface-secondary-color: #212b58;
        --surface-tertiary-color: #192042;
        --surface-transparent-color: rgba(40, 52, 106, 0.5);
        --button-color: #112052;
        --button-hover-color: #334b77;
        --button-active-color: #151f41;
        --button-disabled-color: #313d53;
        scrollbar-color: #7272c2 #223;
        -webkit-tap-highlight-color: transparent;
        user-select: none;
        pointer-events: auto;
        font-style: italic;
        font-family: ForcedSquare, Arial, sans-serif;
        line-height: 1;
        display: inline-block;
        margin: 10px;
        padding: 0;
        min-width: 0;
        white-space: wrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex-grow: 1;
        font-size: 24px;
        text-align: left;
        color: var(--text-color);">Auto Update \n(Only if on latest)`;

    let autoUpdateVar = true;
    let updateOnButton = document.createElement("button");
    updateOnButton.innerText = "On";
    updateOnButton.className = "button";
    updateOnButton.addEventListener("click", () => {
      n.playUIClick();
      autoUpdateVar = true;
      updateOnButton.style = `    interpolate-size: allow-keywords;
        --text-color: #fff;
        --text-disabled-color: #5d6a7c;
        --surface-color: #28346a;
        --surface-secondary-color: #212b58;
        --surface-tertiary-color: #192042;
        --surface-transparent-color: rgba(40, 52, 106, 0.5);
        --button-color: #112052;
        --button-hover-color: #334b77;
        --button-active-color: #151f41;
        --button-disabled-color: #313d53;
        scrollbar-color: #7272c2 #223;
        -webkit-tap-highlight-color: transparent;
        font-style: italic;
        font-family: ForcedSquare, Arial, sans-serif;
        line-height: 1;
        position: relative;
        margin: 0;
        padding: 8px 18px;
        border: none;
        clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
        color: var(--text-color);
        font-size: 32px;
        pointer-events: auto;
        user-select: none;
        cursor: pointer;
        height: 48px;
        white-space: nowrap;
        background-color: var(--button-hover-color);`;
      updateOffButton.style = `    interpolate-size: allow-keywords;
        --text-color: #fff;
        --text-disabled-color: #5d6a7c;
        --surface-color: #28346a;
        --surface-secondary-color: #212b58;
        --surface-tertiary-color: #192042;
        --surface-transparent-color: rgba(40, 52, 106, 0.5);
        --button-color: #112052;
        --button-hover-color: #334b77;
        --button-active-color: #151f41;
        --button-disabled-color: #313d53;
        scrollbar-color: #7272c2 #223;
        -webkit-tap-highlight-color: transparent;
        font-style: italic;
        font-family: ForcedSquare, Arial, sans-serif;
        line-height: 1;
        position: relative;
        margin: 0;
        padding: 8px 18px;
        background-color: var(--button-color);
        border: none;
        clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
        color: var(--text-color);
        font-size: 32px;
        pointer-events: auto;
        user-select: none;
        cursor: pointer;
        height: 48px;
        white-space: nowrap;`;
    });
    updateOnButton.style = `    interpolate-size: allow-keywords;
        --text-color: #fff;
        --text-disabled-color: #5d6a7c;
        --surface-color: #28346a;
        --surface-secondary-color: #212b58;
        --surface-tertiary-color: #192042;
        --surface-transparent-color: rgba(40, 52, 106, 0.5);
        --button-color: #112052;
        --button-hover-color: #334b77;
        --button-active-color: #151f41;
        --button-disabled-color: #313d53;
        scrollbar-color: #7272c2 #223;
        -webkit-tap-highlight-color: transparent;
        font-style: italic;
        font-family: ForcedSquare, Arial, sans-serif;
        line-height: 1;
        position: relative;
        margin: 0;
        padding: 8px 18px;
        border: none;
        clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
        color: var(--text-color);
        font-size: 32px;
        pointer-events: auto;
        user-select: none;
        cursor: pointer;
        height: 48px;
        white-space: nowrap;
        background-color: var(--button-hover-color);`;

    let updateOffButton = document.createElement("button");
    updateOffButton.innerText = "Off";
    updateOffButton.className = "button";
    updateOffButton.addEventListener("click", () => {
      n.playUIClick();
      autoUpdateVar = false;
      updateOnButton.style = `    interpolate-size: allow-keywords;
        --text-color: #fff;
        --text-disabled-color: #5d6a7c;
        --surface-color: #28346a;
        --surface-secondary-color: #212b58;
        --surface-tertiary-color: #192042;
        --surface-transparent-color: rgba(40, 52, 106, 0.5);
        --button-color: #112052;
        --button-hover-color: #334b77;
        --button-active-color: #151f41;
        --button-disabled-color: #313d53;
        scrollbar-color: #7272c2 #223;
        -webkit-tap-highlight-color: transparent;
        font-style: italic;
        font-family: ForcedSquare, Arial, sans-serif;
        line-height: 1;
        position: relative;
        margin: 0;
        padding: 8px 18px;
        border: none;
        clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
        color: var(--text-color);
        font-size: 32px;
        pointer-events: auto;
        user-select: none;
        cursor: pointer;
        height: 48px;
        white-space: nowrap;
        background-color: var(--button-color);`;
      updateOffButton.style = `    interpolate-size: allow-keywords;
        --text-color: #fff;
        --text-disabled-color: #5d6a7c;
        --surface-color: #28346a;
        --surface-secondary-color: #212b58;
        --surface-tertiary-color: #192042;
        --surface-transparent-color: rgba(40, 52, 106, 0.5);
        --button-color: #112052;
        --button-hover-color: #334b77;
        --button-active-color: #151f41;
        --button-disabled-color: #313d53;
        scrollbar-color: #7272c2 #223;
        -webkit-tap-highlight-color: transparent;
        font-style: italic;
        font-family: ForcedSquare, Arial, sans-serif;
        line-height: 1;
        position: relative;
        margin: 0;
        padding: 8px 18px;
        background-color: var(--button-hover-color);
        border: none;
        clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
        color: var(--text-color);
        font-size: 32px;
        pointer-events: auto;
        user-select: none;
        cursor: pointer;
        height: 48px;
        white-space: nowrap;`;
    });
    updateOffButton.style = `    interpolate-size: allow-keywords;
        --text-color: #fff;
        --text-disabled-color: #5d6a7c;
        --surface-color: #28346a;
        --surface-secondary-color: #212b58;
        --surface-tertiary-color: #192042;
        --surface-transparent-color: rgba(40, 52, 106, 0.5);
        --button-color: #112052;
        --button-hover-color: #334b77;
        --button-active-color: #151f41;
        --button-disabled-color: #313d53;
        scrollbar-color: #7272c2 #223;
        -webkit-tap-highlight-color: transparent;
        font-style: italic;
        font-family: ForcedSquare, Arial, sans-serif;
        line-height: 1;
        position: relative;
        margin: 0;
        padding: 8px 18px;
        background-color: var(--button-color);
        border: none;
        clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
        color: var(--text-color);
        font-size: 32px;
        pointer-events: auto;
        user-select: none;
        cursor: pointer;
        height: 48px;
        white-space: nowrap;`;
    autoUpdateDiv.appendChild(updateOffButton);
    autoUpdateDiv.appendChild(updateOnButton);
    promptDiv.appendChild(autoUpdateDiv);

    let warningh2 = document.createElement("h2");
    warningh2.style = "color: #f66;margin:5px;";
    warningh2.innerText = "Only install mods from trusted sources!";
    promptDiv.appendChild(warningh2);

    let importButton = document.createElement("button");
    importButton.style = "float: right;";
    importButton.className = "button right";
    importButton.innerHTML = `<img class="button-icon" src="images/import.svg"> Import`;
    importButton.addEventListener("click", () => {
      n.playUIClick();
      importButton.disabled = true;
      let modUrl = urlInput.value;
      let modVersion =
        versionInput.value === "" ? "latest" : versionInput.value;
      this.modPmlInstance
        .addMod({ base: modUrl, version: modVersion, loaded: false })
        .then(() => {
          promptDiv.remove();
          this.createModScreen(n);
        }, autoUpdateVar);
    });
    promptDiv.appendChild(importButton);

    let goBackButton = document.createElement("button");
    goBackButton.style = "float: left;";
    goBackButton.className = "button left";
    goBackButton.innerHTML = `<img class="button-icon" src="images/back.svg"> Back`;
    goBackButton.addEventListener("click", () => {
      n.playUIClick();
      promptDiv.remove();
      this.createModScreen(n);
    });
    promptDiv.appendChild(goBackButton);

    menuDiv.appendChild(promptDiv);
  };

  createModScreen = (n) => {
    let menuDiv;
    for (let elem of document.getElementById("ui").children) {
      if (elem.classList.contains("menu-ui")) {
        menuDiv = elem;
      }
    }
    let hideList = [3, 4, 5];
    for (let intToHide of hideList) {
      try {
        menuDiv.children[intToHide].classList.add("hidden")
      } catch {
        console.log("oops")
      }
    }

    let selectedMod;

    let modsDiv = document.createElement("div");
    modsDiv.className = "track-info-ui";

    let availableModsList = document.createElement("div");
    availableModsList.className = "leaderboard-ui";

    let availableModsLabel = document.createElement("h2");
    availableModsLabel.textContent = "Available";
    availableModsList.appendChild(availableModsLabel);

    let activatedModsList = document.createElement("div");
    activatedModsList.className = "leaderboard-ui";

    let modActivatedLabel = document.createElement("h2");
    modActivatedLabel.textContent = "Loaded";
    activatedModsList.appendChild(modActivatedLabel);

    let activatedModsContainer = document.createElement("div");
    activatedModsContainer.className = "container";
    activatedModsList.appendChild(activatedModsContainer);

    let buttonWrapper = document.createElement("div");
    buttonWrapper.className = "button-wapper";
    activatedModsList.appendChild(buttonWrapper);

    let unloadButton = document.createElement("button");
    unloadButton.className = "button first";
    unloadButton.disabled = true;
    unloadButton.style =
      "margin: 10px 0; float: left;padding: 10px; margin-left:2px;";
    unloadButton.innerHTML = `<img class="button-icon" src="images/arrow_left.svg"> Unload`;
    unloadButton.addEventListener("click", () => {
      let mod = this.modPmlInstance.getMod(selectedMod.id.replace("mod:", ""));
      this.modPmlInstance.setModLoaded(mod, false);
      modsDiv.remove();
      this.createModScreen(n);
    });

    buttonWrapper.appendChild(unloadButton);

    let goUpButton = document.createElement("button");
    goUpButton.className = "button first";
    goUpButton.disabled = true;
    goUpButton.style = "margin: 10px; float: left;padding: 10px";
    goUpButton.innerHTML = `<img class="button-icon" src="images/arrow_up.svg" style="margin: 0px 10px">`;
    goUpButton.addEventListener("click", () => {
      let mod = this.modPmlInstance.getMod(selectedMod.id.replace("mod:", ""));
      this.modPmlInstance.reorderMod(mod, -1);
      modsDiv.remove();
      this.createModScreen(n);
    });
    buttonWrapper.appendChild(goUpButton);

    let goDownButton = document.createElement("button");
    goDownButton.className = "button first";
    goDownButton.disabled = true;
    goDownButton.style = "margin: 10px 0; float: left;padding: 10px";
    goDownButton.innerHTML = `<img class="button-icon" src="images/arrow_down.svg" style="margin: 0px 10px">`;
    goDownButton.addEventListener("click", () => {
      let mod = this.modPmlInstance.getMod(selectedMod.id.replace("mod:", ""));
      this.modPmlInstance.reorderMod(mod, 1);
      modsDiv.remove();
      this.createModScreen(n);
    });
    buttonWrapper.appendChild(goDownButton);

    let applyButton = document.createElement("button");
    applyButton.className = "button first";
    applyButton.addEventListener("click", () => {
      n.playUIClick();
      location.reload();
    });
    applyButton.style = "margin: 10px 0; float: right;padding: 10px";
    applyButton.innerHTML = `Apply <img class="button-icon" src="images/checkmark.svg" style="margin: 0 5">`;
    buttonWrapper.appendChild(applyButton);

    let availableModsContainer = document.createElement("div");
    availableModsContainer.className = "container";
    availableModsList.appendChild(availableModsContainer);
    for (let polyMod of this.modPmlInstance.getAllMods()) {
      let modDiv = document.createElement("div");
      modDiv.style = `--text-color: #fff;
        --text-disabled-color: #5d6a7c;
        --surface-color: #28346a;
        --surface-secondary-color: #212b58;
        --surface-tertiary-color: #192042;
        --surface-transparent-color: rgba(40, 52, 106, 0.5);
        --button-color: #112052;
        --button-hover-color: #334b77;
        --button-active-color: #151f41;
        --button-disabled-color: #313d53;
        scrollbar-color: #7272c2 #223;
        -webkit-tap-highlight-color: transparent;
        user-select: none;
        text-align: left;
        pointer-events: auto;
        font-family: ForcedSquare, Arial, sans-serif;
        line-height: 1;
        position: relative;
        margin: 10px 10px 0 10px;
        padding: 0;`;

      let modMainButton = document.createElement("button");
      modMainButton.id = `mod:${polyMod.modID}`;
      modMainButton.className = "button";
      modMainButton.style = `    --text-color: #fff;
        --text-disabled-color: #5d6a7c;
        --surface-color: #28346a;
        --surface-secondary-color: #212b58;
        --surface-tertiary-color: #192042;
        --surface-transparent-color: rgba(40, 52, 106, 0.5);
        --button-color: #112052;
        --button-hover-color: #334b77;
        --button-active-color: #151f41;
        --button-disabled-color: #313d53;
        scrollbar-color: #7272c2 #223;
        -webkit-tap-highlight-color: transparent;
        font-family: ForcedSquare, Arial, sans-serif;
        line-height: 1;
        position: relative;
        border: none;
        color: var(--text-color);
        font-size: 32px;
        pointer-events: auto;
        user-select: none;
        cursor: pointer;
        margin: 0;
        padding: 0;
        vertical-align: top;
        width: 100%;
        height: 100px;
        clip-path: polygon(0 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
        text-align: left;
        white-space: nowrap;`;
      modMainButton.innerHTML = `<img src="${polyMod.iconSrc}" style="max-width:100px;max-height=100px;">`;
      modMainButton.addEventListener("click", () => {
        if (!polyMod.isLoaded) {
          goUpButton.disabled = true;
          goDownButton.disabled = true;
          unloadButton.disabled = true;
          loadButton.disabled = false;
          removeButton.disabled = false;
        } else {
          removeButton.disabled = true;
          unloadButton.disabled = false;
          loadButton.disabled = true;
          goUpButton.disabled = false;
          goDownButton.disabled = false;
          if (activatedModsContainer.children[0] === modMainButton) {
            goUpButton.disabled = true;
          }
          if (
            activatedModsContainer.children[
              activatedModsContainer.children.length - 1
            ] === modMainButton
          ) {
            goDownButton.disabled = true;
          }
        }
        if (selectedMod === modMainButton) {
          goUpButton.disabled = true;
          goDownButton.disabled = true;
          unloadButton.disabled = true;
          loadButton.disabled = true;
          removeButton.disabled = true;
          modMainButton.style = `    --text-color: #fff;
        --text-disabled-color: #5d6a7c;
        --surface-color: #28346a;
        --surface-secondary-color: #212b58;
        --surface-tertiary-color: #192042;
        --surface-transparent-color: rgba(40, 52, 106, 0.5);
        --button-color: #112052;
        --button-hover-color: #334b77;
        --button-active-color: #151f41;
        --button-disabled-color: #313d53;
        scrollbar-color: #7272c2 #223;
        -webkit-tap-highlight-color: transparent;
        font-family: ForcedSquare, Arial, sans-serif;
        line-height: 1;
        position: relative;
        border: none;
        color: var(--text-color);
        font-size: 32px;
        pointer-events: auto;
        user-select: none;
        cursor: pointer;
        margin: 0;
        padding: 0;
        vertical-align: top;
        width: 100%;
        height: 100px;
        clip-path: polygon(0 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
        text-align: left;
        white-space: nowrap;`;
          selectedMod = null;
        } else {
          if (selectedMod) {
            selectedMod.style = `    --text-color: #fff;
                        --text-disabled-color: #5d6a7c;
                        --surface-color: #28346a;
                        --surface-secondary-color: #212b58;
                        --surface-tertiary-color: #192042;
                        --surface-transparent-color: rgba(40, 52, 106, 0.5);
                        --button-color: #112052;
                        --button-hover-color: #334b77;
                        --button-active-color: #151f41;
                        --button-disabled-color: #313d53;
                        scrollbar-color: #7272c2 #223;
                        -webkit-tap-highlight-color: transparent;
                        font-family: ForcedSquare, Arial, sans-serif;
                        line-height: 1;
                        position: relative;
                        border: none;
                        color: var(--text-color);
                        font-size: 32px;
                        pointer-events: auto;
                        user-select: none;
                        cursor: pointer;
                        margin: 0;
                        padding: 0;
                        vertical-align: top;
                        width: 100%;
                        height: 100px;
                        clip-path: polygon(0 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
                        text-align: left;
                        white-space: nowrap;`;
          }
          modMainButton.style = `    --text-color: #fff;
                    --text-disabled-color: #5d6a7c;
                    --surface-color: #28346a;
                    --surface-secondary-color: #212b58;
                    --surface-tertiary-color: #192042;
                    --surface-transparent-color: rgba(40, 52, 106, 0.5);
                    --button-color: #112052;
                    --button-hover-color: #334b77;
                    --button-active-color: #151f41;
                    --button-disabled-color: #313d53;
                    scrollbar-color: #7272c2 #223;
                    -webkit-tap-highlight-color: transparent;
                    font-family: ForcedSquare, Arial, sans-serif;
                    background: var(--button-hover-color);
                    line-height: 1;
                    position: relative;
                    border: none;
                    color: var(--text-color);
                    font-size: 32px;
                    pointer-events: auto;
                    user-select: none;
                    cursor: pointer;
                    margin: 0;
                    padding: 0;
                    vertical-align: top;
                    width: 100%;
                    height: 100px;
                    clip-path: polygon(0 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
                    text-align: left;
                    white-space: nowrap;`;
          selectedMod = modMainButton;
        }
      });

      let leftDiv = document.createElement("div");
      leftDiv.style = `    --text-color: #fff;
        --text-disabled-color: #5d6a7c;
        --surface-color: #28346a;
        --surface-secondary-color: #212b58;
        --surface-tertiary-color: #192042;
        --surface-transparent-color: rgba(40, 52, 106, 0.5);
        --button-color: #112052;
        --button-hover-color: #334b77;
        --button-active-color: #151f41;
        --button-disabled-color: #313d53;
        scrollbar-color: #7272c2 #223;
        -webkit-tap-highlight-color: transparent;
        color: var(--text-color);
        font-size: 32px;
        pointer-events: auto;
        user-select: none;
        cursor: pointer;
        text-align: left;
        white-space: nowrap;
        font-family: ForcedSquare, Arial, sans-serif;
        line-height: 1;
        display: inline-block;
        vertical-align: top;`;
      leftDiv.innerHTML = `<p style="    --text-color: #fff;
        --text-disabled-color: #5d6a7c;
        --surface-color: #28346a;
        --surface-secondary-color: #212b58;
        --surface-tertiary-color: #192042;
        --surface-transparent-color: rgba(40, 52, 106, 0.5);
        --button-color: #112052;
        --button-hover-color: #334b77;
        --button-active-color: #151f41;
        --button-disabled-color: #313d53;
        scrollbar-color: #7272c2 #223;
        -webkit-tap-highlight-color: transparent;
        pointer-events: auto;
        user-select: none;
        cursor: pointer;
        text-align: left;
        white-space: nowrap;
        font-family: ForcedSquare, Arial, sans-serif;
        line-height: 1;
        margin: 0;
        padding: 12px;
        font-size: 28px;
        color: var(--text-color);">  ${polyMod.modName} <u>${polyMod.modVersion}</u></p><p style="    --text-color: #fff;
        --text-disabled-color: #5d6a7c;
        --surface-color: #28346a;
        --surface-secondary-color: #212b58;
        --surface-tertiary-color: #192042;
        --surface-transparent-color: rgba(40, 52, 106, 0.5);
        --button-color: #112052;
        --button-hover-color: #334b77;
        --button-active-color: #151f41;
        --button-disabled-color: #313d53;
        scrollbar-color: #7272c2 #223;
        -webkit-tap-highlight-color: transparent;
        pointer-events: auto;
        user-select: none;
        cursor: pointer;
        text-align: left;
        white-space: nowrap;
        font-family: ForcedSquare, Arial, sans-serif;
        line-height: 1;
        margin: 0;
        padding: 12px;
        font-size: 28px;
        color: var(--text-color);">  By ${polyMod.modAuthor}</p>`;

      let rightDiv = document.createElement("div");
      rightDiv.style = `    --text-color: #fff;
        --text-disabled-color: #5d6a7c;
        --surface-color: #28346a;
        --surface-secondary-color: #212b58;
        --surface-tertiary-color: #192042;
        --surface-transparent-color: rgba(40, 52, 106, 0.5);
        --button-color: #112052;
        --button-hover-color: #334b77;
        --button-active-color: #151f41;
        --button-disabled-color: #313d53;
        scrollbar-color: #7272c2 #223;
        -webkit-tap-highlight-color: transparent;
        color: var(--text-color);
        font-size: 32px;
        pointer-events: auto;
        user-select: none;
        cursor: pointer;
        text-align: left;
        white-space: nowrap;
        font-family: ForcedSquare, Arial, sans-serif;
        line-height: 1;
        display: inline-block;
        vertical-align: top;`;

      modMainButton.appendChild(leftDiv);
      modMainButton.appendChild(rightDiv);
      modDiv.appendChild(modMainButton);
      let infoButton = document.createElement("button");
      infoButton.innerHTML = `<img src="images/help.svg">`;
      infoButton.className = "button";
      infoButton.style = `    --text-color: #fff;
        --text-disabled-color: #5d6a7c;
        --surface-color: #28346a;
        --surface-secondary-color: #212b58;
        --surface-tertiary-color: #192042;
        --surface-transparent-color: rgba(40, 52, 106, 0.5);
        --button-color: #112052;
        --button-hover-color: #334b77;
        --button-active-color: #151f41;
        --button-disabled-color: #313d53;
        scrollbar-color: #7272c2 #223;
        -webkit-tap-highlight-color: transparent;
        font-family: ForcedSquare, Arial, sans-serif;
        line-height: 1;
        border: none;
        color: var(--text-color);
        font-size: 32px;
        pointer-events: auto;
        user-select: none;
        cursor: pointer;
        position: absolute;
        right: 0;
        top: 0;
        margin: 8px;
        padding: 0 9px;
        background-color: var(--surface-color);
        clip-path: polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%);`;
      infoButton.addEventListener("click", () => {
        modsDiv.remove();
        n.playUIClick();
        this.openDescription(n, polyMod);
      });
      modDiv.appendChild(infoButton);
      if (polyMod.isLoaded) {
        activatedModsContainer.appendChild(modDiv);
      } else {
        availableModsContainer.appendChild(modDiv);
      }
    }

    let backButtonWrapper = document.createElement("div");
    backButtonWrapper.className = "button-wapper";

    let backButton = document.createElement("button");
    backButton.className = "button back";
    backButton.style = "margin: 10px 0; float: left;padding: 10px";
    backButton.innerHTML = `<img class="button-icon" src="images/back.svg" style="margin: 0 5"> Back`;
    backButton.addEventListener("click", () => {
      n.playUIClick();
      for (let intToUnhide of hideList) {
        menuDiv.children[intToUnhide].classList.remove("hidden");
      }
      modsDiv.remove();
    });
    backButtonWrapper.appendChild(backButton);

    let addButton = document.createElement("button");
    addButton.className = "button back";
    addButton.style = "margin: 10px 0; float: left;padding: 10px";
    addButton.innerHTML = `<img class="button-icon" src="images/load.svg" style="margin: 0 5"> Add`;
    addButton.addEventListener("click", () => {
      n.playUIClick();
      modsDiv.remove();
      this.promptUserForNewMod(n);
    });
    backButtonWrapper.appendChild(addButton);

    let removeButton = document.createElement("button");
    removeButton.className = "button back";
    removeButton.style =
      "margin: 10px 0; float: left;padding: 10px; margin-left: 0px;";
    removeButton.innerHTML = `<img class="button-icon" src="images/erase.svg" style="margin: 0 5"> Remove`;
    removeButton.addEventListener("click", () => {
      n.playUIClick();
      this.modPmlInstance.removeMod(
        this.modPmlInstance.getMod(selectedMod.id.replace("mod:", ""))
      );
      modsDiv.remove();
      this.createModScreen(n);
    });
    removeButton.disabled = true;
    backButtonWrapper.appendChild(removeButton);

    let loadButton = document.createElement("button");
    loadButton.className = "button first";
    loadButton.disabled = true;
    loadButton.style =
      "margin: 10px 0; float: right;padding: 10px; margin-right:2px;";
    loadButton.innerHTML = `Load <img class="button-icon" src="images/arrow_right.svg">`;
    loadButton.addEventListener("click", () => {
      let mod = this.modPmlInstance.getMod(selectedMod.id.replace("mod:", ""));
      this.modPmlInstance.setModLoaded(mod, true);
      modsDiv.remove();
      this.createModScreen(n);
    });

    backButtonWrapper.appendChild(loadButton);
    availableModsList.appendChild(backButtonWrapper);

    modsDiv.appendChild(availableModsList);
    modsDiv.appendChild(activatedModsList);
    menuDiv.appendChild(modsDiv);
  };

  init = (pmlInstance) => {
    this.modPmlInstance = pmlInstance;
    this.polyLibraryInstance = new PolyLibrary();
    this.polyLibraryInstance.apml = pmlInstance;
    this.polyLibraryInstance.gameVersion = pmlInstance.polyVersion;
    this.polyLibraryInstance.initMod();
    console.log(`Hello from ${this.modName}!`);
    this.modPmlInstance.registerFuncMixin(
      "jc", {
      type: MixinType.INSERT,
      token: `(0, C.GG)(this, Gc, [], "f");`,
      func: `
        const modButton = document.createElement("button");
        modButton.className = "button button-image";
        modButton.innerHTML = '<img src="images/load.svg">';
        modButton.addEventListener("click", () => {
          n.playUIClick();
          for (let polyMod of ActivePolyModLoader.getAllMods()) {
            if (polyMod.modID === "pmlcore") {
              ActivePolyModLoader.getMod("${this.modID}").polyLibraryInstance.soundInst = n;
              ActivePolyModLoader.getMod("${this.modID}").polyLibraryInstance.menuUI();
              ActivePolyModLoader.getMod("${this.modID}").polyLibraryInstance.createMutation();
              console.log(polyMod);
              polyMod.createModScreen(n);
            }
          }
        });

        const modTextContainer = document.createElement("p");
        modTextContainer.textContent = "Mods";
        modButton.appendChild(modTextContainer);

        (0, C.gn)(this, Nc, "f").appendChild(modButton);
        (0, C.gn)(this, Dc, "f").push(modButton);
      `
  });
  };
  postInit = () => {
    console.log(`Hello from ${this.modName}, but postInit this time!`);
  };
  simInit = () => {};
}

export let polyMod = new PMLCoreMod();
