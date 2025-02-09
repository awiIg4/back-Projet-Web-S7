"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./server"));
const database_1 = __importDefault(require("./config/database"));
const PORT = Number(process.env.PORT) || 8000;
async function startServer() {
    try {
        console.log('🔄 Connecting to database...');
        await database_1.default.authenticate();
        console.log('✅ Database connected.');
        server_1.default.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
// Gestion des signaux de fermeture Heroku
process.on('SIGTERM', () => {
    console.log('🔻 SIGTERM received. Closing server...');
    process.exit(0);
});
