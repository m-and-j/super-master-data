export const DataClassification = {
  Scalar: 'scalar',
  ID: 'id',
  Label: 'label',
  RelationID: 'relationId',
  Schema: 'schema',
  Enumeration: 'enum',
} as const
export type DataClassificationType = (typeof DataClassification)[keyof typeof DataClassification]
export const DataClassificationValues = Object.entries(DataClassification)

export const DataClassificationLabels = {
  [DataClassification.Scalar]: '値型',
  [DataClassification.ID]: 'ID',
  [DataClassification.Label]: 'ラベル',
  [DataClassification.RelationID]: 'ID参照',
  [DataClassification.Schema]: 'スキーマ',
  [DataClassification.Enumeration]: '列挙型',
} as const
export const DataClassificationLabelValues = Object.entries(DataClassificationLabels)

/**
 * データ型
 */
export const DataKind = {
  Int: 'int',
  Float: 'float',
  Double: 'double',
  String: 'string',
  Bool: 'bool',
  Datetime: 'datetime',
  Date: 'date',
  Time: 'time',
} as const
export type DataKindType = (typeof DataKind)[keyof typeof DataKind]
export const DataKindValues = Object.entries(DataKind)

/**
 * データ型(ID用)
 */
export const DataKindForId = {
  Int: 'int',
  String: 'string',
} as const
export type DataKindForIdType = (typeof DataKindForId)[keyof typeof DataKindForId]
export const DataKindForIdValues = Object.entries(DataKindForId)

/**
 * データ型(ラベル用)
 */
export const DataKindForLabel = {
  String: 'string',
} as const
export type DataKindForLabelType = (typeof DataKindForLabel)[keyof typeof DataKindForLabel]
export const DataKindForLabelValues = Object.entries(DataKindForLabel)

/**
 * データ型拡張
 */
export const DataKindExtension = {
  Empty: '',
  Array: 'array',
  Optional: 'optional',
} as const
export type DataKindExtensionType = (typeof DataKindExtension)[keyof typeof DataKindExtension]
export const DataKindExtensionValues = Object.entries(DataKindExtension)

export const DataKindExtensionLabels = {
  [DataKindExtension.Empty]: '-',
  [DataKindExtension.Array]: '配列',
  [DataKindExtension.Optional]: '未指定可',
} as const
export const DataKindExtensionLabelValues = Object.entries(DataKindExtensionLabels)

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

/**
 * プロジェクトフォルダ定義
 */
export const ProjectFolder = {
  Tables: 'tables',
} as const

/**
 * カラーテーマ定義
 */
export const Variants = ['primary', 'secondary', 'success', 'danger', 'warning'] as const
export type VariantType = (typeof Variants)[number]

export const InputVariants = [...Variants, 'link', 'clear'] as const
export type InputVariantType = (typeof InputVariants)[number]

/**
 * メッセージ領域のクラス名リスト
 */
export const VariantMessageAreaClassNames = Variants.map((variant) => `message-area-${variant}`)

/**
 * アイコンのクラス名
 */
export const VariantIconClassName = {
  primary: 'icon-[ic--round-info]',
  secondary: 'icon-[ic--round-info]',
  success: 'icon-[ic--baseline-check-circle-outline]',
  danger: 'icon-[ic--round-warning]',
  warning: 'icon-[ic--round-warning]',
}
export const VariantIconClassNames = Object.values(VariantIconClassName)

/**
 * サイズ定義
 */
export const Sizes = ['none', 'xs', 'sm', 'md', 'lg'] as const
export type SizeType = (typeof Sizes)[number]
