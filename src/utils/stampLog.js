/**
 * If a log is being kept, add a time stamped line.
 * @param log  Optional time stamped log to extend
 * @param lineToAdd Content to add to line.
 * @returns undefined or log extended by time stamped `lineToAdd` and new line.
 */
module.exports = (log, lineToAdd) => {
  if (typeof log !== 'string') return undefined
  return log + `${new Date().toISOString()} ${lineToAdd}\n`
}