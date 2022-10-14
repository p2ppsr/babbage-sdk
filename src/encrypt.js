const communicator = require('./utils/communicator')
const makeHttpRequest = require('./utils/makeHttpRequest')
/**
 * Encrypts data with a key belonging to the user. If a counterparty is provided, also allows the counterparty to decrypt the data. The same protocolID, keyID, counterparty and privileged parameters must be used when decrypting.
 *
 * @param {Object} args All parameters are passed in an object.
 * @param {string|Uint8Array} args.plaintext The data to encrypt. If given as a string, it must be in base64 format.
 * @param {Array|string} args.protocolID Specify an identifier for the protocol under which this operation is being performed.
 * @param {string} args.keyID An identifier for the message being encrypted. When decrypting, the same message ID will be required. This can be used to prevent key re-use, even when the same two users are using the same protocol to encrypt multiple messages. It can be randomly-generated, sequential, or even fixed.
 * @param {string} [args.description] Describe the high-level operation being performed, so that the user can make an informed decision if permission is needed.
 * @param {Uint8Array|string} [args.counterparty=self] If specified, the user with this identity key will also be able to decrypt the message, as long as they specify the current user's identity key as their counterparty. Must be a hexadecimal string representing a 33-byte or 65-byte value, "self" or "anyone".
 * @param {Boolean} [args.privileged=false] When true, the data will be encrypted with the user's privileged keyring instead of their primary keyring.
 * @param {string} [args.returnType=Uint8Array] Specify the data type for the returned ciphertext. Available types are `string` (binary) and `Uint8Array`.
 *
 * @returns {Promise<string|Uint8Array>} The encrypted ciphertext.
 */

module.exports = async ({
  plaintext,
  protocolID,
  keyID,
  description = '',
  counterparty = 'self',
  privileged = false,
  returnType = 'Uint8Array'
}) => {
  const com = await communicator()
  if (com.substrate === 'cicada-api') {
    const httpResult = await makeHttpRequest(
      'http://localhost:3301/v1/encrypt' +
          `?protocolID=${encodeURIComponent(protocolID)}` +
          `&keyID=${encodeURIComponent(keyID)}` +
          `&description=${encodeURIComponent(description)}` +
          `&counterparty=${encodeURIComponent(counterparty)}` +
          `&privileged=${encodeURIComponent(privileged)}` +
          `&returnType=${encodeURIComponent(returnType)}`,
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/octet-stream'
        },
        body: plaintext
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
        call: 'encrypt',
        params: {
          plaintext,
          protocolID,
          keyID,
          description,
          counterparty,
          privileged,
          returnType
        }
      }, '*')
    })
  }
}
