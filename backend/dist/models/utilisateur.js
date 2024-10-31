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
const administrateur_1 = __importDefault(require("./administrateur"));
const vendeur_1 = __importDefault(require("./vendeur"));
const acheteur_1 = __importDefault(require("./acheteur"));
let Utilisateur = (() => {
    let _classDecorators = [sequelize_typescript_1.Table];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = sequelize_typescript_1.Model;
    let _nom_decorators;
    let _nom_initializers = [];
    let _nom_extraInitializers = [];
    let _email_decorators;
    let _email_initializers = [];
    let _email_extraInitializers = [];
    let _telephone_decorators;
    let _telephone_initializers = [];
    let _telephone_extraInitializers = [];
    let _adresse_decorators;
    let _adresse_initializers = [];
    let _adresse_extraInitializers = [];
    let _typeUtilisateur_decorators;
    let _typeUtilisateur_initializers = [];
    let _typeUtilisateur_extraInitializers = [];
    let _administrateur_decorators;
    let _administrateur_initializers = [];
    let _administrateur_extraInitializers = [];
    let _vendeur_decorators;
    let _vendeur_initializers = [];
    let _vendeur_extraInitializers = [];
    let _acheteur_decorators;
    let _acheteur_initializers = [];
    let _acheteur_extraInitializers = [];
    var Utilisateur = _classThis = class extends _classSuper {
        constructor() {
            super(...arguments);
            this.nom = __runInitializers(this, _nom_initializers, void 0);
            this.email = (__runInitializers(this, _nom_extraInitializers), __runInitializers(this, _email_initializers, void 0));
            this.telephone = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _telephone_initializers, void 0));
            this.adresse = (__runInitializers(this, _telephone_extraInitializers), __runInitializers(this, _adresse_initializers, void 0));
            this.typeUtilisateur = (__runInitializers(this, _adresse_extraInitializers), __runInitializers(this, _typeUtilisateur_initializers, void 0));
            this.administrateur = (__runInitializers(this, _typeUtilisateur_extraInitializers), __runInitializers(this, _administrateur_initializers, void 0));
            this.vendeur = (__runInitializers(this, _administrateur_extraInitializers), __runInitializers(this, _vendeur_initializers, void 0));
            this.acheteur = (__runInitializers(this, _vendeur_extraInitializers), __runInitializers(this, _acheteur_initializers, void 0));
            __runInitializers(this, _acheteur_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "Utilisateur");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        _nom_decorators = [(0, sequelize_typescript_1.Column)({
                type: sequelize_typescript_1.DataType.STRING,
                allowNull: false,
            })];
        _email_decorators = [(0, sequelize_typescript_1.Column)({
                type: sequelize_typescript_1.DataType.STRING,
                allowNull: false,
                unique: true,
            })];
        _telephone_decorators = [(0, sequelize_typescript_1.Column)({
                type: sequelize_typescript_1.DataType.STRING,
                allowNull: false,
            })];
        _adresse_decorators = [(0, sequelize_typescript_1.Column)({
                type: sequelize_typescript_1.DataType.STRING,
            })];
        _typeUtilisateur_decorators = [(0, sequelize_typescript_1.Column)({
                type: sequelize_typescript_1.DataType.ENUM('administrateur', 'vendeur', 'acheteur'),
                allowNull: false,
            })];
        _administrateur_decorators = [(0, sequelize_typescript_1.HasOne)(() => administrateur_1.default)];
        _vendeur_decorators = [(0, sequelize_typescript_1.HasOne)(() => vendeur_1.default)];
        _acheteur_decorators = [(0, sequelize_typescript_1.HasOne)(() => acheteur_1.default)];
        __esDecorate(null, null, _nom_decorators, { kind: "field", name: "nom", static: false, private: false, access: { has: obj => "nom" in obj, get: obj => obj.nom, set: (obj, value) => { obj.nom = value; } }, metadata: _metadata }, _nom_initializers, _nom_extraInitializers);
        __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: obj => "email" in obj, get: obj => obj.email, set: (obj, value) => { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
        __esDecorate(null, null, _telephone_decorators, { kind: "field", name: "telephone", static: false, private: false, access: { has: obj => "telephone" in obj, get: obj => obj.telephone, set: (obj, value) => { obj.telephone = value; } }, metadata: _metadata }, _telephone_initializers, _telephone_extraInitializers);
        __esDecorate(null, null, _adresse_decorators, { kind: "field", name: "adresse", static: false, private: false, access: { has: obj => "adresse" in obj, get: obj => obj.adresse, set: (obj, value) => { obj.adresse = value; } }, metadata: _metadata }, _adresse_initializers, _adresse_extraInitializers);
        __esDecorate(null, null, _typeUtilisateur_decorators, { kind: "field", name: "typeUtilisateur", static: false, private: false, access: { has: obj => "typeUtilisateur" in obj, get: obj => obj.typeUtilisateur, set: (obj, value) => { obj.typeUtilisateur = value; } }, metadata: _metadata }, _typeUtilisateur_initializers, _typeUtilisateur_extraInitializers);
        __esDecorate(null, null, _administrateur_decorators, { kind: "field", name: "administrateur", static: false, private: false, access: { has: obj => "administrateur" in obj, get: obj => obj.administrateur, set: (obj, value) => { obj.administrateur = value; } }, metadata: _metadata }, _administrateur_initializers, _administrateur_extraInitializers);
        __esDecorate(null, null, _vendeur_decorators, { kind: "field", name: "vendeur", static: false, private: false, access: { has: obj => "vendeur" in obj, get: obj => obj.vendeur, set: (obj, value) => { obj.vendeur = value; } }, metadata: _metadata }, _vendeur_initializers, _vendeur_extraInitializers);
        __esDecorate(null, null, _acheteur_decorators, { kind: "field", name: "acheteur", static: false, private: false, access: { has: obj => "acheteur" in obj, get: obj => obj.acheteur, set: (obj, value) => { obj.acheteur = value; } }, metadata: _metadata }, _acheteur_initializers, _acheteur_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Utilisateur = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Utilisateur = _classThis;
})();
exports.default = Utilisateur;
