const { PrismaClient } = require('@prisma/client');

// Singleton Prisma client for serverless functions
let prisma;
if (global.__prisma) {
  prisma = global.__prisma;
} else {
  prisma = new PrismaClient();
  global.__prisma = prisma;
}

module.exports = prisma;
