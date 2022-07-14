const makeHttpRequest = require('../utils/makeHttpRequest')
/**
  * Returns the current user's Paymail handle
  * @returns {Promise<String>} The Paymail handle
  */
module.exports = async () => {
  const result = await makeHttpRequest(
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