const fetch =
  typeof window === 'object'
    ? window.fetch
    : require('isomorphic-fetch')
module.exports = async () => {
  const result = await fetch(
     `http://localhost:3301/v1/isAuthenticated`,
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
