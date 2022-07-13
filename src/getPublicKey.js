const fetch =
  typeof window === 'object'
    ? window.fetch
    : require('isomorphic-fetch')
module.exports = async ({
  protocolID, 
  keyID, 
  privileged = false, 
  identityKey = false, 
  reason = 'No reason provided.'
}) => {
  const result = await fetch(
     `http://localhost:3301/v1/publicKey` + 
     `?protocolID=${protocolID}` + 
     `&keyID=${keyID}` + 
     `&privileged=${privileged}` + 
     `&identityKey=${identityKey}` + 
     `&reason=${reason}`,
    {
      method: 'get',
      headers: {
        'Origin': 'http://localhost',
        'Content-Type': 'application/json'
      },
    }
  )
  return result.json()
}
