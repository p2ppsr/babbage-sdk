const makeHttpRequest = require('./makeHttpRequest')
const httpGetVersion = async () => {
  try {
    const httpKernelVersion = await makeHttpRequest(
      'http://localhost:3301/v1/version',
      {
        method: 'get',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    // Check kernel compatability
    if (httpKernelVersion && !httpKernelVersion.startsWith('0.3.')) {
      const e = new Error(`Error in Desktop kernel version ${httpKernelVersion}`)
      e.code = 'ERR_DESKTOP_INCOMPATIBLE_KERNEL'
      throw e
    }
    this.substrate = 'cicada-api'
  } catch (error) {
    console.error(`ERR_NO_METANET_IDENTITY: ${error}`)
  }
}

const communicator = async () => {
  // console.log('communicator():this.substrate:', this.substrate)
  try {
    // substrate already set, so just return
    if (this.substrate === 'babbage-xdm' || this.substrate === 'cicada-api') return this

    // TODO need 200ms timeout
    return new Promise((resolve, reject) => {
      const id = Buffer.from(require('crypto').randomBytes(8)).toString('base64')
      window.addEventListener('message', async e => {
        if (e.data.type !== 'CWI' || !e.isTrusted || e.data.id !== id) return
        const xdmKernelVersion = e.data.result
        // console.log('communicator():message:xdmKernelVersion', xdmKernelVersion)
        if (typeof xdmKernelVersion === 'string') {
          if (!xdmKernelVersion.startsWith('0.3.')) {
            const e = new Error(`Error in XDM kernel version ${xdmKernelVersion}`)
            e.code = 'ERR_XDM_INCOMPATIBLE_KERNEL'
            reject(e)
            throw e
          }
          // console.log('communicator():xdmKernelVersion:', xdmKernelVersion)
          this.substrate = 'babbage-xdm'
        } else {
          // console.log('communicator():in Promise call httpGetVersion()')
          await httpGetVersion()
        }
        // console.log('communicator():this.substrate:', this.substrate)
        resolve(this)
      })

      // Get the parent version to check its compatability
      window.parent.postMessage({
        type: 'CWI',
        id,
        call: 'getVersion'
      }, '*')
    })
    // TODO: See above
    // } else {
    //  console.log('communicator():direct call httpGetVersion()')
    //  await httpGetVersion()
    //  return this
    // }
  } catch (e) {
    console.error(e)
    const e_ = new Error('The user does not have a current Babbage identity')
    e_.code = 'ERR_NO_METANET_IDENTITY'
    throw e_
  }
}

module.exports = communicator
