const communicator = require('./utils/communicator')
const makeHttpRequest = require('./utils/makeHttpRequest')
/**
 * Waits for a user to be authenticated.
 *
 * @returns {Promise<Object>} An object containing a boolean indicating that a user is authenticated
*/
module.exports = async () => {
  const substrate = await communicator()
  if(substrate == 'cicada-api') {
    const httpResult = await makeHttpRequest(
      'http://localhost:3301/v1/waitForAuthentication',
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    return httpResult
  }
}
