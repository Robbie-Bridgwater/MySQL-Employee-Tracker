const welcomeQuestions = {
    type: "list",
    message: "Welcome to Employee Tracker. What would you like to do?",
    name: "welcomeChoices",
    choices: [{
            name: "View all employees",
            value: "viewEmployees"
        },
        {
            name: "View all departments",
            value: "viewDepartments"
        },
        {
            name: "View all roles",
            value: "viewRoles"
        },
        {
            name: "Add employee",
            value: "addEmployee"
        },
        {
            name: "Add department",
            value: "addDept"
        },
        {
            name: "Add role",
            value: "addRole"
        },
        {
            name: "Update role",
            value: "updateRole"
        },
        {
            name: "Quit",
            value: "quit"
        }
    ]
}

module.exports = welcomeQuestions;