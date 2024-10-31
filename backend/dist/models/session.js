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
const depot_1 = __importDefault(require("./depot"));
let Session = (() => {
    let _classDecorators = [sequelize_typescript_1.Table];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = sequelize_typescript_1.Model;
    let _dateDebut_decorators;
    let _dateDebut_initializers = [];
    let _dateDebut_extraInitializers = [];
    let _dateFin_decorators;
    let _dateFin_initializers = [];
    let _dateFin_extraInitializers = [];
    let _estActif_decorators;
    let _estActif_initializers = [];
    let _estActif_extraInitializers = [];
    let _depots_decorators;
    let _depots_initializers = [];
    let _depots_extraInitializers = [];
    var Session = _classThis = class extends _classSuper {
        constructor() {
            super(...arguments);
            this.dateDebut = __runInitializers(this, _dateDebut_initializers, void 0);
            this.dateFin = (__runInitializers(this, _dateDebut_extraInitializers), __runInitializers(this, _dateFin_initializers, void 0));
            this.estActif = (__runInitializers(this, _dateFin_extraInitializers), __runInitializers(this, _estActif_initializers, void 0));
            this.depots = (__runInitializers(this, _estActif_extraInitializers), __runInitializers(this, _depots_initializers, void 0));
            __runInitializers(this, _depots_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "Session");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        _dateDebut_decorators = [(0, sequelize_typescript_1.Column)({
                type: sequelize_typescript_1.DataType.DATE,
                allowNull: false,
            })];
        _dateFin_decorators = [(0, sequelize_typescript_1.Column)({
                type: sequelize_typescript_1.DataType.DATE,
                allowNull: false,
            })];
        _estActif_decorators = [(0, sequelize_typescript_1.Column)({
                type: sequelize_typescript_1.DataType.BOOLEAN,
                allowNull: false,
            })];
        _depots_decorators = [(0, sequelize_typescript_1.HasMany)(() => depot_1.default)];
        __esDecorate(null, null, _dateDebut_decorators, { kind: "field", name: "dateDebut", static: false, private: false, access: { has: obj => "dateDebut" in obj, get: obj => obj.dateDebut, set: (obj, value) => { obj.dateDebut = value; } }, metadata: _metadata }, _dateDebut_initializers, _dateDebut_extraInitializers);
        __esDecorate(null, null, _dateFin_decorators, { kind: "field", name: "dateFin", static: false, private: false, access: { has: obj => "dateFin" in obj, get: obj => obj.dateFin, set: (obj, value) => { obj.dateFin = value; } }, metadata: _metadata }, _dateFin_initializers, _dateFin_extraInitializers);
        __esDecorate(null, null, _estActif_decorators, { kind: "field", name: "estActif", static: false, private: false, access: { has: obj => "estActif" in obj, get: obj => obj.estActif, set: (obj, value) => { obj.estActif = value; } }, metadata: _metadata }, _estActif_initializers, _estActif_extraInitializers);
        __esDecorate(null, null, _depots_decorators, { kind: "field", name: "depots", static: false, private: false, access: { has: obj => "depots" in obj, get: obj => obj.depots, set: (obj, value) => { obj.depots = value; } }, metadata: _metadata }, _depots_initializers, _depots_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Session = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Session = _classThis;
})();
exports.default = Session;
