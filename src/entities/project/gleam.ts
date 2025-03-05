import type { DirEntry } from '@tauri-apps/plugin-fs'
import type { Maybe } from '../../error'
import { maybe } from '../../error'

export function isGleamProject(files: Array<DirEntry>): boolean {
	const gleamFile = files.find((file) => file.name.includes('gleam.toml'))

	return Boolean(gleamFile)
}

export async function getGleamProjectName(path: string): Promise<Maybe<string | undefined>> {
	// todo: parse gleam.toml to get the project name
	return maybe(path.split('/').pop())
}
