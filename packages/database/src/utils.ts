import { PrismaClient } from '@prisma/client';

export const createPrismaClient = (databaseUrl: string) => {
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: ['query', 'info', 'warn', 'error'],
  });
};

export const connectDatabase = async (prisma: PrismaClient) => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

export const disconnectDatabase = async (prisma: PrismaClient) => {
  try {
    await prisma.$disconnect();
    console.log('Database disconnected successfully');
  } catch (error) {
    console.error('Database disconnection failed:', error);
    throw error;
  }
};
