// Imports the inquirer package and declares an array of licenses
const mysql = require("mysql2");
const consoleTable = require("console.table");
const inquirer = require("inquirer");
let actions = ["View All Employees", "Add Employee", "Update Employee Role", "View All Roles", "Add Role", "View All Departments", "Add Department", "Quit"];

// const PORT = process.env.PORT || 3001;
// const app = express();

// Connect to database
const db = mysql.createConnection(
    {
      host: 'localhost',
      // MySQL username,
      user: 'root',
      // MySQL password
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
    .then(answers=>{
        console.log(answers);
        console.log('\n\n');
        actionController(answers.Action);
    });
}

console.log('`---------------------------------------------------`');
console.log('|                                                   |');
console.log('|    ____                 _                         |');
console.log('|   | ___|_ __ ___  _ __ | | ___ _   _  ___  ___    |');
console.log();

invokeInquirer();
    
    
// Takes action and calls necessary method based on it.
function actionController(action) {
    switch (action) {
        case "View All Employees":
            GetAllEmployees();
        break;
        case "Add Employee":
            AddEmployee();
        break;
        case "Update Employee Role":
            UpdateEmployeeRole();
        break;
        case "View All Roles":
            GetAllRoles();
        break;
        case "Add Role":
            AddRole();
        break;
        case "View All Departments":
            GetAllDepartments();
        break;
        case "Add Department":
            AddDepartment();
        break;

        case "Quit":
            db.end();
            return;
        }
        invokeInquirer();
}

function GetAllEmployees() {
    // Query database

    db.query('SELECT employee.id, employee.first_name, employee.last_name, employee_role.title, departments.depname as Department, employee_role.salary as Salary, CONCAT(managers.first_name, \' \', managers.last_name)  as manager ' +
    'FROM employee ' +
    'LEFT JOIN employee managers ON employee.manager_id = managers.id ' + 
    'INNER JOIN employee_role ON employee_role.id = employee.role_id ' +
    'INNER JOIN departments ON departments.id = employee_role.department_id ', function (err, results) {
        console.log('\n\n');
        console.table(results);
        console.log('\n\n');
    });
}

function AddEmployee() {
    
}

function UpdateEmployeeRole() {
    
}

function GetAllRoles() {
    // Query database
    db.query('SELECT employee_role.id as Id, employee_role.title as Title, departments.depname as Department, employee_role.salary as Salary ' +
                'FROM employee_role ' +
                'JOIN departments ON employee_role.department_id = departments.id', function (err, results) {
        console.log('\n\n');
        console.table(results);
        console.log('\n\n');
    });
}

function AddRole() {
    
}

function GetAllDepartments() {
    // Query database
    db.query('SELECT id as Id, depname as Department FROM departments', function (err, results) {
        console.log('\n\n');
        console.table(results);
        console.log('\n\n');
    });
}

function AddDepartment() {
    
}

