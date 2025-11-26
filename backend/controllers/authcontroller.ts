import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_change_me_NOW'; 

const generateToken = (userId: number, email: string) => {
    return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '1d' }); 
};

export const registerUser = async (req: Request, res: Response) => {
    const { email, password, username } = req.body;
    
    if (!email || !password || !username) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists. Please Login." });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: { email, password: hashedPassword, username }
        });
        
        return res.json({ success: true, message: "Registration Successful! Please Login." });

    } catch (error) {
        return res.status(500).json({ message: "Server Error during registration." });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: "Email and Password required" });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        
        if (!user) {
            return res.status(401).json({ message: "User not found. Please Register." });
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password." });
        }

        const token = generateToken(user.id, user.email);

        return res.json({ 
            success: true, 
            token: token, 
            user: { email: user.email, username: user.username || "User" } 
        });

    } catch (error) {
        return res.status(500).json({ message: "Server Error during login." });
    }
};

export const socialLoginUser = async (req: Request, res: Response) => {
    const { email, displayName } = req.body; 

    if (!email) {
        return res.status(400).json({ message: "Email required" });
    }

    try {
        let user = await prisma.user.findUnique({ where: { email } });
        let isNewUser = false;
        
        if (!user) {
            const hashedPassword = await bcrypt.hash("SOCIAL_LOGIN_USER_PASS", 10);
            const finalUsername = displayName || email.split('@')[0];
            
            user = await prisma.user.create({
                data: { email: email, password: hashedPassword, username: finalUsername }
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

    } catch (error) {
        return res.status(500).json({ message: "Server Error during social login." });
    }
};