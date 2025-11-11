const { PrismaClient } = require('@prisma/client');

// Use a global variable to preserve the PrismaClient across warm invocations in serverless.
let prisma;
if (global.__prisma) {
  prisma = global.__prisma;
} else {
  prisma = new PrismaClient();
  global.__prisma = prisma;
}

module.exports = prisma;
