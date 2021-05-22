const fetch = window.fetch || require('isomorphic-fetch')
const handlers = {}
const apiFunctions = [
  'getPrimarySigningPub',
  'getPrivilegedSigningPub',
  'encrypt',
  'decrypt',
  'createSignature',
  'createHmac',
  'createAction',
  'sendDataTransaction',
  'getVersion',
  'isAuthenticated',
  'waitForAuthentication',
  'ninja/getPaymail',
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
            params[key] = Buffer.from(value).toString('base64')
          }
        }
        /*
          Uint8Arrays inside the "data" property (i.e. sendDataTransaction) are also converted
        */
        if (key === 'data' && Array.isArray(value)) {
          value.forEach((el, i) => {
            if (el.constructor === Uint8Array) {
              params.data[i] = Buffer.from(el).toString('base64')
            }
          })
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
        body: JSON.stringify({
          params,
          requestID: require('crypto').randomBytes(16).toString('base64')
        })
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
