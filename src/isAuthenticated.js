const communicator = require('./utils/communicator')
const makeHttpRequest = require('./utils/makeHttpRequest')
/**
 * Checks if a user is currently authenticated.
 *
 * @returns {Promise<Object>} Returns an object indicating whether a user is currently authenticated.
*/
module.exports = async () => {
  await communicator()
  if(global.substrate === 'cicada-api') {
    const httpResult = await makeHttpRequest(
      'http://localhost:3301/v1/isAuthenticated',
      {
        method: 'get',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    return httpResult
  }
  if(global.substrate === 'babbage-xdm') {
    const isAuthenticated = async () => {
      const xdmResult = await window.CWI.isAuthenticated()
      console.log(xdmResult)
      return xdmResult
    }
    isAuthenticated()
  }
}
