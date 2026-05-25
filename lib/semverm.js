/* esm.sh - semver@7.8.1 */
import __Process$ from "./process.js";
var ot = Object.create;
var he = Object.defineProperty;
var ct = Object.getOwnPropertyDescriptor;
var at = Object.getOwnPropertyNames;
var lt = Object.getPrototypeOf
  , ut = Object.prototype.hasOwnProperty;
var h = (t, e) => () => (e || t((e = {
    exports: {}
}).exports, e),
e.exports);
var Et = (t, e, r, s) => {
    if (e && typeof e == "object" || typeof e == "function")
        for (let i of at(e))
            !ut.call(t, i) && i !== r && he(t, i, {
                get: () => e[i],
                enumerable: !(s = ct(e, i)) || s.enumerable
            });
    return t
}
;
var ft = (t, e, r) => (r = t != null ? ot(lt(t)) : {},
Et(e || !t || !t.__esModule ? he(r, "default", {
    value: t,
    enumerable: !0
}) : r, t));
var w = h( (Nn, pe) => {
    "use strict";
    var ht = "2.0.0"
      , pt = Number.MAX_SAFE_INTEGER || 9007199254740991
      , mt = 16
      , Rt = 250
      , $t = ["major", "premajor", "minor", "preminor", "patch", "prepatch", "prerelease"];
    pe.exports = {
        MAX_LENGTH: 256,
        MAX_SAFE_COMPONENT_LENGTH: mt,
        MAX_SAFE_BUILD_LENGTH: Rt,
        MAX_SAFE_INTEGER: pt,
        RELEASE_TYPES: $t,
        SEMVER_SPEC_VERSION: ht,
        FLAG_INCLUDE_PRERELEASE: 1,
        FLAG_LOOSE: 2
    }
}
);
var P = h( (Sn, me) => {
    "use strict";
    var It = typeof __Process$ == "object" && __Process$.env && __Process$.env.NODE_DEBUG && /\bsemver\b/i.test(__Process$.env.NODE_DEBUG) ? (...t) => console.error("SEMVER", ...t) : () => {}
    ;
    me.exports = It
}
);
var g = h( (A, Re) => {
    "use strict";
    var {MAX_SAFE_COMPONENT_LENGTH: Y, MAX_SAFE_BUILD_LENGTH: Lt, MAX_LENGTH: Nt} = w()
      , St = P();
    A = Re.exports = {};
    var dt = A.re = []
      , Ot = A.safeRe = []
      , c = A.src = []
      , Tt = A.safeSrc = []
      , a = A.t = {}
      , At = 0
      , W = "[a-zA-Z0-9-]"
      , qt = [["\\s", 1], ["\\d", Nt], [W, Lt]]
      , wt = t => {
        for (let[e,r] of qt)
            t = t.split(`${e}*`).join(`${e}{0,${r}}`).split(`${e}+`).join(`${e}{1,${r}}`);
        return t
    }
      , p = (t, e, r) => {
        let s = wt(e)
          , i = At++;
        St(t, i, e),
        a[t] = i,
        c[i] = e,
        Tt[i] = s,
        dt[i] = new RegExp(e,r ? "g" : void 0),
        Ot[i] = new RegExp(s,r ? "g" : void 0)
    }
    ;
    p("NUMERICIDENTIFIER", "0|[1-9]\\d*");
    p("NUMERICIDENTIFIERLOOSE", "\\d+");
    p("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${W}*`);
    p("MAINVERSION", `(${c[a.NUMERICIDENTIFIER]})\\.(${c[a.NUMERICIDENTIFIER]})\\.(${c[a.NUMERICIDENTIFIER]})`);
    p("MAINVERSIONLOOSE", `(${c[a.NUMERICIDENTIFIERLOOSE]})\\.(${c[a.NUMERICIDENTIFIERLOOSE]})\\.(${c[a.NUMERICIDENTIFIERLOOSE]})`);
    p("PRERELEASEIDENTIFIER", `(?:${c[a.NONNUMERICIDENTIFIER]}|${c[a.NUMERICIDENTIFIER]})`);
    p("PRERELEASEIDENTIFIERLOOSE", `(?:${c[a.NONNUMERICIDENTIFIER]}|${c[a.NUMERICIDENTIFIERLOOSE]})`);
    p("PRERELEASE", `(?:-(${c[a.PRERELEASEIDENTIFIER]}(?:\\.${c[a.PRERELEASEIDENTIFIER]})*))`);
    p("PRERELEASELOOSE", `(?:-?(${c[a.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${c[a.PRERELEASEIDENTIFIERLOOSE]})*))`);
    p("BUILDIDENTIFIER", `${W}+`);
    p("BUILD", `(?:\\+(${c[a.BUILDIDENTIFIER]}(?:\\.${c[a.BUILDIDENTIFIER]})*))`);
    p("FULLPLAIN", `v?${c[a.MAINVERSION]}${c[a.PRERELEASE]}?${c[a.BUILD]}?`);
    p("FULL", `^${c[a.FULLPLAIN]}$`);
    p("LOOSEPLAIN", `[v=\\s]*${c[a.MAINVERSIONLOOSE]}${c[a.PRERELEASELOOSE]}?${c[a.BUILD]}?`);
    p("LOOSE", `^${c[a.LOOSEPLAIN]}$`);
    p("GTLT", "((?:<|>)?=?)");
    p("XRANGEIDENTIFIERLOOSE", `${c[a.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
    p("XRANGEIDENTIFIER", `${c[a.NUMERICIDENTIFIER]}|x|X|\\*`);
    p("XRANGEPLAIN", `[v=\\s]*(${c[a.XRANGEIDENTIFIER]})(?:\\.(${c[a.XRANGEIDENTIFIER]})(?:\\.(${c[a.XRANGEIDENTIFIER]})(?:${c[a.PRERELEASE]})?${c[a.BUILD]}?)?)?`);
    p("XRANGEPLAINLOOSE", `[v=\\s]*(${c[a.XRANGEIDENTIFIERLOOSE]})(?:\\.(${c[a.XRANGEIDENTIFIERLOOSE]})(?:\\.(${c[a.XRANGEIDENTIFIERLOOSE]})(?:${c[a.PRERELEASELOOSE]})?${c[a.BUILD]}?)?)?`);
    p("XRANGE", `^${c[a.GTLT]}\\s*${c[a.XRANGEPLAIN]}$`);
    p("XRANGELOOSE", `^${c[a.GTLT]}\\s*${c[a.XRANGEPLAINLOOSE]}$`);
    p("COERCEPLAIN", `(^|[^\\d])(\\d{1,${Y}})(?:\\.(\\d{1,${Y}}))?(?:\\.(\\d{1,${Y}}))?`);
    p("COERCE", `${c[a.COERCEPLAIN]}(?:$|[^\\d])`);
    p("COERCEFULL", c[a.COERCEPLAIN] + `(?:${c[a.PRERELEASE]})?(?:${c[a.BUILD]})?(?:$|[^\\d])`);
    p("COERCERTL", c[a.COERCE], !0);
    p("COERCERTLFULL", c[a.COERCEFULL], !0);
    p("LONETILDE", "(?:~>?)");
    p("TILDETRIM", `(\\s*)${c[a.LONETILDE]}\\s+`, !0);
    A.tildeTrimReplace = "$1~";
    p("TILDE", `^${c[a.LONETILDE]}${c[a.XRANGEPLAIN]}$`);
    p("TILDELOOSE", `^${c[a.LONETILDE]}${c[a.XRANGEPLAINLOOSE]}$`);
    p("LONECARET", "(?:\\^)");
    p("CARETTRIM", `(\\s*)${c[a.LONECARET]}\\s+`, !0);
    A.caretTrimReplace = "$1^";
    p("CARET", `^${c[a.LONECARET]}${c[a.XRANGEPLAIN]}$`);
    p("CARETLOOSE", `^${c[a.LONECARET]}${c[a.XRANGEPLAINLOOSE]}$`);
    p("COMPARATORLOOSE", `^${c[a.GTLT]}\\s*(${c[a.LOOSEPLAIN]})$|^$`);
    p("COMPARATOR", `^${c[a.GTLT]}\\s*(${c[a.FULLPLAIN]})$|^$`);
    p("COMPARATORTRIM", `(\\s*)${c[a.GTLT]}\\s*(${c[a.LOOSEPLAIN]}|${c[a.XRANGEPLAIN]})`, !0);
    A.comparatorTrimReplace = "$1$2$3";
    p("HYPHENRANGE", `^\\s*(${c[a.XRANGEPLAIN]})\\s+-\\s+(${c[a.XRANGEPLAIN]})\\s*$`);
    p("HYPHENRANGELOOSE", `^\\s*(${c[a.XRANGEPLAINLOOSE]})\\s+-\\s+(${c[a.XRANGEPLAINLOOSE]})\\s*$`);
    p("STAR", "(<|>)?=?\\s*\\*");
    p("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
    p("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$")
}
);
var G = h( (dn, $e) => {
    "use strict";
    var gt = Object.freeze({
        loose: !0
    })
      , Pt = Object.freeze({})
      , vt = t => t ? typeof t != "object" ? gt : t : Pt;
    $e.exports = vt
}
);
var z = h( (On, Ne) => {
    "use strict";
    var Ie = /^[0-9]+$/
      , Le = (t, e) => {
        if (typeof t == "number" && typeof e == "number")
            return t === e ? 0 : t < e ? -1 : 1;
        let r = Ie.test(t)
          , s = Ie.test(e);
        return r && s && (t = +t,
        e = +e),
        t === e ? 0 : r && !s ? -1 : s && !r ? 1 : t < e ? -1 : 1
    }
      , xt = (t, e) => Le(e, t);
    Ne.exports = {
        compareIdentifiers: Le,
        rcompareIdentifiers: xt
    }
}
);
var L = h( (Tn, de) => {
    "use strict";
    var y = P()
      , {MAX_LENGTH: Se, MAX_SAFE_INTEGER: j} = w()
      , {safeRe: F, t: U} = g()
      , Ct = G()
      , {compareIdentifiers: K} = z()
      , Z = class t {
        constructor(e, r) {
            if (r = Ct(r),
            e instanceof t) {
                if (e.loose === !!r.loose && e.includePrerelease === !!r.includePrerelease)
                    return e;
                e = e.version
            } else if (typeof e != "string")
                throw new TypeError(`Invalid version. Must be a string. Got type "${typeof e}".`);
            if (e.length > Se)
                throw new TypeError(`version is longer than ${Se} characters`);
            y("SemVer", e, r),
            this.options = r,
            this.loose = !!r.loose,
            this.includePrerelease = !!r.includePrerelease;
            let s = e.trim().match(r.loose ? F[U.LOOSE] : F[U.FULL]);
            if (!s)
                throw new TypeError(`Invalid Version: ${e}`);
            if (this.raw = e,
            this.major = +s[1],
            this.minor = +s[2],
            this.patch = +s[3],
            this.major > j || this.major < 0)
                throw new TypeError("Invalid major version");
            if (this.minor > j || this.minor < 0)
                throw new TypeError("Invalid minor version");
            if (this.patch > j || this.patch < 0)
                throw new TypeError("Invalid patch version");
            s[4] ? this.prerelease = s[4].split(".").map(i => {
                if (/^[0-9]+$/.test(i)) {
                    let n = +i;
                    if (n >= 0 && n < j)
                        return n
                }
                return i
            }
            ) : this.prerelease = [],
            this.build = s[5] ? s[5].split(".") : [],
            this.format()
        }
        format() {
            return this.version = `${this.major}.${this.minor}.${this.patch}`,
            this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`),
            this.version
        }
        toString() {
            return this.version
        }
        compare(e) {
            if (y("SemVer.compare", this.version, this.options, e),
            !(e instanceof t)) {
                if (typeof e == "string" && e === this.version)
                    return 0;
                e = new t(e,this.options)
            }
            return e.version === this.version ? 0 : this.compareMain(e) || this.comparePre(e)
        }
        compareMain(e) {
            return e instanceof t || (e = new t(e,this.options)),
            this.major < e.major ? -1 : this.major > e.major ? 1 : this.minor < e.minor ? -1 : this.minor > e.minor ? 1 : this.patch < e.patch ? -1 : this.patch > e.patch ? 1 : 0
        }
        comparePre(e) {
            if (e instanceof t || (e = new t(e,this.options)),
            this.prerelease.length && !e.prerelease.length)
                return -1;
            if (!this.prerelease.length && e.prerelease.length)
                return 1;
            if (!this.prerelease.length && !e.prerelease.length)
                return 0;
            let r = 0;
            do {
                let s = this.prerelease[r]
                  , i = e.prerelease[r];
                if (y("prerelease compare", r, s, i),
                s === void 0 && i === void 0)
                    return 0;
                if (i === void 0)
                    return 1;
                if (s === void 0)
                    return -1;
                if (s === i)
                    continue;
                return K(s, i)
            } while (++r)
        }
        compareBuild(e) {
            e instanceof t || (e = new t(e,this.options));
            let r = 0;
            do {
                let s = this.build[r]
                  , i = e.build[r];
                if (y("build compare", r, s, i),
                s === void 0 && i === void 0)
                    return 0;
                if (i === void 0)
                    return 1;
                if (s === void 0)
                    return -1;
                if (s === i)
                    continue;
                return K(s, i)
            } while (++r)
        }
        inc(e, r, s) {
            if (e.startsWith("pre")) {
                if (!r && s === !1)
                    throw new Error("invalid increment argument: identifier is empty");
                if (r) {
                    let i = `-${r}`.match(this.options.loose ? F[U.PRERELEASELOOSE] : F[U.PRERELEASE]);
                    if (!i || i[1] !== r)
                        throw new Error(`invalid identifier: ${r}`)
                }
            }
            switch (e) {
            case "premajor":
                this.prerelease.length = 0,
                this.patch = 0,
                this.minor = 0,
                this.major++,
                this.inc("pre", r, s);
                break;
            case "preminor":
                this.prerelease.length = 0,
                this.patch = 0,
                this.minor++,
                this.inc("pre", r, s);
                break;
            case "prepatch":
                this.prerelease.length = 0,
                this.inc("patch", r, s),
                this.inc("pre", r, s);
                break;
            case "prerelease":
                this.prerelease.length === 0 && this.inc("patch", r, s),
                this.inc("pre", r, s);
                break;
            case "release":
                if (this.prerelease.length === 0)
                    throw new Error(`version ${this.raw} is not a prerelease`);
                this.prerelease.length = 0;
                break;
            case "major":
                (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++,
                this.minor = 0,
                this.patch = 0,
                this.prerelease = [];
                break;
            case "minor":
                (this.patch !== 0 || this.prerelease.length === 0) && this.minor++,
                this.patch = 0,
                this.prerelease = [];
                break;
            case "patch":
                this.prerelease.length === 0 && this.patch++,
                this.prerelease = [];
                break;
            case "pre":
                {
                    let i = Number(s) ? 1 : 0;
                    if (this.prerelease.length === 0)
                        this.prerelease = [i];
                    else {
                        let n = this.prerelease.length;
                        for (; --n >= 0; )
                            typeof this.prerelease[n] == "number" && (this.prerelease[n]++,
                            n = -2);
                        if (n === -1) {
                            if (r === this.prerelease.join(".") && s === !1)
                                throw new Error("invalid increment argument: identifier already exists");
                            this.prerelease.push(i)
                        }
                    }
                    if (r) {
                        let n = [r, i];
                        s === !1 && (n = [r]),
                        K(this.prerelease[0], r) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = n) : this.prerelease = n
                    }
                    break
                }
            default:
                throw new Error(`invalid increment argument: ${e}`)
            }
            return this.raw = this.format(),
            this.build.length && (this.raw += `+${this.build.join(".")}`),
            this
        }
    }
    ;
    de.exports = Z
}
);
var q = h( (An, Te) => {
    "use strict";
    var Oe = L()
      , Dt = (t, e, r=!1) => {
        if (t instanceof Oe)
            return t;
        try {
            return new Oe(t,e)
        } catch (s) {
            if (!r)
                return null;
            throw s
        }
    }
    ;
    Te.exports = Dt
}
);
var qe = h( (qn, Ae) => {
    "use strict";
    var Gt = q()
      , yt = (t, e) => {
        let r = Gt(t, e);
        return r ? r.version : null
    }
    ;
    Ae.exports = yt
}
);
var ge = h( (wn, we) => {
    "use strict";
    var jt = q()
      , Ft = (t, e) => {
        let r = jt(t.trim().replace(/^[=v]+/, ""), e);
        return r ? r.version : null
    }
    ;
    we.exports = Ft
}
);
var xe = h( (gn, ve) => {
    "use strict";
    var Pe = L()
      , Ut = (t, e, r, s, i) => {
        typeof r == "string" && (i = s,
        s = r,
        r = void 0);
        try {
            return new Pe(t instanceof Pe ? t.version : t,r).inc(e, s, i).version
        } catch {
            return null
        }
    }
    ;
    ve.exports = Ut
}
);
var Ge = h( (Pn, De) => {
    "use strict";
    var Ce = q()
      , Vt = (t, e) => {
        let r = Ce(t, null, !0)
          , s = Ce(e, null, !0)
          , i = r.compare(s);
        if (i === 0)
            return null;
        let n = i > 0
          , o = n ? r : s
          , l = n ? s : r
          , u = !!o.prerelease.length;
        if (!!l.prerelease.length && !u) {
            if (!l.patch && !l.minor)
                return "major";
            if (l.compareMain(o) === 0)
                return l.minor && !l.patch ? "minor" : "patch"
        }
        let R = u ? "pre" : "";
        return r.major !== s.major ? R + "major" : r.minor !== s.minor ? R + "minor" : r.patch !== s.patch ? R + "patch" : "prerelease"
    }
    ;
    De.exports = Vt
}
);
var je = h( (vn, ye) => {
    "use strict";
    var Xt = L()
      , _t = (t, e) => new Xt(t,e).major;
    ye.exports = _t
}
);
var Ue = h( (xn, Fe) => {
    "use strict";
    var bt = L()
      , Ht = (t, e) => new bt(t,e).minor;
    Fe.exports = Ht
}
);
var Xe = h( (Cn, Ve) => {
    "use strict";
    var kt = L()
      , Bt = (t, e) => new kt(t,e).patch;
    Ve.exports = Bt
}
);
var be = h( (Dn, _e) => {
    "use strict";
    var Mt = q()
      , Yt = (t, e) => {
        let r = Mt(t, e);
        return r && r.prerelease.length ? r.prerelease : null
    }
    ;
    _e.exports = Yt
}
);
var O = h( (Gn, ke) => {
    "use strict";
    var He = L()
      , Wt = (t, e, r) => new He(t,r).compare(new He(e,r));
    ke.exports = Wt
}
);
var Me = h( (yn, Be) => {
    "use strict";
    var zt = O()
      , Kt = (t, e, r) => zt(e, t, r);
    Be.exports = Kt
}
);
var We = h( (jn, Ye) => {
    "use strict";
    var Zt = O()
      , Jt = (t, e) => Zt(t, e, !0);
    Ye.exports = Jt
}
);
var V = h( (Fn, Ke) => {
    "use strict";
    var ze = L()
      , Qt = (t, e, r) => {
        let s = new ze(t,r)
          , i = new ze(e,r);
        return s.compare(i) || s.compareBuild(i)
    }
    ;
    Ke.exports = Qt
}
);
var Je = h( (Un, Ze) => {
    "use strict";
    var es = V()
      , rs = (t, e) => t.sort( (r, s) => es(r, s, e));
    Ze.exports = rs
}
);
var er = h( (Vn, Qe) => {
    "use strict";
    var ts = V()
      , ss = (t, e) => t.sort( (r, s) => ts(s, r, e));
    Qe.exports = ss
}
);
var v = h( (Xn, rr) => {
    "use strict";
    var is = O()
      , ns = (t, e, r) => is(t, e, r) > 0;
    rr.exports = ns
}
);
var X = h( (_n, tr) => {
    "use strict";
    var os = O()
      , cs = (t, e, r) => os(t, e, r) < 0;
    tr.exports = cs
}
);
var J = h( (bn, sr) => {
    "use strict";
    var as = O()
      , ls = (t, e, r) => as(t, e, r) === 0;
    sr.exports = ls
}
);
var Q = h( (Hn, ir) => {
    "use strict";
    var us = O()
      , Es = (t, e, r) => us(t, e, r) !== 0;
    ir.exports = Es
}
);
var _ = h( (kn, nr) => {
    "use strict";
    var fs = O()
      , hs = (t, e, r) => fs(t, e, r) >= 0;
    nr.exports = hs
}
);
var b = h( (Bn, or) => {
    "use strict";
    var ps = O()
      , ms = (t, e, r) => ps(t, e, r) <= 0;
    or.exports = ms
}
);
var ee = h( (Mn, cr) => {
    "use strict";
    var Rs = J()
      , $s = Q()
      , Is = v()
      , Ls = _()
      , Ns = X()
      , Ss = b()
      , ds = (t, e, r, s) => {
        switch (e) {
        case "===":
            return typeof t == "object" && (t = t.version),
            typeof r == "object" && (r = r.version),
            t === r;
        case "!==":
            return typeof t == "object" && (t = t.version),
            typeof r == "object" && (r = r.version),
            t !== r;
        case "":
        case "=":
        case "==":
            return Rs(t, r, s);
        case "!=":
            return $s(t, r, s);
        case ">":
            return Is(t, r, s);
        case ">=":
            return Ls(t, r, s);
        case "<":
            return Ns(t, r, s);
        case "<=":
            return Ss(t, r, s);
        default:
            throw new TypeError(`Invalid operator: ${e}`)
        }
    }
    ;
    cr.exports = ds
}
);
var lr = h( (Yn, ar) => {
    "use strict";
    var Os = L()
      , Ts = q()
      , {safeRe: H, t: k} = g()
      , As = (t, e) => {
        if (t instanceof Os)
            return t;
        if (typeof t == "number" && (t = String(t)),
        typeof t != "string")
            return null;
        e = e || {};
        let r = null;
        if (!e.rtl)
            r = t.match(e.includePrerelease ? H[k.COERCEFULL] : H[k.COERCE]);
        else {
            let u = e.includePrerelease ? H[k.COERCERTLFULL] : H[k.COERCERTL], m;
            for (; (m = u.exec(t)) && (!r || r.index + r[0].length !== t.length); )
                (!r || m.index + m[0].length !== r.index + r[0].length) && (r = m),
                u.lastIndex = m.index + m[1].length + m[2].length;
            u.lastIndex = -1
        }
        if (r === null)
            return null;
        let s = r[2]
          , i = r[3] || "0"
          , n = r[4] || "0"
          , o = e.includePrerelease && r[5] ? `-${r[5]}` : ""
          , l = e.includePrerelease && r[6] ? `+${r[6]}` : "";
        return Ts(`${s}.${i}.${n}${o}${l}`, e)
    }
    ;
    ar.exports = As
}
);
var Er = h( (Wn, ur) => {
    "use strict";
    var qs = q()
      , ws = w()
      , gs = L()
      , Ps = (t, e, r) => {
        if (!ws.RELEASE_TYPES.includes(e))
            return null;
        let s = vs(t, r);
        return s && xs(s, e)
    }
      , vs = (t, e) => {
        let r = t instanceof gs ? t.version : t;
        return qs(r, e)
    }
      , xs = (t, e) => {
        if (Cs(e))
            return t.version;
        switch (t.prerelease = [],
        e) {
        case "major":
            t.minor = 0,
            t.patch = 0;
            break;
        case "minor":
            t.patch = 0;
            break
        }
        return t.format()
    }
      , Cs = t => t.startsWith("pre");
    ur.exports = Ps
}
);
var hr = h( (zn, fr) => {
    "use strict";
    var re = class {
        constructor() {
            this.max = 1e3,
            this.map = new Map
        }
        get(e) {
            let r = this.map.get(e);
            if (r !== void 0)
                return this.map.delete(e),
                this.map.set(e, r),
                r
        }
        delete(e) {
            return this.map.delete(e)
        }
        set(e, r) {
            if (!this.delete(e) && r !== void 0) {
                if (this.map.size >= this.max) {
                    let i = this.map.keys().next().value;
                    this.delete(i)
                }
                this.map.set(e, r)
            }
            return this
        }
    }
    ;
    fr.exports = re
}
);
var T = h( (Kn, $r) => {
    "use strict";
    var Ds = /\s+/g
      , te = class t {
        constructor(e, r) {
            if (r = ys(r),
            e instanceof t)
                return e.loose === !!r.loose && e.includePrerelease === !!r.includePrerelease ? e : new t(e.raw,r);
            if (e instanceof se)
                return this.raw = e.value,
                this.set = [[e]],
                this.formatted = void 0,
                this;
            if (this.options = r,
            this.loose = !!r.loose,
            this.includePrerelease = !!r.includePrerelease,
            this.raw = e.trim().replace(Ds, " "),
            this.set = this.raw.split("||").map(s => this.parseRange(s.trim())).filter(s => s.length),
            !this.set.length)
                throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
            if (this.set.length > 1) {
                let s = this.set[0];
                if (this.set = this.set.filter(i => !mr(i[0])),
                this.set.length === 0)
                    this.set = [s];
                else if (this.set.length > 1) {
                    for (let i of this.set)
                        if (i.length === 1 && ks(i[0])) {
                            this.set = [i];
                            break
                        }
                }
            }
            this.formatted = void 0
        }
        get range() {
            if (this.formatted === void 0) {
                this.formatted = "";
                for (let e = 0; e < this.set.length; e++) {
                    e > 0 && (this.formatted += "||");
                    let r = this.set[e];
                    for (let s = 0; s < r.length; s++)
                        s > 0 && (this.formatted += " "),
                        this.formatted += r[s].toString().trim()
                }
            }
            return this.formatted
        }
        format() {
            return this.range
        }
        toString() {
            return this.range
        }
        parseRange(e) {
            e = e.replace(Hs, "");
            let s = ((this.options.includePrerelease && _s) | (this.options.loose && bs)) + ":" + e
              , i = pr.get(s);
            if (i)
                return i;
            let n = this.options.loose
              , o = n ? S[N.HYPHENRANGELOOSE] : S[N.HYPHENRANGE];
            e = e.replace(o, ei(this.options.includePrerelease)),
            $("hyphen replace", e),
            e = e.replace(S[N.COMPARATORTRIM], Us),
            $("comparator trim", e),
            e = e.replace(S[N.TILDETRIM], Vs),
            $("tilde trim", e),
            e = e.replace(S[N.CARETTRIM], Xs),
            $("caret trim", e);
            let l = e.split(" ").map(E => Bs(E, this.options)).join(" ").split(/\s+/).map(E => Qs(E, this.options));
            n && (l = l.filter(E => ($("loose invalid filter", E, this.options),
            !!E.match(S[N.COMPARATORLOOSE])))),
            $("range list", l);
            let u = new Map
              , m = l.map(E => new se(E,this.options));
            for (let E of m) {
                if (mr(E))
                    return [E];
                u.set(E.value, E)
            }
            u.size > 1 && u.has("") && u.delete("");
            let R = [...u.values()];
            return pr.set(s, R),
            R
        }
        intersects(e, r) {
            if (!(e instanceof t))
                throw new TypeError("a Range is required");
            return this.set.some(s => Rr(s, r) && e.set.some(i => Rr(i, r) && s.every(n => i.every(o => n.intersects(o, r)))))
        }
        test(e) {
            if (!e)
                return !1;
            if (typeof e == "string")
                try {
                    e = new js(e,this.options)
                } catch {
                    return !1
                }
            for (let r = 0; r < this.set.length; r++)
                if (ri(this.set[r], e, this.options))
                    return !0;
            return !1
        }
    }
    ;
    $r.exports = te;
    var Gs = hr()
      , pr = new Gs
      , ys = G()
      , se = x()
      , $ = P()
      , js = L()
      , {safeRe: S, src: Fs, t: N, comparatorTrimReplace: Us, tildeTrimReplace: Vs, caretTrimReplace: Xs} = g()
      , {FLAG_INCLUDE_PRERELEASE: _s, FLAG_LOOSE: bs} = w()
      , Hs = new RegExp(Fs[N.BUILD],"g")
      , mr = t => t.value === "<0.0.0-0"
      , ks = t => t.value === ""
      , Rr = (t, e) => {
        let r = !0
          , s = t.slice()
          , i = s.pop();
        for (; r && s.length; )
            r = s.every(n => i.intersects(n, e)),
            i = s.pop();
        return r
    }
      , Bs = (t, e) => (t = t.replace(S[N.BUILD], ""),
    $("comp", t, e),
    t = Ws(t, e),
    $("caret", t),
    t = Ms(t, e),
    $("tildes", t),
    t = Ks(t, e),
    $("xrange", t),
    t = Js(t, e),
    $("stars", t),
    t)
      , d = t => !t || t.toLowerCase() === "x" || t === "*"
      , Ms = (t, e) => t.trim().split(/\s+/).map(r => Ys(r, e)).join(" ")
      , Ys = (t, e) => {
        let r = e.loose ? S[N.TILDELOOSE] : S[N.TILDE];
        return t.replace(r, (s, i, n, o, l) => {
            $("tilde", t, s, i, n, o, l);
            let u;
            return d(i) ? u = "" : d(n) ? u = `>=${i}.0.0 <${+i + 1}.0.0-0` : d(o) ? u = `>=${i}.${n}.0 <${i}.${+n + 1}.0-0` : l ? ($("replaceTilde pr", l),
            u = `>=${i}.${n}.${o}-${l} <${i}.${+n + 1}.0-0`) : u = `>=${i}.${n}.${o} <${i}.${+n + 1}.0-0`,
            $("tilde return", u),
            u
        }
        )
    }
      , Ws = (t, e) => t.trim().split(/\s+/).map(r => zs(r, e)).join(" ")
      , zs = (t, e) => {
        $("caret", t, e);
        let r = e.loose ? S[N.CARETLOOSE] : S[N.CARET]
          , s = e.includePrerelease ? "-0" : "";
        return t.replace(r, (i, n, o, l, u) => {
            $("caret", t, i, n, o, l, u);
            let m;
            return d(n) ? m = "" : d(o) ? m = `>=${n}.0.0${s} <${+n + 1}.0.0-0` : d(l) ? n === "0" ? m = `>=${n}.${o}.0${s} <${n}.${+o + 1}.0-0` : m = `>=${n}.${o}.0${s} <${+n + 1}.0.0-0` : u ? ($("replaceCaret pr", u),
            n === "0" ? o === "0" ? m = `>=${n}.${o}.${l}-${u} <${n}.${o}.${+l + 1}-0` : m = `>=${n}.${o}.${l}-${u} <${n}.${+o + 1}.0-0` : m = `>=${n}.${o}.${l}-${u} <${+n + 1}.0.0-0`) : ($("no pr"),
            n === "0" ? o === "0" ? m = `>=${n}.${o}.${l}${s} <${n}.${o}.${+l + 1}-0` : m = `>=${n}.${o}.${l}${s} <${n}.${+o + 1}.0-0` : m = `>=${n}.${o}.${l} <${+n + 1}.0.0-0`),
            $("caret return", m),
            m
        }
        )
    }
      , Ks = (t, e) => ($("replaceXRanges", t, e),
    t.split(/\s+/).map(r => Zs(r, e)).join(" "))
      , Zs = (t, e) => {
        t = t.trim();
        let r = e.loose ? S[N.XRANGELOOSE] : S[N.XRANGE];
        return t.replace(r, (s, i, n, o, l, u) => {
            $("xRange", t, s, i, n, o, l, u);
            let m = d(n)
              , R = m || d(o)
              , E = R || d(l)
              , I = E;
            return i === "=" && I && (i = ""),
            u = e.includePrerelease ? "-0" : "",
            m ? i === ">" || i === "<" ? s = "<0.0.0-0" : s = "*" : i && I ? (R && (o = 0),
            l = 0,
            i === ">" ? (i = ">=",
            R ? (n = +n + 1,
            o = 0,
            l = 0) : (o = +o + 1,
            l = 0)) : i === "<=" && (i = "<",
            R ? n = +n + 1 : o = +o + 1),
            i === "<" && (u = "-0"),
            s = `${i + n}.${o}.${l}${u}`) : R ? s = `>=${n}.0.0${u} <${+n + 1}.0.0-0` : E && (s = `>=${n}.${o}.0${u} <${n}.${+o + 1}.0-0`),
            $("xRange return", s),
            s
        }
        )
    }
      , Js = (t, e) => ($("replaceStars", t, e),
    t.trim().replace(S[N.STAR], ""))
      , Qs = (t, e) => ($("replaceGTE0", t, e),
    t.trim().replace(S[e.includePrerelease ? N.GTE0PRE : N.GTE0], ""))
      , ei = t => (e, r, s, i, n, o, l, u, m, R, E, I) => (d(s) ? r = "" : d(i) ? r = `>=${s}.0.0${t ? "-0" : ""}` : d(n) ? r = `>=${s}.${i}.0${t ? "-0" : ""}` : o ? r = `>=${r}` : r = `>=${r}${t ? "-0" : ""}`,
    d(m) ? u = "" : d(R) ? u = `<${+m + 1}.0.0-0` : d(E) ? u = `<${m}.${+R + 1}.0-0` : I ? u = `<=${m}.${R}.${E}-${I}` : t ? u = `<${m}.${R}.${+E + 1}-0` : u = `<=${u}`,
    `${r} ${u}`.trim())
      , ri = (t, e, r) => {
        for (let s = 0; s < t.length; s++)
            if (!t[s].test(e))
                return !1;
        if (e.prerelease.length && !r.includePrerelease) {
            for (let s = 0; s < t.length; s++)
                if ($(t[s].semver),
                t[s].semver !== se.ANY && t[s].semver.prerelease.length > 0) {
                    let i = t[s].semver;
                    if (i.major === e.major && i.minor === e.minor && i.patch === e.patch)
                        return !0
                }
            return !1
        }
        return !0
    }
}
);
var x = h( (Zn, Or) => {
    "use strict";
    var C = Symbol("SemVer ANY")
      , oe = class t {
        static get ANY() {
            return C
        }
        constructor(e, r) {
            if (r = Ir(r),
            e instanceof t) {
                if (e.loose === !!r.loose)
                    return e;
                e = e.value
            }
            e = e.trim().split(/\s+/).join(" "),
            ne("comparator", e, r),
            this.options = r,
            this.loose = !!r.loose,
            this.parse(e),
            this.semver === C ? this.value = "" : this.value = this.operator + this.semver.version,
            ne("comp", this)
        }
        parse(e) {
            let r = this.options.loose ? Lr[Nr.COMPARATORLOOSE] : Lr[Nr.COMPARATOR]
              , s = e.match(r);
            if (!s)
                throw new TypeError(`Invalid comparator: ${e}`);
            this.operator = s[1] !== void 0 ? s[1] : "",
            this.operator === "=" && (this.operator = ""),
            s[2] ? this.semver = new Sr(s[2],this.options.loose) : this.semver = C
        }
        toString() {
            return this.value
        }
        test(e) {
            if (ne("Comparator.test", e, this.options.loose),
            this.semver === C || e === C)
                return !0;
            if (typeof e == "string")
                try {
                    e = new Sr(e,this.options)
                } catch {
                    return !1
                }
            return ie(e, this.operator, this.semver, this.options)
        }
        intersects(e, r) {
            if (!(e instanceof t))
                throw new TypeError("a Comparator is required");
            return this.operator === "" ? this.value === "" ? !0 : new dr(e.value,r).test(this.value) : e.operator === "" ? e.value === "" ? !0 : new dr(this.value,r).test(e.semver) : (r = Ir(r),
            r.includePrerelease && (this.value === "<0.0.0-0" || e.value === "<0.0.0-0") || !r.includePrerelease && (this.value.startsWith("<0.0.0") || e.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && e.operator.startsWith(">") || this.operator.startsWith("<") && e.operator.startsWith("<") || this.semver.version === e.semver.version && this.operator.includes("=") && e.operator.includes("=") || ie(this.semver, "<", e.semver, r) && this.operator.startsWith(">") && e.operator.startsWith("<") || ie(this.semver, ">", e.semver, r) && this.operator.startsWith("<") && e.operator.startsWith(">")))
        }
    }
    ;
    Or.exports = oe;
    var Ir = G()
      , {safeRe: Lr, t: Nr} = g()
      , ie = ee()
      , ne = P()
      , Sr = L()
      , dr = T()
}
);
var D = h( (Jn, Tr) => {
    "use strict";
    var ti = T()
      , si = (t, e, r) => {
        try {
            e = new ti(e,r)
        } catch {
            return !1
        }
        return e.test(t)
    }
    ;
    Tr.exports = si
}
);
var qr = h( (Qn, Ar) => {
    "use strict";
    var ii = T()
      , ni = (t, e) => new ii(t,e).set.map(r => r.map(s => s.value).join(" ").trim().split(" "));
    Ar.exports = ni
}
);
var gr = h( (eo, wr) => {
    "use strict";
    var oi = L()
      , ci = T()
      , ai = (t, e, r) => {
        let s = null
          , i = null
          , n = null;
        try {
            n = new ci(e,r)
        } catch {
            return null
        }
        return t.forEach(o => {
            n.test(o) && (!s || i.compare(o) === -1) && (s = o,
            i = new oi(s,r))
        }
        ),
        s
    }
    ;
    wr.exports = ai
}
);
var vr = h( (ro, Pr) => {
    "use strict";
    var li = L()
      , ui = T()
      , Ei = (t, e, r) => {
        let s = null
          , i = null
          , n = null;
        try {
            n = new ui(e,r)
        } catch {
            return null
        }
        return t.forEach(o => {
            n.test(o) && (!s || i.compare(o) === 1) && (s = o,
            i = new li(s,r))
        }
        ),
        s
    }
    ;
    Pr.exports = Ei
}
);
var Dr = h( (to, Cr) => {
    "use strict";
    var ce = L()
      , fi = T()
      , xr = v()
      , hi = (t, e) => {
        t = new fi(t,e);
        let r = new ce("0.0.0");
        if (t.test(r) || (r = new ce("0.0.0-0"),
        t.test(r)))
            return r;
        r = null;
        for (let s = 0; s < t.set.length; ++s) {
            let i = t.set[s]
              , n = null;
            i.forEach(o => {
                let l = new ce(o.semver.version);
                switch (o.operator) {
                case ">":
                    l.prerelease.length === 0 ? l.patch++ : l.prerelease.push(0),
                    l.raw = l.format();
                case "":
                case ">=":
                    (!n || xr(l, n)) && (n = l);
                    break;
                case "<":
                case "<=":
                    break;
                default:
                    throw new Error(`Unexpected operation: ${o.operator}`)
                }
            }
            ),
            n && (!r || xr(r, n)) && (r = n)
        }
        return r && t.test(r) ? r : null
    }
    ;
    Cr.exports = hi
}
);
var yr = h( (so, Gr) => {
    "use strict";
    var pi = T()
      , mi = (t, e) => {
        try {
            return new pi(t,e).range || "*"
        } catch {
            return null
        }
    }
    ;
    Gr.exports = mi
}
);
var B = h( (io, Vr) => {
    "use strict";
    var Ri = L()
      , Ur = x()
      , {ANY: $i} = Ur
      , Ii = T()
      , Li = D()
      , jr = v()
      , Fr = X()
      , Ni = b()
      , Si = _()
      , di = (t, e, r, s) => {
        t = new Ri(t,s),
        e = new Ii(e,s);
        let i, n, o, l, u;
        switch (r) {
        case ">":
            i = jr,
            n = Ni,
            o = Fr,
            l = ">",
            u = ">=";
            break;
        case "<":
            i = Fr,
            n = Si,
            o = jr,
            l = "<",
            u = "<=";
            break;
        default:
            throw new TypeError('Must provide a hilo val of "<" or ">"')
        }
        if (Li(t, e, s))
            return !1;
        for (let m = 0; m < e.set.length; ++m) {
            let R = e.set[m]
              , E = null
              , I = null;
            if (R.forEach(f => {
                f.semver === $i && (f = new Ur(">=0.0.0")),
                E = E || f,
                I = I || f,
                i(f.semver, E.semver, s) ? E = f : o(f.semver, I.semver, s) && (I = f)
            }
            ),
            E.operator === l || E.operator === u || (!I.operator || I.operator === l) && n(t, I.semver))
                return !1;
            if (I.operator === u && o(t, I.semver))
                return !1
        }
        return !0
    }
    ;
    Vr.exports = di
}
);
var _r = h( (no, Xr) => {
    "use strict";
    var Oi = B()
      , Ti = (t, e, r) => Oi(t, e, ">", r);
    Xr.exports = Ti
}
);
var Hr = h( (oo, br) => {
    "use strict";
    var Ai = B()
      , qi = (t, e, r) => Ai(t, e, "<", r);
    br.exports = qi
}
);
var Mr = h( (co, Br) => {
    "use strict";
    var kr = T()
      , wi = (t, e, r) => (t = new kr(t,r),
    e = new kr(e,r),
    t.intersects(e, r));
    Br.exports = wi
}
);
var Wr = h( (ao, Yr) => {
    "use strict";
    var gi = D()
      , Pi = O();
    Yr.exports = (t, e, r) => {
        let s = []
          , i = null
          , n = null
          , o = t.sort( (R, E) => Pi(R, E, r));
        for (let R of o)
            gi(R, e, r) ? (n = R,
            i || (i = R)) : (n && s.push([i, n]),
            n = null,
            i = null);
        i && s.push([i, null]);
        let l = [];
        for (let[R,E] of s)
            R === E ? l.push(R) : !E && R === o[0] ? l.push("*") : E ? R === o[0] ? l.push(`<=${E}`) : l.push(`${R} - ${E}`) : l.push(`>=${R}`);
        let u = l.join(" || ")
          , m = typeof e.raw == "string" ? e.raw : String(e);
        return u.length < m.length ? u : e
    }
}
);
var et = h( (lo, Qr) => {
    "use strict";
    var zr = T()
      , ue = x()
      , {ANY: ae} = ue
      , le = D()
      , Ee = O()
      , vi = (t, e, r={}) => {
        if (t === e)
            return !0;
        t = new zr(t,r),
        e = new zr(e,r);
        let s = !1;
        e: for (let i of t.set) {
            for (let n of e.set) {
                let o = Ci(i, n, r);
                if (s = s || o !== null,
                o)
                    continue e
            }
            if (s)
                return !1
        }
        return !0
    }
      , xi = [new ue(">=0.0.0-0")]
      , Kr = [new ue(">=0.0.0")]
      , Ci = (t, e, r) => {
        if (t === e)
            return !0;
        if (t.length === 1 && t[0].semver === ae) {
            if (e.length === 1 && e[0].semver === ae)
                return !0;
            r.includePrerelease ? t = xi : t = Kr
        }
        if (e.length === 1 && e[0].semver === ae) {
            if (r.includePrerelease)
                return !0;
            e = Kr
        }
        let s = new Set, i, n;
        for (let f of t)
            f.operator === ">" || f.operator === ">=" ? i = Zr(i, f, r) : f.operator === "<" || f.operator === "<=" ? n = Jr(n, f, r) : s.add(f.semver);
        if (s.size > 1)
            return null;
        let o;
        if (i && n) {
            if (o = Ee(i.semver, n.semver, r),
            o > 0)
                return null;
            if (o === 0 && (i.operator !== ">=" || n.operator !== "<="))
                return null
        }
        for (let f of s) {
            if (i && !le(f, String(i), r) || n && !le(f, String(n), r))
                return null;
            for (let nt of e)
                if (!le(f, String(nt), r))
                    return !1;
            return !0
        }
        let l, u, m, R, E = n && !r.includePrerelease && n.semver.prerelease.length ? n.semver : !1, I = i && !r.includePrerelease && i.semver.prerelease.length ? i.semver : !1;
        E && E.prerelease.length === 1 && n.operator === "<" && E.prerelease[0] === 0 && (E = !1);
        for (let f of e) {
            if (R = R || f.operator === ">" || f.operator === ">=",
            m = m || f.operator === "<" || f.operator === "<=",
            i) {
                if (I && f.semver.prerelease && f.semver.prerelease.length && f.semver.major === I.major && f.semver.minor === I.minor && f.semver.patch === I.patch && (I = !1),
                f.operator === ">" || f.operator === ">=") {
                    if (l = Zr(i, f, r),
                    l === f && l !== i)
                        return !1
                } else if (i.operator === ">=" && !f.test(i.semver))
                    return !1
            }
            if (n) {
                if (E && f.semver.prerelease && f.semver.prerelease.length && f.semver.major === E.major && f.semver.minor === E.minor && f.semver.patch === E.patch && (E = !1),
                f.operator === "<" || f.operator === "<=") {
                    if (u = Jr(n, f, r),
                    u === f && u !== n)
                        return !1
                } else if (n.operator === "<=" && !f.test(n.semver))
                    return !1
            }
            if (!f.operator && (n || i) && o !== 0)
                return !1
        }
        return !(i && m && !n && o !== 0 || n && R && !i && o !== 0 || I || E)
    }
      , Zr = (t, e, r) => {
        if (!t)
            return e;
        let s = Ee(t.semver, e.semver, r);
        return s > 0 ? t : s < 0 || e.operator === ">" && t.operator === ">=" ? e : t
    }
      , Jr = (t, e, r) => {
        if (!t)
            return e;
        let s = Ee(t.semver, e.semver, r);
        return s < 0 ? t : s > 0 || e.operator === "<" && t.operator === "<=" ? e : t
    }
    ;
    Qr.exports = vi
}
);
var it = h( (uo, st) => {
    "use strict";
    var fe = g()
      , rt = w()
      , Di = L()
      , tt = z()
      , Gi = q()
      , yi = qe()
      , ji = ge()
      , Fi = xe()
      , Ui = Ge()
      , Vi = je()
      , Xi = Ue()
      , _i = Xe()
      , bi = be()
      , Hi = O()
      , ki = Me()
      , Bi = We()
      , Mi = V()
      , Yi = Je()
      , Wi = er()
      , zi = v()
      , Ki = X()
      , Zi = J()
      , Ji = Q()
      , Qi = _()
      , en = b()
      , rn = ee()
      , tn = lr()
      , sn = Er()
      , nn = x()
      , on = T()
      , cn = D()
      , an = qr()
      , ln = gr()
      , un = vr()
      , En = Dr()
      , fn = yr()
      , hn = B()
      , pn = _r()
      , mn = Hr()
      , Rn = Mr()
      , $n = Wr()
      , In = et();
    st.exports = {
        parse: Gi,
        valid: yi,
        clean: ji,
        inc: Fi,
        diff: Ui,
        major: Vi,
        minor: Xi,
        patch: _i,
        prerelease: bi,
        compare: Hi,
        rcompare: ki,
        compareLoose: Bi,
        compareBuild: Mi,
        sort: Yi,
        rsort: Wi,
        gt: zi,
        lt: Ki,
        eq: Zi,
        neq: Ji,
        gte: Qi,
        lte: en,
        cmp: rn,
        coerce: tn,
        truncate: sn,
        Comparator: nn,
        Range: on,
        satisfies: cn,
        toComparators: an,
        maxSatisfying: ln,
        minSatisfying: un,
        minVersion: En,
        validRange: fn,
        outside: hn,
        gtr: pn,
        ltr: mn,
        intersects: Rn,
        simplifyRange: $n,
        subset: In,
        SemVer: Di,
        re: fe.re,
        src: fe.src,
        tokens: fe.t,
        SEMVER_SPEC_VERSION: rt.SEMVER_SPEC_VERSION,
        RELEASE_TYPES: rt.RELEASE_TYPES,
        compareIdentifiers: tt.compareIdentifiers,
        rcompareIdentifiers: tt.rcompareIdentifiers
    }
}
);
var M = ft(it())
  , {parse: Eo, valid: fo, clean: ho, inc: po, diff: mo, major: Ro, minor: $o, patch: Io, prerelease: Lo, compare: No, rcompare: So, compareLoose: Oo, compareBuild: To, sort: Ao, rsort: qo, gt: wo, lt: go, eq: Po, neq: vo, gte: xo, lte: Co, cmp: Do, coerce: Go, truncate: yo, Comparator: jo, Range: Fo, satisfies: Uo, toComparators: Vo, maxSatisfying: Xo, minSatisfying: _o, minVersion: bo, validRange: Ho, outside: ko, gtr: Bo, ltr: Mo, intersects: Yo, simplifyRange: Wo, subset: zo, SemVer: Ko, re: Zo, src: Jo, tokens: Qo, SEMVER_SPEC_VERSION: ec, RELEASE_TYPES: rc, compareIdentifiers: tc, rcompareIdentifiers: sc} = M
  , ic = M.default ?? M;
export {jo as Comparator, rc as RELEASE_TYPES, Fo as Range, ec as SEMVER_SPEC_VERSION, Ko as SemVer, ho as clean, Do as cmp, Go as coerce, No as compare, To as compareBuild, tc as compareIdentifiers, Oo as compareLoose, ic as default, mo as diff, Po as eq, wo as gt, xo as gte, Bo as gtr, po as inc, Yo as intersects, go as lt, Co as lte, Mo as ltr, Ro as major, Xo as maxSatisfying, _o as minSatisfying, bo as minVersion, $o as minor, vo as neq, ko as outside, Eo as parse, Io as patch, Lo as prerelease, So as rcompare, sc as rcompareIdentifiers, Zo as re, qo as rsort, Uo as satisfies, Wo as simplifyRange, Ao as sort, Jo as src, zo as subset, Vo as toComparators, Qo as tokens, yo as truncate, fo as valid, Ho as validRange};
//# sourceMappingURL=semver.mjs.map
