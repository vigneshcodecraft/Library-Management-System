export type ColumnData = string | number | boolean | null;

export type StringOperator =
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'STARTS_WITH'
  | 'NOT_STARTS_WITH'
  | 'ENDS_WITH'
  | 'NOT_ENDS_WITH'
  | 'CONTAINS'
  | 'NOT_CONTAINS';

export type NumberOperator =
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'GREATER_THAN'
  | 'GREATER_THAN_EQUALS'
  | 'LESSER_THAN'
  | 'LESSER_THAN_EQUALS';

export type BooleanOperator = 'EQUALS' | 'NOT_EQUALS';

export type VectorOperator = 'IN' | 'NOT IN';

export interface NestedQuery<T> {
  tableName: string;
  row: (keyof T)[];
  where: WhereExpression<T>;
  pagination?: PageOption;
}

export type StringOperatorParam = {
  op: StringOperator;
  value: string | null;
};

export type NumberOperatorParam = {
  op: NumberOperator;
  value: number | null;
};

export type BooleanOperatorParam = {
  op: BooleanOperator;
  value: boolean | null;
};

export type VectorOperatorParam<T> = {
  op: VectorOperator;
  value: ColumnData[] | NestedQuery<T>;
};

export type WhereParamValue<T> =
  | StringOperatorParam
  | NumberOperatorParam
  | BooleanOperatorParam
  | VectorOperatorParam<T>;

// export type WhereClause<CompleteModel> = {
//     [key in keyof CompleteModel]: CompleteModel[key] extends string
//         ? StringOperatorParam
//         : CompleteModel[key] extends number
//         ? NumberOperatorParam
//         : BooleanOperatorParam;
// };

export type PageOption = {
  offset?: number;
  limit?: number;
};

export type WhereExpression<CompleteModel> =
  | SimpleWhereExpression<CompleteModel>
  | OrWhereExpression<CompleteModel>
  | AndWhereExpression<CompleteModel>;

export type SimpleWhereExpression<CompleteModel> = {
  [key in keyof Partial<CompleteModel>]: WhereParamValue<CompleteModel>;
};

export type OrWhereExpression<CompleteModel> = {
  OR: WhereExpression<CompleteModel>[];
};
export type AndWhereExpression<CompleteModel> = {
  AND: WhereExpression<CompleteModel>[];
};

export interface Trainee {
  name: string;
  email: string;
  dob: string;
  address: string;
}

export interface DBConfig {
  /** The complete url to the dbms along with protocol, port , user name and password  */
  DbURL: string;
}
