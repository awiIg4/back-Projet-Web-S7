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
const jeu_1 = __importDefault(require("./jeu"));
let Editeur = (() => {
    let _classDecorators = [sequelize_typescript_1.Table];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = sequelize_typescript_1.Model;
    let _nom_decorators;
    let _nom_initializers = [];
    let _nom_extraInitializers = [];
    let _adresse_decorators;
    let _adresse_initializers = [];
    let _adresse_extraInitializers = [];
    let _contact_decorators;
    let _contact_initializers = [];
    let _contact_extraInitializers = [];
    let _jeux_decorators;
    let _jeux_initializers = [];
    let _jeux_extraInitializers = [];
    var Editeur = _classThis = class extends _classSuper {
        constructor() {
            super(...arguments);
            this.nom = __runInitializers(this, _nom_initializers, void 0);
            this.adresse = (__runInitializers(this, _nom_extraInitializers), __runInitializers(this, _adresse_initializers, void 0));
            this.contact = (__runInitializers(this, _adresse_extraInitializers), __runInitializers(this, _contact_initializers, void 0));
            this.jeux = (__runInitializers(this, _contact_extraInitializers), __runInitializers(this, _jeux_initializers, void 0));
            __runInitializers(this, _jeux_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "Editeur");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        _nom_decorators = [(0, sequelize_typescript_1.Column)({
                type: sequelize_typescript_1.DataType.STRING,
                allowNull: false,
            })];
        _adresse_decorators = [(0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING)];
        _contact_decorators = [(0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING)];
        _jeux_decorators = [(0, sequelize_typescript_1.HasMany)(() => jeu_1.default)];
        __esDecorate(null, null, _nom_decorators, { kind: "field", name: "nom", static: false, private: false, access: { has: obj => "nom" in obj, get: obj => obj.nom, set: (obj, value) => { obj.nom = value; } }, metadata: _metadata }, _nom_initializers, _nom_extraInitializers);
        __esDecorate(null, null, _adresse_decorators, { kind: "field", name: "adresse", static: false, private: false, access: { has: obj => "adresse" in obj, get: obj => obj.adresse, set: (obj, value) => { obj.adresse = value; } }, metadata: _metadata }, _adresse_initializers, _adresse_extraInitializers);
        __esDecorate(null, null, _contact_decorators, { kind: "field", name: "contact", static: false, private: false, access: { has: obj => "contact" in obj, get: obj => obj.contact, set: (obj, value) => { obj.contact = value; } }, metadata: _metadata }, _contact_initializers, _contact_extraInitializers);
        __esDecorate(null, null, _jeux_decorators, { kind: "field", name: "jeux", static: false, private: false, access: { has: obj => "jeux" in obj, get: obj => obj.jeux, set: (obj, value) => { obj.jeux = value; } }, metadata: _metadata }, _jeux_initializers, _jeux_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Editeur = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Editeur = _classThis;
})();
exports.default = Editeur;
