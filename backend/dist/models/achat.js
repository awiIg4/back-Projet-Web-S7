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
const vendeur_1 = __importDefault(require("./vendeur"));
const acheteur_1 = __importDefault(require("./acheteur"));
const codePromotion_1 = __importDefault(require("./codePromotion"));
let Achat = (() => {
    let _classDecorators = [sequelize_typescript_1.Table];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = sequelize_typescript_1.Model;
    let _jeuId_decorators;
    let _jeuId_initializers = [];
    let _jeuId_extraInitializers = [];
    let _vendeurId_decorators;
    let _vendeurId_initializers = [];
    let _vendeurId_extraInitializers = [];
    let _acheteurId_decorators;
    let _acheteurId_initializers = [];
    let _acheteurId_extraInitializers = [];
    let _codepromotion_decorators;
    let _codepromotion_initializers = [];
    let _codepromotion_extraInitializers = [];
    let _dateTransaction_decorators;
    let _dateTransaction_initializers = [];
    let _dateTransaction_extraInitializers = [];
    let _montant_decorators;
    let _montant_initializers = [];
    let _montant_extraInitializers = [];
    let _commission_decorators;
    let _commission_initializers = [];
    let _commission_extraInitializers = [];
    let _jeu_decorators;
    let _jeu_initializers = [];
    let _jeu_extraInitializers = [];
    let _vendeur_decorators;
    let _vendeur_initializers = [];
    let _vendeur_extraInitializers = [];
    let _acheteur_decorators;
    let _acheteur_initializers = [];
    let _acheteur_extraInitializers = [];
    let _codePromotion_decorators;
    let _codePromotion_initializers = [];
    let _codePromotion_extraInitializers = [];
    var Achat = _classThis = class extends _classSuper {
        constructor() {
            super(...arguments);
            this.jeuId = __runInitializers(this, _jeuId_initializers, void 0);
            this.vendeurId = (__runInitializers(this, _jeuId_extraInitializers), __runInitializers(this, _vendeurId_initializers, void 0));
            this.acheteurId = (__runInitializers(this, _vendeurId_extraInitializers), __runInitializers(this, _acheteurId_initializers, void 0));
            this.codepromotion = (__runInitializers(this, _acheteurId_extraInitializers), __runInitializers(this, _codepromotion_initializers, void 0));
            this.dateTransaction = (__runInitializers(this, _codepromotion_extraInitializers), __runInitializers(this, _dateTransaction_initializers, void 0));
            this.montant = (__runInitializers(this, _dateTransaction_extraInitializers), __runInitializers(this, _montant_initializers, void 0));
            this.commission = (__runInitializers(this, _montant_extraInitializers), __runInitializers(this, _commission_initializers, void 0));
            this.jeu = (__runInitializers(this, _commission_extraInitializers), __runInitializers(this, _jeu_initializers, void 0));
            this.vendeur = (__runInitializers(this, _jeu_extraInitializers), __runInitializers(this, _vendeur_initializers, void 0));
            this.acheteur = (__runInitializers(this, _vendeur_extraInitializers), __runInitializers(this, _acheteur_initializers, void 0));
            this.codePromotion = (__runInitializers(this, _acheteur_extraInitializers), __runInitializers(this, _codePromotion_initializers, void 0));
            __runInitializers(this, _codePromotion_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "Achat");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        _jeuId_decorators = [(0, sequelize_typescript_1.ForeignKey)(() => jeu_1.default), (0, sequelize_typescript_1.Column)({
                type: sequelize_typescript_1.DataType.INTEGER,
                allowNull: false,
            })];
        _vendeurId_decorators = [(0, sequelize_typescript_1.ForeignKey)(() => vendeur_1.default), (0, sequelize_typescript_1.Column)({
                type: sequelize_typescript_1.DataType.INTEGER,
                allowNull: false,
            })];
        _acheteurId_decorators = [(0, sequelize_typescript_1.ForeignKey)(() => acheteur_1.default), (0, sequelize_typescript_1.Column)({
                type: sequelize_typescript_1.DataType.INTEGER,
                allowNull: false,
            })];
        _codepromotion_decorators = [(0, sequelize_typescript_1.ForeignKey)(() => codePromotion_1.default), (0, sequelize_typescript_1.Column)({
                type: sequelize_typescript_1.DataType.STRING, // Correction ici
                allowNull: false,
            })];
        _dateTransaction_decorators = [(0, sequelize_typescript_1.Column)({
                type: sequelize_typescript_1.DataType.DATE,
                allowNull: false,
            })];
        _montant_decorators = [(0, sequelize_typescript_1.Column)({
                type: sequelize_typescript_1.DataType.FLOAT,
                allowNull: false,
            })];
        _commission_decorators = [(0, sequelize_typescript_1.Column)({
                type: sequelize_typescript_1.DataType.FLOAT,
                allowNull: false,
            })];
        _jeu_decorators = [(0, sequelize_typescript_1.BelongsTo)(() => jeu_1.default)];
        _vendeur_decorators = [(0, sequelize_typescript_1.BelongsTo)(() => vendeur_1.default)];
        _acheteur_decorators = [(0, sequelize_typescript_1.BelongsTo)(() => acheteur_1.default)];
        _codePromotion_decorators = [(0, sequelize_typescript_1.BelongsTo)(() => codePromotion_1.default)];
        __esDecorate(null, null, _jeuId_decorators, { kind: "field", name: "jeuId", static: false, private: false, access: { has: obj => "jeuId" in obj, get: obj => obj.jeuId, set: (obj, value) => { obj.jeuId = value; } }, metadata: _metadata }, _jeuId_initializers, _jeuId_extraInitializers);
        __esDecorate(null, null, _vendeurId_decorators, { kind: "field", name: "vendeurId", static: false, private: false, access: { has: obj => "vendeurId" in obj, get: obj => obj.vendeurId, set: (obj, value) => { obj.vendeurId = value; } }, metadata: _metadata }, _vendeurId_initializers, _vendeurId_extraInitializers);
        __esDecorate(null, null, _acheteurId_decorators, { kind: "field", name: "acheteurId", static: false, private: false, access: { has: obj => "acheteurId" in obj, get: obj => obj.acheteurId, set: (obj, value) => { obj.acheteurId = value; } }, metadata: _metadata }, _acheteurId_initializers, _acheteurId_extraInitializers);
        __esDecorate(null, null, _codepromotion_decorators, { kind: "field", name: "codepromotion", static: false, private: false, access: { has: obj => "codepromotion" in obj, get: obj => obj.codepromotion, set: (obj, value) => { obj.codepromotion = value; } }, metadata: _metadata }, _codepromotion_initializers, _codepromotion_extraInitializers);
        __esDecorate(null, null, _dateTransaction_decorators, { kind: "field", name: "dateTransaction", static: false, private: false, access: { has: obj => "dateTransaction" in obj, get: obj => obj.dateTransaction, set: (obj, value) => { obj.dateTransaction = value; } }, metadata: _metadata }, _dateTransaction_initializers, _dateTransaction_extraInitializers);
        __esDecorate(null, null, _montant_decorators, { kind: "field", name: "montant", static: false, private: false, access: { has: obj => "montant" in obj, get: obj => obj.montant, set: (obj, value) => { obj.montant = value; } }, metadata: _metadata }, _montant_initializers, _montant_extraInitializers);
        __esDecorate(null, null, _commission_decorators, { kind: "field", name: "commission", static: false, private: false, access: { has: obj => "commission" in obj, get: obj => obj.commission, set: (obj, value) => { obj.commission = value; } }, metadata: _metadata }, _commission_initializers, _commission_extraInitializers);
        __esDecorate(null, null, _jeu_decorators, { kind: "field", name: "jeu", static: false, private: false, access: { has: obj => "jeu" in obj, get: obj => obj.jeu, set: (obj, value) => { obj.jeu = value; } }, metadata: _metadata }, _jeu_initializers, _jeu_extraInitializers);
        __esDecorate(null, null, _vendeur_decorators, { kind: "field", name: "vendeur", static: false, private: false, access: { has: obj => "vendeur" in obj, get: obj => obj.vendeur, set: (obj, value) => { obj.vendeur = value; } }, metadata: _metadata }, _vendeur_initializers, _vendeur_extraInitializers);
        __esDecorate(null, null, _acheteur_decorators, { kind: "field", name: "acheteur", static: false, private: false, access: { has: obj => "acheteur" in obj, get: obj => obj.acheteur, set: (obj, value) => { obj.acheteur = value; } }, metadata: _metadata }, _acheteur_initializers, _acheteur_extraInitializers);
        __esDecorate(null, null, _codePromotion_decorators, { kind: "field", name: "codePromotion", static: false, private: false, access: { has: obj => "codePromotion" in obj, get: obj => obj.codePromotion, set: (obj, value) => { obj.codePromotion = value; } }, metadata: _metadata }, _codePromotion_initializers, _codePromotion_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Achat = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Achat = _classThis;
})();
exports.default = Achat;
