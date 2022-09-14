const communicator = require('./utils/communicator')
const makeHttpRequest = require('./utils/makeHttpRequest')
/**
 * Checks if a user is currently authenticated.
 *
 * @returns {Promise<Object>} Returns an object indicating whether a user is currently authenticated.
*/
module.exports = async () => {
  try {
    const com = await communicator()
    console.log('isAuthenticated:com:', com)
    console.log('isAuthenticated:com.substrate:', com.substrate)
    if(com.substrate === 'cicada-api') {
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
    if(com.substrate === 'babbage-xdm') {
      const ids = {}
      return new Promise(resolve => {
        const id = Buffer.from(require('crypto').randomBytes(8)).toString('base64')
        window.addEventListener('message', async e => {
          console.log('getPublicKey():message received:id', id)
          if (e.data.type !== 'CWI' || !e.isTrusted || e.data.id !== id) return
          ids[id] = e.data.result
          console.log('getPublicKey():e.data.result', e.data.result)
          resolve(e.data.result)
          delete ids[id]
        })
        window.parent.postMessage({
          type: 'CWI',
          id,
          call: 'isAuthenticated',
        }, '*')
      })
    }
  } catch (e) {
    console.error(e)
  }
}
