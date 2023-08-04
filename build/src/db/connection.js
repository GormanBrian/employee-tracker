import { createConnection } from 'mysql2/promise';
export var Tables;
(function (Tables) {
    Tables["Department"] = "department";
    Tables["Role"] = "role";
    Tables["Employee"] = "employee";
})(Tables || (Tables = {}));
var ReduceLinesOptions;
(function (ReduceLinesOptions) {
    ReduceLinesOptions["Comma"] = ",";
    ReduceLinesOptions["NewLine"] = "\n";
})(ReduceLinesOptions || (ReduceLinesOptions = {}));
class TableData {
    static department = new TableData({
        name: Tables.Department,
        properties: ['name'],
        cols: [
            'id INT not null auto_increment primary key',
            'name VARCHAR(255) not null',
        ],
        seeds: [[['"Sales"'], ['"Engineering"'], ['"Finance"'], ['"Legal"']]],
    });
    static role = new TableData({
        name: Tables.Role,
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
    });
    static employee = new TableData({
        name: Tables.Employee,
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
    });
    static employeeTrackerTables = [
        TableData.department,
        TableData.role,
        TableData.employee,
    ];
    name;
    properties;
    cols;
    seeds;
    constructor({ name, properties, cols, seeds }) {
        this.name = name;
        this.properties = properties;
        this.cols = cols;
        this.seeds = seeds;
    }
}
export default class Connector {
    connection;
    constructor(connection) {
        this.connection = connection;
    }
    /* =============================== CONNECT =============================== */
    static connect = async () => createConnection({
        host: 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    })
        .then((connection) => connection
        .query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME};`)
        .then(async () => {
        console.info('Created database');
        return connection.query(`USE ${process.env.DB_NAME};`).then(() => {
            console.info('Using database');
            return connection;
        });
    }))
        .catch((err) => {
        console.error(err);
        throw err;
    });
    static newConnection = async () => {
        try {
            let connection = await Connector.connect();
            let connector = new Connector(connection);
            await connector.setupTables();
            console.info('Connection established');
            return connector;
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    };
    /* ============================= SETUP TABLES ============================ */
    async checktable(tableName) {
        try {
            let sql = `SHOW TABLES LIKE "${tableName}"`;
            return this.connection
                .query(sql)
                .then((value) => value[0].length > 0);
        }
        catch (err) {
            throw err;
        }
    }
    static reduceLinesOptions = [
        ReduceLinesOptions.Comma,
        ReduceLinesOptions.NewLine,
    ];
    static reduceLines = (lines, options = Connector.reduceLinesOptions) => lines.join(options.join());
    static reduceSeeds = (lines, options) => Connector.reduceLines(lines.map((l) => `(${l.join(', ')})`), options);
    dropTable = async (tableName) => this.connection.query(`DROP TABLE IF EXISTS ${tableName}`);
    createTable = async ({ name, cols }) => {
        await this.dropTable(name);
        this.connection.query(`CREATE TABLE ${name} (
  ${Connector.reduceLines(cols)}
  );`);
    };
    seedTable = async (table, seeds) => {
        seeds.forEach(async (round) => {
            await this.insertIntoTable(table, round);
        });
    };
    setupTable = async (table, drop = false, seed = true) => {
        const result = await this.checktable(table.name);
        console.info(`Does ${table.name} table exist: ${result}`);
        if (drop || !result) {
            console.info(`Creating ${table.name} table`);
            await this.createTable(table);
        }
        if (seed) {
            console.info(`Seeding ${table.name} table`);
            await this.seedTable(table, table.seeds);
        }
    };
    setupTables = async (tables = TableData.employeeTrackerTables, drop = false, seed = false) => {
        tables.forEach(async (table) => {
            await this.setupTable(table, drop, seed);
        });
    };
    /* ============================== SELECTORS ============================== */
    getAll = async (tableName, values, joins = []) => this.connection
        .query(`SELECT ${values.join(', ')} from ${tableName}${joins.length === 0 ? '' : '\n' + joins.join('\n')};`)
        .then((results) => results[0]);
    getAllReduced = async (property, tableName, values, joins = []) => this.getAll(tableName, values, joins).then((results) => results.map((r) => (property in r ? r[property] : null)));
    logAll = async (tableName, values, other) => this.getAll(tableName, values, other).then((results) => console.table(results));
    logAllDepartments = async () => this.logAll(Tables.Department, ['*']);
    logAllRoles = async () => this.logAll(Tables.Role, ['role.id', 'role.title', 'role.salary', 'department.name'], ['JOIN department on role.department_id = department.id']);
    getAllRoleNames = async () => this.getAllReduced('title', Tables.Role, ['role.title']);
    logAllEmployees = async () => this.logAll(Tables.Employee, [
        'employee.id',
        'employee.first_name',
        'employee.last_name',
        'role.title',
        'department.name',
        'role.salary',
        'concat(manager.first_name, " ", manager.last_name) as manager',
    ], [
        'JOIN role on employee.role_id = role.id',
        'JOIN department on role.department_id = department.id',
        'LEFT JOIN employee as manager on employee.manager_id = manager.id',
    ]);
    /* =============================== INSERTS =============================== */
    insertIntoTable = async (table, seedRound) => this.connection.query(`INSERT INTO ${table.name} (${table.properties.join(', ')})
VALUES ${Connector.reduceSeeds(seedRound)};`);
    addDepartment = async (name) => this.insertIntoTable(TableData.department, [[name]]);
    addRole = async (title, salary, departmentId) => this.insertIntoTable(TableData.role, [[title, salary, departmentId]]);
    addEmployee = async (firstName, lastName, roleId, managerId) => this.insertIntoTable(TableData.employee, [
        [firstName, lastName, roleId, managerId],
    ]);
}
//# sourceMappingURL=connection.js.map