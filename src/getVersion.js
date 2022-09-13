const communicator = require('./utils/communicator')
const makeHttpRequest = require('./utils/makeHttpRequest')
/**
 * Returns the current version of the kernal
 * @returns {Promise<Object>} An object containing the current version as a string
 */
module.exports = async () => {
  try {
    const substrate = await communicator().substrate
    console.log('substrate:', substrate)
    if(substrate === 'cicada-api') {
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
    if(substrate === 'babbage-xdm') {
      const ids = {}
      return new Promise(resolve => {
        window.parent.postMessage({
          type: 'CWI',
          id: Buffer.from(require('crypto').randomBytes(8)).toString('base64'),
          call: 'getVersion',
        }, '*')
        ids[id] = result => {
          resolve(result)
          delete ids[id]
        }
      })
    }
  } catch (e) {
    console.error(e)
  }
}
