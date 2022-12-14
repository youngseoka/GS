'use strict'

const addAll = require('./add-all')
const last = require('it-last')
const configure = require('./lib/configure')

/**
 * @typedef {import('./types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/root').API<HTTPClientExtraOptions>} RootAPI
 */

/**
 * @param {import('./types').Options} options
 */
module.exports = (options) => {
  const all = addAll(options)
  return configure(() => {
    /**
     * @type {RootAPI["add"]}
     */
    async function add (input, options = {}) {
      // @ts-ignore - last may return undefined if source is empty
	console.log("/home/dogcorgi/Hyperledger_Fabric_1.2/setup/vm1/api-2.0/ipfs-http-client/src/add.js")
	console.log("options : " + JSON.stringify(options))
      return await last(all(input, options))
    }
    return add
  })(options)
}
