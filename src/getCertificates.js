const connectToSubstrate = require('./utils/connectToSubstrate')
const makeHttpRequest = require('./utils/makeHttpRequest')

/**
 * Returns found certificates
 * @param {Object} obj All parameters for this function are provided in an object
 * @param {Array<string>} [obj.certifiers] The certifiers to filter certificates by
 * @param {Object} [obj.types] The certificate types to filter certificates by, given as an object whose keys are types and whose values are arrays of fields to request from certificates of the given type.
 * @returns {Promise<Object>} An object containing the found certificates
 */
module.exports = async ({
  certifiers, types
}) => {
  const connection = await connectToSubstrate()
  if (connection.substrate === 'cicada-api') {
    const httpResult = await makeHttpRequest(
      'http://localhost:3301/v1/ninja/findCertificates',
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          certifiers,
          types
        })
      }
    )
    return httpResult
  } else if (connection.substrate === 'babbage-xdm') {
    return new Promise((resolve, reject) => {
      const id = Buffer.from(crypto.getRandomValues(new Uint8Array(8))).toString('base64')
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
        call: 'ninja.findCertificates',
        params: {
          certifiers,
          types
        }
      }, '*')
    })
  } else if (connection.substrate === 'window-api') {
    return window.CWI.ninja.findCertificates({
      certifiers,
      types
    })
  } else {
    const e = new Error(`Unknown Babbage substrate: ${connection.substrate}`)
    e.code = 'ERR_UNKNOWN_SUBSTRATE'
    throw e
  }
}
