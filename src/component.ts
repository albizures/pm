import type { JsonPrimitive } from 'type-fest'
import type { HtmlChild } from './elements'

type PropValue = JsonPrimitive | Promise<JsonPrimitive> | BaseProps | Array<BaseProps>
type BaseProps = { [Key in string]?: PropValue | HtmlChild }

export type Props<TProps extends BaseProps> = TProps

// eslint-disable-next-line ts/ban-types
export type NoProps = Props<{}>
export type AnyPrimitive = JsonPrimitive | undefined
export const noProps = {} as NoProps
