const connectToSubstrate = require('./utils/connectToSubstrate')
const makeHttpRequest = require('./utils/makeHttpRequest')
const getRandomID = require('./utils/getRandomID')
/**
 * Creates a digital signature with a key belonging to the user. The SHA-256 hash of the data is used with ECDSA.
 *
 * To allow other users to externally verify the signature, use getPublicKey with the same protocolID, keyID and privileged parameters. The signature should be valid under that public key.
 *
 * @param {Object} args All parameters are passed in an object.
 * @param {Uint8Array|string} args.data The data to sign. If given as a string, it must be in base64 format.
 * @param {Array|string} args.protocolID Specify an identifier for the protocol under which this operation is being performed.
 * @param {string} args.keyID An identifier for the message being signed. During verification, or when retrieving the public key used, the same message ID will be required. This can be used to prevent key re-use, even when the same user is using the same protocol to sign multiple messages.
 * @param {string} [args.description] Describe the high-level operation being performed, so that the user can make an informed decision if permission is needed.
 * @param {Uint8Array|string} [args.counterparty=self] If specified, the user with this identity key will also be able to verify the signature, as long as they specify the current user's identity key as their counterparty. Must be a hexadecimal string representing a 33-byte or 65-byte value, "self" or "anyone".
 * @param {string} [args.privileged=false] This indicates whether the privileged keyring should be used for signing, as opposed to the primary keyring.
 *
 * @returns {Promise<Uint8Array>} The ECDSA message signature.
 */
module.exports = async ({
  data,
  protocolID,
  keyID,
  description = '',
  counterparty = 'self',
  privileged = false
}) => {
  const connection = await connectToSubstrate()
  if (connection.substrate === 'cicada-api') {
    const httpResult = await makeHttpRequest(
      'http://localhost:3301/v1/createSignature' +
        `?protocolID=${encodeURIComponent(protocolID)}` +
        `&keyID=${encodeURIComponent(keyID)}` +
        `&description=${encodeURIComponent(description)}` +
        `&counterparty=${encodeURIComponent(counterparty)}` +
        `&privileged=${encodeURIComponent(privileged)}`,
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/octet-stream'
        },
        body: data
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
        call: 'createSignature',
        params: {
          data,
          protocolID,
          keyID,
          description,
          counterparty,
          privileged
        }
      }, '*')
    })
  } else if (connection.substrate === 'window-api') {
    return window.CWI.createSignature({
      data,
      protocolID,
      keyID,
      description,
      counterparty,
      privileged
    })
  } else {
    const e = new Error(`Unknown Babbage substrate: ${connection.substrate}`)
    e.code = 'ERR_UNKNOWN_SUBSTRATE'
    throw e
  }
}
