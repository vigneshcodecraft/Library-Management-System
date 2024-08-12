import { beforeEach, describe, expect, test } from 'vitest';
import { IBook, IBookBase } from '../article-management/models/book.model';
import { MySqlQueryGenerator } from './mysql-query-generator';
import { Trainee, WhereExpression } from './types';

describe.skip('Test blocks for getting queries from the functions', () => {
  let tableName: string;
  beforeEach(() => {
    tableName = '`trainees`';
  });
  test('Tests for the insert SQL query', () => {
    const insertingValues = {
      name: 'Shravan',
      email: 'shravan@codecraft.co.in',
      dob: '04-05-2002',
      address: 'Kavoor, Mangalore',
    };
    const insertSQL = MySqlQueryGenerator.generateInsertSql(
      tableName,
      insertingValues
    );
    expect(insertSQL).toEqual(
      'INSERT INTO `trainees` (name, email, dob, address) VALUES ("Shravan", "shravan@codecraft.co.in", "04-05-2002", "Kavoor, Mangalore")'
    );
  });

  test('Tests for the where SQL query', () => {
    const conditionValues: WhereExpression<Trainee> = {
      OR: [
        {
          name: {
            op: 'EQUALS',
            value: 'Shravan',
          },
          address: {
            op: 'NOT_EQUALS',
            value: 'Mangalore',
          },
        },
        {
          email: {
            op: 'STARTS_WITH',
            value: 'shra',
          },
        },
      ],
    };
    expect(MySqlQueryGenerator.generateWhereClauseSql(conditionValues)).toEqual(
      '((`name`  =  "Shravan" AND `address`  !=  "Mangalore")OR(`email`  LIKE  "shra%"))'
    );
  });

  test('Tests for the select query', () => {
    let selectSql;
    selectSql = MySqlQueryGenerator.generateSelectSql(tableName, [], {});
    expect(selectSql).toEqual('SELECT * FROM `trainees`');

    selectSql = MySqlQueryGenerator.generateSelectSql(
      tableName,
      ['email', 'name'],
      {},
      { limit: 1 }
    );
    expect(selectSql).toEqual('SELECT email,name FROM `trainees` LIMIT 1');

    const whereCondition: WhereExpression<Trainee> = {
      OR: [
        {
          name: {
            op: 'EQUALS',
            value: 'Shravan',
          },
        },
        {
          address: {
            op: 'STARTS_WITH',
            value: 'Man',
          },
        },
      ],
    };
    selectSql = MySqlQueryGenerator.generateSelectSql(
      tableName,
      [],
      whereCondition,
      { limit: 1 }
    );
    expect(selectSql).toEqual(
      'SELECT * FROM `trainees` WHERE ((`name`  =  "Shravan")OR(`address`  LIKE  "Man%")) LIMIT 1'
    );
  });

  test('Tests for the delete query', () => {
    let deleteSql;
    deleteSql = MySqlQueryGenerator.generateDeleteSql(tableName, {});
    expect(deleteSql).toEqual('DELETE FROM `trainees`');

    const conditionValues: WhereExpression<Trainee> = {
      OR: [
        {
          AND: [
            {
              OR: [
                {
                  name: {
                    op: 'STARTS_WITH',
                    value: 'Krish',
                  },
                },
                {
                  email: {
                    op: 'EQUALS',
                    value: 'Dey',
                  },
                },
              ],
            },
            {
              address: {
                op: 'CONTAINS',
                value: 'West Bengal',
              },
              dob: {
                op: 'NOT_CONTAINS',
                value: '00',
              },
            },
          ],
        },
      ],
    };
    deleteSql = MySqlQueryGenerator.generateDeleteSql(
      tableName,
      conditionValues
    );
    expect(deleteSql).toEqual(
      'DELETE FROM `trainees` WHERE ((((`name`  LIKE  "Krish%")OR(`email`  =  "Dey"))AND(`address`  LIKE  "%West Bengal%" AND `dob`  NOT LIKE  "%00%")))'
    );
  });

  test('Tests for the count query', () => {
    const countSql = MySqlQueryGenerator.generateCountSql(tableName, {});
    expect(countSql).toEqual('SELECT COUNT(*) AS `count` FROM `trainees`');
  });

  test('Tests for the update query', () => {
    const setValues: Partial<Trainee> = {
      name: 'Shravan',
      email: 'shravan@codecraft.co.in',
    };
    const whereCondition: WhereExpression<Trainee> = {
      OR: [
        {
          name: {
            op: 'EQUALS',
            value: 'Shravan',
          },
        },
        {
          address: {
            op: 'STARTS_WITH',
            value: 'Man',
          },
        },
      ],
    };
    const updateSql = MySqlQueryGenerator.generateUpdateSql(
      tableName,
      setValues,
      whereCondition
    );
    expect(updateSql).toEqual(
      'UPDATE `trainees` SET name = "Shravan", email = "shravan@codecraft.co.in" WHERE ((`name`  =  "Shravan")OR(`address`  LIKE  "Man%"))'
    );
  });
});

