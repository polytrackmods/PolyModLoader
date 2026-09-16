"use strict";
(self.webpackChunk = self.webpackChunk || []).push([
  [535],
  {
    5467: (t, e, n) => {
      n.d(e, { A: () => o });
      var i = n(1601),
        s = n.n(i),
        a = n(6314),
        r = n.n(a)()(s());
      r.push([
        t.id,
        '.verifier-ui {\n\tposition: absolute;\n\tleft: 0;\n\ttop: 0;\n\tz-index: 2;\n\tmargin: 0;\n\tpadding: 16px;\n\twidth: 100%;\n\theight: 100%;\n\toverflow-y: scroll;\n\tbox-sizing: border-box;\n\tbackground-color: var(--surface-color);\n\tpointer-events: auto;\n}\n\n.verifier-ui > p {\n\tmargin: 16px 4px 0 4px;\n\tpadding: 0;\n\tfont-size: 20px;\n\tcolor: var(--text-color);\n\twhite-space: pre-wrap;\n}\n\n.verifier-ui > input[type="range"] {\n\tmargin: 16px 0;\n\twidth: 390px;\n}\n\n.verifier-ui > table {\n\tmargin: 0;\n\tpadding: 0;\n\twidth: 100%;\n\tborder-collapse: collapse;\n\ttable-layout: fixed;\n\tcolor: var(--text-color);\n}\n\n.verifier-ui > table > thead > tr > th {\n\ttext-align: left;\n\tborder-bottom: 2px solid var(--text-color);\n}\n\n.verifier-ui > table > thead > tr > th, .verifier-ui > table > tbody > tr > td {\n\tpadding: 8px 0;\n\toverflow: hidden;\n\ttext-overflow: ellipsis;\n\twhite-space: nowrap;\n}\n\n.verifier-ui > button {\n\tdisplay: inline-block;\n\tmargin: 16px 0 0 0;\n}\n',
        "",
      ]);
      const o = r;
    },
    5535: (t, e, n) => {
      n.d(e, { default: () => kt });
      var i = n(1635),
        s = n(1754),
        a = n(6146),
        r = n(5220),
        o = n(9117),
        l = n(7480),
        h = n(5072),
        d = n.n(h),
        f = n(7825),
        g = n.n(f),
        c = n(7659),
        m = n.n(c),
        u = n(5056),
        p = n.n(u),
        w = n(540),
        k = n.n(w),
        v = n(1113),
        G = n.n(v),
        x = n(5467),
        M = {};
      ((M.styleTagTransform = G()),
        (M.setAttributes = p()),
        (M.insert = m().bind(null, "head")),
        (M.domAPI = g()),
        (M.insertStyleElement = k()));
      d()(x.A, M);
      x.A && x.A.locals && x.A.locals;
      var R, C, y, W, b, S, T;
      ((R = new WeakMap()),
        (C = new WeakMap()),
        (y = new WeakMap()),
        (W = new WeakMap()),
        (b = new WeakMap()),
        (S = new WeakMap()),
        (T = new WeakMap()));
      const E = class {
        constructor(t, e, n, a, r, o) {
          (R.set(this, void 0),
            C.set(this, void 0),
            y.set(this, void 0),
            W.set(this, void 0),
            b.set(this, void 0),
            S.set(this, void 0),
            T.set(this, new Map()));
          const l = document.getElementById("ui");
          if (null == l) throw new Error("UI element not found");
          ((0, i.GG)(this, R, l, "f"),
            (0, i.GG)(this, C, document.createElement("div"), "f"),
            ((0, i.gn)(this, C, "f").className = "verifier-ui"),
            (0, i.gn)(this, R, "f").appendChild((0, i.gn)(this, C, "f")),
            (0, i.GG)(this, y, document.createElement("p"), "f"),
            (0, i.gn)(this, C, "f").appendChild((0, i.gn)(this, y, "f")));
          const h = document.createElement("p");
          ((h.textContent = "Number of threads: " + e.toString()),
            (0, i.gn)(this, C, "f").appendChild(h));
          const d = document.createElement("input");
          ((d.type = "range"),
            (d.min = "0"),
            (d.max = e.toString()),
            (d.value = e.toString()),
            d.addEventListener("change", () => {
              const t = parseInt(d.value, 10);
              ((h.textContent = "Number of threads: " + t.toString()), r(t));
            }),
            (0, i.gn)(this, C, "f").appendChild(d));
          const f = document.createElement("p");
          ((f.textContent =
            "Max time: " + Math.floor(n / 60 / 1e3).toString() + " minutes"),
            (0, i.gn)(this, C, "f").appendChild(f));
          const g = document.createElement("input");
          ((g.type = "range"),
            (g.min = (6e4).toString()),
            (g.max = s.A.maxFrames.toString()),
            (g.value = n.toString()),
            g.addEventListener("input", () => {
              const t = parseInt(g.value, 10);
              ((f.textContent =
                "Max time: " +
                Math.floor(t / 60 / 1e3).toString() +
                " minutes"),
                o(t));
            }),
            (0, i.gn)(this, C, "f").appendChild(g));
          const c = document.createElement("table");
          ((0, i.gn)(this, C, "f").appendChild(c),
            (0, i.GG)(this, W, c.createTHead(), "f"),
            (0, i.GG)(this, b, c.createTBody(), "f"));
          const m = (0, i.gn)(this, W, "f").insertRow();
          for (const t of [
            "Track",
            "State",
            "Verified",
            "Invalid",
            "Estimated remaining",
          ]) {
            const e = document.createElement("th");
            ((e.textContent = t), m.appendChild(e));
          }
          const u = document.createElement("button");
          ((u.className = "button"),
            (u.textContent = "Stop"),
            u.addEventListener("click", () => {
              (t.playUIClick(), a());
            }),
            (0, i.gn)(this, C, "f").appendChild(u),
            window.addEventListener(
              "keydown",
              (0, i.GG)(
                this,
                S,
                (t) => {
                  "Escape" == t.code && (a(), t.preventDefault());
                },
                "f",
              ),
            ));
        }
        dispose() {
          ((0, i.gn)(this, R, "f").removeChild((0, i.gn)(this, C, "f")),
            window.removeEventListener("keydown", (0, i.gn)(this, S, "f")));
        }
        setText(t) {
          (0, i.gn)(this, y, "f").textContent = t;
        }
        setTracks(t) {
          for (const e of t) {
            let t = (0, i.gn)(this, T, "f").get(e.id);
            if (null == t) {
              ((t = {
                element: (0, i.gn)(this, b, "f").insertRow(),
                name: e.name,
                exhausted: e.exhausted,
                recordingsVerified: e.recordingsVerified,
                invalidRecordings: e.invalidRecordings,
                estimatedRemaining: e.estimatedRemaining,
              }),
                (0, i.gn)(this, T, "f").set(e.id, t));
              t.element.insertCell().textContent = e.name;
              t.element.insertCell().textContent = e.exhausted
                ? "Empty"
                : "Processing";
              t.element.insertCell().textContent =
                e.recordingsVerified.toString();
              t.element.insertCell().textContent =
                e.invalidRecordings.toString();
              const n = t.element.insertCell();
              null != e.estimatedRemaining
                ? (n.textContent = e.estimatedRemaining.toString())
                : (n.textContent = "?");
            } else
              (t.name != e.name &&
                ((t.element.cells[0].textContent = e.name), (t.name = e.name)),
                t.exhausted != e.exhausted &&
                  ((t.element.cells[1].textContent = e.exhausted
                    ? "Empty"
                    : "Processing"),
                  (t.exhausted = e.exhausted)),
                t.recordingsVerified != e.recordingsVerified &&
                  ((t.element.cells[2].textContent =
                    e.recordingsVerified.toString()),
                  (t.recordingsVerified = e.recordingsVerified)),
                t.invalidRecordings != e.invalidRecordings &&
                  ((t.element.cells[3].textContent =
                    e.invalidRecordings.toString()),
                  (t.invalidRecordings = e.invalidRecordings)),
                t.estimatedRemaining != e.estimatedRemaining &&
                  (null != e.estimatedRemaining
                    ? (t.element.cells[4].textContent =
                        e.estimatedRemaining.toString())
                    : (t.element.cells[4].textContent = "?"),
                  (t.estimatedRemaining = e.estimatedRemaining)));
          }
          const e = new Set(t.map((t) => t.id));
          for (const [t, n] of (0, i.gn)(this, T, "f"))
            e.has(t) ||
              ((0, i.gn)(this, b, "f").removeChild(n.element),
              (0, i.gn)(this, T, "f").delete(t));
        }
      };
      var D,
        V,
        I,
        A,
        F,
        B,
        P,
        U,
        L,
        N,
        z,
        O,
        Y,
        H,
        j,
        q,
        J,
        K,
        Q,
        X,
        Z,
        $,
        _,
        tt,
        et,
        nt,
        it,
        st,
        at,
        rt,
        ot,
        lt,
        ht,
        dt,
        ft,
        gt,
        ct,
        mt,
        ut = n(2522),
        pt = n(8583);
      class wt {
        constructor(t, e, n, a, o, l, h, d, f) {
          (D.add(this),
            I.set(this, void 0),
            A.set(this, void 0),
            F.set(this, void 0),
            B.set(this, void 0),
            P.set(this, void 0),
            U.set(this, void 0),
            L.set(this, void 0),
            N.set(this, []),
            z.set(this, []),
            O.set(this, []),
            Y.set(this, null),
            H.set(this, !1),
            j.set(this, new Date()),
            q.set(this, !1),
            J.set(this, new Date()),
            K.set(this, []),
            Q.set(this, !0),
            X.set(this, void 0),
            Z.set(this, new Date()),
            $.set(this, 0),
            _.set(this, 0),
            tt.set(this, 0),
            et.set(this, 0),
            nt.set(this, 100),
            it.set(this, 100),
            st.set(this, 1e3),
            at.set(this, 36e5),
            rt.set(this, s.A.maxFrames),
            ot.set(this, 4),
            lt.set(this, void 0),
            (0, i.GG)(this, I, t, "f"),
            (0, i.GG)(this, A, e, "f"),
            (0, i.GG)(this, F, n, "f"),
            (0, i.GG)(this, B, a, "f"),
            (0, i.GG)(this, P, h, "f"),
            (0, i.GG)(this, U, d, "f"),
            "undefined" != typeof navigator &&
              "hardwareConcurrency" in navigator &&
              navigator.hardwareConcurrency > 0 &&
              (0, i.GG)(this, ot, navigator.hardwareConcurrency, "f"),
            (0, i.GG)(this, lt, (0, i.gn)(this, ot, "f"), "f"),
            e.clear(),
            (0, i.GG)(
              this,
              L,
              new E(
                t,
                (0, i.gn)(this, ot, "f"),
                (0, i.gn)(this, rt, "f"),
                f,
                (t) => {
                  for (
                    (0, i.GG)(this, lt, t, "f");
                    (0, i.gn)(this, N, "f").length < (0, i.gn)(this, lt, "f");
                  )
                    (0, i.gn)(this, N, "f").push({
                      simulation: new r.A(!1, l, h),
                      isBusy: !1,
                      isDisposed: !1,
                    });
                  for (
                    ;
                    (0, i.gn)(this, N, "f").length > (0, i.gn)(this, lt, "f");
                  ) {
                    const t = (0, i.gn)(this, N, "f").pop();
                    null != t && (t.simulation.dispose(), (t.isDisposed = !0));
                  }
                },
                (t) => {
                  (0, i.GG)(this, rt, t, "f");
                  for (const t of (0, i.gn)(this, z, "f"))
                    ((t.timeout = new Date()), (t.estimatedRemaining = null));
                },
              ),
              "f",
            ));
          for (let t = 0; t < (0, i.gn)(this, lt, "f"); t++)
            (0, i.gn)(this, N, "f").push({
              simulation: new r.A(!1, l, (0, i.gn)(this, P, "f")),
              isBusy: !1,
              isDisposed: !1,
            });
          if (
            (o.forEachTrack((t, e, n, s, a) => {
              (0, i.gn)(this, z, "f").push({
                id: t,
                name: e.name,
                trackData: () => a().then(({ trackData: t }) => t),
                trackCategory: n,
                timeout: new Date(),
                recordingsVerified: 0,
                invalidRecordings: 0,
                estimatedRemaining: null,
                lastEstimatedRemainingTime: null,
              });
            }),
            (0, i.GG)(
              this,
              X,
              setInterval(() => {
                ((0, i.gn)(this, D, "m", gt).call(this),
                  (0, i.gn)(this, D, "m", ft).call(this));
              }, 10),
              "f",
            ),
            window.electron)
          ) {
            const t = () => {
              if (window.electron) {
                const t = new Date(),
                  e =
                    "--- PolyTrack Verifier ---\n" +
                    (0, i.gn)(this, D, "m", ct).call(this, t);
                window.electron.log(e);
              }
            };
            (setInterval(t, 1e4), t());
          }
        }
        dispose() {
          (0, i.gn)(this, L, "f").dispose();
          for (const t of (0, i.gn)(this, N, "f"))
            (t.simulation.dispose(), (t.isDisposed = !0));
          (((0, i.gn)(this, N, "f").length = 0),
            clearInterval((0, i.gn)(this, X, "f")));
        }
        update(t) {
          if ((0, i.gn)(this, P, "f").hasLoaded()) {
            const t = new Date();
            ((0, i.gn)(this, L, "f").setText(
              (0, i.gn)(this, D, "m", ct).call(this, t),
            ),
              (0, i.gn)(this, L, "f").setTracks(
                (0, i.gn)(this, z, "f").map(
                  ({
                    id: e,
                    name: n,
                    timeout: i,
                    recordingsVerified: s,
                    invalidRecordings: a,
                    estimatedRemaining: r,
                  }) => ({
                    id: e,
                    name: n,
                    exhausted: i > t,
                    recordingsVerified: s,
                    invalidRecordings: a,
                    estimatedRemaining: r,
                  }),
                ),
              ));
          }
          (0, i.gn)(this, I, "f").update(t, !1, (0, i.gn)(this, A, "f"));
        }
      }
      ((V = wt),
        (I = new WeakMap()),
        (A = new WeakMap()),
        (F = new WeakMap()),
        (B = new WeakMap()),
        (P = new WeakMap()),
        (U = new WeakMap()),
        (L = new WeakMap()),
        (N = new WeakMap()),
        (z = new WeakMap()),
        (O = new WeakMap()),
        (Y = new WeakMap()),
        (H = new WeakMap()),
        (j = new WeakMap()),
        (q = new WeakMap()),
        (J = new WeakMap()),
        (K = new WeakMap()),
        (Q = new WeakMap()),
        (X = new WeakMap()),
        (Z = new WeakMap()),
        ($ = new WeakMap()),
        (_ = new WeakMap()),
        (tt = new WeakMap()),
        (et = new WeakMap()),
        (nt = new WeakMap()),
        (it = new WeakMap()),
        (st = new WeakMap()),
        (at = new WeakMap()),
        (rt = new WeakMap()),
        (ot = new WeakMap()),
        (lt = new WeakMap()),
        (D = new WeakSet()),
        (ht = function (t) {
          const e = (0, i.gn)(this, z, "f").slice();
          do {
            const n = Math.floor(Math.random() * e.length),
              i = e.splice(n, 1)[0];
            if (t > i.timeout) return i;
          } while (e.length > 0);
          return null;
        }),
        (dt = function () {
          const t = new Date();
          if (
            !(0, i.gn)(this, q, "f") &&
            (0, i.gn)(this, K, "f").length < (0, i.gn)(this, it, "f") &&
            Math.abs(t.getTime() - (0, i.gn)(this, J, "f").getTime()) >=
              (0, i.gn)(this, st, "f")
          ) {
            ((0, i.GG)(this, q, !0, "f"), (0, i.GG)(this, J, t, "f"));
            const e = (0, i.gn)(this, D, "m", ht).call(this, t);
            if (
              null != e ||
              ((0, i.gn)(this, O, "f").length > 0 &&
                0 == (0, i.gn)(this, K, "f").length) ||
              (0, i.gn)(this, O, "f").length > (0, i.gn)(this, nt, "f")
            ) {
              const n = (0, i.gn)(this, O, "f");
              (0, i.GG)(this, O, [], "f");
              const r =
                null != e &&
                (null == e.lastEstimatedRemainingTime ||
                  Math.abs(
                    t.getTime() - e.lastEstimatedRemainingTime.getTime(),
                  ) >= (0, i.gn)(this, at, "f"));
              (0, i.gn)(this, F, "f")
                .verifyRecordings(
                  (0, i.gn)(this, U, "f"),
                  e?.id ?? null,
                  (0, i.gn)(this, rt, "f"),
                  r,
                  n,
                )
                .then(
                  ({
                    unverifiedRecordings: n,
                    exhaustive: r,
                    estimatedRemaining: o,
                  }) => {
                    if (null != e)
                      if (
                        ((0, i.GG)(
                          this,
                          K,
                          (0, i.gn)(this, K, "f").concat(
                            n.map(({ id: t, recording: n, frames: i }) => ({
                              track: e,
                              recordingId: t,
                              recording: s.A.deserialize(n),
                              time: new a.A(i),
                            })),
                          ),
                          "f",
                        ),
                        r)
                      ) {
                        let i;
                        switch (e.trackCategory) {
                          case "official":
                            i = Math.floor(9e5 + 15 * Math.random() * 60 * 1e3);
                            break;
                          case "community":
                            i = Math.floor(
                              36e5 + 60 * Math.random() * 60 * 1e3,
                            );
                            break;
                          case "custom":
                            i = Math.floor(
                              432e5 + 12 * Math.random() * 60 * 60 * 1e3,
                            );
                            break;
                          default:
                            throw (
                              e.trackCategory,
                              new Error("Unknown track category")
                            );
                        }
                        ((e.timeout = new Date(t.getTime() + i)),
                          (e.estimatedRemaining = n.length),
                          (e.lastEstimatedRemainingTime = t));
                      } else
                        null != o &&
                          ((e.estimatedRemaining = o),
                          (e.lastEstimatedRemainingTime = t));
                  },
                )
                .catch((t) => {
                  (console.error(t),
                    (0, i.gn)(this, F, "f")
                      .getUser((0, i.gn)(this, U, "f"))
                      .then((t) => {
                        if (!t?.isVerifier) {
                          for (let t = 0; t < ut.A.maxNumberOfProfiles; t++) {
                            const e = (0, i.gn)(this, B, "f").getUserProfile(t);
                            if (
                              null != e &&
                              e.isVerifier &&
                              e.token == (0, i.gn)(this, U, "f")
                            ) {
                              (0, i.gn)(this, B, "f").setIsVerifier(!1, t);
                              break;
                            }
                          }
                          (0, i.GG)(this, Q, !1, "f");
                        }
                      })
                      .catch((t) => {
                        console.warn(t);
                      }));
                })
                .finally(() => {
                  (0, i.GG)(this, q, !1, "f");
                });
            } else (0, i.GG)(this, q, !1, "f");
          }
        }),
        (ft = async function () {
          var t, e, n, s, a, r;
          if ((0, i.gn)(this, P, "f").hasLoaded() && (0, i.gn)(this, Q, "f")) {
            (0, i.gn)(this, D, "m", dt).call(this);
            for (const l of (0, i.gn)(this, N, "f"))
              if (!l.isBusy && (0, i.gn)(this, K, "f").length > 0) {
                l.isBusy = !0;
                const {
                  track: h,
                  recordingId: d,
                  recording: f,
                  time: g,
                } = (0, i.gn)(this, K, "f").splice(0, 1)[0];
                if (null == f)
                  ((0, i.GG)(
                    this,
                    _,
                    ((t = (0, i.gn)(this, _, "f")), ++t),
                    "f",
                  ),
                    h.recordingsVerified++,
                    (0, i.GG)(
                      this,
                      tt,
                      ((e = (0, i.gn)(this, tt, "f")), ++e),
                      "f",
                    ),
                    h.invalidRecordings++,
                    null != h.estimatedRemaining &&
                      ((h.estimatedRemaining = Math.max(
                        0,
                        h.estimatedRemaining - 1,
                      )),
                      0 == h.estimatedRemaining &&
                        (h.lastEstimatedRemainingTime = null)),
                    (0, i.gn)(this, O, "f").push({
                      id: d,
                      verifiedState: pt.Y.Invalid,
                    }),
                    (l.isBusy = !1));
                else {
                  let t;
                  (0, i.GG)(this, $, ((n = (0, i.gn)(this, $, "f")), ++n), "f");
                  try {
                    h.trackData instanceof o.A
                      ? (t = h.trackData)
                      : h.trackData instanceof Promise
                        ? (t = await h.trackData)
                        : ((t = await (h.trackData = h.trackData())),
                          (h.trackData = t));
                  } catch (e) {
                    (console.error(
                      'Failed to load track data for track "' + h.name + '":',
                      e,
                    ),
                      (t = null));
                  }
                  try {
                    if (null != t) {
                      const e = await l.simulation.validate(t, f, g);
                      ((0, i.GG)(
                        this,
                        _,
                        ((s = (0, i.gn)(this, _, "f")), ++s),
                        "f",
                      ),
                        h.recordingsVerified++,
                        e ||
                          ((0, i.GG)(
                            this,
                            tt,
                            ((a = (0, i.gn)(this, tt, "f")), ++a),
                            "f",
                          ),
                          h.invalidRecordings++),
                        null != h.estimatedRemaining &&
                          ((h.estimatedRemaining = Math.max(
                            0,
                            h.estimatedRemaining - 1,
                          )),
                          0 == h.estimatedRemaining &&
                            (h.lastEstimatedRemainingTime = null)),
                        (0, i.GG)(
                          this,
                          et,
                          (0, i.gn)(this, et, "f") + g.numberOfFrames,
                          "f",
                        ),
                        (0, i.gn)(this, O, "f").push({
                          id: d,
                          verifiedState: e ? pt.Y.Verified : pt.Y.Invalid,
                        }));
                    }
                  } catch (t) {
                    if (!l.isDisposed) throw t;
                  } finally {
                    ((l.isBusy = !1),
                      (0, i.GG)(
                        this,
                        $,
                        ((r = (0, i.gn)(this, $, "f")), --r),
                        "f",
                      ));
                  }
                }
              }
          }
        }),
        (gt = function () {
          if ((0, i.gn)(this, H, "f")) return;
          const t = new Date();
          t > (0, i.gn)(this, j, "f") &&
            ((0, i.GG)(this, H, !0, "f"),
            (0, i.gn)(this, F, "f")
              .getTrackOfTheWeek()
              .then(({ current: e }) => {
                if (null != e) {
                  if (
                    null == (0, i.gn)(this, Y, "f") ||
                    (0, i.gn)(this, Y, "f").id != e.trackId
                  ) {
                    for (let t = 0; t < (0, i.gn)(this, z, "f").length; t++)
                      if (
                        (0, i.gn)(this, z, "f")[t] == (0, i.gn)(this, Y, "f")
                      ) {
                        (0, i.gn)(this, z, "f").splice(t, 1);
                        break;
                      }
                    ((0, i.GG)(
                      this,
                      Y,
                      {
                        id: e.trackId,
                        name: e.trackMetadata.name,
                        trackData: () =>
                          (0, i.gn)(this, F, "f")
                            .loadTrackCodeFromUrl(e.trackUrl)
                            .then((t) => {
                              const e = o.A.fromExportString(t);
                              if (null == e) throw new l.A();
                              return e.trackData;
                            }),
                        trackCategory: "community",
                        timeout: new Date(),
                        recordingsVerified: 0,
                        invalidRecordings: 0,
                        estimatedRemaining: null,
                        lastEstimatedRemainingTime: null,
                      },
                      "f",
                    ),
                      (0, i.gn)(this, z, "f").push((0, i.gn)(this, Y, "f")));
                  }
                  (0, i.GG)(
                    this,
                    j,
                    new Date(Math.min(e.endTime.getTime(), t.getTime() + 36e5)),
                    "f",
                  );
                } else {
                  if (null != (0, i.gn)(this, Y, "f")) {
                    for (let t = 0; t < (0, i.gn)(this, z, "f").length; t++)
                      if (
                        (0, i.gn)(this, z, "f")[t] == (0, i.gn)(this, Y, "f")
                      ) {
                        (0, i.gn)(this, z, "f").splice(t, 1);
                        break;
                      }
                    (0, i.GG)(this, Y, null, "f");
                  }
                  (0, i.GG)(this, j, new Date(t.getTime() + 36e5), "f");
                }
              })
              .catch((t) => {
                console.error("Failed to get track of the week:", t);
              })
              .finally(() => {
                (0, i.GG)(this, H, !1, "f");
              }));
        }),
        (ct = function (t) {
          const e = (t.getTime() - (0, i.gn)(this, Z, "f").getTime()) / 1e3;
          let n = "";
          ((0, i.gn)(this, Q, "f")
            ? (n += "Recordings are being verified...\n")
            : (n += "Error: User is no longer a verifier\n"),
            (n += "\nBacklog: " + (0, i.gn)(this, K, "f").length.toString()),
            (n += "\nProcessing: " + (0, i.gn)(this, $, "f").toString()),
            (n +=
              "\nRecordings verified: " + (0, i.gn)(this, _, "f").toString()),
            (n +=
              "\nInvalid recordings found: " +
              (0, i.gn)(this, tt, "f").toString()),
            (n += "\n"));
          const s = (0, i.gn)(this, _, "f") / e;
          ((n += "\nVerifications per second: " + s.toFixed(2)),
            (n +=
              "\nSimulated frames per second: " +
              Math.floor((0, i.gn)(this, et, "f") / e).toString()),
            (n += "\n"));
          const a = (0, i.gn)(this, z, "f").reduce(
            (t, e) =>
              null != e.estimatedRemaining ? t + e.estimatedRemaining : t,
            0,
          );
          return (
            (n += "\nTotal estimated remaining: " + a.toString()),
            (n +=
              "\nTotal estimated remaining time: " +
              (0, i.gn)(V, V, "m", mt).call(V, a / s)),
            n
          );
        }),
        (mt = function (t) {
          if (t <= 0 || !Number.isFinite(t)) return "0s";
          if (t < 60) return t.toFixed(0) + "s";
          if (t < 3600) {
            const e = t % 60;
            return Math.floor(t / 60).toString() + "m " + e.toFixed(0) + "s";
          }
          if (t < 86400) {
            const e = Math.floor(t / 3600),
              n = Math.floor((t % 3600) / 60),
              i = t % 60;
            return (
              e.toString() + "h " + n.toString() + "m " + i.toFixed(0) + "s"
            );
          }
          {
            const e = Math.floor(t / 86400),
              n = Math.floor((t % 86400) / 3600),
              i = Math.floor((t % 3600) / 60),
              s = t % 60;
            return (
              e.toString() +
              "d " +
              n.toString() +
              "h " +
              i.toString() +
              "m " +
              s.toFixed(0) +
              "s"
            );
          }
        }));
      const kt = wt;
    },
  },
]);
