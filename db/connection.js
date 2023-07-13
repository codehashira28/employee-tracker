const mysql = require('mysql2');

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    database: 'company_db',
},
    console.log('Connected')
);

module.exports = db;