const communicator = require('./utils/communicator')
const makeHttpRequest = require('./utils/makeHttpRequest')
/**
 * Waits for a user to be authenticated.
 *
 * @returns {Promise<Object>} An object containing a boolean indicating that a user is authenticated
*/
module.exports = async () => {
  await communicator()
  if(global.substrate === 'cicada-api') {
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
  if(global.substrate === 'babbage-xdm') {
    const waitForAuthentication = async () => {
      const xdmResult = await window.CWI.waitForAuthentication()
      console.log(xdmResult)
      return xdmResult
    }
    waitForAuthentication()
  }
}
