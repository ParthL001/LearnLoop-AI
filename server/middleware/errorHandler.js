export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  })
}

export function errorHandler(err, req, res, next) {
  const statusCode = err.status || err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500)

  // Log error details for server diagnostics
  console.error(`[Error] ${req.method} ${req.originalUrl} - ${err.message}`)
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    console.error(err.stack)
  }

  // Sanitize message to strip internal filesystem paths
  let safeMessage = err.message || 'Internal Server Error'
  if (safeMessage.includes(':\\') || safeMessage.includes(':/') || safeMessage.includes('/')) {
    safeMessage = safeMessage.replace(/([A-Za-z]:\\[^ :]+)|(\/[^ :]+)/g, '[internal-path]')
  }

  res.status(statusCode).json({
    success: false,
    error: safeMessage,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
