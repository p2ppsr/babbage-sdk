const makeHttpRequest = require('./makeHttpRequest')
const promiseWithTimeout = require('./promiseWithTimeout')

/**
 * Obtains the version by using the local window.CWI instance.
 * Fails of no CWI instance exists within the local window.
 */
const getWindowVersion = () => window.CWI.getVersion()

/**
 * Uses cross-document messaging to obtain a substrate connection.
 * Fails after 200ms if no version response is received.
 */
const getXDMVersion = () => {
  const versionPromise = new Promise((resolve, reject) => {
    try {
      const id = Buffer.from(getRandomID()).toString('base64')
      window.addEventListener('message', async e => {
        try {
          if
          (e.data.type !== 'CWI' ||
            !e.isTrusted ||
            e.data.id !== id ||
            typeof e.data !== 'object' ||
            typeof e.data.result !== 'string'
          ) {
            return
          }
          resolve(e.data.result)
        } catch (e) {
          reject(e)
        }
      })
      window.parent.postMessage({
        type: 'CWI',
        id,
        call: 'getVersion'
      }, '*')
    } catch (e) {
      reject(e)
    }
  })
  return promiseWithTimeout({
    promise: versionPromise,
    timeout: 200
  })
}

/**
 * Uses the HTTP local port 3301 API to request the version.
 * Fails if HTTP errors are encountered, or no server is running.
 */
const getHTTPVersion = () => makeHttpRequest(
  'http://localhost:3301/v1/version',
  {
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    }
  }
)

const communicator = async () => {
  // If a cached substrate exists, it is immediately returned.
  if (
    (
      this.substrate === 'babbage-xdm' ||
      this.substrate === 'cicada-api' ||
      this.substrate === 'window-api'
    ) &&
    typeof this.version === 'string'
  ) {
    return this
  }

  const noIdentityErrorMessage = 'The user does not have a current Babbage identity. Initialize a MetaNet portal onto one of the supported substrates. Supported substrates are "window-api", "babbage-xdm", and "cicada-api".'
  const noIdentitySupportedSubstrates = ['window-api', 'babbage-xdm', 'cicada-api']
  if (typeof window !== 'object') { // Node always uses HTTP
    try {
      this.version = await getHTTPVersion()
      this.substrate = 'cicada-api'
      return this
    } catch (_) {
      // If there's no window object for XDM or window.CWI and HTTP fails
      // then there is no currently-possible way to connect.
      const err = new Error(noIdentityErrorMessage)
      err.code = 'ERR_NO_METANET_IDENTITY'
      err.supportedSubstrates = noIdentitySupportedSubstrates
      throw err
    }
  }

  // Probe each substrate until a response is received.
  let version, substrate

  // 1. Local Window — window.CWI — "window-api"
  if (typeof version !== 'string' || typeof substrate !== 'string') {
    try {
      version = await getWindowVersion()
      substrate = 'window-api'
    } catch (_) { /* window.CWI errored, proceed to next substrate. */ }
  }

  // 2. XDM — Cross-document Messaging — "babbage-xdm"
  if (typeof version !== 'string' || typeof substrate !== 'string') {
    try {
      version = await getXDMVersion()
      substrate = 'babbage-xdm'
    } catch (_) { /* XDM errored, proceed to next substrate. */ }
  }

  // 3. HTTP — Port 3301 — "cicada-api"
  if (typeof version !== 'string' || typeof substrate !== 'string') {
    try {
      version = await getHTTPVersion()
      substrate = 'cicada-api'
    } catch (_) { /* HTTP errored, proceed to next substrate. */ }
  }

  // All substrates probed, an ERR_NO_METANET_IDENTITY condition exists if no
  // substrate was successfully connected.
  if (typeof version !== 'string' || typeof substrate !== 'string') {
    const err = new Error(noIdentityErrorMessage)
    err.code = 'ERR_NO_METANET_IDENTITY'
    err.supportedSubstrates = noIdentitySupportedSubstrates
    throw err
  }

  // Check the kernel's compatibility before resolving
  if (!version.startsWith('0.3.')) {
    const e = new Error(`Your MetaNet portal is running an incompatible kernel version ${version} This SDK requires a 0.3.x kernel`)
    e.code = 'ERR_INCOMPATIBLE_KERNEL'
    e.compatibleKernels = '0.3.x'
    e.invalidVersion = version
    throw e
  }

  // Saving the version and substrate for future requests improves performance.
  this.substrate = substrate
  this.version = version
  return this
}

module.exports = communicator
