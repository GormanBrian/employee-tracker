import inquirer from 'inquirer';
import { EmployeeTrackerDatabaseConnection } from './db/connection.js';
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
class CLI {
    db;
    roleNames;
    constructor(db, roleNames) {
        this.db = db;
        this.roleNames = roleNames;
    }
    static newCLI = async () => {
        try {
            let db = await EmployeeTrackerDatabaseConnection.newETConnection();
            let roleNames = await db.selectAllRoleNames();
            let cli = new CLI(db, roleNames);
            return cli;
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    };
    promptAddDepartment = async () => prompt([
        {
            message: 'What is the name of the department?',
            name: 'newDepartmentName',
            type: 'input',
        },
    ]).then(({ newDepartmentName }) => {
        this.db.insertDepartment(newDepartmentName);
    });
    promptAddRole = async () => prompt([
        {
            message: 'What is the name of the role?',
            name: 'newRoleName',
            type: 'input',
        },
        {
            message: 'What is the salary of the role?',
            name: 'newRoleSalary',
            type: 'input',
        },
        {
            message: 'Which department does the role belong to?',
            name: 'newRoleDepartment',
            type: 'list',
            choices: ['Accounting'],
        },
    ]).then((answers) => {
        console.info(answers);
    });
    promptAddEmployee = async () => prompt([
        {
            message: 'What is role of the new employee?',
            name: 'newEmployeeRole',
            type: 'list',
            choices: this.roleNames,
        },
    ]);
    run = async () => {
        this.roleNames = await this.db.selectAllRoleNames();
        await prompt([
            {
                message: 'What would you like to do?',
                name: 'root',
                type: 'list',
                choices: Object.values(RootChoices),
            },
        ]).then(async ({ root }) => {
            switch (root) {
                case RootChoices.ViewAllEmployees:
                    await this.db.logAllEmployees();
                    break;
                case RootChoices.AddEmployee:
                    break;
                case RootChoices.UpdateEmployeeRole:
                    break;
                case RootChoices.ViewAllRoles:
                    this.db.logAllRoles();
                    break;
                case RootChoices.AddRole:
                    await this.promptAddRole();
                    break;
                case RootChoices.ViewAllDepartments:
                    await this.db.logAllDepartments();
                    break;
                case RootChoices.AddDepartment:
                    await this.promptAddDepartment();
                    break;
                case RootChoices.Quit:
                    return;
                default:
                    console.error('Invalid choice');
                    break;
            }
            await this.run();
            return;
        });
    };
    start = async () => {
        await this.run();
        return;
    };
}
export default CLI;
//# sourceMappingURL=cli.js.map