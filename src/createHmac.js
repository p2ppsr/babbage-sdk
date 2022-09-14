const communicator = require('./utils/communicator')
const makeHttpRequest = require('./utils/makeHttpRequest')
/**
 * Creates a SHA-256 HMAC with a key belonging to the user.
 *
 * @param {Object} args All parameters are passed in an object.
 * @param {Uint8Array|string} args.data The data to HMAC. If given as a string, it must be in base64 format.
 * @param {Array|string} args.protocolID Specify an identifier for the protocol under which this operation is being performed.
 * @param {string} args.keyID An identifier for the message. During verification, the same message ID will be required. This can be used to prevent key re-use, even when the same user is using the same protocol to HMAC multiple messages.
 * @param {Uint8Array|string} [args.counterparty=self] If specified, the user with this identity key will also be able to verify the HMAC, as long as they specify the current user's identity key as their counterparty. Must be a hexadecimal string representing a 33-byte or 65-byte value, "self" or "anyone".
 * @param {string} [args.description] Describe the high-level operation being performed, so that the user can make an informed decision if permission is needed.
 * @param {string} [args.privileged=false] This indicates whether the privileged keyring should be used for the HMAC, as opposed to the primary keyring.
 *
 * @returns {Promise<Uint8Array>} The SHA-256 HMAC of the data.
 */
module.exports = async ({
  data,
  protocolID,
  keyID,
  description = '',
  counterparty = 'self',
  privileged = false
}) => {
  try {
    const com = await communicator()
    console.log('createHmac:com:', com)
    console.log('createHmac:com.substrate:', com.substrate)
    if(com.substrate === 'cicada-api') {
      const httpResult = await makeHttpRequest(
        'http://localhost:3301/v1/createHmac' +
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
    }
    if(com.substrate === 'babbage-xdm') {
      const ids = {}
      return new Promise(resolve => {
        const id = Buffer.from(require('crypto').randomBytes(8)).toString('base64')
        window.addEventListener('message', async e => {
          console.log('getPublicKey():message received:id', id)
          if (e.data.type !== 'CWI' || !e.isTrusted || e.data.id !== id) return
          ids[id] = e.data.result
          console.log('getPublicKey():e.data.result', e.data.result)
          resolve(e.data.result)
          delete ids[id]
        })
        window.parent.postMessage({
          type: 'CWI',
          id,
          call: 'createHmac',
          params:{
            data,
            protocolID,
            keyID,
            description,
            counterparty,
            privileged
          }
        }, '*')
      })
    }
  } catch(e) {
    console.error(e)
  }
}