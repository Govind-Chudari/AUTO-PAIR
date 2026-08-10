const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const serviceCategories = [
  { name: 'Engine Repair', description: 'Engine diagnostics, tuning, and overhaul', iconUrl: '🔧' },
  { name: 'Brakes', description: 'Brake pad replacement, disc repair, brake fluid', iconUrl: '🛑' },
  { name: 'Tires & Wheels', description: 'Tire replacement, puncture repair, wheel alignment', iconUrl: '🛞' },
  { name: 'Electrical', description: 'Wiring, lights, horn, starter motor, alternator', iconUrl: '⚡' },
  { name: 'Body & Paint', description: 'Dent removal, scratch repair, full body painting', iconUrl: '🎨' },
  { name: 'Oil & Fluids', description: 'Oil change, coolant, transmission fluid', iconUrl: '🛢️' },
  { name: 'Suspension', description: 'Shock absorbers, struts, springs', iconUrl: '🔩' },
  { name: 'Transmission', description: 'Clutch repair, gear issues, transmission overhaul', iconUrl: '⚙️' },
  { name: 'Battery', description: 'Battery replacement, charging issues, jumpstart', iconUrl: '🔋' },
  { name: 'General Service', description: 'Regular maintenance, checkup, tune-up', iconUrl: '🔍' },
  { name: 'Accident Repair', description: 'Collision repair, frame straightening, insurance work', iconUrl: '💥' },
  { name: 'AC & Cooling', description: 'AC gas refill, compressor, radiator repair', iconUrl: '❄️' },
  { name: 'Exhaust System', description: 'Silencer, catalytic converter, exhaust pipe', iconUrl: '💨' },
  { name: 'Fuel System', description: 'Carburetor, fuel injector, fuel pump', iconUrl: '⛽' },
  { name: 'Towing', description: 'Roadside towing and emergency recovery', iconUrl: '🚛' },
];

async function main() {
  console.log('🌱 Seeding database...\n');

  // Seed service categories
  console.log('📂 Creating service categories...');
  for (const category of serviceCategories) {
    await prisma.serviceCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }
  console.log(`   ✅ ${serviceCategories.length} categories created.\n`);

  // Create admin user
  console.log('👑 Creating admin user...');
  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash('admin123', salt);

  await prisma.user.upsert({
    where: { email: 'admin@autopair.com' },
    update: {},
    create: {
      fullName: 'Auto-Pair Admin',
      email: 'admin@autopair.com',
      phone: '9999999999',
      passwordHash,
      role: 'admin',
      isVerified: true,
    },
  });
  console.log('   ✅ Admin user created (admin@autopair.com / admin123)\n');

  console.log('🎉 Seeding complete!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
