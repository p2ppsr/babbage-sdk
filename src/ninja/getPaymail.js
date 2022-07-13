const fetch =
  typeof window === 'object'
    ? window.fetch
    : require('isomorphic-fetch')
/**
  * Returns the current user's Paymail handle
  * @returns {Promise<String>} The Paymail handle
  */
module.exports = async () => {
  const result = await fetch(
     `http://localhost:3301/v1/ninja/paymail`,
    {
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      },
    }
  )
  return result.json()
}