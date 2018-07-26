// // PACKAGE BARE
// runZipStreaming() {
//   var command = `zip`
//   var args = [ '-r', '-q',
//     this.manifest.manifest.package, 
//     this.manifest.manifest.main
//   ]
//   .concat(this.manifest.manifest.files)
//   .concat([ 'node_modules' ])
//   var options = { // this is where other options like role 
//     cwd: this.path,
//     env: {
//       "PATH": process.env.PATH
//     }
//   }
//   return this.spawnAsPromise(command, args, options)
// }

