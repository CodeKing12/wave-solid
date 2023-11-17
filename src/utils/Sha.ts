// https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/core.min.js
// @ts-ignore
var CryptoJS = (function () {
	var t =
		t ||
		(function (f) {
			var t;
			if (
				("undefined" != typeof window &&
					window.crypto &&
					(t = window.crypto),
				!t &&
					"undefined" != typeof window &&
					window.msCrypto &&
					(t = window.msCrypto),
				!t &&
					"undefined" != typeof global &&
					global.crypto &&
					(t = global.crypto),
				!t && "function" == typeof require)
			)
				try {
					t = require("crypto");
				} catch (t) {}
			function i() {
				if (t) {
					if ("function" == typeof t.getRandomValues)
						try {
							return t.getRandomValues(new Uint32Array(1))[0];
						} catch (t) {}
					if ("function" == typeof t.randomBytes)
						try {
							return t.randomBytes(4).readInt32LE();
						} catch (t) {}
				}
				throw new Error(
					"Native crypto module could not be used to get secure random number.",
				);
			}
			var e =
				Object.create ||
				function (t) {
					var n;
					return (
						(r.prototype = t),
						(n = new r()),
						(r.prototype = null),
						n
					);
				};
			function r() {}
			var n = {},
				o = (n.lib = {}),
				s = (o.Base = {
					extend: function (t) {
						var n = e(this);
						return (
							t && n.mixIn(t),
							(n.hasOwnProperty("init") &&
								this.init !== n.init) ||
								(n.init = function () {
									n.$super.init.apply(this, arguments);
								}),
							((n.init.prototype = n).$super = this),
							n
						);
					},
					create: function () {
						var t = this.extend();
						return t.init.apply(t, arguments), t;
					},
					init: function () {},
					mixIn: function (t) {
						for (var n in t)
							t.hasOwnProperty(n) && (this[n] = t[n]);
						t.hasOwnProperty("toString") &&
							(this.toString = t.toString);
					},
					clone: function () {
						return this.init.prototype.extend(this);
					},
				}),
				p = (o.WordArray = s.extend({
					init: function (t, n) {
						(t = this.words = t || []),
							(this.sigBytes = null != n ? n : 4 * t.length);
					},
					toString: function (t) {
						return (t || c).stringify(this);
					},
					concat: function (t) {
						var n = this.words,
							e = t.words,
							i = this.sigBytes,
							r = t.sigBytes;
						if ((this.clamp(), i % 4))
							for (var o = 0; o < r; o++) {
								var s =
									(e[o >>> 2] >>> (24 - (o % 4) * 8)) & 255;
								n[(i + o) >>> 2] |=
									s << (24 - ((i + o) % 4) * 8);
							}
						else
							for (o = 0; o < r; o += 4)
								n[(i + o) >>> 2] = e[o >>> 2];
						return (this.sigBytes += r), this;
					},
					clamp: function () {
						var t = this.words,
							n = this.sigBytes;
						(t[n >>> 2] &= 4294967295 << (32 - (n % 4) * 8)),
							(t.length = f.ceil(n / 4));
					},
					clone: function () {
						var t = s.clone.call(this);
						return (t.words = this.words.slice(0)), t;
					},
					random: function (t) {
						for (var n = [], e = 0; e < t; e += 4) n.push(i());
						return new p.init(n, t);
					},
				})),
				a = (n.enc = {}),
				c = (a.Hex = {
					stringify: function (t) {
						for (
							var n = t.words, e = t.sigBytes, i = [], r = 0;
							r < e;
							r++
						) {
							var o = (n[r >>> 2] >>> (24 - (r % 4) * 8)) & 255;
							i.push((o >>> 4).toString(16)),
								i.push((15 & o).toString(16));
						}
						return i.join("");
					},
					parse: function (t) {
						for (var n = t.length, e = [], i = 0; i < n; i += 2)
							e[i >>> 3] |=
								parseInt(t.substr(i, 2), 16) <<
								(24 - (i % 8) * 4);
						return new p.init(e, n / 2);
					},
				}),
				u = (a.Latin1 = {
					stringify: function (t) {
						for (
							var n = t.words, e = t.sigBytes, i = [], r = 0;
							r < e;
							r++
						) {
							var o = (n[r >>> 2] >>> (24 - (r % 4) * 8)) & 255;
							i.push(String.fromCharCode(o));
						}
						return i.join("");
					},
					parse: function (t) {
						for (var n = t.length, e = [], i = 0; i < n; i++)
							e[i >>> 2] |=
								(255 & t.charCodeAt(i)) << (24 - (i % 4) * 8);
						return new p.init(e, n);
					},
				}),
				d = (a.Utf8 = {
					stringify: function (t) {
						try {
							return decodeURIComponent(escape(u.stringify(t)));
						} catch (t) {
							throw new Error("Malformed UTF-8 data");
						}
					},
					parse: function (t) {
						return u.parse(unescape(encodeURIComponent(t)));
					},
				}),
				h = (o.BufferedBlockAlgorithm = s.extend({
					reset: function () {
						(this._data = new p.init()), (this._nDataBytes = 0);
					},
					_append: function (t) {
						"string" == typeof t && (t = d.parse(t)),
							this._data.concat(t),
							(this._nDataBytes += t.sigBytes);
					},
					_process: function (t) {
						var n,
							e = this._data,
							i = e.words,
							r = e.sigBytes,
							o = this.blockSize,
							s = r / (4 * o),
							a =
								(s = t
									? f.ceil(s)
									: f.max((0 | s) - this._minBufferSize, 0)) *
								o,
							c = f.min(4 * a, r);
						if (a) {
							for (var u = 0; u < a; u += o)
								this._doProcessBlock(i, u);
							(n = i.splice(0, a)), (e.sigBytes -= c);
						}
						return new p.init(n, c);
					},
					clone: function () {
						var t = s.clone.call(this);
						return (t._data = this._data.clone()), t;
					},
					_minBufferSize: 0,
				})),
				l =
					((o.Hasher = h.extend({
						cfg: s.extend(),
						init: function (t) {
							(this.cfg = this.cfg.extend(t)), this.reset();
						},
						reset: function () {
							h.reset.call(this), this._doReset();
						},
						update: function (t) {
							return this._append(t), this._process(), this;
						},
						finalize: function (t) {
							return t && this._append(t), this._doFinalize();
						},
						blockSize: 16,
						_createHelper: function (e) {
							return function (t, n) {
								return new e.init(n).finalize(t);
							};
						},
						_createHmacHelper: function (e) {
							return function (t, n) {
								return new l.HMAC.init(e, n).finalize(t);
							};
						},
					})),
					(n.algo = {}));
			return n;
		})(Math);
	return t;
})();

