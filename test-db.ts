
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// Load .env manually since tsx might not load it automatically
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log('Loading .env file from:', envPath);
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      if (key && value && !key.startsWith('#')) {
        process.env[key] = value;
      }
    }
  });
}

async function main() {
  console.log('Testing Prisma connection...');
  console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
  
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL is missing');
    return;
  }

  // Re-create the client initialization logic from lib/prisma.ts to test exactly that
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();
    console.log('Successfully connected to database!');
    
    const count = await prisma.user.count();
    console.log('Current user count:', count);
    
    await prisma.$disconnect();
    console.log('Disconnected successfully.');
  } catch (error) {
    console.error('Connection failed:', error);
    process.exit(1);
  }
}

main();
