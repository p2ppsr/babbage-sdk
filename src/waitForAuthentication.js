const makeHttpRequest = require('./utils/makeHttpRequest')
/**
 * Waits for a user to be authenticated.
 *
 * @returns {Promise<Object>} An object containing a boolean indicating that a user is authenticated
*/
module.exports = async () => {
  const result = await makeHttpRequest(
    'http://localhost:3301/v1/waitForAuthentication',
    {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
  // Make sure we always return a string unless there's an error
  if (result.constructor.name !== 'Error') {
    return JSON.parse(Buffer.from(result).toString()).result
  } else {
    return result
  }
}
