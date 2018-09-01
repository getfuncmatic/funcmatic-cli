const package = require('./package')
const funcmatic = require('../lib/funcmatic')

async function deploy(user, api, fdraft, f) {
  if (!f || !f.id) {
    // a function with this name does not yet exist for this user
    console.log(`Creating new function template for ${fdraft.username}/${fdraft.name} ...`)
    // make a new function (copy) with name and description
    f = await funcmatic.copy(api, user.decoded.preferred_username, fdraft.name, fdraft.description)
  } 

  var packageRes = await package()
  //var res = { path: '/Users/danieljhinyoo/Projects/scratch/funcmatic-cli-parent/.funcmatic/index.zip' }
  console.log("PackageRES", packageRes)
  console.log(`Uploading packaged function ${packageRes.path}`)
  // 3. upload the package to S3
  //res = await funcmatic.upload(api, f.id, res.path)
  var uploadRes = await funcmatic.upload(api, f.id, packageRes.path)
  console.log("UploadRES", uploadRes)
  // 4. call deploy
  console.log('Deploying function ...')
  var deployRes = await funcmatic.deploy(api, f.id)
  console.log('DeployRES', deployRes)
  var endpoint = `https://funcmatic.io/dev/${f.username}/${f.name}`
  console.log(`Your function is now deployed. Call it at endpoint ${endpoint}`)
}


module.exports = deploy