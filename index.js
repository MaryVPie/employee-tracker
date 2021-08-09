// Imports the inquirer package and declares an array of licenses
const mysql = require("mysql2");
const consoleTable = require("console.table");
const inquirer = require("inquirer");
let actions = ["View All Employees", "Add Employee", "Update Employee Role", "View All Roles", "Add Role", "View All Departments", "Add Department", "Quit"];
// Connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'employee_tracker_db'
    },
    console.log(`Connected to the employee_tracker_db.`)
);


function invokeInquirer() {
    inquirer
        .prompt([
            {
                type: "list",
                message: "What would you like to do?",
                name: "Action",
                choices: actions
            }
        ])
        .then(answers => {
            //console.log(answers);
            console.log('\n\n');
            actionController(answers.Action);
        });
}

console.log('\x1b[35m`---------------------------------------------------`');
console.log('|                                                   |');
console.log('|    ____                 _                         |');
console.log('|   | ___|_ __ ___  _ __ | | ___  _   _  ___  ___   |');
console.log('|   | _| | \'_ ` _ \\\| \'_ \\\| \|/ _ \\| | | |/ _ \\/ _ \\  |');
console.log('|   | |__| | | | | | |_) | | ( ) | |_| |  __/  __/  |');
console.log('|   |____|_| |_| |_| .__/|_|\\___/\\___, |\\___|\\___|  |');
console.log('|    __  __        |_|            |___/             |');
console.log('|   |  \\/  | __ _ _ __   __ _  __ _  ___ _ __       |');
console.log('|   | |\\\/| |/ _` | \'_ \\ / _\' |/ _` |/ _ \\ `__|      |');
console.log('|   | |  | | (_| | | | | (_| | (_| |  __/  |        |');
console.log('|   |_|  |_|\\__,_|_| |_|\\__,_|\\__, |\\___|__|        |');
console.log('|                             |___/                 |');
console.log('|                                                   |');
console.log('|                                                   |');
console.log('\`---------------------------------------------------\`');

console.log('\n\n');
//calls function to capture user input
invokeInquirer();


// Takes action and calls necessary method based on it
function actionController(action) {
    switch (action) {
        case "View All Employees":
            GetAllEmployees(OutputToConsoleTable);
            invokeInquirer();
            break;
        case "Add Employee":
            AddEmployee();
            break;
        case "Update Employee Role":
            UpdateEmployeeRole();
            break;
        case "View All Roles":
            GetAllRoles(OutputToConsoleTable);
            invokeInquirer();
            break;
        case "Add Role":
            AddRole();
            break;
        case "View All Departments":
            GetAllDepartments(OutputToConsoleTable);
            invokeInquirer();
            break;
        case "Add Department":
            AddDepartment();
            break;
        case "Quit":
            db.end();
            return;
    }

}

function GetAllEmployees(callback) {
    // Query database

    db.query('SELECT employee.id, employee.first_name, employee.last_name, employee_role.title, departments.depname as Department, employee_role.salary as Salary, CONCAT(managers.first_name, \' \', managers.last_name)  as manager ' +
        'FROM employee ' +
        'LEFT JOIN employee managers ON employee.manager_id = managers.id ' +
        'INNER JOIN employee_role ON employee_role.id = employee.role_id ' +
        'INNER JOIN departments ON departments.id = employee_role.department_id ', callback);
}


function AddEmployee() {

    GetAllRoles((err, results) => {
        let roles = results;
        //console.log(roles);
        let roleChoices = results.map(it => it.Title);
        //console.log(roleChoices);
        GetAllEmployees((err, employeeResults) => {

            let managers = employeeResults;

            let managerChoices = managers.map(it => `${it.first_name} ${it.last_name}`);
            managerChoices.push("None");

            //console.log(managers);
            inquirer
                .prompt([
                    {
                        type: "input",
                        message: "What is the employee's first name?",
                        name: "firstName"
                    },
                    {
                        type: "input",
                        message: "What is the employee's last name?",
                        name: "lastName"
                    },
                    {
                        type: "list",
                        message: "What is the employee's role?",
                        name: "empRole",
                        choices: roleChoices
                    },
                    {
                        type: "list",
                        message: "Who is employee's manager?",
                        name: "empMan",
                        choices: managerChoices
                    },

                ])
                .then(answers => {
                    //console.log(answers);
                    let man = answers.empMan != 'None' ? managers.find(it => `${it.first_name} ${it.last_name}` == answers.empMan) : null;
                    let role = roles.find(it => it.Title == answers.empRole);
                    //console.log("role:", role);
                    //console.log("manager:", man);
                    const dbQueryText = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) ' +
                        `VALUES ('${answers.firstName}' , '${answers.lastName}',${role.Id}, ${man == null ? null : man.id});`
                    // console.log(dbQueryText);
                    db.query(dbQueryText,
                        (insertErr, insertResults) => {
                           // console.log(insertResults);
                            if (insertErr != null) {
                                console.log('Error happened:', insertErr);
                            } else {
                                console.log(`Added '${answers.firstName} ${answers.lastName}' to the database`);
                            }
                            console.log('\n\n');
                            invokeInquirer();
                        });

                });
        });

    });


}

