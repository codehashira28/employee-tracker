const inquirer = require('inquirer');
const db = require('./db/connection');
require('console.table');

const prompt = inquirer.createPromptModule();

const getAll = (tableName) => {
    db.query('SELECT * FROM ??', tableName, (err, table) => {
        if(err) {
            console.error(err);
        } else {
            console.table(table);
            init();
        } 
    })
}

const viewAllEmployees = (tableName) => {
    db.query(`SELECT A.id, A.first_name, A.last_name, title, name AS department, salary, CONCAT(B.first_name, " ", B.last_name) as manager
    FROM employees A
    LEFT JOIN roles ON A.role_id = roles.id
    LEFT JOIN departments ON department_id = departments.id
    LEFT JOIN employees B ON A.manager_id = B.id
    `, tableName, (err, table) => {
        if(err) {
            console.error(err);
            process.exit();
        } else {
            console.table(table);
            init();
        }
    })

}

const viewAllRoles = (tableName) => {
    db.query(`SELECT roles.id, title, name AS department, salary
    FROM roles
    LEFT JOIN departments ON department_id = departments.id
    `, tableName, (err, table) => {
        if(err) {
            console.error(err);
        } else {
            console.table(table);
            init();
        }
    })
}

const handleAction = (choice) => {
    switch(choice) {
        case 'View all departments': 
            getAll('departments');
            break;

        case 'View all roles':
           viewAllRoles('roles');
            break;
        
        case 'View all employees':
            viewAllEmployees('employees');
            break;

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
            break;

        default: {
            process.exit();
        }
        
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
            'View all employees',
            'Quit'
        ]
    }).then((data) => {
        handleAction(data.action);
    });
}

init();

