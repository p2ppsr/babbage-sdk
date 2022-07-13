const fetch =
  typeof window === 'object'
    ? window.fetch
    : require('isomorphic-fetch')
module.exports = async ({
  dataToHmac, 
  protocolID, 
  keyID, 
  description = '', 
  counterparty = 'self',
  privileged = false
}) => {
  const result = await fetch(
     `http://localhost:3301/v1/createHmac` +
     `?protocolID=${encodeURIComponent(protocolID)}` +
     `&keyID=${encodeURIComponent(keyID)}` + 
     `&description=${encodeURIComponent(description)}` +
     `&counterparty=${encodeURIComponent(counterparty)}` + 
     `&privileged=${encodeURIComponent(privileged)}`,
    {
      method: 'post',
      headers: {
        'Origin': 'http://localhost',
        'Content-Type': 'application/octet-stream'
      },
      body: dataToHmac
    }
  )
  return result.arrayBuffer()
}
