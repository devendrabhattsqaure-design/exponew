const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seedSuperAdmin() {
  const email = 'superadmin@turf.com';
  const password = 'superpassword123';
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const admin = await prisma.adminPanelUser.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password: hashedPassword,
        name: 'Super Admin',
        role: 'SUPER_ADMIN'
      }
    });
    console.log('✅ Super Admin created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
  } catch (e) {
    console.error('Error seeding Super Admin:', e);
  } finally {
    await prisma.$disconnect();
  }
}

seedSuperAdmin();
