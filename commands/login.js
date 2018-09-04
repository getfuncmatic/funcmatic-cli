const inquirer = require('inquirer')
const colors = require('colors')
const moment = require('moment')

const auth = require('../lib/auth')
const dotfolder = require('../lib/dotfolder')
const formatter = require('../lib/formatter')

const questions = [
  { type: 'input', name: 'username', message: 'Email:' },
  { type: 'password', name: 'password', message: 'Password:', mask: '*' }
]

async function login() {
  var answers = await inquirer.prompt(questions)
  // how to reset to normal from italics?
  console.log('')
  var user = await auth.auth(answers.username, answers.password)
  dotfolder.write('user.json', user)

  console.log(formatter.userTable(user))
  return user
}

async function whoami(program, command, options) {
  var user = dotfolder.read('user.json')
  if (!user || !user.decoded) {
    console.log("You are logged out.".red)
    return
  }
  console.log(formatter.userTable(user))
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