import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
 
import bcrypt from 'bcryptjs';
import { loginUser, registerUser, socialLoginUser } from './controllers/authcontroller';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); 


async function seedDatabase() {
  try {
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123';
    
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10); 
    
    await prisma.user.upsert({
      where: { email: ADMIN_EMAIL },
      update: {}, 
      create: { email: ADMIN_EMAIL, password: hashedPassword, username: "Admin" },
    });
    console.log(`✅ Admin Account Ready (Password Hashed).`);

    const count = await prisma.workflow.count();
    if (count === 0) {
      console.log("🌱 Seeding Public Workflows...");
      await prisma.workflow.createMany({
        data: [
          { id: "wf001", name: "Daily ETL Pipeline (Public)", tags: ["etl"], status: "Running", owner: ADMIN_EMAIL, runs: ["success"], schedule: "Daily", nextRun: "Tomorrow", isPublic: true },
          { id: "wf002", name: "Weekly Sync (Public)", tags: ["sql"], status: "Paused", owner: ADMIN_EMAIL, runs: ["success"], schedule: "Weekly", nextRun: "Next Week", isPublic: true }
        ]
      });
       console.log("✅ Public Workflows Seeded.");
    }
  } catch (error) {
    console.error("Seed Error:", error);
  }
}
seedDatabase();


app.post('/api/register', registerUser);
app.post('/api/login', loginUser);
app.post('/api/auth/social', socialLoginUser); 

// 2. WORKFLOW MANAGEMENT ROUTES
app.put('/api/workflows/:id/status', async (req: any, res: any) => {
    const { id } = req.params;
    const { newStatus } = req.body;
    
    if (!newStatus || (newStatus !== 'Running' && newStatus !== 'Paused')) {
        return res.status(400).json({ message: "Invalid status provided." });
    }

    try {
        const result = await prisma.workflow.updateMany({
            where: { id: id },
            data: { status: newStatus }
        });
        
        if (result.count > 0) {
            const updatedWorkflow = await prisma.workflow.findUnique({ where: { id } });
            return res.json(updatedWorkflow);
        }
        
        return res.status(404).json({ message: "Workflow ID not found to update." });

    } catch (error: any) {
        console.error(" DB/Internal Error on PUT:", error);
        return res.status(500).json({ 
            message: "Error updating workflow status. Check server logs."
        });
    }
});

app.post('/api/workflows', async (req: any, res: any) => {
    const { name, owner, schedule, status, userEmail, tags } = req.body; 
    
    if (!name || !userEmail) return res.status(400).json({ message: "Name and User Email (Creator) are required" });

    try {
        const newWorkflow = await prisma.workflow.create({
            data: { id: `wf-${Date.now()}`, name, owner: userEmail, status: status || "Running", schedule: schedule || "* * * * *", tags: tags, runs: ["pending"], nextRun: "Tomorrow", isPublic: false }
        });
        return res.json(newWorkflow);
    } catch (error) {
        return res.status(500).json({ message: "Database Error" });
    }
});

app.get('/api/workflows', async (req, res) => {
    const userEmail = req.query.userEmail as string; 
    if (!userEmail) return res.status(400).json({ error: "User email is required for fetching workflows." });
    
    try {
        const workflows = await prisma.workflow.findMany({
            where: { OR: [{ isPublic: true }, { owner: userEmail }] }
        });
        return res.json(workflows);
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch workflows." });
    }
});


app.post('/api/forgot-password', async (req: any, res: any) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });
    return res.json({ message: `Reset link sent to ${email}` });
});


app.listen(port, () => {
    console.log(` Server running on http://localhost:${port}`);
});