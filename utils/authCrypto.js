const crypto = require('crypto');

function base64url(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input));
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function signJwt(payload, secret, { expiresInSeconds } = {}) {
  if (!secret) throw new Error('Missing ADMIN_JWT_SECRET');

  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    iat: now,
    ...(expiresInSeconds ? { exp: now + expiresInSeconds } : {}),
    ...payload,
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(fullPayload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', secret)
    .update(signingInput)
    .digest();

  return `${signingInput}.${base64url(signature)}`;
}

function verifyJwt(token, secret) {
  if (!secret) throw new Error('Missing ADMIN_JWT_SECRET');
  if (!token || typeof token !== 'string') throw new Error('Missing token');

  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token format');

  const [encodedHeader, encodedPayload, encodedSig] = parts;
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(signingInput)
    .digest();

  const expectedSigB64 = base64url(expectedSig);
  if (!crypto.timingSafeEqual(Buffer.from(expectedSigB64), Buffer.from(encodedSig))) {
    throw new Error('Invalid token signature');
  }

  const payloadJson = Buffer.from(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
  const payload = JSON.parse(payloadJson);

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && now >= payload.exp) throw new Error('Token expired');

  return payload;
}

function hashPassword(password) {
  if (typeof password !== 'string' || password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return {
    salt,
    hash: derivedKey.toString('hex'),
  };
}

function verifyPassword(password, { salt, hash }) {
  if (!salt || !hash) return false;
  const derivedKey = crypto.scryptSync(String(password), String(salt), 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(derivedKey, 'utf8'), Buffer.from(String(hash), 'utf8'));
}

module.exports = {
  signJwt,
  verifyJwt,
  hashPassword,
  verifyPassword,
};

