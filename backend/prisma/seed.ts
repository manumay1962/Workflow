// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

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

    const count = await prisma.workflow.count();
    if (count === 0) {
      await prisma.workflow.createMany({
        data: [
          { id: "wf001", name: "Daily ETL Pipeline (Public)", tags: ["etl"], status: "Running", owner: ADMIN_EMAIL, runs: ["success"], schedule: "Daily", nextRun: "Tomorrow", isPublic: true },
          { id: "wf002", name: "Weekly Sync (Public)", tags: ["sql"], status: "Paused", owner: ADMIN_EMAIL, runs: ["success"], schedule: "Weekly", nextRun: "Next Week", isPublic: true }
        ]
      });
    }
    console.log("Seed completed!");
  } catch (error) {
    console.error("Seed Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
