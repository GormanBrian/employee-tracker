import inquirer, { QuestionCollection, Answers } from 'inquirer';
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

const questions: QuestionCollection = [
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
    when: ({ root }: Answers) => root === RootChoices.AddDepartment,
  },
];

const newRoleQuestions: QuestionCollection = [
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

const start = () =>
  prompt(questions).then(async ({ root }: Answers) => {
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
        await prompt(newRoleQuestions).then((answers: Answers) => {
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

    if (root !== RootChoices.Quit) start();
  });

export default start;
