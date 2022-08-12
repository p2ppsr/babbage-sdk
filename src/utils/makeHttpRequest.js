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

  // Determine the request success and response content type
  if (response.headers.get('content-type') === 'application/octet-stream') {
    // Success
    return await response.arrayBuffer()
  }
  const parsedJSON = await response.json()
  if (parsedJSON.status === 'error') {
    const e = new Error(parsedJSON.message)
    e.code = 'ERR_BAD_DATA'
    throw e
  }
  return parsedJSON.result
}
