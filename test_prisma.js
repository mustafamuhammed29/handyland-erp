const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const res = await prisma.repair.findMany({
      where: {
        OR: [
          { ticketNumber: { contains: 'kari', mode: 'insensitive' } },
          { customer: { firstName: { contains: 'kari', mode: 'insensitive' } } },
          { customer: { lastName: { contains: 'kari', mode: 'insensitive' } } },
          { customer: { phone: { contains: 'kari' } } },
        ]
      }
    });
    console.log(res);
  } catch(e) {
    console.error('PRISMA ERROR:', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
