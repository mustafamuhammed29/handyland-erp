import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@handyland.de';
  const existing = await prisma.staff.findUnique({ where: { email } });
  
  if (!existing) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.staff.create({
      data: {
        name: 'Admin',
        email,
        password: hashedPassword,
        role: 'OWNER',
        isActive: true,
      }
    });
    console.log('Created admin user: admin@handyland.de / admin123');
  } else {
    console.log('Admin user already exists.');
    // Ensure active and password reset for good measure
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.staff.update({
      where: { email },
      data: { isActive: true, password: hashedPassword }
    });
    console.log('Reset admin user password to: admin123');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
