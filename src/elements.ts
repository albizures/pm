import type { HtmlChild, HtmlConfig } from '@vyke/elements'
import { createHtmlElement, createProxy } from '@vyke/elements'

export const {
	a,
	button,
	p,
	span,
	div,
	template,
	ul,
	li,
	h3,
} = createProxy<HtmlConfig, HtmlChild>(createHtmlElement)

export { Fragment } from '@vyke/elements'
export type { HtmlChild } from '@vyke/elements'
