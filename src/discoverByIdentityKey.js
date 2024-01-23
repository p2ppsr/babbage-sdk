const connectToSubstrate = require('./utils/connectToSubstrate')
const makeHttpRequest = require('./utils/makeHttpRequest')
const getRandomID = require('./utils/getRandomID')
/**
 * Resolve identity information using the MNC
 *
 *
* @returns {Promise<Object>} An object containing the user's public key
 */
module.exports = async ({
  identityKey = false
}) => {
  const connection = await connectToSubstrate()
  if (connection.substrate === 'cicada-api') {
    const httpResult = await makeHttpRequest(
      'http://localhost:3301/v1/discoverByIdentityKey' +
        `?identityKey=${encodeURIComponent(identityKey)}`,
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
          identityKey
        }
      }, '*')
    })
  } else if (connection.substrate === 'window-api') {
    return window.CWI.discoverByIdentityKey({
      identityKey
    })
  } else {
    const e = new Error(`Unknown Babbage substrate: ${connection.substrate}`)
    e.code = 'ERR_UNKNOWN_SUBSTRATE'
    throw e
  }
}
