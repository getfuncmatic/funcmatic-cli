const funcmatic = require('../lib/funcmatic')
const formatter = require('../lib/formatter')

async function tag(user, api, fdraft, f, alias, version) {
  if (!user) {
    console.log(`Use 'funcmatic login' to first authenticate.`)
  }
  if (!f) {
    console.log(`Function @${fdraft.username}/${fdraft.name} is not published`)
    return
  }
  var versions = await funcmatic.untag(api, f.id, alias, version)
  console.log(formatter.versionsTable(versions))
  return versions
}

module.exports = tag