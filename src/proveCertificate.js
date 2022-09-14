const makeHttpRequest = require('./utils/makeHttpRequest')

/**
 * Creates certificate proof specifically for verifier
 * @param {Object} obj All parameters for this function are provided in an object
 * @param {Object} obj.certificate The certificate to prove
 * @param {Array<string>} [obj.fieldsToReveal] The names of the fields to reveal to the verifier
 * @param {string} obj.verifierPublicIdentityKey The public identity key of the verifier
 * @returns {Promise<Object>} A certificate for presentation to the verifier for field examination
 */
module.exports = async ({
  certificate,
  fieldsToReveal,
  verifierPublicIdentityKey
}) => {
  const result = await makeHttpRequest(
    'http://localhost:3301/v1/proveCertificate',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        certificate,
        fieldsToReveal,
        verifierPublicIdentityKey
      })
    }
  )
  return result
}
