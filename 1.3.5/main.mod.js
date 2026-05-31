import {
  PolyMod,
  MixinType
} from "https://cdn.polymodloader.com/cb/polytrackmods/PolyModLoader/0.6.2/PolyTypes.js";

// [{"base":"http://localhost:8000","version":"latest","loaded":true}]
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
        this.everyVersion = await this.getVersions();
        
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
    createModEntry = function(mod, icons) {
        const modAuthor = JSON.parse(mod.authors).join(", ");
        let modIcon = icons[mod.mod_id];
        const modVersions = JSON.parse(mod.game_versions);
        const tags = JSON.parse(mod.tags);
        const shortDesc = mod.description || "No description found";

        const entry = document.createElement("button");
        if (!modVersions.includes(this.gameVersion)) {
            entry.style.opacity = "0.5";
            entry.disabled = true;
            entry.style.cursor = "not-allowed"
        }
        entry.className = `library-entry button ${tags.join(" ")}`;
        entry.onclick = () => {
            document.getElementById("library-div").style.display = "none";
            this.createModUI(mod, JSON.parse(mod.latest), modIcon, mod.name, modAuthor, tags);
        };

        this.listDiv.appendChild(entry)

        if (modIcon) {
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
        modNameLib.textContent = mod.name;
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
        versionsDiv.textContent = Object.values(modVersions).join(", ");
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
    createModUI = async function(mod, thisMod, icon, name, author, tags) {
        const modId = mod.mod_id;
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
        addButton.onclick = async () => {await this.getDependencies(mod, true)};

        topDiv.appendChild(addButton);

        // for (let polyMod of this.apml.getAllMods()) {
        //     console.log(polyMod);
        // }
        
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
            if (!this.changelog.classList.contains("created")) {this.createChangelog(mod)};
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
            if (!this.vers.classList.contains("created")) {this.createVersions(mod, modId)};
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

        const html = await this.getDescription(modId, mod);

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
        dialog.style.background = "#28346aff"
        dialog.style.position = "fixed";
        dialog.style.top = "50%";
        dialog.style.left = "50%";
        dialog.style.transform = "translate(-50%, -50%)";
        dialog.style.border = "none";
        dialog.style.borderRadius = "8px";
        dialog.style.margin = "0";
        dialog.style.padding = "24px";

        dialog.addEventListener("cancel", (e) => {
            e.preventDefault(); 
        });

        const div = document.createElement("div");

        dialog.appendChild(div);

        const text = document.createElement("p");
        text.textContent = boxText;
        text.style.fontSize = "24px";
        text.style.color = "white";

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
        dialog.showModal();
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
        this.iconMap = {};
    
        for (const mod of mods) {
            const iconUrl = mod.icon_url
    
    
            const img = document.createElement("img");
            img.src = iconUrl;
            img.style.height = "150px";
    
            this.iconMap[mod.mod_id] = img;
        }
    
        return this.iconMap;
    };
    getVersionsForMod = function(modId, matchPt=false) {
        return this.everyVersion.filter(version => version.mod_id === modId && (!matchPt || version.game_version === this.gameVersion));
    }
    getHighestSemver = function(modid, range) {
        const versions = this.getVersionsForMod(modid, true);
        return this.apml.semver.maxSatisfying(versions.map(v => v.version), range);
    }
    getVersionOfMod(version, mod){
        return this.everyVersion.find(v => v.mod_id === mod.mod_id && v.version === version);
    }
    getDependencies = async function(mod, autoUpd=false) {
        const version = this.getVersionOfMod(JSON.parse(mod.latest)[this.gameVersion], mod);
        if (Array.isArray(JSON.parse(version.dependencies)) && !(JSON.parse(version.dependencies).length === 0)) {
            const confirm = async () => {
                
                document.getElementById("mod-div").remove();
                document.getElementById("library-div").remove();

                JSON.parse(version.dependencies).forEach(async (dep) => {
                    if (!this.apml.getMod(dep.id)) {
                        if (this.fullModList[dep.id]) {
                            await this.addMod(this.fullModList[dep.id].url, this.getHighestSemver(dep.id, dep.version), autoUpd, dep.id);        
                        }
                    }
                    
                });

                await this.addMod(mod.url, version, autoUpd, mod.mod_id); 
            }

            const importing = [];
            const missing = [];
            
            importing.push(mod.mod_id + "v" + mod.version);
            
            for (const dep of JSON.parse(version.dependencies)) {
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
            await this.addMod(mod.url, version, autoUpd, mod.mod_id);
        }
    }
    checkVerification = async function(url, version, modid) {
        return await new Promise((resolve, reject) => {
            try {
                if(version.verified !== 1) {
                    this.confirmPopup(`Mod ${modid} v${version.version} is unverified. Do you want to add it anyway?`, () => resolve(false), () => resolve(true));
                    return;
                }
                fetch(url).then(res => res.json()).then(resJson => {
                    for(let mod of resJson) {
                        if(version.version === mod.name) {
                            if((new Date(mod.last_modified)) > (new Date(version.verified_at))) {
                                resolve(true)
                            } else {
                                this.confirmPopup(`Mod ${modid} v${version.version} has been altered after verification. Adding it is at your own risk. Add anyway?`, () => resolve(false), () => resolve(true));
                            }
                        }
                    }
                }).catch(err => {
                    this.confirmPopup(`Failed to verify ${modid} v${version.version}. Do you want to add it anyway?`, () => resolve(false), () => resolve(true));
                });
            } catch (err) {
                this.confirmPopup(`Failed to verify ${modid} v${version.version}. Do you want to add it anyway?`, () => resolve(false), () => resolve(true));
            }
        })
    }
    addMod = async function(modurl, modversion, autoUpd, modId) {
        const shouldProceed = await this.checkVerification(modurl, modversion, modId)
        if(!shouldProceed) {
            this.apml.getMod("pmlcore").createModScreen(this.soundInst);
            this.menuUI();
            return;
        }
        if (modurl.endsWith('/')) {
            modurl = modurl.slice(0, -1);
        }
        
        this.apml.addMod({ base: modurl, version: modversion.version, loaded: true }, autoUpd)
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
    getHighestVersion = function(_versions) {
        const versions = Object.values(JSON.parse(_versions));
        
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
    getModList = async function() {
        const modlistUrl = "https://mods.polymodloader.com/api/mods";
        
        const modlistResponse = await fetch(modlistUrl);
        if (!modlistResponse.ok) throw new Error("Failed to fetch modlist");
        
        const mods = await modlistResponse.json();
        console.log(mods["results"])
        return mods["results"];
    }
    getVersions = async function() {
        const versionsUrl = "https://mods.polymodloader.com/api/versions";
        
        const versionsResponse = await fetch(versionsUrl);
        if (!versionsResponse.ok) throw new Error("Failed to fetch modlist");
        
        const versions = await versionsResponse.json();
        console.log(versions["results"])
        return versions["results"];
    }
    getModInfo = async function(_mods, refresh=false) {
        const mods = refresh ? (await this.getModList()) : _mods;
        if(refresh) this.everyVersion = await this.getVersions();
        console.log(mods)
        
    
        const icons = this.getIcons(mods);
    
        const tagSet = new Set();

        Object.values(mods).forEach((mod) => {
            if (Array.isArray(JSON.parse(mod.tags))) {
                JSON.parse(mod.tags).forEach(tag => tagSet.add(tag));
            }
        });
    
        let allTags = Array.from(tagSet).sort((a, b) => {
            if (a === "Other") return 1;
            if (b === "Other") return -1;
            return a.localeCompare(b);
        });
    
        this.createTagBar(Array.from(allTags));
        
        mods.forEach((mod) => {
            this.createModEntry(mod, icons);
        });
    };
    createChangelog = async function(thisMod) {
    
        const loader = document.createElement("p");
        loader.textContent = "Loading Changelogs...";
    
        this.changelog.appendChild(loader);
        this.changelog.scrollTop = "0";
        for(const version of this.getVersionsForMod(thisMod.mod_id)) {
            console.log(version)
            const versiondiv = document.createElement("div");
            versiondiv.className = `changelog-entry ${version.version}`;
            this.changelog.appendChild(versiondiv);

            const versionText = document.createElement("p");
            versionText.textContent = `Version: ${version.version}`;
            versionText.style.padding = "20px 20px 0 20px";
            versionText.style.fontSize = "40px";
            versionText.style.margin = "0";
            
            const logText = document.createElement("p")
            logText.innerHTML = `<p>${version.changelog || ''}</p>`;
            logText.style.padding = "0 20px 20px 20px";
            logText.style.fontSize = "20px";
            logText.style.margin = "0";

            loader.remove();

            versiondiv.appendChild(versionText);
            versiondiv.appendChild(logText);
        }
    
        this.changelog.classList.add("created");
    };
    getDescription = async function(modId, thisMod) {
        console.log(thisMod)
        const version = this.getHighestVersion(thisMod.game_versions);
        const url = `${thisMod.url}/${version}/description.html`;
        
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
        const fragment = document.createDocumentFragment();
    
        let versionDivs = []

        for(const version of this.getVersionsForMod(modId)) {
            const versiondiv = document.createElement("div");
            versiondiv.className = `versions-entry ${version.version}`;

            const versionText = document.createElement("p");
            versionText.textContent = `Version: ${version.version}`;
            versionText.style.padding = "20px";
            versionText.style.fontSize = "40px";
            versionText.style.margin = "0";
            versionText.style.width = "300px";

            const supportedPolyVersions = document.createElement("p");
            supportedPolyVersions.style.marginLeft = "50px";
            supportedPolyVersions.style.width = "100px";
            supportedPolyVersions.innerHTML = JSON.parse(version.game_versions).join("<br>");

            // const timeStamp = document.createElement("p");
            // timeStamp.style.marginLeft = "100px";
            // timeStamp.textContent = this.timeAgo(lastModified, modifiedBy);

            const addButton = document.createElement("button");
            addButton.className = "library-add-button button";
            addButton.innerHTML = `<img src="images/apply.svg"> Add`;
            addButton.onclick = async () => await this.getDependencies(mod, version);
            addButton.style.margin = "20px 20px 20px auto";
            addButton.style.height = "40px";
            addButton.style.width = "130px";
            addButton.style.fontSize = "25px";

            if (this.apml.getMod(modId)) {
                addButton.disabled = true;
                addButton.style.cursor = "not-allowed";
            }
            console.log(JSON.parse(version.game_versions).includes(this.gameVersion))
            if (
                !JSON.parse(version.game_versions).includes(this.gameVersion)
            ) {
                addButton.disabled = true;
                versiondiv.style.opacity = "0.5";
                versiondiv.style.background = "black";
                addButton.style.background = "black";
                addButton.style.cursor = "not-allowed";
            }

            versiondiv.appendChild(versionText);
            versiondiv.appendChild(supportedPolyVersions);
            // versiondiv.appendChild(timeStamp);
            versiondiv.appendChild(addButton);
            versionDivs.push(versiondiv)
        }

        loader.remove();

        for (const div of versionDivs) {
            if (div) fragment.appendChild(div);
        }

        this.vers.appendChild(fragment);
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
      "Uh", {
      type: MixinType.INSERT,
      token: `(0, R.GG)(this, Eh, [], "f");`,
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

        (0, R.gn)(this, Sh, "f").appendChild(modButton);
        (0, R.gn)(this, kh, "f").push(modButton);
      `
  });
  };
  postInit = () => {
    console.log(`Hello from ${this.modName}, but postInit this time!`);
  };
  simInit = () => {};
}

export let polyMod = new PMLCoreMod();
