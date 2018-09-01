const fs = require('fs-extra')
const path = require('path')
const spawn = require('child_process').spawn
const dotfolder = require('../lib/dotfolder')
const ora = require('ora')

async function package() {
  var name = 'index.zip'
  var fpath = path.join(dotfolder.getBaseDir(), '.funcmatic', 'index.zip')
  
  const spinner = ora('Recreate build directory').start()
  var builddir = await dotfolder.recreateBuildDir()
  spinner.text = 'Copy package.json'
  await copyPackageJSON(dotfolder.getBaseDir(), builddir)
  spinner.text = 'Run npm install --production'
  await npmInstallProduction(builddir)
  spinner.text = 'Copy user code'
  await copyUserCode(dotfolder.getBaseDir(), builddir)
  spinner.text = 'Zip build directory'
  await zipBuildDir(builddir, fpath)
  var stats = fs.statSync(fpath)
  spinner.succeed(`Function packaged at ${fpath} (${stats["size"]} bytes)`.green)
  return { name, path: fpath, stats }
}

async function copyPackageJSON(basedir, builddir) {
  var packagesrc = path.join(basedir, 'package.json')
  var packagedst = path.join(builddir, 'package.json')
  await fs.copy(packagesrc, packagedst)
}

async function zipBuildDir(builddir, fpath) {
  var command = `zip`
  var args = [ '-r', '-q',
    fpath,
    '.',
    // '--exclude', '*.funcmatic*'  // exclude .funcmatic dir 
  ]
  var options = { // this is where other options like role 
    cwd: builddir,
    env: {
      "PATH": process.env.PATH
    }
  }
  return await spawnAsPromise(command, args, options)
}

// this is NOT generalized. specific to how I build functions :)
async function copyUserCode(basedir, builddir) {
  await fs.copy(path.join(basedir, 'index.js'), path.join(builddir, 'index.js'))
  var libdir = path.join(basedir, 'lib')
  if (fs.existsSync(libdir)) {
    await fs.copy(libdir, path.join(builddir, 'lib'))
  }
}

async function npmInstallProduction(builddir) {
  var command = 'npm'
  var args = [ 'install', '--production', '--silent' ]
  var options = {
    cwd: builddir,
    env: {
      'PATH': process.env.PATH
    }
  }
  return await spawnAsPromise(command, args, options)
}

async function spawnAsPromise(command, args, options) {
  return new Promise((resolve, reject) => {
    var invokeLocal = spawn(command, args, options)
    invokeLocal.on('error', (err) => {
      reject(err)
    })
    invokeLocal.stdout.on('data', (data) => {
      var datastr = data.toString('utf-8')
      console.log(datastr)
    })
    invokeLocal.stderr.on('data', (data) => {
      console.error(data.toString('utf-8'))
    })
    invokeLocal.on('exit', (code) => {
      if (code == 0) {
        resolve({ code: code, msg: 'DONE!', stdout: '', stderr: '' })
      } else {
        reject({ code: code, msg: `Failed: ${code}`, stdout: '', stderr: `Exited with code ${code}` })
      }
      return
    })
  })  
}

module.exports = package