const connectToSubstrate = require('./utils/connectToSubstrate')
const makeHttpRequest = require('./utils/makeHttpRequest')
const getRandomID = require('./utils/getRandomID')
/**
 * Returns the public key. If identityKey is specified, returns the current user's identity key. If a counterparty is specified, derives a public key for the counterparty.
 *
 * @param {Object} args All parameters are passed in an object.
 * @param {Array|string} [args.protocolID] Specify an identifier for the protocol under which this operation is being performed.
 * @param {string} [args.keyID] An identifier for retrieving the public key used. This can be used to prevent key re-use, even when the same user is using the same protocol to perform actions.
 * @param {string} [args.description] Describe the high-level operation being performed, so that the user can make an informed decision if permission is needed.
 * @param {string} [args.privileged=false] This indicates whether the privileged keyring should be used, as opposed to the primary keyring.
 * @param {string} [args.identityKey=false] If true, the identity key will be returned, and no key derivation will be performed
 * @param {string} [args.reason] The reason for requiring access to the user's privilegedKey
 * @param {string} [args.counterparty=self] The counterparty to use for derivation. If provided, derives a public key for this counterparty, who can derive the corresponding private key.
 *
* @returns {Promise<Object>} An object containing the user's public key
 */
module.exports = async ({
  protocolID,
  keyID,
  privileged = false,
  identityKey = false,
  reason = 'No reason provided.',
  counterparty = 'self'
}) => {
  const connection = await connectToSubstrate()
  if (connection.substrate === 'cicada-api') {
    const httpResult = await makeHttpRequest(
      'http://localhost:3301/v1/publicKey' +
        `?protocolID=${encodeURIComponent(protocolID)}` +
        `&keyID=${encodeURIComponent(keyID)}` +
        `&privileged=${encodeURIComponent(privileged)}` +
        `&identityKey=${encodeURIComponent(identityKey)}` +
        `&counterparty=${encodeURIComponent(counterparty)}` +
        `&reason=${encodeURIComponent(reason)}`,
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
        call: 'getPublicKey',
        params: {
          protocolID,
          keyID,
          privileged,
          identityKey,
          reason,
          counterparty
        }
      }, '*')
    })
  } else if (connection.substrate === 'window-api') {
    return window.CWI.getPublicKey({
      protocolID,
      keyID,
      privileged,
      identityKey,
      reason,
      counterparty
    })
  } else {
    const e = new Error(`Unknown Babbage substrate: ${connection.substrate}`)
    e.code = 'ERR_UNKNOWN_SUBSTRATE'
    throw e
  }
}
