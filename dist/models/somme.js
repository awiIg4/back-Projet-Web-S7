"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const utilisateur_1 = __importDefault(require("./utilisateur"));
const session_1 = __importDefault(require("./session"));
// Définir le modèle avec les interfaces
let Somme = class Somme extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    }),
    __metadata("design:type", Number)
], Somme.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => utilisateur_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
    }),
    __metadata("design:type", Number)
], Somme.prototype, "utilisateurId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => utilisateur_1.default),
    __metadata("design:type", utilisateur_1.default)
], Somme.prototype, "utilisateur", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => session_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
    }),
    __metadata("design:type", Number)
], Somme.prototype, "sessionId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => session_1.default),
    __metadata("design:type", session_1.default)
], Somme.prototype, "session", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL,
        allowNull: false,
    }),
    __metadata("design:type", Number)
], Somme.prototype, "sommedue", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL,
        allowNull: false,
    }),
    __metadata("design:type", Number)
], Somme.prototype, "sommegener\u00E9e", void 0);
Somme = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'sommes',
        timestamps: false,
    })
], Somme);
exports.default = Somme;
