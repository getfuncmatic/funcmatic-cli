#!/usr/bin/env node
//const commands = require('./lib/commands')
//const authFuncmatic = require('./lib/auth')
//const manifestFuncmatic = require('./lib/manifest')

require('dotenv').config()

const funcmatic = require('./lib/funcmatic')
const dotfolder = require('./lib/dotfolder')

const { login, logout, whoami, token }  = require('./commands/login')
const info = require('./commands/info')
const versions = require('./commands/versions')
const remove = require('./commands/remove')
const package = require('./commands/package')
const deploy = require('./commands/deploy')
const tag = require('./commands/tag')
const untag = require('./commands/untag')

var usernameEnv = process.env.FUNCMATIC_USERNAME
var passwordEnv = process.env.FUNCMATIC_PASSWORD

var program = require('commander');

program
  .option('-d, --dir [value]', 'The directory of the function')

program
  .command('login')
  .action(async function(command, options) {
    handleProgramOptions(program)
    await login(program, command, options)
  })

program
  .command('logout')
  .action(async function(command, options) {
    handleProgramOptions(program)
    await logout(program, command, options)
  })

program
  .command('whoami')
  .action(async function(command, options) {
    handleProgramOptions(program)
    await whoami(program, command, options)
  })

program
  .command('token')
  .action(async function(command, options) {
    handleProgramOptions(program)
    await token(program, command, options)
  })

program
  .command('info')
  .action(async function(command, options) {
    handleProgramOptions(program)
    var { user, api, fdraft, f } = await getFunctions()
    await info(user, api, fdraft, f)
  })

program
  .command('package')
  .action(async function(command, options) {
    handleProgramOptions(program)
    var res = await package()
  })

program
  .command('deploy [tag]')
  .action(async function(command, options) {
    handleProgramOptions(program)
    var { user, api, fdraft, f } = await getFunctions()
    var res = await deploy(user, api, fdraft, f)
  })

program
  .command('versions')
  .action(async function(command, options) {
    handleProgramOptions(program)
    var { user, api, fdraft, f } = await getFunctions()
    await versions(user, api, fdraft, f)
  })

program
  .command('tag <name> <version>')
  .action(async function(tagname, version) {
    handleProgramOptions(program)
    var { user, api, fdraft, f } = await getFunctions()
    await tag(user, api, fdraft, f, tagname, version)
  })

program
  .command('untag <name> <version>')
  .action(async function(tagname, version) {
    handleProgramOptions(program)
    var { user, api, fdraft, f } = await getFunctions()
    await untag(user, api, fdraft, f, tagname, version)
  })

program
  .command('remove [version]')
  .action(async function(command, options) {
    handleProgramOptions(program)
    var { user, api, fdraft, f } = await getFunctions()
    await remove(user, api, fdraft, f)
  })

program.parse(process.argv);

function handleProgramOptions(program) {
  if (program.dir) {
    dotfolder.setBaseDir(program.dir)
  } 
}

async function getFunctions() {
  var user = getAuthenticatedUser()
  var api = getAuthenticatedAPI(user)
  var fdraft = getDraftedFunctionMetadata()
  var f = await getPublishedFunctionMetadata(api, fdraft)

  return { user, api, fdraft, f }
}

function getAuthenticatedUser() {
  var user = dotfolder.read('user.json')
  return user
}

function getAuthenticatedAPI(user) {
  if (!user) return false
  var api = funcmatic.api(user.token)
  return api
}

function getDraftedFunctionMetadata() {
  var packageJSON = dotfolder.getParentPackageJSON()
  var user = getAuthenticatedUser()
  if (!user) return false
  return {
    "name": formatFunctionName(packageJSON.name),
    "description": `${packageJSON.version}: ${packageJSON.description}`,
    "userid": user.decoded.sub,
    "username": user.decoded.preferred_username,
  }
}

async function getPublishedFunctionMetadata(api, fdraft) {
  var fids = { 
    username: fdraft.username,
    fname: fdraft.name 
  }
  return await findPublishedFunction(api, fids)
}

function formatFunctionName(name) {
  return name.replace('@', '').replace('/', '-')
 }

async function findPublishedFunction(api, fids) {
  //console.log("FIDS", fids)
  var f = null
  if (fids.id) {
    try {
      console.log('trying to get ', fids.id)
      f = await funcmatic.getFromId(api, fids.id)
    } catch (err) {
      console.log(err.message)
      console.log(`Could not get deployed function with id ${fids.id}`)
    }
  }
  if (!f) {
    try {
      f = await funcmatic.get(api, fids.username, fids.fname)
    } catch (err) {
      // this user does have an existing function with the same name
      console.log(err.message)
      console.log(`Could not get deployed function @${fids.username}/${fids.fname}`)
    }
  }
  return f
}


// program
//   .arguments('<command>')
//   .option('-u, --username [value]', 'The user to authenticate as')
//   .option('-i, --id [value]', 'The UUID of the function')
//   .option('-d, --dir [value]', 'The directory of the function')
//   .action(async function(command, options) {

//     // Base Directory
//     if (options.dir) {
//       manifestFuncmatic.setBaseDir(options.dir)
//     } 
//     console.log(`Base directory is: ${manifestFuncmatic.getBaseDir()}`)
    
//     // User Authentication and JWT Token
//     var username = usernameEnv || options.username
//     var password = passwordEnv || options.password
    
//     console.log(`Signing into Funcmatic as ${username} ...`)
//     var user = await authFuncmatic.auth(username, password, { mock: false })  
//     var api = funcmatic.api(user.token)
//     console.log(`... authenticated successfully as ${user.decoded.preferred_username}.`)

//     // Draft Function
//     var fdraft = createDraftFunction(user, manifestFuncmatic.getParentPackageJSON())
//     console.log('Draft Function:')
//     console.log(`\tName: ${fdraft.name}`)
//     console.log(`\tDescription: ${fdraft.description}`)

//     // Deployed Function
//     var fids = { 
//       username: fdraft.username,
//       name: fdraft.name 
//     }
//     fids.id = dotfolder.read('function').id
//     var f = await findPublishedFunction(fids)

//     var fdotfile = manifestFuncmatic.getFunctionMetadataFromDotFile()
//     console.log("dotfile", fdotfile)
//     if (fdotfile && fdotfile.id) { 
//       try {
//         console.log('trying to get ', fdotfile.id)
//         f = await funcmatic.getFromId(api, fdotfile.id)
//       } catch (err) {
//         console.log(err.message)
//         console.log(`Could not get deployed function with id ${fdotfile.id} in .funcmatic`)
//       }
//     }
//     if (!f) {
//       try {
//         f = await funcmatic.get(api, user.decoded.preferred_username, fdraft.name)
//       } catch (err) {
//         // this user does have an existing function with the same name
//       }
//     }
    
//     if (f && f.id) {
//       // save this to the dotfile
//       console.log('saving to dotfile', f.id, f.name)
//       manifestFuncmatic.writeFunctionToFile({ id: f.id })
//     }

//     if (f && f.id) {
//       console.log('Deployed Function:')
//       console.log(`\tId: ${f.id}`)
//       console.log(`\tName: ${f.name}`)
//       console.log(`\tDescription: ${f.description}`)
//     } else {
//       console.log('No deployed function found.')
//     }
//     // console.log("FUNC", f)

//     switch (command) {
//       case 'clear':
//         var res = await commands.clear(console.log, api, user, fdraft, f)
//         break
//       default:
//         console.log('help')
//     }
//   })
