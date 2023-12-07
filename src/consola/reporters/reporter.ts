import type { LogType } from '../log'

export type LogData = {
	type: LogType
	tag: string
	args: Array<unknown>
}

export type Reporter = {
	log: (data: LogData) => void
}