// https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/sha1.min.js
// @ts-ignore
CryptoJS.SHA1 = (function (e) {
	var t, r, o, s, n, l, i;
	return (
		(r = (t = e).lib),
		(o = r.WordArray),
		(s = r.Hasher),
		(n = t.algo),
		(l = []),
		(i = n.SHA1 =
			s.extend({
				_doReset: function () {
					this._hash = new o.init([
						1732584193, 4023233417, 2562383102, 271733878,
						3285377520,
					]);
				},
				_doProcessBlock: function (e, t) {
					for (
						var r = this._hash.words,
							o = r[0],
							s = r[1],
							n = r[2],
							i = r[3],
							a = r[4],
							h = 0;
						h < 80;
						h++
					) {
						if (h < 16) l[h] = 0 | e[t + h];
						else {
							var c = l[h - 3] ^ l[h - 8] ^ l[h - 14] ^ l[h - 16];
							l[h] = (c << 1) | (c >>> 31);
						}
						var f = ((o << 5) | (o >>> 27)) + a + l[h];
						(f +=
							h < 20
								? 1518500249 + ((s & n) | (~s & i))
								: h < 40
								? 1859775393 + (s ^ n ^ i)
								: h < 60
								? ((s & n) | (s & i) | (n & i)) - 1894007588
								: (s ^ n ^ i) - 899497514),
							(a = i),
							(i = n),
							(n = (s << 30) | (s >>> 2)),
							(s = o),
							(o = f);
					}
					(r[0] = (r[0] + o) | 0),
						(r[1] = (r[1] + s) | 0),
						(r[2] = (r[2] + n) | 0),
						(r[3] = (r[3] + i) | 0),
						(r[4] = (r[4] + a) | 0);
				},
				_doFinalize: function () {
					var e = this._data,
						t = e.words,
						r = 8 * this._nDataBytes,
						o = 8 * e.sigBytes;
					return (
						(t[o >>> 5] |= 128 << (24 - (o % 32))),
						(t[14 + (((64 + o) >>> 9) << 4)] = Math.floor(
							r / 4294967296,
						)),
						(t[15 + (((64 + o) >>> 9) << 4)] = r),
						(e.sigBytes = 4 * t.length),
						this._process(),
						this._hash
					);
				},
				clone: function () {
					var e = s.clone.call(this);
					return (e._hash = this._hash.clone()), e;
				},
			})),
		(t.SHA1 = s._createHelper(i)),
		(t.HmacSHA1 = s._createHmacHelper(i)),
		e.SHA1
	);
})(CryptoJS);

