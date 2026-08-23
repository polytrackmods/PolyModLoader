// src/0.2.0/main.mod.ts
import {
  PolyMod
} from "https://cdn.polymodloader.com/cb/PolyTrackMods/PolyModLoader/0.6.2/PolyTypes.js";

// src/0.2.0/obfuscation.ts
var ObfNames = {
  General: {
    THREE: {
      Vector3: `i(4922).Pq0`
    },
    SimVector3: `R`
  },
  Editor: {
    CategoriesEnum: "ru.A",
    BlocksEnum: "iu.A",
    BlockRegister: "i(2600).yD",
    BlockMap: "i(2600).BlockMap",
    BlockMapInternal: "f",
    CheckpointIdsRegister: "i(2600).bK",
    StartIdsRegister: "i(2600).l1",
    SimCheckpointIdsRegister: "uo",
    SimStartIdsRegister: "fo",
    SimCategories: "Xa",
    SimBlocks: "Za",
    SimBlockRegister: "ho",
    SimBlockMap: "co",
    BlockConfig: "i(2600).BlockConfig",
    BlockConfigInternal: "d",
    BoundType: "i(3080).A",
    SimBlockConfig: "lo",
    SimBoundType: "to",
    Color: {
      Environment: "i(2600).Environment",
      EnvironmentInternal: "c",
      Custom: "i(2600).Custom",
      CutomInternal: "h",
      SimEnvironment: "ao",
      SimCustom: "oo"
    }
  },
  Mixins: {
    Editor: {
      IgnoreOnExportToken: `for (const r of (0, d.gn)(this, o, "f")) {`,
      BlockInitClass: `ou`,
      BlockInitModelList: `r`,
      EditorBundle: "112.bundle.js",
      EditorConstructor: `constructor(t, e, n, s, o, a, r, h, l, c, d, g, f, p) {`,
      EditorDispose: `(t.removeChild((0, i.gn)(this, re, "f")),`,
      BlockConfigExports: `l1: () => m, yD: () => u`,
      EnterTrack: `((p.className = "content"), f.appendChild(p));`,
      ExitTrack: `((0, R.gn)(this, ii, "f").removeChild((0, R.gn)(this, oi, "f")),`
    },
    SimCom: {
      MSimClassExports: `n.d(t, { A: () => A`,
      MSimConstructor: `(0, r.gn)(this, h, "f").addEventListener("message", (e)`,
      MGetPrivateSim: `(0, r.gn)(this, h, "f")`,
      SMsgRcvFunc: `function r(i) {`
    },
    SoundManager: {
      SoundConstructor: `if ("running" != e.state)`
    }
  },
  SimCom: {
    IncomingData: `i`,
    SSimMessage: `Ki`
  },
  SoundManager: {
    GetBufferMap: `(0, R.gn)(this, v, "f")`
  }
};
var BoundType;
((BoundType2) => {
  BoundType2[BoundType2["Checkpoint"] = 0] = "Checkpoint";
  BoundType2[BoundType2["Finish"] = 1] = "Finish";
})(BoundType ||= {});
var BlockColors;
((BlockColors2) => {
  BlockColors2[BlockColors2["Environment"] = 0] = "Environment";
  BlockColors2[BlockColors2["Custom"] = 1] = "Custom";
})(BlockColors ||= {});

// src/0.2.0/editorExtras.ts
import { MixinType } from "https://cdn.polymodloader.com/cb/PolyTrackMods/PolyModLoader/0.6.2/PolyTypes.js";

// src/0.2.0/events.ts
class EventDispatcher {
  _listeners;
  addEventListener(type, listener) {
    if (this._listeners === undefined)
      this._listeners = {};
    const listeners = this._listeners;
    if (listeners[type] === undefined) {
      listeners[type] = [];
    }
    if (listeners[type].indexOf(listener) === -1) {
      listeners[type].push(listener);
    }
  }
  hasEventListener(type, listener) {
    const listeners = this._listeners;
    if (listeners === undefined)
      return false;
    return listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1;
  }
  removeEventListener(type, listener) {
    const listeners = this._listeners;
    if (listeners === undefined)
      return;
    const listenerArray = listeners[type];
    if (listenerArray !== undefined) {
      const index = listenerArray.indexOf(listener);
      if (index !== -1) {
        listenerArray.splice(index, 1);
      }
    }
  }
  dispatchEvent(event) {
    const listeners = this._listeners;
    if (listeners === undefined)
      return;
    const listenerArray = listeners[event.type];
    if (listenerArray !== undefined) {
      const array = listenerArray.slice(0);
      for (let i = 0, l = array.length;i < l; i++) {
        array[i].call(this, event);
      }
    }
  }
}

