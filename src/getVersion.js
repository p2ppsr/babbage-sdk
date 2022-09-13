const communicator = require('./utils/communicator')
const makeHttpRequest = require('./utils/makeHttpRequest')
/**
 * Returns the current version of the kernal
 * @returns {Promise<Object>} An object containing the current version as a string
 */
module.exports = async () => {
  const substrate = await communicator()
  if(substrate == 'cicada-api') {
    const httpResult = await makeHttpRequest(
      'http://localhost:3301/v1/version',
      {
        method: 'get',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    return httpResult
  }
}
