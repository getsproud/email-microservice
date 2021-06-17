import { Responder } from 'cote'
import { connect } from 'mongoose'

import sendActivationMail from './lib/sendActivationMail'
import sendInvitationMail from './lib/sendInvitationMail'

const PORT = 50051

const connectRetry = t => {
  let tries = t

  return connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@sproud-${process.env.NODE_ENV === 'development' ? 'dev-' : ''}cluster.mpssn.mongodb.net/sproud${process.env.NODE_ENV === 'development' ? '-dev' : ''}?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
    .catch(e => {
      if (tries < 5) {
        tries += 1
        setTimeout(() => connectRetry(tries), 5000)
      }

      throw new Error(e)
    })
}

connectRetry(0)

try {
  const responder = new Responder({
    name: 'Mail Service', port: PORT, key: 'mail'
  })

  responder.on('sendActivationMail', sendActivationMail)
  responder.on('sendInvitationMail', sendInvitationMail)
  // responder.on('sendNotificationMail')
  // responder.on('sendRecommendationMail')
  responder.on('liveness', () => new Promise(resolve => resolve(200)))
  responder.on('readiness', () => new Promise(resolve => resolve(200)))

  // eslint-disable-next-line
  console.log(`🤩 Mail Microservice bound to port ${PORT}`)
} catch (e) {
  // eslint-disable-next-line
  console.error(`${e.message}`)
  throw new Error(e)
}
