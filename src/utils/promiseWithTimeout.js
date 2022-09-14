/** Provides a timedout promise.
 * @param {Object} obj All parameters for this function are provided in an object
 * @param {Number} obj.timeout Timeout in milli seconds, promise interupted, control returned, if not completed after `timeout` milliseconds.
 * @param {Function} The promised function to be run to completion or interupted, control returned, after `timeout` milliseconds.
 */
module.exports = async ({
  timeout,
  promise
}) => {
  Promise.timeout = function (timeout, promise) {
    return Promise.race([
      promise,
      new Promise(function (resolve, reject) {
        setTimeout(function () { reject('Timed out') }, timeout)
      })
    ])
  }
}
