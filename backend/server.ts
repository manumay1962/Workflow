// server.ts
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { loginUser, registerUser, socialLoginUser } from './controllers/authcontroller.js';


dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 5000;

// For __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(cors({
  origin: ['https://workflow-1-kq5k.onrender.com'], 
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
}));
app.use(express.json());


app.post('/api/register', registerUser);
app.post('/api/login', loginUser);
app.post('/api/auth/social', socialLoginUser);

app.put('/api/workflows/:id/status', async (req: any, res: any) => {
  const { id } = req.params;
  const { newStatus } = req.body;

  if (!newStatus || (newStatus !== 'Running' && newStatus !== 'Paused')) {
    return res.status(400).json({ message: "Invalid status provided." });
  }

  try {
    const result = await prisma.workflow.updateMany({
      where: { id },
      data: { status: newStatus },
    });

    if (result.count > 0) {
      const updatedWorkflow = await prisma.workflow.findUnique({ where: { id } });
      return res.json(updatedWorkflow);
    }

    return res.status(404).json({ message: "Workflow ID not found to update." });
  } catch (error) {
    return res.status(500).json({ message: "Error updating workflow status. Check server logs." });
  }
});

app.post('/api/workflows', async (req: any, res: any) => {
  const { name, owner, schedule, status, userEmail, tags } = req.body;
  if (!name || !userEmail) return res.status(400).json({ message: "Name and User Email (Creator) are required" });

  try {
    const newWorkflow = await prisma.workflow.create({
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
  } catch (error) {
    return res.status(500).json({ message: "Database Error" });
  }
});

app.get('/api/workflows', async (req, res) => {
  const userEmail = req.query.userEmail as string;
  if (!userEmail) return res.status(400).json({ error: "User email is required for fetching workflows." });

  try {
    const workflows = await prisma.workflow.findMany({
      where: { OR: [{ isPublic: true }, { owner: userEmail }] },
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


app.use(express.static(path.join(__dirname, '../frontend/dist'))); // Adjust if your build folder is elsewhere

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});
