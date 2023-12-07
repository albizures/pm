import { expect, it } from 'vitest'
import { html } from './html'

it('should test', async () => {
	const promise = Promise.resolve('text')

	expect(await html`<div></div>`).toBe(`<div></div>`)
	expect(await html`<div>${promise}</div>`).toBe(`<div>text</div>`)
})
