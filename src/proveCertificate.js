const makeHttpRequest = require('./utils/makeHttpRequest')
const connectToSubstrate = require('./utils/connectToSubstrate')

/**
 * Creates certificate proof specifically for verifier
 * @param {Object} obj All parameters for this function are provided in an object
 * @param {Object} obj.certificate The certificate to prove
 * @param {Array<string>} [obj.fieldsToReveal] The names of the fields to reveal to the verifier
 * @param {string} obj.verifierPublicIdentityKey The public identity key of the verifier
 * @returns {Promise<Object>} A certificate for presentation to the verifier for field examination
 */
module.exports = async ({
  certificate,
  fieldsToReveal,
  verifierPublicIdentityKey
}) => {
  const connection = await connectToSubstrate()
  if (connection.substrate === 'cicada-api') {
    const httpResult = await makeHttpRequest(
      'http://localhost:3301/v1/proveCertificate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          certificate,
          fieldsToReveal,
          verifierPublicIdentityKey
        })
      }
    )
    return httpResult
  } else if (connection.substrate === 'babbage-xdm') {
    return new Promise((resolve, reject) => {
      const id = Buffer.from(require('crypto').randomBytes(8)).toString('base64')
      window.addEventListener('message', async e => {
        if (e.data.type !== 'CWI' || !e.isTrusted || e.data.id !== id || e.data.isInvocation) return
        if (e.data.status === 'error') {
          const err = new Error(e.data.description)
          err.code = e.data.code
          reject(err)
        } else {
          resolve(e.data.result)
        }
      })
      window.parent.postMessage({
        type: 'CWI',
        isInvocation: true,
        id,
        call: 'proveCertificate',
        params: {
          certificate,
          fieldsToReveal,
          verifierPublicIdentityKey
        }
      }, '*')
    })
  }
}
