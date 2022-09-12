const communicator = require('./utils/communicator')
/**
 * Returns the current version of the kernal
 * @returns {Promise<Object>} An object containing the current version as a string
 */
module.exports = async () => {
  const result = await communicator(
    'http://localhost:3301/v1/version',
    {
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
  return result
}
