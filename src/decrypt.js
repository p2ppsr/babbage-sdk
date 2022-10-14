const communicator = require('./utils/communicator')
const makeHttpRequest = require('./utils/makeHttpRequest')
/**
 * Decrypts data with a key belonging to the user. The same protocolID, keyID, counterparty and privileged parameters that were used during encryption must be used to successfully decrypt.
 *
 * @param {Object} args All parameters are passed in an object.
 * @param {string|Uint8Array} args.ciphertext The encrypted data to decipher. If given as a string, it must be in base64 format.
 * @param {Array|string} args.protocolID Specify an identifier for the protocol under which this operation is being performed. It should be the same protocol ID used during encryption.
 * @param {string} args.keyID This should be the same message ID used during encryption.
 * @param {string} [args.description] Describe the high-level operation being performed, so that the user can make an informed decision if permission is needed.
 * @param {Uint8Array|string} [args.counterparty=self] If a foreign user used the local user's identity key as a counterparty when encrypting a message, specify the foreign user's identity key and the message can be decrypted. Must be a hexadecimal string representing a 33-byte or 65-byte value, "self" or "anyone".
 * @param {Boolean} [args.privileged=false] This indicates which keyring should be used when decrypting. Use the same value as was used during encryption.
 * @param {string} [args.returnType=Uint8Array] Specify the data type for the returned plaintext. Available types are `string` (binary) and `Uint8Array`.
 *
 * @returns {Promise<string|Uint8Array>} The decrypted plaintext.
 */
module.exports = async ({
  ciphertext,
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
      'http://localhost:3301/v1/decrypt' +
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
        body: ciphertext
      }
    )
    return httpResult
  } else if (com.substrate === 'babbage-xdm') {
    return new Promise((resolve, reject) => {
      const id = Buffer.from(require('crypto').randomBytes(8)).toString('base64')
      window.addEventListener('message', async e => {
        if (e.data.type !== 'CWI' || !e.isTrusted || e.data.id !== id) return
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
        id,
        call: 'decrypt',
        params: {
          ciphertext,
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
