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
const vendeur_1 = __importDefault(require("./vendeur"));
const jeu_1 = __importDefault(require("./jeu"));
const session_1 = __importDefault(require("./session"));
let Depot = (() => {
    let _classDecorators = [sequelize_typescript_1.Table];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = sequelize_typescript_1.Model;
    let _vendeurId_decorators;
    let _vendeurId_initializers = [];
    let _vendeurId_extraInitializers = [];
    let _sessionId_decorators;
    let _sessionId_initializers = [];
    let _sessionId_extraInitializers = [];
    let _fraisDepot_decorators;
    let _fraisDepot_initializers = [];
    let _fraisDepot_extraInitializers = [];
    let _dateDepot_decorators;
    let _dateDepot_initializers = [];
    let _dateDepot_extraInitializers = [];
    let _vendeur_decorators;
    let _vendeur_initializers = [];
    let _vendeur_extraInitializers = [];
    let _session_decorators;
    let _session_initializers = [];
    let _session_extraInitializers = [];
    let _jeux_decorators;
    let _jeux_initializers = [];
    let _jeux_extraInitializers = [];
    var Depot = _classThis = class extends _classSuper {
        constructor() {
            super(...arguments);
            this.vendeurId = __runInitializers(this, _vendeurId_initializers, void 0);
            this.sessionId = (__runInitializers(this, _vendeurId_extraInitializers), __runInitializers(this, _sessionId_initializers, void 0));
            this.fraisDepot = (__runInitializers(this, _sessionId_extraInitializers), __runInitializers(this, _fraisDepot_initializers, void 0));
            this.dateDepot = (__runInitializers(this, _fraisDepot_extraInitializers), __runInitializers(this, _dateDepot_initializers, void 0));
            this.vendeur = (__runInitializers(this, _dateDepot_extraInitializers), __runInitializers(this, _vendeur_initializers, void 0));
            this.session = (__runInitializers(this, _vendeur_extraInitializers), __runInitializers(this, _session_initializers, void 0));
            this.jeux = (__runInitializers(this, _session_extraInitializers), __runInitializers(this, _jeux_initializers, void 0));
            __runInitializers(this, _jeux_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "Depot");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        _vendeurId_decorators = [(0, sequelize_typescript_1.ForeignKey)(() => vendeur_1.default), (0, sequelize_typescript_1.Column)({
                type: sequelize_typescript_1.DataType.INTEGER, // Correction ici
                allowNull: false,
            })];
        _sessionId_decorators = [(0, sequelize_typescript_1.ForeignKey)(() => session_1.default), (0, sequelize_typescript_1.Column)({
                type: sequelize_typescript_1.DataType.INTEGER, // Correction ici
                allowNull: false,
            })];
        _fraisDepot_decorators = [(0, sequelize_typescript_1.Column)({
                type: sequelize_typescript_1.DataType.FLOAT,
                allowNull: false,
            })];
        _dateDepot_decorators = [(0, sequelize_typescript_1.Column)({
                type: sequelize_typescript_1.DataType.DATE,
                allowNull: false,
            })];
        _vendeur_decorators = [(0, sequelize_typescript_1.BelongsTo)(() => vendeur_1.default)];
        _session_decorators = [(0, sequelize_typescript_1.BelongsTo)(() => session_1.default)];
        _jeux_decorators = [(0, sequelize_typescript_1.HasMany)(() => jeu_1.default)];
        __esDecorate(null, null, _vendeurId_decorators, { kind: "field", name: "vendeurId", static: false, private: false, access: { has: obj => "vendeurId" in obj, get: obj => obj.vendeurId, set: (obj, value) => { obj.vendeurId = value; } }, metadata: _metadata }, _vendeurId_initializers, _vendeurId_extraInitializers);
        __esDecorate(null, null, _sessionId_decorators, { kind: "field", name: "sessionId", static: false, private: false, access: { has: obj => "sessionId" in obj, get: obj => obj.sessionId, set: (obj, value) => { obj.sessionId = value; } }, metadata: _metadata }, _sessionId_initializers, _sessionId_extraInitializers);
        __esDecorate(null, null, _fraisDepot_decorators, { kind: "field", name: "fraisDepot", static: false, private: false, access: { has: obj => "fraisDepot" in obj, get: obj => obj.fraisDepot, set: (obj, value) => { obj.fraisDepot = value; } }, metadata: _metadata }, _fraisDepot_initializers, _fraisDepot_extraInitializers);
        __esDecorate(null, null, _dateDepot_decorators, { kind: "field", name: "dateDepot", static: false, private: false, access: { has: obj => "dateDepot" in obj, get: obj => obj.dateDepot, set: (obj, value) => { obj.dateDepot = value; } }, metadata: _metadata }, _dateDepot_initializers, _dateDepot_extraInitializers);
        __esDecorate(null, null, _vendeur_decorators, { kind: "field", name: "vendeur", static: false, private: false, access: { has: obj => "vendeur" in obj, get: obj => obj.vendeur, set: (obj, value) => { obj.vendeur = value; } }, metadata: _metadata }, _vendeur_initializers, _vendeur_extraInitializers);
        __esDecorate(null, null, _session_decorators, { kind: "field", name: "session", static: false, private: false, access: { has: obj => "session" in obj, get: obj => obj.session, set: (obj, value) => { obj.session = value; } }, metadata: _metadata }, _session_initializers, _session_extraInitializers);
        __esDecorate(null, null, _jeux_decorators, { kind: "field", name: "jeux", static: false, private: false, access: { has: obj => "jeux" in obj, get: obj => obj.jeux, set: (obj, value) => { obj.jeux = value; } }, metadata: _metadata }, _jeux_initializers, _jeux_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Depot = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Depot = _classThis;
})();
exports.default = Depot;
