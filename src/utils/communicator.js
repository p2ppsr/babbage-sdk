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
  const withTimedout = (millis, promise) => {
    const timeout = new Promise((resolve, reject) =>
      setTimeout(() => 
        reject(`Timed out after ${millis} ms.`),
        millis
      )
    )
    return Promise.race([
      promise,
      timeout
    ])
  }

  try {
    let substrate
    const kernelVersion = await withTimedout(200, getXdmKernelVersion()) //Prosperity Client App’s runCommand
    if (kernelVersion && !kernelVersion.startsWith('0.3.')){
      const e = new Error(`Error in XDM kernel version ${kernelVersion}`)
      e.code = ERR_XDM_INCOMPATIBLE_KERNEL
      throw e
    } else {
      substrate = 'babbage-xdm'

    }
    let success = false
    (
      'http://localhost:3301/v1/version',
      {
        method: 'get',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )    
    if(res.code === 200){
      success = true
      kernelVersion = res.message
      if (kernelVerson && !kernelVerson.startsWith('0.3.')){
        const e = new Error(`Error in Desktop kernel version ${kernelVersion}`)
        e.code = ERR_DESKTOP_INCOMPATIBLE_KERNEL
        throw e
      }
      substrate = 'cicada-api'

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

      // Determine the request success and response content type
      if (response.headers.get('content-type') === 'application/octet-stream') {
        // Success
        return await response.arrayBuffer()
      }
      const parsedJSON = await response.json()
      if (parsedJSON.status === 'error') {
        const e = new Error(parsedJSON.description)
        e.code = parsedJSON.code || 'ERR_BAD_REQUEST'
        throw e
      }
      return parsedJSON.result
    }
  } catch(e){
    console.log(e)
    throw e
  }
}
  /*
The communicator then sends out a getVersion request to the Port 3301 API (see current Babbage SDK code for an example of this request).

If a response is received, and if the kernel is 0.3.x, then the Communicator assigns cicada-api to the substrate global.

If a response is received for a non-0.3.x kernel version, an ERR_INCOMPATIBLE_KERNEL error is thrown by the Communicator for the host application

If a response is not received, or if the HTTP request otherwise fails, then the Communicator goes to the next stage.

If the Communicator reaches the final stage, without having been able to establish connectivity with any CWI kernels, then there is no Babbage identity, and the user needs to install Babbage. A ERR_NO_METANET_IDENTITY error is raised for the host application

ELSE the substrate global variable was already previously defined by earlier SDK calls, or it has now just been populated by the above process. At this point, we know that we have a valid substrate for any requests that will be sent by the Communicator.

IF the substrate variable is cicada-api, then the Communicator sends the request over the Port 3301 API, the same as is currently implemented.

ELSE IF the substrate variable is babbage-xdm, then the Communicator uses cross-domain messaging to communicate with a kernel using an inter-iframe protocol. 

The code for Prosperity-Client-App should be referenced and adapted for this purpose.

Do not create a window.CWI instance as the Client App does, and do not rely on listFunctions to define the API, but directly call the specific command based on the SDK API function being executed.

Implement the “Client App” side of the communication system, and assume that you will be conversing with a running kernel on the other side. Assume that the kernel you are conversing with on the other side is implemented using the code that can be found in the MessageHandler component of the Prosperity codebase.

GIVEN that the Prosperity Client App is now using your new SDK changes (you may npm link the new SDK to Prosperity Client App)

WHEN the “Test Encryption” or “Test Action” buttons are clicked

THEN, without relying on the old runCommand.js or any code aside from the new version of the Babbage SDK, the Prosperity Client App continues to function, using just the new SDK

WHEN the Prosperity Client App is ran outside of Prosperity Desktop, and is forced to use a locally-running Babbage Desktop instance over HTTP

THEN the Client App continues to function — it will now behave the same as any HTTP-based Babbage application with the new, unified SDK.

Developer Notes
The Communicator, similar to something like Bridgeport-API-Client’s createSignedRequest, is something that all the SDK API Functions call, with their parameters. Currently, it takes the form of the SDK makeHttpRequest util, but this new functionality will enable the SDK to be used over more than just HTTP.

Future substrates, for iOS and Android communication protocols that bind between native app code and WebViews, will be implemented trivially after the system works within Prosperity Desktop.
*/