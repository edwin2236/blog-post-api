import formData from 'form-data'
import Mailgun from 'mailgun.js'
import { createTransport, SentMessageInfo } from 'nodemailer'

import {
  MAILGUN_API_KEY,
  MAILGUN_DOMAIN,
  NODE_ENV,
  SMTP_HOST,
  SMTP_PASS,
  SMTP_PORT,
  SMTP_USER,
} from '@/shared/utils/constants.js'
import { logger } from '@/shared/utils/logger.js'

export interface IEmailService {
  sendEmail(to: string, subject: string, html: string): Promise<SentMessageInfo>
}

export class EmailService implements IEmailService {
  private mailgun
  private domain: string = MAILGUN_DOMAIN
  private transporter
  private _logger = logger.child({ module: 'MailService' })

  constructor() {
    this._logger.defaultMeta = { service: 'MailService' }

    if (NODE_ENV === 'production') {
      const mailgun = new Mailgun(formData)

      this.mailgun = mailgun.client({
        username: 'api',
        key: MAILGUN_API_KEY ?? '',
      })
    } else {
      // Use MailHog in development
      this.transporter = createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: false,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      })

      // Verify connection
      this.transporter.verify((error, success) => {
        if (error) {
          this._logger.error('SMTP connection error: %s', error)
        } else {
          this._logger.info('SMTP server is ready: %s', success)
        }
      })
    }
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      if (NODE_ENV === 'production') {
        const data = {
          from: `Blog Post API <noreply@${this.domain}>`,
          to,
          subject,
          html,
        }

        const response = await this.mailgun!.messages.create(this.domain, data)

        this._logger.info('Email sent successfully via Mailgun %s', {
          to,
          subject,
          response,
        })

        return response
      } else {
        // Send via MailHog in development
        const info = await this.transporter?.sendMail({
          from: 'Blog Post API <noreply@localhost>',
          to,
          subject,
          html,
        })

        this._logger.info('Email sent successfully via MailHog', {
          to,
          subject,
          messageId: info?.messageId,
        })

        return info
      }
    } catch (error) {
      this._logger.error('Failed to send email %s', {
        error: (error as Error).message,
        to,
        subject,
      })
      throw error
    }
  }
}
