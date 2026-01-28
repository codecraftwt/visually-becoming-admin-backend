const { db } = require('../config/firebase');
const { hashPassword, verifyPassword, signJwt } = require('../utils/authCrypto');

const COLLECTION = 'admin_visually_becoming_user';

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

async function findUserByEmail(email) {
  const snapshot = await db
    .collection(COLLECTION)
    .where('email', '==', email)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

exports.signup = async (req, res, next) => {
  try {
    const bootstrapKey = req.headers['x-admin-bootstrap-key'];
    if (!process.env.ADMIN_BOOTSTRAP_KEY) {
      return res.status(500).json({ error: 'Missing ADMIN_BOOTSTRAP_KEY on server' });
    }
    if (!bootstrapKey || bootstrapKey !== process.env.ADMIN_BOOTSTRAP_KEY) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!email) return res.status(400).json({ error: 'Email is required' });

    const existing = await findUserByEmail(email);
    if (existing) return res.status(409).json({ error: 'User already exists' });

    const { salt, hash } = hashPassword(password);

    const docRef = await db.collection(COLLECTION).add({
      email,
      passwordSalt: salt,
      passwordHash: hash,
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({ id: docRef.id, email });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const ok = verifyPassword(password, { salt: user.passwordSalt, hash: user.passwordHash });
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

    const token = signJwt(
      { sub: user.id, email: user.email, role: 'admin' },
      process.env.ADMIN_JWT_SECRET,
      { expiresInSeconds: 60 * 60 * 24 * 7 } // 7 days
    );

    return res.json({
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res) => {
  // req.admin is set by requireAdminAuth middleware
  return res.json({ admin: req.admin });
};

