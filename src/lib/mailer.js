import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY.replace('\n', ''))

const mailer = async opts => {
  const msg = {
    to: opts.to,
    from: {
      name: 'sproud',
      email: 'hello@sproud.io'
    },
    reply_to: {
      name: 'No-Reply',
      email: 'no-reply@sproud.io'
    },
    templateId: opts.templateId,

    dynamic_template_data: {
      ...opts.data
    }
  }

  try {
    await sgMail.send(msg)

    return true
  } catch (e) {
    return e
  }
}

export default mailer
