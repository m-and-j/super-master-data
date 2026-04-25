export const DataClassification = {
  Scalar: 'scalar',
  ID: 'id',
  RelationID: 'relationId',
  Schema: 'schema',
  Enumeration: 'enum',
} as const
export type DataClassificationType = (typeof DataClassification)[keyof typeof DataClassification]
export const DataClassificationValues = Object.entries(DataClassification)

export const DataClassificationLabels = {
  [DataClassification.Scalar]: '値型',
  [DataClassification.ID]: 'ID',
  [DataClassification.RelationID]: 'ID参照',
  [DataClassification.Schema]: 'スキーマ',
  [DataClassification.Enumeration]: '列挙型',
} as const
export const DataClassificationLabelValues = Object.entries(DataClassificationLabels)

/**
 * データ型
 */
export const DataKind = {
  int: 'int',
  float: 'float',
  double: 'double',
  string: 'string',
  bool: 'bool',
  datetime: 'datetime',
  date: 'date',
  time: 'time',
} as const
export type DataKindType = (typeof DataKind)[keyof typeof DataKind]
export const DataKindValues = Object.entries(DataKind)

/**
 * カラムパラメータ
 */
export const ColumnParams = {
  Names: 'names',
  TypeClassifications: 'typeClassifications',
  TypeKinds: 'typeKinds',
  TypeArrayFlags: 'typeArrayFlags',
  TypeNullableFlags: 'typeNullableFlags',
  Values: 'values',
  Descriptions: 'descriptions',
} as const

/**
 * マウスボタンコード
 */
export const MouseButtonCode = {
  Left: 0,
  Middle: 1,
  Right: 2,
} as const
