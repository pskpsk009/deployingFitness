const jwt = require('jsonwebtoken');
const prisma = require('./prismaClient');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { username } = req.query || {};
      if (!username) return res.status(400).json({ error: 'username query required' });
      const user = await prisma.user.findUnique({ where: { username } });
      if (!user) return res.status(404).json({ error: 'User not found' });
      const logs = await prisma.log.findMany({ where: { userId: user.id }, orderBy: { timestamp: 'desc' } });
      return res.json({ logs });
    }

    if (req.method === 'POST') {
      const body = req.body && Object.keys(req.body).length ? req.body : JSON.parse(req.rawBody || '{}');
      const { type, value } = body;

      // Prefer authenticated user via token
      let userId = null;
      const auth = req.headers.authorization || req.headers.Authorization;
      if (auth && auth.startsWith('Bearer ')) {
        try {
          const payload = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET || 'dev-secret');
          userId = payload.userId;
        } catch (e) {}
      }

      // If no token, allow username in body
      if (!userId) {
        if (!body.username) return res.status(401).json({ error: 'Authentication required' });
        const user = await prisma.user.findUnique({ where: { username: body.username } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        userId = user.id;
      }

      const log = await prisma.log.create({ data: { userId, type: type || 'exercise', value: value || '' } });
      return res.status(201).json({ log });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('logs error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
