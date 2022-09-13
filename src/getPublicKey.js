const communicator = require('./utils/communicator')
const makeHttpRequest = require('./utils/makeHttpRequest')
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
  try {
    const substrate = await communicator().substrate
    console.log('substrate:', substrate)
    if(substrate === 'cicada-api') {
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
    }
    if(substrate === 'babbage-xdm') {
      const ids = {}
      return new Promise(resolve => {
        window.parent.postMessage({
          type: 'CWI',
          id: Buffer.from(require('crypto').randomBytes(8)).toString('base64'),
          call: 'getPublicKey',
          params:{
            protocolID,
            keyID,
            privileged,
            identityKey,
            reason,
            counterparty
              }
        }, '*')
        ids[id] = result => {
          resolve(result)
          delete ids[id]
        }
      })
    }
  } catch(e) {
    console.error(e)
  }
}