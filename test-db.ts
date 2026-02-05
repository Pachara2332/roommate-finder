import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

async function main() {
  console.log('Testing Prisma connection...');
  console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
  
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL is missing');
    return;
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();
    console.log('Successfully connected to database!');
    
    const count = await prisma.user.count();
    console.log('Current user count:', count);
    
    await prisma.$disconnect();
    await pool.end();
    console.log('Disconnected successfully.');
  } catch (error) {
    console.error('Connection failed:', error);
    process.exit(1);
  }
}

main();
