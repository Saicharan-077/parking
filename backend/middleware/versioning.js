function apiVersioning(req, res, next) {
  const versionFromUrl = req.path.match(/^\/api\/v(\d+)\//);
  req.apiVersion = versionFromUrl ? versionFromUrl[1] : '1';
  
  if (!['1'].includes(req.apiVersion)) {
    return res.status(400).json({ error: 'Unsupported API version' });
  }
  
  next();
}

module.exports = { apiVersioning };