const funcmatic = require('../lib/funcmatic')

async function remove(user, api, fdraft, f) {
  if (!f || !f.id) {
    console.log(`No deployed function to remove.`)
  }
  // should ask for confirmation here
  console.log(`Removing function ${f.name} (${f.id}) ...`)
  var res = await funcmatic.remove(api, f.id)
  console.log('... done')
}

module.exports = remove