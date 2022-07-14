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
  return response
}
