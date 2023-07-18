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

const getRoles = () => {
    let roles = [];
    db.query('SELECT title FROM roles', (err, data) => {
        if(err) console.error(err);
        else data.forEach(role => roles.push(role.title));
    });
    return roles;
}

const getManagers = () => {
    let managers = ['NULL'];
    db.query('SELECT CONCAT(first_name, " ", last_name) as manager FROM employees', (err, data) => {
        if(err) console.error(err);
        else return data.forEach(person => managers.push(person.manager));
    })
    return managers;
}

const getDepartments = () => {
    let departments = [];
    db.query('SELECT name FROM departments', (err, data) => {
        if(err) console.error(err);
        else return data.forEach(department => departments.push(department.name));
    })
    return departments;
}

const setRoleId = (role, callback) => {
    db.query(`SELECT id FROM roles WHERE title = '${role}'`, (err, data) => {
        if(err) console.error(err);
        else callback(err, data[0].id);
    })  
}

const setMangerId = (manager, callback) => {
    db.query(`SELECT role_id FROM employees WHERE CONCAT(first_name, " ", last_name) = '${manager}'`, (err, data) => {
        if(err) console.error(err);
        else callback(err, data[0].role_id);
    })  
}

const setDepartmentId = (deptName, callback) => {
    db.query(`SELECT id FROM departments WHERE name = '${deptName}'`, (err, data) => {;
    if(err) console.error(err)
    else callback(err, data[0].id);
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
        case 'View All Departments': 
            getAll('departments');
            break;

        case 'View All Roles':
           viewAllRoles('roles');
            break;
        
        case 'View All Employees':
            viewAllEmployees('employees');
            break;

        case 'Add Department':
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
        
        case 'Add Employee':
            prompt([
                {
                    name: 'first_name',
                    message: "What is the employee's first name?"
                },
                {
                    name: 'last_name',
                    message: "What is the employee's last name?"
                },
                {
                    type: 'list',
                    name: 'role',
                    message: "What is the employee's role?",
                    choices: getRoles()
                },
                {
                    type: 'list',
                    name: 'manager',
                    message: "Who is the employee's manager?",
                    choices: getManagers()
                }
            ]).then((answers) => {
                db.query(`INSERT INTO employees (first_name, last_name) VALUES ('${answers.first_name}', '${answers.last_name}')`);
                setRoleId(answers.role, function(err, data) {
                    if(err) console.error(err);
                    db.query(`UPDATE employees SET role_id = (${data}) WHERE first_name = '${answers.first_name}' AND last_name = '${answers.last_name}'`);
                });
                setMangerId(answers.manager, function(err, data) {
                    if(err) console.error(err);
                    db.query(`UPDATE employees SET manager_id = (${data}) WHERE first_name = '${answers.first_name}' AND last_name = '${answers.last_name}'`);
                });
                init();
            })
            break;

        case 'Add Role':
            prompt([
                {
                    name: 'newrole',
                    message: 'What is the name of the role?'
                },
                {
                    name: 'salary',
                    message: 'What is the salary of the role?'
                },
                {
                    type: 'list',
                    name: 'department',
                    message: 'Which department does it belong to?',
                    choices: getDepartments()
                }
            ]).then((answers) => {
                db.query(`INSERT INTO roles (title, salary) VALUES ('${answers.newrole}', ${answers.salary})`);
                setDepartmentId(answers.department, function(err, data) {
                    if(err) console.error(err);
                    db.query(`UPDATE roles SET department_id = (${data}) WHERE title = '${answers.newrole}'`);
                })
                init();
            })
            break;

        case 'Update Employee Role':
            db.query('SELECT CONCAT(first_name, " ", last_name) as employee FROM employees', (err, data) => {
                let employees = [];
                data.forEach((obj) => {
                    employees.push(obj.employee);
                })
                db.query('SELECT title FROM roles', (err, roledata) => {
                    let roles = [];
                    roledata.forEach((rolobj) => {
                        roles.push(rolobj.title);
                    })
                prompt([
                    {
                        type: 'list',
                        name: 'employee',
                        message: "Which employee's role do you want to update?",
                        choices: employees
                    },
                    {
                        type: 'list',
                        name: 'newrole',
                        message: "Which role do you want to assign the selected employee?",
                        choices: roles
                    }
                ])
                .then((answers) => {
                    setRoleId(answers.newrole, function(err, data) {
                        if(err) console.error(err);
                        db.query(`UPDATE employees SET role_id = (${data}) WHERE CONCAT(first_name, " ", last_name) = '${answers.employee}'`);
                    });
                    init();
                })
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
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
            'View All Employees',
            'Add Employee',
            'Update Employee Role',
            'View All Roles',
            'Add Role',
            'View All Departments',
            'Add Department',
            'Quit'
        ]
    }).then((data) => {
        handleAction(data.action);
    });
}

init();