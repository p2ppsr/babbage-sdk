const communicator = require('./utils/communicator')
const makeHttpRequest = require('./utils/makeHttpRequest')

/**
 * Returns found certificates
 * @param {Object} obj All parameters for this function are provided in an object
 * @param {Array<string>} [obj.certifiers] The certifiers to filter certificates by
 * @param {Array<string>} [obj.types] The certificate types to filter certificates by
 * @returns {Promise<Object>} An object containing the found certificates
 */
module.exports = async ({
  certifiers, types
}) => {
  let com // Has to be declared as variable because we need to test it inside the catch
  try {
    com = await communicator()
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
          call: 'getCertificates',
          params: {
            certifiers,
            types
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
