/**
 * Structured logging utility for production observability
 * Outputs JSON lines for aggregation in production
 */

interface LogContext {
  [key: string]: unknown
}

const isDevelopment = process.env.NODE_ENV === 'development'

function formatLog(level: string, message: string, context?: LogContext) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context || {}),
  }

  if (isDevelopment) {
    // Pretty print in development
    console.log(`[${level}] ${message}`, context || '')
  } else {
    // JSON lines in production
    console.log(JSON.stringify(logEntry))
  }
}

export const logger = {
  info: (message: string, context?: LogContext) => {
    formatLog('INFO', message, context)
  },

  warn: (message: string, context?: LogContext) => {
    formatLog('WARN', message, context)
  },

  error: (message: string, context?: LogContext) => {
    formatLog('ERROR', message, context)
  },

  debug: (message: string, context?: LogContext) => {
    if (isDevelopment) {
      formatLog('DEBUG', message, context)
    }
  },
}

export function getRequestId(headers: Headers | null): string | undefined {
  return headers?.get('x-request-id') ?? undefined
}
