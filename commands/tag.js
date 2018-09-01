const funcmatic = require('../lib/funcmatic')
const moment = require('moment')
var Table = require('cli-table2')

async function tag(user, api, fdraft, f, alias, version) {
  if (!user) {
    console.log(`Use 'funcmatic login' to first authenticate.`)
  }
  if (!f) {
    console.log(`Function @${fdraft.username}/${fdraft.name} is not published`)
    return
  }
  var versions = await funcmatic.tag(api, f.id, alias, version)
  
    // instantiate
  var table = new Table({
    head: ['Version', 'Tags', 'Date', ],
    colWidths: [15, 20, 40 ]
  })

  for (var v of versions) {
    table.push([ 
      v.version, 
      v.aliases.join(', '),
      `${moment(v.updated_at).format('YYYY-MM-DD h:mm:ssa')} (${moment(v.updated_at).fromNow()})`, 
    ])
  }

  console.log(table.toString())

  return versions
}

module.exports = tag