const fs = require('fs')
const axios = require('axios')
const request = require('request')
const bigfiles = require('bigfiles-client-node')

const FUNCMATIC_BASE_URL = "https://api.funcmatic.com/dev"
// danieljyoo / funcmatic-raw-810
const FUNCMATIC_COPY_ID = '579c20f1-951b-4604-b033-42093db4893f'

function api(token) {
  var funcmaticAPI = axios.create({
    baseURL: FUNCMATIC_BASE_URL,
    headers: {
      'Authorization': token
    }
  })
  //funcmaticAPI.defaults.headers.common['Authorization'] = token
  return funcmaticAPI
}

async function getFromId(api, fid) {
  var url = `/f/${fid}`
  var f = (await api.get(url)).data
  return f
}

async function get(api, username, fname) {
  var url = `/functions/${username}/${fname}`
  var f = (await api.get(url)).data
  return f
}

async function copy(api, username, fname, description) {
  var url = `/f/${FUNCMATIC_COPY_ID}/copy`
  var params = {
    name: fname,
    description,
    username
  }
  var res = (await api.get(url, { params })).data
  var f = res.copy
  return f
}

async function save(api, f) {
  var url = `/f/${f.id}`
  var res = (await api.put(url, f)).data
  return res.func
}

// OPTIONS: { alias: this.selectedalias }
async function deploy(api, fid, options) {
  options = options || { }
  var url = `/f/${fid}/deploy`
  var res = (await api.post(url, options)).data
  return res.manifest
}

async function remove(api, fid) {
  var url = `/f/${fid}`
  var res = (await api.delete(url)).data
  var f = res.deleted
  return f
}

async function removeVersion(api, fid, version) {
  var url = `/f/${fid}/versions?version=${version}`
  var res = (await api.delete(url)).data
  return mergeVersionsAndAliases(res.versions, res.aliases)
}

async function removeAllUnaliasedVersions(api, fid, callback) {
  var removed = [ ]
  var currentVersions = await versions(api, fid)
  for (var v of currentVersions) {
    if (v.version == 1000000) continue
    if (!v.aliases || (v.aliases.length == 0)) {
      removed.push(v)
    }
  }
  for (var v of removed) {
    if (callback) callback({ status: 'removing', v })
    currentVersions = await removeVersion(api, fid, v.version)
    if (callback) callback({ status: 'removed', v })
  }
  return { versions: currentVersions, removed }
}

async function versions(api, fid) {
  var url = `/f/${fid}/versions`
  var res = (await api.get(url)).data
  return mergeVersionsAndAliases(res.versions, res.aliases)
}

async function tag(api, fid, alias, version) {
  var url = `f/${fid}/versions`
  var params = {
    version: version,
    add: [ alias ],
    remove: [ ]
  }
  var res = (await api.put(url, params)).data
  return mergeVersionsAndAliases(res.versions, res.aliases)
}

async function untag(api, fid, alias, version) {
  var url = `f/${fid}/versions`
  var params = {
    version: version,
    add: [ ],
    remove: [ alias ]
  }
  var res = (await api.put(url, params)).data
  return mergeVersionsAndAliases(res.versions, res.aliases)
}

async function upload(api, fid, fpath, options) {
  options = options || { }
  // we call /f/:fid/package to have the server start a multipart upload and return  uploadid 
  var res = await startMultipartUpload(api, fid)
  // we call the bigfiles client with the uploadid
  var uploadid = res.id
  return await bigfiles.upload(uploadid, fpath, { content_type: 'application/zip' })
}

async function startMultipartUpload(api, fid) {
  var url = `/f/${fid}/package`
  var res = (await api.get(url)).data
  return res
}

async function cancelMultipartUpload(api, uploadid) {
  return await bigfiles.cancel(uploadid)
}


// Function metadata

