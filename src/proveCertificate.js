const makeHttpRequest = require('./utils/makeHttpRequest')

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
  let com // Has to be declared as variable because we need to test it inside the catch
  try {
    com = await communicator()
    if (com.substrate === 'cicada-api') {
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
      }
    if (com.substrate === 'babbage-xdm') {
      const ids = {}
      return new Promise(resolve => {
        const id = Buffer.from(require('crypto').randomBytes(8)).toString('base64')
        window.addEventListener('message', async e => {
          if (e.data.type !== 'CWI' || !e.isTrusted || e.data.id !== id) return
          ids[id] = e.data.result
          resolve(e.data.result)
          delete ids[id]
        })
        window.parent.postMessage({
          type: 'CWI',
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
  } catch (e) {
    if (e.code === 'ERR_NO_METANET_IDENTITY' && com.substrate === 'babbage-xdm') {
      // TODO: If substrate is babbage-xdm then send message to parent and call CWI.initialize()
    } else {
      console.error(e)
    }
  }
}
