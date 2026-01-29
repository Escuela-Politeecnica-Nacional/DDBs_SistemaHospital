const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_this';

function authMiddleware(req, res, next) {
  // Allow unauthenticated access to /api/auth
  if (req.path && req.path.startsWith('/auth')) return next();

  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, message: 'No token provided' });
  }
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // Attach sede to request for controllers to use
    req.sede = payload.sede;
    next();
  } catch (err) {
    console.error('authMiddleware error:', err);
    return res.status(401).json({ ok: false, message: 'Invalid token' });
  }
}

module.exports = authMiddleware;
