const funcmatic = require('./funcmatic')
const manifest = require('./manifest')

async function deploy(log, api, user, fdraft, f) {
  if (!f || !f.id) {
    // function does not yet exist
    // this function doesn't exist yet so we copy it
    log(`Creating new function template for ${user.decoded.preferred_username}/${fdraft.name} ...`)
    var res = await funcmatic.copy(api, user.decoded.preferred_username, fdraft.name, fdraft.description)
    f = res // now we have an existing function
    // save it to .funcmatic
    manifest.writeFunctionToFile({ id: f.id })
    log(`\t... created new function with id ${f.id}`)
  } 

  // steps here are to 
  // 1. save function metadata to funcmatic (e.g. user updated name or description)
  // 2. package the function
  log('Packaging function ... ')
  var path = manifest.copyPackageFromBuildDir()
  log('\t... done')
  log('Uploading packaged function ...')
  // 3. upload the package to S3
  var res = await funcmatic.upload(api, f.id, path)
  log('\t... done')
  // 4. call deploy
  log('Deploying function ...')
  res = await funcmatic.deploy(api, f.id)
  log('\t... done')
  var endpoint = `https://funcmatic.io/dev/${f.username}/${f.name}`
  log(`Your function is now deployed. Call it at endpoint ${endpoint}`)
}

 
async function package(log,  api, user, fdraft, f) {
  // so we no-op here for now we just copy from test to 
  // we just copy a prebuilt zip 
  var res = manifest.copyPackageFromBuildDir()
  console.log("COPIeD", res)
}

async function versions(log, api, user, fdraft, f) {
  if (!f || !f.id) {
    log(`No deployed versions.`)
    return
  }
  var fversions = await funcmatic.versions(api, f.id)
  for (var v of fversions) {
    log(`${v.version}\t${v.updated_at}\t${v.aliases.join(', ')}`)
  }
}

async function remove(log, api, user, fdraft, f) {
  if (!f || !f.id) {
    log(`No deployed function to remove.`)
  }
  // should ask for confirmation here
  log(`Removing function ${f.name} (${f.id}) ...`)
  var res = await funcmatic.remove(api, f.id)
  await manifest.deleteFunctionFile()
  log('\t... done')
}

async function clear(log, api, user, fdraft, f) {
  await manifest.deleteFunctionFile()
  log ('Removed .funcmatic file')
}

module.exports = {
  deploy,
  package,
  versions, 
  remove,
  clear
}