const { isNode } = require('browser-or-node')
const fetch =
  isNode
    ? require('isomorphic-fetch')
    : window.fetch
// Wrapper function around the fetch API
module.exports = async (
  routeURL,
  requestInput = {}
) => {
  // If we're in a node environment, we need to inject the Orign header
  if (isNode) {
    requestInput.headers = {
      ...requestInput.headers,
      Origin: 'http://localhost'
    }
  }
  const response = await fetch(
    routeURL,
    requestInput
  )

  // Get the results and determine if an error was returned
  const responseAsBuffer = Buffer.from(await response.arrayBuffer())
  if (response.status !== 200) {
    // Error
    throw new Error(JSON.parse(Buffer.from(responseAsBuffer).toString()).message)
  } else {
    // Success
    // Determine the type of data requested
    try {
      // Check for valid JSON data to return
      const jsonData = JSON.parse(Buffer.from(responseAsBuffer).toString()).result
      return jsonData
    } catch (error) {
      // Data as a Buffer returned
      return responseAsBuffer
    }
  }
}
