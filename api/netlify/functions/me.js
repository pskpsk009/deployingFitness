const prisma = require("./prismaClient");
const jwt = require("jsonwebtoken");

exports.handler = async function (event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers };
  if (event.httpMethod !== "GET")
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };

  try {
    const auth = event.headers.authorization || event.headers.Authorization;
    if (!auth || !auth.startsWith("Bearer "))
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: "Missing token" }),
      };
    const token = auth.split(" ")[1];
    const secret = process.env.JWT_SECRET || "dev-secret";
    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch (err) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: "Invalid token" }),
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user)
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "User not found" }),
      };
    const { password, ...safe } = user;
    return { statusCode: 200, headers, body: JSON.stringify({ user: safe }) };
  } catch (err) {
    console.error("me error", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Server error" }),
    };
  }
};
