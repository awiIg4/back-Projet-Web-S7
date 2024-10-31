"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const achat_1 = __importDefault(require("./achat"));
let CodePromotion = (() => {
    let _classDecorators = [sequelize_typescript_1.Table];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = sequelize_typescript_1.Model;
    let _libele_decorators;
    let _libele_initializers = [];
    let _libele_extraInitializers = [];
    let _reductionPourcent_decorators;
    let _reductionPourcent_initializers = [];
    let _reductionPourcent_extraInitializers = [];
    let _achats_decorators;
    let _achats_initializers = [];
    let _achats_extraInitializers = [];
    var CodePromotion = _classThis = class extends _classSuper {
        constructor() {
            super(...arguments);
            this.libele = __runInitializers(this, _libele_initializers, void 0);
            this.reductionPourcent = (__runInitializers(this, _libele_extraInitializers), __runInitializers(this, _reductionPourcent_initializers, void 0));
            this.achats = (__runInitializers(this, _reductionPourcent_extraInitializers), __runInitializers(this, _achats_initializers, void 0));
            __runInitializers(this, _achats_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "CodePromotion");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        _libele_decorators = [(0, sequelize_typescript_1.Column)({
                type: sequelize_typescript_1.DataType.STRING,
                primaryKey: true,
                allowNull: false,
                unique: true,
            })];
        _reductionPourcent_decorators = [(0, sequelize_typescript_1.Column)({
                type: sequelize_typescript_1.DataType.INTEGER,
                allowNull: false,
            })];
        _achats_decorators = [(0, sequelize_typescript_1.HasMany)(() => achat_1.default)];
        __esDecorate(null, null, _libele_decorators, { kind: "field", name: "libele", static: false, private: false, access: { has: obj => "libele" in obj, get: obj => obj.libele, set: (obj, value) => { obj.libele = value; } }, metadata: _metadata }, _libele_initializers, _libele_extraInitializers);
        __esDecorate(null, null, _reductionPourcent_decorators, { kind: "field", name: "reductionPourcent", static: false, private: false, access: { has: obj => "reductionPourcent" in obj, get: obj => obj.reductionPourcent, set: (obj, value) => { obj.reductionPourcent = value; } }, metadata: _metadata }, _reductionPourcent_initializers, _reductionPourcent_extraInitializers);
        __esDecorate(null, null, _achats_decorators, { kind: "field", name: "achats", static: false, private: false, access: { has: obj => "achats" in obj, get: obj => obj.achats, set: (obj, value) => { obj.achats = value; } }, metadata: _metadata }, _achats_initializers, _achats_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CodePromotion = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CodePromotion = _classThis;
})();
exports.default = CodePromotion;
