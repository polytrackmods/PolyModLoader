import {
  PolyMod,
  MixinType,
} from "https://cdn.polymodloader.com/cb/polytrackmods/PolyModLoader/0.6.0-beta1/PolyModLoader.js";


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
    fetch(`${mod.baseUrl}/${mod.modVersion}/description.html`)
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
    promptDiv.className = "nickname";

    let modUrlHead = document.createElement("h1");
    modUrlHead.innerText = "Mod URL";
    modUrlHead.style = "float: left;";
    promptDiv.appendChild(modUrlHead);

    let urlInput = document.createElement("input");
    urlInput.type = "text";
    promptDiv.appendChild(urlInput);

    let modVersionHead = document.createElement("h1");
    modVersionHead.innerText = "Mod Version";
    modVersionHead.style = "float: left;";
    promptDiv.appendChild(modVersionHead);

    let versionInput = document.createElement("input");
    versionInput.type = "text";
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
      if (elem.classList.contains("menu")) {
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
    modsDiv.className = "track-info";

    let availableModsList = document.createElement("div");
    availableModsList.className = "leaderboard";

    let availableModsLabel = document.createElement("h2");
    availableModsLabel.textContent = "Available";
    availableModsList.appendChild(availableModsLabel);

    let activatedModsList = document.createElement("div");
    activatedModsList.className = "leaderboard";

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
    console.log(`Hello from ${this.modName}!`);
    this.modPmlInstance.registerFuncMixin(
      "th",
      MixinType.INSERT,
      `(0, R.GG)(this, Jc, [], "f");`,
      `
        const modButton = document.createElement("button");
        modButton.className = "button button-image";
        modButton.innerHTML = '<img src="images/load.svg">';
        modButton.addEventListener("click", () => {
          n.playUIClick();
          for (let polyMod of ActivePolyModLoader.getAllMods()) {
            if (polyMod.modID === "pmlcore") {
              console.log(polyMod);
              polyMod.createModScreen(n);
            }
          }
        });

        const modTextContainer = document.createElement("p");
        modTextContainer.textContent = "Mods";
        modButton.appendChild(modTextContainer);

        (0, R.gn)(this, Kc, "f").appendChild(modButton);
        (0, R.gn)(this, qc, "f").push(modButton);
      `
    );
  };
  postInit = () => {
    console.log(`Hello from ${this.modName}, but postInit this time!`);
  };
  simInit = () => {};
}

export let polyMod = new PMLCoreMod();
