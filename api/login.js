const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

module.exports = async (req, res) => {
  // Basic CORS for demo purposes; for production restrict origin.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body && Object.keys(req.body).length ? req.body : JSON.parse(req.rawBody || '{}');
    const { username, password } = body;

    if (!username || !password) {
      return res.status(400).json({ error: 'username and password required' });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const passwordMatches = bcrypt.compareSync(password, user.password);
    if (!passwordMatches) return res.status(401).json({ error: 'Invalid credentials' });

    const secret = process.env.JWT_SECRET || 'dev-secret';
    const token = jwt.sign({ userId: user.id, username: user.username }, secret, { expiresIn: '7d' });

    return res.json({ token });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ error: 'Server error' });
  } finally {
    // Do not disconnect here in serverless (keeps warm connections); Prisma handles it.
  }
};
