const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123', 10);
  
  // This will delete the old one and create a fresh one
  await prisma.user.deleteMany({ where: { email: 'admin@dairy.com' } });

  const user = await prisma.user.create({
    data: {
      name: 'Sumit Admin',
      email: 'admin@dairy.com',
      password: hashedPassword,
      role: 'OWNER'
    },
  });

  console.log("✅ User created successfully!");
  console.log("Email: admin@dairy.com");
  console.log("Password: 123");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());