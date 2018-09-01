var moment = require('moment')
var Table = require('cli-table2')

function userTable(user) {
  var table = new Table()
  table.push(
    { 'Username:': user.decoded.preferred_username }, 
    { 'Email:': user.decoded.email },
    { 'Expires:': moment(user.decoded.exp * 1000).format('YYYY-MM-DD h:mm:ssa') }
  )
  return table.toString()
}

function functionTable(f) {
  var table = new Table({
    head: [ 'Attribute', 'Deployed Value' ],
    colWidths: [15, 80 ]
  })

  table.push(
    [ 'Id:'.green, f.id ],
    [ 'Name:'.green, f.name ],
    [ 'Author:'.green, f.username ],
    [ 'Version:'.green, (f.version == 1000000 && '$LATEST') || f.version  ],
    [ 'Description:'.green, f.description ],
    [ 'Type:'.green, f.function_type ],
    [ 'Runtime:'.green, f.runtime ],
    [ 'Read:'.green, f.visibility ],
    [ 'Execute:'.green, f.accessibility ],
    [ 'Endpoint:'.blue,  endpointUrl(f).blue ]
  )

  return table.toString()
}

function versionsTable(versions) {
  // instantiate
  var table = new Table({
    head: ['Version', 'Tags', 'Date', ],
    colWidths: [15, 20, 40 ]
  })

  for (var v of versions) {
    table.push([ 
      v.version, 
      v.aliases.join(', '),
      `${moment(v.updated_at).format('YYYY-MM-DD h:mm:ssa')} (${moment(v.updated_at).fromNow()})`, 
    ])
  }

  return table.toString()
}

function endpointUrl(f) {
  return `https://funcmatic.io/dev/${f.username}/${f.name}`
}

module.exports = {
  userTable, 
  functionTable, 
  versionsTable,
  endpointUrl
}
