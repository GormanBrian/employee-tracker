import { TableData } from './connection.js';

const departmentTableData: TableData = {
  name: 'department',
  properties: ['name'],
  cols: [
    'id INT not null auto_increment primary key',
    'name VARCHAR(255) not null',
  ],
  seeds: [[['"Sales"'], ['"Engineering"'], ['"Finance"'], ['"Legal"']]],
};

const roleTableData: TableData = {
  name: 'role',
  properties: ['title', 'salary', 'department_id'],
  cols: [
    'id INT not null auto_increment primary key',
    'title VARCHAR(255) not null',
    'salary DECIMAL not null',
    'department_id INT',
    'FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE SET NULL',
  ],
  seeds: [
    [
      ['"Sales Lead"', '100000', '1'],
      ['"Salesperson"', '80000', '1'],
      ['"Lead Engineer"', '150000', '2'],
      ['"Software Engineer"', '120000', '2'],
      ['"Account Manager"', '160000', '3'],
      ['"Accountant"', '125000', '3'],
      ['"Legal Team Lead"', '250000', '4'],
      ['"Lawyer"', '190000', '4'],
    ],
  ],
};

const employeeTableData: TableData = {
  name: 'employee',
  properties: ['first_name', 'last_name', 'role_id', 'manager_id'],
  cols: [
    'id INT not null auto_increment primary key',
    'first_name VARCHAR(255)',
    'last_name VARCHAR(255)',
    'role_id INT',
    'manager_id INT',
    'FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE SET NULL',
    'FOREIGN KEY (manager_id) REFERENCES employee(id) ON DELETE SET NULL',
  ],
  seeds: [
    [
      ['"John"', '"Doe"', '1', 'null'],
      ['"Ashley"', '"Rodriguez"', '3', 'null'],
      ['"Kunal"', '"Singh"', '5', 'null'],
      ['"Sarah"', '"Lourd"', '7', 'null'],
    ],
    [
      ['"Mike"', '"Chan"', '2', '1'],
      ['"Kevin"', '"Tupik"', '4', '2'],
      ['"Malia"', '"Brown"', '6', '3'],
      ['"Tom"', '"Allen"', '8', '4'],
    ],
  ],
};

const employeeTrackerTables = [
  departmentTableData,
  roleTableData,
  employeeTableData,
];
