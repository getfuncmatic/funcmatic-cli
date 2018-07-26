const manifest = require('../lib/manifest')

describe('Parent package', () => {
  it ('should return false if there is no parent module', async () => {
    var res = manifest.getParentPackageJSON()
    expect(res).toBe(false)
  })
  it ('should return parsed if there is a parent.json', async () => {
    console.log("how the heck do you test this?")
  })
  it ('should create function metadata based on parent or defaults', async () => {
    var user = {
      token: "TEST-TOKEN",
      decoded: { 
        sub: 'TEST-USER-UUID', 
        preferred_username: 'danieljyoo' 
      }
    }
    var f = manifest.createFunctionMetadata(user, { 
      default: {
        name: "test-function-name",
        description: 'this is a test description'
      }
    })
    expect(f).toMatchObject({
      name: "test-function-name",
      description: 'this is a test description',
      id: null
    })
  })
})

describe('.funcmatic file', () => {
  it ('should write and get the .funcmatic file', async () => {
    var f = { id: 'FUNCTION-UUID' }
    var fpath = manifest.writeFunctionToFile(f)
    var fromFile = manifest.getFunctionFromFile()
    expect(fromFile).toMatchObject(f)
    manifest.deleteFunctionFile()
    var fromFile = manifest.getFunctionFromFile()
    expect(fromFile).toBe(false)
  })
})

//describe('Manually creating ')