const BabbageSDK = require('../index')

const test = async () => {
  return await BabbageSDK.getVersion('HelloWorld', 1)
}
module.exports = { test }