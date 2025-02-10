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
const jeu_1 = __importDefault(require("./jeu"));
const acheteur_1 = __importDefault(require("./acheteur"));
const codePromotion_1 = __importDefault(require("./codePromotion"));
let Achat = class Achat extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    }),
    __metadata("design:type", Number)
], Achat.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => jeu_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
    }),
    __metadata("design:type", Number)
], Achat.prototype, "jeu_id", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => jeu_1.default),
    __metadata("design:type", jeu_1.default)
], Achat.prototype, "jeu", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => acheteur_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true,
    }),
    __metadata("design:type", Number)
], Achat.prototype, "acheteur_id", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => acheteur_1.default),
    __metadata("design:type", acheteur_1.default)
], Achat.prototype, "acheteur", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
    }),
    __metadata("design:type", Date)
], Achat.prototype, "date_transaction", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL,
        allowNull: false,
    }),
    __metadata("design:type", Number)
], Achat.prototype, "commission", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => codePromotion_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Achat.prototype, "codePromotionLibele", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => codePromotion_1.default),
    __metadata("design:type", codePromotion_1.default)
], Achat.prototype, "codePromotion", void 0);
Achat = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'achats',
        timestamps: false,
    })
], Achat);
exports.default = Achat;
