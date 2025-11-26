import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_change_me_NOW'; 

const generateToken = (userId: number, email: string) => {
    return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '1d' }); 
};

// ... (registerUser and loginUser are unchanged) ...

// 3. SOCIAL LOGIN (FIXED: Handles 500 DB Crash)
export const socialLoginUser = async (req: Request, res: Response) => {
    const { email, displayName } = req.body; 

    // Safety check: Frontend should handle this, but backend must be strict
    if (!email) {
        return res.status(400).json({ message: "Email required" });
    }

    try {
        let user = await prisma.user.findUnique({ where: { email } });
        let isNewUser = false;
        
        if (!user) {
            // FIX: Ensure username is NEVER null
            const finalUsername = displayName || email.split('@')[0] || 'UnknownUser'; 
            const hashedPassword = await bcrypt.hash("SOCIAL_LOGIN_USER_PASS", 10);
            
            user = await prisma.user.create({
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

    } catch (error) {
        // Log the specific error that caused 500
        console.error(" SOCIAL LOGIN 500 ERROR:", error);
        
        // Return a generic 500 message
        return res.status(500).json({ message: "Server Error: Could not process social login. Check DB logs." });
    }
};