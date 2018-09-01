const funcmatic = require('../lib/funcmatic')
const formatter = require('../lib/formatter')

async function versions(user, api, fdraft, f) {
  if (!user) {
    console.log(`Use 'funcmatic login' to first authenticate.`)
  }
  if (!f) {
    console.log(`Function @${fdraft.username}/${fdraft.name} is not published`)
    return
  }
  
  var versions = await funcmatic.versions(api, f.id)

  console.log(formatter.versionsTable(versions))

  return versions
}

module.exports = versions