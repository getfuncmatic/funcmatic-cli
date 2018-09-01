const moment = require('moment')
var Table = require('cli-table2')
const funcmatic = require('../lib/funcmatic')
const formatter = require('../lib/formatter')

async function info(user, api, fdraft, f, alias, version) {
  if (!user) {
    console.log(`Use 'funcmatic login' to first authenticate.`)
  }
  console.log(formatter.functionTable(f))
  console.log()
}

module.exports = info