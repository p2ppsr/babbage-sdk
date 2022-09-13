const communicator = require('./utils/communicator')
const makeHttpRequest = require('./utils/makeHttpRequest')

/**
 * Returns found certificates
 * @param {*} certifiers The certifiers to filter certificates by
 * @param {*} types The certificate types to filter certificates by
 * @returns {Promise<Object>} An object containing the found certificates
 */
module.exports = async (certifiers, types) => {
  await communicator()
  if(global.substrate === 'cicada-api') {
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
  if(global.substrate === 'babbage-xdm') {
    const getCertificates = async () => {
      const xdmResult = await window.CWI.getCertificates({
        certifiers,
        types
      })
      console.log(xdmResult)
      return xdmResult
    }
    getCertificates()
  }
}
