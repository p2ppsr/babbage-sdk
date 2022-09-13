/** Provides a timedout promise.
 * @param {Object} obj All parameters for this function are provided in an object
 * @param {Number} obj.timeout Timeout in milli seconds, promise interupted, control returned, if not completed after `timeout` milliseconds.
 * @param {Function} The promised function to be run to completion or interupted, control returned, after `timeout` milliseconds.
 */
module.exports = async ({
  timeout,
  promise
}) => {
  const timedout = new Promise((resolve, reject) =>
    setTimeout(() =>
      reject(`Timed out after ${timeout} ms.`),
    timeout
    )
  )
  return Promise.race([
    promise,
    timedout
  ])
}
