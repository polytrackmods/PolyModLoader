import { PolyMod, MixinType} from "https://cdn.polymodloader.com/cb/PolyTrackMods/PolyModLoader/0.5.2/PolyModLoader.js"

export class SoundManager {
    constructor(pml, soundClass) {
        this.pml = pml;
        this.soundClass = soundClass;
    }
    registerSound(id, url) {
        this.soundClass.load(id, url);
    }
    playSound(id, gain) {
        const e = this.soundClass.getBuffer(id);
        if (null != e && null != this.soundClass.context && null != this.soundClass.destinationSfx) {
            const t = this.soundClass.context.createBufferSource();
            t.buffer = e;
            const n = this.soundClass.context.createGain();
            n.gain.value = gain,
                t.connect(n),
                n.connect(this.soundClass.destinationSfx),
                t.start(0);
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
                t.start(0);
        }
    }
    registerSoundOverride(id, url) {
        this.pml.registerClassMixin(`soundClassHere.prototype`, "load", MixinType.INSERT, `ml(this, nl, "f").addResource(),`, `
            null;
            if(e === "${id}") {
                t = ["${url}"];
            }`);
    }
}

const ObfNames = {
    CategoriesEnum: "LA",
    BlocksEnum: "Mb",
    BlockRegister: "GA",
    BlockMap: "_box",
    SimCategories: "pv",
    SimBlocks: "dd",
    SimBlockRegister: "bv",
    SimBlockMap: "_box",

    BlockConfig: "HA",
    SimBlockConfig: "yv",
    BoundType: "DA",
    SimBoundType: "qh",

    Environment: "FA",
    SimEnvironment: "vv",
}

class EditorExtras {
    editorClass = null;
    pml = null;
    categoryDefaults = []
    ignoredBlocks = [];
    simBlocks= [];
    modelUrls= ["models/blocks.glb", "models/pillar.glb", "models/planes.glb", "models/road.glb", "models/road_wide.glb", "models/signs.glb", "models/wall_track.glb"];
    constructor(pml) {
        this.pml = pml;
    }
    construct(editorClass) {
        this.editorClass = editorClass;
    }

    blockNumberFromId(id) {
        return this.pml.getFromPolyTrack(`${ObfNames.BlocksEnum}.${id}`);
    }

    get getSimBlocks() {
        return [...this.simBlocks];
    }

    get trackEditorClass() {
        return this.editorClass;
    }

    registerModel(url) {
        this.modelUrls.push(url);
    }

    registerCategory(id, defaultId) {
        let latestCategory = (Object.keys(this.pml.getFromPolyTrack(ObfNames.CategoriesEnum)).length / 2)
        this.pml.getFromPolyTrack(`${ObfNames.CategoriesEnum}[${ObfNames.CategoriesEnum}.${id} = ${latestCategory}]  =  "${id}"`);
        this.simBlocks.push(`${ObfNames.SimCategories}[${ObfNames.SimCategories}.${id} = ${latestCategory}]  =  "${id}"`);
        this.categoryDefaults.push(`case ${ObfNames.CategoriesEnum}.${id}:n = this.getPart(${ObfNames.BlocksEnum}.${defaultId});break;`)
    }

