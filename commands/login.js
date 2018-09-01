const inquirer = require('inquirer')
const colors = require('colors')
var Table = require('cli-table2')
const moment = require('moment')

const auth = require('../lib/auth')
const dotfolder = require('../lib/dotfolder')


const questions = [
  { type: 'input', name: 'username', message: 'Username:' },
  { type: 'password', name: 'password', message: 'Password:' }
]

async function login(program, command, options) {
  var answers = await inquirer.prompt(questions)
  var user = await auth.auth(answers.username, answers.password)

  dotfolder.write('user.json', user)

  var table = new Table()
  table.push(
    { 'Username:': user.decoded.preferred_username }, 
    { 'Email:': user.decoded.email },
    { 'Expires:': moment(user.decoded.exp * 1000).format('YYYY-MM-DD h:mm:ssa') }
  )

  console.log(table.toString())
  return user
}

async function whoami(program, command, options) {
  var user = dotfolder.read('user.json')
  if (!user || !user.decoded) {
    console.log("You are logged out.".red)
    return
  }
  var table = new Table()
  table.push(
    { 'Username:': user.decoded.preferred_username }, 
    { 'Email:': user.decoded.email },
    { 'Expires:': moment(user.decoded.exp * 1000).format('YYYY-MM-DD h:mm:ssa') }
  )
  
  console.log(table.toString())
  return user
}

async function token(program, command, options) {
  var user = dotfolder.read('user.json')
  console.log(user.token)
  return user
}

async function logout(program, command, options) {
  dotfolder.remove('user.json')
  console.log('Logged out successfully.')
}


module.exports = { 
  login,
  whoami,
  logout,
  token
}