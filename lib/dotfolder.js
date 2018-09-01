const fs = require('fs-extra')
const path = require('path')
var uuidV4 = require('uuid')

const readPkgUp = require('read-pkg-up')
const parentModule = require('parent-module')

var BaseDir = null


// .funcmatic folder 

function getBaseDir(options) {
  return BaseDir || path.dirname(parentModule())
}

function setBaseDir(d) {
  var dir = d
  if (!path.isAbsolute(d)) {
    dir = path.resolve(d)
  }
  BaseDir = dir
}

function createDotFolder() {
  var dotfolder = `${getBaseDir()}/.funcmatic`
  if (fs.existsSync(dotfolder)) return true
  fs.mkdirSync(dotfolder)
  return true
}

function write(name, obj) {
  createDotFolder()
  var fpath = `${getBaseDir()}/.funcmatic/${name}`
  fs.writeFileSync(fpath, JSON.stringify(obj, null, 2))
  return true
}

function read(name) {
  createDotFolder()
  var fpath = `${getBaseDir()}/.funcmatic/${name}`
  if (!fs.existsSync(fpath)) {
    write(name, {})
  }
  return JSON.parse(fs.readFileSync(fpath))
}

async function recreateBuildDir() {
  createDotFolder()
  var dirpath = path.join(getBaseDir(), '.funcmatic', 'build')
  await fs.remove(dirpath)
  await fs.mkdirp(dirpath)
  return dirpath
}

function removeFromDotFolder(name) {
  var fpath = `${getBaseDir()}/.funcmatic/${name}`
  if (fs.existsSync(fpath)) {
    fs.unlinkSync(fpath)
    return true
  }
  return true
}

function getParentPackageJSON() {
  return readPkgUp.sync({cwd: getBaseDir() }).pkg
}

function getFunctionMetadataFromPackageJSON() {
  var parentJSON = getParentPackageJSON()
  return {
    name: parentJSON.name,
    description: parentJSON.description
  }
}
function getFunctionMetadataFromUser(user) {
  return {
    userid: user.decoded.sub,
    username: user.decoded.preferred_username
  }
}

function getFunctionMetadataFromDotFile() {
  return getFunctionFromFile()
}

function getDefaultFunctionMetadata() {
  return {
    uuid: uuidV4(),
    id: null,
    visibility: 'public',
    accessiblity: 'all',
    function_type: 'standard',
    runtime: 'nodejs8.10',
    version: 1000000,
    manifest: createStandardManifest()
  }
}



// zip

function copyPackageFromBuildDir(options) {
  var src = `${__dirname}/../test/index_98a63ec9-4b9b-493e-85be-bf00e080a4ab.zip`
  var dest = `${getBaseDir()}/index.zip`
  fs.copyFileSync(src, dest)
  return dest
}

function createPackageJSON(options) {
  return {
    "name": options.default.name || "my-package-name" ,
    "version": options.default.version || "2.3.1",
    "description": options.default.description || "A sample project to test the funcmatic-cli package.",
    "main": options.default.main || "index.js"
  }
}

function createManifestFromPackageJSON(packageJSON, options) {
  return testManifest(options)
}


// func Func {
//   f: 
//    RowDataPacket {
//      id: '98a63ec9-4b9b-493e-85be-bf00e080a4ab',
//      userid: '0edb3176-e3d9-45ac-8a26-b6d43cb1f6d1',
//      username: 'danieljyoo',
//      name: 'funcmatic-starter-810',
//      description: 'Basic function when you start using Funcmatic.',
//      visibility: 'public',
//      function_type: 'standard',
//      created_at: 2018-04-14T04:05:30.000Z,
//      updated_at: 2018-04-29T17:58:09.000Z,
//      deleted_at: null,
//      manifest: 
//       { main: 'index.js',
//         files: [Array],
//         tests: [Array],
//         readme: 'README.md',
//         handler: 'wrapper.handler',
//         modules: 'modules.json',
//         package: 'index.zip',
//         environment: 'env.json' },
//      runtime: 'nodejs8.10',
//      version: 1000000,
//      uuid: '43069b79-2296-4d07-9132-0a0fc5b88bc1',
//      accessibility: 'all' },
//   files: [],
//   perms: 
//    { fid: '98a63ec9-4b9b-493e-85be-bf00e080a4ab',
//      userid: '0edb3176-e3d9-45ac-8a26-b6d43cb1f6d1',
//      view: true,
//      edit: true,
//      invoke: true } }

module.exports = {
  getBaseDir,
  setBaseDir,
  read,
  write,
  remove: removeFromDotFolder,
  recreateBuildDir,
  getParentPackageJSON,
  createPackageJSON,
  getFunctionMetadataFromPackageJSON,
  getFunctionMetadataFromDotFile,
  //getFunctionFromFile,
  //writeFunctionToFile,
  //deleteFunctionFile,
  //createOrReadFromFile,
  //createFunctionMetadata,
  //copyPackageFromBuildDir
}