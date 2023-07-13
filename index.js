const inquirer = require('inquirer');
const db = require('./db/connection');
require('console.table');

const prompt = inquirer.createPromptModule();

prompt({
    type: 'rawlist',
    name: 'query',
    message: 'Select a query to run',
    choices: [
        'View all departments',
        'View all roles',
        'View all employees'
    ]
}).then((answer) => {
    if(answer.query === 'View all departments') {
        db.query('SELECT * FROM department', (err, results) => {
            if(err) {
                console.error(err);
            } else {
                console.table(results);
            }
        })
    }

    else if(answer.query === 'View all roles') {
        db.query('SELECT * FROM role', (err, results) => {
            if(err) {
                console.error(err);
            } else {
                console.table(results);
            }
        })
    } else {
        db.query('SELECT * FROM employee', (err, results) => {
            if(err) {
                console.error(err);
            } else {
                console.table(results);
            }
        })
    }
})