const BabbageSDK = require('../index')
// To run tests, run the following command: node routeTests.js
const testAllRoutes = async () => {
  // TEST GET Requests
  console.log('GET Requests: ')
  console.log('GET /v1/version: ', await BabbageSDK.getVersion())
  console.log('GET /v1/isAuthenticated: ', await BabbageSDK.isAuthenticated())
  console.log('GET /v1/ninja/avatar: ', await BabbageSDK.getAvatar())
  console.log('GET /v1/ninja/paymail: ', await BabbageSDK.getPaymail())

  // TEST POST Requests
  console.log('POST Requests: ')
  console.log('POST /v1/createAction: ', await BabbageSDK.createAction({
    description: 'Testing an action!',
    outputs: [{ script: '006a', satoshis: 1 }]
  }))
  console.log('POST /v1/waitForAuthentication: ', await BabbageSDK.waitForAuthentication())
  const encryptResults = await BabbageSDK.encrypt({
    dataToEncrypt: Buffer.from('some data'),
    protocolID: 'Hello World',
    keyID: '1'
  })
  console.log('POST /v1/encrypt: ', encryptResults)
  console.log('POST /v1/decrypt: ', await BabbageSDK.decrypt({
    dataToDecrypt: encryptResults,
    protocolID: 'Hello World',
    keyID: '1',
    returnType: 'string'
  }))
  const hmacResults = await BabbageSDK.createHmac({
    dataToHmac: Buffer.from('some data'),
    protocolID: 'Hello World',
    keyID: '1'
  })
  console.log('POST /v1/createHmac: ', hmacResults)
  console.log('POST /v1/verifyHmac: ', await BabbageSDK.verifyHmac({
    dataToVerify: Buffer.from('some data'),
    hmac: Buffer.from(hmacResults).toString('base64'),
    protocolID: 'Hello World',
    keyID: '1',
    returnType: 'string'
  }))
  const signature = await BabbageSDK.createSignature({
    dataToSign: Buffer.from('some data'),
    protocolID: 'Hello World',
    keyID: '1'
  })
  console.log('POST /v1/createSignature: ', signature)
  console.log('POST /v1/verifySignature: ', await BabbageSDK.verifySignature({
    dataSigned: Buffer.from('some data'),
    signature: Buffer.from(signature).toString('base64'),
    protocolID: 'Hello World',
    keyID: '1'
  }))
}
testAllRoutes()