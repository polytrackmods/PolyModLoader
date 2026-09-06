
export function get(e?: any, t?: any, n?: any, i?: any) {
    if ("a" === n && !i)
        throw new TypeError("Private accessor was defined without a getter");
    if ("function" == typeof t ? e !== t || !i : !t.has(e))
        throw new TypeError(
            "Cannot read private member from an object whose class did not declare it",
        );
    return "m" === n ? i : "a" === n ? i.call(e) : i ? i.value : t.get(e);
}
export function set(e?: any, t?: any, n?: any, i?: any, r?: any) {
    if ("m" === i) throw new TypeError("Private method is not writable");
    if ("a" === i && !r)
        throw new TypeError("Private accessor was defined without a setter");
    if ("function" == typeof t ? e !== t || !r : !t.has(e))
        throw new TypeError(
            "Cannot write private member to an object whose class did not declare it",
        );
    return ("a" === i ? r.call(e, n) : r ? (r.value = n) : t.set(e, n), n);
}

export const ObfNames = {
    General: {
        THREE: {
            Vector3: `i(4922).Pq0`,
        },
        SimVector3: `R`,
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
            SimCustom: "oo",
        },
    },
    Mixins: {
        Editor: {
            IgnoreOnExportToken: `for (const r of (0, d.gn)(this, o, "f")) {`,
            BlockInitClass: `ou`,
            BlockInitModelList: `r`,
            EditorBundle: '112.bundle.js',
            EditorConstructor: `constructor(t, e, n, s, o, a, r, h, l, c, d, g, f, p) {`,
            EditorDispose: `(t.removeChild((0, i.gn)(this, re, "f")),`,
            BlockConfigExports: `l1: () => m, yD: () => u`,

            EnterTrack: `((p.className = "content"), f.appendChild(p));`,
            ExitTrack: `((0, R.gn)(this, ii, "f").removeChild((0, R.gn)(this, oi, "f")),`,
        },
        SimCom: {
            MSimClassExports: `n.d(t, { A: () => A`,
            MSimConstructor: `(0, r.gn)(this, h, "f").addEventListener("message", (e)`,
            MGetPrivateSim: `(0, r.gn)(this, h, "f")`,
            SMsgRcvFunc: `function r(i) {`,
        },
        SoundManager: {
            SoundConstructor: `if ("running" != e.state)`,
        },
    },
    SimCom: {
        IncomingData: `i`,
        SSimMessage: `Ki`,
    },
    SoundManager: {
        GetBufferMap: `(0, R.gn)(this, v, "f")`,
    },
};

export enum BoundType {
    Checkpoint = 0,
    Finish = 1,
}

export type ExtraSettings = {
    specialSettings: undefined | null | { type: BoundType; center: number[]; size: number[] };
    ignoreOnExport: undefined | boolean;
    startOffset: { x: number, y: number, z: number } | undefined
};

export enum BlockColors {
    Environment,
    Custom,
}
