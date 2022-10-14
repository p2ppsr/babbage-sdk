const connectToSubstrate = require('./utils/connectToSubstrate')
/**
 * Returns the current version of the kernal
 * @returns {Promise<String>} The current kernel version (e.g. "0.3.49")
 */
module.exports = async () => {
  const connection = await connectToSubstrate()
  return connection.version
}
