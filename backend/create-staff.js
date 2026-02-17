const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // 1. Hash the password "123"
  const hashedPassword = await bcrypt.hash('123', 10);

  // 2. Create the Staff User
  try {
      const user = await prisma.user.create({
        data: {
          name: 'Staff Member',
          email: 'staff@dairy.com',
          password: hashedPassword,
          role: 'STAFF' // <--- This sets the restricted permission
        },
      });
      console.log("✅ Staff User Created: staff@dairy.com / 123");
  } catch (e) {
      console.log("❌ Error: User might already exist.");
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());