import { Err, Ok, isErr, to } from '@vyke/results/result'
import type { FileEntry } from '@tauri-apps/api/fs'
import { join } from '@tauri-apps/api/path'
import { getFilesIn, getTextFileContent } from '../file/fileHelpers'
import type { ProjectType } from '../bindings'

export async function getProjectTypes(path: string) {
	const result = await getFilesIn(path)

	if (isErr(result)) {
		return Err(result.error, 'Failed to get project files')
	}

	const { value: entries } = result
	const types = new Set<ProjectType>()

	for (const entry of entries) {
		const { path } = entry
		path.includes('Cargo.toml') && types.add('Rust')
		path.includes('package.json') && types.add('Javascript')
		path.includes('pyproject.toml') && types.add('Python')
		path.includes('requirements.txt') && types.add('Python')
		path.includes('mix.exs') && types.add('Elixir')
		path.includes('mix.lock') && types.add('Elixir')
		path.includes('rebar.config') && types.add('Erlang')
		path.includes('rebar.lock') && types.add('Erlang')
		path.includes('gleam.toml') && types.add('Gleam')
		path.includes('gleam.lock') && types.add('Gleam')
		path.includes('.git') && types.add('Git')
	}

	return Ok(Array.from(types))
}

export async function getProjectName(path: string, types: Array<ProjectType>) {
	const result = await getFilesIn(path)

	if (isErr(result)) {
		return Err(result.error, 'Failed to get project files')
	}

	const { value: entries } = result

	const defaultName = path.split('/').pop()!
	for (const type of types) {
		if (type === 'Javascript' && hasPackageJson(entries)) {
			const packageJson = await readPackageJson(path)

			if (isErr(packageJson)) {
				return Err(packageJson.error, 'Failed to read package.json')
			}

			return Ok(packageJson.value.name ?? defaultName)
		}
	}

	return Err(defaultName)
}

function hasPackageJson(entries: Array<FileEntry>) {
	return entries.some(({ path }) => path.includes('package.json'))
}

// function hasCargoToml(entries: Array<FileEntry>) {
// 	return entries.some(({ path }) => path.includes('Cargo.toml'))
// }

export async function readPackageJson(path: string) {
	const filePathResult = await to(join(path, 'package.json'))

	if (isErr(filePathResult)) {
		return Err(filePathResult.error, 'Failed to join path')
	}

	const packageJson = await getTextFileContent(filePathResult.value)

	if (isErr(packageJson)) {
		return Err(packageJson.error, 'Failed to read package.json')
	}

	return Ok(JSON.parse(packageJson.value) as { name: string })
}
