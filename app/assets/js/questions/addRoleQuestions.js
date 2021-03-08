const tableObj = require("../../../index");

const addRoleQuestions = [{
        type: "input",
        message: "What is the name of the new employee role?",
        name: "title"
    },
    {
        type: "input",
        message: "How much is the salary of the new role?",
        name: "salary"
    }, {
        type: "list",
        message: "In which department is the new role?",
        name: "id",
        choices: tableObj.departments
    }
];

module.exports = addRoleQuestions;