import type { DirEntry } from '@tauri-apps/plugin-fs'
import type { Maybe } from '../../error'
import { z } from 'zod'
import { maybe, unwrap } from '../../error'
import { getTextFileContent, join } from '../../utils/files'

const packageJsonSchema = z.object({
	name: z.string(),
	description: z.string(),
})

const denoJsonSchema = z.object({
	name: z.string(),
	description: z.string(),
})

export function isNodeJsProject(files: Array<DirEntry>): boolean {
	const packageJson = files.find((file) => file.name.includes('package.json'))

	return Boolean(packageJson)
}

export function isDenoJsProject(files: Array<DirEntry>): boolean {
	const denoFile = files.find((file) => file.name.includes('deno.json'))

	return Boolean(denoFile)
}

export async function getNodeJsProjectName(path: string): Promise<Maybe<string>> {
	const packageJsonPath = await unwrap(join(path, 'package.json'))
	const packageJsonContent = await unwrap(getTextFileContent(packageJsonPath))

	const packageJson = packageJsonSchema.parse(JSON.parse(packageJsonContent))

	return maybe(packageJson.name)
}

export async function getDenoJsProjectName(path: string): Promise<Maybe<string>> {
	const denoJsonPath = await unwrap(join(path, 'deno.json'))
	const denoJsonContent = await unwrap(getTextFileContent(denoJsonPath))

	const denoJson = denoJsonSchema.parse(JSON.parse(denoJsonContent))

	return maybe(denoJson.name)
}
