const { isNode } = require('browser-or-node')
const makeHttpRequest = require('./makeHttpRequest')

const communicator = async () => {
  // substrate already set, so just return
  if (this.substrate === 'babbage-xdm' || this.substrate === 'cicada-api') return this
  if (isNode) { // Node always uses HTTP
    this.substrate = 'cicada-api'
    return this
  }
  return new Promise((resolve, reject) => {
    try {
      const id = Buffer.from(require('crypto')
        .randomBytes(8)).toString('base64')
      window.addEventListener('message', async e => {
        try {
          if (e.data.type !== 'CWI' || !e.isTrusted || e.data.id !== id) return
          let version, substrate
          if (typeof e.data.result === 'string') {
            version = e.data.result
            substrate = 'babbage-xdm'
          } else {
            try {
              version = await makeHttpRequest(
                'http://localhost:3301/v1/version',
                {
                  method: 'get',
                  headers: {
                    'Content-Type': 'application/json'
                  }
                }
              )
              substrate = 'cicada-api'
            } catch (e) {
              try {
                version = await window.CWI.getVersion()
                substrate = 'window-api'
              } catch (_) {
                const e = new Error('Unable to connect')
                e.code = 'ERR_NO_CONNECTION'
                throw e
              }
            }
          }

          // Check the kernel's compatibility before resolving
          if (version && !version.startsWith('0.3.')) {
            const e = new Error(`Your MetaNet portal is running an incompatible kernel version ${version} This SDK requires a 0.3.x kernel`)
            e.code = 'ERR_INCOMPATIBLE_KERNEL'
            e.compatibleKernels = '0.3.x'
            e.invalidVersion = version
            reject(e)
            return
          }

          this.substrate = substrate
          this.version = version
          resolve(this)
        } catch (e) {
          if (e.code === 'ERR_NO_CONNECTION') {
            throw new Error('Unable to connect')
          } else {
            reject(e)
          }
        }
      })

      // Establish the correct Substrate and check the Version for compatibility
      window.parent.postMessage({
        type: 'CWI',
        id,
        call: 'getVersion'
      }, '*')
    } catch (_) {
      const err = new Error('The user does not have a current Babbage identity')
      err.code = 'ERR_NO_METANET_IDENTITY'
      reject(err)
    }
  })
}

module.exports = communicator