function createFunctionMetadata(f) {
  return {
    uuid: f.uuid || uuidV4(),
    id: f.id,
    userid: f.userid,
    username: f.username,
    name: f.name,
    description: f.description,
    visibility: 'public',
    accessiblity: 'all',
    function_type: 'standard',
    runtime: 'nodejs8.10',
    version: 1000000,
    manifest: {
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
}

function mergeVersionsAndAliases(versions, aliases) {
  var merged = [ ]
  for (var v of versions) {
    if (v.Version == "$LATEST") continue
    merged.push({
      version: v.Version,
      updated_at: v.LastModified,
      description: v.Description,
      aliases: [ ]
    })
  }
  for (var a of aliases) {
    for (var v of merged) {
      if (v.version == a.FunctionVersion) {
        v.aliases.push(a.Name)
      }
    }
  }
  merged = merged.sort((a, b) => {
    if (a.updated_at > b.updated_at) return -1
    if (a.updated_at < b.updated_at) return 1
    return 0
  })
  return merged
}

module.exports = {
  api,
  get,
  getFromId,
  save,
  copy,
  deploy,
  versions,
  remove,
  removeVersion,
  removeAllUnaliasedVersions,
  upload,
  tag,
  untag,
  startMultipartUpload,
  cancelMultipartUpload,
  createFunctionMetadata
}

// GET

// { id: '98a63ec9-4b9b-493e-85be-bf00e080a4ab',
// userid: '0edb3176-e3d9-45ac-8a26-b6d43cb1f6d1',
// username: 'danieljyoo',
// name: 'funcmatic-starter-810',
// description: 'Basic function when you start using Funcmatic.',
// visibility: 'public',
// function_type: 'standard',
// created_at: '2018-04-14T04:05:30.000Z',
// updated_at: '2018-04-29T17:58:09.000Z',
// deleted_at: null,
// manifest:
//  { main: 'index.js',
//    files: [ 'wrapper.js' ],
//    tests: [ 'test.json' ],
//    readme: 'README.md',
//    handler: 'wrapper.handler',
//    modules: 'modules.json',
//    package: 'index.zip',
//    environment: 'env.json' },
// runtime: 'nodejs8.10',
// version: 1000000,
// uuid: '43069b79-2296-4d07-9132-0a0fc5b88bc1',
// accessibility: 'all',
// permissions:
//  { fid: '98a63ec9-4b9b-493e-85be-bf00e080a4ab',
//    userid: '0edb3176-e3d9-45ac-8a26-b6d43cb1f6d1',
//    view: true,
//    edit: true,
//    invoke: true } }


// COPY

// { copy:
//   { id: 'b0f391e3-0347-4672-bc68-b45a0c9e45ad',
//     userid: '0edb3176-e3d9-45ac-8a26-b6d43cb1f6d1',
//     username: 'danieljyoo',
//     name: 'my-commandline-copy',
//     description: 'my description',
//     visibility: 'public',
//     function_type: 'standard',
//     created_at: '2018-07-21T04:36:05.000Z',
//     updated_at: '2018-07-21T04:36:05.000Z',
//     deleted_at: null,
//     manifest:
//      { main: 'index.js',
//        files: [Array],
//        tests: [Array],
//        readme: 'README.md',
//        handler: 'wrapper.handler',
//        modules: 'modules.json',
//        package: 'index.zip',
//        environment: 'env.json' },
//     runtime: 'nodejs8.10',
//     version: 1000000,
//     uuid: '9408c47e-996d-437e-940a-7f92b03982a3',
//     accessibility: null } }


// VERSIONS

// { manifest:
//   { id: 'a2a3a9d4-a1f2-47d3-b123-72e47cff933e',
//     userid: '0edb3176-e3d9-45ac-8a26-b6d43cb1f6d1',
//     username: 'danieljyoo',
//     name: 'funcmatic-unit-test',
//     description: 'Test various get methods and upload presigned url and SHOULD NOT be removed.',
//     visibility: 'public',
//     function_type: 'standard',
//     created_at: '2018-07-25T16:07:55.000Z',
//     updated_at: '2018-07-25T16:19:24.000Z',
//     deleted_at: null,
//     manifest:
//      { main: 'index.js',
//        files: [Array],
//        tests: [Array],
//        readme: 'README.md',
//        handler: 'wrapper.handler',
//        modules: 'modules.json',
//        package: 'index.zip',
//        environment: 'env.json' },
//     runtime: 'nodejs8.10',
//     version: 1000000,
//     uuid: '5205db6f-52e0-4c09-8e07-92246da79b8a',
//     accessibility: null,
//     permissions:
//      { fid: 'a2a3a9d4-a1f2-47d3-b123-72e47cff933e',
//        userid: '0edb3176-e3d9-45ac-8a26-b6d43cb1f6d1',
//        view: true,
//        edit: true,
//        invoke: true } },
//  versions:
//   [ { FunctionName: 'a2a3a9d4-a1f2-47d3-b123-72e47cff933e',
//       FunctionArn: 'arn:aws:lambda:us-west-2:233748856986:function:a2a3a9d4-a1f2-47d3-b123-72e47cff933e:$LATEST',
//       Runtime: 'nodejs8.10',
//       Role: 'arn:aws:iam::233748856986:role/service-role/lambdaDefaultRole',
//       Handler: 'wrapper.handler',
//       CodeSize: 452370,
//       Description: 'my-commandline-copy-2: my description',
//       Timeout: 29,
//       MemorySize: 512,
//       LastModified: '2018-07-25T16:07:56.158+0000',
//       CodeSha256: '0LT/DIE0CjrySGBI1LnkRxDUj+qFvLNuQglnXXHKmJA=',
//       Version: '$LATEST',
//       Environment: [Object],
//       KMSKeyArn: null,
//       TracingConfig: [Object],
//       MasterArn: null,
//       RevisionId: '347bda3f-89a2-42b5-8775-6e23ab224ca8' } ],
//  aliases:
//   [ { AliasArn: 'arn:aws:lambda:us-west-2:233748856986:function:a2a3a9d4-a1f2-47d3-b123-72e47cff933e:DEV',
//       Name: 'DEV',
//       FunctionVersion: '$LATEST',
//       Description: '',
//       RevisionId: 'fbda0f2f-2658-454a-a22e-a8accc630351' },
//     { AliasArn: 'arn:aws:lambda:us-west-2:233748856986:function:a2a3a9d4-a1f2-47d3-b123-72e47cff933e:PROD',
//       Name: 'PROD',
//       FunctionVersion: '$LATEST',
//       Description: '',
//       RevisionId: '30d99c04-ba58-4a2a-b06c-5a30855493af' },
//     { AliasArn: 'arn:aws:lambda:us-west-2:233748856986:function:a2a3a9d4-a1f2-47d3-b123-72e47cff933e:STAGING',
//       Name: 'STAGING',
//       FunctionVersion: '$LATEST',
//       Description: '',
//       RevisionId: '236b0f52-9d50-47b0-92a5-de526cc6be42' } ]


// async function upload(api, fid, path, options) {
//   options = options || { }
//   var signed = await signedUploadUrl(api, fid)
//   // we don't use api here because signed.url is 
//   // a fully qualified url e.g. https://s3.us-west-2.amazonaws.com/resources.funcmatic.com/...
//   // and very finicky in terms of headers
//   var uploadAxios = axios.create({
//     headers: { 'Content-Type': 'application/zip' } 
//   })
//   try {
//     var res = (await uploadAxios.put(signed.url, 
//       fs.readFileSync(path), 
//       { headers: { 'Content-Type': 'application/zip' } })).data
//     return res
//   } catch (err) {
//     console.log('error uploading to presigned url', signed.url)
//     console.log(err)
//   }
// }

// async function uploadStreaming(api, fid, path, options) {
//   options = options || { }
//   var signed = await signedUploadUrl(api, fid)
//   var requestOptions = {
//     method: 'PUT',
//     url: signed.url,
//     headers: {
//       'Content-Type': 'application/zip'
//     }
//   }
//   try {
//     var res = await uploadStreamingPromise(path, requestOptions)
//     return res
//   } catch (err) {
//     console.error(err)
//   }
  
// }

// async function uploadStreamingPromise(path, options) {
//   return new Promise((resolve, reject) => {
//     fs.createReadStream(path).pipe(request(options, (err, response, body) => {
//       if (err) {
//         console.log("error", err)
//         console.error("httpresponse", response.statusCode)
//         reject(err)
//       }
//       resolve(body)
//     }))
//   })
// }

// async function signedUploadUrl(api, fid) {
//   var url = `/f/${fid}/package`
//   var res = (await api.get(url)).data
//   return res
// }