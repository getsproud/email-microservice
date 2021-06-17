import axios from 'axios'
import mailer from './mailer'

const sendActivationMail = call => new Promise((resolve, reject) => {
  const { query } = call

  const message = {
    domain: 'mail',
    i18n: 'ACTIVATION_MAIL_SEND_ERROR',
    data: {},
    code: 500,
    stack: null,
    error: null
  }

  const data = {
    list_ids: ['b5c01061-d12c-4367-819c-5195af050206'],
    contacts: [{
      email: query.to,
      custom_fields: {
        e3_T: 'TRIAL'
      }
    }],
    mail_settings: {
      sandbox_mode: {
        enable: process.env.NODE_ENV !== 'production'
      }
    }
  }

  return (async () => {
    try {
      await mailer({
        to: process.env.NODE_ENV !== 'production' ? 'test@sproud.io' : query.to,
        templateId: 'd-e98abbec5a9243e5b9c7c9c95b9b5487',
        data: {
          activation_code: `${query.code}`.replace(/(\d{3})(\d{3})/, '$1-$2')
        }
      })

      await axios.put('https://api.sendgrid.com/v3/marketing/contacts', data, {
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${process.env.SENDGRID_API_KEY.replace('\n', '')}`
        }
      })

      message.i18n = 'ACTIVATION_MAIL_SEND_SUCCESS'
      message.code = 200

      return resolve(message)
    } catch (e) {
      message.stack = e.stack
      message.error = e.message

      return reject(message)
    }
  })()
})

export default sendActivationMail
