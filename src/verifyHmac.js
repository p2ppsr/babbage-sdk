const makeHttpRequest = require('./utils/makeHttpRequest')
/**
 * Verifies that a SHA-256 HMAC was created with a key that belongs to the user.
 *
 * @param {Object} args All parameters are passed in an object.
 * @param {Uint8Array|string} [args.data] The data to verify. If given as a string, it must be in base64 format.
 * @param {Uint8Array|string} [args.hmac] The hmac created from the data. If given as a string, it must be in base64 format.
 * @param {string} [args.protocolID] Specify an identifier for the protocol under which the HMAC operation was performed.
 * @param {string} [args.keyID] An identifier for the message. This should be the same message ID that was used when creating the HMAC.
 * @param {string} [args.description] Describe the high-level operation being performed, so that the user can make an informed decision if permission is needed.
 * @param {Uint8Array|string} [args.counterparty=self] If specified, allows verification where the user with this identity key has created the HMAC, as long as they had specified the current user's identity key as their counterparty during creation. Must be a hexadecimal string representing a 33-byte or 65-byte value or "self". Note that signatures created with counterparty = "anyone" are verifiable by anyone, and do not need user keys through the kernel.
 * @param {string} [args.privileged=false] This indicates whether the privileged keyring was used for the HMAC, as opposed to the primary keyring.
 * 
 * @returns {Promise<Boolean>} Whether the HMAC has been erified.
 */
module.exports = async ({
  data, 
  hmac, 
  protocolID, 
  keyID, 
  description = '', 
  counterparty = 'self', 
  privileged = false
}) => {
  if (hmac && typeof hmac !== 'string') {
    // Uint8Arrays need to be converted to strings.
    if (hmac.constructor === Uint8Array || hmac.constructor === Buffer) {
      hmac = Buffer.from(hmac).toString('base64')
    }
  }
  const result = await makeHttpRequest(
    `http://localhost:3301/v1/verifyHmac` +
    `?protocolID=${protocolID}` +
    `&keyID=${keyID}` +
    `&description=${description}` +
    `&counterparty=${counterparty}` +
    `&privileged=${privileged}` +
    `&hmac=${hmac}`,
    {
      method: 'post',
      headers: {
        'Content-Type': 'application/octet-stream'
      },
      body: data
    }
  )
  return result.json()
}
