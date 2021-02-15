const { Pool } = require('pg')

if (process.env.HEROKU) {
  connectInfo = {
    connectionString: process.env.DATABASE_URL
  }
} else {
  connectInfo = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
  }
}

const pool = new Pool(connectInfo)

module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback)
  },
}