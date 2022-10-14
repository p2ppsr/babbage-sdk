const communicator = require('./utils/communicator')
const makeHttpRequest = require('./utils/makeHttpRequest')
/**
 * Waits for a user to be authenticated.
 *
 * @returns {Promise<Object>} An object containing a boolean indicating that a user is authenticated
*/
module.exports = async () => {
  const com = await communicator()
  if (com.substrate === 'cicada-api') {
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
  } else if (com.substrate === 'babbage-xdm') {
    return new Promise((resolve, reject) => {
      const id = Buffer.from(require('crypto').randomBytes(8)).toString('base64')
      window.addEventListener('message', async e => {
        if (e.data.type !== 'CWI' || !e.isTrusted || e.data.id !== id) return
        if (e.data.status === 'error') {
          const err = new Error(e.data.description)
          err.code = e.data.code
          reject(err)
        } else {
          resolve(e.data.result)
        }
      })
      window.parent.postMessage({
        type: 'CWI',
        id,
        call: 'waitForAuthentication'
      }, '*')
    })
  }
}
