const connectToSubstrate = require('./utils/connectToSubstrate')
const makeHttpRequest = require('./utils/makeHttpRequest')
const getRandomID = require('./utils/getRandomID')
/**
 * Verifies that a digital signature was created with a key belonging to the user.
 *
 * @param {Object} args All parameters are passed in an object.
 * @param {Uint8Array|string} args.data The data that was signed. If given as a string, it must be in base64 format.
 * @param {Uint8Array|string} args.signature The signature to verify, in the same format returned when it was created.
 * @param {Array|string} args.protocolID Specify the identifier for the protocol under which the data was signed.
 * @param {string} args.keyID An identifier for the message that was signed. This should be the same message ID that was used when creating the signature.
 * @param {string} [args.description] Describe the high-level operation being performed, so that the user can make an informed decision if permission is needed.
 * @param {Uint8Array|string} [args.counterparty=self] If specified, allows verification where the user with this identity key has created the signature, as long as they had specified the current user's identity key as their counterparty during creation. Must be a hexadecimal string representing a 33-byte or 65-byte value or "self". Note that signatures created with counterparty = "anyone" are verifiable by anyone, and do not need user keys through the kernel.
 * @param {string} [args.privileged=false] This indicates whether the privileged keyring was used for signing, as opposed to the primary keyring.
 * @param {string} [args.reason] The reason shown to the user for using the privileged key
 *
 * @returns {Promise<Object>} An object indicating whether the signature was successfully verified.
 */
module.exports = async ({
  data,
  signature,
  protocolID,
  keyID,
  description = '',
  counterparty = 'self',
  privileged = false,
  reason = ''
}) => {
  if (signature && typeof signature !== 'string') {
    // Uint8Arrays need to be converted to strings.
    if (signature.constructor === Uint8Array || signature.constructor === Buffer) {
      signature = Buffer.from(signature).toString('base64')
    }
  }
  const connection = await connectToSubstrate()
  if (connection.substrate === 'cicada-api') {
    const httpResult = await makeHttpRequest(
      'http://localhost:3301/v1/verifySignature' +
        `?signature=${encodeURIComponent(signature)}` +
        `&protocolID=${encodeURIComponent(protocolID)}` +
        `&keyID=${encodeURIComponent(keyID)}` +
        `&description=${encodeURIComponent(description)}` +
        `&counterparty=${encodeURIComponent(counterparty)}` +
        `&privileged=${encodeURIComponent(privileged)}` +
        `&reason=${encodeURIComponent(reason)}`,
      {
        method: 'POST',
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
        call: 'verifySignature',
        params: {
          data,
          signature,
          protocolID,
          keyID,
          description,
          counterparty,
          privileged,
          reason
        }
      }, '*')
    })
  } else if (connection.substrate === 'window-api') {
    return window.CWI.verifySignature({
      data,
      signature,
      protocolID,
      keyID,
      description,
      counterparty,
      privileged,
      reason
    })
  } else {
    const e = new Error(`Unknown Babbage substrate: ${connection.substrate}`)
    e.code = 'ERR_UNKNOWN_SUBSTRATE'
    throw e
  }
}
