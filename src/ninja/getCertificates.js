const makeHttpRequest = require('../utils/makeHttpRequest')

/**
 * Returns found certificates
 * @param {*} certifiers The certifiers to filter certificates by
 * @param {*} types The certificate types to filter certificates by
 * @returns {Promise<Object>} An object containing the found certificates
 */
module.exports = async (certifiers, types) => {
  const result = await makeHttpRequest(
    'http://localhost:3301/v1/ninja/findCertificates',
    {
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        certifiers,
        types
      }
    }
  )
  return result
}
