const fetch =
  typeof window === 'object'
    ? window.fetch
    : require('isomorphic-fetch')
/**
 * Returns the public key for the current user associated with the protocolID and keyID specified
 * 
 * @param {Object} args All parameters are passed in an object.
 * @param {string} [args.protocolID] Specify an identifier for the protocol under which this operation is being performed.
 * @param {string} [args.keyID] An identifier for retrieving the public key used. This can be used to prevent key re-use, even when the same user is using the same protocol to perform actions.
 * @param {string} [args.description] Describe the high-level operation being performed, so that the user can make an informed decision if permission is needed.
 * @param {string} [args.privileged=false] This indicates whether the privileged keyring should be used, as opposed to the primary keyring.
 * @param {string} [args.identityKey=false] If true, the identity key will be used as part of the derivation
 * @param {string} [args.reason='No reason provided'] The reason for requiring access to the user's privilegedKey
* @returns {Promise<Object>} An object containing the user's public key
 */
module.exports = async ({
  protocolID, 
  keyID, 
  privileged = false, 
  identityKey = false, 
  reason = 'No reason provided.'
}) => {
  const result = await fetch(
     `http://localhost:3301/v1/publicKey` + 
     `?protocolID=${protocolID}` + 
     `&keyID=${keyID}` + 
     `&privileged=${privileged}` + 
     `&identityKey=${identityKey}` + 
     `&reason=${reason}`,
    {
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      },
    }
  )
  return result.json()
}
