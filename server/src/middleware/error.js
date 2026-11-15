export function notFound(req, res) {
  res.status(404).json({ error: 'Not found' });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    const label = field === 'username' ? 'Username' : 'Name';
    return res.status(409).json({ error: `${label} already exists` });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const status = err.status || 500;
  if (status >= 500) console.error(err);

  return res.status(status).json({
    error: status >= 500 ? 'Something went wrong' : err.message,
    ...(err.issues ? { issues: err.issues } : {}),
    ...(err.extra || {}),
  });
}
