const fetch =
  typeof window === 'object'
    ? window.fetch
    : require('isomorphic-fetch')
module.exports = async ({ 
  dataToDecrypt, 
  protocolID, 
  keyID, 
  description = '', 
  counterparty = 'self', 
  privileged = false, 
  returnType = 'Uint8Array'
}) => {
  const result = await fetch(
     `http://localhost:3301/v1/decrypt` + 
     `?protocolID=${protocolID}` + 
     `&keyID=${keyID}` + 
     `&description=${description}` + 
     `&counterparty=${counterparty}` + 
     `&privileged=${privileged}` + 
     `&returnType=${returnType}`,
    {
      method: 'post',
      headers: {
        'Origin': 'http://localhost',
        'Content-Type': 'application/octet-stream'
      },
      body: dataToDecrypt
    }
  )
  console.log(returnType)
  return returnType === 'Uint8Array' ? result.arrayBuffer() : result.json()
}
