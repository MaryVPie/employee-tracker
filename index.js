// Imports the inquirer package and declares an array of actions
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

//select from limited actions
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

//gets all employees from the database, param callback is used to pass the callback function description to caller
function GetAllEmployees(callback) {
    // Query database
    db.query('SELECT employee.id, employee.first_name, employee.last_name, employee_role.title, departments.depname as Department, employee_role.salary as Salary, CONCAT(managers.first_name, \' \', managers.last_name)  as manager ' +
        'FROM employee ' +
        'LEFT JOIN employee managers ON employee.manager_id = managers.id ' +
        'INNER JOIN employee_role ON employee_role.id = employee.role_id ' +
        'INNER JOIN departments ON departments.id = employee_role.department_id ', callback);
}

//add an employees to the database
function AddEmployee() {
    //get all roles to use them for the next inquirer query and insert statement
    GetAllRoles((err, results) => {
        let roles = results;
        //console.log(roles);
        let roleChoices = results.map(it => it.Title);
        //console.log(roleChoices);
        //get all employees to use them for the next inquirer query and insert statement
        GetAllEmployees((err, employeeResults) => {

            let managers = employeeResults;
            //converts initial array of managers to array consisting of their first and last names
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
                    //choose a manager based on the answer if selected None -> null
                    let man = answers.empMan != 'None' ? managers.find(it => `${it.first_name} ${it.last_name}` == answers.empMan) : null;
                    let role = roles.find(it => it.Title == answers.empRole);
                    //console.log("role:", role);
                    //console.log("manager:", man);
                    //declaring text of the query which goes to the db
                    const dbQueryText = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) ' +
                        `VALUES ('${answers.firstName}' , '${answers.lastName}',${role.Id}, ${man == null ? null : man.id});`
                    // console.log(dbQueryText);
                    //function which executes db query
                    db.query(dbQueryText,
                        //call back when the query is done executing
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
    //get all employees to use them for the next inquirer query and insert statement
    GetAllEmployees((err, empRes) => {
        let chosenEmp = empRes.map(it => `${it.first_name} ${it.last_name}`);
        //get all roles to use them for the next inquirer query and insert statement
        GetAllRoles((err, roles) => {
            //converts initial array of roles to array consisting of the title
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
                  //choose a role based on the answer 
                    let role = roles.find(it => it.Title == answers.empRole);
                    let employee = empRes.find(it => `${it.first_name} ${it.last_name}` == answers.selectEmp);
                    //declaring text of the query which goes to the db
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
//gets all roles from the database, param callback is used to pass the callback function description to caller
function GetAllRoles(callback) {
    // Query database
    db.query('SELECT employee_role.id as Id, employee_role.title as Title, departments.depname as Department, employee_role.salary as Salary ' +
        'FROM employee_role ' +
        'JOIN departments ON employee_role.department_id = departments.id', callback);
}
//add a role to the database
function AddRole() {
    //get all departments to use them for the next inquirer query and insert statement
    GetAllDepartments((err, results) => {

       // console.log(results);
        //converts initial array of departments to array consisting of the department
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
                //declaring text of the query which goes to the db
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
//gets all departments from the database, param callback is used to pass the callback function description to caller
function GetAllDepartments(callback) {
    // Query database
    db.query('SELECT id as Id, depname as Department FROM departments', callback);
}

function OutputToConsoleTable(err, results) {
    console.log('\n\n');
    console.table(results);
    console.log('\n\n');
}
//add a department to the database
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

