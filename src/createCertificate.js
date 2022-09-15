const communicator = require('./utils/communicator')
const makeHttpRequest = require('./utils/makeHttpRequest')

/**
 * Creates a signed certificate
 * @param {Object} obj All parameters for this function are provided in an object
 * @param {string} obj.certificateType The type of certificate to create
 * @param {Object} obj.fieldObject The fields to add to the certificate
 * @param {string} obj.certifierUrl The URL of the certifier signing the certificate
 * @param {string} obj.certifierPublicKey The public identity key of the certifier signing the certificate
 * @returns {Promise<Object>} A signed certificate
 */
module.exports = async ({
  certificateType,
  fieldObject,
  certifierUrl,
  certifierPublicKey
}) => {
    let com // Has to be declared as variable because we need to test it inside the catch
  try {
    com = await communicator()
    if (com.substrate === 'cicada-api') {
  const httpResult = await makeHttpRequest(
    'http://localhost:3301/v1/createCertificate',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        certificateType,
        fieldObject,
        certifierUrl,
        certifierPublicKey
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
          call: 'createCertificate',
          params: {
            certificateType,
            fieldObject,
            certifierUrl,
            certifierPublicKey
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
