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
// server.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const authcontroller_1 = require("./controllers/authcontroller");
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const port = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// ----------------- AUTH ROUTES -----------------
app.post('/api/register', authcontroller_1.registerUser);
app.post('/api/login', authcontroller_1.loginUser);
app.post('/api/auth/social', authcontroller_1.socialLoginUser);
// ------------- WORKFLOW MANAGEMENT ROUTES -------------
app.put('/api/workflows/:id/status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { newStatus } = req.body;
    if (!newStatus || (newStatus !== 'Running' && newStatus !== 'Paused')) {
        return res.status(400).json({ message: "Invalid status provided." });
    }
    try {
        const result = yield prisma.workflow.updateMany({
            where: { id },
            data: { status: newStatus },
        });
        if (result.count > 0) {
            const updatedWorkflow = yield prisma.workflow.findUnique({ where: { id } });
            return res.json(updatedWorkflow);
        }
        return res.status(404).json({ message: "Workflow ID not found to update." });
    }
    catch (error) {
        return res.status(500).json({ message: "Error updating workflow status. Check server logs." });
    }
}));
app.post('/api/workflows', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, owner, schedule, status, userEmail, tags } = req.body;
    if (!name || !userEmail)
        return res.status(400).json({ message: "Name and User Email (Creator) are required" });
    try {
        const newWorkflow = yield prisma.workflow.create({
            data: {
                id: `wf-${Date.now()}`,
                name,
                owner: userEmail,
                status: status || "Running",
                schedule: schedule || "* * * * *",
                tags,
                runs: ["pending"],
                nextRun: "Tomorrow",
                isPublic: false,
            },
        });
        return res.json(newWorkflow);
    }
    catch (error) {
        return res.status(500).json({ message: "Database Error" });
    }
}));
app.get('/api/workflows', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userEmail = req.query.userEmail;
    if (!userEmail)
        return res.status(400).json({ error: "User email is required for fetching workflows." });
    try {
        const workflows = yield prisma.workflow.findMany({
            where: { OR: [{ isPublic: true }, { owner: userEmail }] },
        });
        return res.json(workflows);
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to fetch workflows." });
    }
}));
// ----------------- OTHER ROUTES -----------------
app.post('/api/forgot-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email)
        return res.status(400).json({ message: "Email required" });
    return res.json({ message: `Reset link sent to ${email}` });
}));
// ----------------- START SERVER -----------------
app.listen(port, () => {
    console.log(`🚀 Server listening on port ${port}`);
});
