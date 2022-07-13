const fetch =
  typeof window === 'object'
    ? window.fetch
    : require('isomorphic-fetch')
module.exports = async ({
  dataToVerify, 
  hmac, 
  protocolID, 
  keyID, 
  description = '', 
  counterparty = 'self', 
  privileged = false
}) => {
  if (hmac && typeof hmac !== 'string') {
    // Uint8Arrays need to be converted to strings.
    if (hmac.constructor === Uint8Array || hmac.constructor === Buffer) {
      hmac = Buffer.from(hmac).toString('base64')
    }
  }
  const result = await fetch(
    `http://localhost:3301/v1/verifyHmac` +
    `?protocolID=${protocolID}` +
    `&keyID=${keyID}` +
    `&description=${description}` +
    `&counterparty=${counterparty}` +
    `&privileged=${privileged}` +
    `&hmac=${hmac}`,
    {
      method: 'post',
      headers: {
        'Origin': 'http://localhost',
        'Content-Type': 'application/octet-stream'
      },
      body: dataToVerify
    }
  )
  return result.json()
}
