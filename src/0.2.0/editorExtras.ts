import { PolyModLoader, MixinType } from "https://cdn.polymodloader.com/cb/PolyTrackMods/PolyModLoader/0.6.2/PolyTypes.js";
import { PMLEvent, EventDispatcher } from "./events";
import { ObfNames, BlockColors, ExtraSettings, BoundType } from "./obfuscation";

export type EditorExtrasEventMap = {
    entereditor: Extract<PMLEvent, { type: "entereditor" }>;
    exiteditor: Extract<PMLEvent, { type: "exiteditor" }>;
    enteredtrack: Extract<PMLEvent, { type: "enteredtrack"}>;
    exitedtrack: Extract<PMLEvent, { type: "exitedtrack"}>;
};
export class EditorExtras extends EventDispatcher<EditorExtrasEventMap> {
    editorClass: any = null;
    track: any = null;
    pml: PolyModLoader;
    currentTrack: { name: string, author: string, lastModified: Date } | null = null;
    registerStuffCallbacks: Function[] = [];
    categoryDefaults: string[] = [];
    ignoredBlocks: number[] = [];
    simExec: string[] = [];
    modelUrls = [
        "models/blocks.glb",
        "models/pillar.glb",
        "models/planes.glb",
        "models/road.glb",
        "models/road_wide.glb",
        "models/signs.glb",
        "models/wall_track.glb",
    ];
    constructor(pml: PolyModLoader) {
        super()
        this.pml = pml;
    }
    _construct(editorClass: any, track: any) {
        this.editorClass = editorClass;
        this.track = track;
    }

    registerCallback(c: Function) {
        this.registerStuffCallbacks.push(c);
    }

    blockNumberFromId(id: string): number {
        return this.pml.getFromPolyTrack(
            `${ObfNames.Editor.BlocksEnum}.${id}`,
        ) as number;
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
        let latestCategory =
            Object.keys(this.pml.getFromPolyTrack(ObfNames.Editor.CategoriesEnum))
                .length / 2;
        this.pml.getFromPolyTrack(
            `${ObfNames.Editor.CategoriesEnum}[${ObfNames.Editor.CategoriesEnum}.${id} = ${latestCategory}]  =  "${id}"`,
        );
        this.simExec.push(
            `${ObfNames.Editor.SimCategories}[${ObfNames.Editor.SimCategories}.${id} = ${latestCategory}]  =  "${id}"`,
        );
        this.categoryDefaults.push(
            `case ${ObfNames.Editor.CategoriesEnum}.${id}:n = this.getPart(${ObfNames.Editor.BlocksEnum}.${defaultId});break;`,
        );
    }

