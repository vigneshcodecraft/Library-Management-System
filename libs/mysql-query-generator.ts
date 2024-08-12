import {
  AndWhereExpression,
  ColumnData,
  NestedQuery,
  OrWhereExpression,
  PageOption,
  SimpleWhereExpression,
  WhereExpression,
  WhereParamValue,
} from './types';

export interface QueryResult {
  sql: string;
  values: ColumnData[];
}
const generateWhereClauseSql = <T>(
  whereParams: WhereExpression<T>
): QueryResult => {
  const values: ColumnData[] & ColumnData[][] = [];
  const processSimpleExp = (exp: SimpleWhereExpression<T>) => {
    const whereQuery = Object.entries(exp).map(([key, opts]) => {
      const columnName = `\`${key}\``;
      const paramValue: WhereParamValue<T> = opts as WhereParamValue<T>;
      let value: ColumnData | ColumnData[] | NestedQuery<T> = paramValue.value;
      let placeHolder: string = '';
      let operator = '';

      switch (paramValue.op) {
        case 'EQUALS':
          operator = paramValue.value === null ? ' IS ' : ' = ';
          break;
        case 'NOT_EQUALS':
          operator = paramValue.value === null ? ' IS NOT ' : ' != ';
          break;

        case 'STARTS_WITH':
          operator = ' LIKE ';
          value = `${value}%`;
          break;

        case 'NOT_STARTS_WITH':
          operator = ' NOT LIKE ';
          value = `${value}%`;
          break;

        case 'ENDS_WITH':
          operator = ' LIKE ';
          value = `%${value}`;
          break;

        case 'NOT_ENDS_WITH':
          operator = ' NOT LIKE ';
          value = `%${value}`;
          break;

        case 'CONTAINS':
          operator = ' LIKE ';
          value = `%${value}%`;
          break;

        case 'NOT_CONTAINS':
          operator = ' NOT LIKE ';
          value = `%${value}%`;
          break;

        case 'GREATER_THAN':
          operator = ' > ';
          break;

        case 'GREATER_THAN_EQUALS':
          operator = ' >= ';
          break;

        case 'LESSER_THAN':
          operator = ' < ';
          break;

        case 'LESSER_THAN_EQUALS':
          operator = ' <= ';
          break;

        case 'IN':
          operator = ' IN ';
          if (Array.isArray(value)) {
            placeHolder = `(${value.map((v) => '?').join(', ')})`;
            values.push(...value);
            return `${columnName} ${operator} ${placeHolder}`;
          } else if (typeof value === 'object' && value) {
            const subQuery = generateSelectSql(
              value.tableName,
              value.row,
              value.where,
              value.pagination
            );
            placeHolder = `(${subQuery.sql})`;
            values.push(...subQuery.values);
            return `${columnName} ${operator} ${placeHolder}`;
          }
          break;

        case 'NOT IN':
          operator = ' NOT IN ';
          if (Array.isArray(value)) {
            placeHolder = `(${value.map((v) => '?').join(', ')})`;
            values.push(...value);
            return `${columnName} ${operator} ${placeHolder}`;
          } else if (typeof value === 'object' && value) {
            const subQuery = generateSelectSql(
              value.tableName,
              value.row,
              value.where,
              value.pagination
            );
            placeHolder = `(${subQuery.sql})`;
            values.push(...subQuery.values);
            return `${columnName} ${operator} ${placeHolder}`;
          }
          break;
      }

      if (!Array.isArray(value) && typeof value !== 'object')
        values.push(value);

      return `${columnName} ${operator} ? `;
    });
    const sql = whereQuery.join(' AND ');

    return sql;
  };
  const whKeys = Object.keys(whereParams);

  if (whKeys.includes('AND')) {
    //it's an AndWhereExpression
    const andClause = (whereParams as AndWhereExpression<T>).AND.map((exp) => {
      const { sql, values: nestedValues } = generateWhereClauseSql(exp);
      values.push(...nestedValues);
      return sql;
    })
      .filter((c) => c)
      .join(' AND ');
    return { sql: andClause ? `(${andClause})` : '', values };
  } else if (whKeys.includes('OR')) {
    //it's an OrWhereExpression
    const orClause = (whereParams as OrWhereExpression<T>).OR.map((exp) => {
      const { sql, values: nestedValues } = generateWhereClauseSql(exp);
      values.push(...nestedValues);
      return sql;
    })
      .filter((c) => c)
      .join(' OR ');
    return { sql: orClause ? `(${orClause})` : '', values };
  } else {
    //it's a SimpleWhereExpression
    const simpleClause = processSimpleExp(
      whereParams as SimpleWhereExpression<T>
    );
    return { sql: simpleClause ? `(${simpleClause})` : '', values };
  }
};

