const funcmatic = require('../lib/funcmatic')

async function tag(user, api, fdraft, f, alias, version) {
  console.log("TAG!")
  if (!user) {
    console.log(`Use 'funcmatic login' to first authenticate.`)
  }
  if (!f) {
    console.log(`Function @${fdraft.username}/${fdraft.name} is not published`)
    return
  }
  var ret = await funcmatic.untag(api, f.id, alias, version)
  console.log("RET", ret)
  return ret
}

module.exports = tag