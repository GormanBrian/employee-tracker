import inquirer from 'inquirer';
const { prompt } = inquirer;
var RootChoices;
(function (RootChoices) {
    RootChoices["ViewAllEmployees"] = "View All Employees";
    RootChoices["AddEmployee"] = "Add Employee";
    RootChoices["UpdateEmployeeRole"] = "Update Employee Role";
    RootChoices["ViewAllRoles"] = "View All Roles";
    RootChoices["AddRole"] = "Add Role";
    RootChoices["ViewAllDepartments"] = "View All Departments";
    RootChoices["AddDepartment"] = "Add Department";
    RootChoices["Quit"] = "Quit";
})(RootChoices || (RootChoices = {}));
const questions = [
    {
        message: 'What would you like to do?',
        name: 'root',
        type: 'list',
        choices: Object.values(RootChoices),
    },
    {
        message: 'What is the name of the department?',
        name: 'newDepartmentName',
        type: 'input',
        when: ({ root }) => root === RootChoices.AddDepartment,
    },
];
const newRoleQuestions = [
    {
        message: 'What is the name of the role?',
        name: 'newRoleName',
        type: 'input',
    },
    {
        message: 'What is the name of the department?',
        name: 'newDepartmentName',
        type: 'input',
    },
];
const start = () => prompt(questions).then(async ({ root }) => {
    switch (root) {
        case RootChoices.ViewAllEmployees:
            break;
        case RootChoices.AddEmployee:
            break;
        case RootChoices.UpdateEmployeeRole:
            break;
        case RootChoices.ViewAllRoles:
            break;
        case RootChoices.AddRole:
            await prompt(newRoleQuestions).then((answers) => {
                console.log(answers);
            });
            break;
        case RootChoices.ViewAllDepartments:
            break;
        case RootChoices.AddDepartment:
            break;
        default:
            console.error('Invalid choice');
            break;
    }
    if (root !== RootChoices.Quit)
        start();
});
export default start;
//# sourceMappingURL=cli.js.map