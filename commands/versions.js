const funcmatic = require('../lib/funcmatic')
const moment = require('moment')
var Table = require('cli-table2')
 
async function versions(user, api, fdraft, f) {
  if (!user) {
    console.log(`Use 'funcmatic login' to first authenticate.`)
  }
  if (!f) {
    console.log(`Function @${fdraft.username}/${fdraft.name} is not published`)
    return
  }
  
  var versions = await funcmatic.versions(api, f.id)

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


  // var url = `/f/${f.id}/versions`
  // var res = (await api.get(url)).data
  // var versions = [ ]
  // for (var v of res.versions) {
  //   versions.push({
  //     version: v.Version,
  //     updated_at: v.LastModified,
  //     description: v.Description,
  //     aliases: [ ]
  //   })
  // }
  // for (var a of res.aliases) {
  //   for (var v of versions) {
  //     if (v.version == a.FunctionVersion) {
  //       v.aliases.push(a.Name)
  //     }
  //   }
  // }
  // for (var v of versions) {
  //   console.log(`${v.version}\t${v.updated_at}\t${v.aliases.join(', ')}`)
  // }

  return versions
}

module.exports = versions