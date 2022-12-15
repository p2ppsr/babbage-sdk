const connectToSubstrate = require('./utils/connectToSubstrate')
const makeHttpRequest = require('./utils/makeHttpRequest')
const getRandomID = require('./utils/getRandomID')

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
  const connection = await connectToSubstrate()
  if (connection.substrate === 'cicada-api') {
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
  } else if (connection.substrate === 'babbage-xdm') {
    return new Promise((resolve, reject) => {
      const id = Buffer.from(getRandomID()).toString('base64')
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
        call: 'createCertificate',
        params: {
          certificateType,
          fieldObject,
          certifierUrl,
          certifierPublicKey
        }
      }, '*')
    })
  } else if (connection.substrate === 'window-api') {
    return window.CWI.createCertificate({
      certificateType,
      fieldObject,
      certifierUrl,
      certifierPublicKey
    })
  } else {
    const e = new Error(`Unknown Babbage substrate: ${connection.substrate}`)
    e.code = 'ERR_UNKNOWN_SUBSTRATE'
    throw e
  }
}
