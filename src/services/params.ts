import type { z } from 'zod'
import type { Maybe } from '../error'
import { assert, maybe } from '../error'
import { Dependencies } from './dependencies'

export type ParamService = {
	get: <TSchema extends z.ZodType>(schema: TSchema) => Maybe<z.infer<TSchema>>
}

function createParamService(): ParamService {
	const service: ParamService = {
		get(schema) {
			const { searchParams } = new URL(window.location.href)

			const data = Object.fromEntries(searchParams.entries())

			const result = schema.safeParse(data)
			assert(result.success, 'Failed to parse params')

			return maybe(result.data)
		},
	}

	Dependencies.register('params', service)

	return service
}

export const Params = createParamService()
