// NB/ IMPORTANT*** This app uses circular dependencies. The index.js file populates three variables (roleTable, departmentTable, employeeTable) with
// tables from the MySQL employeeDB database. It then exports these variables to the question files found at "./assets/js/questions/" through the object "tableObj" 
// (found at the bottom of this file). This file then uses those questions again creating a circular dependency.
// When redeveloping this app, if you would like to ammend this data pairing, you would need to move the question prompts into index.js.
// However, for the purpose of this homework, I believe this presents the code in a more concise and understandable way.

// DEPENDENCIES =========================================
// (i) packages -----------------------------------------
const inquirer = require('inquirer');
const mysql = require('mysql');
const confirmed = require('confirmed');

// (ii) question arrays -----------------------------------------
const welcomeQuestions = require('./assets/js/questions/welcomeQuestions');
const addDepartmentQuestions = require('./assets/js/questions/addDepartmentQuestions');
const addEmployeeQuestions = require('./assets/js/questions/addEmployeeQuestions');
const addRoleQuestions = require('./assets/js/questions/addRoleQuestions');
const updateRoleQuestions = require('./assets/js/questions/updateRoleQuestions');

// CONNECTION =========================================
// (i) initialise global variables so I can use and export the tables from MySQL -----------------------------------------
let roleTable;
let departmentTable;
let employeeTable;

// (ii) create connection to database -----------------------------------------
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'employeesDB',
})

// (iii) initialise MySQL connection -----------------------------------------
// This also populates the showRoles/showDepartments/showEmployees global variables with the tables from MySQL
connection.connect((err) => {

    if (err) throw err;

    console.log("connected as ID " + connection.threadId);

    connection.query("SELECT * from role", (err, res) => {
        roleTable = res.map(role => ({ name: role.title, value: role.id }))
    })
    connection.query("SELECT * from department", (err, res) => {
        departmentTable = res.map(department => ({ name: department.name, value: department.id }))
    })
    connection.query("SELECT * from employee", (err, res) => {
        employeeTable = res.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }))
    })

    welcomePrompt(welcomeQuestions)
})

// MAIN =========================================
// (i) welcome prompt -----------------------------------------
const welcomePrompt = (welcomeQuestions) => {
    inquirer.prompt(welcomeQuestions).then((response) => {
        choiceSwitchB(response.welcomeChoices)
    })
}

// (ii) switchboard for welcome prompt -----------------------------------------
const choiceSwitchB = (option) => {
    switch (option) {
        case "viewEmployees":
            viewEmployees();
            break;
        case "viewDepartments":
            viewDepartments();
            break;
        case "viewRoles":
            viewRoles();
            break;
        case "addEmployee":
            addEmployee();
            break;
        case "addDepartment":
            addDepartmentPrompt();
            break;
        case "addRole":
            addRolePrompt();
            break;
        case "updateRole":
            updateRolePrompt();
            break;
        case "quit":
            endConnection();
    }
}

// (iii) functions for switchboard -----------------------------------------
function viewEmployees() {
    connection.query("SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id;", function(error, response) {
        console.table(response);
        finishOrStartAgain();
    })
}

const viewDepartments = () => {
    console.log("view all departments")
    connection.query("SELECT * from department", (err, response) => {
        console.table(response);
    })
}

const viewRoles = () => {
    connection.query("SELECT * from role", (err, response) => {
        console.table(response);
    })
}

const addEmployee = () => {
    inquirer.prompt(addEmployeeQuestions)
        .then((response) => {
            addEmployees(response)
        })
}

const addDepartmentPrompt = () => {
    inquirer
        .prompt(addDepartmentQuestions)
        .then((response) => {
            addDepartment(response);
        })
}

const addDepartment = (data) => {
    connection.query("INSERT INTO department SET ?", { name: data.name },
        function(err, res) {
            if (err) throw err;
        });
}

const addRolePrompt = () => {
    inquirer.prompt(addRoleQuestions)
        .then((response) => {
            addRole(response)
        })
}

const addRole = (data) => {
    connection.query("INSERT INTO role SET ?", {
        title: data.title,
        salary: data.salary,
        department_id: data.id
    }, (err, res) => {
        if (err) throw err;
    });
    finishOrStartAgain();
}

const updateRolePrompt = () => {
    inquirer.prompt(updateRoleQuestions)
        .then((response) => {
            updateRole(response)
        })
}

const updateRole = (data) => {
    connection.query(`UPDATE employee SET role_id = ${data.titleID} WHERE id = ${data.empID}`,
        (err, res) => {
            if (err) throw err;
        });
    finishOrStartAgain();
}

const finishOrStartAgain = () => {
    confirm("Would you like to continue?")
        .then(function confirmed() {
            welcomePrompt();
        }, function cancelled() {
            endConnection();
        });
}

//  (iv) end connection -----------------------------------------
const endConnection = () => {
    console.log("Thank you for using Employee Tracker, your connection has now been terminated.");
    connection.end();
    process.exit();
}


// EXPORTS =========================================
// (i) an Object populated with the table variables made earlier so that the files in "./assets/js/questions/" can use them.
const tableObj = {
    roles: roleTable,
    departments: departmentTable,
    employees: employeeTable
}

module.exports = tableObj;