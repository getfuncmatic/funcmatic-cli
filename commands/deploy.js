const ora = require('ora')

const package = require('./package')
const funcmatic = require('../lib/funcmatic')
const formatter = require('../lib/formatter')

async function deploy(user, api, fdraft, f) {
  const spinner = ora(`Deploying @${f.username}/${f.name} ...`).start()
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
  //var endpoint = `https://funcmatic.io/dev/${f.username}/${f.name}`
  //console.log(`Your function is now deployed. Call it at endpoint ${endpoint}`)
  console.log(formatter.functioninfo(f))
  return f
}

module.exports = deploy