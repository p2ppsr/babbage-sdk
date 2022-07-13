const fetch =
  typeof window === 'object'
    ? window.fetch
    : require('isomorphic-fetch')
/**
 * Checks if a user is currently authenticated.
 *
 * @returns {Promise<Object>} Returns an object indicating whether a user is currently authenticated.
*/
module.exports = async () => {
  const result = await fetch(
     `http://localhost:3301/v1/isAuthenticated`,
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
