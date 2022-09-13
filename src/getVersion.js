const communicator = require('./utils/communicator')
const makeHttpRequest = require('./utils/makeHttpRequest')
/**
 * Returns the current version of the kernal
 * @returns {Promise<Object>} An object containing the current version as a string
 */
module.exports = async (useCommunicator = true) => {
  if(useCommunicator) {
    await communicator()
  }
  if(global.substrate === 'cicada-api') {
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
if(global.substrate === 'babbage-xdm') {
  const getVersion = async () => {
    const xdmResult = await window.CWI.getVersion()
    console.log(xdmResult)
    return xdmResult
  }
  getVersion()
}
