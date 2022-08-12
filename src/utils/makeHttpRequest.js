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
  const responseBuffer = await response.arrayBuffer()
  if (response.status !== 200) {
    return new Error(JSON.parse(Buffer.from(responseBuffer).toString()).message)
  } else {
    return responseBuffer
  }
}
