// src/0.1.3/main.mod.ts
import { MixinType, PolyMod } from "https://cdn.polymodloader.com/cb/PolyTrackMods/PolyModLoader/0.6.0/PolyTypes.js";
var ObfNames = {
  Editor: {
    CategoriesEnum: "gd.A",
    BlocksEnum: "fd.A",
    BlockRegister: "mi.yD",
    BlockMap: "E.BlockMap",
    BlockMapInternal: "g",
    SimCategories: "pv",
    SimBlocks: "dd",
    SimBlockRegister: "bv",
    SimBlockMap: "_box",
    BlockConfig: "E.BlockConfig",
    BlockConfigInternal: "d",
    BoundType: "i(2247).A",
    SimBlockConfig: "xv",
    SimBoundType: "qh",
    Color: {
      Environment: "mi.Environment",
      EnvironmentInternal: "c",
      Custom: "mi.Custom",
      CutomInternal: "h",
      SimEnvironment: "wv",
      SimCustom: "yv"
    }
  },
  Mixins: {
    Editor: {
      IgnoreOnExportToken: `for (const r of (0, d.gn)(this, o, "f")) {`,
      BlockInitClass: `vd`,
      EditorConstructor: `constructor(t, e, n, s, o, a, r, h, l, c, d, g, f, p) {`,
      BlockConfigExports: `l1: () => m, yD: () => u`
    }
  },
  SoundClass: "gl"
};
var BoundType;
((BoundType2) => {
  BoundType2[BoundType2["Checkpoint"] = 0] = "Checkpoint";
  BoundType2[BoundType2["Finish"] = 1] = "Finish";
})(BoundType ||= {});
class EditorExtras {
  editorClass = null;
  pml;
  categoryDefaults = [];
  ignoredBlocks = [];
  simExec = [];
  modelUrls = ["models/blocks.glb", "models/pillar.glb", "models/planes.glb", "models/road.glb", "models/road_wide.glb", "models/signs.glb", "models/wall_track.glb"];
  constructor(pml) {
    this.pml = pml;
  }
  construct(editorClass) {
    this.editorClass = editorClass;
  }
  blockNumberFromId(id) {
    return this.pml.getFromPolyTrack(`${ObfNames.Editor.BlocksEnum}.${id}`);
  }
  get getSimBlocks() {
    return [...this.simExec];
  }
  get trackEditorClass() {
    return this.editorClass;
  }
  registerModel(url) {
    this.modelUrls.push(url);
  }
  registerCategory(id, defaultId) {
    let latestCategory = Object.keys(this.pml.getFromPolyTrack(ObfNames.Editor.CategoriesEnum)).length / 2 + 2;
    this.pml.getFromPolyTrack(`${ObfNames.Editor.CategoriesEnum}[${ObfNames.Editor.CategoriesEnum}.${id} = ${latestCategory}]  =  "${id}"`);
    this.simExec.push(`${ObfNames.Editor.SimCategories}[${ObfNames.Editor.SimCategories}.${id} = ${latestCategory}]  =  "${id}"`);
    this.categoryDefaults.push(`case ${ObfNames.Editor.CategoriesEnum}.${id}:n = this.getPart(${ObfNames.Editor.BlocksEnum}.${defaultId});break;`);
  }
  registerBlock(id, categoryId, checksum, sceneName, colors, modelName, overlapSpace, extraSettings) {
    let latestBlock = Object.keys(this.pml.getFromPolyTrack(`${ObfNames.Editor.BlocksEnum}`)).length / 2 + 2;
    this.pml.getFromPolyTrack(`${ObfNames.Editor.BlocksEnum}[${ObfNames.Editor.BlocksEnum}.${id} = ${latestBlock}]  =  "${id}"`);
    this.pml.getFromPolyTrack(`${ObfNames.Editor.BlockRegister}.push(new ${ObfNames.Editor.BlockConfig}(
            "${checksum}",
            ${ObfNames.Editor.CategoriesEnum}.${categoryId},
            ${ObfNames.Editor.BlocksEnum}.${id},
            [["${sceneName}", "${modelName}"]],
            ${colors === 0 /* Environment */ ? ObfNames.Editor.Color.Environment : ObfNames.Editor.Color.Custom},
            ${JSON.stringify(overlapSpace)}${extraSettings && extraSettings.specialSettings ? `, { type: ${BoundType[extraSettings.specialSettings.type]}, center: ${JSON.stringify(extraSettings.specialSettings.center)}, size: ${JSON.stringify(extraSettings.specialSettings.size)}}` : ""}))`);
    this.pml.getFromPolyTrack(`${ObfNames.Editor.BlockMap}.clear();for (const e of ${ObfNames.Editor.BlockRegister}) {if (!${ObfNames.Editor.BlockMap}.has(e.id)){ ${ObfNames.Editor.BlockMap}.set(e.id, e);}; }`);
    if (extraSettings && extraSettings.ignoreOnExport) {
      this.ignoredBlocks.push(this.blockNumberFromId(id));
      return;
    }
    this.simExec.push(`${ObfNames.Editor.SimBlocks}[${ObfNames.Editor.SimBlocks}.${id} = ${latestBlock}]  =  "${id}"`);
    this.simExec.push(`${ObfNames.Editor.SimBlockRegister}.push(new ${ObfNames.Editor.SimBlockConfig}(
            "${checksum}",
            ${ObfNames.Editor.SimCategories}.${categoryId},
            ${ObfNames.Editor.SimBlocks}.${id},
            [["${sceneName}", "${modelName}"]],
            ${colors === 0 /* Environment */ ? ObfNames.Editor.Color.SimEnvironment : ObfNames.Editor.Color.SimCustom}
            ,${JSON.stringify(overlapSpace)}${extraSettings && extraSettings.specialSettings ? `, { type: ${BoundType[extraSettings.specialSettings.type]}, center: ${JSON.stringify(extraSettings.specialSettings.center)}, size: ${JSON.stringify(extraSettings.specialSettings.size)}}` : ""}))`);
    this.simExec.push(`${ObfNames.Editor.SimBlockMap}.clear();for (const e of ${ObfNames.Editor.SimBlockRegister}) {if (!${ObfNames.Editor.SimBlockMap}.has(e.id)){ ${ObfNames.Editor.SimBlockMap}.set(e.id, e);}; }`);
  }
  preInit() {
    this.pml.registerGlobalMixin({ type: MixinType.INSERT, token: ".SignArrowLeft);", func: `break;${this.categoryDefaults.join("")}` });
    this.pml.registerGlobalMixin({ type: MixinType.INSERT, token: `${ObfNames.Mixins.Editor.IgnoreOnExportToken}`, func: `if (ActivePolyModLoader.getMod("pmlapi").editorExtras.ignoredBlocks.includes(r)) {continue;};` });
    this.pml.registerGlobalMixin({ type: MixinType.INSERT, token: `${ObfNames.Mixins.Editor.BlockConfigExports}`, func: `, BlockMap: () => ${ObfNames.Editor.BlockMapInternal}, BlockConfig: () => ${ObfNames.Editor.BlockConfigInternal}` });
  }
  init() {
    this.pml.registerClassMixin(`${ObfNames.Mixins.Editor.BlockInitClass}.prototype`, "init", {
      type: MixinType.REPLACEBETWEEN,
      tokenStart: `a = [`,
      tokenEnd: `]`,
      func: `a = ActivePolyModLoader.getMod("pmlapi").editorExtras.modelUrls`
    });
  }
}

class PolyAPI extends PolyMod {
  editorExtras;
  preInit = (pml) => {
    this.editorExtras = new EditorExtras(pml);
    this.editorExtras.preInit();
    pml.registerChunkMixin("124.bundle.js", { type: MixinType.INSERT, token: `${ObfNames.Mixins.Editor.EditorConstructor}`, func: `window.polyModLoader.getMod("${this.modID}").editorExtras.construct(this);console.log("EditorExtras!");` });
  };
  init = (pml) => {
    this.editorExtras?.init();
  };
}
var polyMod = new PolyAPI;
export {
  polyMod
};
