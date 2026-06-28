import { PrismaClient } from '@prisma/client';
import { normalizePhone, calculateLoyaltyTier } from './packages/database/src/index';

const prisma = new PrismaClient();

async function run() {
  console.log("1. Normalizing phone: ' 017 123 4567 ' =>", normalizePhone(" 017 123 4567 "));
  console.log("1. Normalizing phone: '0049 171234567' =>", normalizePhone("0049 171234567"));

  // Create a customer with spaces
  const phoneInput = "017 123 4567";
  const normalizedPhone = normalizePhone(phoneInput);

  let customer = await prisma.customer.upsert({
    where: { phone: normalizedPhone },
    update: { email: "old@test.com" },
    create: {
      phone: normalizedPhone,
      firstName: "Test",
      lastName: "User",
      email: "old@test.com"
    }
  });

  console.log("Customer created/found:", customer.id, customer.email);

  // Return visit, change email
  customer = await prisma.customer.upsert({
    where: { phone: normalizePhone("0171234567") }, // without spaces
    update: { email: "new@test.com" },
    create: {
      phone: normalizePhone("0171234567"),
      firstName: "Test",
      lastName: "User",
      email: "new@test.com"
    }
  });

  console.log("Customer updated email:", customer.email);

  // Check repair count logic
  const repairCount = await prisma.repair.count({ where: { customerId: customer.id } });
  
  const updatedCustomer = await prisma.customer.update({
    where: { id: customer.id },
    data: {
      totalRepairs: repairCount + 1,
      loyaltyTier: calculateLoyaltyTier(repairCount + 1)
    }
  });

  console.log("Customer totalRepairs incremented:", updatedCustomer.totalRepairs);
  console.log("Customer loyaltyTier:", updatedCustomer.loyaltyTier);

  console.log("SUCCESS");
}

run().catch(console.error).finally(() => prisma.$disconnect());
