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
exports.socialLoginUser = exports.loginUser = exports.registerUser = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_change_me_NOW';
const generateToken = (userId, email) => {
    return jsonwebtoken_1.default.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '1d' });
};
// 1. REGISTER
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        const existingUser = yield prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists. Please Login." });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const newUser = yield prisma.user.create({
            data: { email, password: hashedPassword, username }
        });
        return res.json({ success: true, message: "Registration Successful! Please Login." });
    }
    catch (error) {
        return res.status(500).json({ message: "Server Error during registration." });
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and Password required" });
    }
    try {
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "User not found. Please Register." });
        }
        const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password." });
        }
        const token = generateToken(user.id, user.email);
        return res.json({
            success: true,
            token: token,
            user: { email: user.email, username: user.username || "User" }
        });
    }
    catch (error) {
        return res.status(500).json({ message: "Server Error during login." });
    }
});
exports.loginUser = loginUser;
// 3. SOCIAL LOGIN 
const socialLoginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, displayName } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email required" });
    }
    try {
        let user = yield prisma.user.findUnique({ where: { email } });
        let isNewUser = false;
        if (!user) {
            const finalUsername = displayName || email.split('@')[0] || `user_${Math.random().toString(36).substring(7)}`;
            const hashedPassword = yield bcryptjs_1.default.hash("SOCIAL_LOGIN_USER_PASS", 10);
            user = yield prisma.user.create({
                data: {
                    email: email,
                    password: hashedPassword,
                    username: finalUsername
                }
            });
            isNewUser = true;
        }
        const token = generateToken(user.id, user.email);
        return res.json({
            success: true,
            token: token,
            isNewUser: isNewUser,
            user: { email: user.email, username: user.username || "User" }
        });
    }
    catch (error) {
        console.error("❌ SOCIAL LOGIN 500 ERROR:", error);
        return res.status(500).json({ message: "Server Error: Could not process social login. Check DB logs." });
    }
});
exports.socialLoginUser = socialLoginUser;
