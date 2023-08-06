import { createConnection, } from 'mysql2/promise';
import { Tables, TableData, } from './TableData.js';
/**
 * Options for separating SQL arguments or statements
 *
 * - {@linkcode ReduceStatementsOptions.Comma Comma} - `,`
 * - {@linkcode ReduceStatementsOptions.NewLine NewLine} - `\n`
 * - {@linkcode ReduceStatementsOptions.Semicolon Semicolon} - `;`
 */
var ReduceStatementsOptions;
(function (ReduceStatementsOptions) {
    ReduceStatementsOptions["Comma"] = ",";
    ReduceStatementsOptions["NewLine"] = "\n";
    ReduceStatementsOptions["Semicolon"] = ";";
})(ReduceStatementsOptions || (ReduceStatementsOptions = {}));
export default class DatabaseConnection {
    /* SQL host connection */
    connection;
    config;
    /**
     * Constructor for {@linkcode DatabaseConnection} class
     *
     * @constructor
     * @param connection Connection to the SQL host
     * @param config SQL host and database configuration variables
     */
    constructor(connection, config) {
        this.connection = connection;
        this.config = config;
    }
    /* =============================== CONNECT =============================== */
    /**
     * Connects to the SQL host
     *
     * @async
     * @static
     * @param config SQL host configuration variables
     * @returns {Promise<Connection>} Promise that resolves with a SQL connection
     * @throws Error if {@linkcode createConnection} or {@linkcode Connection.query query} fail
     */
    static connect = async ({ host, user, password, }) => createConnection({ host, user, password }).catch((err) => {
        console.error(err);
        throw err;
    });
    /**
     * Wrapper for {@linkcode initialize} method using instance connection
     */
    async initialize() {
        return DatabaseConnection.initialize(this.connection, this.config.database);
    }
    /**
     * Creates a database if it doesn't exist, sets the connection to use that database
     *
     * @param connection SQL host connection
     * @param database Name of the database
     */
    static initialize = async (connection, database) => {
        connection
            .query(`CREATE DATABASE IF NOT EXISTS ${database};`)
            .then(async () => {
            console.info('Created database');
            connection.query(`USE ${database};`).then(() => {
                console.info('Using database');
            });
        });
    };
    /**
     * {@linkcode SQLConfiguration} using {@linkcode process.env} variables
     */
    static EnvSQLConfiguration = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    };
    /**
     * Validates the properties of an {@linkcode SQLConfiguration} object are not falsy
     *
     * @static
     * @param config SQL host and database configuration variables
     * @returns SQL configuration with required values
     * @throws {TypeError} Error when {@linkcode SQLConfiguration} contains falsy values
     */
    static validateConfig = ({ host, user, password, database, }) => {
        if (host && user && password && database)
            return {
                host,
                user,
                password,
                database,
            };
        throw new TypeError('SQL configuration must contain the following properties:\nhost\nuser\npassword\ndatabase');
    };
    /**
     * Constructs a {@linkcode Database} instance
     *
     * @async
     * @static
     * @param config SQL host and database configuration variables
     * @returns Promise that resolves with a new Database
     * @throws Error if {@linkcode connect} or {@linkcode setupTables} fail
     */
    static newConnection = async (create, config = DatabaseConnection.EnvSQLConfiguration) => {
        try {
            const validConfig = DatabaseConnection.validateConfig(config);
            const connection = await DatabaseConnection.connect(validConfig);
            const connector = create(connection, validConfig);
            await connector.initialize();
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
    /**
     * Checks if a table exists in the current database
     *
     * @async
     * @param name Name of the table
     * @returns Promise that resolves with the status of the table
     * @throws Error if {@linkcode Connection.query query} fails
     */
    async checktable(name) {
        try {
            return this.connection
                .query(`SHOW TABLES LIKE "${name}";`)
                .then((value) => value[0].length > 0);
        }
        catch (err) {
            throw err;
        }
    }
    /**
     * Default options for reduceLines
     *
     * - {@linkcode ReduceStatementsOptions.Comma Comma}
     * - {@linkcode ReduceStatementsOptions.NewLine New Line}
     *
     * @static
     * @constant defaultReduceStatementsOptions
     */
    static defaultReduceStatementsOptions = [
        ReduceStatementsOptions.Comma,
        ReduceStatementsOptions.NewLine,
    ];
    /**
     * Reduces an array of SQL statements
     *
     * @param statements Statements to be reduced
     * @param options Join options for reduction
     * @returns SQL string with reduced statements
     */
    static reduceStatements = (statements, options = DatabaseConnection.defaultReduceStatementsOptions) => statements.join(options.join());
    /**
     * Reduces a 2D array of {@linkcode InsertValues} into a usable SQL string
     *
     * @example
     * ```js
     * DatabaseConnection.reduceInsertValues([["Ada", "Lovelace"], ["Alan", "Turing"]]);
     * ```
     * // Returns
     * ```schema
     * ("Ada", "Lovelace"),
     * ("Alan", "Turing")
     * ```
     *
     * @param insertValues 2D array of values
     * @returns SQL string of `INSERT` values
     */
    static reduceInsertValues = (values) => DatabaseConnection.reduceStatements(values.map((v) => `(${v.join(', ')})`), [ReduceStatementsOptions.Comma]);
    async dropTable(name) {
        return this.connection.query(`DROP TABLE IF EXISTS ${name};`);
    }
    async createTable({ name, cols }) {
        await this.dropTable(name);
        this.connection.query(`CREATE TABLE ${name} (
  ${DatabaseConnection.reduceStatements(cols)}
  );`);
    }
    async seedTable(table, seeds) {
        seeds.forEach(async (round) => {
            await this.insertIntoTable(table, round);
        });
        console.info(`Seeding ${table.name} table`);
    }
    async setupTable(table, drop = false, seed = true) {
        const result = await this.checktable(table.name);
        console.info(`Does ${table.name} table exist: ${result}`);
        if (drop || !result) {
            console.info(`Creating ${table.name} table`);
            await this.createTable(table);
        }
        if (seed)
            await this.seedTable(table, table.seeds);
    }
    async setupTables(tables = TableData.employeeTrackerTables, drop = false, seed = false) {
        tables.forEach(async (table) => {
            await this.setupTable(table, drop, seed);
        });
    }
    /* ============================== SELECTORS ============================== */
    /**
     * Selects and returns values from a table
     *
     * @param name Table name
     * @param cols Columns to be selected
     * @param joins Additional `JOIN` statements
     * @returns Table results
     */
    async selectFromTable(name, cols = '*', joins) {
        return this.connection
            .query(`SELECT ${typeof cols === 'string' ? cols : cols.join(', ')} from ${name}${joins ? '\n' + joins.join('\n') : ''};`)
            .then((results) => {
            console.log(results);
            return results[0];
        });
    }
    // static getArrayFromSelection = (property: string, results: RowDataPacket[]) =>
    //   results.map((r) => (property in r ? r[property] : null));
    /**
     * Selects and returns
     *
     * @param name Table name
     * @param property
     * @param joins
     * @returns
     */
    async selectArrayFromTableColumn(name, property, joins = []) {
        return this.selectFromTable(name, property, joins).then((results) => results.map((r) => (property in r ? r[property] : null)));
    }
    /* ============================ LOG SELECTORS ============================ */
    /**
     * Logs columns from a table
     *
     * @param name Table name
     * @param cols Columns to be logged
     * @param other
     * @returns
     */
    async logFromTable(name, cols, other) {
        return this.selectFromTable(name, cols, other).then((results) => console.table(results));
    }
    /* =============================== INSERTS =============================== */
    /**
     * Inserts rows of values into a `table`
     *
     * @param table Table to insert `values` into
     * @param values Values to be inserted
     * @returns Promise that resolves with successful insertion
     */
    async insertIntoTable(table, values) {
        return this.connection
            .query(`INSERT INTO ${table.name} (${table.properties.join(', ')})
VALUES ${DatabaseConnection.reduceInsertValues(values)};`)
            .then((result) => {
            console.info(typeof result);
        });
    }
}
/*


  =============================== Employee Tracker ===============================


*/
export class EmployeeTrackerDatabaseConnection extends DatabaseConnection {
    static newETConnection = async () => DatabaseConnection.newConnection((connection, config) => {
        return new EmployeeTrackerDatabaseConnection(connection, config);
    });
    /* ============================== SELECTORS ============================== */
    selectAllRoleNames = async () => this.selectArrayFromTableColumn('title', Tables.Role, ['role.title']);
    logAllDepartments = async () => this.logFromTable(Tables.Department, ['*']);
    logAllRoles = async () => this.logFromTable(Tables.Role, ['role.id', 'role.title', 'role.salary', 'department.name'], ['JOIN department on role.department_id = department.id']);
    logAllEmployees = async () => this.logFromTable(Tables.Employee, [
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
    insertDepartment = async (name) => this.insertIntoTable(TableData.department, [[name]]);
    insertRole = async (title, salary, departmentId) => this.insertIntoTable(TableData.role, [[title, salary, departmentId]]);
    insertEmployee = async (firstName, lastName, roleId, managerId) => this.insertIntoTable(TableData.employee, [
        [firstName, lastName, roleId, managerId],
    ]);
}
//# sourceMappingURL=connection.js.map