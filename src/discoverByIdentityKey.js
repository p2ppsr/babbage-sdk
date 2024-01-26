const connectToSubstrate = require('./utils/connectToSubstrate')
const makeHttpRequest = require('./utils/makeHttpRequest')
const getRandomID = require('./utils/getRandomID')

/**
 * Resolves identity information by identity key from the user's trusted certifiers.
 * @param {Object} obj All parameters are provided in an object
 * @param {String} obj.identityKey The identity key to resolve information for
 * @param {string} [obj.description] Describe the high-level operation being performed, so that the user can make an informed decision if permission is needed.
 * @returns {Promise<Object[]>}
 */
module.exports = async ({
  identityKey,
  description
}) => {
  const connection = await connectToSubstrate()
  if (connection.substrate === 'cicada-api') {
    const httpResult = await makeHttpRequest(
      'http://localhost:3301/v1/discoverByIdentityKey' +
        `?identityKey=${encodeURIComponent(identityKey)}` +
        `&description=${encodeURIComponent(description)}`,
      {
        method: 'get',
        headers: {
          'Content-Type': 'application/json'
        }
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
        call: 'discoverByIdentityKey',
        params: {
          identityKey,
          description
        }
      }, '*')
    })
  } else if (connection.substrate === 'window-api') {
    return window.CWI.discoverByIdentityKey({
      identityKey,
      description
    })
  } else {
    const e = new Error(`Unknown Babbage substrate: ${connection.substrate}`)
    e.code = 'ERR_UNKNOWN_SUBSTRATE'
    throw e
  }
}
