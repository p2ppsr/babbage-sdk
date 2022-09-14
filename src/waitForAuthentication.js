const communicator = require('./utils/communicator')
const makeHttpRequest = require('./utils/makeHttpRequest')
/**
 * Waits for a user to be authenticated.
 *
 * @returns {Promise<Object>} An object containing a boolean indicating that a user is authenticated
*/
module.exports = async () => {
  try {
    const com = await communicator()
    console.log('waitForAuthentication:com:', com)
    console.log('waitForAuthentication:com.substrate:', com.substrate)
    if(com.substrate === 'cicada-api') {
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
    if(com.substrate === 'babbage-xdm') {
      const ids = {}
      return new Promise(resolve => {
        window.parent.postMessage({
          type: 'CWI',
          id: Buffer.from(require('crypto').randomBytes(8)).toString('base64'),
          call: 'waitForAuthentication',
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