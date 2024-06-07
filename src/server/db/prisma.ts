// ===========================================================================
// Prisma Client (Wraps around DB connection on its own)
// ===========================================================================
import { PrismaClient } from '@prisma/client';

/**
 * This is the prisma client. Only created for Lucia because it has the easiest adapter for it.
 * I'd rather not create another basic libsql client just for the Lucia adapter.
 */
export const prisma = new PrismaClient();