const generateInsertSql = <T>(tableName: string, row: T): QueryResult => {
  const values: any[] = [];
  const columnNames = Object.entries(row as Object).reduce(
    (acc, [key, value]) => {
      acc.column.push(`\`${key}\``);
      values.push(value);
      acc.value.push(`?`);

      return acc;
    },
    { column: [] as Array<string>, value: [] as Array<string> }
  );

  let sql = `INSERT INTO \`${tableName}\` (${columnNames.column.join(
    ', '
  )}) VALUES (${columnNames.value.join(', ')})`;

  return { sql, values };
};

const generateUpdateSql = <T>(
  tableName: string,
  row: Partial<T>,
  where: WhereExpression<T>
): QueryResult => {
  const values: any[] = [];
  let sql = `UPDATE \`${tableName}\``;
  const updateColumn = Object.entries(row as Object)
    .map(([key, value]) => {
      values.push(value);
      return `${key} = ?`;
    })
    .join(', ');

  sql += ` SET ${updateColumn}`;
  const whereClause = generateWhereClauseSql(where);
  if (whereClause.sql) {
    sql += ` WHERE ${whereClause.sql} `;
  }
  return { sql, values: [...values, ...whereClause.values] };
};

const generateDeleteSql = <T>(
  tableName: string,
  where: WhereExpression<T>
): QueryResult => {
  let sql = `DELETE FROM \`${tableName}\``;

  const whereClause = generateWhereClauseSql(where);
  if (whereClause.sql) {
    sql += ` WHERE ${whereClause.sql} `;
  }
  return { sql, values: whereClause.values };
};

function sanitisifyingFields(rows: string[]) {
  return rows.map((row) => {
    let fieldWithBackticks = (row as string).startsWith('`')
      ? row
      : '`' + (row as string);
    fieldWithBackticks += (row as string).endsWith('`') ? '' : '`';
    return fieldWithBackticks;
  });
}

const generateSelectSql = <T>(
  tableName: string,
  column: (keyof T)[],
  where: WhereExpression<T>,
  pageOpts?: PageOption
): QueryResult => {
  const columnName =
    column.length > 0
      ? sanitisifyingFields(column as string[]).join(', ')
      : '*';
  let sql = `SELECT ${columnName} FROM \`${tableName}\``;

  const whereClause = generateWhereClauseSql(where);
  if (whereClause.sql) {
    sql += ` WHERE ${whereClause.sql}`;
  }

  const values = [...whereClause.values];
  if (pageOpts?.limit) {
    sql += ` LIMIT ?`;
    values.push(pageOpts.limit);
  }
  if (pageOpts?.offset) {
    sql += ` OFFSET ?`;
    values.push(pageOpts?.offset);
  }

  return { sql, values };
};

const generateCountSql = <T>(
  tableName: string,
  where: WhereExpression<T>
): QueryResult => {
  let sql = `SELECT COUNT(*) AS \'COUNT\' FROM ${tableName} `;
  const whereClause = generateWhereClauseSql(where);
  if (whereClause.sql) {
    sql += `WHERE ${whereClause.sql}`;
  }
  return { sql, values: whereClause.values };
};

export const MySqlQueryGenerator = {
  generateWhereClauseSql,
  generateInsertSql,
  generateUpdateSql,
  generateDeleteSql,
  generateSelectSql,
  generateCountSql,
};

export interface IMemberBase {
  firstName: string;
  lastName: string;
  dob: string;
  address: string;
  contactNo: string;
  email: string;
}
