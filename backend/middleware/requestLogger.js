function requestLogger(req, res, next) {
  try {
    const auth = req.headers.authorization || req.headers.Authorization || '';
    const tokenPresent = auth.startsWith('Bearer ');
    console.log(`REQ ${req.method} ${req.originalUrl} query.sede=${req.query.sede || ''} token=${tokenPresent}`);
  } catch (e) {
    // ignore
  }
  next();
}

module.exports = requestLogger;
