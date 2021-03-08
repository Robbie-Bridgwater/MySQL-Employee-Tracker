// DEPENDENCIES =========================================
// (i) packages -----------------------------------------
const inquirer = require('inquirer');
const mysql = require('mysql');
const confirmed = require('confirmed');
// (ii) tables from MySQL
let roleTable;
let departmentTable;
let employeeTable;

// (ii) The Question Arrays for the various prompts -----------------------------------------
const welcomeQuestions = [{ type: "list", message: "Welcome to Employee Tracker. What would you like to do?", name: "welcomeChoices", choices: [{ name: "View all employees", value: "viewEmployees" }, { name: "View all departments", value: "viewDepartments" }, { name: "View all roles", value: "viewRoles" }, { name: "Add employee", value: "addEmployee" }, { name: "Add department", value: "addDept" }, { name: "Add role", value: "addRole" }, { name: "Update role", value: "updateRole" }, { name: "Quit", value: "quit" }] }];
const updateRoleQuestions = [{ type: "list", message: "For which employee would you like to update the role?", name: "empID", choices: employeeTable }, { type: "list", message: "What is the employee's new role?", name: "titleID", choices: roleTable }];
const addRoleQuestions = [{ type: "input", message: "What is the name of the new employee role?", name: "title" }, { type: "input", message: "How much is the salary of the new role?", name: "salary" }, { type: "list", message: "In which department is the new role?", name: "id", choices: departmentTable }];
const addEmployeeQuestions = [{ type: 'input', message: "What is the employee's first name?", name: "firstName", }, { type: "input", message: "What is the employee's last name?", name: "lastName", }, { type: "list", message: "What is the employee's title?", name: "title", choices: roleTable }, { type: "list", message: "Who is the employee's manager?", name: "manager", choices: employeeTable }];
const addDepartmentQuestions = [{ type: "input", message: "What is the name of the new department?", name: "name" }];


// CONNECTION =========================================
// (i) Create a connection to the database -----------------------------------------
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'employeesDB',
})

// (ii) initialise MySQL connection -----------------------------------------
// This connects to the MySQL database and populates the showRoles, showDepartments and showEmployees
// global variables with the corresponding tables from MySQL
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
// (i) Start-up prompt -----------------------------------------
const welcomePrompt = (welcomeQuestions) => {
    inquirer.prompt(welcomeQuestions).then((response) => {
        welcomeSwitchB(response.welcomeChoices)
    })
}

// (ii) The switchboard for the welcome prompt that will contain the various functions for the application -----------------------------------------
const welcomeSwitchB = (option) => {
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

// (iii) The functions for switchboard -----------------------------------------
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

//  (iv) End connection -----------------------------------------
const endConnection = () => {
    console.log("Thank you for using Employee Tracker, your connection has now been terminated.");
    connection.end();
    process.exit();
}