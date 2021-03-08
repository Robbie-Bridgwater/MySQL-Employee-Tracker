const tableObj = require("../../../index");

const addEmployeeQuestions = [{
        type: 'input',
        message: "What is the employee's first name?",
        name: "firstName",
    },
    {
        type: "input",
        message: "What is the employee's last name?",
        name: "lastName",
    },
    {
        type: "list",
        message: "What is the employee's title?",
        name: "title",
        choices: tableObj.roles
    },
    {
        type: "list",
        message: "Who is the employee's manager?",
        name: "manager",
        choices: tableObj.employees
    }
];

module.exports = addEmployeeQuestions;