const ora = require('ora')

const funcmatic = require('../lib/funcmatic')
const formatter = require('../lib/formatter')

async function remove(user, api, fdraft, f, version) {
  if (!f || !f.id) {
    console.log(`No deployed function to remove.`)
  }
  if (!version) {
    // should ask for confirmation here
    console.log(`Removing function ${f.name} (${f.id}) ...`)
    var res = await funcmatic.remove(api, f.id)
    console.log('... done')
    return res
  }
  if (version && version == "untagged") {
    var spinner = ora(`Removing all untagged versions ...`).start()
    var { versions, removed } = await funcmatic.removeAllUnaliasedVersions(api, f.id, ({ status, v }) => {
      if (status == 'removing') {
        spinner.text = `Removing version ${v.version}`
      }
    })
    spinner.stop()
    console.log(formatter.versionsTable(versions))
    console.log(`Removed ${removed.length} untagged versions`.red)
    console.log()
    return versions
  } else {
    var versions = await funcmatic.removeVersion(api, f.id, version)
    console.log(formatter.versionsTable(versions))
    console.log(`Removed version ${version}`.red)
    console.log()
    return versions
  } 
}

module.exports = remove