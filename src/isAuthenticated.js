const makeHttpRequest = require('./utils/makeHttpRequest')
/**
 * Checks if a user is currently authenticated.
 *
 * @returns {Promise<Object>} Returns an object indicating whether a user is currently authenticated.
*/
module.exports = async () => {
  const result = await makeHttpRequest(
    'http://localhost:3301/v1/isAuthenticated',
    {
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
  return result
}
