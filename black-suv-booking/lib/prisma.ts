import { PrismaClient } from '@prisma/client';

/**
 * Instantiate a singleton Prisma client. During development, Next.js
 * may run hot reloads which cause the module to be evaluated multiple
 * times. The global scope is used to persist the Prisma instance
 * across module reloads so that only one connection is established.
 */
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;