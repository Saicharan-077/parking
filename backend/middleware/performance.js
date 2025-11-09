// Performance monitoring middleware
function performanceMonitor(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    };
    
    if (duration > 1000) {
      console.warn('Slow request:', logData);
    }
    
    req.logger?.info('Request completed', logData);
  });
  
  next();
}

module.exports = { performanceMonitor };