import inquirer, { Answers } from 'inquirer';
import { EmployeeTrackerDatabaseConnection } from './db/connection.js';

const { prompt } = inquirer;

enum RootChoices {
  ViewAllEmployees = 'View All Employees',
  AddEmployee = 'Add Employee',
  UpdateEmployeeRole = 'Update Employee Role',
  ViewAllRoles = 'View All Roles',
  AddRole = 'Add Role',
  ViewAllDepartments = 'View All Departments',
  AddDepartment = 'Add Department',
  Quit = 'Quit',
}

class CLI {
  db: EmployeeTrackerDatabaseConnection;
  roleNames: Array<string>;

  constructor(db: EmployeeTrackerDatabaseConnection, roleNames: Array<string>) {
    this.db = db;
    this.roleNames = roleNames;
  }

  static newCLI = async () => {
    try {
      let db = await EmployeeTrackerDatabaseConnection.newETConnection();
      let roleNames = await db.selectAllRoleNames();
      let cli = new CLI(db, roleNames);
      return cli;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  promptAddDepartment = async () =>
    prompt([
      {
        message: 'What is the name of the department?',
        name: 'newDepartmentName',
        type: 'input',
      },
    ]).then(({ newDepartmentName }: Answers) => {
      this.db.insertDepartment(newDepartmentName);
    });

  promptAddRole = async () =>
    prompt([
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
    ]).then((answers: Answers) => {
      console.info(answers);
    });

  promptAddEmployee = async () =>
    prompt([
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
    ]).then(async ({ root }: Answers) => {
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
