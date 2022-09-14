const makeHttpRequest = require('./makeHttpRequest')
// const makeHttpRequest = request('./makeHttpRequest')
// Set substrate according to availability and kernel compatability
let substrate
const communicator = async () => {
  console.log('communicator():this.substrate:', this.substrate)
  if (this.substrate === 'babbage-xdm' || this.substrate === 'cicada-api') return
  try {
    // TODO need to use messageHandler()
    console.log('communicator():typeof window.parent.postMessage:', typeof window.parent.postMessage)
    const getID = () => Buffer.from(require('crypto').randomBytes(8)).toString('base64')
    const id = getID()
    if (typeof window.parent.postMessage === 'function') {
      // Use a promise with timeout
      const ids = {}
      console.log('communicator():new Promise')
      return new Promise((resolve, reject) => {
        window.addEventListener('message', async e => {
          // console.log('communicator():parent:message received:id', id)
          // console.log('communicator():e.data.type:', e.data.type)
          // console.log('communicator():e.isTrusted:', e.isTrusted)
          // console.log('communicator():e.data.id:', e.data.id)
          // console.log('communicator():e.data.result:', e.data.result)
          if (e.data.type !== 'CWI' || !e.isTrusted || e.data.id !== id) return
          const xdmKernelVersion = e.data.result
          console.log('communicator():message:xdmKernelVersion', xdmKernelVersion)
          if (typeof xdmKernelVersion === 'string') {
            if (!xdmKernelVersion.startsWith('0.3.')) {
              const e = new Error(`Error in XDM kernel version ${xdmKernelVersion}`)
              e.code = 'ERR_XDM_INCOMPATIBLE_KERNEL'
              reject(e)
              throw e
            }
            // console.log('communicator():xdmKernelVersion:', xdmKernelVersion)
            this.substrate = 'babbage-xdm'
            console.log('communicator():substrate:', substrate)
          } else {
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
              reject(e)
              throw e
            }
            this.substrate = 'cicada-api'
          }
          resolve(this)
        })
        console.log('communicator():-> new Promise')
        console.log('communicator():id:', id)
        window.parent.postMessage({
          type: 'CWI',
          id,
          call: 'getVersion'
        }, '*')
        ids[id] = result => {
          console.log('communicator():before resolve(result):result', result)
          resolve(this)
          // console.log('communicator():after resolve(result):ids:', ids)
          // delete ids[id]
          // xdmKernelVersion = result
          // console.log('1 communicator():xdmKernelVersion:', xdmKernelVersion)
          // Check kernel compatability
        }
      })
      // console.log('2 communicator():xdmKernelVersion:', xdmKernelVersion)
    }
  } catch (e) {
    console.log(e)
    const e_ = new Error('Error the user does not have a current Babbage identity')
    e_.code = 'ERR_NO_METANET_IDENTITY'
    throw e_
  }
}

module.exports = communicator
