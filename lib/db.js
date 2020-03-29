const path = require('path')
const { Database } = require('sqlite3').verbose()
const bcrypt = require('bcrypt')
const saltRounds = 5
const client = new Database(path.join(__dirname, '..', 'secrets.db'))

const queries = {
  tableUsers: `
    CREATE TABLE IF NOT EXISTS users (
      user TEXT PRIMARY KEY,
      pass TEXT NOT NULL
    );
  `,
  tableSecrets: `
      CREATE TABLE IF NOT EXISTS secrets (
        user TEXT,
        name TEXT NOT NULL,
        value TEXT NOT NULL,
        PRIMARY KEY (user, name),
        FOREIGN KEY (user)
          REFERENCES users (user)
            ON DELETE CASCADE
            ON UPDATE NO ACTION
      )
  `
}

function createDb () {
  return new Promise((resolve, reject) => {
    client.serialize(() => {
      client.run(queries.tableUsers)
      client.run(queries.tableSecrets, err => {
        if (err) return reject(err)
        resolve({
          client,
          createUser,
          listUsers,
          createSecret,
          listSecrets,
          getSecret,
          updateSecret,
          deleteSecret
        })
      })
    })
  })
}

async function createUser (user, pass) {
  const securePass = await bcrypt.hash(pass.toString(), saltRounds)
  return new Promise((resolve, reject) => {
    const stmt = client.prepare('INSERT INTO users VALUES (?, ?)')
    stmt.run(user, securePass)
    stmt.finalize(err => {
      if (err) return reject(err)
      resolve()
    })
  })
}

async function listUsers () {
  const users = []
  return new Promise((resolve, reject) => {
    client.each('SELECT user FROM users', (err, row) => {
      if (err) return reject(err)
      users.push(row)
    }, (err, count) => {
      if (err) return reject(err)
      resolve({ users, count })
    })
  })
}

function createSecret (user, secretName, value) {
  return new Promise((resolve, reject) => {
    const stmt = client.prepare('INSERT INTO secrets values(?, ? , ?)')
    stmt.run(user, secretName, value)
    stmt.finalize(err => {
      if (err) return reject(err)
      resolve()
    })
  })
}

function listSecrets (user) {
  return new Promise((resolve, reject) => {
    const stmt = client.prepare('SELECT name FROM secrets WHERE user = ?')
    stmt.all(user, (err, rows) => {
      if (err) return reject(err)
      resolve(rows)
    })
  })
}

function getSecret (user, name) {
  return new Promise((resolve, reject) => {
    const stmt = client.prepare('SELECT value, name FROM secrets WHERE user = ? and name = ?')
    stmt.get(user, name, (err, row) => {
      if (err) return reject(err)
      resolve(row)
    })
  })
}

function updateSecret (user, name, value) {
  return new Promise((resolve, reject) => {
    const stmt = client.prepare(`
      UPDATE secrets SET value = ?
      WHERE user = ? AND name = ?
    `)
    stmt.run(value, user, name)
    stmt.finalize(err => {
      if (err) return reject(err)
      resolve()
    })
  })
}

function deleteSecret (user, name) {
  return new Promise((resolve, reject) => {
    const stmt = client.prepare(`
      DELETE FROM secrets WHERE user = ? AND name = ?
    `)
    stmt.run(user, name)
    stmt.finalize(err => {
      if (err) return reject(err)
      resolve()
    })
  })
}
module.exports = {
  createDb
}
