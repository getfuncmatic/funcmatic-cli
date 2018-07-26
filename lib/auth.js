const Cognito = require('funcmatic-cognito')

const FuncmaticAPIBaseURL = "https://api.funcmatic.com/dev"
const UserPoolId = process.env.AWS_COGNITO_USERPOOLID
const ClientId = process.env.AWS_COGNITO_CLIENTID
const IdentityPoolId = process.env.AWS_COGNITO_IDENTITYPOOLID
// const CognitoUsername = process.env.AWS_COGNITO_USER_NAME
// const CognitoPassword = process.env.AWS_COGNITO_USER_PASSWORD

var cognito = new Cognito({
  UserPoolId: UserPoolId, 
  ClientId: ClientId,
  IdentityPoolId: IdentityPoolId
})

async function auth(username, password, options) {
  options = options || { }
  if (options.mock) return createMockAuth()
  var res = await cognito.auth({
    Username: username,   
    Password: password 
  })
  return res
}

function createMockAuth() {
  return {
    status: 'success',
    token: 'TEST-TOKEN',
    decoded: {
      sub: '0edb3176-e3d9-45ac-8a26-b6d43cb1f6d1',
      aud: '5a7rgt4jcbgqju20knmv5lu189',
      email_verified: true,
      event_id: 'd11bf27d-8c97-11e8-bbaa-314ed217f722',
      token_use: 'id',
      auth_time: 1532144431,
      iss: 'https://cognito-idp.us-west-2.amazonaws.com/us-west-2_eJTw2dsFU',
      'cognito:username': '0edb3176-e3d9-45ac-8a26-b6d43cb1f6d1',
      preferred_username: 'danieljyoo',
      exp: 1532148031,
      iat: 1532144431,
      email: 'danieljyoo@gmail.com' 
    }
  }
}

module.exports = {
  auth
}

// { status: 'success',
//   token: 'eyJraWQiOiJVMmozN3pRMDlBMFdOWVM0Z2t1YWhwVzJRXC94amFIZ0hYRWFlMHAyMzBETT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwZWRiMzE3Ni1lM2Q5LTQ1YWMtOGEyNi1iNmQ0M2NiMWY2ZDEiLCJhdWQiOiI1YTdyZ3Q0amNiZ3FqdTIwa25tdjVsdTE4OSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJldmVudF9pZCI6ImQxMWJmMjdkLThjOTctMTFlOC1iYmFhLTMxNGVkMjE3ZjcyMiIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNTMyMTQ0NDMxLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtd2VzdC0yLmFtYXpvbmF3cy5jb21cL3VzLXdlc3QtMl9lSlR3MmRzRlUiLCJjb2duaXRvOnVzZXJuYW1lIjoiMGVkYjMxNzYtZTNkOS00NWFjLThhMjYtYjZkNDNjYjFmNmQxIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiZGFuaWVsanlvbyIsImV4cCI6MTUzMjE0ODAzMSwiaWF0IjoxNTMyMTQ0NDMxLCJlbWFpbCI6ImRhbmllbGp5b29AZ21haWwuY29tIn0.uaesRo-V3s-HLIjlWeu1VWD_ldJ9NIS7TlIJ6HvusJWKDTCEWG_-0ruHmo2VjjzmfUAl8E9v9NHyueUQ13wJzTd0V_xNe6XrSMCvXal_b3N1Js1npYQsZyZJubvD3MXTXGJkz1-PGEw0CKlwY-KVFzLB5SlUZrWyb_ADzTGSazFy4Qu8qh5eL7J2julnREqDAZCuPvGbsEBroOCWW7nVaeWNPOh_rSc7M7ljTI_CFHYZ47js0EFCAz29OiKrUO2AH--wkODWCrEVEB6-M4-Fj_mJXvdQ2YE2pCeD5sgkRrflYnB5Jy6an7T2O10Mtgtn_LuI4E2OE21R1MW_FpR5_Q',
//   decoded:
//    { sub: '0edb3176-e3d9-45ac-8a26-b6d43cb1f6d1',
//      aud: '5a7rgt4jcbgqju20knmv5lu189',
//      email_verified: true,
//      event_id: 'd11bf27d-8c97-11e8-bbaa-314ed217f722',
//      token_use: 'id',
//      auth_time: 1532144431,
//      iss: 'https://cognito-idp.us-west-2.amazonaws.com/us-west-2_eJTw2dsFU',
//      'cognito:username': '0edb3176-e3d9-45ac-8a26-b6d43cb1f6d1',
//      preferred_username: 'danieljyoo',
//      exp: 1532148031,
//      iat: 1532144431,
//      email: 'danieljyoo@gmail.com' },
//   expiration: 2018-07-21T04:40:31.000Z }


// console.log(`Authenticating to Funcmatic as ${CognitoUsername} ...`)


// console.log("\tsuccess!")
// token = cognito.getIdToken().token
// axios.defaults.baseURL = FuncmaticAPIBaseURL
// axios.defaults.headers.common['Authorization'] = token
// console.log("ID TOKEN", token)
// var f = getFunction()
// console.log("F", f)
// var url = `f/${f.id}`
// console.log(`Calling save ${url}`)
// //return Promise.resolve({ data: { } }) 
// return axios.put(url, f)

