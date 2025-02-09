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
const depot_1 = __importDefault(require("./depot"));
const licence_1 = __importDefault(require("./licence"));
let Jeu = class Jeu extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    }),
    __metadata("design:type", Number)
], Jeu.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => licence_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
    }),
    __metadata("design:type", Number)
], Jeu.prototype, "licence_id", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => licence_1.default, { as: 'licence' }),
    __metadata("design:type", licence_1.default)
], Jeu.prototype, "licence", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        allowNull: false,
    }),
    __metadata("design:type", Number)
], Jeu.prototype, "prix", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: false,
    }),
    __metadata("design:type", String)
], Jeu.prototype, "statut", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => depot_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
    }),
    __metadata("design:type", Number)
], Jeu.prototype, "depot_id", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => depot_1.default, { as: 'depot' }),
    __metadata("design:type", depot_1.default)
], Jeu.prototype, "depot", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], Jeu.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], Jeu.prototype, "updatedAt", void 0);
Jeu = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'jeux',
        timestamps: true,
    })
], Jeu);
exports.default = Jeu;
