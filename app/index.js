// DEPENDENCIES =========================================
// (i) packages -----------------------------------------
const inquirer = require('inquirer');
const mysql = require('mysql');

// (ii) Empty arrays that will be populated with the data from MySQL
let roleTableArr = [];
let departmentTableArr = [];
let employeeTableArr = [];

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
connection.connect((err) => {
    if (err) throw err;
    console.log("You are connected with ID: " + connection.threadId);
    welcomePrompt(welcomeQuestions)
})

// (iii) functions which populate the empty arrays with the data from my SQL and return the populated array
departmentTable = () => {
    connection.query(
        'SELECT * FROM department',
        (err, res) => {
            if (err) throw err;
            for (let i = 0; i < res.length; i++) {
                let deptData = { name: res[i].name, value: res[i].id };
                departmentTableArr.push(deptData)
            }
        }
    )
    return departmentTableArr;
}

roleTable = () => {
    connection.query(
        'SELECT * FROM role',
        (err, res) => {
            if (err) throw err;
            for (let i = 0; i < res.length; i++) {
                let roleData = { name: res[i].title, value: res[i].id };
                roleTableArr.push(roleData)
            }
        }
    )
    return roleTableArr;
}

employeeTable = () => {
    connection.query(
        'SELECT * FROM employee',
        (err, res) => {
            if (err) throw err;
            for (let i = 0; i < res.length; i++) {
                let empData = { name: `${res[i].first_name} ${res[i].last_name}`, value: res[i].id };
                employeeTableArr.push(empData)
            }
        }
    )
    return employeeTableArr;
}

// MAIN =========================================
// (i) Question arrays for the prompts to use
const welcomeQuestions = [{ type: "list", message: "Welcome to Employee Tracker. What would you like to do?", name: "welcomeChoices", choices: [{ name: "View all employees", value: "viewEmployees" }, { name: "View all departments", value: "viewDepartments" }, { name: "View all roles", value: "viewRoles" }, { name: "Add employee", value: "addEmployee" }, { name: "Add department", value: "addDepartment" }, { name: "Add role", value: "addRole" }, { name: "Update role", value: "updateRole" }, { name: "Quit", value: "quit" }] }];
const addDepartmentQuestions = { type: "input", message: "What is the name of the new department?", name: "name" };
const addEmployeeQuestions = [{ type: 'input', message: "What is the employee's first name?", name: "firstName", }, { type: "input", message: "What is the employee's last name?", name: "lastName", }, { type: "list", message: "What is the employee's title?", name: "title", choices: roleTable() }, { type: "list", message: "Who is the employee's manager?", name: "manager", choices: employeeTable() }];
const addRoleQuestions = [{ type: "input", message: "What is the name of the new employee role?", name: "title" }, { type: "input", message: "How much is the salary of the new role?", name: "salary" }, { type: "list", message: "In which department is the new role?", name: "id", choices: departmentTable() }];
const updateRoleQuestions = [{ type: "list", message: "For which employee would you like to update the role?", name: "empID", choices: employeeTable() }, { type: "list", message: "What is the employee's new role?", name: "titleID", choices: roleTable() }];

// (ii) Start-up prompt -----------------------------------------
const welcomePrompt = (welcomeQuestions) => {
    inquirer.prompt(welcomeQuestions).then((response) => {
        welcomeSwitchB(response.welcomeChoices)
    })
}

// (iii) The switchboard for the welcome prompt that will contain the various functions for the application -----------------------------------------
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
            addDepartment();
            break;
        case "addRole":
            addRole();
            break;
        case "updateRole":
            updateRole();
            break;
        case "quit":
            endConnection();
    }
}

// (iv) The functions for switchboard -----------------------------------------
const viewEmployees = () => {
    connection.query("SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id;", function(err, response) {
        console.table(response);
        welcomePrompt(welcomeQuestions);
    })
}

const viewDepartments = () => {
    console.log("view all departments")
    connection.query("SELECT * from department", (err, response) => {
        console.table(response);
        welcomePrompt(welcomeQuestions);
    })
}

const viewRoles = () => {
    connection.query("SELECT * from role", (err, response) => {
        console.table(response)
        welcomePrompt(welcomeQuestions);
    })
}

const addDepartment = () => {
    inquirer.prompt(addDepartmentQuestions)
        .then((response) => {
            connection.query("INSERT INTO department SET ?", { name: response.name },
                function(err, response) {
                    if (err) throw err;
                })
            welcomePrompt(welcomeQuestions)
        })
}

const addEmployee = () => {
    inquirer.prompt(addEmployeeQuestions)
        .then((response) => {
            connection.query("INSERT INTO employee SET ?", {
                first_name: response.firstName,
                last_name: response.lastName,
                role_id: response.title,
                manager_id: response.manager
            }, function(err, response) {
                if (err) throw err;
            })
            welcomePrompt(welcomeQuestions)
        })
}

const addRole = () => {
    inquirer.prompt(addRoleQuestions)
        .then((response) => {
            connection.query("INSERT INTO role SET ?", {
                title: response.title,
                salary: response.salary,
                department_id: response.id
            }, (err, response) => {
                if (err) throw err;
            });
            welcomePrompt(welcomeQuestions)
        })
}

const updateRole = () => {
    inquirer.prompt(updateRoleQuestions)
        .then((response) => {
            connection.query(`UPDATE employee SET role_id = ${response.titleID} WHERE id = ${response.empID}`,
                (err, response) => {
                    if (err) throw err;
                });
            welcomePrompt(welcomeQuestions);
        })
}

//  (vi) End connection -----------------------------------------
const endConnection = () => {
    console.log("Thank you for using Employee Tracker, your connection has now been terminated.");
    connection.end();
    process.exit();
}