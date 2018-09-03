require('dotenv').config()
const path = require('path')
const fs = require('fs')
const auth = require('../lib/auth')
const funcmatic = require('../lib/funcmatic')
const axios = require('axios')

// danieljyoo/funcmatic-unit-test
const FUNCTION_TEST_ID = 'a2a3a9d4-a1f2-47d3-b123-72e47cff933e'

var api = null
var claims = null

jest.setTimeout(10000)

beforeAll(async () => {
  var res = await auth.auth(process.env.FUNCMATIC_USERNAME, process.env.FUNCMATIC_PASSWORD)
  api = funcmatic.api(res.token)
  claims = res.decoded
})

describe('Funcmatic Function APIs', () => {
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
  it ('should get the versions of a function', async () => {
    var versions = await funcmatic.versions(api, FUNCTION_TEST_ID)
    expect(versions.length).toBeGreaterThanOrEqual(1)
    expect(versions[0]).toMatchObject({
      version: "$LATEST"
    })
  })
})

describe('Funcmatic Copy APIs', () => {
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
})

describe('Funcmatic Upload Zip', () => {
  it ('should start and cancel a multipart upload', async () => {
    var upload = await funcmatic.startMultipartUpload(api, FUNCTION_TEST_ID)
    expect(upload).toMatchObject({
      status: 'INITIATED',
      id: expect.anything()
    })
    var cancelRes = await funcmatic.cancelMultipartUpload(api, upload.id)
    expect(cancelRes).toBeTruthy()
  })
  it ('should upload a large zipfile', async () => {
    var fpath = path.join(__dirname, 'index.large.zip')
    var res = await funcmatic.upload(api, FUNCTION_TEST_ID, fpath)
  }, 10 * 60 * 1000)
})