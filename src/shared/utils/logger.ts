import { config, createLogger, format, transports } from 'winston'

import { NODE_ENV } from './constants.js'

// Define custom colors for log levels
const TEMPLATE_COLORS_FORMAT = {
  emerg: '\x1B[31m[TIMESTAMP][EMERGENCY][SERVICE]\x1B[39m',
  alert: '\x1B[31m[TIMESTAMP][ALERT][SERVICE]\x1B[39m',
  crit: '\x1B[31m[TIMESTAMP][CRITICAL][SERVICE]\x1B[39m',
  error: '\x1B[31m[TIMESTAMP][ERROR][SERVICE]\x1B[39m',
  warning: '\x1B[33m[TIMESTAMP][WARNING][SERVICE]\x1B[39m',
  notice: '\x1B[34m[TIMESTAMP][NOTICE][SERVICE]\x1B[39m',
  info: '\x1B[32m[TIMESTAMP][INFO][SERVICE]\x1B[39m',
  debug: '\x1B[34m[TIMESTAMP][DEBUG][SERVICE]\x1B[39m',
}

// Add colors to the log level
const colorize = format(info => {
  info.level =
    TEMPLATE_COLORS_FORMAT[info.level as keyof typeof TEMPLATE_COLORS_FORMAT] ||
    info.level

  return info
})

// Custom format for console output
const consoleFormat = format.printf(
  ({ level, message, timestamp: timeValue, service, metadata }) => {
    // Format: YYYY-MM-DD HH:mm:ss LEVEL[SERVICE] MESSAGE {METADATA}
    let serviceStatusFormatted = service
      ? level.replace('SERVICE', service?.toString() || 'App')
      : level.replace('[SERVICE]', '')

    serviceStatusFormatted = serviceStatusFormatted.replace(
      '[TIMESTAMP]',
      NODE_ENV !== 'production' ? '' : `[${timeValue}]`,
    )

    let output = `${serviceStatusFormatted}: ${message}`

    // Add metadata if it exists and isn't empty
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const metadataObj: any =
      metadata && typeof metadata === 'object' ? { ...metadata } : {}

    delete metadataObj.timestamp
    delete metadataObj.service
    delete metadataObj.level
    delete metadataObj.message

    const metadataStr = JSON.stringify(metadataObj)

    if (metadataStr !== '{}') {
      output += ` ${metadataStr}`
    }

    return output
  },
)

// Create logger instance
const logger = createLogger({
  // Use syslog levels
  levels: config.syslog.levels,

  // Set default metadata
  defaultMeta: { service: 'App' },

  format: format.combine(
    // Add timestamp to all log entries
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    // Handle errors and stack traces
    format.errors({ stack: true }),
    // Allow string interpolation
    format.splat(),
    // Convert to JSON format for file output
    format.json(),
  ),

  transports: [
    // Console Transport - Human readable format
    new transports.Console({
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        colorize(),
        consoleFormat,
      ),
    }),

    // Error Log File - JSON format
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: format.combine(format.timestamp(), format.json(), format.prettyPrint()),
    }),

    // Combined Log File - JSON format
    new transports.File({
      filename: 'logs/combined.log',
      format: format.combine(format.timestamp(), format.json(), format.prettyPrint()),
    }),
  ],
})

export { logger }
