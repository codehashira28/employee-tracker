const inquirer = require('inquirer');
const db = require('./db/connection');
require('console.table');

const prompt = inquirer.createPromptModule();

const handleAction = (choice) => {
    switch(choice) {
        case 'View all departments': 
            db.query('SELECT * FROM departments', (err, table) => {
                if(err) {
                    console.error(err);
                } else {
                    console.table(table);
                }
            })
            break;

        case 'View all roles':
            db.query('SELECT * FROM roles', (err, table) => {
                if(err) {
                    console.error(err);
                } else {
                    console.table(table);
                }
            })
            break;
        
        case 'View all employees':
            db.query('SELECT * FROM employees', (err, table) => {
                if(err) {
                    console.error(err);
                } else {
                    console.table(table);
                }
            })

        case 'Add department':
            prompt({
                type: 'text',
                name: 'name',
                message: 'What is the name of the department?'
            }).then((answer) => {
                db.query(`INSERT INTO departments (name) VALUES ('${answer.name}')`, (err, res) => {
                    if(err) console.error(err);
                    else init();
                })
                
            })
    }
}

const init = () => {
    prompt({
        type: 'rawlist',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
            'View all departments',
            'Add department',
            'View all roles',
            'View all employees'
        ]
    }).then((data) => {
        handleAction(data.action);
    });
}

init();

