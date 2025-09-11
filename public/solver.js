/*##########################################*/
/*####                                  ####*/
/*####      Copyright (c)               ####*/
/*####      Ruwix.com                   ####*/
/*####      All rights reserved         ####*/
/*####                                  ####*/
/*##########################################*/
"use strict";
!function() {
    function t(t) {
        return Math.floor(Math.random() * t)
    }
    function r() {
        if (S) {
            var t = (new Date).getTime()
              , r = t - S;
            return S = t,
            r
        }
        return S = (new Date).getTime(),
        0
    }
    function o(t) {
        postMessage({
            type: "progress",
            line: t,
            time: r()
        })
    }
    function i(t) {
        if ("generateTables" == t.data.type)
            A(),
            postMessage({
                type: "CoordCube"
            });
        else if ("verify" == t.data.type)
            postMessage({
                type: "verify",
                result: a(t.data.cube),
                cube: t.data.cube
            });
        else if ("random" == t.data.type) {
            var r = s();
            postMessage({
                type: "random",
                result: r
            })
        } else if ("generateTable" == t.data.type)
            x(t.data.table, t.data);
        else if ("CoordCube" == t.data.type)
            for (var o in t.data.cc)
                0 == o.indexOf("Slice") ? u[o] = new Int8Array(t.data.cc[o]) : u[o] = t.data.cc[o];
        else if ("solve" == t.data.type) {
            var i = rt.solution(t.data.cube, t.data.maxDepth || 20, t.data.maxTime || 10, !!t.data.useSeparator);
            -1 == i.indexOf("Error") && (i = i.substring(0, i.length - 1)),
            postMessage({
                type: "solution",
                result: i,
                cube: t.data.cube
            })
        }
    }
    function e(t, r) {
        Object.defineProperty(this, "number", {
            value: t,
            enumerable: !0
        }),
        Object.defineProperty(this, "string", {
            value: r,
            enumerable: !0
        })
    }
    function n(t) {
        for (var r = {}, o = 0; o < t.length; o++) {
            var i = new e(o,t[o]);
            r[t[o]] = i,
            self[t[o]] = i
        }
        return Object.defineProperty(r, "valueOf", {
            value: function(t) {
                return this[t]
            },
            writable: !1,
            configurable: !1,
            enumerable: !1
        }),
        r
    }
    function a(t) {
        var r = new Int32Array(6);
        try {
            for (var o = 0; 54 > o; o++)
                r[C[t.charAt(o)].ordinal()]++
        } catch (i) {
            return -1
        }
        for (var o = 0; 6 > o; o++)
            if (9 != r[o])
                return -1;
        var e = new h(t)
          , n = e.toCubieCube();
        return n.verify()
    }
    function s() {
        var r = new l;
        r.setFlip(t(W)),
        r.setTwist(t(V));
        do
            r.setURFtoDLB(t(X)),
            r.setURtoBR(t(Z));
        while (0 != (r.edgeParity() ^ r.cornerParity()));
        var o = r.toFaceCube();
        return o.toString()
    }
    function h(t) {
        this.f = [],
        t || (t = "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB");
        for (var r = 0; 54 > r; r++)
            this.f[r] = C[t.charAt(r)]
    }
    function f(t, r) {
        var o, i, e;
        if (r > t)
            return 0;
        for (r > t / 2 | 0 && (r = t - r),
        e = 1,
        o = t,
        i = 1; o != t - r; o--,
        i++)
            e *= o,
            e /= i,
            e = 0 | e;
        return e
    }
    function l(t, r, o, i) {
        t && r && o && i ? (this.cp = t,
        this.co = new Int8Array(r),
        this.ep = o,
        this.eo = new Int8Array(i)) : (this.cp = [URF, UFL, ULB, UBR, DFR, DLF, DBL, DRB],
        this.co = new Int8Array([0, 0, 0, 0, 0, 0, 0, 0]),
        this.ep = [UR, UF, UL, UB, DR, DF, DL, DB, FR, FL, BL, BR],
        this.eo = new Int8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]))
    }
    function u(t) {
        this.twist = t.getTwist(),
        this.flip = t.getFlip(),
        this.parity = t.cornerParity(),
        this.FRtoBR = t.getFRtoBR(),
        this.URFtoDLF = t.getURFtoDLF(),
        this.URtoUL = t.getURtoUL(),
        this.UBtoDF = t.getUBtoDF(),
        this.URtoDF = t.getURtoDF(),
        this.move = function(t) {
            this.twist = u.twistMove[this.twist][t],
            this.flip = u.flipMove[this.flip][t],
            this.parity = u.parityMove[this.parity][t],
            this.FRtoBR = u.FRtoBR_Move[this.FRtoBR][t],
            this.URFtoDLF = u.URFtoDLF_Move[this.URFtoDLF][t],
            this.URtoUL = u.URtoUL_Move[this.URtoUL][t],
            this.UBtoDF = u.UBtoDF_Move[this.UBtoDF][t],
            this.URtoUL < 336 && this.UBtoDF < 336 && (this.URtoDF = u.MergeURtoULandUBtoDF[this.URtoUL][this.UBtoDF])
        }
    }
    function v(t, r, o) {
        for (var i = [], e = 0; t > e; e++)
            r ? i[e] = new r(o) : i.push([]);
        return i
    }
    function p() {
        for (var t = v(V), r = new l, o = 0; V > o; o++) {
            r.setTwist(o);
            for (var i = 0; 6 > i; i++) {
                for (var e = 0; 3 > e; e++)
                    r.cornerMultiply(l.moveCube[i]),
                    t[o][3 * i + e] = r.getTwist();
                r.cornerMultiply(l.moveCube[i])
            }
        }
        return t
    }
    function d() {
        for (var t = v(W), r = new l, o = 0; W > o; o++) {
            r.setFlip(o);
            for (var i = 0; 6 > i; i++) {
                for (var e = 0; 3 > e; e++)
                    r.edgeMultiply(l.moveCube[i]),
                    t[o][3 * i + e] = r.getFlip();
                r.edgeMultiply(l.moveCube[i])
            }
        }
        return t
    }
    function c() {
        for (var t = v(H, Int16Array, $), r = new l, o = 0; H > o; o++) {
            r.setFRtoBR(o);
            for (var i = 0; 6 > i; i++) {
                for (var e = 0; 3 > e; e++)
                    r.edgeMultiply(l.moveCube[i]),
                    t[o][3 * i + e] = r.getFRtoBR();
                r.edgeMultiply(l.moveCube[i])
            }
        }
        return t
    }
    function y() {
        for (var t = v(G, Int16Array, $), r = new l, o = 0; G > o; o++) {
            r.setURFtoDLF(o);
            for (var i = 0; 6 > i; i++) {
                for (var e = 0; 3 > e; e++)
                    r.cornerMultiply(l.moveCube[i]),
                    t[o][3 * i + e] = r.getURFtoDLF();
                r.cornerMultiply(l.moveCube[i])
            }
        }
        return t
    }
    function g() {
        for (var t = v(Q, Int16Array, $), r = new l, o = 0; Q > o; o++) {
            r.setURtoDF(o);
            for (var i = 0; 6 > i; i++) {
                for (var e = 0; 3 > e; e++)
                    r.edgeMultiply(l.moveCube[i]),
                    t[o][3 * i + e] = r.getURtoDF();
                r.edgeMultiply(l.moveCube[i])
            }
        }
        return t
    }
    function w() {
        for (var t = v(J, Int16Array, $), r = new l, o = 0; J > o; o++) {
            r.setURtoUL(o);
            for (var i = 0; 6 > i; i++) {
                for (var e = 0; 3 > e; e++)
                    r.edgeMultiply(l.moveCube[i]),
                    t[o][3 * i + e] = r.getURtoUL();
                r.edgeMultiply(l.moveCube[i])
            }
        }
        return t
    }
    function _() {
        for (var t = v(K, Int16Array, $), r = new l, o = 0; K > o; o++) {
            r.setUBtoDF(o);
            for (var i = 0; 6 > i; i++) {
                for (var e = 0; 3 > e; e++)
                    r.edgeMultiply(l.moveCube[i]),
                    t[o][3 * i + e] = r.getUBtoDF();
                r.edgeMultiply(l.moveCube[i])
            }
        }
        return t
    }
    function M() {
        for (var t = v(336, Int16Array, 336), r = 0; 336 > r; r++)
            for (var o = 0; 336 > o; o++)
                t[r][o] = l.getURtoDF(r, o);
        return t
    }
    function P(t, r) {
        for (var o = new Int8Array(q * G * z / 2 | 0), i = 0; q * G * z / 2 > i | 0; i++)
            o[i] = -1;
        var e = 0;
        u.setPruning(o, 0, 0);
        for (var n = 1; n != q * G * z; ) {
            for (var i = 0; q * G * z > i; i++) {
                var a = i % 2
                  , s = (i / 2 | 0) / q | 0
                  , R = (i / 2 | 0) % q;
                if (u.getPruning(o, i) == e)
                    for (var h = 0; 18 > h; h++)
                        switch (h) {
                        case 3:
                        case 5:
                        case 6:
                        case 8:
                        case 12:
                        case 14:
                        case 15:
                        case 17:
                            continue;
                        default:
                            var f = t[R][h]
                              , F = r[s][h]
                              , U = u.parityMove[a][h];
                            15 == u.getPruning(o, 2 * (q * F + f) + U) && (u.setPruning(o, 2 * (q * F + f) + U, e + 1),
                            n++)
                        }
            }
            e++
        }
        return o
    }
    function b(t, r) {
        for (var o = new Int8Array(q * Q * z / 2 | 0), i = 0; q * Q * z / 2 > i | 0; i++)
            o[i] = -1;
        var e = 0;
        u.setPruning(o, 0, 0);
        for (var n = 1; n != q * Q * z; ) {
            for (var i = 0; q * Q * z > i; i++) {
                var a = i % 2
                  , s = (i / 2 | 0) / q | 0
                  , R = (i / 2 | 0) % q;
                if (u.getPruning(o, i) == e)
                    for (var h = 0; 18 > h; h++)
                        switch (h) {
                        case 3:
                        case 5:
                        case 6:
                        case 8:
                        case 12:
                        case 14:
                        case 15:
                        case 17:
                            continue;
                        default:
                            var f = t[R][h]
                              , F = r[s][h]
                              , U = u.parityMove[a][h];
                            15 == u.getPruning(o, 2 * (q * F + f) + U) && (u.setPruning(o, 2 * (q * F + f) + U, e + 1),
                            n++)
                        }
            }
            e++
        }
        return o
    }
    function m(t, r) {
        for (var o = new Int8Array(Y * V / 2 + 1 | 0), i = 0; Y * V / 2 + 1 > i | 0; i++)
            o[i] = -1;
        var e = 0;
        u.setPruning(o, 0, 0);
        for (var n = 1; n != Y * V; ) {
            for (var i = 0; Y * V > i; i++) {
                var a = i / Y | 0
                  , s = i % Y;
                if (u.getPruning(o, i) == e)
                    for (var R = 0; 18 > R; R++) {
                        var h = t[24 * s][R] / 24 | 0
                          , f = r[a][R];
                        15 == u.getPruning(o, Y * f + h) && (u.setPruning(o, Y * f + h, e + 1),
                        n++)
                    }
            }
            e++
        }
        return o
    }
    function I(t, r) {
        for (var o = new Int8Array(Y * W / 2 | 0), i = 0; Y * W / 2 > i | 0; i++)
            o[i] = -1;
        var e = 0;
        u.setPruning(o, 0, 0);
        for (var n = 1; n != Y * W; ) {
            for (var i = 0; Y * W > i; i++) {
                var a = i / Y | 0
                  , s = i % Y;
                if (u.getPruning(o, i) == e)
                    for (var R = 0; 18 > R; R++) {
                        var h = t[24 * s][R] / 24 | 0
                          , f = r[a][R];
                        15 == u.getPruning(o, Y * f + h) && (u.setPruning(o, Y * f + h, e + 1),
                        n++)
                    }
            }
            e++
        }
        return o
    }
    function x(t, r) {
        switch (t) {
        case "twistMove":
            postMessage({
                type: "",
                table: ""
            })
        }
        tt.push(t)
    }
    function A() {
        r(),
        u.twistMove = p(),
        o("twistMove"),
        u.flipMove = d(),
        o("flipMove"),
        u.FRtoBR_Move = c(),
        o("FRtoBR_Move"),
        u.URFtoDLF_Move = y(),
        o("URFtoDLF_Move"),
        u.URtoDF_Move = g(),
        o("URtoDF_Move"),
        u.URtoUL_Move = w(),
        o("URtoUL_Move"),
        u.UBtoDF_Move = _(),
        o("UBtoDF_Move"),
        u.MergeURtoULandUBtoDF = M(),
        o("MergeURtoULandUBtoDF"),
        u.Slice_URFtoDLF_Parity_Prun = P(u.FRtoBR_Move, u.URFtoDLF_Move),
        o("Slice_URFtoDLF_Parity_Prun"),
        u.Slice_URtoDF_Parity_Prun = b(u.FRtoBR_Move, u.URtoDF_Move),
        o("Slice_URtoDF_Parity_Prun"),
        u.Slice_Twist_Prun = m(u.FRtoBR_Move, u.twistMove),
        o("Slice_Twist_Prun"),
        u.Slice_Flip_Prun = I(u.FRtoBR_Move, u.flipMove),
        o("Slice_Flip_Prun")
    }
    var S;
    addEventListener("message", i, !1),
    e.prototype.toString = function() {
        return this.string
    }
    ,
    e.prototype.ordinal = function() {
        return this.number
    }
    ,
    Number.prototype.ordinal = function() {
        return this + 0
    }
    ;
    var C = n(["U", "R", "F", "D", "L", "B"])
      , T = (n(["U1", "U2", "U3", "U4", "U5", "U6", "U7", "U8", "U9", "R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8", "R9", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "L1", "L2", "L3", "L4", "L5", "L6", "L7", "L8", "L9", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9"]),
    n(["URF", "UFL", "ULB", "UBR", "DFR", "DLF", "DBL", "DRB"]))
      , N = n(["UR", "UF", "UL", "UB", "DR", "DF", "DL", "DB", "FR", "FL", "BL", "BR"])
      , E = [[U9, R1, F3], [U7, F1, L3], [U1, L1, B3], [U3, B1, R3], [D3, F9, R7], [D1, L9, F7], [D7, B9, L7], [D9, R9, B7]]
      , k = [[U6, R2], [U8, F2], [U4, L2], [U2, B2], [D6, R8], [D2, F8], [D4, L8], [D8, B8], [F6, R4], [F4, L6], [B6, L4], [B4, R6]]
      , O = [[U, R, F], [U, F, L], [U, L, B], [U, B, R], [D, F, R], [D, L, F], [D, B, L], [D, R, B]]
      , j = [[U, R], [U, F], [U, L], [U, B], [D, R], [D, F], [D, L], [D, B], [F, R], [F, L], [B, L], [B, R]];
    h.prototype.toString = function() {
        for (var t = "", r = 0; 54 > r; r++)
            t += this.f[r].toString();
        return t
    }
    ,
    h.prototype.toCubieCube = function() {
        for (var t, r = new l, o = 0; 8 > o; o++)
            r.cp[o] = URF;
        for (var o = 0; 12 > o; o++)
            r.ep[o] = UR;
        var i, e;
        for (var o in T) {
            for (o = T[o],
            t = 0; 3 > t && (this.f[E[o.ordinal()][t].ordinal()] != U && this.f[E[o.ordinal()][t].ordinal()] != D); t++)
                ;
            i = this.f[E[o.ordinal()][(t + 1) % 3].ordinal()],
            e = this.f[E[o.ordinal()][(t + 2) % 3].ordinal()];
            for (var n in T)
                if (n = T[n],
                i == O[n.ordinal()][1] && e == O[n.ordinal()][2]) {
                    r.cp[o.ordinal()] = n,
                    r.co[o.ordinal()] = t % 3;
                    break
                }
        }
        for (var o in N) {
            o = N[o];
            for (var n in N) {
                if (n = N[n],
                this.f[k[o.ordinal()][0].ordinal()].toString() == j[n.ordinal()][0].toString() && this.f[k[o.ordinal()][1].ordinal()].toString() == j[n.ordinal()][1].toString()) {
                    r.ep[o.ordinal()] = n,
                    r.eo[o.ordinal()] = 0;
                    break
                }
                if (this.f[k[o.ordinal()][0].ordinal()].toString() == j[n.ordinal()][1].toString() && this.f[k[o.ordinal()][1].ordinal()].toString() == j[n.ordinal()][0].toString()) {
                    r.ep[o.ordinal()] = n,
                    r.eo[o.ordinal()] = 1;
                    break
                }
            }
        }
        return r
    }
    ,
    l.prototype.rotateLeft = function(t, r, o) {
        for (var i = t[r], e = r; o > e; e++)
            t[e] = t[e + 1];
        t[o] = i
    }
    ,
    l.prototype.rotateRight = function(t, r, o) {
        for (var i = t[o], e = o; e > r; e--)
            t[e] = t[e - 1];
        t[r] = i
    }
    ,
    l.prototype.toFaceCube = function() {
        var t = new h;
        for (var r in T) {
            r = T[r];
            for (var o = r.ordinal(), i = this.cp[o].ordinal(), e = this.co[o], n = 0; 3 > n; n++)
                t.f[E[o][(n + e) % 3].ordinal()] = O[i][n]
        }
        for (var a in N) {
            a = N[a];
            for (var o = a.ordinal(), i = this.ep[o].ordinal(), e = this.eo[o], n = 0; 2 > n; n++)
                t.f[k[o][(n + e) % 2].ordinal()] = j[i][n]
        }
        return t
    }
    ,
    l.prototype.cornerMultiply = function(t) {
        var r = []
          , o = new Int8Array(8);
        for (var i in T) {
            i = T[i],
            r[i.ordinal()] = this.cp[t.cp[i.ordinal()].ordinal()];
            var e = this.co[t.cp[i.ordinal()].ordinal()]
              , n = t.co[i.ordinal()].ordinal()
              , a = 0;
            3 > e && 3 > n ? (a = e + n,
            a >= 3 && (a -= 3)) : 3 > e && n >= 3 ? (a = e + n,
            a >= 6 && (a -= 3)) : e >= 3 && 3 > n ? (a = e - n,
            3 > a && (a += 3)) : e >= 3 && n >= 3 && (a = e - n,
            0 > a && (a += 3)),
            o[i.ordinal()] = a
        }
        for (var s in T)
            s = T[s],
            this.cp[s.ordinal()] = r[s.ordinal()],
            this.co[s.ordinal()] = o[s.ordinal()]
    }
    ,
    l.prototype.multiply = function(t) {
        this.cornerMultiply(t)
    }
    ,
    l.prototype.edgeMultiply = function(t) {
        var r = []
          , o = new Int8Array(12);
        for (var i in N)
            i = N[i],
            r[i.ordinal()] = this.ep[t.ep[i.ordinal()].ordinal()],
            o[i.ordinal()] = (t.eo[i.ordinal()] + this.eo[t.ep[i.ordinal()].ordinal()]) % 2;
        for (var e in N)
            e = N[e],
            this.ep[e.ordinal()] = r[e.ordinal()],
            this.eo[e.ordinal()] = o[e.ordinal()]
    }
    ,
    l.prototype.invCubieCube = function(t) {
        for (var r in N)
            r = N[r],
            t.ep[this.ep[r.ordinal()].ordinal()] = r;
        for (var r in N)
            r = N[r],
            t.eo[r.ordinal()] = this.eo[t.ep[r.ordinal()].ordinal()];
        for (var o in T)
            o = T[o],
            t.cp[this.cp[o.ordinal()].ordinal()] = o;
        for (var o in T) {
            o = T[o];
            var i = this.co[t.cp[o.ordinal()].ordinal()];
            i >= 3 ? t.co[o.ordinal()] = i : (t.co[o.ordinal()] = -i,
            t.co[o.ordinal()] < 0 && (t.co[o.ordinal()] += 3))
        }
    }
    ,
    l.prototype.getTwist = function() {
        for (var t = 0, r = URF.ordinal(); r < DRB.ordinal(); r++)
            t = 3 * t + this.co[r];
        return t
    }
    ,
    l.prototype.setTwist = function(t) {
        for (var r = 0, o = DRB.ordinal() - 1; o >= URF.ordinal(); o--)
            r += this.co[o] = t % 3,
            t /= 3,
            t = 0 | t;
        this.co[DRB.ordinal()] = (3 - r % 3) % 3
    }
    ,
    l.prototype.getFlip = function() {
        for (var t = 0, r = UR.ordinal(); r < BR.ordinal(); r++)
            t = 2 * t + this.eo[r];
        return t
    }
    ,
    l.prototype.setFlip = function(t) {
        for (var r = 0, o = BR.ordinal() - 1; o >= UR.ordinal(); o--)
            r += this.eo[o] = t % 2,
            t /= 2,
            t = 0 | t;
        this.eo[BR.ordinal()] = (2 - r % 2) % 2
    }
    ,
    l.prototype.cornerParity = function() {
        for (var t = 0, r = DRB.ordinal(); r >= URF.ordinal() + 1; r--)
            for (var o = r - 1; o >= URF.ordinal(); o--)
                this.cp[o].ordinal() > this.cp[r].ordinal() && t++;
        return t % 2
    }
    ,
    l.prototype.edgeParity = function() {
        for (var t = 0, r = BR.ordinal(); r >= UR.ordinal() + 1; r--)
            for (var o = r - 1; o >= UR.ordinal(); o--)
                this.ep[o].ordinal() > this.ep[r].ordinal() && t++;
        return t % 2
    }
    ,
    l.prototype.getFRtoBR = function() {
        for (var t = 0, r = 0, o = [], i = BR.ordinal(); i >= UR.ordinal(); i--)
            FR.ordinal() <= this.ep[i].ordinal() && this.ep[i].ordinal() <= BR.ordinal() && (t += f(11 - i, r + 1),
            o[3 - r++] = this.ep[i]);
        for (var e = 0, i = 3; i > 0; i--) {
            for (var n = 0; o[i].ordinal() != i + 8; )
                this.rotateLeft(o, 0, i),
                n++;
            e = (i + 1) * e + n
        }
        return 24 * t + e
    }
    ,
    l.prototype.setFRtoBR = function(t) {
        var r, o = [FR, FL, BL, BR], i = [UR, UF, UL, UB, DR, DF, DL, DB], e = t % 24, n = t / 24 | 0;
        for (var a in N)
            a = N[a],
            this.ep[a.ordinal()] = DB;
        for (var s, R = 1; 4 > R; R++)
            for (s = e % (R + 1),
            e /= R + 1,
            e = 0 | e; s-- > 0; )
                this.rotateRight(o, 0, R);
        r = 3;
        for (var R = UR.ordinal(); R <= BR.ordinal(); R++)
            n - f(11 - R, r + 1) >= 0 && (this.ep[R] = o[3 - r],
            n -= f(11 - R, r-- + 1));
        r = 0;
        for (var R = UR.ordinal(); R <= BR.ordinal(); R++)
            this.ep[R] == DB && (this.ep[R] = i[r++])
    }
    ,
    l.prototype.getURFtoDLF = function() {
        for (var t = 0, r = 0, o = [], i = URF.ordinal(); i <= DRB.ordinal(); i++)
            this.cp[i].ordinal() <= DLF.ordinal() && (t += f(i, r + 1),
            o[r++] = this.cp[i]);
        for (var e = 0, i = 5; i > 0; i--) {
            for (var n = 0; o[i].ordinal() != i; )
                this.rotateLeft(o, 0, i),
                n++;
            e = (i + 1) * e + n
        }
        return 720 * t + e
    }
    ,
    l.prototype.setURFtoDLF = function(t) {
        var r, o = [URF, UFL, ULB, UBR, DFR, DLF], i = [DBL, DRB], e = t % 720, n = t / 720 | 0;
        for (var a in T)
            a = T[a],
            this.cp[a.ordinal()] = DRB;
        for (var s, R = 1; 6 > R; R++)
            for (s = e % (R + 1),
            e /= R + 1,
            e = 0 | e; s-- > 0; )
                this.rotateRight(o, 0, R);
        r = 5;
        for (var R = DRB.ordinal(); R >= 0; R--)
            n - f(R, r + 1) >= 0 && (this.cp[R] = o[r],
            n -= f(R, r-- + 1));
        r = 0;
        for (var R = URF.ordinal(); R <= DRB.ordinal(); R++)
            this.cp[R] == DRB && (this.cp[R] = i[r++])
    }
    ,
    l.prototype.getURtoDF = function() {
        for (var t = 0, r = 0, o = [], i = UR.ordinal(); i <= BR.ordinal(); i++)
            this.ep[i].ordinal() <= DF.ordinal() && (t += f(i, r + 1),
            o[r++] = this.ep[i]);
        for (var e = 0, i = 5; i > 0; i--) {
            for (var n = 0; o[i].ordinal() != i; )
                this.rotateLeft(o, 0, i),
                n++;
            e = (i + 1) * e + n
        }
        return 720 * t + e
    }
    ,
    l.prototype.setURtoDF = function(t) {
        var r, o = [UR, UF, UL, UB, DR, DF], i = [DL, DB, FR, FL, BL, BR], e = t % 720, n = t / 720 | 0;
        for (var a in N)
            a = N[a],
            this.ep[a.ordinal()] = BR;
        for (var s, R = 1; 6 > R; R++)
            for (s = e % (R + 1),
            e /= R + 1,
            e = 0 | e; s-- > 0; )
                this.rotateRight(o, 0, R);
        r = 5;
        for (var R = BR.ordinal(); R >= 0; R--)
            n - f(R, r + 1) >= 0 && (this.ep[R] = o[r],
            n -= f(R, r-- + 1));
        r = 0;
        for (var R = UR.ordinal(); R <= BR.ordinal(); R++)
            this.ep[R] == BR && (this.ep[R] = i[r++])
    }
    ,
    l.prototype.getURtoUL = function() {
        for (var t = 0, r = 0, o = [], i = UR.ordinal(); i <= BR.ordinal(); i++)
            this.ep[i].ordinal() <= UL.ordinal() && (t += f(i, r + 1),
            o[r++] = this.ep[i]);
        for (var e = 0, i = 2; i > 0; i--) {
            for (var n = 0; o[i].ordinal() != i; )
                this.rotateLeft(o, 0, i),
                n++;
            e = (i + 1) * e + n
        }
        return 6 * t + e
    }
    ,
    l.prototype.setURtoUL = function(t) {
        var r, o = [UR, UF, UL], i = t % 6, e = t / 6 | 0;
        for (var n in N)
            n = N[n],
            this.ep[n.ordinal()] = BR;
        for (var a, s = 1; 3 > s; s++)
            for (a = i % (s + 1),
            i /= s + 1,
            i = 0 | i; a-- > 0; )
                this.rotateRight(o, 0, s);
        r = 2;
        for (var s = BR.ordinal(); s >= 0; s--)
            e - f(s, r + 1) >= 0 && (this.ep[s] = o[r],
            e -= f(s, r-- + 1))
    }
    ,
    l.prototype.getUBtoDF = function() {
        for (var t = 0, r = 0, o = [], i = UR.ordinal(); i <= BR.ordinal(); i++)
            UB.ordinal() <= this.ep[i].ordinal() && this.ep[i].ordinal() <= DF.ordinal() && (t += f(i, r + 1),
            o[r++] = this.ep[i]);
        for (var e = 0, i = 2; i > 0; i--) {
            for (var n = 0; o[i].ordinal() != UB.ordinal() + i; )
                this.rotateLeft(o, 0, i),
                n++;
            e = (i + 1) * e + n
        }
        return 6 * t + e
    }
    ,
    l.prototype.setUBtoDF = function(t) {
        var r, o = [UB, DR, DF], i = t % 6, e = t / 6 | 0;
        for (var n in N)
            n = N[n],
            this.ep[n.ordinal()] = BR;
        for (var a, s = 1; 3 > s; s++)
            for (a = i % (s + 1),
            i /= s + 1,
            i = 0 | i; a-- > 0; )
                this.rotateRight(o, 0, s);
        r = 2;
        for (var s = BR.ordinal(); s >= 0; s--)
            e - f(s, r + 1) >= 0 && (this.ep[s] = o[r],
            e -= f(s, r-- + 1))
    }
    ,
    l.prototype.getURFtoDLB = function() {
        for (var t = [], r = 0, o = 0; 8 > o; o++)
            t[o] = this.cp[o];
        for (var i = 7; i > 0; i--) {
            for (var e = 0; t[i].ordinal() != i; )
                this.rotateLeft(t, 0, i),
                e++;
            r = (i + 1) * r + e
        }
        return r
    }
    ,
    l.prototype.setURFtoDLB = function(t) {
        for (var r, o = [URF, UFL, ULB, UBR, DFR, DLF, DBL, DRB], i = 1; 8 > i; i++)
            for (r = t % (i + 1),
            t /= i + 1,
            t = 0 | t; r-- > 0; )
                this.rotateRight(o, 0, i);
        for (var e = 7, i = 7; i >= 0; i--)
            this.cp[i] = o[e--]
    }
    ,
    l.prototype.getURtoBR = function() {
        for (var t = [], r = 0, o = 0; 12 > o; o++)
            t[o] = this.ep[o];
        for (var i = 11; i > 0; i--) {
            for (var e = 0; t[i].ordinal() != i; )
                this.rotateLeft(t, 0, i),
                e++;
            r = (i + 1) * r + e
        }
        return r
    }
    ,
    l.prototype.setURtoBR = function(t) {
        for (var r, o = [UR, UF, UL, UB, DR, DF, DL, DB, FR, FL, BL, BR], i = 1; 12 > i; i++)
            for (r = t % (i + 1),
            t /= i + 1,
            t = 0 | t; r-- > 0; )
                this.rotateRight(o, 0, i);
        for (var e = 11, i = 11; i >= 0; i--)
            this.ep[i] = o[e--]
    }
    ,
    l.prototype.verify = function() {
        var t = 0
          , r = new Int32Array(12);
        for (var o in N)
            o = N[o],
            r[this.ep[o.ordinal()].ordinal()]++;
        for (var i = 0; 12 > i; i++)
            if (1 != r[i])
                return -2;
        for (var i = 0; 12 > i; i++)
            t += this.eo[i];
        if (t % 2 != 0)
            return -3;
        var e = new Int32Array(8);
        for (var n in T)
            n = T[n],
            e[this.cp[n.ordinal()].ordinal()]++;
        for (var i = 0; 8 > i; i++)
            if (1 != e[i])
                return -4;
        t = 0;
        for (var i = 0; 8 > i; i++)
            t += this.co[i];
        return t % 3 != 0 ? -5 : 0 != (this.edgeParity() ^ this.cornerParity()) ? -6 : 0
    }
    ,
    l.getURtoDF = function(t, r) {
        var o = new l
          , i = new l;
        o.setURtoUL(t),
        i.setUBtoDF(r);
        for (var e = 0; 8 > e; e++)
            if (o.ep[e] != BR) {
                if (i.ep[e] != BR)
                    return -1;
                i.ep[e] = o.ep[e]
            }
        return i.getURtoDF()
    }
    ,
    l.moveCube = [new l([UBR, URF, UFL, ULB, DFR, DLF, DBL, DRB],[0, 0, 0, 0, 0, 0, 0, 0],[UB, UR, UF, UL, DR, DF, DL, DB, FR, FL, BL, BR],[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), new l([DFR, UFL, ULB, URF, DRB, DLF, DBL, UBR],[2, 0, 0, 1, 1, 0, 0, 2],[FR, UF, UL, UB, BR, DF, DL, DB, DR, FL, BL, UR],[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), new l([UFL, DLF, ULB, UBR, URF, DFR, DBL, DRB],[1, 2, 0, 0, 2, 1, 0, 0],[UR, FL, UL, UB, DR, FR, DL, DB, UF, DF, BL, BR],[0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0]), new l([URF, UFL, ULB, UBR, DLF, DBL, DRB, DFR],[0, 0, 0, 0, 0, 0, 0, 0],[UR, UF, UL, UB, DF, DL, DB, DR, FR, FL, BL, BR],[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), new l([URF, ULB, DBL, UBR, DFR, UFL, DLF, DRB],[0, 1, 2, 0, 0, 2, 1, 0],[UR, UF, BL, UB, DR, DF, FL, DB, FR, UL, DL, BR],[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), new l([URF, UFL, UBR, DRB, DFR, DLF, ULB, DBL],[0, 0, 1, 2, 0, 0, 2, 1],[UR, UF, UL, BR, DR, DF, DL, BL, FR, FL, UB, DB],[0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1])];
    var V = 2187
      , W = 2048
      , Y = 495
      , q = 24
      , z = 2
      , G = 20160
      , H = 11880
      , J = 1320
      , K = 1320
      , Q = 20160
      , X = 40320
      , Z = 479001600
      , $ = 18;
    u.parityMove = [new Int16Array([1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1]), new Int16Array([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0])],
    u.N_TWIST = 2187,
    u.N_FLIP = 2048,
    u.N_SLICE1 = 495,
    u.N_SLICE2 = 24,
    u.N_PARITY = 2,
    u.N_URFtoDLF = 20160,
    u.N_FRtoBR = 11880,
    u.N_URtoUL = 1320,
    u.N_UBtoDF = 1320,
    u.N_URtoDF = 20160,
    u.N_URFtoDLB = 40320,
    u.N_URtoBR = 479001600,
    u.N_MOVE = 18,
    u.setPruning = function(t, r, o) {
        0 == (1 & r) ? t[r / 2] &= 240 | o : t[r / 2 | 0] &= 15 | o << 4
    }
    ,
    u.getPruning = function(t, r) {
        return 0 == (1 & r) ? 15 & t[r / 2] : (240 & t[r / 2 | 0]) >>> 4
    }
    ;
    var tt = []
      , rt = {
        ax: new Int32Array(31),
        po: new Int32Array(31),
        flip: new Int32Array(31),
        twist: new Int32Array(31),
        slice: new Int32Array(31),
        parity: new Int32Array(31),
        URFtoDLF: new Int32Array(31),
        FRtoBR: new Int32Array(31),
        URtoUL: new Int32Array(31),
        UBtoDF: new Int32Array(31),
        URtoDF: new Int32Array(31),
        minDistPhase1: new Int32Array(31),
        minDistPhase2: new Int32Array(31),
        solutionToString: function(t, r) {
            for (var o = "", i = 0; t > i; i++) {
                switch (this.ax[i]) {
                case 0:
                    o += "U";
                    break;
                case 1:
                    o += "R";
                    break;
                case 2:
                    o += "F";
                    break;
                case 3:
                    o += "D";
                    break;
                case 4:
                    o += "L";
                    break;
                case 5:
                    o += "B"
                }
                switch (this.po[i]) {
                case 1:
                    o += " ";
                    break;
                case 2:
                    o += "2 ";
                    break;
                case 3:
                    o += "' "
                }
                i == r - 1 && (o += ". ")
            }
            return o
        },
        solution: function(t, r, o, i) {
            var e, n = new Int32Array(6);
            try {
                for (var a = 0; 54 > a; a++)
                    n[C.valueOf(t.charAt(a)).ordinal()]++
            } catch (s) {
                return "Error 1"
            }
            for (var a = 0; 6 > a; a++)
                if (9 != n[a])
                    return "Error 1";
            var R = new h(t)
              , f = R.toCubieCube();
            if (0 != (e = f.verify()))
                return "Error " + Math.abs(e);
            var F = new u(f);
            this.po[0] = 0,
            this.ax[0] = 0,
            this.flip[0] = F.flip,
            this.twist[0] = F.twist,
            this.parity[0] = F.parity,
            this.slice[0] = F.FRtoBR / 24 | 0,
            this.URFtoDLF[0] = F.URFtoDLF,
            this.FRtoBR[0] = F.FRtoBR,
            this.URtoUL[0] = F.URtoUL,
            this.UBtoDF[0] = F.UBtoDF,
            this.minDistPhase1[1] = 1;
            for (var U = 0, l = 0, v = !1, p = 1, D = (new Date).getTime(); ; ) {
                do
                    if (p - l > this.minDistPhase1[l + 1] && !v)
                        0 == this.ax[l] || 3 == this.ax[l] ? this.ax[++l] = 1 : this.ax[++l] = 0,
                        this.po[l] = 1;
                    else if (++this.po[l] > 3) {
                        do {
                            if (++this.ax[l] > 5) {
                                if ((new Date).getTime() - D > o << 10)
                                    return "Error 8";
                                if (0 == l) {
                                    if (p >= r)
                                        return "Error 7";
                                    p++,
                                    this.ax[l] = 0,
                                    this.po[l] = 1,
                                    v = !1;
                                    break
                                }
                                l--,
                                v = !0;
                                break
                            }
                            this.po[l] = 1,
                            v = !1
                        } while (0 != l && (this.ax[l - 1] == this.ax[l] || this.ax[l - 1] - 3 == this.ax[l]))
                    } else
                        v = !1;
                while (v);
                if (U = 3 * this.ax[l] + this.po[l] - 1,
                this.flip[l + 1] = u.flipMove[this.flip[l]][U],
                this.twist[l + 1] = u.twistMove[this.twist[l]][U],
                this.slice[l + 1] = u.FRtoBR_Move[24 * this.slice[l]][U] / 24 | 0,
                this.minDistPhase1[l + 1] = Math.max(u.getPruning(u.Slice_Flip_Prun, u.N_SLICE1 * this.flip[l + 1] + this.slice[l + 1]), u.getPruning(u.Slice_Twist_Prun, u.N_SLICE1 * this.twist[l + 1] + this.slice[l + 1])),
                0 == this.minDistPhase1[l + 1] && l >= p - 5 && (this.minDistPhase1[l + 1] = 10,
                l == p - 1 && (e = this.totalDepth(p, r)) >= 0 && (e == p || this.ax[p - 1] != this.ax[p] && this.ax[p - 1] != this.ax[p] + 3)))
                    return i ? this.solutionToString(e, p) : this.solutionToString(e)
            }
        },
        totalDepth: function(t, r) {
            for (var o = 0, i = 0, e = 0, n = Math.min(10, r - t), a = 0; t > a; a++)
                o = 3 * this.ax[a] + this.po[a] - 1,
                this.URFtoDLF[a + 1] = u.URFtoDLF_Move[this.URFtoDLF[a]][o],
                this.FRtoBR[a + 1] = u.FRtoBR_Move[this.FRtoBR[a]][o],
                this.parity[a + 1] = u.parityMove[this.parity[a]][o];
            if ((i = u.getPruning(u.Slice_URFtoDLF_Parity_Prun, 2 * (u.N_SLICE2 * this.URFtoDLF[t] + this.FRtoBR[t]) + this.parity[t])) > n)
                return -1;
            for (var a = 0; t > a; a++)
                o = 3 * this.ax[a] + this.po[a] - 1,
                this.URtoUL[a + 1] = u.URtoUL_Move[this.URtoUL[a]][o],
                this.UBtoDF[a + 1] = u.UBtoDF_Move[this.UBtoDF[a]][o];
            if (this.URtoDF[t] = u.MergeURtoULandUBtoDF[this.URtoUL[t]][this.UBtoDF[t]],
            (e = u.getPruning(u.Slice_URtoDF_Parity_Prun, 2 * (u.N_SLICE2 * this.URtoDF[t] + this.FRtoBR[t]) + this.parity[t])) > n)
                return -1;
            if (0 == (this.minDistPhase2[t] = Math.max(i, e)))
                return t;
            var s = 1
              , R = t
              , h = !1;
            this.po[t] = 0,
            this.ax[t] = 0,
            this.minDistPhase2[R + 1] = 1;
            do {
                do
                    if (t + s - R > this.minDistPhase2[R + 1] && !h)
                        0 == this.ax[R] || 3 == this.ax[R] ? (this.ax[++R] = 1,
                        this.po[R] = 2) : (this.ax[++R] = 0,
                        this.po[R] = 1);
                    else if (0 == this.ax[R] || 3 == this.ax[R] ? ++this.po[R] > 3 : (this.po[R] = this.po[R] + 2) > 3) {
                        do {
                            if (++this.ax[R] > 5) {
                                if (R == t) {
                                    if (s >= n)
                                        return -1;
                                    s++,
                                    this.ax[R] = 0,
                                    this.po[R] = 1,
                                    h = !1;
                                    break
                                }
                                R--,
                                h = !0;
                                break
                            }
                            0 == this.ax[R] || 3 == this.ax[R] ? this.po[R] = 1 : this.po[R] = 2,
                            h = !1
                        } while (R != t && (this.ax[R - 1] == this.ax[R] || this.ax[R - 1] - 3 == this.ax[R]))
                    } else
                        h = !1;
                while (h);
                o = 3 * this.ax[R] + this.po[R] - 1,
                this.URFtoDLF[R + 1] = u.URFtoDLF_Move[this.URFtoDLF[R]][o],
                this.FRtoBR[R + 1] = u.FRtoBR_Move[this.FRtoBR[R]][o],
                this.parity[R + 1] = u.parityMove[this.parity[R]][o],
                this.URtoDF[R + 1] = u.URtoDF_Move[this.URtoDF[R]][o],
                this.minDistPhase2[R + 1] = Math.max(u.getPruning(u.Slice_URtoDF_Parity_Prun, 2 * (u.N_SLICE2 * this.URtoDF[R + 1] + this.FRtoBR[R + 1]) + this.parity[R + 1]), u.getPruning(u.Slice_URFtoDLF_Parity_Prun, 2 * (u.N_SLICE2 * this.URFtoDLF[R + 1] + this.FRtoBR[R + 1]) + this.parity[R + 1]))
            } while (0 != this.minDistPhase2[R + 1]);
            return t + s
        }
    }
}();
