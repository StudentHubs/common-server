"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var rgo_1 = require("rgo");
var common_1 = require("common");
exports.previous = function (knex) {
    return rgo_1.enhancers.onUpdate(function (_a, _b) {
        var type = _a.type, id = _a.id;
        var context = _b.context;
        return __awaiter(_this, void 0, void 0, function () {
            var _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        context.previous = context.previous || {};
                        context.previous[type] = context.previous[type] || {};
                        if (!id) return [3 /*break*/, 3];
                        _c = context.previous[type];
                        _d = id;
                        _e = id;
                        if (!_e) return [3 /*break*/, 2];
                        return [4 /*yield*/, knex(type)
                                .where('id', id)
                                .first()];
                    case 1:
                        _e = (_f.sent());
                        _f.label = 2;
                    case 2:
                        _c[_d] =
                            (_e) ||
                                null;
                        _f.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    });
};
exports.timestamps = rgo_1.enhancers.onUpdate(function (_a) {
    var id = _a.id, record = _a.record;
    return __awaiter(_this, void 0, void 0, function () {
        var time;
        return __generator(this, function (_b) {
            if (record) {
                time = new Date();
                return [2 /*return*/, __assign({}, id || record.createdat ? {} : { createdat: time }, record.modifiedat ? {} : { modifiedat: time })];
            }
            return [2 /*return*/];
        });
    });
});
exports.logging = rgo_1.enhancers.onUpdate(function (_a, _b) {
    var type = _a.type, id = _a.id, record = _a.record;
    var previous = _b.context.previous;
    return __awaiter(_this, void 0, void 0, function () {
        var prev;
        return __generator(this, function (_c) {
            prev = previous[type][id] || null;
            if (record) {
                if (id) {
                    console.log("rgo-commit-update, " + type + ":" + id + ", " +
                        ("old: " + JSON.stringify(prev) + ", new: " + JSON.stringify(record)));
                }
                else {
                    console.log("rgo-commit-insert, " + type + ", new: " + JSON.stringify(record));
                }
            }
            else if (id) {
                console.log("rgo-commit-delete, " + type + ":" + id + ", old: " + JSON.stringify(prev));
            }
            return [2 /*return*/];
        });
    });
});
exports.validate = rgo_1.enhancers.onUpdate(function (_a, _b) {
    var type = _a.type, record = _a.record;
    var schema = _b.schema;
    return __awaiter(_this, void 0, void 0, function () {
        var _c, _d, f, e_1, _e;
        return __generator(this, function (_f) {
            if (record) {
                try {
                    for (_c = __values(Object.keys(record)), _d = _c.next(); !_d.done; _d = _c.next()) {
                        f = _d.value;
                        if (!common_1.isValid(__assign({ scalar: schema[type][f].scalar || 'string', optional: true }, schema[type][f].meta), record[f], record)) {
                            throw new Error('Invalid data');
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_e = _c.return)) _e.call(_c);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            return [2 /*return*/];
        });
    });
});