// https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/sha256.min.js
// @ts-ignore
CryptoJS.SHA256 = (function (c) {
	return (
		(function (n) {
			var e = c,
				r = e.lib,
				t = r.WordArray,
				o = r.Hasher,
				i = e.algo,
				s = [],
				w = [];
			!(function () {
				function e(e) {
					for (var r = n.sqrt(e), t = 2; t <= r; t++)
						if (!(e % t)) return;
					return 1;
				}
				function r(e) {
					return (4294967296 * (e - (0 | e))) | 0;
				}
				for (var t = 2, o = 0; o < 64; )
					e(t) &&
						(o < 8 && (s[o] = r(n.pow(t, 0.5))),
						(w[o] = r(n.pow(t, 1 / 3))),
						o++),
						t++;
			})();
			var A = [],
				a = (i.SHA256 = o.extend({
					_doReset: function () {
						this._hash = new t.init(s.slice(0));
					},
					_doProcessBlock: function (e, r) {
						for (
							var t = this._hash.words,
								o = t[0],
								n = t[1],
								i = t[2],
								s = t[3],
								a = t[4],
								c = t[5],
								f = t[6],
								h = t[7],
								u = 0;
							u < 64;
							u++
						) {
							if (u < 16) A[u] = 0 | e[r + u];
							else {
								var l = A[u - 15],
									d =
										((l << 25) | (l >>> 7)) ^
										((l << 14) | (l >>> 18)) ^
										(l >>> 3),
									_ = A[u - 2],
									p =
										((_ << 15) | (_ >>> 17)) ^
										((_ << 13) | (_ >>> 19)) ^
										(_ >>> 10);
								A[u] = d + A[u - 7] + p + A[u - 16];
							}
							var v = (o & n) ^ (o & i) ^ (n & i),
								H =
									((o << 30) | (o >>> 2)) ^
									((o << 19) | (o >>> 13)) ^
									((o << 10) | (o >>> 22)),
								y =
									h +
									(((a << 26) | (a >>> 6)) ^
										((a << 21) | (a >>> 11)) ^
										((a << 7) | (a >>> 25))) +
									((a & c) ^ (~a & f)) +
									w[u] +
									A[u];
							(h = f),
								(f = c),
								(c = a),
								(a = (s + y) | 0),
								(s = i),
								(i = n),
								(n = o),
								(o = (y + (H + v)) | 0);
						}
						(t[0] = (t[0] + o) | 0),
							(t[1] = (t[1] + n) | 0),
							(t[2] = (t[2] + i) | 0),
							(t[3] = (t[3] + s) | 0),
							(t[4] = (t[4] + a) | 0),
							(t[5] = (t[5] + c) | 0),
							(t[6] = (t[6] + f) | 0),
							(t[7] = (t[7] + h) | 0);
					},
					_doFinalize: function () {
						var e = this._data,
							r = e.words,
							t = 8 * this._nDataBytes,
							o = 8 * e.sigBytes;
						return (
							(r[o >>> 5] |= 128 << (24 - (o % 32))),
							(r[14 + (((64 + o) >>> 9) << 4)] = n.floor(
								t / 4294967296,
							)),
							(r[15 + (((64 + o) >>> 9) << 4)] = t),
							(e.sigBytes = 4 * r.length),
							this._process(),
							this._hash
						);
					},
					clone: function () {
						var e = o.clone.call(this);
						return (e._hash = this._hash.clone()), e;
					},
				}));
			(e.SHA256 = o._createHelper(a)),
				(e.HmacSHA256 = o._createHmacHelper(a));
		})(Math),
		c.SHA256
	);
})(CryptoJS);

export function sha1(source: string): string {
	return CryptoJS.SHA1(source).toString();
}

export function sha256(source: string): string {
	return CryptoJS.SHA256(source).toString();
}