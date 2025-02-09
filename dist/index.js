"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./server"));
const database_1 = __importDefault(require("./config/database"));
const PORT = Number(process.env.PORT) || 8000;
database_1.default.sync().then(() => {
    console.log('Database connected...');
    server_1.default.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
        console.log('Available routes:');
        console.log('- GET /');
        console.log('- GET /test');
        console.log('- GET /api/licences');
        // ... autres routes ...
    });
}).catch(err => {
    console.error('Failed to connect to the database:', err);
});
