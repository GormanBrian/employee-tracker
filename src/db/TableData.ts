/* ============================ TYPE DEFINITIONS =========================== */

/**
 * Describes arrays of values to insert into a table
 */
export type InsertValues = Array<Array<string>>;

/**
 * Abstract properties of the {@linkcode TableData} class
 */
interface AbstractTableDataProps {
  name: string;
  seeds: Array<InsertValues>;
}

/**
 * Properties of the {@linkcode TableData} class
 */
export interface TableDataProps extends AbstractTableDataProps {
  properties: Array<TableProperty>;
}

/**
 * Optional properties of the {@linkcode TableData} class
 */
interface OptionalTableDataProps extends AbstractTableDataProps {
  properties: Array<OptionalTableProperty>;
}

/**
 * Properties of a table column
 */
type TableProperty = Required<OptionalTableProperty>;

/**
 * Optional properties of a table column
 */
interface OptionalTableProperty {
  name: string;
  type: string;
  nullable?: boolean;
  autoIncrement?: boolean;
  isPrimaryKey?: boolean;
}

/* ============================ TABLEDATA CLASS ============================ */

/**
 * @class Describes an SQL table's structure
 */
export class TableData {
  /**
   * Creates a {@linkcode TableData} instance
   *
   * @param optionalTableDataProps Table name, properties, and seeds
   * @returns New {@linkcode TableData}
   */
  static create = ({ name, properties, seeds }: OptionalTableDataProps) => {
    const newTableData = new TableData(name);
    newTableData.addColumns(properties);
    newTableData.addSeeds(seeds);
    return newTableData;
  };

  name: string;
  properties: Array<TableProperty>;
  seeds: Array<InsertValues>;

  /**
   * Constructs a {@linkcode TableData} instance using {@linkcode TableDataProps}
   * @constructor
   */
  constructor(
    name: string,
    properties: Array<TableProperty> = [],
    seeds: Array<InsertValues> = [],
  ) {
    this.name = name;
    this.properties = properties;
    this.seeds = seeds;
  }

  /* =============================== COLUMNS =============================== */

  /**
   * Add a table property to the table data
   * @param tableProperty {@linkcode TableProperty} values
   */
  addColumn = ({
    name,
    type,
    nullable = false,
    autoIncrement = false,
    isPrimaryKey = false,
  }: OptionalTableProperty) => {
    let index = this.properties.findIndex((property) => property.name === name);
    let newProperty: TableProperty = {
      name,
      type,
      nullable,
      autoIncrement,
      isPrimaryKey,
    };
    if (index === -1) this.properties.push(newProperty);
    else this.properties[index] = newProperty;
  };

  /**
   *
   * @param properties
   */
  addColumns = (properties: Array<OptionalTableProperty>) => {
    properties.map(this.addColumn);
  };

  /**
   * Get the SQL string with column properties
   */
  get columnsString() {
    return this.properties.map(this.createColumnString).join(',\n  ');
  }

  /**
   *
   * @param tableProperty
   * @returns
   */
  createColumnString({
    name,
    type,
    nullable,
    autoIncrement,
    isPrimaryKey,
  }: TableProperty) {
    return `${name} ${type}${nullable ? '' : ' NOT NULL'}${
      autoIncrement ? ' AUTO_INCREMENT' : ''
    }${isPrimaryKey ? ' primary key' : ''}`;
  }

  /* ================================ SEEDS ================================ */

  /**
   *
   * @param seed
   */
  addSeed = (seed: InsertValues) => {
    //
  };

  /**
   *
   * @param seeds
   */
  addSeeds = (seeds: Array<InsertValues>) => {
    //
  };

  // static department = new TableData({
  //   name: Tables.Department,
  //   properties: ['name'],
  //   cols: [
  //     'id INT not null auto_increment primary key',
  //     'name VARCHAR(255) not null',
  //   ],
  //   seeds: [[['"Sales"'], ['"Engineering"'], ['"Finance"'], ['"Legal"']]],
  // });

  // static role = new TableData({
  //   name: Tables.Role,
  //   properties: ['title', 'salary', 'department_id'],
  //   cols: [
  //     'id INT not null auto_increment primary key',
  //     'title VARCHAR(255) not null',
  //     'salary DECIMAL not null',
  //     'department_id INT',
  //     'FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE SET NULL',
  //   ],
  //   seeds: [
  //     [
  //       ['"Sales Lead"', '100000', '1'],
  //       ['"Salesperson"', '80000', '1'],
  //       ['"Lead Engineer"', '150000', '2'],
  //       ['"Software Engineer"', '120000', '2'],
  //       ['"Account Manager"', '160000', '3'],
  //       ['"Accountant"', '125000', '3'],
  //       ['"Legal Team Lead"', '250000', '4'],
  //       ['"Lawyer"', '190000', '4'],
  //     ],
  //   ],
  // });

  // static employee = new TableData({
  //   name: Tables.Employee,
  //   properties: ['first_name', 'last_name', 'role_id', 'manager_id'],
  //   cols: [
  //     'id INT not null auto_increment primary key',
  //     'first_name VARCHAR(255)',
  //     'last_name VARCHAR(255)',
  //     'role_id INT',
  //     'manager_id INT',
  //     'FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE SET NULL',
  //     'FOREIGN KEY (manager_id) REFERENCES employee(id) ON DELETE SET NULL',
  //   ],
  //   seeds: [
  //     [
  //       ['"John"', '"Doe"', '1', 'null'],
  //       ['"Ashley"', '"Rodriguez"', '3', 'null'],
  //       ['"Kunal"', '"Singh"', '5', 'null'],
  //       ['"Sarah"', '"Lourd"', '7', 'null'],
  //     ],
  //     [
  //       ['"Mike"', '"Chan"', '2', '1'],
  //       ['"Kevin"', '"Tupik"', '4', '2'],
  //       ['"Malia"', '"Brown"', '6', '3'],
  //       ['"Tom"', '"Allen"', '8', '4'],
  //     ],
  //   ],
  // });

  // static employeeTrackerTables = [
  //   TableData.department,
  //   TableData.role,
  //   TableData.employee,
  // ];
}
