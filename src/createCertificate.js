const makeHttpRequest = require('./utils/makeHttpRequest')

/**
 * Creates a signed certificate
 * @param {Object} obj All parameters for this function are provided in an object
 * @param {string} obj.certificateType The type of certificate to create
 * @param {Object} obj.fieldObject The fields to add to the certificate
 * @param {string} obj.certifierUrl The URL of the certifier signing the certificate
 * @param {string} obj.certifierPublicKey The public identity key of the certifier signing the certificate
 * @returns {Promise<Object>} A signed certificate
 */
module.exports = async ({
  certificateType,
  fieldObject,
  certifierUrl,
  certifierPublicKey
}) => {
  const result = await makeHttpRequest(
    'http://localhost:3301/v1/createCertificate',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        certificateType,
        fieldObject,
        certifierUrl,
        certifierPublicKey
      })
    }
  )
  return result
}
