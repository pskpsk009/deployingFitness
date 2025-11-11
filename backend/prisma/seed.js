const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { username: 'User' },
    update: {},
    create: {
      username: 'User',
      password: '123', // Default plaintext password (matches existing seed)
      weight: 70,
      height: 170,
    },
  });
  console.log('Seeded user:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
