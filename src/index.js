module.exports = {
  createAction: require('./createAction'),
  createHmac: require('./createHmac'),
  createSignature: require('./createSignature'),
  decrypt: require('./decrypt'),
  encrypt: require('./encrypt'),
  encryptFromFile: require('./encryptFromFile'),
  decryptFromFile: require('./decryptFromFile'),
  getPublicKey: require('./getPublicKey'),
  getVersion: require('./getVersion'),
  isAuthenticated: require('./isAuthenticated'),
  verifyHmac: require('./verifyHmac'),
  verifySignature: require('./verifySignature'),
  waitForAuthentication: require('./waitForAuthentication'),
  getAvatar: require('./ninja/getAvatar'),
  getPaymail: require('./ninja/getPaymail')
}
