const prisma = require("./prismaClient");

exports.handler = async function (event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers };

  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const duration = Date.now() - start;
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, db: "ok", jwt: !!process.env.JWT_SECRET, duration }),
    };
  } catch (err) {
    console.error("health error", err);
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: "DB check failed" }) };
  }
};
