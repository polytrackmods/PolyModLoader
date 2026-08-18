import { PolyModLoader, MixinType } from "https://cdn.polymodloader.com/cb/PolyTrackMods/PolyModLoader/0.6.2/PolyTypes.js";
import { PMLEvent, EventDispatcher } from "./events";
import { ObfNames } from "./obfuscation";

type SimCommunicatorEventMap = {
    newsimworker: Extract<PMLEvent, { type: "newsimworker" }>;
    onmessage: Extract<PMLEvent, { type: "onmessage" }>;
};

enum SimMessage {
    Init,
    Verify,
    TestDeterminism,
    CreateCar,
    DeleteCar,
    StartCar,
    ControlCar,
    PauseCar,
    VerifyResult,
    DeterminismResult,
    UpdateResult,
}
export class SimCommunicator extends EventDispatcher<SimCommunicatorEventMap> {
    pml: PolyModLoader;
    RealtimeSim: Worker | undefined;
    GhostSim: Worker | undefined;
    AllSims: Worker[] = [];
    constructor(pml: PolyModLoader) {
        super();
        this.pml = pml;
    }
    _onMessage(e: MessageEvent<any>) {
        const simMessage = e.data;
        const msgType: SimMessage = e.data.messageType;
    }
    _preInit() {
        this.pml.registerGlobalMixin({
            type: MixinType.REPLACEBETWEEN,
            tokenStart: `${ObfNames.Mixins.SimComs.MSimConstructor}`,
            tokenEnd: `${ObfNames.Mixins.SimComs.MSimConstructor}`,
            func: `polyModLoader.getMod("pmlapi").simCommunicator._registerSimWorker((0, r.gn)(this, h, "f"), e),${ObfNames.Mixins.SimComs.MSimConstructor}`,
        });
    }
    _registerSimWorker(worker: Worker, isRealtime: boolean) {
        let isMainSim = false;
        if (isRealtime && !this.RealtimeSim) {
            this.RealtimeSim = worker;
            isMainSim = true;
        }
        if (!isRealtime && !this.GhostSim) {
            this.GhostSim = worker;
            isMainSim = true;
        }
        worker.addEventListener("message", (e) => {
            (this._onMessage(e),
                this.dispatchEvent({
                    type: "onmessage",
                    isRealtime,
                    isMainSim,
                    event: e,
                }));
        });
        this.dispatchEvent({ type: "newsimworker", worker, isRealtime, isMainSim });
    }
}