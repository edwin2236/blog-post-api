import { config, createLogger, format, transports } from 'winston'

import { NODE_ENV } from './constants.js'

const TEMPLATE_COLORS_FORMAT = {
  emerg: '\x1B[31m[TIMESTAMP][Emergency][SERVICE]\x1B[39m',
  alert: '\x1B[31m[TIMESTAMP][Alert][SERVICE]\x1B[39m',
  crit: '\x1B[31m[TIMESTAMP][Critical][SERVICE]\x1B[39m',
  error: '\x1B[31m[TIMESTAMP][Error][SERVICE]\x1B[39m',
  warning: '\x1B[33m[TIMESTAMP][Warning][SERVICE]\x1B[39m',
  notice: '\x1B[34m[TIMESTAMP][Notice][SERVICE]\x1B[39m',
  info: '\x1B[32m[TIMESTAMP][Info][SERVICE]\x1B[39m',
  debug: '\x1B[34m[TIMESTAMP][Debug][SERVICE]\x1B[39m',
}

const colorize = format(info => {
  info.level =
    TEMPLATE_COLORS_FORMAT[info.level as keyof typeof TEMPLATE_COLORS_FORMAT] ||
    info.level

  return info
})

const consoleFormat = format.printf(
  ({ level, message, timestamp: timeValue, service, metadata }) => {
    let serviceStatusFormatted = service
      ? level.replace('SERVICE', service?.toString() || 'App')
      : level.replace('[SERVICE]', '')

    serviceStatusFormatted = serviceStatusFormatted.replace(
      '[TIMESTAMP]',
      NODE_ENV !== 'production' ? '' : `[${timeValue}]`,
    )

    let output = `${serviceStatusFormatted}: ${message}`

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

const logger = createLogger({
  levels: config.syslog.levels,

  defaultMeta: { service: 'App' },

  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
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
