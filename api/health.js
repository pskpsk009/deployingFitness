const prisma = require("./prismaClient");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(204).end();

  const start = Date.now();
  try {
    // Simple DB ping
    await prisma.$queryRaw`SELECT 1`;
    const duration = Date.now() - start;
    return res.status(200).json({ ok: true, db: "ok", jwt: !!process.env.JWT_SECRET, duration });
  } catch (err) {
    console.error("health error", err);
    return res.status(500).json({ ok: false, error: "DB check failed" });
  }
};
