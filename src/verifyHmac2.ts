const fetch =
  typeof window === 'object'
    ? window.fetch
    : require('isomorphic-fetch')
export const verifyHmac = async ({
  dataToVerify, 
  hmac, 
  protocolID, 
  keyID, 
  description = '', 
  counterparty = 'self', 
  privileged = false
}) => {
  const result = await fetch(
    `http://localhost:3301/v1/verifyHmac?protocolID=${protocolID}&keyID=${keyID}&description=${description}&counterparty=${counterparty}&privileged=${privileged}&hmac=${hmac}`,
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
