const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const SECRET = process.env.SECRET_KEY || 'dev_secret';

exports.handler = async function (event) {
  try {
    const auth = event.headers?.authorization || '';
    const token = auth.replace('Bearer ', '');
    if (!token) return { statusCode: 401, body: JSON.stringify({ success: false, message: 'No token' }) };

    let payload;
    try {
      payload = jwt.verify(token, SECRET);
    } catch (e) {
      return { statusCode: 401, body: JSON.stringify({ success: false, message: 'Invalid token' }) };
    }

    const user = await prisma.user.findUnique({ where: { username: payload.username } });
    if (!user) return { statusCode: 404, body: JSON.stringify({ success: false, message: 'User not found' }) };

    return { statusCode: 200, body: JSON.stringify({ success: true, data: { username: user.username, weight: user.weight, height: user.height } }) };
  } catch (err) {
    console.error('Me error', err);
    return { statusCode: 500, body: JSON.stringify({ success: false, message: 'Internal error' }) };
  }
};
