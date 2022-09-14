const makeHttpRequest = require('./makeHttpRequest')
try {
  const httpGetVersion = async () => {
    const httpKernelVersion = await makeHttpRequest(
      'http://localhost:3301/v1/version',
      {
        method: 'get',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    console.log('communicator():httpKernelVersion:', httpKernelVersion)

    // Check kernel compatability
    if (httpKernelVersion && !httpKernelVersion.startsWith('0.3.')) {
      const e = new Error(`Error in Desktop kernel version ${httpKernelVersion}`)
      e.code = 'ERR_DESKTOP_INCOMPATIBLE_KERNEL'
      // reject(e)
      throw e
    }
    this.substrate = 'cicada-api'
  }

  const communicator = async () => {
    console.log('communicator():this.substrate:', this.substrate)

    // substrate already set, so just return
    if (this.substrate === 'babbage-xdm' || this.substrate === 'cicada-api') return this
    if (typeof window.parent.postMessage === 'function') {
      // Use a promise with timeout
      // const ids = {}
      return new Promise((resolve) => {
        const id = Buffer.from(require('crypto').randomBytes(8)).toString('base64')
        window.addEventListener('message', async e => {
          if (e.data.type !== 'CWI' || !e.isTrusted || e.data.id !== id) return
          const xdmKernelVersion = e.data.result
          console.log('communicator():message:xdmKernelVersion', xdmKernelVersion)
          if (typeof xdmKernelVersion === 'string') {
            if (!xdmKernelVersion.startsWith('0.3.')) {
              const e = new Error(`Error in XDM kernel version ${xdmKernelVersion}`)
              e.code = 'ERR_XDM_INCOMPATIBLE_KERNEL'
              throw e
            }
            // console.log('communicator():xdmKernelVersion:', xdmKernelVersion)
            this.substrate = 'babbage-xdm'
          } else {
            httpGetVersion()
          }
          console.log('communicator():this.substrate:', this.substrate)
          resolve(this)
        })

        // Get the parent version to check its compatability
        console.log('communicator():id:', id)
        window.parent.postMessage({
          type: 'CWI',
          id,
          call: 'getVersion'
        }, '*')
      })
    } else {
      console.log('communicator():direct call httpGetVersion()')
      httpGetVersion()
      return this
    }
  }
  module.exports = communicator
} catch (e) {
  console.log(e)
  const e_ = new Error('Error the user does not have a current Babbage identity')
  e_.code = 'ERR_NO_METANET_IDENTITY'
  throw e_
}
