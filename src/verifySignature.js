const fetch =
  typeof window === 'object'
    ? window.fetch
    : require('isomorphic-fetch')
module.exports = async ({
  dataSigned, 
  signature, 
  protocolID, 
  keyID, 
  description = '', 
  counterparty = 'self', 
  privileged = false,
  reason = ''
}) => {
  if (signature && typeof signature !== 'string') {
    // Uint8Arrays need to be converted to strings.
    if (signature.constructor === Uint8Array || signature.constructor === Buffer) {
      signature = Buffer.from(signature).toString('base64')
    }
  }
  const result = await fetch(
    `http://localhost:3301/v1/verifySignature` + 
    `?signature=${encodeURIComponent(signature)}` + 
    `&protocolID=${encodeURIComponent(protocolID)}` + 
    `&keyID=${encodeURIComponent(keyID)}` + 
    `&description=${encodeURIComponent(description)}` + 
    `&counterparty=${encodeURIComponent(counterparty)}` + 
    `&privileged=${encodeURIComponent(privileged)}` + 
    `&reason=${reason}`,
    {
      method: 'POST',
      headers: {
        'Origin': 'http://localhost',
        'Content-Type': 'application/octet-stream'
      },
      body: dataSigned
    }
  )
  return result.json()
}