    registerBlock(id, categoryId, checksum, sceneName, modelName, overlapSpace, extraSettings) {
        let latestBlock = (Object.keys(this.pml.getFromPolyTrack(`${ObfNames.BlocksEnum}`)).length / 2)
        this.pml.getFromPolyTrack(`${ObfNames.BlocksEnum}[${ObfNames.BlocksEnum}.${id} = ${latestBlock}]  =  "${id}"`);
        this.pml.getFromPolyTrack(`${ObfNames.BlockRegister}.push(new ${ObfNames.BlockConfig}("${checksum}",${ObfNames.CategoriesEnum}.${categoryId},${ObfNames.BlocksEnum}.${id},[["${sceneName}", "${modelName}"]],${ObfNames.Environment},${JSON.stringify(overlapSpace)}${extraSettings && extraSettings.specialSettings ? `, { type: ${ObfNames.BoundType}.${extraSettings.specialSettings.type}, center: ${JSON.stringify(extraSettings.specialSettings.center)}, size: ${JSON.stringify(extraSettings.specialSettings.size)}}` : ""}))`);
        this.pml.getFromPolyTrack(`${ObfNames.BlockMap}.clear();for (const e of ${ObfNames.BlockRegister}) {if (!${ObfNames.BlockMap}.has(e.id)){ ${ObfNames.BlockMap}.set(e.id, e);}; }`);
        if (extraSettings && extraSettings.ignoreOnExport) {
            this.ignoredBlocks.push(this.blockNumberFromId(id));
            return;
        }
        this.simBlocks.push(`${ObfNames.SimBlocks}[${ObfNames.SimBlocks}.${id} = ${latestBlock}]  =  "${id}"`);
        this.simBlocks.push(`${ObfNames.SimBlockRegister}.push(new ${ObfNames.SimBlockConfig}("${checksum}",${ObfNames.SimCategories}.${categoryId},${ObfNames.SimBlocks}.${id},[["${sceneName}", "${modelName}"]],${ObfNames.SimEnvironment},${JSON.stringify(overlapSpace)}${extraSettings && extraSettings.specialSettings ? `, { type: ${ObfNames.SimBoundType}.${extraSettings.specialSettings.type}, center: ${JSON.stringify(extraSettings.specialSettings.center)}, size: ${JSON.stringify(extraSettings.specialSettings.size)}}` : ""}))`);
        this.simBlocks.push(`${ObfNames.SimBlockMap}.clear();for (const e of ${ObfNames.SimBlockRegister}) {if (!${ObfNames.SimBlockMap}.has(e.id)){ ${ObfNames.SimBlockMap}.set(e.id, e);}; }`);
    }
    preInit() {
        this.pml.registerGlobalMixin(MixinType.INSERT, ".SignArrowLeft);", `break;${this.categoryDefaults.join("")}`);
        this.pml.registerGlobalMixin(MixinType.INSERT, `for (const [r, a] of cx(this, ax, 'f')) {`, `if (ActivePolyModLoader.getMod("pmlapi").editorExtras.ignoredBlocks.includes(r)) {continue;};`);
    }
    init() {
        this.pml.registerClassMixin("YB.prototype",
            "init", MixinType.REPLACEBETWEEN,
            `(a = [`,
            ` ],`, `(a = ["${this.modelUrls.join('", "')}"],`);
    }
}

class PmlApi extends PolyMod {
    SoundManager = SoundManager;
    soundManager = null;
    editorExtras = null;
    preInit = (pml) => {
        this.editorExtras = new EditorExtras(pml);
        this.editorExtras.preInit();
        pml.registerGlobalMixin(MixinType.INSERT, `const e = A_(this, NM, 'f');`, `ActivePolyModLoader.getMod("${this.modID}").editorExtras.construct(this);`);
        pml.registerGlobalMixin(MixinType.INSERT, `this.context = e;`, `const SoundManager = ActivePolyModLoader.getMod("${this.modID}").SoundManager;ActivePolyModLoader.getMod("${this.modID}").soundManager = new SoundManager(ActivePolyModLoader, this);`)
        pml.registerGlobalMixin(MixinType.INSERT, `funcMixins: ActivePolyModLoader.simWorkerFuncMixins || []`, `,toExecute: ActivePolyModLoader.getMod("pmlapi").editorExtras.getSimBlocks || [],`);
        this.editorExtras.init();
    }
    init = (pml) => {
        // this.editorExtras.registerCategory("Custom", "TurnSharp");
    }
    postInit = () => {
        
    }
}

export let polyMod = new PmlApi();