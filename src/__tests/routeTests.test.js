/* eslint-env jest */
const BabbageSDK = require('../index')
// Tests communicator.js is handling basic errors correctly for every route
describe('babbage-sdk-routes', () => {
  beforeEach(() => {

  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('Throws an error when trying to make a bad request to createAction', async () => {
    await expect(async () => await BabbageSDK.createAction({})).rejects.toThrow(new Error(
      'Provide a present-tense description for your Action!'
    ))
  })
  it('Throws an error when trying to make a bad request to encrypt', async () => {
    await expect(async () => await BabbageSDK.encrypt({})).rejects.toThrow(new Error(
      'Body of request must be a Uint8Array buffer!'
    ))
  })
  it('Throws an error when trying to make a bad request to decrypt', async () => {
    await expect(async () => await BabbageSDK.decrypt({})).rejects.toThrow(new Error(
      'Body of request must be a Uint8Array buffer!'
    ))
  })
  it('Throws an error when trying to make a bad request to createHmac', async () => {
    await expect(async () => await BabbageSDK.createHmac({})).rejects.toThrow(new Error(
      'Body of request must be a Uint8Array buffer!'
    ))
  })
  it('Throws an error when trying to make a bad request to verifyHmac', async () => {
    const hmacResults = await BabbageSDK.createHmac({
      data: Buffer.from('some data'),
      protocolID: 'Hello World',
      keyID: '1'
    })
    const result = await BabbageSDK.verifyHmac({
      data: Buffer.from('some data that was not used'),
      hmac: Buffer.from(hmacResults).toString('base64'),
      protocolID: 'Hello World',
      keyID: '1',
      returnType: 'string'
    })
    expect(result).toEqual(false)
  })
  it('Throws an error when trying to make a bad request to createSignature', async () => {
    await expect(async () => await BabbageSDK.createSignature({})).rejects.toThrow(new Error(
      'Body of request must be a Uint8Array buffer!'
    ))
  })
  it('Throws an error when trying to make a bad request to verifySignature', async () => {
    const signature = await BabbageSDK.createSignature({
      data: 'This should fail, corrrect?', // Note: Also works as a base64 string
      protocolID: 'Hello World',
      keyID: '1'
    })
    const result = await BabbageSDK.verifySignature({
      data: Buffer.from('some data'),
      signature: Buffer.from(signature).toString('base64'),
      protocolID: 'Hello World',
      keyID: '1'
    })
    expect(result).toEqual(false)
  })
})
