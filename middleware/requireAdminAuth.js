const { verifyJwt } = require('../utils/authCrypto');

/**
 * Bearer token auth for admin panel.
 * Expects: Authorization: Bearer <token>
 */
exports.requireAdminAuth = (req, res, next) => {
  try {
    const auth = req.headers.authorization || '';
    const match = auth.match(/^Bearer\s+(.+)$/i);
    if (!match) return res.status(401).json({ error: 'Missing Authorization Bearer token' });

    const token = match[1];
    const payload = verifyJwt(token, process.env.ADMIN_JWT_SECRET);
    req.admin = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: err.message || 'Unauthorized' });
  }
};

