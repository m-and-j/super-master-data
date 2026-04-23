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
