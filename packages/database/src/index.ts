import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export * from '@prisma/client'

export function normalizePhone(phone: string): string {
  if (!phone) return "";
  let normalized = phone.replace(/[\s\-\(\)]/g, '');
  if (normalized.startsWith('00')) normalized = '+' + normalized.slice(2);
  if (normalized.startsWith('0')) normalized = '+49' + normalized.slice(1);
  return normalized;
}

export * from './encryption';
export * from './loyalty';