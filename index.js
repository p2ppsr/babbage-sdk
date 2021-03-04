const fetch = window.fetch || require('isomorphic-fetch')
const handlers = {}
const apiFunctions = [
  'getPrimarySigningPub',
  'getPrivilegedSigningPub',
  'encrypt',
  'decrypt',
  'createSignature',
  'createHmac',
  'sendDataTransaction',
  'getVersion',
  'isAuthenticated',
  'waitForAuthentication',
  'ninja/getPaymail',
  'ninja/getTransactionWithOutputs',
  'ninja/processOutgoingTransaction',
  'ninja/getAvatar'
]

apiFunctions.forEach(name => {
  const handler = async params => {

    /*
      Since the parameters are sent over HTTP, certain values must be converted.
    */
    if (typeof params === 'object') {
      Object.entries(params).map(([key, value]) => {
        if (typeof value !== 'undefined') {
          // Uint8Arrays need to be converted to strings.
          if (value.constructor === Uint8Array) {
            params[key] = btoa(String.fromCharCode.apply(null, value))
          }
        }
      })
    }
    const result = await fetch(
      `http://localhost:3301/v1/${name}`,
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        referrerPolicy: 'no-referrer',
        redirects: 'no-follow',
        cache: 'no-cache',
        body: JSON.stringify({ params })
      }
    )
    let parsedResult = await result.json()
    if (parsedResult.status === 'success') {
      return parsedResult.result
    } else {
      throw new Error(parsedResult.message)
    }
  }
  if (name.indexOf('/') === -1) {
    handlers[name] = handler
  } else {
    if (typeof handlers[name.split('/')[0]] === 'undefined') {
      handlers[name.split('/')[0]] = {}
    }
    handlers[name.split('/')[0]][name.split('/')[1]] = handler
  }
})

module.exports = handlers
