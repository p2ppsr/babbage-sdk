// Set substrate according to availability and kernel compatability
let substrate
const communicator = async () => {
  try {
    // TODO need to use messageHandler()
    if (window.parent) {
      // Use a promise with timeout
      await new Promise(resolve => setTimeout(resolve, 200))
      const ids = {}
      const xdmKernelVersion = new Promise(resolve => {
        window.parent.postMessage({
          type: 'CWI',
          id: Buffer.from(require('crypto').randomBytes(8)).toString('base64'),
          call: 'getVersion',
        }, '*')
        ids[id] = result => {
          resolve(result)
          delete ids[id]
        }
      })
      console.log('communicator():xdmKernelVersion:', xdmKernelVersion)

      // Check kernel compatability
      if (!httpKernelVersion || !httpKernelVersion.startsWith('0.3.')) {
        const e = new Error(`Error in XDM kernel version ${httpKernelVersion}`)
        e.code = 'ERR_XDM_INCOMPATIBLE_KERNEL'
        throw e
      }
      console.log('communicator():httpKernelVersion:', httpKernelVersion)
      substrate = 'babbage-xdm'
    }
    substrate = 'cicada-api'
    httpKernelVersion = await require('../getVersion')(false)
    substrate = undefined
    console.log('communicator():httpKernelVersion:', httpKernelVersion)

    // Check kernel compatability
    if (!httpKernelVersion || !httpKernelVersion.startsWith('0.3.')) {
      const e = new Error(`Error in Desktop kernel version ${httpKernelVersion}`)
      e.code = 'ERR_DESKTOP_INCOMPATIBLE_KERNEL'
      throw e
    }
    substrate = 'cicada-api'
  } catch (e) {
    console.log(e)
    const e_ = new Error('Error the user does not have a current Babbage identity')
    e_.code = 'ERR_NO_METANET_IDENTITY'
    throw e_
  }
}

module.exports = communicator
