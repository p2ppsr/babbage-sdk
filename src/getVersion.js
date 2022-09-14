const communicator = require('./utils/communicator')
const makeHttpRequest = require('./utils/makeHttpRequest')
/**
 * Returns the current version of the kernal
 * @returns {Promise<Object>} An object containing the current version as a string
 */
module.exports = async () => {
  try {
    const com = await communicator()
    if(com.substrate === 'cicada-api') {
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
    if(com.substrate === 'babbage-xdm') {
      const ids = {}
      return new Promise(resolve => {
        const id = Buffer.from(require('crypto').randomBytes(8)).toString('base64')
        window.addEventListener('message', async e => {
          if (e.data.type !== 'CWI' || !e.isTrusted || e.data.id !== id) return
          ids[id] = e.data.result
          console.log('getPublicKey():e.data.result', e.data.result)
          resolve(e.data.result)
          delete ids[id]
        })
        window.parent.postMessage({
          type: 'CWI',
          id,
          call: 'getVersion',
        }, '*')
      })
    }
  } catch (e) {
    console.error(e)
  }
}
