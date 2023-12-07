import { rootConsola } from '../../consola/consola'
import { Attr, type Emitter, setupAllAttrTypeFactory } from './attr'
import { setupTextBind } from './text'
import { setupClassNameBind } from './classname'
import { setupHtmlAppendBind, setupHtmlMountBind, setupHtmlSwapBind } from './html'
import { setupClick } from './click'

const consola = rootConsola.withTag('attributes')

type SetupFn = (element: ParentNode, emitter: Emitter) => void

const setupFns = {
	// binds
	[Attr.Text]: setupAllAttrTypeFactory(Attr.Text, setupTextBind),
	[Attr.ClassName]: setupAllAttrTypeFactory(Attr.ClassName, setupClassNameBind),
	[Attr.HtmlAppend]: setupAllAttrTypeFactory(Attr.HtmlAppend, setupHtmlAppendBind),
	[Attr.HtmlSwap]: setupAllAttrTypeFactory(Attr.HtmlSwap, setupHtmlSwapBind),
	[Attr.HtmlMount]: setupAllAttrTypeFactory(Attr.HtmlMount, setupHtmlMountBind),

	// interactions
	[Attr.Click]: setupAllAttrTypeFactory(Attr.Click, setupClick),
} as const satisfies Record<Attr, SetupFn>

const attrs = Object.keys(setupFns) as Array<keyof typeof setupFns>

export function setupAttrs(parent: ParentNode, emitter: Emitter) {
	for (const attr of attrs) {
		consola.debug('setting up', attr)
		setupFns[attr](parent, emitter)
	}
}
