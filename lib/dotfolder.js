const fs = require('fs-extra')
const path = require('path')
var uuidV4 = require('uuid')

var BaseDir = null


// .funcmatic folder 

// function getBaseDir(options) {
//   console.log("getBaseDir __dirname", __dirname)
//   console.log("getBaseDir process.cwd()", process.cwd())
//   //console.log("getBaseDir module.parent", module.parent)
//   //console.log("getBaseDir process.mainModule", process.mainModule)
//   //console.log("getBaseDir require.main", require.main)
//   console.log("getBaseDir BaseDir", BaseDir)
//   console.log("getBaseDir parentModule()", parentModule())
//   console.log("getBaseDir findParentPkgDesc() ", findParentPkgDesc(process.cwd()))
//   var parentDir = BaseDir || findParentPkgDesc(process.cwd()))process.cwd()
//   return process.cwd()
// }

function getBaseDir() {
  // we start with either a manually set BaseDir or the dir where the process is executed from
  var parentDir = BaseDir || process.cwd() 

  // we find the package.json from this (recursing back until we find one)
  var packageJsonPath = findParentPkgDesc(parentDir)
 
  // if we could not find a package.json in the heirarchy we error
  if (!packageJsonPath) throw new Error("No package.json could be found")

  // the folder of the package.json is our base dir
  return path.join(packageJsonPath, '..') 
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
  var packageJsonPath = findParentPkgDesc(getBaseDir())
  return JSON.parse(fs.readFileSync(packageJsonPath))
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

/**
 * https://gist.github.com/fhellwig/3355047
 * Finds the pathname of the parent module's package descriptor file. If the
 * directory is undefined (the default case), then it is set to the directory
 * name of the parent module's filename. If no package.json file is found, then
 * the parent directories are recursively searched until the file is found or
 * the root directory is reached. Returns the pathname if found or null if not.
 */
function findParentPkgDesc(directory) {
    if (!directory) {
        directory = path.dirname(module.parent.filename);
    }
    var file = path.resolve(directory, 'package.json');
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
        return file;
    }
    var parent = path.resolve(directory, '..');
    if (parent === directory) {
        return null;
    }
    return findParentPkgDesc(parent);
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
  findParentPkgDesc,
  getParentPackageJSON,
  createPackageJSON,
  getFunctionMetadataFromPackageJSON,
  getFunctionMetadataFromDotFile
}