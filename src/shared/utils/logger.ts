import { config, createLogger, format, transports } from 'winston'

const colors = {
  emerg: '\x1B[31m[EMERGENCY]\x1B[39m',
  alert: '\x1B[31m[ALERT]\x1B[39m',
  crit: '\x1B[31m[CRITICAL]\x1B[39m',
  error: '\x1B[31m[ERROR]\x1B[39m',
  warn: '\x1B[33m[WARNING]\x1B[39m',
  notice: '\x1B[34m[NOTICE]\x1B[39m',
  info: '\x1B[32m[INFO]\x1B[39m',
  debug: '\x1B[34m[DEBUG]\x1B[39m',
}

const colorize = format((info) => {
  info.level = colors[info.level as keyof typeof colors] || info.level

  return info
})

const customFormat = format.printf(({ level, message }) => {
  return `${level} ${message}`
})

const logger = createLogger({
  levels: config.syslog.levels,
  format: format.combine(format.timestamp(), format.json(), format.prettyPrint()),
  transports: [
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(colorize(), customFormat),
    }),
  )
}

export { logger }
