const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const hashed = bcrypt.hashSync('123', 10);
  const user = await prisma.user.upsert({
    where: { username: 'User' },
    update: { password: hashed, weight: 70.0, height: 175.0 },
    create: { username: 'User', password: hashed, weight: 70.0, height: 175.0 },
  });
  console.log('Seeded user:', user.username);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
