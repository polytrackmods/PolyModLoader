import { MixinType, PolyMod, PolyModLoader } from "https://cdn.polymodloader.com/cb/PolyTrackMods/PolyModLoader/0.6.0/PolyTypes.js";

const ObfNames = {
    Editor: {
        CategoriesEnum: "gd.A",
        BlocksEnum: "fd.A",
        BlockRegister: "mi.yD",
        BlockMap: "E.BlockMap",
        BlockMapInternal: "g",

        SimCategories: "pv", // porting needed
        SimBlocks: "dd", // porting needed
        SimBlockRegister: "bv",// porting needed
        SimBlockMap: "_box",// porting needed

        BlockConfig: "E.BlockConfig",
        BlockConfigInternal: "d",
        BoundType: "i(2247).A",

        SimBlockConfig: "xv",// porting needed
        SimBoundType: "qh",// porting needed

        Color: {
            Environment: "mi.Environment",
            EnvironmentInternal: "c",
            Custom: "mi.Custom",
            CutomInternal: "h",

            SimEnvironment: "wv",// porting needed
            SimCustom: "yv",// porting needed
        },
    },
    Mixins: {
        Editor: {
            IgnoreOnExportToken: `for (const r of (0, d.gn)(this, o, "f")) {`,
            BlockInitClass: `vd`,
            EditorConstructor: `constructor(t, e, n, s, o, a, r, h, l, c, d, g, f, p) {`,
            BlockConfigExports: `l1: () => m, yD: () => u`,
        }
    },
    SoundClass: "gl",// porting needed
}

enum BoundType {
    Checkpoint = 0,
    Finish = 1
}

type ExtraSettings = {
    specialSettings: undefined | { type: BoundType, center: number[], size: number[] }
    ignoreOnExport: undefined | boolean
}

enum BlockColors {
    Environment,
    Custon
}

class EditorExtras {
    editorClass: any = null;
    pml: PolyModLoader;
    categoryDefaults: string[] = []
    ignoredBlocks: number[] = [];
    simExec: string[] = [];
    modelUrls = ["models/blocks.glb", "models/pillar.glb", "models/planes.glb", "models/road.glb", "models/road_wide.glb", "models/signs.glb", "models/wall_track.glb"];
    constructor(pml: PolyModLoader) {
        this.pml = pml;
    }
    construct(editorClass: any) {
        this.editorClass = editorClass;
    }

    blockNumberFromId(id: string): number {
        return this.pml.getFromPolyTrack(`${ObfNames.Editor.BlocksEnum}.${id}`) as number;
    }

    get getSimBlocks() {
        return [...this.simExec];
    }

    get trackEditorClass() {
        return this.editorClass;
    }

    registerModel(url: string) {
        this.modelUrls.push(url);
    }

    registerCategory(id: string, defaultId: string) {
        let latestCategory = (Object.keys(this.pml.getFromPolyTrack(ObfNames.Editor.CategoriesEnum)).length / 2) + 2
        this.pml.getFromPolyTrack(`${ObfNames.Editor.CategoriesEnum}[${ObfNames.Editor.CategoriesEnum}.${id} = ${latestCategory}]  =  "${id}"`);
        this.simExec.push(`${ObfNames.Editor.SimCategories}[${ObfNames.Editor.SimCategories}.${id} = ${latestCategory}]  =  "${id}"`);
        this.categoryDefaults.push(`case ${ObfNames.Editor.CategoriesEnum}.${id}:n = this.getPart(${ObfNames.Editor.BlocksEnum}.${defaultId});break;`)
    }

    registerBlock(id: string, categoryId: string, checksum: string, sceneName: string, colors: BlockColors, modelName: string, overlapSpace: number[][][], extraSettings: ExtraSettings) {
        let latestBlock = (Object.keys(this.pml.getFromPolyTrack(`${ObfNames.Editor.BlocksEnum}`)).length / 2) + 2
        this.pml.getFromPolyTrack(`${ObfNames.Editor.BlocksEnum}[${ObfNames.Editor.BlocksEnum}.${id} = ${latestBlock}]  =  "${id}"`);
        this.pml.getFromPolyTrack(`${ObfNames.Editor.BlockRegister}.push(new ${ObfNames.Editor.BlockConfig}(
            "${checksum}",
            ${ObfNames.Editor.CategoriesEnum}.${categoryId},
            ${ObfNames.Editor.BlocksEnum}.${id},
            [["${sceneName}", "${modelName}"]],
            ${colors === BlockColors.Environment ? ObfNames.Editor.Color.Environment : ObfNames.Editor.Color.Custom},
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
            ${colors === BlockColors.Environment ? ObfNames.Editor.Color.SimEnvironment : ObfNames.Editor.Color.SimCustom}
            ,${JSON.stringify(overlapSpace)}${extraSettings && extraSettings.specialSettings ? `, { type: ${BoundType[extraSettings.specialSettings.type]}, center: ${JSON.stringify(extraSettings.specialSettings.center)}, size: ${JSON.stringify(extraSettings.specialSettings.size)}}` : ""}))`);
        this.simExec.push(`${ObfNames.Editor.SimBlockMap}.clear();for (const e of ${ObfNames.Editor.SimBlockRegister}) {if (!${ObfNames.Editor.SimBlockMap}.has(e.id)){ ${ObfNames.Editor.SimBlockMap}.set(e.id, e);}; }`);
    }
    preInit() {
        this.pml.registerGlobalMixin({ type: MixinType.INSERT, token: ".SignArrowLeft);", func: `break;${this.categoryDefaults.join("")}` });
        this.pml.registerGlobalMixin({ type: MixinType.INSERT, token: `${ObfNames.Mixins.Editor.IgnoreOnExportToken}`, func: `if (ActivePolyModLoader.getMod("pmlapi").editorExtras.ignoredBlocks.includes(r)) {continue;};` });
        this.pml.registerGlobalMixin({ type: MixinType.INSERT, token: `${ObfNames.Mixins.Editor.BlockConfigExports}`, func: `, BlockMap: () => ${ObfNames.Editor.BlockMapInternal}, BlockConfig: () => ${ObfNames.Editor.BlockConfigInternal}` });
    }
    init() {
        this.pml.registerClassMixin(`${ObfNames.Mixins.Editor.BlockInitClass}.prototype`, "init", 
            { 
                type: MixinType.REPLACEBETWEEN,
                tokenStart: `(a = [`,
                tokenEnd: ` ],`, 
                func: `(a = ActivePolyModLoader.getMod("pmlapi").modelUrls,`
            });
    }
}
class PolyAPI extends PolyMod {
    editorExtras: EditorExtras | undefined;
    init = (pml: PolyModLoader) => {
        this.editorExtras = new EditorExtras(pml);
        this.editorExtras.preInit();
        pml.registerChunkMixin("124.bundle.js", { type: MixinType.INSERT, token: `${ObfNames.Mixins.Editor.EditorConstructor}`, func: `window.polyModLoader.getMod("${this.modID}").editorExtras.construct(this);` });
    }
}

export let polyMod = new PolyAPI();