/* eslint-disable no-console */
import type { LogData, Reporter } from './reporter'

export class Basic implements Reporter {
	log(data: LogData) {
		const { type, tag, args } = data

		if (type in console) {
			// @ts-expect-error type can't index console
			console[type](tag, ...args)
		}
		else {
			console.log(tag, ...args)
		}
	}
}
