const ora = require('ora')

const package = require('./package')
const tag = require('./tag')
const funcmatic = require('../lib/funcmatic')
const formatter = require('../lib/formatter')

async function deploy(user, api, fdraft, f, alias) {
  var msg = `Deploying @${f.username}/${f.name}`
  if (tag) {
    msg = `Deploying @${f.username}/${f.name} with tag ${alias}`
  }
  const spinner = ora(msg).start()
  if (!f || !f.id) {
    // a function with this name does not yet exist for this user
    spinner.text = 'Initialize new function'
    console.log(`Creating new function template for ${fdraft.username}/${fdraft.name} ...`)
    // make a new function (copy) with name and description
    f = await funcmatic.copy(api, user.decoded.preferred_username, fdraft.name, fdraft.description)
    spinner.succeed()
  } 

  var packageRes = await package()
  //var res = { path: '/Users/danieljhinyoo/Projects/scratch/funcmatic-cli-parent/.funcmatic/index.zip' }

  spinner.start(`Uploading ${packageRes.path}`)
  var uploadRes = await funcmatic.upload(api, f.id, packageRes.path)
  spinner.succeed(`Uploaded ${packageRes.path}`)
  spinner.start('Deploying function')
  var f = await funcmatic.deploy(api, f.id)
  spinner.succeed('Function deployed')
  if (alias) {
    var version = `${f.version}`
    await tag(user, api, fdraft, f, alias, version)
    spinner.succeed(`${alias} now tagged to version ${version}`)
  }
  spinner.stop()
  console.log(formatter.functionTable(f))
  return f
}

module.exports = deploy