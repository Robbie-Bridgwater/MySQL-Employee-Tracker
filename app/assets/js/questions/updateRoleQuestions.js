const tableObj = require("../../../index");

const updateRoleQuestions = [{
        type: "list",
        message: "For which employee would you like to update the role?",
        name: "empID",
        choices: tableObj.employees
    },
    {
        type: "list",
        message: "What is the employee's new role?",
        name: "titleID",
        choices: tableObj.roles
    }
];

module.exports = updateRoleQuestions;