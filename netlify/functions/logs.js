const prisma = require('./prismaClient');
const jwt = require('jsonwebtoken');

exports.handler = async function (event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };

  try {
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {};
      const { username } = params;
      if (!username) return { statusCode: 400, headers, body: JSON.stringify({ error: 'username query required' }) };
      const user = await prisma.user.findUnique({ where: { username } });
      if (!user) return { statusCode: 404, headers, body: JSON.stringify({ error: 'User not found' }) };
      const logs = await prisma.log.findMany({ where: { userId: user.id }, orderBy: { timestamp: 'desc' } });
      return { statusCode: 200, headers, body: JSON.stringify({ logs }) };
    }

    if (event.httpMethod === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      const { type, value } = body;

      let userId = null;
      const auth = event.headers.authorization || event.headers.Authorization;
      if (auth && auth.startsWith('Bearer ')) {
        try { const payload = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET || 'dev-secret'); userId = payload.userId; } catch (e) { }
      }

      if (!userId) {
        if (!body.username) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Authentication required' }) };
        const user = await prisma.user.findUnique({ where: { username: body.username } });
        if (!user) return { statusCode: 404, headers, body: JSON.stringify({ error: 'User not found' }) };
        userId = user.id;
      }

      const log = await prisma.log.create({ data: { userId, type: type || 'exercise', value: value || '' } });
      return { statusCode: 201, headers, body: JSON.stringify({ log }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    console.error('logs error', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error' }) };
  }
};
