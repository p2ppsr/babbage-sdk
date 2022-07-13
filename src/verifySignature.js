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
  privileged = false
}) => {
  const result = await fetch(
    `http://localhost:3301/v1/verifySignature?signature=${encodeURIComponent(signature)}&protocolID=${encodeURIComponent(protocolID)}&keyID=${encodeURIComponent(keyID)}&description=${encodeURIComponent(description)}&counterparty=${encodeURIComponent(counterparty)}&privileged=${encodeURIComponent(privileged)}`,
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
