/** Provides a timedout promise.
 * @param {Object} obj All parameters for this function are provided in an object
 * @param {Number} obj.timeout Timeout in milliseconds, promise interupted, control returned, if not completed after `timeout` milliseconds.
 * @param {Function} obj.promise The promised function to be run to completion or interupted, control returned, after `timeout` milliseconds.
 * @param {Error} obj.error The error that is thrown if the time expires.
 */
module.exports = async ({
  timeout,
  promise,
  error
}) => {
  if (!error) error = new Error('Timed out')
  return Promise.race([
    promise,
    new Promise((resolve, reject) => setTimeout(() => reject(error), timeout))
  ])
}
