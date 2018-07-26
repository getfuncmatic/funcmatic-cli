#!/usr/bin/env node
const commands = require('./lib/commands')
const authFuncmatic = require('./lib/auth')
const funcmatic = require('./lib/funcmatic')
const manifestFuncmatic = require('./lib/manifest')

var usernameEnv = process.env.FUNCMATIC_USERNAME
var passwordEnv = process.env.FUNCMATIC_PASSWORD

var program = require('commander');
program
  .arguments('<command>')
  .option('-u, --username [value]', 'The user to authenticate as')
  .option('-i, --id [value]', 'The UUID of the function')
  .option('-d, --dir [value]', 'The directory of the function')
  .action(async function(command, options) {

    // Base Directory
    if (options.dir) {
      manifestFuncmatic.setBaseDir(options.dir)
    } 
    console.log(`Base directory is: ${manifestFuncmatic.getBaseDir()}`)
    
    // User Authentication and JWT Token
    var username = usernameEnv || options.username
    var password = passwordEnv || options.password
    
    console.log(`Signing into Funcmatic as ${username} ...`)
    var user = await authFuncmatic.auth(username, password, { mock: false })  
    var api = funcmatic.api(user.token)
    console.log(`... authenticated successfully as ${user.decoded.preferred_username}.`)

    // Draft Function
    var fdraft = manifestFuncmatic.getFunctionMetadataFromPackageJSON()
    console.log('Draft Function:')
    console.log(`\tName: ${fdraft.name}`)
    console.log(`\tDescription: ${fdraft.description}`)

    // Deployed Function
    var f = null
    var fdotfile = manifestFuncmatic.getFunctionMetadataFromDotFile()
    console.log("dotfile", fdotfile)
    if (fdotfile && fdotfile.id) {
      try {
        console.log('trying to get ', fdotfile.id)
        f = await funcmatic.getFromId(api, fdotfile.id)
      } catch (err) {
        console.log(err.message)
        console.log(`Could not get deployed function with id ${fdotfile.id} in .funcmatic`)
      }
    }
    if (!f) {
      try {
        f = await funcmatic.get(api, user.decoded.preferred_username, fdraft.name)
      } catch (err) {
        // this user does have an existing function with the same name
      }
    }
    
    if (f && f.id) {
      // save this to the dotfile
      console.log('saving to dotfile', f.id, f.name)
      manifestFuncmatic.writeFunctionToFile({ id: f.id })
    }

    if (f && f.id) {
      console.log('Deployed Function:')
      console.log(`\tId: ${f.id}`)
      console.log(`\tName: ${f.name}`)
      console.log(`\tDescription: ${f.description}`)
    } else {
      console.log('No deployed function found.')
    }
    // console.log("FUNC", f)

    switch (command) {
      case 'deploy': 
        var res = await commands.deploy(console.log, api, user, fdraft, f)
        break
      case 'package':
        var res = await commands.package(console.log, api, user, fdraft, f)
        break
      case 'versions':
        var res = await commands.versions(console.log, api, user, fdraft, f)
        break
      case 'remove': 
        var res = await commands.remove(console.log, api, user, fdraft, f)
        break
      case 'clear':
        var res = await commands.clear(console.log, api, user, fdraft, f)
        break
      default:
        console.log('help')
    }
  })
  program.parse(process.argv);