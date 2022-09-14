const communicator = require('./utils/communicator')
const makeHttpRequest = require('./utils/makeHttpRequest')

/**
 * Returns found certificates
 * @param {*} certifiers The certifiers to filter certificates by
 * @param {*} types The certificate types to filter certificates by
 * @returns {Promise<Object>} An object containing the found certificates
 */
module.exports = async (certifiers, types) => {
  try {
    const com = await communicator()
    console.log('getCertificates:com:', com)
    console.log('getCertificates:com.substrate:', com.substrate)
    if(com.substrate === 'cicada-api') {
      const httpResult = await makeHttpRequest(
        'http://localhost:3301/v1/ninja/findCertificates',
        {
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            certifiers,
            types
          })
        }
      )
      return httpResult
    }
    if(com.substrate === 'babbage-xdm') {
      const ids = {}
      return new Promise(resolve => {
        const id = Buffer.from(require('crypto').randomBytes(8)).toString('base64')
        window.parent.postMessage({
          type: 'CWI',
          id,
          call: 'getCertificates',
          params:{
            certifiers,
            types
          }
        }, '*')
        ids[id] = result => {
          resolve(result)
          delete ids[id]
        }
      })
    }
  } catch(e) {
    console.error(e)
  }
}