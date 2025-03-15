import { z } from 'zod'
import { assert } from '../error'
import { rootSola } from '../logger'

const sola = rootSola.withTag('zod')

export const anyArraySchema = z.array(z.unknown())

type HandleError = (value: unknown, error: z.ZodError) => void

function defaultHandleError(value: unknown, error: z.ZodError) {
	sola.error('Failed to parse array', error)
}

type ParseArrayArgs<TSchema extends z.ZodTypeAny> = {
	data: unknown
	schema: TSchema
	handleItem: (item: z.infer<TSchema>) => void
	handleError?: HandleError
}
/**
 * @example
 * ```ts
 * const data = await DB.select('SELECT * FROM project_folders')
 * const projectFolders = parseArray({
 * 	data,
 * 	schema: projectFolderSchema,
 * 	handleItem(item) {
 * 		console.log(item)
 * 	},
 * 	handleError(value, error) {
 * 		console.error(value, error)
 * 	},
 * })
 * ```
 */
export function parseArray<TItem extends z.ZodTypeAny>(args: ParseArrayArgs<TItem>) {
	const { data, schema, handleItem, handleError = defaultHandleError } = args
	const arrayResult = anyArraySchema.safeParse(data)

	assert(arrayResult.success, 'Failed to parse array')

	for (const item of arrayResult.data) {
		const result = schema.safeParse(item)

		if (result.success) {
			handleItem(result.data)
		}
		else {
			handleError(item, result.error)
		}
	}
}

export const stringToJSONSchema = z.string()
	.transform((str, ctx): Record<string, unknown> => {
		try {
			return JSON.parse(str)
		}
		catch (_error) {
			ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
			return z.NEVER
		}
	})
