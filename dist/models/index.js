"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const database_1 = __importDefault(require("../config/database"));
const connectDB = async () => {
    try {
        await database_1.default.authenticate();
        console.log('Database connected...');
        await database_1.default.sync({ alter: true });
    }
    catch (err) {
        console.error('Unable to connect to the database:', err);
    }
};
exports.connectDB = connectDB;