describe.skip('Tests for books from sql query generator', () => {
  const { generateSelectSql, generateWhereClauseSql } = MySqlQueryGenerator;
  const authorClause: WhereExpression<IBookBase> = {
    author: {
      op: 'CONTAINS',
      value: 'Sudha Murthy',
    },
  };

  const authAndPublisher: WhereExpression<IBook> = {
    author: {
      op: 'CONTAINS',
      value: 'Sudha Murthy',
    },
    publisher: {
      op: 'EQUALS',
      value: 'Penguin UK',
    },
  };

  const authAndPublisherOrTotalCopies: WhereExpression<Partial<IBook>> = {
    OR: [
      {
        author: {
          op: 'CONTAINS',
          value: 'Sudha Murthy',
        },
        publisher: {
          op: 'EQUALS',
          value: 'Penguin UK',
        },
      },
      {
        totalCopies: {
          op: 'GREATER_THAN_EQUALS',
          value: 10,
        },
      },
    ],
  };

  const authOrTotalCopies: WhereExpression<IBook> = {
    OR: [
      {
        author: {
          op: 'CONTAINS',
          value: 'Sudha Murty',
        },
      },
      {
        totalCopies: {
          op: 'GREATER_THAN',
          value: 10,
        },
      },
    ],
  };
  test('Tests for where query from the books', () => {
    expect(MySqlQueryGenerator.generateWhereClauseSql(authorClause)).toEqual(
      '(`author`  LIKE  "%Sudha Murthy%")'
    );

    expect(
      MySqlQueryGenerator.generateWhereClauseSql(authAndPublisher)
    ).toEqual(
      '(`author`  LIKE  "%Sudha Murthy%" AND `publisher`  =  "Penguin UK")'
    );

    expect(
      MySqlQueryGenerator.generateWhereClauseSql(authAndPublisherOrTotalCopies)
    ).toEqual(
      '((`author`  LIKE  "%Sudha Murthy%" AND `publisher`  =  "Penguin UK")OR(`totalNumOfCopies`  >=  10))'
    );

    expect(
      MySqlQueryGenerator.generateWhereClauseSql(authOrTotalCopies)
    ).toEqual(
      '((`author`  LIKE  "%Sudha Murty%")OR(`totalNumOfCopies`  >  10))'
    );
  });

  test('Tests for SELECT query from the books', () => {
    // SELECT * FROM Books Where `author` LIKE '%Sudha Murty%'
    expect(generateSelectSql<IBook>(`Books`, [], authorClause)).toEqual(
      'SELECT * FROM Books WHERE (`author`  LIKE  "%Sudha Murthy%")'
    );

    //SELECT * FROM Books Where ((`author`  LIKE  "%Sudha Murthy%" AND `publisher`  =  "Penguin UK")OR(`totalNumOfCopies`  >=  10))
    expect(
      generateSelectSql<IBook>(
        'books',
        ['author', 'title', 'availableCopies'],
        authAndPublisherOrTotalCopies,
        {
          limit: 10,
        }
      )
    ).toEqual(
      'SELECT `author`,`title`,`availableNumOfCopies` FROM books WHERE ((`author`  LIKE  "%Sudha Murthy%" AND `publisher`  =  "Penguin UK")OR(`totalNumOfCopies`  >=  10)) LIMIT 10'
    );
  });
});

