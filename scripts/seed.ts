import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@salon.com' },
    update: {},
    create: {
      email: 'demo@salon.com',
      password: hashedPassword,
      name: 'Demo User',
      role: 'salon',
    },
  });

  console.log('✅ Created user:', user.email);

  // Create demo salon
  const salon = await prisma.salon.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      name: 'Demo Salon',
      slug: 'demo',
      status: 'active',
      type: 'barbershop',
      services: 'both',
      credits: 50,
      userId: user.id,
    },
  });

  console.log('✅ Created salon:', salon.name, '- Credits:', salon.credits);
  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
