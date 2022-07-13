const fetch =
  typeof window === 'object'
    ? window.fetch
    : require('isomorphic-fetch')
module.exports = async ({ 
  dataToSign, 
  protocolID, 
  keyID, 
  description = '', 
  counterparty = 'self', 
  privileged = false 
}) => {
  const result = await fetch(
    `http://localhost:3301/v1/createSignature` + 
    `?protocolID=${protocolID}&keyID=${keyID}` + 
    `&description=${description}` + 
    `&counterparty=${counterparty}` + 
    `&privileged=${privileged}`,
    {
      method: 'post',
      headers: {
        'Origin': 'http://localhost',
        'Content-Type': 'application/octet-stream'
      },
      body: dataToSign
    }
  )
  return result.arrayBuffer()
}