function UpdateEmployeeRole() {
    GetAllEmployees((err, empRes) => {
        let chosenEmp = empRes.map(it => `${it.first_name} ${it.last_name}`);
        GetAllRoles((err, roles) => {
            let roleChoices = roles.map(it => it.Title);

            inquirer
                .prompt([
                    {
                        type: "list",
                        message: "Which employee's role do you want to update?",
                        name: "selectEmp",
                        choices: chosenEmp
                    },
                    {
                        type: "list",
                        message: "Which role do you want to assign the selected employee?",
                        name: "empRole",
                        choices: roleChoices
                    }

                ])
                .then(answers => {
                    //console.log(answers);
                  
                    let role = roles.find(it => it.Title == answers.empRole);

                    let employee = empRes.find(it => `${it.first_name} ${it.last_name}` == answers.selectEmp);

                    const dbQueryUpdated = 'UPDATE employee ' +
                        `SET role_id = ${role.Id} 
                        WHERE id = ${employee.id};`

                    db.query(dbQueryUpdated,
                        (insertErr, insertResults) => {
                            //console.log(insertResults);
                            if (insertErr != null) {
                                console.log('Error happened:', insertErr);
                            } else {
                                console.log(`Updated employee's role`);
                            }
                            console.log('\n\n');
                            invokeInquirer();
                        });

                });
        });

    });
}

function GetAllRoles(callback) {
    // Query database
    db.query('SELECT employee_role.id as Id, employee_role.title as Title, departments.depname as Department, employee_role.salary as Salary ' +
        'FROM employee_role ' +
        'JOIN departments ON employee_role.department_id = departments.id', callback);
}

function AddRole() {

    GetAllDepartments((err, results) => {

       // console.log(results);
        let deps = results.map(it => it.Department);
       // console.log(deps);
        inquirer
            .prompt([
                {
                    type: "input",
                    message: "What is the name of the role?",
                    name: "title"
                },
                {
                    type: "input",
                    message: "What is the salary of the role?",
                    name: "salary"
                },
                {
                    type: "list",
                    message: "Which department does the role belong to?",
                    name: "Department",
                    choices: deps
                },

            ])
            .then(answers => {
                //console.log(answers);
                let dep = results.find(x => x.Department == answers.Department);
                //console.log(dep);
                db.query('INSERT INTO employee_role (title, salary, department_id) ' +
                    `VALUES ('${answers.title}',${answers.salary},${dep.Id}); `,
                    function (err, results) {
                        //console.log(results);

                        if (err != null) {
                            console.log('Error happened:', err);

                        } else {
                            console.log(`Added '${answers.title}' to the database`);
                        }
                        console.log('\n\n');
                        invokeInquirer();
                    });

            });
    });

}

function GetAllDepartments(callback) {
    // Query database
    db.query('SELECT id as Id, depname as Department FROM departments', callback);
}

function OutputToConsoleTable(err, results) {
    console.log('\n\n');
    console.table(results);
    console.log('\n\n');
}

function AddDepartment() {

    inquirer
        .prompt([
            {
                type: "input",
                message: "What is the name of the department?",
                name: "depname"
            },

        ])
        .then(answers => {
            //console.log(answers);

            db.query('INSERT INTO departments (depname) ' +
                `VALUES ('${answers.depname}'); `, function (err, results) {
                   // console.log(results);
                    console.log(`Added '${answers.depname}' to the database`);
                    if (err != null) {
                        console.log('Error happened:', err);
                    }
                    console.log('\n\n');
                    invokeInquirer();
                });

        });
}

