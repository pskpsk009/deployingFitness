const prisma = require('./prismaClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.handler = async function (event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { username, password } = body;
    if (!username || !password) return { statusCode: 400, headers, body: JSON.stringify({ error: 'username and password required' }) };

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid credentials' }) };

    const ok = bcrypt.compareSync(password, user.password);
    if (!ok) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid credentials' }) };

    const secret = process.env.JWT_SECRET || 'dev-secret';
    const token = jwt.sign({ userId: user.id, username: user.username }, secret, { expiresIn: '7d' });
    return { statusCode: 200, headers, body: JSON.stringify({ token }) };
  } catch (err) {
    console.error('login error', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error' }) };
  }
};
