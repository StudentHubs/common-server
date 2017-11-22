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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
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
Object.defineProperty(exports, "__esModule", { value: true });
var rgo_1 = require("rgo");
var keys_to_object_1 = require("keys-to-object");
var uuid = require("uuid/v1");
var sqlScalars = {
    boolean: 'BOOLEAN',
    int: 'INTEGER',
    float: 'FLOAT',
    string: 'TEXT',
    date: 'TIMESTAMPTZ',
    file: 'TEXT',
    json: 'JSON',
};
var applyFilter = function (knex, filter, isOr) {
    if (['AND', 'OR'].includes(filter[0])) {
        return knex.where(function () {
            var _this = this;
            filter.slice(1).forEach(function (f) { return applyFilter(_this, f, filter[0] === 'OR'); });
        });
    }
    var op = filter.length === 3 ? filter[1] : '=';
    var value = filter[filter.length - 1];
    if (value === null && ['=', '!='].includes(op)) {
        return knex["" + (isOr ? 'orWhere' : 'where') + (op === '=' ? 'Null' : 'NotNull')](filter[0]);
    }
    return knex[isOr ? 'orWhere' : 'where'](filter[0], op, value);
};
function sqlResolver(knex, schema, owner) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        var types, dbFields;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    types = Object.keys(schema);
                    dbFields = keys_to_object_1.default(types, function (type) {
                        return keys_to_object_1.default(Object.keys(schema[type]).filter(function (f) { return !rgo_1.fieldIs.foreignRelation(schema[type][f]); }), function (f) {
                            var field = schema[type][f];
                            return "" + sqlScalars[rgo_1.fieldIs.scalar(field) ? field.scalar : 'string'] + (field.isList ? '[]' : '');
                        });
                    });
                    return [4 /*yield*/, Promise.all(types.map(function (type) { return __awaiter(_this, void 0, void 0, function () {
                            var columns, _loop_1, _a, _b, field, e_1_1, e_1, _c;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0: return [4 /*yield*/, knex(type).columnInfo()];
                                    case 1:
                                        columns = (_d.sent());
                                        if (!(Object.keys(columns).length === 0)) return [3 /*break*/, 4];
                                        return [4 /*yield*/, knex.schema.createTable(type, function (table) {
                                                table.text('id').primary();
                                            })];
                                    case 2:
                                        _d.sent();
                                        if (!owner) return [3 /*break*/, 4];
                                        return [4 /*yield*/, knex.raw('ALTER TABLE ?? OWNER TO ??;', [type, owner])];
                                    case 3:
                                        _d.sent();
                                        _d.label = 4;
                                    case 4:
                                        delete columns.id;
                                        _loop_1 = function (field) {
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        if (!(!columns[field] && dbFields[type][field])) return [3 /*break*/, 2];
                                                        return [4 /*yield*/, knex.schema.table(type, function (table) {
                                                                table.specificType(field, dbFields[type][field]);
                                                            })];
                                                    case 1:
                                                        _a.sent();
                                                        return [3 /*break*/, 3];
                                                    case 2:
                                                        if (columns[field] && !dbFields[type][field]) {
                                                            // await knex.schema.table(type, table => {
                                                            //   table.dropColumn(field);
                                                            // });
                                                        }
                                                        _a.label = 3;
                                                    case 3: return [2 /*return*/];
                                                }
                                            });
                                        };
                                        _d.label = 5;
                                    case 5:
                                        _d.trys.push([5, 10, 11, 12]);
                                        _a = __values(Array.from(new Set(__spread(Object.keys(columns), Object.keys(dbFields[type]))))), _b = _a.next();
                                        _d.label = 6;
                                    case 6:
                                        if (!!_b.done) return [3 /*break*/, 9];
                                        field = _b.value;
                                        return [5 /*yield**/, _loop_1(field)];
                                    case 7:
                                        _d.sent();
                                        _d.label = 8;
                                    case 8:
                                        _b = _a.next();
                                        return [3 /*break*/, 6];
                                    case 9: return [3 /*break*/, 12];
                                    case 10:
                                        e_1_1 = _d.sent();
                                        e_1 = { error: e_1_1 };
                                        return [3 /*break*/, 12];
                                    case 11:
                                        try {
                                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                                        }
                                        finally { if (e_1) throw e_1.error; }
                                        return [7 /*endfinally*/];
                                    case 12: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 1:
                    _a.sent();
                    return [2 /*return*/, rgo_1.resolvers.db(schema, {
                            find: function (type, _a, fields) {
                                var filter = _a.filter, sort = _a.sort, _b = _a.start, start = _b === void 0 ? 0 : _b, end = _a.end;
                                return __awaiter(this, void 0, void 0, function () {
                                    var query;
                                    return __generator(this, function (_c) {
                                        switch (_c.label) {
                                            case 0:
                                                if (start === end)
                                                    return [2 /*return*/, []];
                                                query = filter ? applyFilter(knex(type), filter) : knex(type);
                                                if (sort) {
                                                    sort.forEach(function (s) {
                                                        var field = s.replace('-', '');
                                                        var dir = s[0] === '-' ? 'desc' : 'asc';
                                                        if (dbFields[type][field] === 'TEXT') {
                                                            query.orderByRaw("lower(\"" + field + "\") " + dir);
                                                        }
                                                        else {
                                                            query.orderByRaw(field + " " + dir + " NULLS LAST");
                                                        }
                                                    });
                                                }
                                                query.offset(start);
                                                if (end !== undefined)
                                                    query.limit(end);
                                                query.select.apply(query, __spread((fields || [])));
                                                return [4 /*yield*/, query];
                                            case 1: return [2 /*return*/, _c.sent()];
                                        }
                                    });
                                });
                            },
                            insert: function (type, record) {
                                return __awaiter(this, void 0, void 0, function () {
                                    var idRecord;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                idRecord = __assign({ id: uuid() }, record);
                                                return [4 /*yield*/, knex(type).insert(idRecord)];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/, idRecord.id];
                                        }
                                    });
                                });
                            },
                            update: function (type, id, record) {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, knex(type)
                                                    .where('id', id)
                                                    .update(record)];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            },
                            delete: function (type, id) {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, knex(type)
                                                    .where('id', id)
                                                    .delete()];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            },
                        })];
            }
        });
    });
}
exports.default = sqlResolver;
