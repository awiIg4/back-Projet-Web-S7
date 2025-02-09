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
const vendeur_1 = __importDefault(require("./vendeur"));
const jeu_1 = __importDefault(require("./jeu"));
const session_1 = __importDefault(require("./session"));
let Depot = class Depot extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    }),
    __metadata("design:type", Number)
], Depot.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => vendeur_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
    }),
    __metadata("design:type", Number)
], Depot.prototype, "vendeur_id", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => vendeur_1.default, { as: 'vendeur' }),
    __metadata("design:type", vendeur_1.default)
], Depot.prototype, "vendeur", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => session_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
    }),
    __metadata("design:type", Number)
], Depot.prototype, "session_id", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => session_1.default, { as: 'session' }),
    __metadata("design:type", session_1.default)
], Depot.prototype, "session", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        allowNull: false,
    }),
    __metadata("design:type", Number)
], Depot.prototype, "frais_depot", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
    }),
    __metadata("design:type", Date)
], Depot.prototype, "date_depot", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => jeu_1.default, { as: 'jeux', foreignKey: 'depot_id' }),
    __metadata("design:type", Array)
], Depot.prototype, "jeux", void 0);
Depot = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'depots',
        timestamps: false,
    })
], Depot);
exports.default = Depot;
