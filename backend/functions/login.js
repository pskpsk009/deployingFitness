const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const SECRET = process.env.SECRET_KEY || 'dev_secret';

exports.handler = async function (event) {
  try {
    const body = JSON.parse(event.body || '{}');
    const { username, password } = body;
    if (!username || !password) {
      return { statusCode: 400, body: JSON.stringify({ success: false, message: 'Missing credentials' }) };
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return { statusCode: 401, body: JSON.stringify({ success: false, message: 'Invalid username or password.' }) };
    }

    // Plaintext password check (matches existing seed). Replace with bcrypt in production.
    if (user.password !== password) {
      return { statusCode: 401, body: JSON.stringify({ success: false, message: 'Invalid username or password.' }) };
    }

    const token = jwt.sign({ username: user.username }, SECRET, { expiresIn: '7d' });
    return { statusCode: 200, body: JSON.stringify({ success: true, token }) };
  } catch (err) {
    console.error('Login error', err);
    return { statusCode: 500, body: JSON.stringify({ success: false, message: 'Internal error' }) };
  }
};
