const dbFile =
  process.env.NODE_ENV === 'integration' ? '/test.sqlite' : '/mydb.sqlite';

module.exports = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: __dirname + dbFile
  },
  useNullAsDefault: true, // Agrega esta línea
  pool: {
    afterCreate: (conn, cb) => {
      conn.run('PRAGMA foreign_keys = ON', cb);
    }
  },
  // debug: true,
  acquireConnectionTimeout: 10000
});
