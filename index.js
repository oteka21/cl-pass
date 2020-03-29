#!/Users/oteka21/.nvm/versions/node/v12.7.0/bin/node

const { createDb } = require('./lib/db')
const minimist = require('minimist')
const argv = minimist(process.argv.slice(2))

async function main () {
  const command = argv._.shift()
  const db = await createDb()
  switch (command) {
    case 'users:create':
      try {
        const { user, pass } = argv
        await db.createUser(user, pass)
        console.log(`${user} created!`)
      } catch (err) {
        throw new Error('Cannont create user!')
      }
      break
    case 'users:list':
      try {
        const result = await db.listUsers()
        result.users.forEach(u => {
          console.log(`- ${u.user}`)
        })
        console.log(`\tTotal ${result.count}`)
      } catch (err) {
        throw new Error('Cannont list users!')
      }
      break
    case 'secrets:create':
      try {
        const { user, name, value } = argv
        await db.createSecret(user, name, value)
        console.log(`Secret: ${name} created!`)
      } catch (err) {
        throw new Error('Cannont create secret!')
      }
      break
    case 'secrets:list':
      try {
        const { user } = argv
        const secrets = await db.listSecrets(user)
        secrets.forEach(s => {
          console.log(`- ${s.name}`)
        })
      } catch (err) {
        throw new Error('Cannont list secrets!')
      }
      break
    case 'secrets:get':
      try {
        const { user, name } = argv
        const result = await db.getSecret(user, name)
        if (!result) return console.log(`secret ${name} not found!`)
        console.log(`- ${result.name} = ${result.value}`)
      } catch (err) {
        throw new Error('Cannot get secret!')
      }
      break
    case 'secrets:update':
      try {
        const { user, name, value } = argv
        await db.updateSecret(user, name, value)
        console.log(`secret ${name} updated!`)
      } catch (err) {
        throw new Error('Cannot update secret!')
      }
      break
    case 'secrets:delete':
      try {
        const { user, name } = argv
        await db.deleteSecret(user, name)
        console.log(`Secret ${name} deleted!`)
      } catch (err) {
        throw new Error('Cannont delete secret!')
      }
      break
    default:
      console.error(`command not found ${command}`)
  }
}

main()
