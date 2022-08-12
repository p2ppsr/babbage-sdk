const makeHttpRequest = require('../utils/makeHttpRequest')
/**
  * Returns the name and photo URL of the user
  * @returns {Promise<Object>} An object containing the name and a HTTPS or UHRP URL to a photo of the user
  */
module.exports = async () => {
  const result = await makeHttpRequest(
    'http://localhost:3301/v1/ninja/avatar',
    {
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
  return result
}