// src/0.2.0/editorExtras.ts
class EditorExtras extends EventDispatcher {
  editorClass = null;
  track = null;
  BoundType = BoundType;
  BlockColors = BlockColors;
  pml;
  _sc;
  currentTrack = null;
  registerStuffCallbacks = [];
  categoryDefaults = [];
  ignoredBlocks = [];
  registeredBlocks = [];
  modelUrls = [
    "models/blocks.glb",
    "models/pillar.glb",
    "models/planes.glb",
    "models/road.glb",
    "models/road_wide.glb",
    "models/signs.glb",
    "models/wall_track.glb"
  ];
  constructor(pml) {
    super();
    this.pml = pml;
  }
  _construct(editorClass, track) {
    this.editorClass = editorClass;
    this.track = track;
  }
  registerCallback(c) {
    this.registerStuffCallbacks.push(c);
  }
  blockNumberFromId(id) {
    return this.pml.getFromPolyTrack(`${ObfNames.Editor.BlocksEnum}.${id}`);
  }
  get trackEditorClass() {
    return this.editorClass;
  }
  registerModel(url) {
    this.modelUrls.push(url);
  }
  registerCategory(id, defaultId) {
    let latestCategory = Object.keys(this.pml.getFromPolyTrack(ObfNames.Editor.CategoriesEnum)).length / 2;
    this.pml.getFromPolyTrack(`${ObfNames.Editor.CategoriesEnum}[${ObfNames.Editor.CategoriesEnum}.${id} = ${latestCategory}]  =  "${id}"`);
    this.categoryDefaults.push(`case ${ObfNames.Editor.CategoriesEnum}.${id}:n = this.getPart(${ObfNames.Editor.BlocksEnum}.${defaultId});break;`);
  }
  registerBlock(id, categoryId, checksum, sceneName, modelName, colors, overlapSpace, extraSettings) {
    let latestBlock = Object.keys(this.pml.getFromPolyTrack(`${ObfNames.Editor.BlocksEnum}`)).length / 2 + 4;
    this.pml.getFromPolyTrack(`${ObfNames.Editor.BlocksEnum}[${ObfNames.Editor.BlocksEnum}.${id} = ${latestBlock}]  =  "${id}"`);
    this.pml.getFromPolyTrack(`const blockConfig = ${ObfNames.Editor.BlockConfig};const vec3 = ${ObfNames.General.THREE.Vector3};${ObfNames.Editor.BlockRegister}.push(new blockConfig(
            "${checksum}",
            ${ObfNames.Editor.CategoriesEnum}.${categoryId},
            ${ObfNames.Editor.BlocksEnum}.${id},
            [["${sceneName}", "${modelName}"]],
            ${colors === 0 /* Environment */ ? ObfNames.Editor.Color.Environment : ObfNames.Editor.Color.Custom},
            ${JSON.stringify(overlapSpace)},
            ${extraSettings && extraSettings.specialSettings ? `{ type: ${extraSettings.specialSettings.type}, center: ${JSON.stringify(extraSettings.specialSettings.center)}, size: ${JSON.stringify(extraSettings.specialSettings.size)}}` : "null"},
            ${extraSettings && extraSettings.startOffset ? `new vec3(${extraSettings.startOffset.x}, ${extraSettings.startOffset.y}, ${extraSettings.startOffset.z})` : "null"}))`);
    this.pml.getFromPolyTrack(`${ObfNames.Editor.BlockMap}.clear();for (const e of ${ObfNames.Editor.BlockRegister}) {if (!${ObfNames.Editor.BlockMap}.has(e.id)){ ${ObfNames.Editor.BlockMap}.set(e.id, e);}; }`);
    if (extraSettings && extraSettings.ignoreOnExport) {
      this.ignoredBlocks.push(this.blockNumberFromId(id));
      return;
    }
    this.pml.getFromPolyTrack(`
            for(const block of ${ObfNames.Editor.BlockRegister}) {
                if(block.detector?.type == ${0 /* Checkpoint */}) {
                    if(${ObfNames.Editor.CheckpointIdsRegister}.indexOf(block.id) === -1) {
                        ${ObfNames.Editor.CheckpointIdsRegister}.push(block.id);
                        console.log(${ObfNames.Editor.CheckpointIdsRegister});
                    }
                }
                if(block.startOffset != null) {
                    console.log(${ObfNames.Editor.StartIdsRegister}.indexOf(block.id))
                    if(${ObfNames.Editor.StartIdsRegister}.indexOf(block.id) === -1) {
                        ${ObfNames.Editor.StartIdsRegister}.push(block.id);
                        console.log(${ObfNames.Editor.StartIdsRegister});
                    }
                }
            }`);
    this.registeredBlocks.push({
      checksum,
      categoryId,
      id,
      sceneName,
      modelName,
      colors,
      overlapSpace,
      extraSettings
    });
  }
  _preInit() {
    this.pml.registerGlobalMixin({
      type: MixinType.INSERT,
      token: `${ObfNames.Mixins.Editor.IgnoreOnExportToken}`,
      func: `if (ActivePolyModLoader.getMod("pmlapi").editorExtras.ignoredBlocks.includes(r)) {continue;};`
    });
    this.pml.registerGlobalMixin({
      type: MixinType.INSERT,
      token: `${ObfNames.Mixins.Editor.BlockConfigExports}`,
      func: `, 
            BlockMap: () => ${ObfNames.Editor.BlockMapInternal}, 
            BlockConfig: () => ${ObfNames.Editor.BlockConfigInternal}, 
            Environment: () => ${ObfNames.Editor.Color.EnvironmentInternal},
            Custom: () => ${ObfNames.Editor.Color.CutomInternal}`
    });
    this.pml.registerChunkMixin(`${ObfNames.Mixins.Editor.EditorBundle}`, {
      type: MixinType.INSERT,
      token: `${ObfNames.Mixins.Editor.EditorConstructor}`,
      func: `window.polyModLoader.getMod("pmlapi").editorExtras._construct(this, o);
                   polyModLoader.getMod("pmlapi").editorExtras.dispatchEvent({ type: "entereditor", state: n });`
    });
    this.pml.registerChunkMixin(`${ObfNames.Mixins.Editor.EditorBundle}`, {
      type: MixinType.INSERT,
      token: `${ObfNames.Mixins.Editor.EditorDispose}`,
      func: `polyModLoader.getMod("pmlapi").editorExtras.dispatchEvent({ type: "exiteditor" }),`
    });
    this.pml.registerGlobalMixin({
      type: MixinType.INSERT,
      token: `${ObfNames.Mixins.Editor.EnterTrack}`,
      func: `polyModLoader.getMod("pmlapi").editorExtras.dispatchEvent({ type: "enteredtrack", name: a.name, author: a.author, lastModified: a.lastModified, isMultiplayer: s != null})`
    });
    this.pml.registerGlobalMixin({
      type: MixinType.INSERT,
      token: `${ObfNames.Mixins.Editor.ExitTrack}`,
      func: `polyModLoader.getMod("pmlapi").editorExtras.dispatchEvent({ type: "exitedtrack" }),`
    });
    this.addEventListener("enteredtrack", (e) => {
      this.currentTrack = { name: e.name, author: e.author, lastModified: e.lastModified };
    });
    this.addEventListener("exitedtrack", (e) => {
      this.currentTrack = null;
    });
    this.addEventListener("exiteditor", (e) => {
      this.track = null, this.editorClass = null;
    });
  }
  _init() {
    this._sc = this.pml.getMod("pmlapi").simCommunicator;
    this._sc.addEventListener("onmessageout", (e) => {
      if (e.payload.messageType === this._sc.SimMessage.Init) {
        e.payload.blockCategories = this.pml.getFromPolyTrack(`${ObfNames.Editor.CategoriesEnum}`);
        e.payload.newBlocks = this.registeredBlocks;
        e.payload.blocksEnum = this.pml.getFromPolyTrack(`${ObfNames.Editor.BlocksEnum}`);
      }
    });
    this._sc.registerSimMessageCallback(this._sc.SimMessage.Init, `
             console.log(msg.data)
             for(const key of Object.keys(msg.data.blockCategories)) {
                ${ObfNames.Editor.SimCategories}[key] = msg.data.blockCategories[key];
             }
             for(const key of Object.keys(msg.data.blocksEnum)) {
                ${ObfNames.Editor.SimBlocks}[key] = msg.data.blocksEnum[key];
             }
             for(const block of msg.data.newBlocks) {
                ${ObfNames.Editor.SimBlockRegister}.push(new ${ObfNames.Editor.SimBlockConfig}(
                    block.checksum,
                    ${ObfNames.Editor.SimCategories}[block.categoryId],
                    ${ObfNames.Editor.SimBlocks}[block.id],
                    [[block.sceneName, block.modelName]],
                    block.colors === ${0 /* Environment */} ? ${ObfNames.Editor.Color.SimEnvironment} : ${ObfNames.Editor.Color.SimCustom},
                    block.overlapSpace,
                    block.extraSettings && block.extraSettings.specialSettings ? { type: block.extraSettings.specialSettings.type, center: block.extraSettings.specialSettings.center, size: block.extraSettings.specialSettings.size} : null,
                    block.extraSettings && block.extraSettings.startOffset ? (new ${ObfNames.General.SimVector3}(block.extraSettings.startOffset.x, block.extraSettings.startOffset.y, block.extraSettings.startOffset.z)) : null));
             }
            for(const block of ${ObfNames.Editor.SimBlockRegister}) {
                if(block.detector?.type == ${0 /* Checkpoint */}) {
                    if(${ObfNames.Editor.SimCheckpointIdsRegister}.indexOf(block.id) === -1) {
                        ${ObfNames.Editor.SimCheckpointIdsRegister}.push(block.id);
                        console.log(${ObfNames.Editor.SimCheckpointIdsRegister});
                    }
                }
                if(block.startOffset != null) {
                    console.log(${ObfNames.Editor.SimStartIdsRegister}.indexOf(block.id))
                    if(${ObfNames.Editor.SimStartIdsRegister}.indexOf(block.id) === -1) {
                        ${ObfNames.Editor.SimStartIdsRegister}.push(block.id);
                        console.log(${ObfNames.Editor.SimStartIdsRegister});
                    }
                }
            }
             ${ObfNames.Editor.SimBlockMap}.clear();for (const e of ${ObfNames.Editor.SimBlockRegister}) {if (!${ObfNames.Editor.SimBlockMap}.has(e.id)){ ${ObfNames.Editor.SimBlockMap}.set(e.id, e);}; }`);
    this.pml.registerClassMixin(`${ObfNames.Mixins.Editor.BlockInitClass}.prototype`, "init", {
      type: MixinType.REPLACEBETWEEN,
      tokenStart: `${ObfNames.Mixins.Editor.BlockInitModelList} = [`,
      tokenEnd: `]`,
      func: `${ObfNames.Mixins.Editor.BlockInitModelList} = ActivePolyModLoader.getMod("pmlapi").editorExtras.modelUrls`
    });
    this.pml.registerClassMixin(`${ObfNames.Mixins.Editor.BlockInitClass}.prototype`, `getCategoryMesh`, {
      type: MixinType.INSERT,
      token: ".SignArrowLeft);",
      func: `break;${this.categoryDefaults.join("")}`
    });
  }
}

