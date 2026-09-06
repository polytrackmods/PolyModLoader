import { PolyModLoader, MixinType } from "https://cdn.polymodloader.com/cb/PolyTrackMods/PolyModLoader/0.6.2/PolyTypes.js";
import { PMLEvent, EventDispatcher } from "./events";
import { ObfNames, BlockColors, ExtraSettings, BoundType } from "./obfuscation";
import { SimCommunicator } from "./simCommunicator";

export type EditorExtrasEventMap = {
    entereditor: Extract<PMLEvent, { type: "entereditor" }>;
    exitededitor: Extract<PMLEvent, { type: "exitededitor" }>;
    enteredtrack: Extract<PMLEvent, { type: "enteredtrack"}>;
    exitedtrack: Extract<PMLEvent, { type: "exitedtrack"}>;
};
export class EditorExtras extends EventDispatcher<EditorExtrasEventMap> {
    editorClass: any = null;
    track: any = null;
    BoundType = BoundType;
    BlockColors = BlockColors;
    pml: PolyModLoader;
    _sc: SimCommunicator | undefined;
    currentTrack: { name: string, author: string, lastModified: Date } | null = null;
    registerStuffCallbacks: Function[] = [];
    categoryDefaults: string[] = [];
    ignoredBlocks: number[] = [];
    registeredBlocks: {
        id: string,
        categoryId: string,
        checksum: string,
        sceneName: string,
        modelName: string,
        colors: BlockColors,
        overlapSpace: number[][][],
        extraSettings?: ExtraSettings,
    }[] = [];
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
        this.pml.getFromPolyTrack(`const blockConfig = ${ObfNames.Editor.BlockConfig};const vec3 = ${ObfNames.General.THREE.Vector3};${ObfNames.Editor.BlockRegister}.push(new blockConfig(
            "${checksum}",
            ${ObfNames.Editor.CategoriesEnum}.${categoryId},
            ${ObfNames.Editor.BlocksEnum}.${id},
            [["${sceneName}", "${modelName}"]],
            ${colors === BlockColors.Environment ? ObfNames.Editor.Color.Environment : ObfNames.Editor.Color.Custom},
            ${JSON.stringify(overlapSpace)},
            ${extraSettings && extraSettings.specialSettings ? `{ type: ${extraSettings.specialSettings.type}, center: ${JSON.stringify(extraSettings.specialSettings.center)}, size: ${JSON.stringify(extraSettings.specialSettings.size)}}` : "null"},
            ${extraSettings && extraSettings.startOffset ? `new vec3(${extraSettings.startOffset.x}, ${extraSettings.startOffset.y}, ${extraSettings.startOffset.z})` : "null"}))`
        );
        this.pml.getFromPolyTrack(`${ObfNames.Editor.BlockMap}.clear();for (const e of ${ObfNames.Editor.BlockRegister}) {if (!${ObfNames.Editor.BlockMap}.has(e.id)){ ${ObfNames.Editor.BlockMap}.set(e.id, e);}; }`);
        if (extraSettings && extraSettings.ignoreOnExport) {
            this.ignoredBlocks.push(this.blockNumberFromId(id));
            return;
        }
        this.pml.getFromPolyTrack(`
            for(const block of ${ObfNames.Editor.BlockRegister}) {
                if(block.detector?.type == ${BoundType.Checkpoint}) {
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
            func: `polyModLoader.getMod("pmlapi").editorExtras.dispatchEvent({ type: "exitededitor" }),`,
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
        this.addEventListener("exitededitor", e => { this.track = null, this.editorClass = null });
    }
    _init() {
        this._sc = (this.pml.getMod("pmlapi") as any).simCommunicator as SimCommunicator
        this._sc!.addEventListener("onmessageout", (e) => {
            if(e.payload.messageType === this._sc!.SimMessage.Init) {
                e.payload.blockCategories = this.pml.getFromPolyTrack(`${ObfNames.Editor.CategoriesEnum}`)
                e.payload.newBlocks = this.registeredBlocks;
                e.payload.blocksEnum = this.pml.getFromPolyTrack(`${ObfNames.Editor.BlocksEnum}`);
            }
        })
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
                    block.colors === ${BlockColors.Environment} ? ${ObfNames.Editor.Color.SimEnvironment} : ${ObfNames.Editor.Color.SimCustom},
                    block.overlapSpace,
                    block.extraSettings && block.extraSettings.specialSettings ? { type: block.extraSettings.specialSettings.type, center: block.extraSettings.specialSettings.center, size: block.extraSettings.specialSettings.size} : null,
                    block.extraSettings && block.extraSettings.startOffset ? (new ${ObfNames.General.SimVector3}(block.extraSettings.startOffset.x, block.extraSettings.startOffset.y, block.extraSettings.startOffset.z)) : null));
             }
            for(const block of ${ObfNames.Editor.SimBlockRegister}) {
                if(block.detector?.type == ${BoundType.Checkpoint}) {
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
