import { PrismaClient, Role, RecordType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const categories = [
  'Salary', 'Freelance', 'Investment', 'Rent', 'Utilities',
  'Groceries', 'Transport', 'Healthcare', 'Entertainment', 'Education',
];

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomAmount(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

async function main() {
  console.log('🌱 Starting seed...');

  await prisma.financialRecord.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('Password123!', 12);

  // Create users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@finboard.com',
      password: hashedPassword,
      firstName: 'Alice',
      lastName: 'Admin',
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const analyst = await prisma.user.create({
    data: {
      email: 'analyst@finboard.com',
      password: hashedPassword,
      firstName: 'Bob',
      lastName: 'Analyst',
      role: Role.ANALYST,
      isActive: true,
    },
  });

  const viewer = await prisma.user.create({
    data: {
      email: 'viewer@finboard.com',
      password: hashedPassword,
      firstName: 'Carol',
      lastName: 'Viewer',
      role: Role.VIEWER,
      isActive: true,
    },
  });

  console.log('✅ Users created:', { admin: admin.email, analyst: analyst.email, viewer: viewer.email });

  // Create financial records for the past 12 months
  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
  const records = [];

  const users = [admin, analyst, viewer];

  for (const user of users) {
    // 50 records per user
    for (let i = 0; i < 50; i++) {
      const type = Math.random() > 0.4 ? RecordType.EXPENSE : RecordType.INCOME;
      const category = categories[Math.floor(Math.random() * categories.length)];
      const amount = type === RecordType.INCOME
        ? randomAmount(500, 8000)
        : randomAmount(10, 2000);

      records.push({
        userId: user.id,
        amount,
        type,
        category,
        date: randomDate(twelveMonthsAgo, now),
        notes: `${type === RecordType.INCOME ? 'Income' : 'Expense'} - ${category} transaction`,
      });
    }
  }

  await prisma.financialRecord.createMany({ data: records });
  console.log(`✅ Created ${records.length} financial records`);

  console.log('\n🎉 Seed complete!');
  console.log('\n📝 Demo Credentials:');
  console.log('  Admin:    admin@finboard.com   / Password123!');
  console.log('  Analyst:  analyst@finboard.com / Password123!');
  console.log('  Viewer:   viewer@finboard.com  / Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
