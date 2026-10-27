import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

/**
 * Singleton PrismaClient instance to prevent multiple client instances in development.
 */
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
