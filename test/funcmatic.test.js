const fs = require('fs')
const auth = require('../lib/auth')
const funcmatic = require('../lib/funcmatic')
const axios = require('axios')

// danieljyoo/funcmatic-unit-test
const FUNCTION_TEST_ID = 'a2a3a9d4-a1f2-47d3-b123-72e47cff933e'

// we only use this in test to get a signed url
// an actual lambda api must be implemented to get it
// for real
var AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'});
const s3 = require('funcmatic-s3')(new AWS.S3(), {
  Bucket: "test.funcmatic.com"
})

var api = null
var claims = null

jest.setTimeout(10000)

beforeAll(async () => {
  var res = await auth.auth(process.env.FUNCMATIC_USERNAME, process.env.FUNCMATIC_PASSWORD)
  api = funcmatic.api(res.token)
  claims = res.decoded
})

describe('Funcmatic API', () => {
  it ('should get a function from the id', async () => {
    var f = await funcmatic.getFromId(api, FUNCTION_TEST_ID)
    expect(f).toMatchObject({
      id: FUNCTION_TEST_ID
    })
  })
  it ('should get a function using username fname', async () => {
    var username = 'danieljyoo'
    var fname = 'funcmatic-unit-test'
    var f = await funcmatic.get(api, username, fname)
    expect(f).toMatchObject({
      id: FUNCTION_TEST_ID,
      username: username,
      name: 'funcmatic-unit-test'
    })
  })
  it ('should save metadata for a function', async () => {
    var fname = 'funcmatic-save-test'
    var username = claims.preferred_username
    var f = await funcmatic.get(api, username, fname)
    var oldname = f.name
    var olddesc = f.description

    // update the function metadata then save it
    f.name = 'funcmatic-save-test-saved'
    f.description = 'saved description'
    var res = await funcmatic.save(api, f)
    expect(res).toMatchObject({
      id: f.id,
      name: 'funcmatic-save-test-saved',
      description: 'saved description'
    })
    var fsaved = await funcmatic.get(api, username, f.name)
    expect(res).toMatchObject({
      id: f.id,
      name: 'funcmatic-save-test-saved',
      description: 'saved description'
    })

    // restore the old values
    fsaved.name = oldname
    fsaved.description = olddesc
    await funcmatic.save(api, fsaved)
  })
  it ('should create a copy then delete it', async () => {
    var username = claims.preferred_username
    var fname = 'funcmatic-copy-test'
    var description = 'this should be cleaned up after the unit test completes.'
    var fcopy = await funcmatic.copy(api, username, fname, description)
    expect(fcopy).toMatchObject({
      username: username,
      name: fname
    })

    var fdel = await funcmatic.remove(api, fcopy.id)
    expect(fdel).toMatchObject({
      username: username,
      name: fname
    })
  })
  it ('should get the versions of a function', async () => {
    var versions = await funcmatic.versions(api, FUNCTION_TEST_ID)
    console.log(versions)
    // expect(versions).toMatchObject({
    //   username: username,
    //   name: fname
    // })
  })
  it ('should put a file using s3', async () => {
    var res = await s3.put('testput.json', `{"hello":"worldput"}`, { 'Content-Type': 'application/json' })
    console.log("PUT", res)
  })
  it ('should get a signed upload url', async () => {
    var signed = await funcmatic.signedUploadUrl(api, FUNCTION_TEST_ID)
    console.log("SIGNED", signed)
  })
  it ('should upload a zip file', async () => {
    var path = `${__dirname}/index_98a63ec9-4b9b-493e-85be-bf00e080a4ab.zip`
    var res = await funcmatic.upload(api, FUNCTION_TEST_ID, path)   
    //console.log(res)
  }, 30000)
  it ('should deploy a function', async () => {
    var res = await funcmatic.deploy(api, FUNCTION_TEST_ID)
    console.log(res)
  })
})