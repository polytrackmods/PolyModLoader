import {
    PolyMod,
    PolyModLoader,
} from "https://cdn.polymodloader.com/cb/PolyTrackMods/PolyModLoader/0.6.2/PolyTypes.js";
import { BlockColors } from "./obfuscation";
import { EditorExtras } from "./editorExtras";
import { SimCommunicator } from "./simCommunicator";
import { SoundManager } from "./soundManager";

class PMLAPI extends PolyMod {
    editorExtras: EditorExtras | undefined;
    simCommunicator: SimCommunicator | undefined;
    soundManager: SoundManager | undefined;
    pml: PolyModLoader | undefined;
    preInit = (pml: PolyModLoader) => {
        this.simCommunicator = new SimCommunicator(pml);
        this.editorExtras = new EditorExtras(pml);
        this.soundManager = new SoundManager(pml);
        this.editorExtras.registerCallback(() => {
            this.editorExtras?.registerCategory("Custom", "TurnSharp");
            this.editorExtras?.registerModel(`${this.modBaseUrl}/copy_pillars.glb`);
            this.editorExtras?.registerBlock(
                "CopyPillar",
                "Custom",
                "b235ea87337c17de7cbaecaf3d381fff9782e8379bcbc1c6cc9882da4aa1da15",
                "CopyPillars",
                "CopyPillar1",
                BlockColors.Environment,
                [
                    [
                        [0, 1, 0],
                        [1, 0, 1],
                    ],
                ],
            );
        });
        this.simCommunicator._preInit();
        this.soundManager._preInit();
        this.editorExtras._preInit();
    };
    init = async (pml: PolyModLoader) => {
        this.editorExtras?.registerStuffCallbacks.forEach((c) => c());
        this.editorExtras?._init();
    };
    postInit = () => { };
}

export let polyMod = new PMLAPI();