    registerBlock(
        id: string,
        categoryId: string,
        checksum: string,
        sceneName: string,
        modelName: string,
        colors: BlockColors,
        overlapSpace: number[][][],
        extraSettings?: ExtraSettings,
    ) {
        let latestBlock =
            Object.keys(this.pml.getFromPolyTrack(`${ObfNames.Editor.BlocksEnum}`))
                .length /
            2 +
            4;
        this.pml.getFromPolyTrack(
            `${ObfNames.Editor.BlocksEnum}[${ObfNames.Editor.BlocksEnum}.${id} = ${latestBlock}]  =  "${id}"`,
        );
        this.pml
            .getFromPolyTrack(`const blockConfig = ${ObfNames.Editor.BlockConfig};${ObfNames.Editor.BlockRegister}.push(new blockConfig(
            "${checksum}",
            ${ObfNames.Editor.CategoriesEnum}.${categoryId},
            ${ObfNames.Editor.BlocksEnum}.${id},
            [["${sceneName}", "${modelName}"]],
            ${colors === BlockColors.Environment ? ObfNames.Editor.Color.Environment : ObfNames.Editor.Color.Custom},
            ${JSON.stringify(overlapSpace)}${extraSettings && extraSettings.specialSettings ? `, { type: ${BoundType[extraSettings.specialSettings.type]}, center: ${JSON.stringify(extraSettings.specialSettings.center)}, size: ${JSON.stringify(extraSettings.specialSettings.size)}}` : ""}))`);
        this.pml.getFromPolyTrack(
            `${ObfNames.Editor.BlockMap}.clear();for (const e of ${ObfNames.Editor.BlockRegister}) {if (!${ObfNames.Editor.BlockMap}.has(e.id)){ ${ObfNames.Editor.BlockMap}.set(e.id, e);}; }`,
        );
        if (extraSettings && extraSettings.ignoreOnExport) {
            this.ignoredBlocks.push(this.blockNumberFromId(id));
            return;
        }
        this.simExec.push(
            `${ObfNames.Editor.SimBlocks}[${ObfNames.Editor.SimBlocks}.${id} = ${latestBlock}]  =  "${id}"`,
        );
        this.simExec
            .push(`${ObfNames.Editor.SimBlockRegister}.push(new ${ObfNames.Editor.SimBlockConfig}(
            "${checksum}",
            ${ObfNames.Editor.SimCategories}.${categoryId},
            ${ObfNames.Editor.SimBlocks}.${id},
            [["${sceneName}", "${modelName}"]],
            ${colors === BlockColors.Environment ? ObfNames.Editor.Color.SimEnvironment : ObfNames.Editor.Color.SimCustom}
            ,${JSON.stringify(overlapSpace)}${extraSettings && extraSettings.specialSettings ? `, { type: ${BoundType[extraSettings.specialSettings.type]}, center: ${JSON.stringify(extraSettings.specialSettings.center)}, size: ${JSON.stringify(extraSettings.specialSettings.size)}}` : ""}))`);
        this.simExec.push(
            `${ObfNames.Editor.SimBlockMap}.clear();for (const e of ${ObfNames.Editor.SimBlockRegister}) {if (!${ObfNames.Editor.SimBlockMap}.has(e.id)){ ${ObfNames.Editor.SimBlockMap}.set(e.id, e);}; }`,
        );
    }
    _preInit() {
        this.pml.registerGlobalMixin({
            type: MixinType.INSERT,
            token: `${ObfNames.Mixins.Editor.IgnoreOnExportToken}`,
            func: `if (ActivePolyModLoader.getMod("pmlapi").editorExtras.ignoredBlocks.includes(r)) {continue;};`,
        });
        this.pml.registerGlobalMixin({
            type: MixinType.INSERT,
            token: `${ObfNames.Mixins.Editor.BlockConfigExports}`,
            func: `, 
            BlockMap: () => ${ObfNames.Editor.BlockMapInternal}, 
            BlockConfig: () => ${ObfNames.Editor.BlockConfigInternal}, 
            Environment: () => ${ObfNames.Editor.Color.EnvironmentInternal},
            Custom: () => ${ObfNames.Editor.Color.CutomInternal}`,
        });
        this.pml.registerChunkMixin(`${ObfNames.Mixins.Editor.EditorBundle}`, {
            type: MixinType.INSERT,
            token: `${ObfNames.Mixins.Editor.EditorConstructor}`,
            func: `window.polyModLoader.getMod("pmlapi").editorExtras._construct(this, o);
                   polyModLoader.getMod("pmlapi").editorExtras.dispatchEvent({ type: "entereditor", state: n });`,
        });
        this.pml.registerChunkMixin(`${ObfNames.Mixins.Editor.EditorBundle}`, {
            type: MixinType.INSERT,
            token: `${ObfNames.Mixins.Editor.EditorDispose}`,
            func: `polyModLoader.getMod("pmlapi").editorExtras.dispatchEvent({ type: "exiteditor" });`,
        });
        this.pml.registerGlobalMixin({
            type: MixinType.INSERT,
            token: `${ObfNames.Mixins.Editor.EnterTrack}`,
            func: `polyModLoader.getMod("pmlapi").editorExtras.dispatchEvent({ type: "enteredtrack", name: a.name, author: a.author, lastModified: a.lastModified, isMultiplayer: s != null})`
        })
        this.pml.registerGlobalMixin({
            type: MixinType.INSERT,
            token: `${ObfNames.Mixins.Editor.ExitTrack}`,
            func: `polyModLoader.getMod("pmlapi").editorExtras.dispatchEvent({ type: "exitedtrack" }),`
        })
        this.addEventListener("enteredtrack", e => { this.currentTrack = { name: e.name, author: e.author, lastModified: e.lastModified } })
        this.addEventListener("exitedtrack", e => { this.currentTrack = null });
        this.addEventListener("exiteditor", e => { this.track = null, this.editorClass = null });
    }
    _init() {
        this.pml.registerClassMixin(
            `${ObfNames.Mixins.Editor.BlockInitClass}.prototype`,
            "init",
            {
                type: MixinType.REPLACEBETWEEN,
                tokenStart: `${ObfNames.Mixins.Editor.BlockInitModelList} = [`,
                tokenEnd: `]`,
                func: `${ObfNames.Mixins.Editor.BlockInitModelList} = ActivePolyModLoader.getMod("pmlapi").editorExtras.modelUrls`,
            },
        );
        this.pml.registerClassMixin(
            `${ObfNames.Mixins.Editor.BlockInitClass}.prototype`,
            `getCategoryMesh`,
            {
                type: MixinType.INSERT,
                token: ".SignArrowLeft);",
                func: `break;${this.categoryDefaults.join("")}`,
            },
        );
    }
}
