const fetch =
  typeof window === 'object'
    ? window.fetch
    : require('isomorphic-fetch')
/**
 * Waits for a user to be authenticated.
 *
 * @returns {Promise<Object>} An object containing a boolean indicating that a user is authenticated
*/
module.exports = async () => {
  const result = await fetch(
     `http://localhost:3301/v1/waitForAuthentication`,
    {
      method: 'post',
      headers: {
        'Origin': 'http://localhost',
        'Content-Type': 'application/json'
      },
    }
  )
  return result.json()
}
