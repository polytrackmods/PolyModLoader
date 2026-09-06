import { PolyModLoader, MixinType } from "https://cdn.polymodloader.com/cb/PolyTrackMods/PolyModLoader/0.6.2/PolyTypes.js";
import { PMLEvent, EventDispatcher } from "./events";
import { ObfNames } from "./obfuscation";

type SimCommunicatorEventMap = {
    newsimworker: Extract<PMLEvent, { type: "newsimworker" }>;
    onmessagein: Extract<PMLEvent, { type: "onmessagein" }>;
    onmessageout: Extract<PMLEvent, { type: "onmessageout" }>;
};

enum SimMessage {
    Init = 0,
    Verify = 1,
    TestDeterminism = 2,
    CreateCar = 3,
    DeleteCar = 4,
    StartCar = 5,
    ControlCar = 6,
    PauseCar = 7,
    VerifyResult = 8,
    DeterminismResult = 9,
    UpdateResult = 10,
    UpdateMessages = 11,
    UpdateCallbacks = 12,
}

export class SimCommunicator extends EventDispatcher<SimCommunicatorEventMap> {
    pml: PolyModLoader;
    RealtimeSim: Worker | undefined;
    SimMessage = SimMessage;
    simMessageCallbacks: {[message: string]: string[]} = {
        "Init": [
            `   for(const key of Object.keys(msg.data.simMessages)) {
                    ${ObfNames.SimCom.SSimMessage}[key] = msg.data.simMessages[key];
                }`,
        ],
        "UpdateCallbacks": [
            `callbacks = msg.data.cb`
        ],
        "UpdateMessages": [
            `for(const key of Object.keys(msg.data.simMessages)) {
                ${ObfNames.SimCom.SSimMessage}[key] = msg.data.simMessages[key];
             }`
        ]
    };
    GhostSim: Worker | undefined;
    AllSims: Worker[] = [];
    constructor(pml: PolyModLoader) {
        super();
        this.pml = pml;
        this.addEventListener("onmessageout", (e) => {
            if(e.payload.messageType === SimMessage.Init) {
                e.payload.simMessages = SimMessage;
                e.payload.cb = this.simMessageCallbacks;
            }
        })
    }
    _preInit() {
        this.pml.registerGlobalMixin({
            type: MixinType.REPLACEBETWEEN,
            tokenStart: `${ObfNames.Mixins.SimCom.MSimConstructor}`,
            tokenEnd: `${ObfNames.Mixins.SimCom.MSimConstructor}`,
            func: `polyModLoader.getMod("pmlapi").simCommunicator._registerSimWorker(${ObfNames.Mixins.SimCom.MGetPrivateSim}, e),${ObfNames.Mixins.SimCom.MSimConstructor}`,
        });
        this.pml.registerSimWorkerMixin({ type: MixinType.REPLACEBETWEEN, tokenStart: `${ObfNames.Mixins.SimCom.SMsgRcvFunc}`, tokenEnd: `${ObfNames.Mixins.SimCom.SMsgRcvFunc}`,
            func: ` var callbacks = ${JSON.stringify(this.simMessageCallbacks)};
                    var runCallbacks = (msg) => {
                        if(msg.data.messageType === ${SimMessage.Init}) callbacks = msg.data.cb;
                        for (const cb of callbacks[${ObfNames.SimCom.SSimMessage}[msg.data.messageType]] || []) {
                            eval(cb);
                        }
                    }
                    ${ObfNames.Mixins.SimCom.SMsgRcvFunc}` });
        this.pml.registerSimWorkerMixin({ type: MixinType.INSERT, token: `${ObfNames.Mixins.SimCom.SMsgRcvFunc}`, 
            func: `runCallbacks(${ObfNames.SimCom.IncomingData});` })
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
        this.AllSims.push(worker)
        worker.addEventListener("message", (e) => {
            (this.dispatchEvent({
                    type: "onmessagein",
                    isRealtime,
                    isMainSim,
                    event: e,
                }));
        });
        let _this = this;

        // @ts-expect-error
        worker.originalPostMessage = worker.postMessage;

        worker.postMessage = function(message: any, idk?: any): void {
            if(message != null && message.messageType != null) { // best to check who knows what some stupid ass ai can cook up
                _this.dispatchEvent({ type: "onmessageout", isRealtime, isMainSim, payload: message })
            }
            // @ts-expect-error
            worker.originalPostMessage(message, idk);
        }
        this.dispatchEvent({ type: "newsimworker", worker, isRealtime, isMainSim });
    }
    registerSimMessage(name: string): SimMessage {
        const nextId = Object.keys(SimMessage).length / 2
        // very weird shit to write to an enum (supposed to be read only!)
        // @ts-expect-error
        SimMessage[(SimMessage[name] = nextId)] = name;
        this.broadcastMessage({ messageType: SimMessage.UpdateMessages, simMessages: SimMessage })
        console.log(SimMessage)
        // @ts-expect-error
        return SimMessage[name];
    }
    broadcastMessage(payload: any) {
        if(payload.messageType === null) {
            console.error("Sim messages need to contain a messageType!");
            return;
        }
        for(let sim of this.AllSims) {
            sim.postMessage(payload)
        }
    }
    registerSimMessageCallback(message: SimMessage, func: string) {
        this.simMessageCallbacks[SimMessage[message]] ? null : this.simMessageCallbacks[SimMessage[message]] = [];
        this.simMessageCallbacks[SimMessage[message]].push(func);
        this.broadcastMessage({ messageType: SimMessage.UpdateCallbacks, cb: this.simMessageCallbacks });
    }
}