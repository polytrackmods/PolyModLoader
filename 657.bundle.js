"use strict";
(self.webpackChunk = self.webpackChunk || []).push([
  [657],
  {
    2657: (t, e, n) => {
      n.d(e, { default: () => z });
      var a = n(1635),
        i = n(1312),
        d = n(5072),
        o = n.n(d),
        l = n(7825),
        c = n.n(l),
        r = n(7659),
        s = n.n(r),
        m = n(5056),
        p = n.n(m),
        h = n(540),
        u = n.n(h),
        f = n(1113),
        k = n.n(f),
        C = n(5768),
        b = {};
      ((b.styleTagTransform = k()),
        (b.setAttributes = p()),
        (b.insert = s().bind(null, "head")),
        (b.domAPI = c()),
        (b.insertStyleElement = u()));
      o()(C.A, b);
      C.A && C.A.locals && C.A.locals;
      var v,
        x,
        g,
        w,
        E,
        y,
        L,
        I,
        N,
        T,
        U,
        M,
        G = n(8583),
        S = n(9117),
        D = n(2843);
      ((x = new WeakMap()),
        (g = new WeakMap()),
        (w = new WeakMap()),
        (E = new WeakMap()),
        (y = new WeakMap()),
        (L = new WeakMap()),
        (I = new WeakMap()),
        (N = new WeakMap()),
        (v = new WeakSet()),
        (T = function (t, e, n, d, o, l) {
          const c = (0, i.sha256)(l),
            r = document.createElement("div");
          ((r.className = "leaderboard-moderation hidden"),
            (0, a.gn)(this, g, "f").appendChild(r));
          const s = document.createElement("div");
          ((s.className = "tracks-list"), r.appendChild(s));
          let m = null,
            p = 1;
          async function h(a, i) {
            ((m = a), (p = i), (L.value = i.toString()), (w.innerHTML = ""));
            for (let t = 0; t < 21; t++) {
              const e = document.createElement("tr");
              if ((w.appendChild(e), 0 == t)) {
                const t = document.createElement("th");
                ((t.textContent = "Loading..."), e.appendChild(t));
              } else {
                const t = document.createElement("td");
                e.appendChild(t);
              }
            }
            let d = [];
            if (null != a)
              try {
                d = (await o.getLeaderboard(c, a, 20 * (i - 1), 20, !1))
                  .entries;
              } catch {}
            w.innerHTML = "";
            const r = document.createElement("tr");
            w.appendChild(r);
            const s = document.createElement("th");
            ((s.textContent = "Placement"), r.appendChild(s));
            const h = document.createElement("th");
            ((h.textContent = "Name"), r.appendChild(h));
            const u = document.createElement("th");
            ((u.textContent = "Date"), r.appendChild(u));
            const f = document.createElement("th");
            ((f.textContent = "Frames"), r.appendChild(f));
            const k = document.createElement("th");
            ((k.textContent = "Verified State"), r.appendChild(k));
            const C = document.createElement("th");
            ((C.textContent = "Action"), r.appendChild(C));
            const b = new Date();
            for (let a = 0; a < 20; a++) {
              const c = document.createElement("tr");
              if ((w.appendChild(c), d.length > a)) {
                const r = d[a],
                  s = document.createElement("td");
                ((s.textContent = (20 * (i - 1) + a + 1).toString()),
                  c.appendChild(s));
                const m = document.createElement("td");
                ((m.textContent = r.nickname), c.appendChild(m));
                const p = document.createElement("td");
                ((p.textContent = (0, D.u)(n, r.time, b)),
                  b.getTime() - r.time.getTime() < 864e5
                    ? (p.style.color = "#f55")
                    : b.getTime() - r.time.getTime() < 6048e5 &&
                      (p.style.color = "#ff5"),
                  c.appendChild(p));
                const h = document.createElement("td");
                ((h.textContent = r.frames.numberOfFrames.toString()),
                  c.appendChild(h));
                const u = document.createElement("td");
                switch (r.verifiedState) {
                  case G.Y.Pending:
                    u.textContent = "Pending";
                    break;
                  case G.Y.Verified:
                    u.textContent = "Verified";
                    break;
                  case G.Y.Invalid:
                    u.textContent = "Invalid";
                    break;
                  case G.Y.InvalidDuplicate:
                    u.textContent = "Invalid Duplicate";
                    break;
                  case G.Y.InvalidManual:
                    u.textContent = "Invalid Manual";
                    break;
                  default:
                    u.textContent = "Unknown";
                }
                c.appendChild(u);
                const f = r.verifiedState,
                  k = document.createElement("td"),
                  C = document.createElement("button");
                ((C.className = "button"),
                  (C.textContent = "Invalidate"),
                  C.addEventListener("click", () => {
                    let n;
                    (t.playUIClick(),
                      (n =
                        r.verifiedState == G.Y.InvalidManual
                          ? f
                          : G.Y.InvalidManual),
                      (C.disabled = !0),
                      o
                        .verifyRecordings(l, null, 1, !1, [
                          { id: r.id, verifiedState: n },
                        ])
                        .then(() => {
                          switch (((r.verifiedState = n), r.verifiedState)) {
                            case G.Y.Pending:
                              u.textContent = "Pending";
                              break;
                            case G.Y.Verified:
                              u.textContent = "Verified";
                              break;
                            case G.Y.Invalid:
                              u.textContent = "Invalid";
                              break;
                            case G.Y.InvalidDuplicate:
                              u.textContent = "Invalid Duplicate";
                              break;
                            case G.Y.InvalidManual:
                              u.textContent = "Invalid Manual";
                              break;
                            default:
                              u.textContent = "Unknown";
                          }
                          r.verifiedState == G.Y.InvalidManual
                            ? ((s.style.opacity = "0.3"),
                              (m.style.opacity = "0.3"),
                              (p.style.opacity = "0.3"),
                              (h.style.opacity = "0.3"),
                              (u.style.opacity = "0.3"),
                              (C.textContent = "Undo"))
                            : ((s.style.opacity = ""),
                              (m.style.opacity = ""),
                              (p.style.opacity = ""),
                              (h.style.opacity = ""),
                              (u.style.opacity = ""),
                              (C.textContent = "Invalidate"));
                        })
                        .catch(() => {
                          e.show("Failed to invalidate entry", "Ok", null);
                        })
                        .finally(() => {
                          C.disabled = !1;
                        }));
                  }),
                  k.appendChild(C),
                  c.appendChild(k));
              } else
                (c.appendChild(document.createElement("td")),
                  c.appendChild(document.createElement("td")),
                  c.appendChild(document.createElement("td")),
                  c.appendChild(document.createElement("td")),
                  c.appendChild(document.createElement("td")),
                  c.appendChild(document.createElement("td")));
            }
          }
          const u = [],
            f = document.createElement("div");
          ((f.className = "title"),
            (f.textContent = "Official Tracks"),
            s.appendChild(f),
            d.forEachOfficialTrack((e, n, a) => {
              const i = document.createElement("button");
              ((i.className = "button"),
                (i.textContent = a.name),
                i.addEventListener("click", () => {
                  t.playUIClick();
                  for (const t of u) t.classList.remove("selected");
                  (i.classList.add("selected"), h(e, 1));
                }),
                s.appendChild(i),
                u.push(i));
            }));
          const k = document.createElement("div");
          ((k.className = "title"),
            (k.textContent = "Community Tracks"),
            s.appendChild(k));
          let C = null;
          d.forEachCommunityTrack((e, n, a) => {
            if (C != n) {
              const t = document.createElement("div");
              ((t.className = "subtitle"),
                (t.textContent = n.toString()),
                s.appendChild(t),
                (C = n));
            }
            const i = document.createElement("button");
            ((i.className = "button"),
              (i.textContent = a.name),
              i.addEventListener("click", () => {
                t.playUIClick();
                for (const t of u) t.classList.remove("selected");
                (i.classList.add("selected"), h(e, 1));
              }),
              s.appendChild(i),
              u.push(i));
          });
          const b = document.createElement("div");
          ((b.className = "title"),
            (b.textContent = "Custom Tracks"),
            s.appendChild(b));
          let v = !1;
          (d.forEachCustomTrack((e, n) => {
            const a = document.createElement("button");
            ((a.className = "button"),
              (a.textContent = n.name),
              a.addEventListener("click", () => {
                t.playUIClick();
                for (const t of u) t.classList.remove("selected");
                (a.classList.add("selected"), h(e, 1));
              }),
              s.appendChild(a),
              u.push(a),
              (v = !0));
          }),
            v || s.removeChild(b),
            o
              .getTrackOfTheWeek()
              .then((e) => {
                if (null != e.current) {
                  const n = document.createElement("div");
                  ((n.className = "title"),
                    (n.textContent = "Track of the Week"),
                    s.appendChild(n));
                  const a = e.current.trackId,
                    i = e.current.trackMetadata,
                    d = document.createElement("button");
                  ((d.className = "button"),
                    (d.textContent = i.name),
                    d.addEventListener("click", () => {
                      t.playUIClick();
                      for (const t of u) t.classList.remove("selected");
                      (d.classList.add("selected"), h(a, 1));
                    }),
                    s.appendChild(d),
                    u.push(d));
                }
              })
              .catch(() => {}));
          const x = document.createElement("div");
          ((x.className = "leaderboard-container"), r.appendChild(x));
          const w = document.createElement("table");
          x.appendChild(w);
          const E = document.createElement("div");
          ((E.className = "navigation"), x.appendChild(E));
          const y = document.createElement("button");
          ((y.className = "button"),
            (y.textContent = "<"),
            y.addEventListener("click", () => {
              (t.playUIClick(), null != m && h(m, Math.max(1, p - 1)));
            }),
            E.appendChild(y));
          const L = document.createElement("input");
          ((L.type = "text"),
            (L.min = "1"),
            (L.value = "1"),
            L.addEventListener("change", () => {
              const t = parseInt(L.value, 10);
              null != m && Number.isSafeInteger(t) && t >= 1 && h(m, t);
            }),
            E.appendChild(L));
          const I = document.createElement("button");
          ((I.className = "button"),
            (I.textContent = ">"),
            I.addEventListener("click", () => {
              (t.playUIClick(), null != m && h(m, p + 1));
            }),
            E.appendChild(I));
          const N = document.createElement("button");
          return (
            (N.className = "button"),
            (N.innerHTML = '<img class="button-icon" src="images/reset.svg">'),
            N.addEventListener("click", () => {
              (t.playUIClick(), null != m && h(m, p));
            }),
            E.appendChild(N),
            h(null, 1),
            r
          );
        }),
        (U = function () {
          const t = document.createElement("div");
          ((t.className = "track-of-the-week hidden"),
            (0, a.gn)(this, g, "f").appendChild(t));
          const e = document.createElement("table");
          t.appendChild(e);
          const n = document.createElement("div");
          return (
            (n.className = "track-of-the-week-edit hidden"),
            t.appendChild(n),
            { div: t, table: e, editDiv: n }
          );
        }),
        (M = function t(e, n, i) {
          (0, a.gn)(this, y, "f").innerHTML = "";
          const d = document.createElement("tr");
          (0, a.gn)(this, y, "f").appendChild(d);
          const o = document.createElement("th");
          ((o.textContent = "Time Span"), d.appendChild(o));
          const l = document.createElement("th");
          ((l.textContent = "Track Name"), d.appendChild(l));
          const c = document.createElement("th");
          ((c.textContent = "Author"), d.appendChild(c));
          const r = document.createElement("th");
          ((r.textContent = "Action"), d.appendChild(r));
          const s = 6048e5,
            m = new Date("2026-07-26T20:00:00Z");
          (n
            .getAdminTrackOfTheWeekList(i)
            .then(({ currentEpoch: d, list: o }) => {
              for (let l = 0; l < o.length; l++) {
                const c = o[l],
                  r = d + l,
                  p = new Date(m.getTime() + r * s),
                  h = new Date(p.getTime() + s),
                  u = document.createElement("tr");
                (0, a.gn)(this, y, "f").appendChild(u);
                const f = document.createElement("td");
                ((f.textContent =
                  p.toLocaleDateString(void 0, {
                    month: "short",
                    day: "numeric",
                  }) +
                  " - " +
                  h.toLocaleDateString(void 0, {
                    month: "short",
                    day: "numeric",
                  })),
                  u.appendChild(f));
                const k = document.createElement("td");
                (null != c && (k.textContent = c.name), u.appendChild(k));
                const C = document.createElement("td");
                (null != c && (C.textContent = c.author ?? "Unknown"),
                  u.appendChild(C));
                const b = document.createElement("td"),
                  x = document.createElement("button");
                ((x.className = "button"),
                  (x.textContent = "Edit"),
                  x.addEventListener("click", () => {
                    (e.playUIClick(),
                      (0, a.gn)(this, y, "f").classList.add("hidden"),
                      (0, a.gn)(this, I, "f").classList.remove("hidden"));
                    const d = document.createElement("div");
                    ((d.className = "title"),
                      (d.textContent =
                        "Time Span: " +
                        p.toLocaleDateString(void 0, {
                          month: "short",
                          day: "numeric",
                        }) +
                        " - " +
                        h.toLocaleDateString(void 0, {
                          month: "short",
                          day: "numeric",
                        })),
                      (0, a.gn)(this, I, "f").appendChild(d));
                    const o = document.createElement("div");
                    ((o.className = "subtitle"),
                      (o.textContent = "Cover Image 512x256"),
                      (0, a.gn)(this, I, "f").appendChild(o));
                    let l = null;
                    const c = document.createElement("input");
                    ((c.type = "file"),
                      (c.accept = "image/*"),
                      c.addEventListener("change", () => {
                        const t = c.files?.[0];
                        if (null != t) {
                          const e = document.createElement("canvas");
                          ((e.width = 512), (e.height = 256));
                          const n = URL.createObjectURL(t),
                            a = new Image();
                          (a.addEventListener("load", () => {
                            try {
                              const t = e.getContext("2d");
                              if (null == t)
                                throw new Error("Failed to get canvas context");
                              (t.drawImage(a, 0, 0, e.width, e.height),
                                (s.src = e.toDataURL("image/png")),
                                (l = e));
                            } finally {
                              URL.revokeObjectURL(n);
                            }
                          }),
                            a.addEventListener("error", () => {
                              (URL.revokeObjectURL(n),
                                (s.src = ""),
                                (l = null));
                            }),
                            (a.src = n));
                        } else ((s.src = ""), (l = null));
                      }),
                      (0, a.gn)(this, I, "f").appendChild(c));
                    const s = document.createElement("img");
                    ((s.className = "cover-preview"),
                      (0, a.gn)(this, I, "f").appendChild(s));
                    const m = document.createElement("div");
                    ((m.className = "subtitle"),
                      (m.textContent = "Track Code"),
                      (0, a.gn)(this, I, "f").appendChild(m));
                    const u = document.createElement("input");
                    ((u.type = "text"),
                      (u.placeholder = "Track Code"),
                      (0, a.gn)(this, I, "f").appendChild(u));
                    let f = null;
                    const k = document.createElement("button");
                    ((k.className = "button"),
                      (k.textContent = "OK"),
                      k.addEventListener("click", () => {
                        e.playUIClick();
                        const t = u.value.trim();
                        if (((f = S.A.fromExportString(t)), null == f))
                          return (
                            alert("Invalid track code"),
                            (C.textContent = ""),
                            (b.src = ""),
                            void (g.disabled = !0)
                          );
                        C.textContent = f.trackMetadata.name;
                        const n = f.trackData.createThumbnail();
                        ((b.src = n.toDataURL("image/png")), (g.disabled = !1));
                      }),
                      (0, a.gn)(this, I, "f").appendChild(k));
                    const C = document.createElement("div");
                    ((C.className = "track-name"),
                      (0, a.gn)(this, I, "f").appendChild(C));
                    const b = document.createElement("img");
                    ((b.className = "thumbnail-preview"),
                      (0, a.gn)(this, I, "f").appendChild(b));
                    const x = document.createElement("div");
                    ((x.className = "button-container"),
                      (0, a.gn)(this, I, "f").appendChild(x));
                    const g = document.createElement("button");
                    ((g.className = "button"),
                      (g.textContent = "Save"),
                      (g.disabled = !0),
                      g.addEventListener("click", () => {
                        if ((e.playUIClick(), null != f)) {
                          ((c.disabled = !0),
                            (u.disabled = !0),
                            (k.disabled = !0),
                            (w.disabled = !0),
                            (g.disabled = !0));
                          const d = f.trackData,
                            o = f.trackMetadata;
                          (async () => {
                            const s = new Uint8Array(
                              await (
                                await new Promise((t, e) => {
                                  d.createThumbnail().toBlob((n) => {
                                    null == n
                                      ? e(
                                          new Error(
                                            "Failed to create thumbnail",
                                          ),
                                        )
                                      : t(n);
                                  }, "image/png");
                                })
                              ).arrayBuffer(),
                            );
                            let m;
                            if (null != l) {
                              const t = l;
                              m = new Uint8Array(
                                await (
                                  await new Promise((e, n) => {
                                    t.toBlob((t) => {
                                      null == t
                                        ? n(new Error("Failed to create cover"))
                                        : e(t);
                                    }, "image/png");
                                  })
                                ).arrayBuffer(),
                              );
                            } else m = null;
                            n.setAdminTrackOfTheWeek(
                              i,
                              r,
                              d.getId(),
                              o.name,
                              o.author,
                              o.lastModified,
                              d.environment,
                              s,
                              m,
                              d.toExportString(o),
                            )
                              .then(() => {
                                ((0, a.gn)(this, I, "f").classList.add(
                                  "hidden",
                                ),
                                  (0, a.gn)(this, y, "f").classList.remove(
                                    "hidden",
                                  ),
                                  ((0, a.gn)(this, I, "f").innerHTML = ""),
                                  (0, a.gn)(this, v, "m", t).call(
                                    this,
                                    e,
                                    n,
                                    i,
                                  ));
                              })
                              .catch((t) => {
                                (alert("Failed to save track of the week"),
                                  console.error(t),
                                  (c.disabled = !1),
                                  (u.disabled = !1),
                                  (k.disabled = !1),
                                  (w.disabled = !1),
                                  (g.disabled = !1));
                              });
                          })();
                        }
                      }),
                      x.appendChild(g));
                    const w = document.createElement("button");
                    ((w.className = "button"),
                      (w.textContent = "Cancel"),
                      w.addEventListener("click", () => {
                        (e.playUIClick(),
                          (0, a.gn)(this, I, "f").classList.add("hidden"),
                          (0, a.gn)(this, y, "f").classList.remove("hidden"),
                          ((0, a.gn)(this, I, "f").innerHTML = ""));
                      }),
                      x.appendChild(w));
                  }),
                  b.appendChild(x),
                  u.appendChild(b));
              }
            })
            .catch((t) => {
              (console.error(t), (0, a.GG)(this, L, !1, "f"));
            }),
            (0, a.GG)(this, L, !0, "f"));
        }));
      const W = class {
        constructor(t, e, n, i, d, o, l) {
          (v.add(this),
            x.set(this, void 0),
            g.set(this, void 0),
            w.set(this, void 0),
            E.set(this, void 0),
            y.set(this, void 0),
            L.set(this, !1),
            I.set(this, void 0),
            N.set(this, void 0));
          const c = document.getElementById("ui");
          if (null == c) throw new Error("UI element not found");
          ((0, a.GG)(this, x, c, "f"),
            (0, a.GG)(this, g, document.createElement("div"), "f"),
            ((0, a.gn)(this, g, "f").className = "admin-ui"),
            (0, a.gn)(this, x, "f").appendChild((0, a.gn)(this, g, "f")));
          const r = document.createElement("button");
          ((r.className = "button"),
            (r.textContent = "Quit"),
            r.addEventListener("click", () => {
              (t.playUIClick(), l());
            }),
            (0, a.gn)(this, g, "f").appendChild(r));
          const s = document.createElement("button");
          ((s.className = "button"),
            (s.textContent = "Leaderboard"),
            s.addEventListener("click", () => {
              (t.playUIClick(),
                (0, a.gn)(this, w, "f").classList.remove("hidden"),
                (0, a.gn)(this, E, "f").classList.add("hidden"));
            }),
            (0, a.gn)(this, g, "f").appendChild(s));
          const m = document.createElement("button");
          ((m.className = "button"),
            (m.textContent = "Track of the Week"),
            m.addEventListener("click", () => {
              (t.playUIClick(),
                (0, a.gn)(this, w, "f").classList.add("hidden"),
                (0, a.gn)(this, E, "f").classList.remove("hidden"),
                (0, a.gn)(this, L, "f") ||
                  (0, a.gn)(this, v, "m", M).call(this, t, d, o));
            }),
            (0, a.gn)(this, g, "f").appendChild(m),
            (0, a.GG)(
              this,
              w,
              (0, a.gn)(this, v, "m", T).call(this, t, e, n, i, d, o),
              "f",
            ));
          const p = (0, a.gn)(this, v, "m", U).call(this);
          ((0, a.GG)(this, E, p.div, "f"),
            (0, a.GG)(this, y, p.table, "f"),
            (0, a.GG)(this, I, p.editDiv, "f"),
            window.addEventListener(
              "keydown",
              (0, a.GG)(
                this,
                N,
                (t) => {
                  "Escape" == t.code && (l(), t.preventDefault());
                },
                "f",
              ),
            ));
        }
        dispose() {
          ((0, a.gn)(this, x, "f").removeChild((0, a.gn)(this, g, "f")),
            window.removeEventListener("keydown", (0, a.gn)(this, N, "f")));
        }
      };
      var A, Y, O;
      ((A = new WeakMap()), (Y = new WeakMap()), (O = new WeakMap()));
      const z = class {
        constructor(t, e, n, i, d, o, l, c) {
          (A.set(this, void 0),
            Y.set(this, void 0),
            O.set(this, void 0),
            (0, a.GG)(this, A, t, "f"),
            (0, a.GG)(this, Y, e, "f"),
            (0, a.GG)(this, O, new W(t, n, i, d, o, l, c), "f"));
        }
        dispose() {
          (0, a.gn)(this, O, "f").dispose();
        }
        update(t) {
          (0, a.gn)(this, A, "f").update(t, !1, (0, a.gn)(this, Y, "f"));
        }
      };
    },
    5768: (t, e, n) => {
      n.d(e, { A: () => l });
      var a = n(1601),
        i = n.n(a),
        d = n(6314),
        o = n.n(d)()(i());
      o.push([
        t.id,
        '.admin-ui {\n\tposition: absolute;\n\tleft: 0;\n\ttop: 0;\n\tz-index: 2;\n\tmargin: 0;\n\tpadding: 16px;\n\twidth: 100%;\n\theight: 100%;\n\toverflow-y: scroll;\n\tbox-sizing: border-box;\n\tbackground-color: var(--surface-color);\n\tpointer-events: auto;\n}\n\n.admin-ui table {\n\ttable-layout: fixed;\n\tborder-collapse: collapse;\n\tcolor: var(--text-color);\n\tfont-size: 26px;\n\twidth: 100%;\n}\n.admin-ui table > tr > th {\n\tborder-bottom: 2px solid var(--text-color);\n\ttext-align: left;\n}\n\n.admin-ui table > tr:nth-of-type(2n + 1) > td {\n\tbackground-color: var(--surface-secondary-color);\n}\n\n.admin-ui table > tr > td {\n\theight: 60px;\n}\n\n.admin-ui > .leaderboard-moderation.hidden, .admin-ui > .track-of-the-week.hidden {\n\tdisplay: none;\n}\n\n.admin-ui > .leaderboard-moderation > .tracks-list {\n\tdisplay: flex;\n\tflex-wrap: wrap;\n}\n\n.admin-ui > .leaderboard-moderation > .tracks-list > .title {\n\tmargin: 10px;\n\twidth: 100%;\n\tfont-size: 28px;\n\tborder-bottom: 1px solid var(--text-color);\n\tcolor: var(--text-color);\n}\n\n.admin-ui > .leaderboard-moderation > .tracks-list > .subtitle {\n\tmargin: 10px 10px 0 10px;\n\twidth: 100%;\n\tfont-size: 28px;\n\tcolor: var(--text-color);\n}\n\n.admin-ui > .leaderboard-moderation > .tracks-list > button {\n\tmargin: 4px;\n\twidth: 300px;\n\toverflow: hidden;\n\ttext-overflow: ellipsis;\n\twhite-space: nowrap;\n}\n.admin-ui > .leaderboard-moderation > .tracks-list > button.selected {\n\tbackground-color: var(--button-hover-color);\n}\n\n.admin-ui > .leaderboard-moderation > .leaderboard-container {\n\tmargin: 10px 0;\n\twidth: 100%;\n}\n\n.admin-ui > .leaderboard-moderation > .leaderboard-container > table > tr > th:nth-of-type(1) {\n\twidth: 140px;\n}\n\n.admin-ui > .leaderboard-moderation > .leaderboard-container > table > tr > th:nth-of-type(3) {\n\twidth: 170px;\n}\n\n.admin-ui > .leaderboard-moderation > .leaderboard-container > table > tr > th:nth-of-type(4) {\n\twidth: 150px;\n}\n\n.admin-ui > .leaderboard-moderation > .leaderboard-container > table > tr > th:nth-of-type(5) {\n\twidth: 220px;\n}\n\n.admin-ui > .leaderboard-moderation > .leaderboard-container > table > tr > th:nth-of-type(6) {\n\twidth: 200px;\n}\n\n.admin-ui > .leaderboard-moderation > .leaderboard-container > table > tr > td {\n\toverflow: hidden;\n\ttext-overflow: ellipsis;\n\twhite-space: nowrap;\n}\n\n.admin-ui > .leaderboard-moderation > .leaderboard-container > .navigation {\n\tdisplay: flex;\n\tmargin: 8px 0;\n}\n.admin-ui > .leaderboard-moderation > .leaderboard-container > .navigation > input {\n\tflex-grow: 1;\n\ttext-align: center;\n}\n\n.admin-ui > .track-of-the-week > table {\n\tmargin: 20px 0;\n}\n.admin-ui > .track-of-the-week > table.hidden {\n\tdisplay: none;\n}\n\n.admin-ui > .track-of-the-week > table > tr > th:nth-of-type(1) {\n\twidth: 300px;\n}\n\n.admin-ui > .track-of-the-week > table > tr > th:nth-of-type(4) {\n\twidth: 100px;\n}\n\n.admin-ui > .track-of-the-week > .track-of-the-week-edit.hidden {\n\tdisplay: none;\n}\n\n.admin-ui > .track-of-the-week > .track-of-the-week-edit > .title {\n\tmargin: 10px 10px 0 10px;\n\twidth: 100%;\n\tfont-size: 32px;\n\tcolor: var(--text-color);\n}\n\n.admin-ui > .track-of-the-week > .track-of-the-week-edit > .subtitle {\n\tmargin: 10px 10px 0 10px;\n\twidth: 100%;\n\tborder-bottom: 1px solid var(--text-color);\n\tfont-size: 20px;\n\tcolor: var(--text-color);\n}\n\n.admin-ui > .track-of-the-week > .track-of-the-week-edit > input[type="file"] {\n\tmargin: 10px;\n\twidth: 512px;\n\theight: 32px;\n\tfont-size: 20px;\n\tcolor: var(--text-color);\n}\n\n.admin-ui > .track-of-the-week > .track-of-the-week-edit > .cover-preview {\n\tdisplay: block;\n\tmargin: 10px;\n\twidth: 512px;\n\theight: 256px;\n\tbackground-color: var(--surface-secondary-color);\n}\n\n.admin-ui > .track-of-the-week > .track-of-the-week-edit > input[type="text"] {\n\tmargin: 20px 0 10px 10px;\n}\n\n.admin-ui > .track-of-the-week > .track-of-the-week-edit > .track-name {\n\tmargin: 10px 10px 0 10px;\n\twidth: 100%;\n\tfont-size: 28px;\n\tcolor: var(--text-color);\n}\n\n.admin-ui > .track-of-the-week > .track-of-the-week-edit > .thumbnail-preview {\n\tdisplay: block;\n\tmargin: 10px;\n\tpadding: 40px;\n\tbox-sizing: border-box;\n\twidth: 256px;\n\theight: 256px;\n\tobject-fit: contain;\n\timage-rendering: pixelated;\n\tbackground-color: var(--surface-secondary-color);\n}\n\n.admin-ui > .track-of-the-week > .track-of-the-week-edit > .button-container {\n\tdisplay: flex;\n\tmargin: 10px 10px 50px 10px;\n}\n',
        "",
      ]);
      const l = o;
    },
  },
]);
