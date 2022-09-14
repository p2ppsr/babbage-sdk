const makeHttpRequest = require('./utils/makeHttpRequest')

/**
 * Returns found certificates
 * @param {Object} obj All parameters for this function are provided in an object
 * @param {Array<string>} [obj.certifiers] The certifiers to filter certificates by
 * @param {Array<string>} [obj.types] The certificate types to filter certificates by
 * @returns {Promise<Object>} An object containing the found certificates
 */
module.exports = async ({
  certifiers,
  types
}) => {
  const result = await makeHttpRequest(
    'http://localhost:3301/v1/ninja/findCertificates',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        certifiers,
        types
      })
    }
  )
  return result
}