// src/0.2.0/simCommunicator.ts
import { MixinType as MixinType2 } from "https://cdn.polymodloader.com/cb/PolyTrackMods/PolyModLoader/0.6.2/PolyTypes.js";
var SimMessage;
((SimMessage2) => {
  SimMessage2[SimMessage2["Init"] = 0] = "Init";
  SimMessage2[SimMessage2["Verify"] = 1] = "Verify";
  SimMessage2[SimMessage2["TestDeterminism"] = 2] = "TestDeterminism";
  SimMessage2[SimMessage2["CreateCar"] = 3] = "CreateCar";
  SimMessage2[SimMessage2["DeleteCar"] = 4] = "DeleteCar";
  SimMessage2[SimMessage2["StartCar"] = 5] = "StartCar";
  SimMessage2[SimMessage2["ControlCar"] = 6] = "ControlCar";
  SimMessage2[SimMessage2["PauseCar"] = 7] = "PauseCar";
  SimMessage2[SimMessage2["VerifyResult"] = 8] = "VerifyResult";
  SimMessage2[SimMessage2["DeterminismResult"] = 9] = "DeterminismResult";
  SimMessage2[SimMessage2["UpdateResult"] = 10] = "UpdateResult";
  SimMessage2[SimMessage2["UpdateMessages"] = 11] = "UpdateMessages";
  SimMessage2[SimMessage2["UpdateCallbacks"] = 12] = "UpdateCallbacks";
})(SimMessage ||= {});

