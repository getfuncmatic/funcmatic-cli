const fs = require('fs')
const path = require('path')
var parent = require('parent-package-json')
var uuidV4 = require('uuid')

const readPkgUp = require('read-pkg-up')
const parentModule = require('parent-module')

var BaseDir = null

//=> {name: 'chalk', version: '1.0.0', ...}

// .funcmatic file 

function setBaseDir(d) {
  var dir = d
  if (!path.isAbsolute(d)) {
    dir = path.resolve(d)
  }
  BaseDir = dir
}

function createOrReadFromFile(options) {
  options = options || { }
  var f = getFunctionFromFile(options)
  if (!f) {
    f = { new: true }
    writeFunctionToFile(f, options)
  }
  return f
}

function getFunctionFromFile(options) {
  var baseDir = getBaseDir(options)
  var filepath = `${baseDir}/.funcmatic`
  if (!fs.existsSync(filepath)) return false
  var f = JSON.parse(fs.readFileSync(filepath))
  return f
}

function writeFunctionToFile(f, options) {
  var baseDir = getBaseDir(options)
  var filepath = `${baseDir}/.funcmatic`
  fs.writeFileSync(filepath, JSON.stringify(f, null, 2))
  return filepath
}

function deleteFunctionFile(options) {
  var baseDir = getBaseDir(options)
  var filepath = `${baseDir}/.funcmatic`
  var res = fs.unlinkSync(filepath)
  return filepath
}

function getBaseDir(options) {
  return BaseDir || path.dirname(parentModule())
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

// package.json
function createFunctionMetadata(user, options) {
  options = options || { default: { } }
  var packageJSON = getParentPackageJSON(options)
  if (!packageJSON) {
    packageJSON = createPackageJSON(options)
  }
  var decoded = user.decoded
  return {
    uuid: uuidV4(),
    id: null,
    userid: decoded.sub,
    username: decoded.preferred_username,
    name: packageJSON.name,
    description: packageJSON.description,
    visibility: 'public',
    accessiblity: 'all',
    function_type: 'standard',
    runtime: 'nodejs8.10',
    version: 1000000,
    manifest: createStandardManifest()
  }
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

function testManifest(options) {
  return {

  }
}

function createStandardManifest() {
  return {
    main: 'index.js',
    files: [ ],
    tests: [ ],
    readme: 'README.md',
    handler: 'index.handler',
    modules: 'modules.json',
    package: 'index.zip',
    environment: 'env.json' 
  }
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
  getParentPackageJSON,
  createPackageJSON,
  getFunctionMetadataFromPackageJSON,
  getFunctionMetadataFromDotFile,
  getFunctionFromFile,
  writeFunctionToFile,
  deleteFunctionFile,
  createOrReadFromFile,
  createFunctionMetadata,
  copyPackageFromBuildDir
}