const fetch =
  typeof window === 'object'
    ? window.fetch
    : require('isomorphic-fetch')
/**
  * Returns the name and photo URL of the user
  * @returns {Promise<Object>} An object containing the name and a HTTPS or UHRP URL to a photo of the user
  */
module.exports = async () => {
  const result = await fetch(
     `http://localhost:3301/v1/ninja/avatar`,
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