class SimCommunicator extends EventDispatcher {
  pml;
  RealtimeSim;
  SimMessage = SimMessage;
  simMessageCallbacks = {
    Init: [
      `   for(const key of Object.keys(msg.data.simMessages)) {
                    ${ObfNames.SimCom.SSimMessage}[key] = msg.data.simMessages[key];
                }`
    ],
    UpdateCallbacks: [
      `callbacks = msg.data.cb`
    ],
    UpdateMessages: [
      `for(const key of Object.keys(msg.data.simMessages)) {
                ${ObfNames.SimCom.SSimMessage}[key] = msg.data.simMessages[key];
             }`
    ]
  };
  GhostSim;
  AllSims = [];
  constructor(pml) {
    super();
    this.pml = pml;
    this.addEventListener("onmessageout", (e) => {
      if (e.payload.messageType === 0 /* Init */) {
        e.payload.simMessages = SimMessage;
        e.payload.cb = this.simMessageCallbacks;
      }
    });
  }
  _preInit() {
    this.pml.registerGlobalMixin({
      type: MixinType2.REPLACEBETWEEN,
      tokenStart: `${ObfNames.Mixins.SimCom.MSimConstructor}`,
      tokenEnd: `${ObfNames.Mixins.SimCom.MSimConstructor}`,
      func: `polyModLoader.getMod("pmlapi").simCommunicator._registerSimWorker(${ObfNames.Mixins.SimCom.MGetPrivateSim}, e),${ObfNames.Mixins.SimCom.MSimConstructor}`
    });
    this.pml.registerSimWorkerMixin({
      type: MixinType2.REPLACEBETWEEN,
      tokenStart: `${ObfNames.Mixins.SimCom.SMsgRcvFunc}`,
      tokenEnd: `${ObfNames.Mixins.SimCom.SMsgRcvFunc}`,
      func: ` var callbacks = ${JSON.stringify(this.simMessageCallbacks)};
                    var runCallbacks = (msg) => {
                        if(msg.data.messageType === ${0 /* Init */}) callbacks = msg.data.cb;
                        for (const cb of callbacks[${ObfNames.SimCom.SSimMessage}[msg.data.messageType]] || []) {
                            eval(cb);
                        }
                    }
                    ${ObfNames.Mixins.SimCom.SMsgRcvFunc}`
    });
    this.pml.registerSimWorkerMixin({
      type: MixinType2.INSERT,
      token: `${ObfNames.Mixins.SimCom.SMsgRcvFunc}`,
      func: `runCallbacks(${ObfNames.SimCom.IncomingData});`
    });
  }
  _registerSimWorker(worker, isRealtime) {
    let isMainSim = false;
    if (isRealtime && !this.RealtimeSim) {
      this.RealtimeSim = worker;
      isMainSim = true;
    }
    if (!isRealtime && !this.GhostSim) {
      this.GhostSim = worker;
      isMainSim = true;
    }
    this.AllSims.push(worker);
    worker.addEventListener("message", (e) => {
      this.dispatchEvent({
        type: "onmessagein",
        isRealtime,
        isMainSim,
        event: e
      });
    });
    let _this = this;
    worker.originalPostMessage = worker.postMessage;
    worker.postMessage = function(message, idk) {
      if (message != null && message.messageType != null) {
        _this.dispatchEvent({ type: "onmessageout", isRealtime, isMainSim, payload: message });
      }
      worker.originalPostMessage(message, idk);
    };
    this.dispatchEvent({ type: "newsimworker", worker, isRealtime, isMainSim });
  }
  registerSimMessage(name) {
    const nextId = Object.keys(SimMessage).length / 2;
    SimMessage[SimMessage[name] = nextId] = name;
    this.broadcastMessage({ messageType: 11 /* UpdateMessages */, simMessages: SimMessage });
    console.log(SimMessage);
    return SimMessage[name];
  }
  broadcastMessage(payload) {
    if (payload.messageType === null) {
      console.error("Sim messages need to contain a messageType!");
      return;
    }
    for (let sim of this.AllSims) {
      sim.postMessage(payload);
    }
  }
  registerSimMessageCallback(message, func) {
    this.simMessageCallbacks[SimMessage[message]] || (this.simMessageCallbacks[SimMessage[message]] = []);
    this.simMessageCallbacks[SimMessage[message]].push(func);
    this.broadcastMessage({ messageType: 12 /* UpdateCallbacks */, cb: this.simMessageCallbacks });
  }
}

