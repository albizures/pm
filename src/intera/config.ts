import * as mitt from 'mitt'
import type { AttrEventName, Emitter, Events } from './attributes/attr'

export const prefix = 'it'

export function createEmitter(): Emitter {
	return mitt.default<Events>()
}