describe('Test block for the sql injection', () => {
  let tableName: string;
  beforeEach(() => {
    tableName = '`trainees`';
  });
  test('Tests for the insert query', () => {
    const insertingValues = {
      name: 'Shravan',
      email: 'shravan@codecraft.co.in',
      dob: '04-05-2002',
      address: 'Kavoor, Mangalore',
    };
    const insertSQL = MySqlQueryGenerator.generateInsertSql(
      tableName,
      insertingValues
    );
    console.log(insertSQL);
  });

  test('Tests for the where query', () => {
    const whereCondition: WhereExpression<Trainee> = {
      OR: [
        {
          name: {
            op: 'EQUALS',
            value: 'Shravan',
          },
        },
        {
          address: {
            op: 'STARTS_WITH',
            value: 'Man',
          },
        },
      ],
    };
    console.log(MySqlQueryGenerator.generateWhereClauseSql(whereCondition));
  });

  test('Tests for the select query', () => {
    let selectSql;
    const whereCondition: WhereExpression<Trainee> = {
      OR: [
        {
          name: {
            op: 'EQUALS',
            value: 1,
          },
        },
        {
          address: {
            op: 'STARTS_WITH',
            value: 'Man',
          },
        },
      ],
    };
    selectSql = MySqlQueryGenerator.generateSelectSql(
      tableName,
      [],
      whereCondition,
      { limit: 1 }
    );
    console.log(selectSql);
  });

  test('Tests for the delete query', () => {
    let deleteSql;
    deleteSql = MySqlQueryGenerator.generateDeleteSql(tableName, {});
    console.log(deleteSql);
    const conditionValues: WhereExpression<Trainee> = {
      OR: [
        {
          AND: [
            {
              OR: [
                {
                  name: {
                    op: 'STARTS_WITH',
                    value: 'Krish',
                  },
                },
                {
                  email: {
                    op: 'EQUALS',
                    value: 'Dey',
                  },
                },
              ],
            },
            {
              address: {
                op: 'CONTAINS',
                value: 'West Bengal',
              },
              dob: {
                op: 'NOT_CONTAINS',
                value: '00',
              },
            },
          ],
        },
      ],
    };
    deleteSql = MySqlQueryGenerator.generateDeleteSql(
      tableName,
      conditionValues
    );
    console.log(deleteSql);
  });

  test('Tests for the count query', () => {
    let countSql = MySqlQueryGenerator.generateCountSql(tableName, {});
    console.log(countSql);
    const whereCondition: WhereExpression<Trainee> = {
      OR: [
        {
          name: {
            op: 'EQUALS',
            value: 1,
          },
        },
        {
          address: {
            op: 'STARTS_WITH',
            value: 'Man',
          },
        },
      ],
    };
    countSql = MySqlQueryGenerator.generateCountSql(tableName, whereCondition);
    console.log(countSql);
  });

  test('Tests for the update query', () => {
    const setValues: Partial<Trainee> = {
      name: 'Shravan',
      email: 'shravan@codecraft.co.in',
    };
    const whereCondition: WhereExpression<Trainee> = {
      OR: [
        {
          name: {
            op: 'EQUALS',
            value: 'Shravan',
          },
        },
        {
          address: {
            op: 'STARTS_WITH',
            value: 'Man',
          },
        },
      ],
    };
    const updateSql = MySqlQueryGenerator.generateUpdateSql(
      tableName,
      setValues,
      whereCondition
    );
    console.log(updateSql);
  });

  test('Tests for the IN and NOT IN conditions', () => {
    const whereCondition: WhereExpression<Trainee> = {
      OR: [
        {
          name: {
            op: 'NOT IN',
            value: ['Shravan', 'Hegde', 1],
          },
        },
        {
          address: {
            op: 'STARTS_WITH',
            value: 'Man',
          },
        },
      ],
    };
    console.log(MySqlQueryGenerator.generateWhereClauseSql(whereCondition));
  });

  test('Tests for IN and NOT IN conditions for nested query', () => {
    const whereCondition: WhereExpression<Trainee> = {
      name: {
        op: 'IN',
        value: {
          tableName: 'trainee',
          row: [],
          where: {
            OR: [
              {
                name: {
                  op: 'NOT IN',
                  value: ['Shravan', 'Hegde', 1],
                },
              },
              {
                address: {
                  op: 'STARTS_WITH',
                  value: 'Man',
                },
              },
            ],
          },
        },
      },
    };
    console.log(MySqlQueryGenerator.generateWhereClauseSql(whereCondition));
  });
});