// src/0.2.0/soundManager.ts
import { MixinType as MixinType3 } from "https://cdn.polymodloader.com/cb/PolyTrackMods/PolyModLoader/0.6.2/PolyTypes.js";
class SoundManager extends EventDispatcher {
  soundClass = null;
  buffers;
  soundOverrides = {};
  pml;
  constructor(pml) {
    super();
    this.pml = pml;
  }
  _preInit() {
    this.pml.registerGlobalMixin({
      type: MixinType3.REPLACEBETWEEN,
      tokenStart: `${ObfNames.Mixins.SoundManager.SoundConstructor}`,
      tokenEnd: `${ObfNames.Mixins.SoundManager.SoundConstructor}`,
      func: `polyModLoader.getMod("pmlapi").soundManager.buffers = ${ObfNames.SoundManager.GetBufferMap};${ObfNames.Mixins.SoundManager.SoundConstructor}
                   polyModLoader.getMod("pmlapi").soundManager.soundClass = this;
                   polyModLoader.getMod("pmlapi").soundManager.dispatchEvent({ type: "soundclassattached" })
                   `
    });
  }
  getBuffer(e) {
    return this.soundClass.getBuffer(e);
  }
  _loadFromUrls(urls, callback) {
    const i = this.soundClass.context;
    console.log(i, urls);
    if (i == null)
      callback(null);
    else if (urls.length == 0)
      callback(null);
    else {
      const r = urls[0], a = new XMLHttpRequest;
      a.open("GET", r, true);
      a.responseType = "arraybuffer";
      a.onload = () => {
        i.decodeAudioData(a.response).then((e) => {
          callback(e);
        }).catch(() => {
          this._loadFromUrls.call(this, urls.slice(1), callback);
        });
      };
      a.send();
    }
  }
  overrideImmediate(id, newid) {
    this.buffers.set(id, this.buffers.get(newid));
  }
  load(id, urls) {
    this._loadFromUrls(urls, (buffer) => {
      console.log(buffer);
      buffer == null ? (console.warn('Audio "' + id + '" failed to load'), this.buffers.set(id, null)) : this.buffers.set(id, buffer);
    });
  }
  playUIClick() {
    this.soundClass.playUIClick();
  }
}

// src/0.2.0/main.mod.ts
class PMLAPI extends PolyMod {
  editorExtras;
  simCommunicator;
  ObfNames = ObfNames;
  soundManager;
  pml;
  preInit = (pml) => {
    this.simCommunicator = new SimCommunicator(pml);
    this.editorExtras = new EditorExtras(pml);
    this.soundManager = new SoundManager(pml);
    this.simCommunicator._preInit();
    this.soundManager._preInit();
    this.editorExtras._preInit();
  };
  init = async (pml) => {
    this.editorExtras?.registerStuffCallbacks.forEach((c) => c());
    this.editorExtras?._init();
  };
  postInit = () => {};
}
var polyMod = new PMLAPI;
export {
  polyMod
};
