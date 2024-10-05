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
const editeur_1 = __importDefault(require("./editeur"));
let Jeu = (() => {
    let _classDecorators = [sequelize_typescript_1.Table];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = sequelize_typescript_1.Model;
    let _nom_decorators;
    let _nom_initializers = [];
    let _nom_extraInitializers = [];
    let _editeurId_decorators;
    let _editeurId_initializers = [];
    let _editeurId_extraInitializers = [];
    let _prix_decorators;
    let _prix_initializers = [];
    let _prix_extraInitializers = [];
    let _statut_decorators;
    let _statut_initializers = [];
    let _statut_extraInitializers = [];
    let _editeur_decorators;
    let _editeur_initializers = [];
    let _editeur_extraInitializers = [];
    var Jeu = _classThis = class extends _classSuper {
        constructor() {
            super(...arguments);
            this.nom = __runInitializers(this, _nom_initializers, void 0);
            this.editeurId = (__runInitializers(this, _nom_extraInitializers), __runInitializers(this, _editeurId_initializers, void 0));
            this.prix = (__runInitializers(this, _editeurId_extraInitializers), __runInitializers(this, _prix_initializers, void 0));
            this.statut = (__runInitializers(this, _prix_extraInitializers), __runInitializers(this, _statut_initializers, void 0));
            this.editeur = (__runInitializers(this, _statut_extraInitializers), __runInitializers(this, _editeur_initializers, void 0));
            __runInitializers(this, _editeur_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "Jeu");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        _nom_decorators = [(0, sequelize_typescript_1.Column)({
                type: sequelize_typescript_1.DataType.STRING,
                allowNull: false,
            })];
        _editeurId_decorators = [(0, sequelize_typescript_1.ForeignKey)(() => editeur_1.default), (0, sequelize_typescript_1.Column)({
                type: sequelize_typescript_1.DataType.INTEGER,
                allowNull: false,
            })];
        _prix_decorators = [(0, sequelize_typescript_1.Column)({
                type: sequelize_typescript_1.DataType.FLOAT,
                allowNull: false,
            })];
        _statut_decorators = [(0, sequelize_typescript_1.Column)({
                type: sequelize_typescript_1.DataType.ENUM('en vente', 'vendu'),
                allowNull: false,
            })];
        _editeur_decorators = [(0, sequelize_typescript_1.BelongsTo)(() => editeur_1.default)];
        __esDecorate(null, null, _nom_decorators, { kind: "field", name: "nom", static: false, private: false, access: { has: obj => "nom" in obj, get: obj => obj.nom, set: (obj, value) => { obj.nom = value; } }, metadata: _metadata }, _nom_initializers, _nom_extraInitializers);
        __esDecorate(null, null, _editeurId_decorators, { kind: "field", name: "editeurId", static: false, private: false, access: { has: obj => "editeurId" in obj, get: obj => obj.editeurId, set: (obj, value) => { obj.editeurId = value; } }, metadata: _metadata }, _editeurId_initializers, _editeurId_extraInitializers);
        __esDecorate(null, null, _prix_decorators, { kind: "field", name: "prix", static: false, private: false, access: { has: obj => "prix" in obj, get: obj => obj.prix, set: (obj, value) => { obj.prix = value; } }, metadata: _metadata }, _prix_initializers, _prix_extraInitializers);
        __esDecorate(null, null, _statut_decorators, { kind: "field", name: "statut", static: false, private: false, access: { has: obj => "statut" in obj, get: obj => obj.statut, set: (obj, value) => { obj.statut = value; } }, metadata: _metadata }, _statut_initializers, _statut_extraInitializers);
        __esDecorate(null, null, _editeur_decorators, { kind: "field", name: "editeur", static: false, private: false, access: { has: obj => "editeur" in obj, get: obj => obj.editeur, set: (obj, value) => { obj.editeur = value; } }, metadata: _metadata }, _editeur_initializers, _editeur_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Jeu = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Jeu = _classThis;
})();
exports.default = Jeu;
