const communicator = require('./utils/communicator')
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
  const com = await communicator()
  if (com.substrate === 'cicada-api') {
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
        call: 'ninja.findCertificates',
        params: {
          certifiers,
          types
        }
      }, '*')
    })
  }
}
