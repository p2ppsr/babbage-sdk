const makeHttpRequest = require('./makeHttpRequest')

const noIdentityErrorMessage = 'The user does not have a current Babbage identity'

const communicator = async () => {
  // substrate already set, so just return
  if (
    this.substrate === 'babbage-xdm' ||
    this.substrate === 'cicada-api' ||
    this.substrate === 'window-api'
  ) {
    return this
  }
  if (typeof window !== 'object') { // Node always uses HTTP
    try {
      this.version = await makeHttpRequest(
        'http://localhost:3301/v1/version',
        {
          method: 'get',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      this.substrate = 'cicada-api'
      return this
    } catch (_) {
      const err = new Error(noIdentityErrorMessage)
      err.code = 'ERR_NO_METANET_IDENTITY'
    }
  }
  return new Promise((resolve, reject) => {
    try {
      const id = Buffer.from(require('crypto')
        .randomBytes(8)).toString('base64')
      /*
        TODO: Rework the logic for XDM.
        Currently, we are:
        - sending an XDM message
        - within the message handler, we ALWAYS see the OUTGOING (not incoming) XDM message. All the logic runs when the message is SENT, not when a response from any potential XDM responder would be received.
        - Then, we check for the XDM response. This check ALWAYS fails, because we are handling the event from an OUTGOING XDM message.
        - Then, we try to use HTTP, and failing that, we try to use window.CWI.
        - If both HTTP and window.CWI fail, an error rejects the Promise.
        - Therefore, no XDM support truly exists anymore.
        - If an XDM responder DOES respond, then we have already most likely rejected the promise with an Error.
        - It is still possible for XDM to work, if during the time the HTTP version request is in-flight, the message handler fires again with the INCOMING XDM message.
        - In that case, the INCOMING message will pass the check, the substrate will be set to Babbage-XDM, the version will be assigned, and the Promise will be resolved successfully for XDM, all while the version HTTP request is in-flight.
        - Then, the version request returns from being in-flight, and either resolves or rejects the Promise, and if it resolves, could overwrite this.substrate again, now to reflect HTTP for future requests, even though the first call had returned Babbage-XDM for the substrate.
        - This is non-ideal, and should change.

        What we need is a function that sends an XDM request, only allows the message handler to fire on INCOMING responses, waits for 200ms for any responders to send a response, and after 200ms will terminate the XDM request with an error. Otherwise, the message response handler would resolve the Promise with the correct version.

        We can then call such a function at the beginning. If there is an error, we would try HTTP. If there was an error with HTTP, we would try to use window.CWI. If there was an error with window.CWI, we would throw ERR_NO_METANET_IDENTITY to the caller.
      */
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
      const err = new Error(noIdentityErrorMessage)
      err.code = 'ERR_NO_METANET_IDENTITY'
      reject(err)
    }
  })
}

module.exports = communicator
