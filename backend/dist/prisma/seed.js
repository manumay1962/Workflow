"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// prisma/seed.ts
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
function seedDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
            const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123';
            const hashedPassword = yield bcryptjs_1.default.hash(ADMIN_PASSWORD, 10);
            yield prisma.user.upsert({
                where: { email: ADMIN_EMAIL },
                update: {},
                create: { email: ADMIN_EMAIL, password: hashedPassword, username: "Admin" },
            });
            const count = yield prisma.workflow.count();
            if (count === 0) {
                yield prisma.workflow.createMany({
                    data: [
                        { id: "wf001", name: "Daily ETL Pipeline (Public)", tags: ["etl"], status: "Running", owner: ADMIN_EMAIL, runs: ["success"], schedule: "Daily", nextRun: "Tomorrow", isPublic: true },
                        { id: "wf002", name: "Weekly Sync (Public)", tags: ["sql"], status: "Paused", owner: ADMIN_EMAIL, runs: ["success"], schedule: "Weekly", nextRun: "Next Week", isPublic: true }
                    ]
                });
            }
            console.log("Seed completed!");
        }
        catch (error) {
            console.error("Seed Error:", error);
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
seedDatabase();
